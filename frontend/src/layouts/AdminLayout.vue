<template>
  <div class="admin-layout-premium flex min-h-screen">
    <!-- Sidebar -->
    <aside :class="['sidebar-glass border-r border-color transition-all duration-500 z-[200]', { 'w-[280px] p-6': !sidebarCollapsed, 'w-[80px] p-4': sidebarCollapsed }]">
      <div class="sidebar-header flex items-center justify-between mb-10 pb-6 border-b border-color">
        <div class="flex items-center gap-3">
          <span class="text-3xl">🍸</span>
          <div v-if="!sidebarCollapsed" class="flex flex-col leading-none">
            <span class="font-display font-black text-xl tracking-tight uppercase italic">BAR ADMIN</span>
            <span class="text-[9px] text-primary font-bold tracking-[0.2em] mt-1 uppercase">Control Panel</span>
          </div>
        </div>
        <button @click="sidebarCollapsed = !sidebarCollapsed" class="p-2 hover:bg-white/5 rounded-full transition-colors text-muted hover:text-white">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" :d="sidebarCollapsed ? 'M13 5l7 7-7 7M5 5l7 7-7 7' : 'M11 19l-7-7 7-7M19 19l-7-7 7-7'" /></svg>
        </button>
      </div>

      <nav class="sidebar-nav space-y-1">
        <router-link
          v-for="item in menuItems"
          :key="item.to"
          :to="item.to"
          :class="['nav-item group flex items-center gap-4 px-4 py-3 rounded-2xl transition-all duration-300', 
                   $route.path === item.to ? 'bg-primary text-white shadow-glow' : 'text-secondary hover:bg-white/5 hover:text-white']"
          v-show="item.roles.includes(userRole)"
        >
          <span class="text-xl group-hover:scale-110 transition-transform">{{ item.icon }}</span>
          <span v-if="!sidebarCollapsed" class="font-bold text-sm tracking-tight">{{ item.label }}</span>
        </router-link>
      </nav>

      <div class="sidebar-footer mt-auto pt-6 border-t border-color flex flex-col gap-4">
        <div v-if="!sidebarCollapsed" class="user-block glass p-4 rounded-2xl">
          <div class="flex items-center gap-3">
            <div class="w-8 h-8 rounded-full bg-gradient-to-tr from-primary to-secondary flex items-center justify-center text-[10px] font-black">{{ user?.name?.charAt(0) }}</div>
            <div class="flex flex-col">
              <span class="text-xs font-black truncate max-w-[120px]">{{ user?.name }}</span>
              <span class="text-[9px] text-primary uppercase font-bold">{{ roleLabel }}</span>
            </div>
          </div>
        </div>
        <button @click="handleLogout" class="flex items-center justify-center gap-3 p-3 rounded-2xl border border-danger/20 text-danger hover:bg-danger/10 transition-all font-bold text-xs uppercase tracking-widest">
          <span>🚪</span>
          <span v-if="!sidebarCollapsed">Déconnexion</span>
        </button>
      </div>
    </aside>

    <!-- Main Content -->
    <main :class="['flex-1 transition-all duration-500 overflow-y-auto min-h-screen', { 'ml-0': true }]">
       <div class="layout-container py-10 px-6 md:px-12">
          <router-view v-slot="{ Component }">
            <transition name="page" mode="out-in">
              <component :is="Component" />
            </transition>
          </router-view>
       </div>
    </main>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '@/stores/auth';
import { useToastStore } from '@/stores/toast';

const router = useRouter();
const auth = useAuthStore();
const toast = useToastStore();
const sidebarCollapsed = ref(false);

const user = computed(() => auth.user);
const userRole = computed(() => auth.userRole);
const roleLabel = computed(() => ({
  vendeur: 'Vendeur',
  caissier: 'Caissier',
  superadmin: 'Super Admin',
}[userRole.value] || userRole.value));

const menuItems = [
  { to: '/admin/orders', icon: '📋', label: 'Commandes', roles: ['vendeur', 'caissier', 'superadmin'] },
  { to: '/admin/orders/create', icon: '➕', label: 'Nouvelle Commande', roles: ['vendeur', 'superadmin'] },
  { to: '/admin/payments', icon: '💳', label: 'Paiements', roles: ['caissier', 'superadmin'] },
  { to: '/admin/categories', icon: '📂', label: 'Catégories', roles: ['superadmin'] },
  { to: '/admin/products', icon: '📦', label: 'Produits', roles: ['superadmin'] },
  { to: '/admin/stock', icon: '🏪', label: 'Stock', roles: ['superadmin'] },
  { to: '/admin/users', icon: '👥', label: 'Utilisateurs', roles: ['superadmin'] },
  { to: '/admin/statistics', icon: '📊', label: 'Statistiques', roles: ['superadmin'] },
  { to: '/admin/activity-log', icon: '📜', label: 'Journaux', roles: ['superadmin'] },
  { to: '/admin/billing', icon: '🧾', label: 'Facturation', roles: ['superadmin', 'caissier'] },
  { to: '/admin/settings', icon: '⚙️', label: 'Paramètres', roles: ['superadmin'] },
];

const handleLogout = () => {
  auth.logout();
  toast.info('Déconnecté');
  router.push('/login/admin');
};
</script>

<style scoped>
.admin-layout-premium { 
  background: var(--bg-primary);
  background-image: 
    radial-gradient(circle at 0% 0%, rgba(129, 140, 248, 0.03) 0%, transparent 50%),
    radial-gradient(circle at 100% 100%, rgba(192, 132, 252, 0.03) 0%, transparent 50%);
}

.sidebar-glass {
  background: rgba(10, 10, 26, 0.6);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  display: flex;
  flex-direction: column;
  position: sticky;
  top: 0;
  height: 100vh;
}

.shadow-glow {
  box-shadow: 0 4px 20px rgba(129, 140, 248, 0.3);
}

.nav-item {
  position: relative;
  overflow: hidden;
}

@media (max-width: 768px) {
  .sidebar-glass { display: none; }
}
</style>
