import { defineStore } from 'pinia';
import api from '@/services/api';
import { usePermissionsStore } from '@/stores/permissions';

export const useAuthStore = defineStore('auth', {
    state: () => ({
        user: JSON.parse(localStorage.getItem('bar_user') || 'null'),
        token: localStorage.getItem('bar_token') || null,
        session: JSON.parse(localStorage.getItem('bar_session') || 'null'),
    }),

    getters: {
        isAuthenticated: (state) => !!state.token,
        isAdmin: (state) => ['vendeur', 'caissier', 'admin', 'superadmin'].includes(state.user?.role),
        isClient: (state) => state.user?.role === 'client',
        userRole: (state) => state.user?.role || null,
    },

    actions: {
        setAuth(data) {
            this.token = data.token;
            this.user = data.user;
            this.session = data.session || null;
            localStorage.setItem('bar_token', data.token);
            localStorage.setItem('bar_user', JSON.stringify(data.user));
            if (data.session) {
                localStorage.setItem('bar_session', JSON.stringify(data.session));
            }
        },

        logout() {
            this.token = null;
            this.user = null;
            this.session = null;
            localStorage.removeItem('bar_token');
            localStorage.removeItem('bar_user');
            localStorage.removeItem('bar_session');
            // The permissions store will be reset implicitly on next page load
            // as the user will be null.
            usePermissionsStore().reset();
        },

        async loginAdmin(email, password) {
            const { data } = await api.post('/auth/login', { email, password });
            if (data.success) {
                this.setAuth(data.data);
                await usePermissionsStore().initialize(data.data.user);
            }
            return data;
        },

        async loginClient(table_name, contact, access_code) {
            const { data } = await api.post('/auth/login/client', { table_name, contact, access_code });
            if (data.success) {
                this.setAuth(data.data);
                await usePermissionsStore().initialize(data.data.user);
            }
            return data;
        },

        async registerClient(formData) {
            const { data } = await api.post('/auth/register', formData);
            if (data.success) {
                this.setAuth(data.data);
                await usePermissionsStore().initialize(data.data.user);
            }
            return data;
        },

        // Initialize permissions on app bootstrap
        async initializePermissions() {
            if (this.token && this.user) {
                const permissionsStore = usePermissionsStore();
                await permissionsStore.initialize(this.user);
            }
        },
    },
});