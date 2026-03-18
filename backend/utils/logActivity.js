const { ActivityLog } = require('../models');

const logActivity = async (userId, action, description, ipAddress) => {
    try {
        await ActivityLog.create({
            user_id: userId,
            action,
            description,
            ip_address: ipAddress,
        });
    } catch (error) {
        console.error('Failed to log activity:', error);
    }
};

module.exports = logActivity;
