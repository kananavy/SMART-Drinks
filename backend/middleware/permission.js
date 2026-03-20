const { error } = require('../utils/response');

// Role default permissions (single source of truth on backend)
const ROLE_DEFAULTS = {
    superadmin: null, // null = all permissions
    admin: [
        'view-orders', 'create-orders', 'confirm-orders', 'validate-orders', 'cancel-orders',
        'view-payments', 'process-payments', 'view-billing', 'export-billing',
        'view-users', 'create-users', 'edit-users',
        'view-products', 'create-products', 'edit-products', 'delete-products',
        'view-categories', 'create-categories', 'edit-categories', 'delete-categories',
        'view-stock', 'manage-stock', 'view-statistics', 'view-settings', 'view-activity-log',
    ],
    vendeur: [
        'view-orders', 'create-orders', 'confirm-orders', 'validate-orders', 'cancel-orders',
        'view-products', 'view-categories',
    ],
    caissier: [
        'view-payments', 'process-payments', 'view-billing', 'export-billing', 'view-orders-readonly',
    ],
    client: ['view-menu', 'place-orders', 'view-own-orders', 'view-own-payments'],
};

/**
 * Middleware: check if the authenticated user has a specific permission.
 * Uses the RolePermission DB table (role-level overrides), falls back to ROLE_DEFAULTS.
 * Superadmin always passes.
 */
const canDo = (permissionName) => async (req, res, next) => {
    try {
        if (!req.user) return error(res, 'Non authentifié', 401);

        const userRole = req.user.role;

        // Superadmin has all permissions
        if (userRole === 'superadmin') return next();

        // Check DB for role-level override
        const { RolePermission } = require('../models');
        const dbPerm = await RolePermission.findOne({
            where: { role: userRole, permission_name: permissionName },
        });

        if (dbPerm !== null) {
            return dbPerm.granted ? next() : error(res, 'Permission insuffisante', 403);
        }

        // Fall back to hardcoded defaults
        const defaults = ROLE_DEFAULTS[userRole];
        if (defaults === null || (Array.isArray(defaults) && defaults.includes(permissionName))) {
            return next();
        }

        return error(res, 'Permission insuffisante', 403);
    } catch (err) {
        console.error('canDo error:', err);
        return error(res, 'Erreur vérification permission', 500);
    }
};

/**
 * Middleware: require user to be an admin-level role (not client).
 */
const isAdminRole = (req, res, next) => {
    if (!req.user) return error(res, 'Non authentifié', 401);
    if (['vendeur', 'caissier', 'admin', 'superadmin'].includes(req.user.role)) return next();
    return error(res, 'Accès réservé au personnel', 403);
};

/**
 * Middleware: require superadmin only (for system-critical operations).
 */
const isSuperAdmin = (req, res, next) => {
    if (!req.user) return error(res, 'Non authentifié', 401);
    if (req.user.role === 'superadmin') return next();
    return error(res, 'Réservé au Super Administrateur', 403);
};

// Keep old checkPermission for backward compatibility
const checkPermission = (permissionName) => canDo(permissionName);

module.exports = { canDo, isAdminRole, isSuperAdmin, checkPermission, ROLE_DEFAULTS };
