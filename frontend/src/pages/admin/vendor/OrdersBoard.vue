<template>
  <div class="pb-4">
    <!-- Header -->
    <div class="flex items-start justify-between mb-8 flex-wrap gap-4">
      <div>
        <h1 class="text-3xl font-display font-black tracking-tighter">GESTION DES COMMANDES</h1>
        <p class="text-secondary text-sm mt-1">Traitez et validez les commandes en temps réel</p>
      </div>
      <div class="flex items-center gap-3">
        <div v-if="newOrderAlert" class="glass px-4 py-2.5 rounded-xl border border-warning/40 bg-warning/10 flex items-center gap-2 text-xs font-bold text-warning animate-pulse">
          🔔 Nouvelle commande !
        </div>
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
    <div class="grid grid-cols-2 sm:grid-cols-5 gap-4 mb-8">
      <div v-for="s in statCounts" :key="s.key" @click="setFilter(s.key)"
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
            <span v-if="order.is_takeaway" class="text-[10px] font-bold text-accent bg-accent/10 px-2 py-0.5 rounded-full border border-accent/20">emporter</span>
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
            <button v-if="['pending', 'confirmed'].includes(order.status)"
              @click="cancelOrder(order.id)"
              :disabled="processing[order.id]"
              class="btn btn-danger btn-sm flex items-center gap-1.5 text-[10px] py-1.5 px-3">
              ❌ Annuler
            </button>
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

    <!-- Cancel Confirm Modal -->
    <div v-if="cancelTarget" class="modal-overlay z-[400]" @click.self="cancelTarget = null">
      <div class="glass-card max-w-sm w-full p-6 mx-4 text-center">
        <div class="text-5xl mb-4">⚠️</div>
        <h2 class="font-display font-black text-lg mb-2">Annuler la commande ?</h2>
        <p class="text-secondary text-sm mb-6">Cette action est irréversible. Le stock sera restauré si la commande était confirmée.</p>
        <div class="flex gap-3 justify-center">
          <button @click="cancelTarget = null" class="btn btn-secondary px-6">Non, garder</button>
          <button @click="confirmCancel" :disabled="cancelling" class="btn btn-danger px-6">
            {{ cancelling ? 'Annulation...' : 'Oui, annuler' }}
          </button>
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
const newOrderAlert = ref(false);
const cancelTarget = ref(null);
const cancelling = ref(false);
let refreshInterval = null;
let countdownInterval = null;
let alertTimer = null;
let prevOrderIds = new Set();

const statuses = [
  { value: '', label: 'Toutes' },
  { value: 'pending', label: 'En attente' },
  { value: 'confirmed', label: 'Confirmées' },
  { value: 'validated', label: 'Validées' },
  { value: 'cancelled', label: 'Annulées' },
];

const statCounts = computed(() => [
  { key: 'all', label: 'Toutes', count: orders.value.length, color: 'text-primary' },
  { key: 'pending', label: 'En attente', count: orders.value.filter(o => o.status === 'pending').length, color: 'text-warning' },
  { key: 'confirmed', label: 'Confirmées', count: orders.value.filter(o => o.status === 'confirmed').length, color: 'text-info' },
  { key: 'validated', label: 'Validées', count: orders.value.filter(o => o.status === 'validated').length, color: 'text-secondary' },
  { key: 'cancelled', label: 'Annulées', count: orders.value.filter(o => o.status === 'cancelled').length, color: 'text-danger' },
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
const statusLabel = (s) => ({ pending: 'En attente', confirmed: 'Confirmée', validated: 'Validée', paid: 'Payée', cancelled: 'Annulée' }[s] || s);
const statusIcon = (s) => ({ pending: '⏳', confirmed: '✅', validated: '📤', paid: '💰', cancelled: '❌' }[s] || '📋');

const statusHeaderClass = (s) => ({
  pending: 'bg-warning/5',
  confirmed: 'bg-info/5',
  validated: 'bg-secondary/5',
  paid: 'bg-success/5',
  cancelled: 'bg-danger/5',
}[s] || '');

const setFilter = (key) => {
  fetchOrders(key === 'all' ? '' : key);
};

const fetchOrders = async (status = activeStatus.value) => {
  activeStatus.value = status;
  loading.value = true;
  try {
    const params = status ? { status } : {};
    const { data } = await api.get('/vendor/orders', { params });
    if (data.success) {
      const newOrders = data.data.orders;
      if (prevOrderIds.size > 0) {
        const hasNew = newOrders.some(o => !prevOrderIds.has(o.id));
        if (hasNew) {
          newOrderAlert.value = true;
          clearTimeout(alertTimer);
          alertTimer = setTimeout(() => { newOrderAlert.value = false; }, 5000);
        }
      }
      prevOrderIds = new Set(newOrders.map(o => o.id));
      orders.value = newOrders;
    }
  } catch {
    toast.error('Erreur de chargement');
  } finally {
    loading.value = false;
  }
};

const confirmOrder = async (id) => {
  processing.value[id] = true;
  try {
    await api.put(`/vendor/orders/${id}/confirm`);
    toast.success('Commande confirmée');
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
    toast.success('Commande validée — envoyée au caissier');
    fetchOrders(activeStatus.value);
  } catch (err) {
    toast.error(err.response?.data?.message || 'Erreur');
  } finally {
    processing.value[id] = false;
  }
};

const cancelOrder = (id) => {
  cancelTarget.value = id;
};

const confirmCancel = async () => {
  if (!cancelTarget.value) return;
  cancelling.value = true;
  try {
    await api.put(`/vendor/orders/${cancelTarget.value}/cancel`);
    toast.success('Commande annulée');
    cancelTarget.value = null;
    fetchOrders(activeStatus.value);
  } catch (err) {
    toast.error(err.response?.data?.message || 'Erreur lors de l\'annulation');
  } finally {
    cancelling.value = false;
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
  clearTimeout(alertTimer);
});
</script>
