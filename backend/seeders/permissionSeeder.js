const { Permission, User, UserPermission } = require('../models');

const seedPermissions = async () => {
    const perms = [
        { name: 'orders.view', label: 'Voir les commandes', category: 'commandes' },
        { name: 'orders.confirm', label: 'Confirmer les commandes', category: 'commandes' },
        { name: 'orders.validate', label: 'Valider les commandes', category: 'commandes' },
        { name: 'orders.create', label: 'Créer des commandes', category: 'commandes' },
        { name: 'payments.manage', label: 'Gérer les paiements', category: 'paiements' },
        { name: 'products.manage', label: 'Gérer les produits', category: 'inventaire' },
        { name: 'stock.manage', label: 'Gérer le stock', category: 'inventaire' },
        { name: 'users.manage', label: 'Gérer les utilisateurs', category: 'administration' },
        { name: 'stats.view', label: 'Voir les statistiques', category: 'administration' },
        { name: 'settings.manage', label: 'Gérer les paramètres', category: 'administration' },
    ];

    console.log('🌱 Seeding permissions...');
    for (const p of perms) {
        await Permission.findOrCreate({ where: { name: p.name }, defaults: p });
    }

    // Default permissions for roles if needed, though hasPermission handles superadmin
    console.log('✅ Permissions seeded');
};

module.exports = seedPermissions;
