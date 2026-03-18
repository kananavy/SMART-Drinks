<template>
  <div class="history-page">
    <h1>📦 Historique des Commandes</h1>
    <div v-if="loading" class="loading-center"><div class="spinner"></div></div>
    <div v-else-if="orders.length === 0" class="empty-state glass-card">
      <p>Aucune commande pour le moment</p>
    </div>
    <div v-else class="orders-list">
      <div v-for="order in orders" :key="order.id" class="order-card glass-card">
        <div class="order-header">
          <div>
            <span class="order-number">{{ order.order_number }}</span>
            <span :class="['badge', `badge-${order.status}`]">{{ statusLabel(order.status) }}</span>
          </div>
          <span class="order-date">{{ formatDate(order.created_at) }}</span>
        </div>
        <div class="order-items">
          <div v-for="item in order.items" :key="item.id" class="order-item">
            <span>{{ item.Product?.name }}</span>
            <span>× {{ item.quantity }}</span>
            <span class="item-total">{{ formatPrice(item.subtotal) }}</span>
          </div>
        </div>
        <div class="order-footer">
          <span v-if="order.is_takeaway" class="badge badge-confirmed">À emporter</span>
          <span v-if="order.remarks" class="order-remarks">💬 {{ order.remarks }}</span>
          <span class="order-total">Total: {{ formatPrice(order.total) }}</span>
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
const formatDate = (d) => new Date(d).toLocaleString('fr-FR');
const statusLabel = (s) => ({ pending: 'En attente', confirmed: 'Confirmée', validated: 'Validée', paid: 'Payée', cancelled: 'Annulée' }[s] || s);

onMounted(async () => {
  try {
    const { data } = await api.get('/client/orders/history');
    if (data.success) orders.value = data.data.orders;
  } catch (err) { toast.error('Erreur de chargement'); }
  finally { loading.value = false; }
});
</script>

<style scoped>
.history-page h1 { font-family: var(--font-display); font-size: 28px; font-weight: 800; margin-bottom: 24px; }
.loading-center { display: flex; justify-content: center; padding: 60px; }
.empty-state { padding: 60px; text-align: center; color: var(--text-muted); }
.orders-list { display: flex; flex-direction: column; gap: 16px; }
.order-card { padding: 20px; }
.order-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px; gap: 8px; flex-wrap: wrap; }
.order-number { font-weight: 700; font-size: 15px; margin-right: 8px; }
.order-date { font-size: 12px; color: var(--text-muted); }
.order-items { display: flex; flex-direction: column; gap: 6px; margin-bottom: 12px; padding-bottom: 12px; border-bottom: 1px solid var(--border-color); }
.order-item { display: flex; justify-content: space-between; font-size: 13px; color: var(--text-secondary); }
.item-total { font-weight: 600; color: var(--text-primary); }
.order-footer { display: flex; align-items: center; gap: 12px; flex-wrap: wrap; }
.order-remarks { font-size: 12px; color: var(--text-muted); flex: 1; }
.order-total { font-size: 16px; font-weight: 800; color: var(--primary-light); margin-left: auto; }
</style>
