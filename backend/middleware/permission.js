const { error } = require('../utils/response');

/**
 * Middleware to check if user has a specific permission
 */
const checkPermission = (permissionName) => {
    return async (req, res, next) => {
        try {
            if (!req.user) {
                return error(res, 'Non authentifié', 401);
            }

            const hasAccess = await req.user.hasPermission(permissionName);
            if (!hasAccess) {
                return error(res, 'Accès refusé : permission insuffisante', 403);
            }

            next();
        } catch (err) {
            console.error('Permission check error:', err);
            return error(res, 'Erreur lors de la vérification des permissions', 500);
        }
    };
};

module.exports = {
    checkPermission
};
