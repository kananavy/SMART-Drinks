<template>
  <div class="orders-page">
    <div class="page-header">
      <h1>📋 Gestion des Commandes</h1>
      <div class="filter-tabs">
        <button v-for="s in statuses" :key="s.value" :class="['tab', { active: activeStatus === s.value }]" @click="fetchOrders(s.value)">
          {{ s.label }}
        </button>
      </div>
    </div>

    <div v-if="loading" class="loading-center"><div class="spinner"></div></div>
    <div v-else-if="orders.length === 0" class="empty-state glass-card"><p>Aucune commande</p></div>
    <div v-else class="orders-grid">
      <div v-for="order in orders" :key="order.id" class="order-card glass-card">
        <div class="order-top">
          <div>
            <span class="order-num">{{ order.order_number }}</span>
            <span :class="['badge', `badge-${order.status}`]">{{ statusLabel(order.status) }}</span>
          </div>
          <span class="order-table" v-if="order.ClientSession">🪑 {{ order.ClientSession.table_name }}</span>
        </div>
        <div class="order-items">
          <div v-for="item in order.items" :key="item.id" class="o-item">
            <span>{{ item.Product?.name }} × {{ item.quantity }}</span>
            <span>{{ formatPrice(item.subtotal) }}</span>
          </div>
        </div>
        <div v-if="order.remarks" class="order-remarks">💬 {{ order.remarks }}</div>
        <div class="order-bottom">
          <span class="order-total">{{ formatPrice(order.total) }}</span>
          <span class="order-time">{{ formatDate(order.created_at) }}</span>
        </div>
        <div class="order-actions">
          <button v-if="order.status === 'pending'" @click="confirmOrder(order.id)" class="btn btn-primary btn-sm">✅ Confirmer</button>
          <button v-if="order.status === 'confirmed'" @click="validateOrder(order.id)" class="btn btn-success btn-sm">📤 Valider</button>
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
const activeStatus = ref('');

const statuses = [
  { value: '', label: 'Toutes' },
  { value: 'pending', label: 'En attente' },
  { value: 'confirmed', label: 'Confirmées' },
  { value: 'validated', label: 'Validées' },
];

const formatPrice = (p) => new Intl.NumberFormat('fr-FR').format(p) + ' Ar';
const formatDate = (d) => new Date(d).toLocaleString('fr-FR');
const statusLabel = (s) => ({ pending: 'En attente', confirmed: 'Confirmée', validated: 'Validée', paid: 'Payée', cancelled: 'Annulée' }[s] || s);

const fetchOrders = async (status = '') => {
  activeStatus.value = status;
  loading.value = true;
  try {
    const params = status ? { status } : {};
    const { data } = await api.get('/vendor/orders', { params });
    if (data.success) orders.value = data.data.orders;
  } catch (err) { toast.error('Erreur de chargement'); }
  finally { loading.value = false; }
};

const confirmOrder = async (id) => {
  try {
    await api.put(`/vendor/orders/${id}/confirm`);
    toast.success('Commande confirmée');
    fetchOrders(activeStatus.value);
  } catch (err) { toast.error(err.response?.data?.message || 'Erreur'); }
};

const validateOrder = async (id) => {
  try {
    await api.put(`/vendor/orders/${id}/validate`);
    toast.success('Commande validée et envoyée au caissier');
    fetchOrders(activeStatus.value);
  } catch (err) { toast.error(err.response?.data?.message || 'Erreur'); }
};

onMounted(() => fetchOrders());
</script>

<style scoped>
.page-header { display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 16px; margin-bottom: 24px; }
.page-header h1 { font-family: var(--font-display); font-size: 28px; font-weight: 800; }
.filter-tabs { display: flex; gap: 6px; }
.tab { padding: 8px 16px; border-radius: var(--radius-full); border: 1px solid var(--border-color); background: transparent; color: var(--text-secondary); font-size: 12px; font-weight: 500; cursor: pointer; transition: all 0.2s; }
.tab.active { background: var(--primary); color: white; border-color: var(--primary); }
.loading-center { display: flex; justify-content: center; padding: 60px; }
.empty-state { padding: 60px; text-align: center; color: var(--text-muted); }
.orders-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(340px, 1fr)); gap: 16px; }
.order-card { padding: 20px; display: flex; flex-direction: column; gap: 12px; }
.order-top { display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 8px; }
.order-num { font-weight: 700; font-size: 15px; margin-right: 8px; }
.order-table { font-size: 13px; color: var(--text-secondary); }
.order-items { display: flex; flex-direction: column; gap: 4px; padding: 10px 0; border-top: 1px solid var(--border-color); border-bottom: 1px solid var(--border-color); }
.o-item { display: flex; justify-content: space-between; font-size: 13px; color: var(--text-secondary); }
.order-remarks { font-size: 12px; color: var(--text-muted); }
.order-bottom { display: flex; justify-content: space-between; align-items: center; }
.order-total { font-size: 18px; font-weight: 800; color: var(--primary-light); }
.order-time { font-size: 12px; color: var(--text-muted); }
.order-actions { display: flex; gap: 8px; }
</style>
