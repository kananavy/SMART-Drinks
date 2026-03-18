const sequelize = require('../config/database');
const { User, Category, Product, Setting, Permission, UserPermission } = require('../models');
const bcrypt = require('bcryptjs');
const seedPermissions = require('./permissionSeeder');

async function seed() {
    try {
        await sequelize.authenticate();
        console.log('✅ Connected to database');

        // Sync all models
        await sequelize.sync({ force: true });
        console.log('✅ Database tables created');

        // ── Permissions ──
        await seedPermissions();

        // ── Super Admin ──
        await User.create({
            name: 'Super Admin',
            email: 'admin@bar.com',
            password: 'admin123',
            role: 'superadmin',
            phone: '+261340000000',
        });
        console.log('✅ Super Admin created (admin@bar.com / admin123)');

        // ── Sample Staff ──
        await User.create({
            name: 'Vendeur Test',
            email: 'vendeur@bar.com',
            password: 'vendeur123',
            role: 'vendeur',
            phone: '+261340000001',
        });

        await User.create({
            name: 'Caissier Test',
            email: 'caissier@bar.com',
            password: 'caissier123',
            role: 'caissier',
            phone: '+261340000002',
        });
        console.log('✅ Sample staff created');

        // ── Categories ──
        const categories = await Category.bulkCreate([
            { name: 'Bière', icon: '🍺', sort_order: 1 },
            { name: 'Soft', icon: '🥤', sort_order: 2 },
            { name: 'Alcool', icon: '🍸', sort_order: 3 },
            { name: 'Cocktails', icon: '🍹', sort_order: 4 },
            { name: 'Eau', icon: '💧', sort_order: 5 },
            { name: 'Autres', icon: '🍽️', sort_order: 6 },
        ]);
        console.log('✅ Categories created');

        // ── Products ──
        const [biere, soft, alcool, cocktails, eau, autres] = categories;

        await Product.bulkCreate([
            // Bières
            { name: 'THB Grand', category_id: biere.id, price: 8000, consignation_price: 2000, stock_quantity: 100 },
            { name: 'THB Pilsener', category_id: biere.id, price: 6000, consignation_price: 1500, stock_quantity: 80 },
            { name: 'Three Horses Fresh', category_id: biere.id, price: 5000, consignation_price: 1000, stock_quantity: 60 },
            { name: 'Gold', category_id: biere.id, price: 7000, consignation_price: 1500, stock_quantity: 50 },
            { name: 'Skol', category_id: biere.id, price: 5500, consignation_price: 1000, stock_quantity: 70 },
            // Soft
            { name: 'Coca-Cola', category_id: soft.id, price: 3000, consignation_price: 500, stock_quantity: 100 },
            { name: 'Fanta Orange', category_id: soft.id, price: 3000, consignation_price: 500, stock_quantity: 80 },
            { name: 'Sprite', category_id: soft.id, price: 3000, consignation_price: 500, stock_quantity: 80 },
            { name: 'Bajab PM', category_id: soft.id, price: 3000, consignation_price: 1000, stock_quantity: 60 },
            { name: 'Red Bull', category_id: soft.id, price: 8000, consignation_price: 0, stock_quantity: 40 },
            // Alcool
            { name: 'Rhum Dzama', category_id: alcool.id, price: 15000, consignation_price: 3000, stock_quantity: 30 },
            { name: 'Whisky J&B', category_id: alcool.id, price: 25000, consignation_price: 0, stock_quantity: 20 },
            { name: 'Vodka Smirnoff', category_id: alcool.id, price: 20000, consignation_price: 0, stock_quantity: 25 },
            // Cocktails
            { name: 'Mojito', category_id: cocktails.id, price: 12000, consignation_price: 0, stock_quantity: 50 },
            { name: 'Piña Colada', category_id: cocktails.id, price: 14000, consignation_price: 0, stock_quantity: 40 },
            { name: 'Margarita', category_id: cocktails.id, price: 13000, consignation_price: 0, stock_quantity: 45 },
            // Eau
            { name: 'Eau Vive 1.5L', category_id: eau.id, price: 2000, consignation_price: 500, stock_quantity: 200 },
            { name: 'Eau Vive 0.5L', category_id: eau.id, price: 1000, consignation_price: 300, stock_quantity: 200 },
        ]);
        console.log('✅ Products created');

        // ── Default Settings ──
        await Setting.bulkCreate([
            { key: 'bar_name', value: 'Le Bar Lounge' },
            { key: 'bar_address', value: 'Antananarivo, Madagascar' },
            { key: 'bar_phone', value: '+261 34 00 000 00' },
            { key: 'bar_email', value: 'contact@barlounge.mg' },
            { key: 'currency', value: 'Ar' },
            { key: 'currency_symbol', value: 'Ar' },
            { key: 'invoice_header', value: 'Le Bar Lounge - Facture' },
            { key: 'primary_color', value: '#6366f1' },
            { key: 'secondary_color', value: '#8b5cf6' },
            { key: 'logo', value: '' },
        ]);
        console.log('✅ Settings created');

        console.log('\n🎉 Seeding complete!');
        console.log('Admin: admin@bar.com / admin123');
        console.log('Vendeur: vendeur@bar.com / vendeur123');
        console.log('Caissier: caissier@bar.com / caissier123');

        process.exit(0);
    } catch (err) {
        console.error('❌ Seeding error:', err);
        process.exit(1);
    }
}

seed();
