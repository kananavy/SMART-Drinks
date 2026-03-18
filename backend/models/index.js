const User = require('./User');
const ClientSession = require('./ClientSession');
const Category = require('./Category');
const Product = require('./Product');
const Order = require('./Order');
const OrderItem = require('./OrderItem');
const Payment = require('./Payment');
const StockEntry = require('./StockEntry');
const Setting = require('./Setting');
const ActivityLog = require('./ActivityLog');
const Permission = require('./Permission');
const UserPermission = require('./UserPermission');

// ── Associations ──

// User (vendeur) <-> Order
User.hasMany(Order, { foreignKey: 'vendeur_id', as: 'managedOrders' });
Order.belongsTo(User, { foreignKey: 'vendeur_id', as: 'vendeur' });

// User permissions (Many-to-Many)
User.belongsToMany(Permission, {
    through: UserPermission,
    foreignKey: 'user_id',
    otherKey: 'permission_id',
    as: 'permissions'
});
Permission.belongsToMany(User, {
    through: UserPermission,
    foreignKey: 'permission_id',
    otherKey: 'user_id'
});

// User method to check permission
User.prototype.hasPermission = async function (permissionName) {
    if (this.role === 'superadmin') return true;

    const permission = await this.getPermissions({
        where: { name: permissionName },
        through: { where: { granted: true } }
    });

    return permission.length > 0;
};

// User <-> ClientSession
User.hasMany(ClientSession, { foreignKey: 'user_id' });
ClientSession.belongsTo(User, { foreignKey: 'user_id' });

// Category <-> Product
Category.hasMany(Product, { foreignKey: 'category_id' });
Product.belongsTo(Category, { foreignKey: 'category_id' });

// ClientSession <-> Order
ClientSession.hasMany(Order, { foreignKey: 'client_session_id' });
Order.belongsTo(ClientSession, { foreignKey: 'client_session_id' });

// Order <-> OrderItem
Order.hasMany(OrderItem, { foreignKey: 'order_id', as: 'items' });
OrderItem.belongsTo(Order, { foreignKey: 'order_id' });

// Product <-> OrderItem
Product.hasMany(OrderItem, { foreignKey: 'product_id' });
OrderItem.belongsTo(Product, { foreignKey: 'product_id' });

// Order <-> Payment
Order.hasOne(Payment, { foreignKey: 'order_id' });
Payment.belongsTo(Order, { foreignKey: 'order_id' });

// User (caissier) <-> Payment
User.hasMany(Payment, { foreignKey: 'caissier_id', as: 'processedPayments' });
Payment.belongsTo(User, { foreignKey: 'caissier_id', as: 'caissier' });

// Product <-> StockEntry
Product.hasMany(StockEntry, { foreignKey: 'product_id' });
StockEntry.belongsTo(Product, { foreignKey: 'product_id' });

// User <-> StockEntry
User.hasMany(StockEntry, { foreignKey: 'user_id' });
StockEntry.belongsTo(User, { foreignKey: 'user_id' });

// User <-> ActivityLog
User.hasMany(ActivityLog, { foreignKey: 'user_id' });
ActivityLog.belongsTo(User, { foreignKey: 'user_id' });

module.exports = {
    User,
    ClientSession,
    Category,
    Product,
    Order,
    OrderItem,
    Payment,
    StockEntry,
    Setting,
    ActivityLog,
    Permission,
    UserPermission,
};
