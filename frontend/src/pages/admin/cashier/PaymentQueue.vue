<template>
  <div class="payments-page">
    <h1>💳 Gestion des Paiements</h1>
    <div v-if="loading" class="loading-center"><div class="spinner"></div></div>
    <div v-else-if="orders.length === 0" class="empty-state glass-card"><p>Aucune commande à traiter</p></div>
    <div v-else class="orders-list">
      <div v-for="order in orders" :key="order.id" class="payment-card glass-card">
        <div class="card-top">
          <div>
            <span class="order-num">{{ order.order_number }}</span>
            <span :class="['badge', `badge-${order.status}`]">{{ statusLabel(order.status) }}</span>
          </div>
          <span class="table-name" v-if="order.ClientSession">🪑 {{ order.ClientSession.table_name }}</span>
        </div>
        <div class="card-items">
          <div v-for="item in order.items" :key="item.id" class="p-item">
            <span>{{ item.Product?.name }} × {{ item.quantity }}</span>
            <span>{{ formatPrice(item.subtotal) }}</span>
          </div>
        </div>
        <div class="card-total">
          <span>Total à payer</span>
          <span class="amount">{{ formatPrice(order.total) }}</span>
        </div>

        <!-- Payment form (if not paid) -->
        <div v-if="order.status !== 'paid'" class="payment-form">
          <div class="method-select">
            <button v-for="m in methods" :key="m.value"
              :class="['method-btn', { active: selectedMethod[order.id] === m.value }]"
              @click="selectedMethod[order.id] = m.value"
            >
              {{ m.icon }} {{ m.label }}
            </button>
          </div>
          <button @click="processPayment(order.id)" class="btn btn-success btn-sm" :disabled="processing[order.id]">
            {{ processing[order.id] ? 'Traitement...' : '✅ Encaisser' }}
          </button>
        </div>
        <div v-else class="paid-info">
          <span class="badge badge-paid">✅ Payé</span>
          <span>{{ methodLabel(order.Payment?.method) }}</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue';
import api from '@/services/api';
import { useToastStore } from '@/stores/toast';

const toast = useToastStore();
const orders = ref([]);
const loading = ref(true);
const selectedMethod = reactive({});
const processing = reactive({});

const methods = [
  { value: 'cash', icon: '💵', label: 'Espèces' },
  { value: 'mobile_money', icon: '📱', label: 'Mobile Money' },
  { value: 'card', icon: '💳', label: 'Carte' },
];

const formatPrice = (p) => new Intl.NumberFormat('fr-FR').format(p) + ' Ar';
const statusLabel = (s) => ({ pending: 'En attente', confirmed: 'Confirmée', validated: 'Validée', paid: 'Payée' }[s] || s);
const methodLabel = (m) => ({ cash: 'Espèces', mobile_money: 'Mobile Money', card: 'Carte' }[m] || m);

const fetchOrders = async () => {
  loading.value = true;
  try {
    const { data } = await api.get('/cashier/orders');
    if (data.success) {
      orders.value = data.data.orders;
      orders.value.forEach(o => { if (!selectedMethod[o.id]) selectedMethod[o.id] = 'cash'; });
    }
  } catch (err) { toast.error('Erreur de chargement'); }
  finally { loading.value = false; }
};

const processPayment = async (orderId) => {
  processing[orderId] = true;
  try {
    await api.post('/cashier/payments', {
      order_id: orderId,
      method: selectedMethod[orderId] || 'cash',
    });
    toast.success('Paiement enregistré');
    fetchOrders();
  } catch (err) { toast.error(err.response?.data?.message || 'Erreur'); }
  finally { processing[orderId] = false; }
};

onMounted(fetchOrders);
</script>

<style scoped>
.payments-page h1 { font-family: var(--font-display); font-size: 28px; font-weight: 800; margin-bottom: 24px; }
.loading-center { display: flex; justify-content: center; padding: 60px; }
.empty-state { padding: 60px; text-align: center; color: var(--text-muted); }
.orders-list { display: grid; grid-template-columns: repeat(auto-fill, minmax(380px, 1fr)); gap: 16px; }
.payment-card { padding: 20px; display: flex; flex-direction: column; gap: 12px; }
.card-top { display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 8px; }
.order-num { font-weight: 700; font-size: 15px; margin-right: 8px; }
.table-name { font-size: 13px; color: var(--text-secondary); }
.card-items { display: flex; flex-direction: column; gap: 4px; padding: 10px 0; border-top: 1px solid var(--border-color); border-bottom: 1px solid var(--border-color); }
.p-item { display: flex; justify-content: space-between; font-size: 13px; color: var(--text-secondary); }
.card-total { display: flex; justify-content: space-between; font-size: 14px; }
.amount { font-size: 20px; font-weight: 800; color: var(--primary-light); }
.payment-form { display: flex; flex-direction: column; gap: 12px; padding-top: 12px; border-top: 1px solid var(--border-color); }
.method-select { display: flex; gap: 8px; }
.method-btn { padding: 8px 14px; border-radius: var(--radius-md); border: 1px solid var(--border-color); background: transparent; color: var(--text-secondary); font-size: 12px; cursor: pointer; transition: all 0.2s; }
.method-btn.active { border-color: var(--primary); background: rgba(99, 102, 241, 0.15); color: var(--primary-light); }
.paid-info { display: flex; align-items: center; gap: 12px; font-size: 13px; color: var(--text-secondary); }
</style>
