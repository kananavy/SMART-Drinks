<template>
  <div class="pb-4">
    <!-- Header -->
    <div class="flex items-start justify-between mb-8 flex-wrap gap-4">
      <div>
        <h1 class="text-3xl font-display font-black tracking-tighter">GESTION DES COMMANDES</h1>
        <p class="text-secondary text-sm mt-1">Traitez et validez les commandes en temps reel</p>
      </div>
        <div class="flex items-center gap-3">
        <div class="glass px-4 py-2.5 rounded-xl border border-white/5 flex items-center gap-2 text-xs font-bold text-muted">
          <span class="w-1.5 h-1.5 rounded-full bg-success animate-pulse"></span>
          Refresh dans <span class="text-primary font-black">{{ countdown }}s</span>
        </div>
        <button @click="fetchOrders(activeStatus)" class="glass px-4 py-2.5 rounded-xl border border-white/5 flex items-center gap-2 hover:border-primary/30 transition-all text-xs font-bold uppercase tracking-widest text-secondary hover:text-white">
          <span :class="{ 'animate-spin': loading }">🔄</span> Actualiser
        </button>
      </div>
    </div>

    <!-- Stats Bar -->
    <div class="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
      <div v-for="s in statCounts" :key="s.key" @click="fetchOrders(s.key === 'all' ? '' : s.key)"
        :class="['glass-card p-4 text-center cursor-pointer transition-all border-t-2',
                 (s.key === 'all' ? activeStatus === '' : activeStatus === s.key) ? 'border-primary shadow-glow scale-[1.02]' : 'border-transparent hover:border-primary/30']">
        <span class="block text-2xl font-display font-black mb-1" :class="s.color">{{ s.count }}</span>
        <span class="text-[10px] uppercase tracking-widest text-muted font-bold">{{ s.label }}</span>
      </div>
    </div>

    <!-- Filter Tabs -->
    <div class="glass p-1 rounded-2xl flex gap-1 mb-8 border border-white/5 w-fit overflow-x-auto">
      <button v-for="st in statuses" :key="st.value"
        @click="fetchOrders(st.value)"
        :class="['px-5 py-2 rounded-xl text-[11px] font-black uppercase tracking-widest transition-all whitespace-nowrap',
                 activeStatus === st.value ? 'bg-primary text-white shadow-glow' : 'hover:bg-white/5 text-muted']">
        {{ st.label }}
      </button>
    </div>

    <div v-if="loading" class="flex justify-center py-20"><div class="spinner"></div></div>

    <div v-else-if="orders.length === 0" class="glass-card text-center py-20">
      <div class="text-6xl mb-4">✅</div>
      <p class="font-display font-bold text-xl mb-2">Aucune commande</p>
      <p class="text-secondary text-sm">
        {{ activeStatus ? `Aucune commande "${statusLabel(activeStatus)}" pour le moment.` : 'Aucune commande en cours.' }}
      </p>
    </div>

    <div v-else class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
      <div v-for="order in orders" :key="order.id" class="glass-card flex flex-col overflow-hidden">
        <!-- Card Header -->
        <div :class="['px-5 py-3 border-b border-color flex items-center justify-between', statusHeaderClass(order.status)]">
          <div class="flex items-center gap-2">
            <span class="text-lg">{{ statusIcon(order.status) }}</span>
            <div>
              <p class="font-display font-black text-sm tracking-tight">{{ order.order_number }}</p>
              <div class="flex items-center gap-2">
                <p class="text-[9px] text-muted uppercase tracking-widest">{{ formatDate(order.created_at) }}</p>
                <span :class="['text-[9px] font-black px-1.5 py-0.5 rounded-full', timeAgoClass(order.created_at)]">
                  {{ timeAgo(order.created_at) }}
                </span>
              </div>
            </div>
          </div>
          <div class="flex items-center gap-2">
            <span v-if="order.ClientSession" class="text-[10px] font-bold text-secondary bg-white/5 px-2.5 py-1 rounded-full border border-color">
              🪑 {{ order.ClientSession.table_name }}
            </span>
            <span :class="['badge', `badge-${order.status}`]">{{ statusLabel(order.status) }}</span>
          </div>
        </div>

        <!-- Items -->
        <div class="px-5 py-3 flex-1 space-y-2">
          <div v-for="item in order.items" :key="item.id" class="flex justify-between items-center text-sm">
            <span class="text-secondary flex items-center gap-2">
              <span class="w-1 h-1 rounded-full bg-primary/50 flex-shrink-0"></span>
              {{ item.Product?.name }}
            </span>
            <div class="flex items-center gap-3">
              <span class="text-muted text-xs font-bold">x{{ item.quantity }}</span>
              <span class="text-xs font-semibold">{{ formatPrice(item.subtotal) }}</span>
            </div>
          </div>
          <div v-if="order.remarks" class="mt-2 pt-2 border-t border-color text-xs text-muted italic flex items-start gap-1">
            <span class="flex-shrink-0">💬</span> {{ order.remarks }}
          </div>
        </div>

        <!-- Footer -->
        <div class="px-5 py-3 border-t border-color bg-white/[0.015] flex items-center justify-between">
          <div>
            <p class="text-[9px] text-muted uppercase tracking-widest">Total commande</p>
            <p class="font-display font-black text-xl text-primary">{{ formatPrice(order.total) }}</p>
          </div>
          <div class="flex gap-2">
            <button v-if="order.status === 'pending'"
              @click="confirmOrder(order.id)"
              :disabled="processing[order.id]"
              class="btn btn-primary btn-sm flex items-center gap-1.5">
              <span>✅</span> Confirmer
            </button>
            <button v-if="order.status === 'confirmed'"
              @click="validateOrder(order.id)"
              :disabled="processing[order.id]"
              class="btn btn-success btn-sm flex items-center gap-1.5">
              <span>📤</span> Valider
            </button>
            <span v-if="processing[order.id]" class="text-xs text-muted animate-pulse">Traitement...</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue';
import api from '@/services/api';
import { useToastStore } from '@/stores/toast';

const toast = useToastStore();
const orders = ref([]);
const loading = ref(true);
const activeStatus = ref('');
const processing = ref({});
const countdown = ref(30);
let refreshInterval = null;
let countdownInterval = null;

const statuses = [
  { value: '', label: 'Toutes' },
  { value: 'pending', label: 'En attente' },
  { value: 'confirmed', label: 'Confirmees' },
  { value: 'validated', label: 'Validees' },
];

const statCounts = computed(() => [
  { key: 'all', label: 'Toutes', count: orders.value.length, color: 'text-primary' },
  { key: 'pending', label: 'En attente', count: orders.value.filter(o => o.status === 'pending').length, color: 'text-warning' },
  { key: 'confirmed', label: 'Confirmees', count: orders.value.filter(o => o.status === 'confirmed').length, color: 'text-info' },
  { key: 'validated', label: 'Validees', count: orders.value.filter(o => o.status === 'validated').length, color: 'text-secondary' },
]);

const formatPrice = (p) => new Intl.NumberFormat('fr-FR').format(p) + ' Ar';

const timeAgo = (dateStr) => {
  const diffMs = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diffMs / 60000);
  if (mins < 1) return '< 1 min';
  if (mins < 60) return `${mins} min`;
  return `${Math.floor(mins / 60)}h${mins % 60 > 0 ? (mins % 60) + 'm' : ''}`;
};

const timeAgoClass = (dateStr) => {
  const mins = Math.floor((Date.now() - new Date(dateStr).getTime()) / 60000);
  if (mins < 5) return 'bg-success/15 text-success';
  if (mins < 15) return 'bg-warning/15 text-warning';
  return 'bg-danger/15 text-danger';
};
const formatDate = (d) => new Date(d).toLocaleString('fr-FR', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' });
const statusLabel = (s) => ({ pending: 'En attente', confirmed: 'Confirmee', validated: 'Validee', paid: 'Payee', cancelled: 'Annulee' }[s] || s);
const statusIcon = (s) => ({ pending: '⏳', confirmed: '✅', validated: '📤', paid: '💰', cancelled: '❌' }[s] || '📋');

const statusHeaderClass = (s) => ({
  pending: 'bg-warning/5',
  confirmed: 'bg-info/5',
  validated: 'bg-secondary/5',
  paid: 'bg-success/5',
}[s] || '');

const fetchOrders = async (status = '') => {
  activeStatus.value = status;
  loading.value = true;
  try {
    const params = status ? { status } : {};
    const { data } = await api.get('/vendor/orders', { params });
    if (data.success) orders.value = data.data.orders;
  } catch (err) {
    toast.error('Erreur de chargement');
  } finally {
    loading.value = false;
  }
};

const confirmOrder = async (id) => {
  processing.value[id] = true;
  try {
    await api.put(`/vendor/orders/${id}/confirm`);
    toast.success('Commande confirmee');
    fetchOrders(activeStatus.value);
  } catch (err) {
    toast.error(err.response?.data?.message || 'Erreur');
  } finally {
    processing.value[id] = false;
  }
};

const validateOrder = async (id) => {
  processing.value[id] = true;
  try {
    await api.put(`/vendor/orders/${id}/validate`);
    toast.success('Commande validee — envoyee au caissier');
    fetchOrders(activeStatus.value);
  } catch (err) {
    toast.error(err.response?.data?.message || 'Erreur');
  } finally {
    processing.value[id] = false;
  }
};

const startAutoRefresh = () => {
  refreshInterval = setInterval(() => fetchOrders(activeStatus.value), 30000);
  countdownInterval = setInterval(() => {
    countdown.value--;
    if (countdown.value <= 0) countdown.value = 30;
  }, 1000);
};

onMounted(() => {
  fetchOrders();
  startAutoRefresh();
});

onUnmounted(() => {
  clearInterval(refreshInterval);
  clearInterval(countdownInterval);
});
</script>
