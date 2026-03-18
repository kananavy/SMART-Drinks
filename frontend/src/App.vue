<template>
  <div id="app">
    <ToastContainer />
    <router-view v-slot="{ Component }">
      <transition name="page" mode="out-in">
        <component :is="Component" />
      </transition>
    </router-view>
  </div>
</template>

<script setup>
import { onMounted } from 'vue';
import ToastContainer from '@/components/ToastContainer.vue';
import api from '@/services/api';

const applyTheme = (settings) => {
  if (!settings) return;
  const root = document.documentElement.style;
  const { primary_color, secondary_color, font_family, base_font_size, bg_style } = settings;

  if (primary_color) {
    root.setProperty('--primary-color', primary_color);
    root.setProperty('--primary-light-color', primary_color + 'aa');
    root.setProperty('--primary-dark-color', primary_color);
  }
  if (secondary_color) root.setProperty('--secondary-color', secondary_color);
  if (font_family) root.setProperty('--font-primary', font_family);
  if (base_font_size) root.setProperty('--base-font-size', base_font_size);
  
  if (bg_style === 'black') root.setProperty('--color-bg-primary', '#000000');
  else if (bg_style === 'gradient') root.setProperty('--color-bg-primary', '#0a0a1a');
  else root.setProperty('--color-bg-primary', '#0f0f23');
};

onMounted(async () => {
  try {
    // Use public endpoint so unauthenticated pages (landing, login) don't trigger 401 redirect loop
    const { data } = await api.get('/client/settings');
    if (data.success && data.data.settings) {
      applyTheme(data.data.settings);
    }
  } catch (err) {
    // Ignore — settings are optional
  }
});
</script>

<style>
#app {
  min-height: 100vh;
}
</style>
