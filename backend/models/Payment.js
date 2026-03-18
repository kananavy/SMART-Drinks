const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Payment = sequelize.define('Payment', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
    },
    order_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: { model: 'orders', key: 'id' },
    },
    caissier_id: {
        type: DataTypes.INTEGER,
        allowNull: true,
        references: { model: 'users', key: 'id' },
    },
    amount: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
    },
    method: {
        type: DataTypes.ENUM('cash', 'mobile_money', 'card'),
        defaultValue: 'cash',
    },
    status: {
        type: DataTypes.ENUM('paid', 'unpaid'),
        defaultValue: 'unpaid',
    },
    reference: {
        type: DataTypes.STRING,
        allowNull: true,
    },
});

module.exports = Payment;
