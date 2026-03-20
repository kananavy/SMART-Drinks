<template>
  <div class="pb-4">
    <!-- Header -->
    <div class="flex items-start justify-between mb-8 flex-wrap gap-4">
      <div>
        <h1 class="text-3xl font-display font-black tracking-tighter">MES COMMANDES</h1>
        <p class="text-secondary text-sm mt-1">Historique complet de vos commandes</p>
      </div>
      <div class="flex items-center gap-3">
        <div class="glass px-3 py-2 rounded-xl border border-white/5 flex items-center gap-2 text-xs font-bold text-muted">
          <span class="w-1.5 h-1.5 rounded-full bg-primary animate-pulse"></span>
          Refresh dans <span class="text-primary font-black">{{ countdown }}s</span>
        </div>
        <div class="glass px-4 py-3 rounded-2xl border border-white/5 flex items-center gap-3">
          <span class="w-2 h-2 rounded-full bg-primary animate-pulse"></span>
          <span class="text-xs font-bold uppercase tracking-widest text-muted">{{ orders.length }} commande{{ orders.length !== 1 ? 's' : '' }}</span>
        </div>
      </div>
    </div>

    <!-- Call Server Button -->
    <div class="mb-6">
      <button @click="callServer" :disabled="calling"
        :class="['glass-card p-4 w-full flex items-center gap-4 transition-all hover:border-warning/40 border',
                 calling ? 'border-warning/40 bg-warning/5' : 'border-color']">
        <div class="w-12 h-12 rounded-2xl bg-warning/15 flex items-center justify-center text-2xl flex-shrink-0">
          🔔
        </div>
        <div class="text-left">
          <p class="font-display font-black text-sm">Appeler le serveur</p>
          <p class="text-xs text-muted mt-0.5">{{ calling ? 'Demande envoyée ! Le serveur arrive...' : 'Besoin d\'aide ? Cliquez pour nous appeler.' }}</p>
        </div>
        <div v-if="calling" class="ml-auto">
          <span class="w-2 h-2 rounded-full bg-warning animate-pulse block"></span>
        </div>
      </button>
    </div>

    <div v-if="loading" class="flex justify-center py-20"><div class="spinner"></div></div>

    <div v-else-if="orders.length === 0" class="glass-card text-center py-20">
      <div class="text-6xl mb-4">📦</div>
      <p class="font-display font-bold text-xl mb-2">Aucune commande</p>
      <p class="text-secondary text-sm">Votre historique de commandes est vide.</p>
      <router-link to="/client/menu" class="btn btn-primary mt-6 inline-flex items-center gap-2">
        🍹 Commander maintenant
      </router-link>
    </div>

    <div v-else class="space-y-4">
      <div v-for="order in orders" :key="order.id" class="glass-card overflow-hidden group">
        <!-- Card Header -->
        <div class="flex items-center justify-between px-5 py-4 border-b border-color">
          <div class="flex items-center gap-3">
            <div class="w-10 h-10 rounded-2xl flex items-center justify-center text-lg flex-shrink-0"
              :class="statusBgClass(order.status)">
              {{ statusIcon(order.status) }}
            </div>
            <div>
              <p class="font-display font-black text-base tracking-tight">{{ order.order_number }}</p>
              <p class="text-[10px] text-muted uppercase tracking-widest mt-0.5">{{ formatDate(order.created_at) }}</p>
            </div>
          </div>
          <div class="flex items-center gap-2 flex-wrap justify-end">
            <span v-if="order.is_takeaway"
              class="text-[10px] font-bold uppercase tracking-widest text-accent bg-accent/10 px-2.5 py-1 rounded-full border border-accent/20">
              A emporter
            </span>
            <span :class="['badge', `badge-${order.status}`]">{{ statusLabel(order.status) }}</span>
          </div>
        </div>

        <!-- Progress Bar -->
        <div v-if="order.status !== 'cancelled'" class="px-5 pt-3">
          <div class="flex items-center gap-1">
            <div v-for="(step, i) in progressSteps" :key="i" class="flex items-center flex-1">
              <div :class="['w-5 h-5 rounded-full flex items-center justify-center text-[9px] font-black flex-shrink-0 transition-all',
                            getStepStatus(order.status, i) === 'done' ? 'bg-success text-white' :
                            getStepStatus(order.status, i) === 'active' ? 'bg-primary text-white animate-pulse' :
                            'bg-white/5 text-muted']">
                {{ getStepStatus(order.status, i) === 'done' ? '✓' : (i + 1) }}
              </div>
              <div :class="['flex-1 h-0.5 mx-1 transition-all', i < progressSteps.length - 1 ? (getStepStatus(order.status, i) === 'done' ? 'bg-success' : 'bg-white/5') : 'hidden']"></div>
              <span v-if="i === progressSteps.length - 1" class="hidden"></span>
            </div>
          </div>
          <div class="flex justify-between mt-1 mb-2">
            <span v-for="(step, i) in progressSteps" :key="i"
              :class="['text-[8px] font-bold uppercase tracking-widest flex-1 text-center',
                       getStepStatus(order.status, i) === 'active' ? 'text-primary' :
                       getStepStatus(order.status, i) === 'done' ? 'text-success' : 'text-muted']">
              {{ step.label }}
            </span>
          </div>
        </div>

        <!-- Items List -->
        <div class="px-5 py-3 space-y-1.5">
          <div v-for="item in order.items" :key="item.id" class="flex justify-between items-center text-sm py-1">
            <span class="text-secondary flex items-center gap-2">
              <span class="w-1 h-1 rounded-full bg-primary/40 flex-shrink-0"></span>
              {{ item.Product?.name }}
            </span>
            <div class="flex items-center gap-3">
              <span class="text-muted text-xs font-bold">x{{ item.quantity }}</span>
              <span class="font-semibold text-xs">{{ formatPrice(item.subtotal) }}</span>
            </div>
          </div>
        </div>

        <!-- Card Footer -->
        <div class="flex items-center justify-between px-5 py-3 bg-white/[0.015] border-t border-color rounded-b-2xl">
          <span v-if="order.remarks" class="text-xs text-muted italic flex items-center gap-1 max-w-[60%] truncate">
            💬 {{ order.remarks }}
          </span>
          <span v-else></span>
          <div class="text-right">
            <span class="text-[9px] text-muted uppercase tracking-widest block">Total</span>
            <span class="font-display font-black text-xl text-primary">{{ formatPrice(order.total) }}</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue';
import api from '@/services/api';
import { useToastStore } from '@/stores/toast';
import { useAuthStore } from '@/stores/auth';

const toast = useToastStore();
const auth = useAuthStore();
const orders = ref([]);
const loading = ref(true);
const calling = ref(false);
const countdown = ref(30);
let refreshInterval = null;
let countdownInterval = null;
let callTimer = null;

const progressSteps = [
  { label: 'Reçue', statuses: ['pending'] },
  { label: 'Confirmée', statuses: ['confirmed'] },
  { label: 'Validée', statuses: ['validated'] },
  { label: 'Payée', statuses: ['paid'] },
];

const getStepStatus = (orderStatus, stepIndex) => {
  const statusOrder = ['pending', 'confirmed', 'validated', 'paid'];
  const currentIdx = statusOrder.indexOf(orderStatus);
  if (currentIdx > stepIndex) return 'done';
  if (currentIdx === stepIndex) return 'active';
  return 'pending';
};

const formatPrice = (p) => new Intl.NumberFormat('fr-FR').format(p) + ' Ar';
const formatDate = (d) => new Date(d).toLocaleString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });
const statusLabel = (s) => ({ pending: 'En attente', confirmed: 'Confirmée', validated: 'Validée', paid: 'Payée', cancelled: 'Annulée' }[s] || s);
const statusIcon = (s) => ({ pending: '⏳', confirmed: '✅', validated: '📤', paid: '💰', cancelled: '❌' }[s] || '📦');
const statusBgClass = (s) => ({
  pending: 'bg-warning/10',
  confirmed: 'bg-info/10',
  validated: 'bg-secondary/10',
  paid: 'bg-success/10',
  cancelled: 'bg-danger/10',
}[s] || 'bg-primary/10');

const fetchOrders = async () => {
  try {
    const { data } = await api.get('/client/orders/history');
    if (data.success) orders.value = data.data.orders;
  } catch {
    toast.error('Erreur de chargement');
  } finally {
    loading.value = false;
  }
};

const callServer = async () => {
  if (calling.value) return;
  calling.value = true;
  try {
    await api.post('/client/call-server', {
      session_id: auth.session?.id,
      table_name: auth.session?.table_name,
    });
    toast.success('Le serveur a été appelé !');
  } catch {
    toast.error('Erreur lors de l\'appel');
  }
  clearTimeout(callTimer);
  callTimer = setTimeout(() => { calling.value = false; }, 10000);
};

const startAutoRefresh = () => {
  refreshInterval = setInterval(() => {
    fetchOrders();
    countdown.value = 30;
  }, 30000);
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
  clearTimeout(callTimer);
});
</script>
