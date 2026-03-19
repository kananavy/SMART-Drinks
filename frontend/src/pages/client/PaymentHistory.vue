<template>
  <div class="pb-4">
    <!-- Header -->
    <div class="flex items-start justify-between mb-8 flex-wrap gap-4">
      <div>
        <h1 class="text-3xl font-display font-black tracking-tighter">MES PAIEMENTS</h1>
        <p class="text-secondary text-sm mt-1">Historique de tous vos règlements</p>
      </div>
      <div class="glass px-5 py-3 rounded-2xl border border-white/5 flex items-center gap-3">
        <span class="w-2 h-2 rounded-full bg-success animate-pulse"></span>
        <span class="text-xs font-bold uppercase tracking-widest text-muted">{{ payments.length }} paiement{{ payments.length !== 1 ? 's' : '' }}</span>
      </div>
    </div>

    <!-- Summary -->
    <div v-if="!loading && payments.length > 0" class="grid grid-cols-2 gap-4 mb-8">
      <div class="glass-card p-5 text-center">
        <span class="text-2xl font-display font-black text-success block">{{ formatPrice(totalPaid) }}</span>
        <span class="text-[10px] uppercase tracking-widest text-muted font-bold mt-1 block">Total paye</span>
      </div>
      <div class="glass-card p-5 text-center">
        <span class="text-2xl font-display font-black text-primary block">{{ paidCount }}</span>
        <span class="text-[10px] uppercase tracking-widest text-muted font-bold mt-1 block">Transactions</span>
      </div>
    </div>

    <div v-if="loading" class="flex justify-center py-20"><div class="spinner"></div></div>

    <div v-else-if="payments.length === 0" class="glass-card text-center py-20">
      <div class="text-6xl mb-4">💳</div>
      <p class="font-display font-bold text-xl mb-2">Aucun paiement</p>
      <p class="text-secondary text-sm">Votre historique de paiements est vide.</p>
    </div>

    <div v-else class="space-y-4">
      <div v-for="payment in payments" :key="payment.id" class="glass-card overflow-hidden">
        <!-- Header -->
        <div class="flex items-center justify-between px-5 py-4 border-b border-color">
          <div class="flex items-center gap-3">
            <div :class="['w-10 h-10 rounded-2xl flex items-center justify-center text-xl flex-shrink-0',
                          payment.status === 'paid' ? 'bg-success/10' : 'bg-danger/10']">
              {{ methodIcon(payment.method) }}
            </div>
            <div>
              <p class="font-display font-black text-base tracking-tight">
                {{ payment.Order?.order_number || 'CMD-' + payment.id }}
              </p>
              <p class="text-[10px] text-muted uppercase tracking-widest mt-0.5">{{ formatDate(payment.created_at) }}</p>
            </div>
          </div>
          <span :class="['badge', payment.status === 'paid' ? 'badge-paid' : 'badge-unpaid']">
            {{ payment.status === 'paid' ? 'Paye' : 'Non paye' }}
          </span>
        </div>

        <!-- Details -->
        <div class="grid grid-cols-2 gap-0 divide-x divide-color">
          <div class="px-5 py-4">
            <p class="text-[9px] uppercase tracking-widest text-muted font-bold mb-1">Mode de paiement</p>
            <div class="flex items-center gap-2">
              <span class="text-base">{{ methodIcon(payment.method) }}</span>
              <span class="text-sm font-bold">{{ methodLabel(payment.method) }}</span>
            </div>
          </div>
          <div class="px-5 py-4">
            <p class="text-[9px] uppercase tracking-widest text-muted font-bold mb-1">Montant</p>
            <span class="font-display font-black text-2xl text-success">{{ formatPrice(payment.amount) }}</span>
          </div>
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
const payments = ref([]);
const loading = ref(true);

const formatPrice = (p) => new Intl.NumberFormat('fr-FR').format(p || 0) + ' Ar';
const formatDate = (d) => new Date(d).toLocaleString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });
const methodLabel = (m) => ({ cash: 'Especes', mobile_money: 'Mobile Money', card: 'Carte' }[m] || (m || 'N/A'));
const methodIcon = (m) => ({ cash: '💵', mobile_money: '📱', card: '💳' }[m] || '💰');

const totalPaid = computed(() => payments.value.filter(p => p.status === 'paid').reduce((s, p) => s + (p.amount || 0), 0));
const paidCount = computed(() => payments.value.filter(p => p.status === 'paid').length);

onMounted(async () => {
  try {
    const { data } = await api.get('/client/payments/history');
    if (data.success) payments.value = data.data.payments;
  } catch (err) {
    toast.error('Erreur de chargement');
  } finally {
    loading.value = false;
  }
});
</script>

<style scoped>
.divide-color > * + * {
  border-color: var(--border-color, rgba(255,255,255,0.08));
}
</style>
