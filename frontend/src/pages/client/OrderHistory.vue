<template>
  <div class="pb-4">
    <!-- Header -->
    <div class="flex items-start justify-between mb-8 flex-wrap gap-4">
      <div>
        <h1 class="text-3xl font-display font-black tracking-tighter">MES COMMANDES</h1>
        <p class="text-secondary text-sm mt-1">Historique complet de vos commandes</p>
      </div>
      <div class="glass px-5 py-3 rounded-2xl border border-white/5 flex items-center gap-3">
        <span class="w-2 h-2 rounded-full bg-primary animate-pulse"></span>
        <span class="text-xs font-bold uppercase tracking-widest text-muted">{{ orders.length }} commande{{ orders.length !== 1 ? 's' : '' }}</span>
      </div>
    </div>

    <div v-if="loading" class="flex justify-center py-20"><div class="spinner"></div></div>

    <div v-else-if="orders.length === 0" class="glass-card text-center py-20">
      <div class="text-6xl mb-4">📦</div>
      <p class="font-display font-bold text-xl mb-2">Aucune commande</p>
      <p class="text-secondary text-sm">Votre historique de commandes est vide.</p>
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
import { ref, onMounted } from 'vue';
import api from '@/services/api';
import { useToastStore } from '@/stores/toast';

const toast = useToastStore();
const orders = ref([]);
const loading = ref(true);

const formatPrice = (p) => new Intl.NumberFormat('fr-FR').format(p) + ' Ar';
const formatDate = (d) => new Date(d).toLocaleString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });
const statusLabel = (s) => ({ pending: 'En attente', confirmed: 'Confirmee', validated: 'Validee', paid: 'Payee', cancelled: 'Annulee' }[s] || s);

const statusIcon = (s) => ({ pending: '⏳', confirmed: '✅', validated: '📤', paid: '💰', cancelled: '❌' }[s] || '📦');

const statusBgClass = (s) => ({
  pending: 'bg-warning/10',
  confirmed: 'bg-info/10',
  validated: 'bg-secondary/10',
  paid: 'bg-success/10',
  cancelled: 'bg-danger/10',
}[s] || 'bg-primary/10');

onMounted(async () => {
  try {
    const { data } = await api.get('/client/orders/history');
    if (data.success) orders.value = data.data.orders;
  } catch (err) {
    toast.error('Erreur de chargement');
  } finally {
    loading.value = false;
  }
});
</script>
