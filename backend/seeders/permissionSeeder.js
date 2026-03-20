const { Permission } = require('../models');

const seedPermissions = async () => {
    const perms = [
        // Commandes
        { name: 'orders.view', label: 'Voir les commandes', category: 'Commandes' },
        { name: 'orders.create', label: 'Créer des commandes', category: 'Commandes' },
        { name: 'orders.confirm', label: 'Confirmer les commandes', category: 'Commandes' },
        { name: 'orders.validate', label: 'Valider les commandes', category: 'Commandes' },
        { name: 'orders.cancel', label: 'Annuler les commandes', category: 'Commandes' },
        { name: 'orders.view.readonly', label: 'Voir commandes (lecture seule)', category: 'Commandes' },

        // Paiements
        { name: 'payments.view', label: 'Voir les paiements', category: 'Paiements' },
        { name: 'payments.manage', label: 'Traiter les paiements', category: 'Paiements' },
        { name: 'billing.view', label: 'Voir la facturation', category: 'Paiements' },
        { name: 'billing.export', label: 'Exporter la facturation', category: 'Paiements' },

        // Administration
        { name: 'users.view', label: 'Voir les utilisateurs', category: 'Administration' },
        { name: 'users.create', label: 'Créer des utilisateurs', category: 'Administration' },
        { name: 'users.edit', label: 'Modifier des utilisateurs', category: 'Administration' },
        { name: 'users.delete', label: 'Supprimer des utilisateurs', category: 'Administration' },
        { name: 'permissions.manage', label: 'Gérer les permissions & rôles', category: 'Administration' },

        // Inventaire
        { name: 'products.view', label: 'Voir les produits', category: 'Inventaire' },
        { name: 'products.create', label: 'Créer des produits', category: 'Inventaire' },
        { name: 'products.edit', label: 'Modifier des produits', category: 'Inventaire' },
        { name: 'products.delete', label: 'Supprimer des produits', category: 'Inventaire' },
        
        { name: 'categories.view', label: 'Voir les catégories', category: 'Inventaire' },
        { name: 'categories.create', label: 'Créer des catégories', category: 'Inventaire' },
        { name: 'categories.edit', label: 'Modifier des catégories', category: 'Inventaire' },
        { name: 'categories.delete', label: 'Supprimer des catégories', category: 'Inventaire' },
        
        { name: 'stock.view', label: 'Voir le stock', category: 'Inventaire' },
        { name: 'stock.manage', label: 'Gérer le stock', category: 'Inventaire' },

        // Rapports
        { name: 'stats.view', label: 'Voir les statistiques', category: 'Rapports' },

        // Configuration
        { name: 'settings.view', label: 'Voir les paramètres', category: 'Configuration' },
        { name: 'settings.edit', label: 'Modifier les paramètres', category: 'Configuration' },
        { name: 'activity.view', label: "Voir les journaux d'activité", category: 'Configuration' },
        { name: 'plans.manage', label: 'Gérer les plans', category: 'Configuration' },
    ];

    console.log('🌱 Seeding permissions...');
    for (const p of perms) {
        await Permission.findOrCreate({ where: { name: p.name }, defaults: p });
    }
    console.log('✅ Permissions seeded');
};

module.exports = seedPermissions;
