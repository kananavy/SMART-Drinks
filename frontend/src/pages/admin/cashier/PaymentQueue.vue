<template>
  <div class="pb-4">
    <!-- Header -->
    <div class="flex items-start justify-between mb-8 flex-wrap gap-4">
      <div>
        <h1 class="text-3xl font-display font-black tracking-tighter">FILE DE PAIEMENT</h1>
        <p class="text-secondary text-sm mt-1">Encaissez les commandes validees par le vendeur</p>
      </div>
      <button @click="fetchOrders" class="glass px-4 py-2.5 rounded-xl border border-white/5 flex items-center gap-2 hover:border-primary/30 transition-all text-xs font-bold uppercase tracking-widest text-secondary hover:text-white">
        <span :class="{ 'animate-spin': loading }">🔄</span> Actualiser
      </button>
    </div>

    <!-- Stats -->
    <div class="grid grid-cols-2 sm:grid-cols-3 gap-4 mb-8">
      <div class="glass-card p-5 text-center border-t-2 border-warning">
        <span class="block text-2xl font-display font-black text-warning mb-1">{{ pendingCount }}</span>
        <span class="text-[10px] uppercase tracking-widest text-muted font-bold">A encaisser</span>
      </div>
      <div class="glass-card p-5 text-center border-t-2 border-success">
        <span class="block text-2xl font-display font-black text-success mb-1">{{ paidCount }}</span>
        <span class="text-[10px] uppercase tracking-widest text-muted font-bold">Payes</span>
      </div>
      <div class="glass-card p-5 text-center border-t-2 border-primary col-span-2 sm:col-span-1">
        <span class="block text-xl font-display font-black text-primary mb-1">{{ formatPrice(totalPending) }}</span>
        <span class="text-[10px] uppercase tracking-widest text-muted font-bold">Montant en attente</span>
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
        </div>

        <!-- Total -->
        <div class="px-5 py-3 border-t border-color flex items-center justify-between bg-white/[0.015]">
          <span class="text-xs text-secondary uppercase font-bold tracking-widest">Total a payer</span>
          <span class="font-display font-black text-2xl text-primary">{{ formatPrice(order.total) }}</span>
        </div>

        <!-- Payment action -->
        <div class="px-5 py-4 border-t border-color">
          <!-- Already paid -->
          <div v-if="order.status === 'paid'" class="flex items-center gap-3">
            <span class="badge badge-paid text-sm px-4 py-2">✅ Paye</span>
            <span class="text-sm text-secondary flex items-center gap-1.5">
              {{ methodIcon(order.Payment?.method) }} {{ methodLabel(order.Payment?.method) }}
            </span>
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
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue';
import api from '@/services/api';
import { useToastStore } from '@/stores/toast';

const toast = useToastStore();
const orders = ref([]);
const loading = ref(true);
const selectedMethod = reactive({});
const processing = reactive({});

const methods = [
  { value: 'cash', icon: '💵', label: 'Especes' },
  { value: 'mobile_money', icon: '📱', label: 'Mobile Money' },
  { value: 'card', icon: '💳', label: 'Carte' },
];

const formatPrice = (p) => new Intl.NumberFormat('fr-FR').format(p || 0) + ' Ar';
const formatDate = (d) => new Date(d).toLocaleString('fr-FR', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' });
const statusLabel = (s) => ({ pending: 'En attente', confirmed: 'Confirmee', validated: 'Validee', paid: 'Payee' }[s] || s);
const methodLabel = (m) => ({ cash: 'Especes', mobile_money: 'Mobile Money', card: 'Carte' }[m] || (m || 'N/A'));
const methodIcon = (m) => ({ cash: '💵', mobile_money: '📱', card: '💳' }[m] || '💰');

const pendingCount = computed(() => orders.value.filter(o => o.status !== 'paid').length);
const paidCount = computed(() => orders.value.filter(o => o.status === 'paid').length);
const totalPending = computed(() => orders.value.filter(o => o.status !== 'paid').reduce((s, o) => s + (o.total || 0), 0));

const fetchOrders = async () => {
  loading.value = true;
  try {
    const { data } = await api.get('/cashier/orders');
    if (data.success) {
      orders.value = data.data.orders;
      orders.value.forEach(o => {
        if (!selectedMethod[o.id]) selectedMethod[o.id] = 'cash';
      });
    }
  } catch (err) {
    toast.error('Erreur de chargement');
  } finally {
    loading.value = false;
  }
};

const processPayment = async (orderId) => {
  processing[orderId] = true;
  try {
    await api.post('/cashier/payments', {
      order_id: orderId,
      method: selectedMethod[orderId] || 'cash',
    });
    toast.success('Paiement enregistre avec succes');
    fetchOrders();
  } catch (err) {
    toast.error(err.response?.data?.message || 'Erreur lors du paiement');
  } finally {
    processing[orderId] = false;
  }
};

onMounted(fetchOrders);
</script>
