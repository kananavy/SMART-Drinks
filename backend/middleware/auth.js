const jwt = require('jsonwebtoken');
const { User } = require('../models');

const auth = async (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return res.status(401).json({ success: false, message: 'Token requis' });
        }

        const token = authHeader.split(' ')[1];
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        const user = await User.findByPk(decoded.id);
        if (!user || !user.active) {
            return res.status(401).json({ success: false, message: 'Utilisateur non trouvé ou inactif' });
        }

        req.user = user;
        req.userId = user.id;
        next();
    } catch (error) {
        return res.status(401).json({ success: false, message: 'Token invalide' });
    }
};

module.exports = auth;
