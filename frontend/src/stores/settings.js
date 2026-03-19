import { defineStore } from 'pinia';
import api from '@/services/api';

export const useSettingsStore = defineStore('settings', {
  state: () => ({
    settings: {},
    loaded: false,
  }),
  actions: {
    async load() {
      if (this.loaded) return;
      try {
        const { data } = await api.get('/client/settings');
        if (data.success) {
          this.settings = data.data.settings;
          this.loaded = true;
        }
      } catch {}
    },
  },
});
