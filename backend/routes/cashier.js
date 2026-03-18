const router = require('express').Router();
const { Order, OrderItem, Product, Payment, ClientSession } = require('../models');
const auth = require('../middleware/auth');
const role = require('../middleware/role');
const { success, error } = require('../utils/response');
const logActivity = require('../utils/logActivity');

router.use(auth);
router.use(role('caissier', 'superadmin'));

// ── Get Validated Orders (awaiting payment) ──
router.get('/orders', async (req, res) => {
    try {
        const { status } = req.query;
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

        return success(res, { orders });
    } catch (err) {
        console.error('Cashier orders error:', err);
        return error(res, 'Erreur lors du chargement');
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
