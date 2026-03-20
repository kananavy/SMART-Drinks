<template>
  <div class="admin-layout-premium flex min-h-screen pb-16 md:pb-0">
    <!-- Sidebar (desktop) -->
    <aside :class="['sidebar-glass border-r border-color transition-all duration-500 z-[200] hidden md:flex flex-col', { 'w-[280px] p-6': !sidebarCollapsed, 'w-[80px] p-4': sidebarCollapsed }]">
      <div class="sidebar-header flex items-center justify-between mb-10 pb-6 border-b border-color">
        <div class="flex items-center gap-3">
          <span class="text-3xl">🍸</span>
          <div v-if="!sidebarCollapsed" class="flex flex-col leading-none">
            <span class="font-display font-black text-xl tracking-tight uppercase italic">BAR ADMIN</span>
            <span class="text-[9px] text-primary font-bold tracking-[0.2em] mt-1 uppercase">Control Panel</span>
          </div>
        </div>
        <button @click="sidebarCollapsed = !sidebarCollapsed" class="p-2 hover:bg-white/5 rounded-full transition-colors text-muted hover:text-white">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" :d="sidebarCollapsed ? 'M13 5l7 7-7 7M5 5l7 7-7 7' : 'M11 19l-7-7 7-7M19 19l-7-7 7-7'" />
          </svg>
        </button>
      </div>

      <nav class="sidebar-nav space-y-1">
        <router-link
          v-for="item in menuItems"
          :key="item.to"
          :to="item.locked ? '#' : item.to"
          @click.prevent="item.locked ? null : undefined"
          :class="['nav-item group flex items-center gap-4 px-4 py-3 rounded-2xl transition-all duration-300 relative',
                   $route.path === item.to ? 'bg-primary text-white shadow-glow' : item.locked ? 'text-muted opacity-50 cursor-not-allowed' : 'text-secondary hover:bg-white/5 hover:text-white']"
        >
          <span class="text-xl group-hover:scale-110 transition-transform flex-shrink-0">{{ item.icon }}</span>
          <span v-if="!sidebarCollapsed" class="font-bold text-sm tracking-tight flex-1">{{ item.label }}</span>
          <span v-if="!sidebarCollapsed && item.locked"
            class="text-[8px] font-black bg-warning/15 text-warning px-1.5 py-0.5 rounded-full uppercase border border-warning/20 flex-shrink-0">🔒</span>
          <!-- Tooltip on collapsed -->
          <span v-if="sidebarCollapsed"
            class="nav-tooltip absolute left-full ml-3 px-3 py-1.5 rounded-xl glass border border-white/10 text-xs font-bold whitespace-nowrap pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity z-50">
            {{ item.label }}{{ item.locked ? ' 🔒' : '' }}
          </span>
        </router-link>
      </nav>

      <div class="sidebar-footer mt-auto pt-6 border-t border-color flex flex-col gap-4">
        <!-- Plan status badge (superadmin) -->
        <div v-if="!sidebarCollapsed && userRole === 'superadmin' && planStore.loaded"
          class="plan-badge glass rounded-xl p-3 border flex items-center gap-2"
          :style="{ borderColor: planStore.plan.color + '40' }">
          <span class="text-base">{{ planStore.plan.icon }}</span>
          <div class="flex-1 min-w-0">
            <p class="text-[8px] font-black uppercase tracking-widest text-muted">Plan actif</p>
            <p class="text-xs font-black truncate" :style="{ color: planStore.plan.color }">{{ planStore.plan.name }}</p>
          </div>
          <div :class="['w-1.5 h-1.5 rounded-full flex-shrink-0', planStore.isActive ? 'bg-success' : 'bg-danger']"></div>
        </div>
        <!-- Expiry warning -->
        <div v-if="!sidebarCollapsed && userRole === 'superadmin' && planStore.daysRemaining !== null && planStore.daysRemaining <= 7 && planStore.daysRemaining > 0"
          class="glass rounded-xl px-3 py-2 border border-warning/30 text-[9px] font-bold text-warning text-center">
          ⚠️ Expire dans {{ planStore.daysRemaining }}j
        </div>

        <div v-if="!sidebarCollapsed" class="user-block glass p-4 rounded-2xl">
          <div class="flex items-center gap-3">
            <div class="w-8 h-8 rounded-full bg-gradient-to-tr from-primary to-secondary flex items-center justify-center text-[10px] font-black text-white">
              {{ user?.name?.charAt(0) }}
            </div>
            <div class="flex flex-col">
              <span class="text-xs font-black truncate max-w-[120px]">{{ user?.name }}</span>
              <span class="text-[9px] text-primary uppercase font-bold">{{ roleLabel }}</span>
            </div>
          </div>
        </div>
        <button @click="handleLogout" class="flex items-center justify-center gap-3 p-3 rounded-2xl border border-danger/20 text-danger hover:bg-danger/10 transition-all font-bold text-xs uppercase tracking-widest">
          <span>🚪</span>
          <span v-if="!sidebarCollapsed">Deconnexion</span>
        </button>
      </div>
    </aside>

    <!-- Main Content -->
    <main class="flex-1 transition-all duration-500 overflow-y-auto min-h-screen">
      <div class="layout-container py-10 px-4 md:px-12">
        <router-view v-slot="{ Component }">
          <transition name="page" mode="out-in">
            <component :is="Component" />
          </transition>
        </router-view>
      </div>
    </main>

    <!-- Mobile Bottom Navigation -->
    <nav class="md:hidden fixed bottom-0 left-0 right-0 glass-heavy border-t border-bright z-[300] flex justify-around items-center h-16 px-2 rounded-t-2xl">
      <router-link
        v-for="item in mobileNavItems"
        :key="item.to"
        :to="item.to"
        class="nav-item-mobile"
        active-class="active"
      >
        <div class="icon">{{ item.icon }}</div>
        <span>{{ item.mobileLabel || item.label }}</span>
      </router-link>

      <!-- User/Logout -->
      <button @click="handleLogout" class="nav-item-mobile text-danger">
        <div class="icon">🚪</div>
        <span>Quitter</span>
      </button>
    </nav>

    <!-- Mobile top header -->
    <header class="md:hidden fixed top-0 left-0 right-0 glass z-[250] px-4 py-3 flex items-center justify-between border-b border-color">
      <div class="flex items-center gap-2">
        <span class="text-xl">🍸</span>
        <span class="font-display font-black text-sm uppercase italic">BAR ADMIN</span>
      </div>
      <div class="flex items-center gap-2">
        <div class="w-7 h-7 rounded-full bg-gradient-to-tr from-primary to-secondary flex items-center justify-center text-[10px] font-black text-white">
          {{ user?.name?.charAt(0) }}
        </div>
        <div class="flex flex-col leading-none">
          <span class="text-[9px] text-primary uppercase font-bold tracking-widest">{{ roleLabel }}</span>
          <span class="text-xs font-semibold truncate max-w-[100px]">{{ user?.name }}</span>
        </div>
      </div>
    </header>
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '@/stores/auth';
import { useToastStore } from '@/stores/toast';
import { usePlanStore } from '@/stores/plan';
import { usePermissionsStore } from '@/stores/permissions';

const router = useRouter();
const auth = useAuthStore();
const toast = useToastStore();
const planStore = usePlanStore();
const permStore = usePermissionsStore();
const sidebarCollapsed = ref(false);

onMounted(async () => {
  const saved = localStorage.getItem('bar_sidebar_collapsed');
  if (saved !== null) sidebarCollapsed.value = saved === 'true';

  // Ensure permissions are available (may not be if restorePermissions() hasn't run yet)
  if (!permStore.loaded && auth.user) {
    if (!permStore.loadFromCache()) {
      await permStore.initialize(auth.user);
    }
  }

  if (auth.userRole === 'superadmin') {
    await planStore.load();
  }
});

watch(sidebarCollapsed, (val) => {
  localStorage.setItem('bar_sidebar_collapsed', String(val));
});

const user = computed(() => auth.user);
const userRole = computed(() => auth.userRole);
const roleLabel = computed(() => ({
  vendeur: 'Vendeur',
  caissier: 'Caissier',
  admin: 'Administrateur',
  superadmin: 'Super Admin',
}[userRole.value] || userRole.value));

const allMenuItems = [
  { to: '/admin/orders', icon: '📋', label: 'Commandes', permission: 'view-orders', feature: null },
  { to: '/admin/orders/create', icon: '➕', label: 'Nouvelle Commande', permission: 'create-orders', feature: null },
  { to: '/admin/payments', icon: '💳', label: 'Paiements', permission: 'process-payments', feature: 'payments' },
  { to: '/admin/billing', icon: '🧾', label: 'Facturation', permission: 'view-billing', feature: 'billing' },
  { to: '/admin/categories', icon: '📂', label: 'Categories', permission: 'view-categories', feature: null },
  { to: '/admin/products', icon: '📦', label: 'Produits', permission: 'view-products', feature: null },
  { to: '/admin/stock', icon: '🏪', label: 'Stock', permission: 'view-stock', feature: 'stock' },
  { to: '/admin/users', icon: '👥', label: 'Utilisateurs', permission: 'view-users', feature: 'users' },
  { to: '/admin/roles', icon: '🔐', label: 'Rôles & Accès', permission: 'manage-permissions', feature: null },
  { to: '/admin/statistics', icon: '📊', label: 'Statistiques', permission: 'view-statistics', feature: 'stats_basic' },
  { to: '/admin/activity-log', icon: '📜', label: 'Journaux', permission: 'view-activity-log', feature: 'activity_log' },
  { to: '/admin/settings', icon: '⚙️', label: 'Parametres', permission: 'view-settings', feature: null },
  { to: '/admin/plans', icon: '👑', label: 'Plans & Licences', permission: 'manage-plans', feature: null },
];

const menuItems = computed(() => {
  // While permissions are loading, use role as quick fallback
  const hasAccess = (permission) => {
    if (!permStore.loaded) return ['admin', 'superadmin'].includes(userRole.value);
    return permStore.can(permission);
  };
  return allMenuItems
    .filter(item => hasAccess(item.permission))
    .map(item => ({
      ...item,
      locked: item.feature && !planStore.hasFeature(item.feature),
    }));
});

const mobileNavItems = computed(() => {
  const hasAccess = (permission) => {
    if (!permStore.loaded) return ['admin', 'superadmin'].includes(userRole.value);
    return permStore.can(permission);
  };
  return allMenuItems
    .filter(item => hasAccess(item.permission))
    .slice(0, 5)
    .map(item => ({ to: item.to, icon: item.icon, label: item.label }));
});

const handleLogout = () => {
  auth.logout();
  toast.info('Deconnecte');
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
  position: sticky;
  top: 0;
  height: 100vh;
}

.shadow-glow {
  box-shadow: 0 4px 20px rgba(129, 140, 248, 0.3);
}

.nav-item {
  position: relative;
}

.nav-tooltip {
  top: 50%;
  transform: translateY(-50%);
  background: rgba(10, 10, 26, 0.95);
  backdrop-filter: blur(12px);
  box-shadow: 0 8px 24px rgba(0,0,0,0.3);
}

/* On mobile add top padding for fixed header */
@media (max-width: 767px) {
  .layout-container {
    padding-top: 70px !important;
  }
}
</style>
