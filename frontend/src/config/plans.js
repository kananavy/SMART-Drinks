/**
 * BAR POS — Définition des plans d'abonnement
 * Chaque plan définit : prix, features autorisées, limites d'utilisation
 */

export const PLANS = {
  free: {
    id: 'free',
    name: 'Gratuit',
    price: 0,
    period: null,
    color: '#64748b',
    gradient: 'linear-gradient(135deg, #475569, #64748b)',
    icon: '🆓',
    badge: null,
    description: 'Pour découvrir la plateforme',
    features: ['orders', 'menu', 'payments'],
    limits: { products: 20, categories: 5, users: 3 },
    featureList: [
      '✓ Gestion des commandes',
      '✓ Menu client digital',
      '✓ Encaissement basique',
      '✓ 20 produits maximum',
      '✓ 3 utilisateurs maximum',
      '✗ Statistiques',
      '✗ Gestion des stocks',
      '✗ Facturation PDF',
    ],
    publicFeatureList: [
      'Commandes & Menu digital',
      'Encaissement basique',
      '20 produits / 3 utilisateurs',
    ],
  },

  starter: {
    id: 'starter',
    name: 'Starter',
    price: 9900,
    period: 'mois',
    color: '#6366f1',
    gradient: 'linear-gradient(135deg, #6366f1, #818cf8)',
    icon: '🚀',
    badge: null,
    description: 'Pour les petits établissements',
    features: ['orders', 'menu', 'payments', 'billing', 'stats_basic'],
    limits: { products: 100, categories: 20, users: 10 },
    featureList: [
      '✓ Tout le plan Gratuit',
      '✓ Facturation & reçus PDF',
      '✓ Statistiques basiques',
      '✓ 100 produits maximum',
      '✓ 10 utilisateurs maximum',
      '✓ Support par email',
      '✗ Statistiques avancées',
      '✗ Gestion des stocks',
    ],
    publicFeatureList: [
      'Tout ce qui est Gratuit',
      'Facturation PDF & reçus',
      'Statistiques basiques',
      '100 produits / 10 utilisateurs',
      'Support par email',
    ],
  },

  pro: {
    id: 'pro',
    name: 'Pro',
    price: 29900,
    period: 'mois',
    color: '#8b5cf6',
    gradient: 'linear-gradient(135deg, #6366f1, #a855f7)',
    icon: '⭐',
    badge: 'Populaire',
    description: 'Pour les établissements en croissance',
    features: [
      'orders', 'menu', 'payments', 'billing',
      'stats_basic', 'stats_advanced', 'stock',
      'activity_log', 'users', 'custom_branding',
    ],
    limits: { products: 500, categories: 50, users: 50 },
    featureList: [
      '✓ Tout le plan Starter',
      '✓ Statistiques avancées & graphiques',
      '✓ Gestion des stocks avancée',
      '✓ Journal d\'activité complet',
      '✓ Gestion des utilisateurs & rôles',
      '✓ Branding personnalisé',
      '✓ 500 produits maximum',
      '✓ 50 utilisateurs maximum',
    ],
    publicFeatureList: [
      'Tout ce qui est Starter',
      'Statistiques avancées & graphiques',
      'Gestion stocks & alertes',
      'Journal d\'activité & audit',
      'Gestion utilisateurs & rôles',
      'Branding personnalisé',
      '500 produits / 50 utilisateurs',
    ],
  },

  enterprise: {
    id: 'enterprise',
    name: 'Enterprise',
    price: 79900,
    period: 'mois',
    color: '#f59e0b',
    gradient: 'linear-gradient(135deg, #d97706, #f59e0b)',
    icon: '👑',
    badge: 'Premium',
    description: 'Pour les grandes enseignes',
    features: [
      'orders', 'menu', 'payments', 'billing',
      'stats_basic', 'stats_advanced', 'stock',
      'activity_log', 'users', 'custom_branding',
      'api', 'advanced_reports', 'priority_support', 'white_label',
    ],
    limits: { products: -1, categories: -1, users: -1 },
    featureList: [
      '✓ Tout le plan Pro',
      '✓ Accès API complet',
      '✓ Rapports avancés & export Excel',
      '✓ White-label (marque blanche)',
      '✓ Produits & catégories illimités',
      '✓ Utilisateurs illimités',
      '✓ Support dédié 24/7',
      '✓ Formation & onboarding inclus',
    ],
    publicFeatureList: [
      'Tout ce qui est Pro',
      'Accès API complet',
      'Rapports & export Excel',
      'White-label (marque blanche)',
      'Tout illimité',
      'Support dédié 24/7 + Formation',
    ],
  },
};

/** Labels lisibles pour chaque feature */
export const FEATURE_LABELS = {
  orders:           'Gestion des commandes',
  menu:             'Menu client digital',
  payments:         'Encaissement',
  billing:          'Facturation PDF',
  stats_basic:      'Statistiques basiques',
  stats_advanced:   'Statistiques avancées',
  stock:            'Gestion des stocks',
  activity_log:     'Journal d\'activité',
  users:            'Gestion des utilisateurs',
  custom_branding:  'Branding personnalisé',
  api:              'Accès API',
  advanced_reports: 'Rapports avancés',
  priority_support: 'Support prioritaire',
  white_label:      'White-label',
};

export const ALL_FEATURES = Object.keys(FEATURE_LABELS);

/** Récupère un plan par son ID (fallback: free) */
export const getPlan = (planId) => PLANS[planId] || PLANS.free;

/** Plans triés par prix croissant */
export const PLANS_LIST = Object.values(PLANS).sort((a, b) => a.price - b.price);

/** Plans affichés publiquement (sans 'free') */
export const PUBLIC_PLANS = PLANS_LIST.filter(p => p.id !== 'free');
