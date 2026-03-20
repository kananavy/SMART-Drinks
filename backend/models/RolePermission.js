const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const RolePermission = sequelize.define('RolePermission', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
    },
    role: {
        type: DataTypes.ENUM('vendeur', 'caissier', 'admin', 'superadmin'),
        allowNull: false,
    },
    permission_name: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    granted: {
        type: DataTypes.BOOLEAN,
        defaultValue: true,
    },
}, {
    timestamps: true,
    underscored: true,
    tableName: 'role_permissions',
    uniqueKeys: {
        role_permission_unique: {
            fields: ['role', 'permission_name'],
        },
    },
});

module.exports = RolePermission;
