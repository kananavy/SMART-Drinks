const router = require('express').Router();
const { Order, OrderItem, Product, ClientSession, Payment } = require('../models');
const auth = require('../middleware/auth');
const role = require('../middleware/role');
const { success, error } = require('../utils/response');
const logActivity = require('../utils/logActivity');

// All vendor routes require authentication
router.use(auth);
router.use(role('vendeur', 'superadmin'));

// ── Get Pending/Confirmed Orders ──
router.get('/orders', async (req, res) => {
    try {
        const { status } = req.query;
        const where = {};
        if (status) {
            where.status = status;
        } else {
            where.status = ['pending', 'confirmed', 'validated'];
        }

        const orders = await Order.findAll({
            where,
            include: [
                { model: OrderItem, as: 'items', include: [Product] },
                { model: ClientSession },
            ],
            order: [['created_at', 'DESC']],
        });

        return success(res, { orders });
    } catch (err) {
        console.error('Vendor orders error:', err);
        return error(res, 'Erreur lors du chargement des commandes');
    }
});

// ── Confirm Order ──
router.put('/orders/:id/confirm', async (req, res) => {
    try {
        const order = await Order.findByPk(req.params.id, {
            include: [
                { model: OrderItem, as: 'items', include: [Product] },
                { model: ClientSession },
            ],
        });

        if (!order) return error(res, 'Commande non trouvée', 404);
        if (order.status !== 'pending') {
            return error(res, 'Cette commande ne peut pas être confirmée', 400);
        }

        // Update stock
        for (const item of order.items) {
            await Product.decrement('stock_quantity', {
                by: item.quantity,
                where: { id: item.product_id },
            });
        }

        order.status = 'confirmed';
        order.vendeur_id = req.user.id;
        await order.save();

        // Notify
        const io = req.app.get('io');
        io.to('caissier').emit('order-confirmed', order);
        io.emit('order-status-update', { orderId: order.id, status: 'confirmed' });

        await logActivity(req.userId, 'ORDER_CONFIRM', `Commande ${order.order_number} confirmée`, req.ip);

        return success(res, { order }, 'Commande confirmée');
    } catch (err) {
        console.error('Confirm error:', err);
        return error(res, 'Erreur lors de la confirmation');
    }
});

// ── Validate Order (send to cashier) ──
router.put('/orders/:id/validate', async (req, res) => {
    try {
        const order = await Order.findByPk(req.params.id, {
            include: [
                { model: OrderItem, as: 'items', include: [Product] },
                { model: ClientSession },
            ],
        });

        if (!order) return error(res, 'Commande non trouvée', 404);
        if (order.status !== 'confirmed') {
            return error(res, 'Cette commande doit d\'abord être confirmée', 400);
        }

        order.status = 'validated';
        await order.save();

        const io = req.app.get('io');
        io.to('caissier').emit('order-validated', order);

        await logActivity(req.userId, 'ORDER_VALIDATE', `Commande ${order.order_number} validée`, req.ip);

        return success(res, { order }, 'Commande validée et envoyée au caissier');
    } catch (err) {
        console.error('Validate error:', err);
        return error(res, 'Erreur lors de la validation');
    }
});

// ── Create Walk-in Order ──
router.post('/orders', async (req, res) => {
    try {
        const { table_name, items, remarks, is_takeaway } = req.body;

        if (!items || items.length === 0) {
            return error(res, 'La commande doit contenir des produits', 400);
        }

        // Calculate totals
        let total = 0;
        let consignation_total = 0;
        const orderItems = [];

        for (const item of items) {
            const product = await Product.findByPk(item.product_id);
            if (!product) return error(res, `Produit #${item.product_id} non trouvé`, 404);

            const subtotal = parseFloat(product.price) * item.quantity;
            const consignation = is_takeaway ? parseFloat(product.consignation_price || 0) * item.quantity : 0;

            total += subtotal;
            consignation_total += consignation;

            orderItems.push({
                product_id: product.id,
                quantity: item.quantity,
                unit_price: product.price,
                consignation_price: is_takeaway ? product.consignation_price : 0,
                subtotal: subtotal + consignation,
            });
        }

        const order = await Order.create({
            vendeur_id: req.user.id,
            status: 'confirmed',
            is_takeaway: is_takeaway || false,
            remarks: remarks || null,
            total: total + consignation_total,
            consignation_total,
        });

        for (const item of orderItems) {
            await OrderItem.create({ ...item, order_id: order.id });
        }

        // Decrement stock
        for (const item of orderItems) {
            await Product.decrement('stock_quantity', {
                by: item.quantity,
                where: { id: item.product_id },
            });
        }

        const fullOrder = await Order.findByPk(order.id, {
            include: [{ model: OrderItem, as: 'items', include: [Product] }],
        });

        const io = req.app.get('io');
        io.to('caissier').emit('order-confirmed', fullOrder);

        await logActivity(req.userId, 'ORDER_WALKIN', `Commande walk-in ${order.order_number} créée`, req.ip);

        return success(res, { order: fullOrder }, 'Commande créée', 201);
    } catch (err) {
        console.error('Walk-in order error:', err);
        return error(res, 'Erreur lors de la création');
    }
});

// ── Modify Order ──
router.put('/orders/:id', async (req, res) => {
    try {
        const order = await Order.findByPk(req.params.id);
        if (!order) return error(res, 'Commande non trouvée', 404);
        if (['paid', 'cancelled'].includes(order.status)) {
            return error(res, 'Cette commande ne peut plus être modifiée', 400);
        }

        const { remarks, is_takeaway } = req.body;
        if (remarks !== undefined) order.remarks = remarks;
        if (is_takeaway !== undefined) order.is_takeaway = is_takeaway;
        await order.save();

        return success(res, { order }, 'Commande modifiée');
    } catch (err) {
        return error(res, 'Erreur lors de la modification');
    }
});

// ── Cancel Order ──
router.put('/orders/:id/cancel', async (req, res) => {
    try {
        const order = await Order.findByPk(req.params.id, {
            include: [{ model: OrderItem, as: 'items', include: [Product] }],
        });

        if (!order) return error(res, 'Commande non trouvée', 404);
        if (['paid', 'cancelled', 'validated'].includes(order.status)) {
            return error(res, 'Cette commande ne peut plus être annulée', 400);
        }

        // Restore stock if confirmed
        if (order.status === 'confirmed') {
            for (const item of order.items) {
                await Product.increment('stock_quantity', {
                    by: item.quantity,
                    where: { id: item.product_id },
                });
            }
        }

        order.status = 'cancelled';
        await order.save();

        const io = req.app.get('io');
        io.emit('order-status-update', { orderId: order.id, status: 'cancelled' });

        await logActivity(req.userId, 'ORDER_CANCEL', `Commande ${order.order_number} annulée`, req.ip);

        return success(res, { order }, 'Commande annulée');
    } catch (err) {
        console.error('Cancel error:', err);
        return error(res, 'Erreur lors de l\'annulation');
    }
});

module.exports = router;
