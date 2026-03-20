const router = require('express').Router();
const { Op, fn, col, literal } = require('sequelize');
const {
    User, Category, Product, Order, OrderItem,
    Payment, StockEntry, Setting, ActivityLog, ClientSession,
    Permission, UserPermission, RolePermission
} = require('../models');
const auth = require('../middleware/auth');
const { canDo, isSuperAdmin } = require('../middleware/permission');
const { success, error, paginate } = require('../utils/response');
const logActivity = require('../utils/logActivity');
const multer = require('multer');
const path = require('path');
const InvoiceService = require('../services/invoiceService');

// File upload setup
// ... (multer config)

// Permissions routes (superadmin only)
router.get('/permissions', auth, isSuperAdmin, async (req, res) => {
    try {
        const permissions = await Permission.findAll({
            order: [['category', 'ASC'], ['name', 'ASC']]
        });
        return success(res, { permissions });
    } catch (err) {
        return error(res, 'Erreur lors du chargement des permissions');
    }
});

router.post('/permissions', auth, isSuperAdmin, async (req, res) => {
    try {
        const { name, label, category } = req.body;
        if (!name || !label || !category) {
            return error(res, 'Champs requis manquants', 400);
        }
        const existing = await Permission.findOne({ where: { name } });
        if (existing) {
            return error(res, 'Une permission avec ce nom existe déjà', 409);
        }
        const permission = await Permission.create({ name, label, category });
        await logActivity(req.userId, 'PERMISSION_CREATE', `Permission créée: ${label}`, req.ip);
        return success(res, { permission }, 'Permission créée', 201);
    } catch (err) {
        console.error(err);
        return error(res, 'Erreur lors de la création de la permission');
    }
});

router.get('/users/:id/permissions', auth, isSuperAdmin, async (req, res) => {
    try {
        const permissions = await Permission.findAll({
            include: [{
                model: User,
                where: { id: req.params.id },
                through: { attributes: ['granted'] },
                required: false
            }]
        });

        // Format response to easy-to-use array
        const result = permissions.map(p => ({
            id: p.id,
            name: p.name,
            label: p.label,
            category: p.category,
            granted: p.Users && p.Users.length > 0 ? p.Users[0].UserPermission.granted : false
        }));

        return success(res, { permissions: result });
    } catch (err) {
        console.error(err);
        return error(res, 'Erreur');
    }
});

router.post('/users/:id/permissions/toggle', auth, isSuperAdmin, async (req, res) => {
    try {
        const { permission_id, granted } = req.body;
        const [up, created] = await UserPermission.findOrCreate({
            where: { user_id: req.params.id, permission_id },
            defaults: { granted }
        });
        if (!created) {
            up.granted = granted;
            await up.save();
        }
        return success(res, { granted: up.granted }, 'Permission mise à jour');
    } catch (err) {
        return error(res, 'Erreur');
    }
});


// ─── Role-level Permission Routes ──────────────────────────────────────────────

const ROLE_DEFAULTS = {
    vendeur: ['orders.view', 'orders.create', 'products.view', 'stock.view'],
    caissier: ['orders.view', 'payments.manage', 'payments.view'],
    admin: [
      'orders.view', 'orders.create', 'orders.confirm', 'orders.validate',
      'payments.view', 'payments.manage',
      'users.view', 'users.create', 'users.edit',
      'products.view', 'products.create', 'products.edit', 'products.delete',
      'categories.view', 'categories.create', 'categories.edit',
      'stock.view', 'stock.manage',
      'stats.view', 'settings.view',
    ],
    superadmin: [], // Superadmin will be handled separately
};

// GET /admin/roles/:role/permissions — list all permissions with granted state for this role
router.get('/roles/:role/permissions', auth, isSuperAdmin, async (req, res) => {
    try {
        const { role: targetRole } = req.params;
        if (!['vendeur', 'caissier', 'superadmin', 'admin'].includes(targetRole)) {
            return error(res, 'Rôle invalide', 400);
        }

        // For superadmin, all permissions are granted
        const allPermissions = await Permission.findAll({ order: [['category', 'ASC'], ['name', 'ASC']] });
        if (targetRole === 'superadmin') {
            const result = allPermissions.map(p => ({ ...p.get(), granted: true }));
            return success(res, { role: targetRole, permissions: result });
        }

        // Load DB overrides for this role
        const dbPerms = await RolePermission.findAll({ where: { role: targetRole } });
        const dbMap = {};
        dbPerms.forEach(p => { dbMap[p.permission_name] = p.granted; });

        const defaults = ROLE_DEFAULTS[targetRole] || [];
        const result = allPermissions.map(p => ({
            name: p.name,
            label: p.label,
            category: p.category,
            // DB override takes priority, else use role default
            granted: dbMap.hasOwnProperty(p.name) ? dbMap[p.name] : defaults.includes(p.name),
            overridden: dbMap.hasOwnProperty(p.name),
        }));

        return success(res, { role: targetRole, permissions: result });
    } catch (err) {
        console.error(err);
        return error(res, 'Erreur');
    }
});

// POST /admin/roles/:role/permissions/bulk — save role permissions
router.post('/roles/:role/permissions/bulk', auth, isSuperAdmin, async (req, res) => {
    try {
        const { role: targetRole } = req.params;
        if (!['vendeur', 'caissier', 'admin'].includes(targetRole)) {
            return error(res, 'Rôle invalide (superadmin a toujours toutes les permissions)', 400);
        }

        const { permissions } = req.body; // [{ name, granted }]
        if (!Array.isArray(permissions)) return error(res, 'Format invalide', 400);

        // Upsert each permission for this role
        for (const perm of permissions) {
            await RolePermission.upsert({ role: targetRole, permission_name: perm.name, granted: perm.granted });
        }

        await logActivity(req.userId, 'ROLE_PERMISSIONS', `Permissions du rôle ${targetRole} mises à jour`, req.ip);
        return success(res, {}, 'Permissions du rôle mises à jour');
    } catch (err) {
        console.error(err);
        return error(res, 'Erreur');
    }
});

// GET /admin/all-permissions — list of all available permission definitions
router.get('/all-permissions', auth, isSuperAdmin, async (req, res) => {
    const permissions = await Permission.findAll({ order: [['category', 'ASC'], ['name', 'ASC']] });
    return success(res, { permissions });
});

// File upload setup
const storage = multer.diskStorage({
    destination: (req, file, cb) => cb(null, path.join(__dirname, '../uploads')),
    filename: (req, file, cb) => {
        const ext = path.extname(file.originalname).toLowerCase() || '.jpg';
        cb(null, `${Date.now()}-${Math.random().toString(36).slice(2, 9)}${ext}`);
    },
});
const upload = multer({
    storage,
    limits: { fileSize: 5 * 1024 * 1024 }, // 5 MB max
    fileFilter: (req, file, cb) => {
        if (file.mimetype.startsWith('image/')) return cb(null, true);
        cb(new Error('Seules les images sont autorisées'), false);
    },
});

// All routes below require authentication
router.use(auth);

// ════════════════════════
// USER MANAGEMENT
// ════════════════════════

router.get('/users', canDo('view-users'), async (req, res) => {
    try {
        const { role: roleFilter, page = 1, limit = 20, search = '' } = req.query;
        const where = { role: ['vendeur', 'caissier', 'admin', 'superadmin'] };
        if (roleFilter) where.role = roleFilter;
        if (search) {
            where[Op.or] = [
                { name: { [Op.like]: `%${search}%` } },
                { email: { [Op.like]: `%${search}%` } },
            ];
        }

        const { count, rows } = await User.findAndCountAll({
            where,
            order: [['created_at', 'DESC']],
            limit: parseInt(limit),
            offset: (parseInt(page) - 1) * parseInt(limit),
        });

        return paginate(res, rows, count, page, limit);
    } catch (err) {
        return error(res, 'Erreur lors du chargement des utilisateurs');
    }
});

router.post('/users', canDo('create-users'), async (req, res) => {
    try {
        const { name, email, password, phone, role: userRole } = req.body;
        if (!name || !email || !password || !userRole) {
            return error(res, 'Champs obligatoires manquants', 400);
        }

        const exists = await User.findOne({ where: { email } });
        if (exists) return error(res, 'Email déjà utilisé', 400);

        const user = await User.create({ name, email, password, phone, role: userRole });
        await logActivity(req.userId, 'USER_CREATE', `Utilisateur ${name} créé (${userRole})`, req.ip);

        return success(res, { user }, 'Utilisateur créé', 201);
    } catch (err) {
        console.error('Create user error:', err);
        return error(res, 'Erreur lors de la création');
    }
});

router.put('/users/:id', canDo('edit-users'), async (req, res) => {
    try {
        const user = await User.findByPk(req.params.id);
        if (!user) return error(res, 'Utilisateur non trouvé', 404);

        const { name, email, phone, role: userRole, active, password } = req.body;
        if (name) user.name = name;
        if (email) user.email = email;
        if (phone) user.phone = phone;
        if (userRole) user.role = userRole;
        if (active !== undefined) user.active = active;
        if (password) user.password = password;
        await user.save();

        await logActivity(req.userId, 'USER_UPDATE', `Utilisateur ${user.name} modifié`, req.ip);
        return success(res, { user }, 'Utilisateur modifié');
    } catch (err) {
        return error(res, 'Erreur lors de la modification');
    }
});

router.delete('/users/:id', canDo('delete-users'), async (req, res) => {
    try {
        const user = await User.findByPk(req.params.id);
        if (!user) return error(res, 'Utilisateur non trouvé', 404);

        await user.destroy();
        await logActivity(req.userId, 'USER_DELETE', `Utilisateur ${user.name} supprimé`, req.ip);
        return success(res, null, 'Utilisateur supprimé');
    } catch (err) {
        return error(res, 'Erreur lors de la suppression');
    }
});

// ════════════════════════
// CATEGORY MANAGEMENT
// ════════════════════════

router.get('/categories', canDo('view-categories'), async (req, res) => {
    try {
        const categories = await Category.findAll({
            order: [['sort_order', 'ASC']],
            include: [{ model: Product, attributes: ['id'] }],
        });
        return success(res, { categories });
    } catch (err) {
        return error(res, 'Erreur');
    }
});

router.post('/categories', canDo('create-categories'), async (req, res) => {
    try {
        const { name, icon, sort_order, packaging_type } = req.body;
        if (!name) return error(res, 'Nom requis', 400);
        const category = await Category.create({
            name,
            icon,
            sort_order: sort_order || 0,
            packaging_type
        });
        return success(res, { category }, 'Catégorie créée', 201);
    } catch (err) {
        return error(res, 'Erreur lors de la création');
    }
});

router.put('/categories/:id', canDo('edit-categories'), async (req, res) => {
    try {
        const category = await Category.findByPk(req.params.id);
        if (!category) return error(res, 'Non trouvé', 404);
        const { name, icon, sort_order, packaging_type } = req.body;
        if (name) category.name = name;
        if (icon !== undefined) category.icon = icon;
        if (sort_order !== undefined) category.sort_order = sort_order;
        if (packaging_type !== undefined) category.packaging_type = packaging_type;
        await category.save();
        return success(res, { category }, 'Catégorie modifiée');
    } catch (err) {
        return error(res, 'Erreur');
    }
});

// Upload category image
router.post('/categories/:id/image', canDo('edit-categories'), upload.single('image'), async (req, res) => {
    try {
        const category = await Category.findByPk(req.params.id);
        if (!category) return error(res, 'Non trouvé', 404);
        if (!req.file) return error(res, 'Fichier requis', 400);

        category.image = `/uploads/${req.file.filename}`;
        await category.save();

        return success(res, { path: category.image }, 'Image mise à jour');
    } catch (err) {
        return error(res, 'Erreur');
    }
});

router.delete('/categories/:id', canDo('delete-categories'), async (req, res) => {
    try {
        const category = await Category.findByPk(req.params.id);
        if (!category) return error(res, 'Non trouvé', 404);
        await category.destroy();
        return success(res, null, 'Catégorie supprimée');
    } catch (err) {
        return error(res, 'Erreur');
    }
});

// ════════════════════════
// PRODUCT MANAGEMENT
// ════════════════════════

router.get('/products', canDo('view-products'), async (req, res) => {
    try {
        const { category_id, page = 1, limit = 50 } = req.query;
        const where = {};
        if (category_id) where.category_id = category_id;

        const { count, rows } = await Product.findAndCountAll({
            where,
            include: [{ model: Category, attributes: ['id', 'name'] }],
            order: [['name', 'ASC']],
            limit: parseInt(limit),
            offset: (parseInt(page) - 1) * parseInt(limit),
        });

        return paginate(res, rows, count, page, limit);
    } catch (err) {
        return error(res, 'Erreur');
    }
});

router.post('/products', canDo('create-products'), upload.single('image'), async (req, res) => {
    try {
        const { name, category_id, price, consignation_price, stock_quantity, description } = req.body;
        if (!name || !category_id || !price) {
            return error(res, 'Champs obligatoires manquants', 400);
        }

        const product = await Product.create({
            name,
            category_id,
            price,
            consignation_price: consignation_price || 0,
            stock_quantity: stock_quantity || 0,
            description,
            image: req.file ? `/uploads/${req.file.filename}` : null,
        });

        await logActivity(req.userId, 'PRODUCT_CREATE', `Produit ${name} créé`, req.ip);
        return success(res, { product }, 'Produit créé', 201);
    } catch (err) {
        console.error('Create product error:', err);
        return error(res, 'Erreur lors de la création');
    }
});

router.put('/products/:id', upload.single('image'), async (req, res) => {
    try {
        const product = await Product.findByPk(req.params.id);
        if (!product) return error(res, 'Non trouvé', 404);

        const { name, category_id, price, consignation_price, stock_quantity, available, description } = req.body;
        if (name) product.name = name;
        if (category_id) product.category_id = category_id;
        if (price !== undefined) product.price = price;
        if (consignation_price !== undefined) product.consignation_price = consignation_price;
        if (stock_quantity !== undefined) product.stock_quantity = stock_quantity;
        if (available !== undefined) product.available = available;
        if (description !== undefined) product.description = description;
        if (req.file) product.image = `/uploads/${req.file.filename}`;
        await product.save();

        return success(res, { product }, 'Produit modifié');
    } catch (err) {
        return error(res, 'Erreur');
    }
});

router.delete('/products/:id', async (req, res) => {
    try {
        const product = await Product.findByPk(req.params.id);
        if (!product) return error(res, 'Non trouvé', 404);
        await product.destroy();
        return success(res, null, 'Produit supprimé');
    } catch (err) {
        return error(res, 'Erreur');
    }
});

// ════════════════════════
// STOCK MANAGEMENT
// ════════════════════════

router.get('/stock', async (req, res) => {
    try {
        const products = await Product.findAll({
            include: [{ model: Category, attributes: ['id', 'name'] }],
            order: [['name', 'ASC']],
        });
        return success(res, { products });
    } catch (err) {
        return error(res, 'Erreur');
    }
});

router.post('/stock/in', async (req, res) => {
    try {
        const { product_id, quantity, reason } = req.body;
        if (!product_id || !quantity) return error(res, 'Champs requis', 400);

        const product = await Product.findByPk(product_id);
        if (!product) return error(res, 'Produit non trouvé', 404);

        await StockEntry.create({
            product_id,
            type: 'in',
            quantity,
            reason: reason || 'Entrée de stock',
            user_id: req.user.id,
        });

        product.stock_quantity += parseInt(quantity);
        await product.save();

        await logActivity(req.userId, 'STOCK_IN', `+${quantity} ${product.name}`, req.ip);
        return success(res, { product }, 'Stock mis à jour');
    } catch (err) {
        return error(res, 'Erreur');
    }
});

router.post('/stock/out', async (req, res) => {
    try {
        const { product_id, quantity, reason } = req.body;
        if (!product_id || !quantity) return error(res, 'Champs requis', 400);

        const product = await Product.findByPk(product_id);
        if (!product) return error(res, 'Produit non trouvé', 404);

        await StockEntry.create({
            product_id,
            type: 'out',
            quantity,
            reason: reason || 'Sortie de stock',
            user_id: req.user.id,
        });

        product.stock_quantity = Math.max(0, product.stock_quantity - parseInt(quantity));
        await product.save();

        await logActivity(req.userId, 'STOCK_OUT', `-${quantity} ${product.name}`, req.ip);
        return success(res, { product }, 'Stock mis à jour');
    } catch (err) {
        return error(res, 'Erreur');
    }
});

router.get('/stock/history', async (req, res) => {
    try {
        const { product_id, page = 1, limit = 50 } = req.query;
        const where = {};
        if (product_id) where.product_id = product_id;

        const { count, rows } = await StockEntry.findAndCountAll({
            where,
            include: [
                { model: Product, attributes: ['id', 'name'] },
                { model: User, attributes: ['id', 'name'] },
            ],
            order: [['created_at', 'DESC']],
            limit: parseInt(limit),
            offset: (parseInt(page) - 1) * parseInt(limit),
        });

        return paginate(res, rows, count, page, limit);
    } catch (err) {
        return error(res, 'Erreur');
    }
});

// ════════════════════════
// STATISTICS
// ════════════════════════

router.get('/statistics', async (req, res) => {
    try {
        const { period } = req.query; // 'daily', 'monthly'
        const today = new Date();
        const startOfDay = new Date(today.setHours(0, 0, 0, 0));
        const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);

        // Total users
        const totalUsers = await User.count();

        // Orders today
        const ordersToday = await Order.count({
            where: { created_at: { [Op.gte]: startOfDay } },
        });

        // Revenue today
        const revenueToday = await Payment.sum('amount', {
            where: { status: 'paid', created_at: { [Op.gte]: startOfDay } },
        }) || 0;

        // Revenue this month
        const revenueMonth = await Payment.sum('amount', {
            where: { status: 'paid', created_at: { [Op.gte]: startOfMonth } },
        }) || 0;

        // Pending orders
        const pendingOrders = await Order.count({
            where: { status: ['pending', 'confirmed', 'validated'] },
        });

        // Low stock products
        const lowStock = await Product.count({
            where: { stock_quantity: { [Op.lte]: 5 } },
        });

        // Top products (most ordered)
        const topProducts = await OrderItem.findAll({
            attributes: [
                'product_id',
                [fn('SUM', col('quantity')), 'total_quantity'],
                [fn('SUM', col('subtotal')), 'total_revenue'],
            ],
            include: [{ model: Product, attributes: ['name', 'price'] }],
            group: ['product_id', 'Product.id'],
            order: [[literal('total_quantity'), 'DESC']],
            limit: 10,
        });

        // Daily revenue for last 30 days
        const dailyRevenue = await Payment.findAll({
            attributes: [
                [fn('DATE', col('created_at')), 'date'],
                [fn('SUM', col('amount')), 'total'],
                [fn('COUNT', col('id')), 'count'],
            ],
            where: {
                status: 'paid',
                created_at: { [Op.gte]: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) },
            },
            group: [fn('DATE', col('created_at'))],
            order: [[fn('DATE', col('created_at')), 'ASC']],
        });

        return success(res, {
            totalUsers,
            ordersToday,
            revenueToday,
            revenueMonth,
            pendingOrders,
            lowStock,
            topProducts,
            dailyRevenue,
        });
    } catch (err) {
        console.error('Stats error:', err);
        return error(res, 'Erreur lors du chargement des statistiques');
    }
});

// ════════════════════════
// SETTINGS
// ════════════════════════

router.get('/settings', async (req, res) => {
    try {
        const settings = await Setting.findAll();
        const obj = {};
        settings.forEach(s => { obj[s.key] = s.value; });
        return success(res, { settings: obj });
    } catch (err) {
        return error(res, 'Erreur');
    }
});

router.put('/settings', async (req, res) => {
    try {
        const updates = req.body;
        for (const [key, value] of Object.entries(updates)) {
            await Setting.upsert({ key, value });
        }
        await logActivity(req.userId, 'SETTINGS_UPDATE', 'Paramètres mis à jour', req.ip);
        return success(res, null, 'Paramètres mis à jour');
    } catch (err) {
        return error(res, 'Erreur');
    }
});

// Upload settings asset (logo, favicon, etc)
router.post('/settings/upload/:key', upload.single('file'), async (req, res) => {
    try {
        const { key } = req.params;
        if (!req.file) return error(res, 'Fichier requis', 400);
        await Setting.upsert({ key, value: `/uploads/${req.file.filename}` });
        return success(res, { path: `/uploads/${req.file.filename}` }, 'Fichier mis à jour');
    } catch (err) {
        return error(res, 'Erreur');
    }
});

// ════════════════════════
// ACTIVITY LOG
// ════════════════════════

router.get('/activity-log', async (req, res) => {
    try {
        const { page = 1, limit = 25, action, user_id, search } = req.query;
        const where = {};
        if (action) where.action = { [Op.like]: `${action}%` };
        if (user_id) where.user_id = user_id;
        if (search) where.description = { [Op.like]: `%${search}%` };

        const { count, rows } = await ActivityLog.findAndCountAll({
            where,
            include: [{ model: User, attributes: ['id', 'name', 'role'] }],
            order: [['created_at', 'DESC']],
            limit: parseInt(limit),
            offset: (parseInt(page) - 1) * parseInt(limit),
        });
        return paginate(res, rows, count, page, limit);
    } catch (err) {
        return error(res, 'Erreur');
    }
});

// ════════════════════════
// ALL ORDERS (for super admin)
// ════════════════════════

router.get('/orders', async (req, res) => {
    try {
        const { status, page = 1, limit = 20, search, date_from, date_to } = req.query;
        const where = {};
        if (status) where.status = status;
        if (date_from || date_to) {
            where.created_at = {};
            if (date_from) where.created_at[Op.gte] = new Date(date_from);
            if (date_to) {
                const end = new Date(date_to);
                end.setHours(23, 59, 59, 999);
                where.created_at[Op.lte] = end;
            }
        }

        const clientSessionWhere = search
            ? { table_name: { [Op.like]: `%${search}%` } }
            : undefined;

        const { count, rows } = await Order.findAndCountAll({
            where,
            include: [
                { model: OrderItem, as: 'items', include: [Product] },
                { model: ClientSession, where: clientSessionWhere, required: !!search },
                { model: Payment },
            ],
            order: [['created_at', 'DESC']],
            limit: parseInt(limit),
            offset: (parseInt(page) - 1) * parseInt(limit),
        });

        return paginate(res, rows, count, page, limit);
    } catch (err) {
        console.error('Orders error:', err);
        return error(res, 'Erreur');
    }
});

// Generate Invoice PDF
router.get('/orders/:id/invoice', async (req, res) => {
    try {
        const order = await Order.findByPk(req.params.id, {
            include: [
                { model: OrderItem, as: 'items', include: [Product] },
                { model: ClientSession },
                { model: Payment }
            ]
        });

        if (!order) return error(res, 'Commande non trouvée', 404);

        const settingsRows = await Setting.findAll();
        const settings = {};
        settingsRows.forEach(s => { settings[s.key] = s.value; });

        const pdfBuffer = await InvoiceService.generateOrderInvoice(order, settings);

        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `attachment; filename=facture-${order.id}.pdf`);
        return res.send(pdfBuffer);
    } catch (err) {
        console.error('PDF Error:', err);
        return error(res, 'Erreur lors de la génération du PDF');
    }
});

module.exports = router;
