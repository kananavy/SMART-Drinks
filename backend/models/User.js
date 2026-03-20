const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');
const bcrypt = require('bcryptjs');

const User = sequelize.define('User', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
    },
    name: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    email: {
        type: DataTypes.STRING,
        allowNull: true,
        unique: true,
        validate: { isEmail: true },
    },
    password: {
        type: DataTypes.STRING,
        allowNull: true,
    },
    phone: {
        type: DataTypes.STRING,
        allowNull: true,
    },
    role: {
        type: DataTypes.ENUM('client', 'vendeur', 'caissier', 'admin', 'superadmin'),
        defaultValue: 'client',
    },
    active: {
        type: DataTypes.BOOLEAN,
        defaultValue: true,
    },
    avatar: {
        type: DataTypes.STRING,
        allowNull: true,
    },
}, {
    hooks: {
        beforeCreate: async (user) => {
            if (user.password) {
                user.password = await bcrypt.hash(user.password, 10);
            }
        },
        beforeUpdate: async (user) => {
            if (user.changed('password') && user.password) {
                user.password = await bcrypt.hash(user.password, 10);
            }
        },
    },
});

User.prototype.comparePassword = async function (password) {
    return bcrypt.compare(password, this.password);
};

User.prototype.toJSON = function () {
    const values = { ...this.get() };
    delete values.password;
    return values;
};

module.exports = User;
