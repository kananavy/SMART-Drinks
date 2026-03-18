<template>
  <div class="client-layout-premium pb-20 md:pb-0">
    <!-- Desktop Header / Mobile Header -->
    <header class="client-header glass sticky top-0 z-[100] px-4 py-3 md:px-8">
      <div class="layout-container flex items-center justify-between">
        <div class="flex items-center gap-3">
          <span class="text-2xl">🍸</span>
          <div class="flex flex-col leading-none">
            <span class="font-display font-extrabold text-sm md:text-lg uppercase italic tracking-tight">LE BAR LOUNGE</span>
            <div class="flex items-center gap-2" v-if="session">
               <span class="w-1.5 h-1.5 rounded-full bg-success"></span>
               <span class="text-[9px] text-secondary font-bold uppercase tracking-widest">Table: {{ session.table_name }}</span>
            </div>
          </div>
        </div>
        
        <div class="flex items-center gap-4">
          <div v-if="auth.user" class="hidden sm:flex flex-col items-end leading-none">
            <span class="text-[10px] text-secondary font-bold uppercase mb-1">Client</span>
            <span class="text-xs font-semibold">{{ auth.user.name }}</span>
          </div>
          <button @click="handleLogout" class="p-2 hover:bg-white/5 rounded-lg transition-colors text-danger" title="Déconnexion">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4M16 17l5-5-5-5M21 12H9"/></svg>
          </button>
        </div>
      </div>
    </header>

    <!-- Main Content -->
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
import { computed } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '@/stores/auth';
import { useToastStore } from '@/stores/toast';

const router = useRouter();
const auth = useAuthStore();
const toast = useToastStore();

const session = computed(() => auth.session);

const handleLogout = () => {
  auth.logout();
  toast.info('Déconnecté');
  router.push('/');
};
</script>

<style scoped>
.client-layout { min-height: 100vh; }

.client-header {
  position: fixed; top: 0; left: 0; right: 0;
  z-index: 100;
  display: flex; align-items: center; justify-content: space-between;
  padding: 12px 30px;
  gap: 16px;
}

.header-left { display: flex; align-items: center; gap: 10px; }
.brand-icon { font-size: 24px; }
.header-brand { font-family: var(--font-display); font-size: 18px; font-weight: 800; }

.header-nav { display: flex; gap: 4px; }

.nav-item {
  padding: 8px 16px; border-radius: var(--radius-md);
  text-decoration: none; color: var(--text-secondary);
  font-size: 13px; font-weight: 500;
  transition: all 0.2s;
}

.nav-item:hover, .nav-item.active {
  color: var(--primary-light);
  background: rgba(99, 102, 241, 0.1);
}

.header-right { display: flex; align-items: center; gap: 12px; }

.session-info { padding: 6px 14px; font-size: 12px; }
.table-badge { font-weight: 600; }

.client-main { padding: 80px 30px 30px; max-width: 1200px; margin: 0 auto; }

@media (max-width: 768px) {
  .client-header {
    flex-wrap: wrap; padding: 10px 16px;
    justify-content: center; gap: 8px;
  }
  .header-brand { display: none; }
  .header-nav { order: 3; width: 100%; justify-content: center; }
  .client-main { padding: 130px 16px 16px; }
}
</style>
