const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const UserPermission = sequelize.define('UserPermission', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
    },
    user_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: { model: 'users', key: 'id' },
    },
    permission_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: { model: 'permissions', key: 'id' },
    },
    granted: {
        type: DataTypes.BOOLEAN,
        defaultValue: true,
    },
}, {
    timestamps: true,
    underscored: true,
    uniqueKeys: {
        user_permission_unique: {
            fields: ['user_id', 'permission_id']
        }
    }
});

module.exports = UserPermission;
