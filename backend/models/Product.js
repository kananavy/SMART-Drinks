const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Product = sequelize.define('Product', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
    },
    name: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    category_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: { model: 'categories', key: 'id' },
    },
    price: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
        defaultValue: 0,
    },
    consignation_price: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: true,
        defaultValue: 0,
    },
    stock_quantity: {
        type: DataTypes.INTEGER,
        defaultValue: 0,
    },
    image: {
        type: DataTypes.STRING,
        allowNull: true,
    },
    available: {
        type: DataTypes.BOOLEAN,
        defaultValue: true,
    },
    description: {
        type: DataTypes.TEXT,
        allowNull: true,
    },
});

module.exports = Product;
