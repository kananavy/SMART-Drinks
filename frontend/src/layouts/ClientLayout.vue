<template>
  <div class="client-layout-premium pb-20 md:pb-0">
    <header class="glass sticky top-0 z-[100] px-4 py-3 md:px-8 border-b border-color">
      <div class="layout-container flex items-center justify-between gap-3">
        <!-- Logo + Bar name -->
        <div class="flex items-center gap-3 min-w-0">
          <img v-if="appSettings.logo" :src="appSettings.logo" class="h-8 object-contain flex-shrink-0" />
          <span v-else class="text-2xl flex-shrink-0">🍸</span>
          <div class="flex flex-col leading-none min-w-0">
            <span class="font-display font-extrabold text-sm md:text-base uppercase italic tracking-tight truncate">
              {{ appSettings.bar_name || 'LE BAR LOUNGE' }}
            </span>
            <div v-if="appSettings.bar_slogan" class="hidden sm:block">
              <span class="text-[9px] text-muted font-medium italic truncate">{{ appSettings.bar_slogan }}</span>
            </div>
          </div>
        </div>

        <!-- Table session badge -->
        <div v-if="session" class="hidden sm:flex items-center gap-2 glass px-3 py-1.5 rounded-full border border-success/20 flex-shrink-0">
          <span class="w-1.5 h-1.5 rounded-full bg-success animate-pulse"></span>
          <span class="text-[10px] text-success font-bold uppercase tracking-widest">{{ session.table_name }}</span>
        </div>

        <!-- User + Logout -->
        <div class="flex items-center gap-3 flex-shrink-0">
          <div v-if="auth.user" class="hidden sm:flex flex-col items-end leading-none">
            <span class="text-[10px] text-secondary font-bold uppercase">{{ auth.user.name }}</span>
            <span v-if="session" class="text-[9px] text-muted sm:hidden">{{ session.table_name }}</span>
          </div>
          <button @click="handleLogout"
            class="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-danger/20 text-danger hover:bg-danger/10 transition-all text-[10px] font-black uppercase tracking-widest"
            title="Déconnexion">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4M16 17l5-5-5-5M21 12H9"/>
            </svg>
            <span class="hidden sm:inline">Quitter</span>
          </button>
        </div>
      </div>
    </header>

    <main class="layout-container py-6 min-h-[calc(100vh-140px)]">
      <router-view v-slot="{ Component }">
        <transition name="page" mode="out-in">
          <component :is="Component" />
        </transition>
      </router-view>
    </main>

    <!-- Mobile Bottom Navigation -->
    <nav class="md:hidden fixed bottom-0 left-0 right-0 glass-heavy border-t border-bright h-[75px] z-[200] px-6 py-2 flex justify-around items-center rounded-t-3xl shadow-glow">
      <router-link to="/client/menu" class="nav-item-mobile" active-class="active">
        <div class="icon">📋</div>
        <span>Menu</span>
      </router-link>
      <router-link to="/client/orders" class="nav-item-mobile" active-class="active">
        <div class="icon">📦</div>
        <span>Commandes</span>
      </router-link>
      <router-link to="/client/payments" class="nav-item-mobile" active-class="active">
        <div class="icon">💳</div>
        <span>Paiements</span>
      </router-link>
    </nav>
  </div>
</template>

<script setup>
import { computed, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '@/stores/auth';
import { useToastStore } from '@/stores/toast';
import { useSettingsStore } from '@/stores/settings';

const router = useRouter();
const auth = useAuthStore();
const toast = useToastStore();
const settingsStore = useSettingsStore();

const session = computed(() => auth.session);
const appSettings = computed(() => settingsStore.settings);

onMounted(() => settingsStore.load());

const handleLogout = () => {
  auth.logout();
  toast.info('Deconnecte');
  router.push('/');
};
</script>

<style scoped>
.shadow-glow {
  box-shadow: 0 -4px 20px rgba(99, 102, 241, 0.15);
}
</style>
