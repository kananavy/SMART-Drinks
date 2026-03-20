const router = require('express').Router();
const jwt = require('jsonwebtoken');
const { User, ClientSession, RolePermission } = require('../models');
const auth = require('../middleware/auth');
const logActivity = require('../utils/logActivity');
const { success, error } = require('../utils/response');

// Role default permissions (mirrors frontend ROLE_DEFAULT_PERMISSIONS)
const ROLE_DEFAULTS = {
    vendeur: ['view-orders', 'create-orders', 'confirm-orders', 'validate-orders', 'cancel-orders', 'view-products', 'view-categories'],
    caissier: ['view-payments', 'process-payments', 'view-billing', 'export-billing', 'view-orders-readonly'],
    admin: [
        'view-orders', 'create-orders', 'confirm-orders', 'validate-orders', 'cancel-orders',
        'view-payments', 'process-payments', 'view-billing', 'export-billing',
        'view-users', 'create-users', 'edit-users',
        'view-products', 'create-products', 'edit-products', 'delete-products',
        'view-categories', 'create-categories', 'edit-categories', 'delete-categories',
        'view-stock', 'manage-stock', 'view-statistics',
        'view-settings', 'view-activity-log',
    ],
    superadmin: [
        'view-orders', 'create-orders', 'confirm-orders', 'validate-orders', 'cancel-orders',
        'view-payments', 'process-payments', 'view-billing', 'export-billing',
        'view-users', 'create-users', 'edit-users', 'delete-users', 'manage-permissions',
        'view-products', 'create-products', 'edit-products', 'delete-products',
        'view-categories', 'create-categories', 'edit-categories', 'delete-categories',
        'view-stock', 'manage-stock', 'view-statistics',
        'view-settings', 'edit-settings', 'view-activity-log', 'manage-plans',
    ],
};

// Generate a random 6-digit access code
const generateCode = () => String(Math.floor(100000 + Math.random() * 900000));

// ── Client Registration ──
router.post('/register', async (req, res) => {
    try {
        const { table_name, contact, start_date, start_time, persons } = req.body;

        if (!table_name || !contact || !start_date || !start_time) {
            return error(res, 'Tous les champs obligatoires doivent être remplis', 400);
        }

        // Create or find user with role client
        let user = await User.findOne({ where: { phone: contact, role: 'client' } });
        if (!user) {
            user = await User.create({
                name: table_name,
                phone: contact,
                role: 'client',
            });
        }

        // Create client session
        const access_code = generateCode();
        const session = await ClientSession.create({
            table_name,
            contact,
            access_code,
            start_date,
            start_time,
            persons: persons || null,
            user_id: user.id,
        });

        const token = jwt.sign(
            { id: user.id, role: 'client', sessionId: session.id },
            process.env.JWT_SECRET,
            { expiresIn: process.env.JWT_EXPIRES_IN }
        );

        await logActivity(user.id, 'REGISTER', `Client ${table_name} inscrit`, req.ip);

        return success(res, {
            token,
            user: user.toJSON(),
            session: {
                id: session.id,
                table_name: session.table_name,
                access_code: session.access_code,
            },
        }, 'Inscription réussie', 201);
    } catch (err) {
        console.error('Register error:', err);
        return error(res, 'Erreur lors de l\'inscription');
    }
});

// ── Client Login ──
router.post('/login/client', async (req, res) => {
    try {
        const { table_name, contact, access_code } = req.body;

        if (!table_name) {
            return error(res, 'Nom de table requis', 400);
        }

        let session;
        if (access_code) {
            session = await ClientSession.findOne({
                where: { table_name, access_code, active: true },
                include: [{ model: User }],
            });
        } else if (contact) {
            session = await ClientSession.findOne({
                where: { table_name, contact, active: true },
                include: [{ model: User }],
                order: [['created_at', 'DESC']],
            });
        }

        if (!session) {
            return error(res, 'Session non trouvée ou identifiants incorrects', 401);
        }

        const token = jwt.sign(
            { id: session.User.id, role: 'client', sessionId: session.id },
            process.env.JWT_SECRET,
            { expiresIn: process.env.JWT_EXPIRES_IN }
        );

        await logActivity(session.User.id, 'LOGIN', `Client ${table_name} connecté`, req.ip);

        return success(res, {
            token,
            user: session.User.toJSON(),
            session: {
                id: session.id,
                table_name: session.table_name,
                access_code: session.access_code,
            },
        }, 'Connexion réussie');
    } catch (err) {
        console.error('Client login error:', err);
        return error(res, 'Erreur de connexion');
    }
});

// ── Admin Login ──
router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return error(res, 'Email et mot de passe requis', 400);
        }

        const user = await User.findOne({
            where: { email, role: ['vendeur', 'caissier', 'admin', 'superadmin'] },
        });

        if (!user) {
            return error(res, 'Utilisateur non trouvé', 401);
        }

        const isMatch = await user.comparePassword(password);
        if (!isMatch) {
            return error(res, 'Mot de passe incorrect', 401);
        }

        if (!user.active) {
            return error(res, 'Compte désactivé', 403);
        }

        const token = jwt.sign(
            { id: user.id, role: user.role },
            process.env.JWT_SECRET,
            { expiresIn: process.env.JWT_EXPIRES_IN }
        );

        await logActivity(user.id, 'LOGIN', `Admin ${user.name} connecté`, req.ip);

        return success(res, { token, user: user.toJSON() }, 'Connexion réussie');
    } catch (err) {
        console.error('Admin login error:', err);
        return error(res, 'Erreur de connexion');
    }
});

// ── Get Profile ──
router.get('/profile', auth, async (req, res) => {
    try {
        return success(res, { user: req.user.toJSON() });
    } catch (err) {
        return error(res, 'Erreur serveur');
    }
});

// ── Get Current User Effective Permissions ──
router.get('/permissions', auth, async (req, res) => {
    try {
        const userRole = req.user.role;
        // Superadmin always has all permissions, no DB override needed
        if (userRole === 'superadmin') {
            return success(res, { role: userRole, permissions: ROLE_DEFAULTS.superadmin });
        }

        // Check DB for role-level overrides (admin, vendeur, caissier)
        const dbPerms = await RolePermission.findAll({ where: { role: userRole, granted: true } });
        if (dbPerms.length > 0) {
            return success(res, { role: userRole, permissions: dbPerms.map(p => p.permission_name) });
        }

        // Fall back to hardcoded defaults
        return success(res, { role: userRole, permissions: ROLE_DEFAULTS[userRole] || [] });
    } catch (err) {
        console.error('Permissions error:', err);
        return error(res, 'Erreur serveur');
    }
});

module.exports = router;
