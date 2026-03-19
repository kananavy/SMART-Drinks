import { createRouter, createWebHistory } from 'vue-router';
import { useAuthStore } from '@/stores/auth';

const routes = [
    // ── Client Routes ──
    { path: '/', name: 'landing', component: () => import('@/pages/client/LandingPage.vue') },
    { path: '/register', name: 'register', component: () => import('@/pages/client/RegisterPage.vue') },
    { path: '/login', name: 'login', component: () => import('@/pages/client/LoginPage.vue') },
    { path: '/login/admin', name: 'admin-login', component: () => import('@/pages/admin/AdminLogin.vue') },
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

// Navigation guards
router.beforeEach((to, from, next) => {
    const auth = useAuthStore();

    if (to.meta.requiresAuth && !auth.isAuthenticated) {
        return next(to.meta.adminOnly ? '/login/admin' : '/login');
    }

    if (to.meta.adminOnly && !auth.isAdmin) {
        return next('/');
    }

    if (to.meta.role && auth.user?.role !== to.meta.role) {
        return next(auth.isAdmin ? '/admin/orders' : '/');
    }

    next();
});

export default router;
