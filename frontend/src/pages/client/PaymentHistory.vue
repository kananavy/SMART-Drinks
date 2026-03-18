<template>
  <div class="history-page">
    <h1>💳 Historique des Paiements</h1>
    <div v-if="loading" class="loading-center"><div class="spinner"></div></div>
    <div v-else-if="payments.length === 0" class="empty-state glass-card">
      <p>Aucun paiement pour le moment</p>
    </div>
    <div v-else class="payments-list">
      <div v-for="payment in payments" :key="payment.id" class="payment-card glass-card">
        <div class="payment-header">
          <span class="payment-ref">{{ payment.Order?.order_number }}</span>
          <span :class="['badge', payment.status === 'paid' ? 'badge-paid' : 'badge-unpaid']">
            {{ payment.status === 'paid' ? 'Payé' : 'Non payé' }}
          </span>
        </div>
        <div class="payment-details">
          <div class="detail-item">
            <span class="detail-label">Montant</span>
            <span class="detail-value amount">{{ formatPrice(payment.amount) }}</span>
          </div>
          <div class="detail-item">
            <span class="detail-label">Mode</span>
            <span class="detail-value">{{ methodLabel(payment.method) }}</span>
          </div>
          <div class="detail-item">
            <span class="detail-label">Date</span>
            <span class="detail-value">{{ formatDate(payment.created_at) }}</span>
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
const payments = ref([]);
const loading = ref(true);

const formatPrice = (p) => new Intl.NumberFormat('fr-FR').format(p) + ' Ar';
const formatDate = (d) => new Date(d).toLocaleString('fr-FR');
const methodLabel = (m) => ({ cash: 'Espèces', mobile_money: 'Mobile Money', card: 'Carte' }[m] || m);

onMounted(async () => {
  try {
    const { data } = await api.get('/client/payments/history');
    if (data.success) payments.value = data.data.payments;
  } catch (err) { toast.error('Erreur de chargement'); }
  finally { loading.value = false; }
});
</script>

<style scoped>
.history-page h1 { font-family: var(--font-display); font-size: 28px; font-weight: 800; margin-bottom: 24px; }
.loading-center { display: flex; justify-content: center; padding: 60px; }
.empty-state { padding: 60px; text-align: center; color: var(--text-muted); }
.payments-list { display: flex; flex-direction: column; gap: 16px; }
.payment-card { padding: 20px; }
.payment-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px; }
.payment-ref { font-weight: 700; font-size: 15px; }
.payment-details { display: grid; grid-template-columns: repeat(auto-fit, minmax(120px, 1fr)); gap: 16px; }
.detail-item { display: flex; flex-direction: column; gap: 4px; }
.detail-label { font-size: 11px; color: var(--text-muted); text-transform: uppercase; letter-spacing: 0.5px; }
.detail-value { font-size: 14px; font-weight: 600; }
.amount { font-size: 18px; color: var(--primary-light); }
</style>
