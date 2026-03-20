<template>
  <div class="activity-log-premium">
    <!-- Header -->
    <div class="page-header mb-8">
      <h1 class="text-3xl font-display font-black tracking-tight">LOGS D'ACTIVITÉ</h1>
      <p class="text-secondary text-sm mt-1">Traçabilité complète des actions effectuées sur le système.</p>
    </div>

    <!-- Category Stats Bar -->
    <div class="grid grid-cols-3 md:grid-cols-6 gap-3 mb-6">
      <button v-for="cat in actionCategories" :key="cat.prefix"
        @click="filterAction = filterAction === cat.prefix ? '' : cat.prefix; currentPage = 1; fetchLogs()"
        :class="['glass-card p-3 text-center transition-all cursor-pointer border', filterAction === cat.prefix ? 'border-primary bg-primary/10' : 'border-transparent hover:border-white/10']">
        <span class="text-lg block mb-1">{{ cat.icon }}</span>
        <span :class="['text-[9px] font-black uppercase tracking-widest block', cat.color]">{{ cat.label }}</span>
        <span class="text-xs font-display font-black text-white mt-0.5 block">{{ cat.count }}</span>
      </button>
    </div>

    <!-- Filters -->
    <div class="glass-card p-4 mb-6 flex flex-wrap gap-3">
      <input v-model="searchQuery" @input="onSearch" placeholder="Rechercher dans la description..."
        class="input-premium flex-1 min-w-[200px] text-xs" />
      <select v-model="filterAction" @change="currentPage = 1; fetchLogs()" class="input-premium text-xs">
        <option value="">Toutes les actions</option>
        <option v-for="cat in actionCategories" :key="cat.prefix" :value="cat.prefix">{{ cat.label }}</option>
      </select>
    </div>

    <div v-if="loading" class="flex justify-center py-24"><div class="spinner"></div></div>

    <div v-else class="glass-card overflow-hidden">
      <div v-if="logs.length === 0" class="p-16 text-center">
        <div class="text-5xl mb-4 opacity-20">📜</div>
        <p class="text-muted font-display uppercase tracking-widest text-sm">Aucun log trouvé</p>
      </div>

      <div v-else class="overflow-x-auto">
        <table class="w-full text-left data-table">
          <thead>
            <tr>
              <th>Horodatage</th>
              <th>Utilisateur</th>
              <th>Action</th>
              <th>Description</th>
              <th>IP</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="log in logs" :key="log.id">
              <td class="whitespace-nowrap">
                <div class="text-xs font-bold">{{ formatDate(log.createdAt || log.created_at) }}</div>
                <div class="text-[10px] text-muted font-mono">{{ formatTime(log.createdAt || log.created_at) }}</div>
              </td>
              <td>
                <div class="flex items-center gap-2">
                  <div :class="['w-7 h-7 rounded-full flex items-center justify-center text-[10px] font-black uppercase', roleColor(log.User?.role)]">
                    {{ log.User?.name?.charAt(0) || '?' }}
                  </div>
                  <div>
                    <div class="text-xs font-bold">{{ log.User?.name || 'Système' }}</div>
                    <div class="text-[9px] text-muted uppercase tracking-widest">{{ log.User?.role || '' }}</div>
                  </div>
                </div>
              </td>
              <td>
                <span :class="['px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-widest border', actionBadgeClass(log.action)]">
                  {{ log.action }}
                </span>
              </td>
              <td class="text-xs text-secondary max-w-xs truncate">{{ log.description }}</td>
              <td class="font-mono text-[10px] text-muted">{{ log.ip_address || log.ipAddress || '—' }}</td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Pagination -->
      <div v-if="totalPages > 1" class="px-6 py-4 border-t border-color flex items-center justify-between bg-white/[0.02]">
        <span class="text-[10px] text-muted font-bold uppercase">{{ totalItems }} entrées — Page {{ currentPage }} / {{ totalPages }}</span>
        <div class="flex gap-1">
          <button @click="goToPage(currentPage - 1)" :disabled="currentPage === 1"
            class="px-3 py-1.5 rounded-lg text-[10px] font-black border border-white/10 hover:bg-white/5 disabled:opacity-30 transition-all">←</button>
          <button v-for="p in pageRange" :key="p" @click="goToPage(p)"
            :class="['px-3 py-1.5 rounded-lg text-[10px] font-black border transition-all',
                     p === currentPage ? 'bg-primary text-white border-primary' : 'border-white/10 hover:bg-white/5']">
            {{ p }}
          </button>
          <button @click="goToPage(currentPage + 1)" :disabled="currentPage === totalPages"
            class="px-3 py-1.5 rounded-lg text-[10px] font-black border border-white/10 hover:bg-white/5 disabled:opacity-30 transition-all">→</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import api from '@/services/api';
import { useToastStore } from '@/stores/toast';

const toast = useToastStore();
const logs = ref([]);
const loading = ref(true);
const searchQuery = ref('');
const filterAction = ref('');
const currentPage = ref(1);
const totalPages = ref(1);
const totalItems = ref(0);
let searchTimer = null;

const actionCategories = ref([
  { prefix: 'USER_', label: 'Utilisateurs', icon: '👤', color: 'text-blue-400', count: 0 },
  { prefix: 'LOGIN', label: 'Connexions', icon: '🔐', color: 'text-purple-400', count: 0 },
  { prefix: 'ORDER', label: 'Commandes', icon: '📋', color: 'text-cyan-400', count: 0 },
  { prefix: 'PAYMENT', label: 'Paiements', icon: '💳', color: 'text-teal-400', count: 0 },
  { prefix: 'STOCK', label: 'Stock', icon: '📦', color: 'text-green-400', count: 0 },
  { prefix: 'SETTINGS', label: 'Paramètres', icon: '⚙️', color: 'text-gray-400', count: 0 },
]);

const pageRange = computed(() => {
  const range = [];
  const start = Math.max(1, currentPage.value - 2);
  const end = Math.min(totalPages.value, currentPage.value + 2);
  for (let i = start; i <= end; i++) range.push(i);
  return range;
});

const fetchLogs = async () => {
  loading.value = true;
  try {
    const params = { page: currentPage.value, limit: 25 };
    if (filterAction.value) params.action = filterAction.value;
    if (searchQuery.value) params.search = searchQuery.value;

    const { data } = await api.get('/admin/activity-log', { params });
    if (data.success) {
      logs.value = data.data;
      totalPages.value = data.pagination?.totalPages || 1;
      totalItems.value = data.pagination?.total || 0;
      updateCategoryCounts(data.data);
    }
  } catch (err) {
    toast.error('Échec du chargement des journaux');
  } finally {
    loading.value = false;
  }
};

const updateCategoryCounts = (data) => {
  // Strip trailing underscore from prefix for startsWith comparison
  actionCategories.value.forEach(cat => {
    const prefix = cat.prefix.replace(/_$/, '');
    cat.count = data.filter(l => l.action?.startsWith(prefix)).length;
  });
};

const onSearch = () => {
  clearTimeout(searchTimer);
  searchTimer = setTimeout(() => { currentPage.value = 1; fetchLogs(); }, 400);
};

const goToPage = (p) => {
  if (p >= 1 && p <= totalPages.value) { currentPage.value = p; fetchLogs(); }
};

const actionBadgeClass = (action = '') => {
  if (action.startsWith('USER')) return 'bg-blue-500/15 text-blue-400 border-blue-500/30';
  if (action.startsWith('LOGIN')) return 'bg-purple-500/15 text-purple-400 border-purple-500/30';
  if (action.startsWith('ORDER')) return 'bg-cyan-500/15 text-cyan-400 border-cyan-500/30';
  if (action.startsWith('PAYMENT')) return 'bg-teal-500/15 text-teal-400 border-teal-500/30';
  if (action.startsWith('STOCK_IN')) return 'bg-green-500/15 text-green-400 border-green-500/30';
  if (action.startsWith('STOCK_OUT')) return 'bg-orange-500/15 text-orange-400 border-orange-500/30';
  if (action.startsWith('SETTINGS')) return 'bg-gray-500/15 text-gray-400 border-gray-500/30';
  return 'bg-white/5 text-primary-light border-white/10';
};

const roleColor = (role) => {
  if (role === 'superadmin') return 'bg-primary/20 text-primary';
  if (role === 'caissier') return 'bg-teal-500/20 text-teal-400';
  if (role === 'vendeur') return 'bg-blue-500/20 text-blue-400';
  return 'bg-white/10 text-secondary';
};

const formatDate = (d) => {
  if (!d) return '—';
  const date = new Date(d);
  return isNaN(date.getTime()) ? '—' : new Intl.DateTimeFormat('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' }).format(date);
};
const formatTime = (d) => {
  if (!d) return '—';
  const date = new Date(d);
  return isNaN(date.getTime()) ? '—' : new Intl.DateTimeFormat('fr-FR', { hour: '2-digit', minute: '2-digit', second: '2-digit' }).format(date);
};

onMounted(() => fetchLogs());
</script>

<style scoped>
.activity-log-premium { min-height: 80vh; }

.input-premium {
  background: rgba(255,255,255,0.04);
  border: 1px solid rgba(255,255,255,0.08);
  border-radius: 10px;
  padding: 8px 14px;
  color: inherit;
  font-size: 12px;
  outline: none;
  transition: border-color 0.2s;
}
.input-premium:focus { border-color: var(--primary, #6366f1); }
</style>
