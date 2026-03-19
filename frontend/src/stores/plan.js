import { defineStore } from 'pinia';
import api from '@/services/api';
import { getPlan } from '@/config/plans';

export const usePlanStore = defineStore('plan', {
  state: () => ({
    currentPlanId: 'free',
    expiresAt: null,
    planHolder: '',
    planKey: '',
    loaded: false,
  }),

  getters: {
    plan: (state) => getPlan(state.currentPlanId),

    isExpired: (state) => {
      if (!state.expiresAt || state.currentPlanId === 'free') return false;
      return new Date(state.expiresAt) < new Date();
    },

    isActive: (state) => {
      if (state.currentPlanId === 'free') return true;
      if (!state.expiresAt) return true;
      return new Date(state.expiresAt) >= new Date();
    },

    hasFeature: (state) => (feature) => {
      if (!feature) return true; // null feature = always accessible
      // If plan is expired, fall back to free plan features
      const effectivePlanId = state.isExpired ? 'free' : state.currentPlanId;
      return getPlan(effectivePlanId).features.includes(feature);
    },

    daysRemaining: (state) => {
      if (!state.expiresAt || state.currentPlanId === 'free') return null;
      const diff = new Date(state.expiresAt) - new Date();
      return Math.ceil(diff / (1000 * 60 * 60 * 24));
    },

    planBadgeColor: (state) => {
      if (state.isExpired) return '#ef4444';
      return getPlan(state.currentPlanId).color;
    },

    statusLabel: (state) => {
      if (state.currentPlanId === 'free') return 'Actif (Gratuit)';
      if (state.isExpired) return 'Expiré';
      const days = state.daysRemaining;
      if (days !== null && days <= 7) return `Expire dans ${days}j`;
      return 'Actif';
    },
  },

  actions: {
    async load() {
      if (this.loaded) return;
      try {
        const { data } = await api.get('/admin/settings');
        if (data.success) {
          const s = data.data.settings;
          this.currentPlanId = s.current_plan || 'free';
          this.expiresAt = s.plan_expires_at || null;
          this.planHolder = s.plan_holder || '';
          this.planKey = s.plan_key || '';
          this.loaded = true;
        }
      } catch {}
    },

    async savePlan({ planId, expiresAt, planHolder, planKey }) {
      await api.put('/admin/settings', {
        current_plan: planId,
        plan_expires_at: expiresAt || '',
        plan_holder: planHolder || '',
        plan_key: planKey || '',
      });
      this.currentPlanId = planId;
      this.expiresAt = expiresAt || null;
      this.planHolder = planHolder || '';
      this.planKey = planKey || '';
    },

    reset() {
      this.loaded = false;
    },
  },
});
