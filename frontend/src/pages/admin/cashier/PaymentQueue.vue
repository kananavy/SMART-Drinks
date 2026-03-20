<template>
  <div class="pb-4">
    <!-- Header -->
    <div class="flex items-start justify-between mb-6 flex-wrap gap-4">
      <div>
        <h1 class="text-3xl font-display font-black tracking-tighter">FILE DE PAIEMENT</h1>
        <p class="text-secondary text-sm mt-1">Encaissez les commandes validées par le vendeur</p>
      </div>
      <div class="flex items-center gap-2">
        <div class="glass px-3 py-2 rounded-xl border border-white/5 flex items-center gap-2 text-xs font-bold text-muted">
          <span class="w-1.5 h-1.5 rounded-full bg-success animate-pulse"></span>
          Refresh dans <span class="text-primary font-black">{{ countdown }}s</span>
        </div>
        <button @click="fetchOrders(); fetchStats()" class="glass px-4 py-2.5 rounded-xl border border-white/5 flex items-center gap-2 hover:border-primary/30 transition-all text-xs font-bold uppercase tracking-widest text-secondary hover:text-white">
          <span :class="{ 'animate-spin': loading }">🔄</span> Actualiser
        </button>
      </div>
    </div>

    <!-- Stats Row -->
    <div class="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
      <div class="glass-card p-4 text-center border-t-2 border-warning">
        <span class="block text-2xl font-display font-black text-warning mb-1">{{ pendingCount }}</span>
        <span class="text-[10px] uppercase tracking-widest text-muted font-bold">A encaisser</span>
      </div>
      <div class="glass-card p-4 text-center border-t-2 border-success">
        <span class="block text-2xl font-display font-black text-success mb-1">{{ paidCount }}</span>
        <span class="text-[10px] uppercase tracking-widest text-muted font-bold">Payées</span>
      </div>
      <div class="glass-card p-4 text-center border-t-2 border-primary">
        <span class="block text-lg font-display font-black text-primary mb-1">{{ formatPrice(totalPending) }}</span>
        <span class="text-[10px] uppercase tracking-widest text-muted font-bold">En attente</span>
      </div>
      <div class="glass-card p-4 text-center border-t-2 border-info">
        <span class="block text-lg font-display font-black text-info mb-1">{{ formatPrice(stats.totalToday || 0) }}</span>
        <span class="text-[10px] uppercase tracking-widest text-muted font-bold">Encaissé (jour)</span>
      </div>
    </div>

    <!-- Daily breakdown -->
    <div v-if="stats.byMethod" class="glass-card p-4 mb-6 flex flex-wrap gap-4">
      <div class="flex items-center gap-2 text-xs">
        <span class="font-bold text-muted uppercase tracking-widest text-[9px]">Aujourd'hui :</span>
      </div>
      <div class="flex items-center gap-1.5 text-xs font-bold">
        💵 Espèces <span class="text-success">{{ formatPrice(stats.byMethod.cash || 0) }}</span>
      </div>
      <div class="flex items-center gap-1.5 text-xs font-bold">
        📱 Mobile Money <span class="text-info">{{ formatPrice(stats.byMethod.mobile_money || 0) }}</span>
      </div>
      <div class="flex items-center gap-1.5 text-xs font-bold">
        💳 Carte <span class="text-primary">{{ formatPrice(stats.byMethod.card || 0) }}</span>
      </div>
    </div>

    <!-- Search -->
    <div class="glass-card p-4 mb-6 flex gap-3 items-center">
      <div class="relative flex-1">
        <span class="absolute left-3 top-1/2 -translate-y-1/2 text-muted text-sm">🔍</span>
        <input v-model="searchQuery" @input="onSearch" placeholder="Rechercher par numéro ou table..."
          class="input-premium pl-9 w-full text-xs" />
        <button v-if="searchQuery" @click="searchQuery = ''; fetchOrders()"
          class="absolute right-3 top-1/2 -translate-y-1/2 text-muted hover:text-white text-sm">✕</button>
      </div>
      <div class="flex gap-1 glass p-1 rounded-xl border border-white/5">
        <button v-for="f in filters" :key="f.val" @click="activeFilter = f.val; fetchOrders()"
          :class="['px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all',
                   activeFilter === f.val ? 'bg-primary text-white' : 'text-muted hover:bg-white/5']">
          {{ f.label }}
        </button>
      </div>
    </div>

    <div v-if="loading" class="flex justify-center py-20"><div class="spinner"></div></div>

    <div v-else-if="orders.length === 0" class="glass-card text-center py-20">
      <div class="text-6xl mb-4">✅</div>
      <p class="font-display font-bold text-xl mb-2">File vide</p>
      <p class="text-secondary text-sm">Aucune commande en attente de paiement.</p>
    </div>

    <div v-else class="grid grid-cols-1 lg:grid-cols-2 gap-5">
      <div v-for="order in orders" :key="order.id"
        :class="['glass-card flex flex-col overflow-hidden transition-all', order.status === 'paid' ? 'opacity-70' : '']">

        <!-- Card Header -->
        <div :class="['px-5 py-3 border-b border-color flex items-center justify-between',
                      order.status === 'paid' ? 'bg-success/5' : 'bg-warning/5']">
          <div class="flex items-center gap-3">
            <div :class="['w-10 h-10 rounded-2xl flex items-center justify-center text-xl flex-shrink-0',
                          order.status === 'paid' ? 'bg-success/15' : 'bg-warning/15']">
              {{ order.status === 'paid' ? '✅' : '⏳' }}
            </div>
            <div>
              <p class="font-display font-black text-sm tracking-tight">{{ order.order_number }}</p>
              <p class="text-[9px] text-muted uppercase tracking-widest">{{ formatDate(order.created_at) }}</p>
            </div>
          </div>
          <div class="flex items-center gap-2">
            <span v-if="order.ClientSession" class="text-[10px] font-bold text-secondary bg-white/5 px-2.5 py-1 rounded-full border border-color">
              🪑 {{ order.ClientSession.table_name }}
            </span>
            <span v-if="order.is_takeaway" class="text-[10px] font-bold text-accent bg-accent/10 px-2 py-0.5 rounded-full border border-accent/20">
              A emporter
            </span>
            <span :class="['badge', `badge-${order.status}`]">{{ statusLabel(order.status) }}</span>
          </div>
        </div>

        <!-- Items -->
        <div class="px-5 py-3 space-y-1.5">
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
          <div v-if="order.remarks" class="pt-1.5 text-xs text-muted italic flex items-start gap-1">
            <span class="flex-shrink-0">💬</span> {{ order.remarks }}
          </div>
        </div>

        <!-- Total -->
        <div class="px-5 py-3 border-t border-color flex items-center justify-between bg-white/[0.015]">
          <div>
            <span class="text-xs text-secondary uppercase font-bold tracking-widest block">Total à payer</span>
            <span v-if="order.consignation_total > 0" class="text-[10px] text-accent font-bold">
              dont {{ formatPrice(order.consignation_total) }} consigne
            </span>
          </div>
          <span class="font-display font-black text-2xl text-primary">{{ formatPrice(order.total) }}</span>
        </div>

        <!-- Payment action -->
        <div class="px-5 py-4 border-t border-color">
          <!-- Already paid -->
          <div v-if="order.status === 'paid'" class="flex items-center justify-between">
            <div class="flex items-center gap-3">
              <span class="badge badge-paid text-sm px-4 py-2">✅ Payé</span>
              <span class="text-sm text-secondary flex items-center gap-1.5">
                {{ methodIcon(order.Payment?.method) }} {{ methodLabel(order.Payment?.method) }}
              </span>
              <span v-if="order.Payment?.reference" class="text-[10px] text-muted font-mono">
                REF: {{ order.Payment.reference }}
              </span>
            </div>
            <button @click="showTicket(order)"
              class="btn btn-secondary py-1.5 px-3 text-[10px] flex items-center gap-1">
              🧾 Ticket
            </button>
          </div>

          <!-- Payment form -->
          <div v-else class="space-y-3">
            <p class="text-[9px] uppercase tracking-widest text-muted font-bold">Mode de paiement</p>
            <div class="flex gap-2 flex-wrap">
              <button v-for="m in methods" :key="m.value"
                @click="selectedMethod[order.id] = m.value"
                :class="['flex items-center gap-1.5 px-4 py-2 rounded-xl border text-xs font-bold transition-all',
                         selectedMethod[order.id] === m.value
                           ? 'bg-primary/15 border-primary text-primary'
                           : 'glass border-color text-secondary hover:border-primary/30 hover:text-white']">
                <span>{{ m.icon }}</span> {{ m.label }}
              </button>
            </div>

            <!-- Reference field for non-cash -->
            <div v-if="selectedMethod[order.id] !== 'cash'" class="relative">
              <input v-model="references[order.id]" placeholder="Référence de transaction (optionnel)"
                class="input-premium w-full text-xs" />
            </div>

            <button @click="processPayment(order.id)"
              :disabled="processing[order.id]"
              class="btn btn-success w-full py-3 font-black tracking-widest text-sm flex items-center justify-center gap-2">
              <span v-if="!processing[order.id]">💰 ENCAISSER {{ formatPrice(order.total) }}</span>
              <span v-else class="flex items-center gap-2"><span class="animate-spin">🔄</span> Traitement...</span>
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Ticket Modal -->
    <div v-if="ticketOrder" class="modal-overlay z-[400]" @click.self="ticketOrder = null">
      <div class="glass-card max-w-sm w-full p-6 mx-4">
        <div class="flex items-center justify-between mb-4">
          <h2 class="font-display font-black text-base uppercase">🧾 Ticket</h2>
          <div class="flex gap-2">
            <button @click="printTicket" class="btn btn-primary py-1.5 px-3 text-xs">🖨️ Imprimer</button>
            <button @click="ticketOrder = null" class="text-muted hover:text-white text-xl leading-none">✕</button>
          </div>
        </div>
        <div id="ticket-print" class="space-y-3 text-sm">
          <div class="text-center border-b border-color pb-3 mb-3">
            <p class="font-black text-lg">{{ ticketOrder.order_number }}</p>
            <p class="text-muted text-xs">{{ formatDate(ticketOrder.created_at) }}</p>
            <p v-if="ticketOrder.ClientSession" class="text-xs font-bold mt-1">🪑 {{ ticketOrder.ClientSession.table_name }}</p>
            <span v-if="ticketOrder.is_takeaway" class="text-[10px] text-accent font-bold">A EMPORTER</span>
          </div>
          <div class="space-y-1.5">
            <div v-for="item in ticketOrder.items" :key="item.id" class="flex justify-between text-xs">
              <span>{{ item.Product?.name }} <span class="text-muted">x{{ item.quantity }}</span></span>
              <span class="font-bold">{{ formatPrice(item.subtotal) }}</span>
            </div>
          </div>
          <div class="border-t border-color pt-3 flex justify-between font-black">
            <span>TOTAL</span>
            <span class="text-primary">{{ formatPrice(ticketOrder.total) }}</span>
          </div>
          <div class="border-t border-color pt-2 flex justify-between text-xs text-muted">
            <span>{{ methodLabel(ticketOrder.Payment?.method) }}</span>
            <span v-if="ticketOrder.Payment?.reference">REF: {{ ticketOrder.Payment.reference }}</span>
          </div>
          <div v-if="ticketOrder.remarks" class="text-xs text-muted italic border-t border-color pt-2">
            💬 {{ ticketOrder.remarks }}
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted, onUnmounted } from 'vue';
import api from '@/services/api';
import { useToastStore } from '@/stores/toast';

const toast = useToastStore();
const orders = ref([]);
const loading = ref(true);
const selectedMethod = reactive({});
const processing = reactive({});
const references = reactive({});
const searchQuery = ref('');
const activeFilter = ref('');
const ticketOrder = ref(null);
const countdown = ref(30);
const stats = ref({ totalToday: 0, countToday: 0, byMethod: {} });
let refreshInterval = null;
let countdownInterval = null;
let searchTimer = null;

const filters = [
  { val: '', label: 'Toutes' },
  { val: 'validated', label: 'A payer' },
  { val: 'paid', label: 'Payées' },
];

const methods = [
  { value: 'cash', icon: '💵', label: 'Espèces' },
  { value: 'mobile_money', icon: '📱', label: 'Mobile Money' },
  { value: 'card', icon: '💳', label: 'Carte' },
];

const formatPrice = (p) => new Intl.NumberFormat('fr-FR').format(p || 0) + ' Ar';
const formatDate = (d) => new Date(d).toLocaleString('fr-FR', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' });
const statusLabel = (s) => ({ pending: 'En attente', confirmed: 'Confirmée', validated: 'Validée', paid: 'Payée' }[s] || s);
const methodLabel = (m) => ({ cash: 'Espèces', mobile_money: 'Mobile Money', card: 'Carte' }[m] || (m || 'N/A'));
const methodIcon = (m) => ({ cash: '💵', mobile_money: '📱', card: '💳' }[m] || '💰');

const pendingCount = computed(() => orders.value.filter(o => o.status !== 'paid').length);
const paidCount = computed(() => orders.value.filter(o => o.status === 'paid').length);
const totalPending = computed(() => orders.value.filter(o => o.status !== 'paid').reduce((s, o) => s + (o.total || 0), 0));

const fetchStats = async () => {
  try {
    const { data } = await api.get('/cashier/stats');
    if (data.success) stats.value = data.data;
  } catch {}
};

const fetchOrders = async () => {
  loading.value = true;
  try {
    const params = {};
    if (activeFilter.value) params.status = activeFilter.value;
    if (searchQuery.value) params.search = searchQuery.value;
    const { data } = await api.get('/cashier/orders', { params });
    if (data.success) {
      orders.value = data.data.orders;
      orders.value.forEach(o => {
        if (!selectedMethod[o.id]) selectedMethod[o.id] = 'cash';
      });
    }
  } catch {
    toast.error('Erreur de chargement');
  } finally {
    loading.value = false;
  }
};

const onSearch = () => {
  clearTimeout(searchTimer);
  searchTimer = setTimeout(() => fetchOrders(), 400);
};

const processPayment = async (orderId) => {
  processing[orderId] = true;
  try {
    await api.post('/cashier/payments', {
      order_id: orderId,
      method: selectedMethod[orderId] || 'cash',
      reference: references[orderId] || null,
    });
    toast.success('Paiement enregistré avec succès');
    fetchOrders();
    fetchStats();
  } catch (err) {
    toast.error(err.response?.data?.message || 'Erreur lors du paiement');
  } finally {
    processing[orderId] = false;
  }
};

const showTicket = (order) => {
  ticketOrder.value = order;
};

const printTicket = () => {
  const content = document.getElementById('ticket-print');
  if (!content) return;
  const win = window.open('', '_blank', 'width=400,height=600');
  win.document.write(`
    <html><head><title>Ticket</title>
    <style>
      body { font-family: monospace; font-size: 12px; padding: 16px; max-width: 280px; margin: auto; }
      .title { text-align: center; font-weight: bold; font-size: 16px; margin-bottom: 8px; }
      .divider { border-top: 1px dashed #999; margin: 8px 0; }
      .row { display: flex; justify-content: space-between; margin: 2px 0; }
      .total { font-weight: bold; font-size: 14px; }
    </style></head><body>
    ${content.innerHTML}
    </body></html>
  `);
  win.document.close();
  win.print();
};

const startAutoRefresh = () => {
  refreshInterval = setInterval(() => {
    fetchOrders();
    fetchStats();
    countdown.value = 30;
  }, 30000);
  countdownInterval = setInterval(() => {
    countdown.value--;
    if (countdown.value <= 0) countdown.value = 30;
  }, 1000);
};

onMounted(() => {
  fetchOrders();
  fetchStats();
  startAutoRefresh();
});

onUnmounted(() => {
  clearInterval(refreshInterval);
  clearInterval(countdownInterval);
  clearTimeout(searchTimer);
});
</script>
