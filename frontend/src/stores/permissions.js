import { defineStore } from 'pinia';
import api from '@/services/api';

// Default permissions by role (frontend-side fallback)
const ROLE_DEFAULT_PERMISSIONS = {
  superadmin: [
    'view-orders', 'create-orders', 'confirm-orders', 'validate-orders', 'cancel-orders',
    'view-payments', 'process-payments', 'view-billing', 'export-billing',
    'view-users', 'create-users', 'edit-users', 'delete-users',
    'manage-permissions',
    'view-products', 'create-products', 'edit-products', 'delete-products',
    'view-categories', 'create-categories', 'edit-categories', 'delete-categories',
    'view-stock', 'manage-stock',
    'view-statistics',
    'view-settings', 'edit-settings',
    'view-activity-log',
    'manage-plans',
  ],
  admin: [
    'view-orders', 'create-orders', 'confirm-orders', 'validate-orders', 'cancel-orders',
    'view-payments', 'process-payments', 'view-billing', 'export-billing',
    'view-users', 'create-users', 'edit-users',
    'view-products', 'create-products', 'edit-products', 'delete-products',
    'view-categories', 'create-categories', 'edit-categories', 'delete-categories',
    'view-stock', 'manage-stock',
    'view-statistics',
    'view-settings',
    'view-activity-log',
  ],
  vendeur: [
    'view-orders', 'create-orders', 'confirm-orders', 'validate-orders', 'cancel-orders',
    'view-products', 'view-categories',
  ],
  caissier: [
    'view-payments', 'process-payments',
    'view-billing', 'export-billing',
    'view-orders-readonly',
  ],
  client: [
    'view-menu', 'place-orders', 'view-own-orders', 'view-own-payments',
  ],
};

export const usePermissionsStore = defineStore('permissions', {
  state: () => ({
    permissions: [],      // List of granted permission names for current user
    role: null,           // Current user's role
    loaded: false,
    loading: false,
  }),

  getters: {
    can: (state) => (permission) => {
      if (!state.role) return false;
      // Superadmin has all permissions
      if (state.role === 'superadmin') return true;
      return state.permissions.includes(permission);
    },

    cannot: (state) => (permission) => {
      if (!state.role) return true;
      if (state.role === 'superadmin') return false;
      return !state.permissions.includes(permission);
    },

    hasRole: (state) => (roleName) => {
      return state.role === roleName;
    },

    hasAnyRole: (state) => (roles) => {
      return roles.includes(state.role);
    },

    hasAllPermissions: (state) => (perms) => {
      if (state.role === 'superadmin') return true;
      return perms.every(p => state.permissions.includes(p));
    },
  },

  actions: {
    // Initialize permissions for a user (call after login or on app load)
    async initialize(user) {
      if (!user) { this.reset(); return; }
      if (this.loaded && this.role === user.role) return; // Already loaded for this user

      this.role = user.role;
      this.loading = true;

      try {
        if (user.role === 'client') {
          this.permissions = ROLE_DEFAULT_PERMISSIONS.client;
        } else {
          // Load effective permissions from backend
          const { data } = await api.get('/auth/permissions');
          if (data.success) {
            this.permissions = data.data.permissions;
          } else {
            // Fallback to frontend defaults on error
            this.permissions = ROLE_DEFAULT_PERMISSIONS[user.role] || [];
          }
        }
      } catch {
        // Fallback to frontend defaults on network error
        this.permissions = ROLE_DEFAULT_PERMISSIONS[user.role] || [];
      } finally {
        this.loaded = true;
        this.loading = false;
      }
    },

    reset() {
      this.permissions = [];
      this.role = null;
      this.loaded = false;
    },
  },
});