<template>
  <div class="billing-page">
    <!-- Header -->
    <div class="page-header flex justify-between items-end mb-8">
      <div>
        <h1 class="text-3xl font-display font-black tracking-tight">GESTION DE FACTURATION</h1>
        <p class="text-secondary text-sm mt-1">Historique des ventes et pièces comptables.</p>
      </div>
      <button @click="exportCSV" class="btn btn-secondary gap-2 text-xs">
        <span>📥</span> Exporter CSV
      </button>
    </div>

    <!-- Stats Cards -->
    <div class="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
      <div class="glass-card p-5">
        <span class="text-[10px] font-black text-muted uppercase tracking-widest block mb-1">Chiffre d'Affaires</span>
        <span class="text-2xl font-display font-black text-primary">{{ formatAmount(stats.totalRevenue) }}</span>
      </div>
      <div class="glass-card p-5">
        <span class="text-[10px] font-black text-muted uppercase tracking-widest block mb-1">Factures Payées</span>
        <span class="text-2xl font-display font-black text-success">{{ stats.totalPaid }}</span>
      </div>
      <div class="glass-card p-5">
        <span class="text-[10px] font-black text-muted uppercase tracking-widest block mb-1">En Attente</span>
        <span class="text-2xl font-display font-black text-warning">{{ stats.totalPending }}</span>
      </div>
      <div class="glass-card p-5">
        <span class="text-[10px] font-black text-muted uppercase tracking-widest block mb-1">Ticket Moyen</span>
        <span class="text-2xl font-display font-black text-secondary">{{ formatAmount(stats.avgTicket) }}</span>
      </div>
    </div>

    <!-- Filters + Tabs -->
    <div class="glass-card p-4 mb-6 flex flex-wrap items-center gap-4">
      <div class="glass p-1 rounded-xl flex border border-white/5">
        <button v-for="t in tabs" :key="t.val" @click="tab = t.val; currentPage = 1; fetchOrders()"
          :class="['px-5 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all',
                   tab === t.val ? 'bg-primary text-white shadow-glow' : 'hover:bg-white/5 text-muted']">
          {{ t.label }}
        </button>
      </div>
      <input v-model="search" @input="onSearch" placeholder="Rechercher un client..." class="input-premium flex-1 min-w-[160px] text-xs" />
      <input v-model="dateFrom" @change="fetchOrders" type="date" class="input-premium text-xs" />
      <span class="text-muted text-xs">→</span>
      <input v-model="dateTo" @change="fetchOrders" type="date" class="input-premium text-xs" />
    </div>

    <!-- Table -->
    <div v-if="loading" class="flex justify-center py-24"><div class="spinner"></div></div>

    <div v-else class="glass-card overflow-hidden">
      <div v-if="orders.length === 0" class="p-16 text-center">
        <div class="text-5xl mb-4 opacity-20">📄</div>
        <p class="text-muted font-display uppercase tracking-widest text-sm">Aucune facturation trouvée</p>
      </div>

      <div v-else class="overflow-x-auto">
        <table class="w-full text-left data-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Date</th>
              <th>Client / Source</th>
              <th>Articles</th>
              <th>Montant</th>
              <th>Statut</th>
              <th class="text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="order in orders" :key="order.id">
              <td class="font-display font-black text-sm text-primary-light">#{{ order.id }}</td>
              <td class="text-xs whitespace-nowrap">
                <div class="font-bold">{{ formatDate(order.createdAt || order.created_at) }}</div>
                <div class="text-muted text-[10px]">{{ formatTime(order.createdAt || order.created_at) }}</div>
              </td>
              <td>
                <div class="flex items-center gap-2">
                  <span class="w-6 h-6 rounded-full bg-primary/20 text-primary text-[10px] font-black flex items-center justify-center uppercase">
                    {{ (order.ClientSession?.table_name || 'P').charAt(0) }}
                  </span>
                  <span class="text-xs font-bold">{{ order.ClientSession?.table_name || 'Client de passage' }}</span>
                </div>
              </td>
              <td class="text-xs text-secondary">{{ order.items?.length || 0 }} article(s)</td>
              <td class="font-display font-black text-sm text-primary">{{ formatAmount(order.total) }}</td>
              <td>
                <span :class="['px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-widest border',
                  order.status === 'paid'
                    ? 'bg-success/15 text-success border-success/30'
                    : 'bg-warning/15 text-warning border-warning/30']">
                  {{ order.status === 'paid' ? 'Payé' : 'En attente' }}
                </span>
              </td>
              <td class="text-right">
                <div class="flex gap-2 justify-end">
                  <button @click="viewDetails(order)" class="btn btn-secondary py-1.5 px-3 text-[10px]">DÉTAILS</button>
                  <button v-if="order.status === 'paid'" @click="downloadInvoice(order.id)" class="btn btn-primary py-1.5 px-3 text-[10px] gap-1">
                    <span>📄</span> PDF
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Pagination -->
      <div v-if="totalPages > 1" class="px-6 py-4 border-t border-color flex items-center justify-between bg-white/[0.02]">
        <span class="text-[10px] text-muted font-bold uppercase">{{ totalItems }} résultats — Page {{ currentPage }} / {{ totalPages }}</span>
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

    <!-- Modal Details -->
    <div v-if="selectedOrder" class="modal-overlay z-[400]" @click.self="selectedOrder = null">
      <div class="glass-card max-w-2xl w-full p-8 relative mx-4">
        <div class="flex justify-between items-start mb-6">
          <div>
            <h2 class="text-xl font-display font-black tracking-tight uppercase">DÉTAIL — Commande #{{ selectedOrder.id }}</h2>
            <p class="text-secondary text-sm">{{ selectedOrder.ClientSession?.table_name || 'Client de passage' }} · {{ formatDate(selectedOrder.createdAt || selectedOrder.created_at) }}</p>
          </div>
          <button @click="selectedOrder = null" class="text-muted hover:text-white text-xl leading-none">✕</button>
        </div>

        <div class="space-y-2 mb-6 max-h-64 overflow-y-auto">
          <div v-for="item in selectedOrder.items" :key="item.id" class="flex justify-between items-center p-3 glass rounded-xl border border-white/5">
            <div>
              <p class="font-bold text-xs uppercase">{{ item.Product?.name }}</p>
              <p class="text-[10px] text-muted">{{ item.quantity }} × {{ formatAmount(item.unit_price) }}</p>
            </div>
            <p class="font-display font-black text-sm text-primary">{{ formatAmount(item.subtotal) }}</p>
          </div>
        </div>

        <div class="flex justify-between items-center p-5 rounded-2xl bg-primary/10 border border-primary/20 mb-6">
          <span class="font-display font-black uppercase tracking-widest text-sm">Total</span>
          <span class="text-2xl font-display font-black text-primary">{{ formatAmount(selectedOrder.total) }}</span>
        </div>

        <button v-if="selectedOrder.status === 'paid'" @click="downloadInvoice(selectedOrder.id)" class="btn btn-primary w-full py-4 font-black tracking-widest uppercase">
          📄 Télécharger la Facture PDF
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue';
import api from '@/services/api';
import { useToastStore } from '@/stores/toast';
import { useAuthStore } from '@/stores/auth';

const toast = useToastStore();
const authStore = useAuthStore();
const loading = ref(true);
const orders = ref([]);
const tab = ref('paid');
const selectedOrder = ref(null);
const search = ref('');
const dateFrom = ref('');
const dateTo = ref('');
const currentPage = ref(1);
const totalPages = ref(1);
const totalItems = ref(0);
let searchTimer = null;

const stats = reactive({ totalRevenue: 0, totalPaid: 0, totalPending: 0, avgTicket: 0 });

const tabs = [
  { label: 'Payées', val: 'paid' },
  { label: 'En Attente', val: 'validated' },
  { label: 'Toutes', val: '' },
];

const pageRange = computed(() => {
  const range = [];
  const start = Math.max(1, currentPage.value - 2);
  const end = Math.min(totalPages.value, currentPage.value + 2);
  for (let i = start; i <= end; i++) range.push(i);
  return range;
});

const fetchOrders = async () => {
  loading.value = true;
  try {
    const params = { page: currentPage.value, limit: 20 };
    if (tab.value) params.status = tab.value;
    if (search.value) params.search = search.value;
    if (dateFrom.value) params.date_from = dateFrom.value;
    if (dateTo.value) params.date_to = dateTo.value;

    const isCaissier = authStore.userRole === 'caissier';
    const endpoint = isCaissier ? '/cashier/billing' : '/admin/orders';
    const { data } = await api.get(endpoint, { params });
    if (data.success) {
      orders.value = data.data;
      totalPages.value = data.pagination?.totalPages || 1;
      totalItems.value = data.pagination?.total || 0;
      computeStats(data.data);
    }
  } catch (err) {
    toast.error('Erreur de chargement');
  } finally {
    loading.value = false;
  }
};

const computeStats = (data) => {
  const paid = data.filter(o => o.status === 'paid');
  const pending = data.filter(o => o.status !== 'paid');
  const revenue = paid.reduce((s, o) => s + parseFloat(o.total || 0), 0);
  stats.totalRevenue = revenue;
  stats.totalPaid = paid.length;
  stats.totalPending = pending.length;
  stats.avgTicket = paid.length ? revenue / paid.length : 0;
};

const onSearch = () => {
  clearTimeout(searchTimer);
  searchTimer = setTimeout(() => { currentPage.value = 1; fetchOrders(); }, 400);
};

const goToPage = (p) => {
  if (p >= 1 && p <= totalPages.value) { currentPage.value = p; fetchOrders(); }
};

const downloadInvoice = async (id) => {
  try {
    const response = await api.get(`/admin/orders/${id}/invoice`, { responseType: 'blob' });
    const url = window.URL.createObjectURL(new Blob([response.data]));
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `facture-${id}.pdf`);
    document.body.appendChild(link);
    link.click();
    link.remove();
    toast.success('Facture téléchargée');
  } catch (err) {
    toast.error('Échec de génération PDF');
  }
};

const viewDetails = (order) => { selectedOrder.value = order; };

const exportCSV = () => {
  if (!orders.value.length) return toast.error('Aucune donnée à exporter');
  const headers = ['ID', 'Date', 'Client', 'Montant', 'Statut'];
  const rows = orders.value.map(o => [
    o.id,
    new Date(o.createdAt || o.created_at).toLocaleDateString('fr-FR'),
    o.ClientSession?.table_name || 'Client de passage',
    o.total,
    o.status,
  ]);
  const csv = [headers, ...rows].map(r => r.join(';')).join('\n');
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `facturation-${new Date().toISOString().slice(0, 10)}.csv`;
  link.click();
};

const formatAmount = (v) => new Intl.NumberFormat('fr-FR').format(Math.round(v || 0)) + ' Ar';
const formatDate = (d) => {
  if (!d) return '—';
  const date = new Date(d);
  return isNaN(date.getTime()) ? '—' : new Intl.DateTimeFormat('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' }).format(date);
};
const formatTime = (d) => {
  if (!d) return '—';
  const date = new Date(d);
  return isNaN(date.getTime()) ? '—' : new Intl.DateTimeFormat('fr-FR', { hour: '2-digit', minute: '2-digit' }).format(date);
};

onMounted(fetchOrders);
</script>

<style scoped>
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
