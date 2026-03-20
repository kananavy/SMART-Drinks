import { createRouter, createWebHistory } from 'vue-router';
import { useAuthStore } from '@/stores/auth';

// Route access by role
const roleDefaultRoutes = {
  vendeur: '/admin/orders',
  caissier: '/admin/payments',
  admin: '/admin/statistics',
  superadmin: '/admin/statistics',
};

const routeRoles = {
  'admin-orders': ['vendeur', 'admin', 'superadmin'],
  'create-order': ['vendeur', 'admin', 'superadmin'],
  'admin-payments': ['caissier', 'admin', 'superadmin'],
  'admin-users': ['admin', 'superadmin'],
  'admin-user-permissions': ['superadmin'],
  'admin-roles': ['superadmin'],
  'admin-categories': ['admin', 'superadmin'],
  'admin-products': ['admin', 'superadmin'],
  'admin-stock': ['admin', 'superadmin'],
  'admin-stats': ['admin', 'superadmin'],
  'admin-logs': ['admin', 'superadmin'],
  'admin-billing': ['admin', 'superadmin', 'caissier'],
  'admin-settings': ['admin', 'superadmin'],
  'admin-plans': ['superadmin'],
};

const routes = [
    // ── Public Routes ──
    { path: '/', name: 'landing', component: () => import('@/pages/client/LandingPage.vue') },
    { path: '/register', name: 'register', component: () => import('@/pages/client/RegisterPage.vue') },
    { path: '/login', name: 'login', component: () => import('@/pages/client/LoginPage.vue') },
    { path: '/login/admin', name: 'admin-login', component: () => import('@/pages/admin/AdminLogin.vue') },

    // ── Client Routes ──
    {
        path: '/client',
        component: () => import('@/layouts/ClientLayout.vue'),
        meta: { requiresAuth: true, role: 'client' },
        children: [
            { path: 'menu', name: 'client-menu', component: () => import('@/pages/client/MenuPage.vue') },
            { path: 'orders', name: 'client-orders', component: () => import('@/pages/client/OrderHistory.vue') },
            { path: 'payments', name: 'client-payments', component: () => import('@/pages/client/PaymentHistory.vue') },
        ],
    },

    // ── Admin Routes ──
    {
        path: '/admin',
        component: () => import('@/layouts/AdminLayout.vue'),
        meta: { requiresAuth: true, adminOnly: true },
        children: [
            // Vendor
            { path: 'orders', name: 'admin-orders', component: () => import('@/pages/admin/vendor/OrdersBoard.vue') },
            { path: 'orders/create', name: 'create-order', component: () => import('@/pages/admin/vendor/CreateOrder.vue') },
            // Cashier
            { path: 'payments', name: 'admin-payments', component: () => import('@/pages/admin/cashier/PaymentQueue.vue') },
            // Super Admin
            { path: 'users', name: 'admin-users', component: () => import('@/pages/admin/users/UserManagement.vue') },
            { path: 'users/:id/permissions', name: 'admin-user-permissions', component: () => import('@/pages/admin/users/PermissionManagement.vue') },
            { path: 'roles', name: 'admin-roles', component: () => import('@/pages/admin/users/RoleManagement.vue') },
            { path: 'categories', name: 'admin-categories', component: () => import('@/pages/admin/stock/CategoryManagement.vue') },
            { path: 'products', name: 'admin-products', component: () => import('@/pages/admin/stock/ProductManagement.vue') },
            { path: 'stock', name: 'admin-stock', component: () => import('@/pages/admin/stock/StockDashboard.vue') },
            { path: 'statistics', name: 'admin-stats', component: () => import('@/pages/admin/stats/StatsDashboard.vue') },
            { path: 'settings', name: 'admin-settings', component: () => import('@/pages/admin/settings/AppSettings.vue') },
            { path: 'activity-log', name: 'admin-logs', component: () => import('@/pages/admin/ActivityLog.vue') },
            { name: 'admin-billing', path: 'billing', component: () => import('@/pages/admin/BillingManagement.vue') },
            { path: 'plans', name: 'admin-plans', component: () => import('@/pages/admin/plans/PlanManagement.vue') },
        ],
    },
];

const router = createRouter({
    history: createWebHistory(),
    routes,
    scrollBehavior: () => ({ top: 0 }),
});

router.beforeEach((to, from, next) => {
    const auth = useAuthStore();

    // Require auth
    if (to.meta.requiresAuth && !auth.isAuthenticated) {
        return next(to.meta.adminOnly ? '/login/admin' : '/login');
    }

    // Admin-only check
    if (to.meta.adminOnly && !auth.isAdmin) {
        return next('/');
    }

    // Client role check
    if (to.meta.role && auth.user?.role !== to.meta.role) {
        return next(auth.isAdmin ? (roleDefaultRoutes[auth.userRole] || '/admin/payments') : '/');
    }

    // Role-based route access check
    if (to.name && routeRoles[to.name]) {
        const allowed = routeRoles[to.name];
        if (!allowed.includes(auth.userRole)) {
            const fallback = roleDefaultRoutes[auth.userRole] || '/login/admin';
            return next(fallback);
        }
    }

    next();
});

export default router;
