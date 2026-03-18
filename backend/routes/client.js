const router = require('express').Router();
const { Op } = require('sequelize');
const { Category, Product, Order, OrderItem, Payment, ClientSession, Setting } = require('../models');
const auth = require('../middleware/auth');
const { success, error } = require('../utils/response');
const logActivity = require('../utils/logActivity');

// Public setting keys exposed to landing page (no auth required)
const PUBLIC_KEYS = [
    'bar_name', 'bar_slogan', 'bar_address', 'bar_phone', 'bar_email',
    'logo', 'favicon', 'primary_color', 'secondary_color',
    'font_family', 'base_font_size', 'bg_style',
    'hero_badge_text', 'hero_badge_show', 'hero_cta1_text', 'hero_cta2_text', 'hero_overlay_opacity',
    'landing_bg_image',
    'landing_stat1_value', 'landing_stat1_label',
    'landing_stat2_value', 'landing_stat2_label',
    'landing_stat3_value', 'landing_stat3_label',
    'landing_feat1_icon', 'landing_feat1_title', 'landing_feat1_desc',
    'landing_feat2_icon', 'landing_feat2_title', 'landing_feat2_desc',
    'landing_feat3_icon', 'landing_feat3_title', 'landing_feat3_desc',
    'landing_feat4_icon', 'landing_feat4_title', 'landing_feat4_desc',
    'landing_footer_tagline',
];

// ── Get Public Settings (no auth) ──
router.get('/settings', async (req, res) => {
    try {
        const rows = await Setting.findAll({ where: { key: PUBLIC_KEYS } });
        const settings = {};
        rows.forEach(r => { settings[r.key] = r.value; });
        return success(res, { settings });
    } catch (err) {
        return success(res, { settings: {} });
    }
});

// ── Get Menu (public) ──
router.get('/menu', async (req, res) => {
    try {
        const categories = await Category.findAll({
            order: [['sort_order', 'ASC']],
            include: [{
                model: Product,
                where: { available: true },
                required: false,
                attributes: ['id', 'name', 'price', 'consignation_price', 'image', 'available', 'stock_quantity', 'description'],
            }],
        });

        return success(res, { categories });
    } catch (err) {
        console.error('Menu error:', err);
        return error(res, 'Erreur lors du chargement du menu');
    }
});

// ── Place Order ──
router.post('/orders', auth, async (req, res) => {
    try {
        const { items, remarks, is_takeaway } = req.body;
        const sessionId = req.user.role === 'client' ? req.body.session_id : null;

        if (!items || !Array.isArray(items) || items.length === 0) {
            return error(res, 'La commande doit contenir au moins un produit', 400);
        }

        // Calculate totals
        let total = 0;
        let consignation_total = 0;
        const orderItems = [];

        for (const item of items) {
            const product = await Product.findByPk(item.product_id);
            if (!product) {
                return error(res, `Produit #${item.product_id} non trouvé`, 404);
            }
            if (!product.available || product.stock_quantity < item.quantity) {
                return error(res, `${product.name} non disponible en quantité suffisante`, 400);
            }

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

        // Create order
        const order = await Order.create({
            client_session_id: sessionId,
            status: 'pending',
            is_takeaway: is_takeaway || false,
            remarks: remarks || null,
            total: total + consignation_total,
            consignation_total,
        });

        // Create order items
        for (const item of orderItems) {
            await OrderItem.create({ ...item, order_id: order.id });
        }

        // Emit to vendors
        const io = req.app.get('io');
        const fullOrder = await Order.findByPk(order.id, {
            include: [
                { model: OrderItem, as: 'items', include: [Product] },
                { model: ClientSession },
            ],
        });
        io.to('vendeur').emit('new-order', fullOrder);

        await logActivity(req.userId, 'ORDER_CREATE', `Commande ${order.order_number} créée`, req.ip);

        return success(res, { order: fullOrder }, 'Commande envoyée', 201);
    } catch (err) {
        console.error('Order error:', err);
        return error(res, 'Erreur lors de la commande');
    }
});

// ── Order History (client) ──
router.get('/orders/history', auth, async (req, res) => {
    try {
        const where = {};
        // If client, get only their session orders
        if (req.user.role === 'client') {
            const sessions = await ClientSession.findAll({
                where: { user_id: req.user.id },
                attributes: ['id'],
            });
            where.client_session_id = sessions.map(s => s.id);
        }

        const orders = await Order.findAll({
            where,
            include: [
                { model: OrderItem, as: 'items', include: [Product] },
                { model: Payment },
                { model: ClientSession },
            ],
            order: [['created_at', 'DESC']],
        });

        return success(res, { orders });
    } catch (err) {
        console.error('Order history error:', err);
        return error(res, 'Erreur lors du chargement de l\'historique');
    }
});

// ── Payment History (client) ──
router.get('/payments/history', auth, async (req, res) => {
    try {
        const sessions = await ClientSession.findAll({
            where: { user_id: req.user.id },
            attributes: ['id'],
        });

        const orders = await Order.findAll({
            where: { client_session_id: sessions.map(s => s.id) },
            attributes: ['id'],
        });

        const payments = await Payment.findAll({
            where: { order_id: orders.map(o => o.id) },
            include: [{
                model: Order,
                include: [
                    { model: OrderItem, as: 'items', include: [Product] },
                    { model: ClientSession },
                ],
            }],
            order: [['created_at', 'DESC']],
        });

        return success(res, { payments });
    } catch (err) {
        console.error('Payment history error:', err);
        return error(res, 'Erreur lors du chargement des paiements');
    }
});

// ── Call Server ──
router.post('/call-server', auth, async (req, res) => {
    try {
        const { session_id, message } = req.body;
        const session = await ClientSession.findByPk(session_id);

        if (!session) {
            return error(res, 'Session non trouvée', 404);
        }

        const io = req.app.get('io');
        io.to('vendeur').emit('call-server', {
            table_name: session.table_name,
            message: message || 'Le client appelle le serveur',
            timestamp: new Date().toISOString(),
        });

        return success(res, null, 'Serveur appelé');
    } catch (err) {
        return error(res, 'Erreur');
    }
});

module.exports = router;
