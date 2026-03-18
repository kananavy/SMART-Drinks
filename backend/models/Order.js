const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Order = sequelize.define('Order', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
    },
    order_number: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
    },
    client_session_id: {
        type: DataTypes.INTEGER,
        allowNull: true,
        references: { model: 'client_sessions', key: 'id' },
    },
    vendeur_id: {
        type: DataTypes.INTEGER,
        allowNull: true,
        references: { model: 'users', key: 'id' },
    },
    status: {
        type: DataTypes.ENUM('pending', 'confirmed', 'validated', 'paid', 'cancelled'),
        defaultValue: 'pending',
    },
    is_takeaway: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
    },
    remarks: {
        type: DataTypes.TEXT,
        allowNull: true,
    },
    total: {
        type: DataTypes.DECIMAL(10, 2),
        defaultValue: 0,
    },
    consignation_total: {
        type: DataTypes.DECIMAL(10, 2),
        defaultValue: 0,
    },
});

// Generate order number before validation to satisfy allowNull: false
Order.beforeValidate(async (order) => {
    if (!order.order_number) {
        const today = new Date();
        const dateStr = today.toISOString().slice(0, 10).replace(/-/g, '');
        const count = await Order.count({
            where: sequelize.where(
                sequelize.fn('DATE', sequelize.col('created_at')),
                today.toISOString().slice(0, 10)
            ),
        });
        order.order_number = `CMD-${dateStr}-${String(count + 1).padStart(4, '0')}`;
    }
});

module.exports = Order;
