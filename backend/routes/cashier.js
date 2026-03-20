const router = require('express').Router();
const { Op } = require('sequelize');
const { Order, OrderItem, Product, Payment, ClientSession } = require('../models');
const auth = require('../middleware/auth');
const role = require('../middleware/role');
const { success, error, paginate } = require('../utils/response');
const logActivity = require('../utils/logActivity');

router.use(auth);
router.use(role('caissier', 'superadmin'));

// ── Get Orders ──
router.get('/orders', async (req, res) => {
    try {
        const { status, search } = req.query;
        const where = {};
        if (status) {
            where.status = status;
        } else {
            where.status = ['validated', 'confirmed', 'paid'];
        }

        const orders = await Order.findAll({
            where,
            include: [
                { model: OrderItem, as: 'items', include: [Product] },
                { model: ClientSession },
                { model: Payment },
            ],
            order: [['created_at', 'DESC']],
        });

        // Apply search filter in-memory (order_number or table_name)
        let filtered = orders;
        if (search) {
            const q = search.toLowerCase();
            filtered = orders.filter(o =>
                o.order_number?.toLowerCase().includes(q) ||
                o.ClientSession?.table_name?.toLowerCase().includes(q)
            );
        }

        return success(res, { orders: filtered });
    } catch (err) {
        console.error('Cashier orders error:', err);
        return error(res, 'Erreur lors du chargement');
    }
});

// ── Cashier Daily Stats ──
router.get('/stats', async (req, res) => {
    try {
        const todayStr = new Date().toISOString().slice(0, 10);
        const todayStart = new Date(todayStr + 'T00:00:00.000Z');
        const todayEnd = new Date(todayStr + 'T23:59:59.999Z');

        const todayPayments = await Payment.findAll({
            where: {
                status: 'paid',
                created_at: { [Op.between]: [todayStart, todayEnd] },
            },
        });

        const totalToday = todayPayments.reduce((s, p) => s + parseFloat(p.amount || 0), 0);
        const byMethod = { cash: 0, mobile_money: 0, card: 0 };
        todayPayments.forEach(p => {
            if (byMethod[p.method] !== undefined) byMethod[p.method] += parseFloat(p.amount || 0);
        });

        return success(res, {
            totalToday,
            countToday: todayPayments.length,
            byMethod,
        });
    } catch (err) {
        console.error('Cashier stats error:', err);
        return error(res, 'Erreur stats');
    }
});

// ── Process Payment ──
router.post('/payments', async (req, res) => {
    try {
        const { order_id, method, reference } = req.body;

        if (!order_id || !method) {
            return error(res, 'Commande et mode de paiement requis', 400);
        }

        const order = await Order.findByPk(order_id, {
            include: [
                { model: OrderItem, as: 'items', include: [Product] },
                { model: ClientSession },
            ],
        });

        if (!order) return error(res, 'Commande non trouvée', 404);
        if (order.status === 'paid') return error(res, 'Commande déjà payée', 400);
        if (!['confirmed', 'validated'].includes(order.status)) {
            return error(res, 'Cette commande ne peut pas encore être payée', 400);
        }

        // Create payment
        const payment = await Payment.create({
            order_id: order.id,
            caissier_id: req.user.id,
            amount: order.total,
            method,
            status: 'paid',
            reference: reference || null,
        });

        // Update order status
        order.status = 'paid';
        await order.save();

        const io = req.app.get('io');
        io.emit('order-paid', { orderId: order.id, orderNumber: order.order_number });

        await logActivity(req.userId, 'PAYMENT', `Paiement de ${order.total} pour ${order.order_number}`, req.ip);

        return success(res, {
            payment,
            order: await Order.findByPk(order.id, {
                include: [
                    { model: OrderItem, as: 'items', include: [Product] },
                    { model: Payment },
                    { model: ClientSession },
                ],
            }),
        }, 'Paiement enregistré');
    } catch (err) {
        console.error('Payment error:', err);
        return error(res, 'Erreur lors du paiement');
    }
});

// ── Caissier Billing (own processed payments + orders) ──
router.get('/billing', async (req, res) => {
    try {
        const { page = 1, limit = 20, search = '', date_from = '', date_to = '', status } = req.query;

        const where = {};
        if (status) {
            where.status = status;
        } else {
            where.status = ['validated', 'paid'];
        }

        // Date range
        if (date_from || date_to) {
            where.created_at = {};
            if (date_from) where.created_at[Op.gte] = new Date(date_from);
            if (date_to) {
                const end = new Date(date_to);
                end.setHours(23, 59, 59, 999);
                where.created_at[Op.lte] = end;
            }
        }

        const allOrders = await Order.findAll({
            where,
            include: [
                { model: OrderItem, as: 'items', include: [Product] },
                { model: ClientSession },
                { model: Payment },
            ],
            order: [['created_at', 'DESC']],
        });

        // Search filter
        let filtered = allOrders;
        if (search) {
            const q = search.toLowerCase();
            filtered = allOrders.filter(o =>
                o.order_number?.toLowerCase().includes(q) ||
                o.ClientSession?.table_name?.toLowerCase().includes(q)
            );
        }

        const total = filtered.length;
        const pageInt = parseInt(page);
        const limitInt = parseInt(limit);
        const totalPages = Math.ceil(total / limitInt);
        const offset = (pageInt - 1) * limitInt;
        const paginated = filtered.slice(offset, offset + limitInt);

        return paginate(res, paginated, total, pageInt, limitInt);
    } catch (err) {
        console.error('Cashier billing error:', err);
        return error(res, 'Erreur de chargement');
    }
});

// ── Get Order Ticket ──
router.get('/tickets/:id', async (req, res) => {
    try {
        const order = await Order.findByPk(req.params.id, {
            include: [
                { model: OrderItem, as: 'items', include: [Product] },
                { model: Payment },
                { model: ClientSession },
            ],
        });

        if (!order) return error(res, 'Commande non trouvée', 404);

        const ticket = {
            order_number: order.order_number,
            table: order.ClientSession?.table_name || 'N/A',
            date: order.created_at,
            items: order.items.map(item => ({
                product: item.Product.name,
                quantity: item.quantity,
                price: item.unit_price,
                subtotal: item.subtotal,
            })),
            total: order.total,
            consignation: order.consignation_total,
            is_takeaway: order.is_takeaway,
            payment_status: order.Payment?.status || 'unpaid',
            payment_method: order.Payment?.method || null,
        };

        return success(res, { ticket });
    } catch (err) {
        console.error('Ticket error:', err);
        return error(res, 'Erreur lors du chargement du ticket');
    }
});

module.exports = router;
