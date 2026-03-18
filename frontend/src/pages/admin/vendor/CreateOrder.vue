<template>
  <div class="create-order-page">
    <h1>➕ Nouvelle Commande (Sur place)</h1>
    <div class="create-grid">
      <!-- Product Selection -->
      <div class="product-selection glass-card">
        <h2>Sélection des produits</h2>
        <div class="category-tabs">
          <button v-for="cat in categories" :key="cat.id" :class="['tab', { active: activeCat === cat.id }]" @click="activeCat = cat.id">
            {{ cat.icon }} {{ cat.name }}
          </button>
        </div>
        <div class="product-list">
          <div v-for="p in filteredProducts" :key="p.id" class="product-row" @click="addItem(p)">
            <span>{{ p.name }}</span>
            <span class="p-price">{{ formatPrice(p.price) }}</span>
            <span class="p-stock">{{ p.stock_quantity }} en stock</span>
          </div>
        </div>
      </div>

      <!-- Order Summary -->
      <div class="order-summary glass-card">
        <h2>Résumé de Commande</h2>
        <div v-if="items.length === 0" class="cart-empty">Ajoutez des produits</div>
        <div v-else class="summary-items">
          <div v-for="item in items" :key="item.product_id" class="summary-row">
            <span class="s-name">{{ item.name }}</span>
            <div class="s-qty">
              <button @click="item.quantity = Math.max(1, item.quantity - 1)" class="qty-btn">-</button>
              <span>{{ item.quantity }}</span>
              <button @click="item.quantity++" class="qty-btn">+</button>
            </div>
            <span class="s-total">{{ formatPrice(item.price * item.quantity) }}</span>
            <button @click="removeItem(item.product_id)" class="remove-btn">✕</button>
          </div>
        </div>

        <div class="summary-options">
          <label class="takeaway-toggle">
            <input type="checkbox" v-model="isTakeaway" />
            <span>À emporter (appliquer consignation)</span>
          </label>
          <div class="input-group">
            <label>Remarques</label>
            <textarea v-model="remarks" class="input-field" rows="2"></textarea>
          </div>
        </div>

        <div class="summary-total">
          <span>Total</span>
          <span class="total-amount">{{ formatPrice(total) }}</span>
        </div>
        <button @click="submitOrder" class="btn btn-primary btn-lg" :disabled="items.length === 0 || submitting" style="width:100%">
          {{ submitting ? 'Création...' : 'Créer la Commande' }}
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import api from '@/services/api';
import { useToastStore } from '@/stores/toast';

const router = useRouter();
const toast = useToastStore();
const categories = ref([]);
const allProducts = ref([]);
const activeCat = ref(null);
const items = ref([]);
const isTakeaway = ref(false);
const remarks = ref('');
const submitting = ref(false);

const filteredProducts = computed(() => {
  if (!activeCat.value) return allProducts.value;
  return allProducts.value.filter(p => p.category_id === activeCat.value);
});

const total = computed(() => {
  return items.value.reduce((sum, i) => {
    const consign = isTakeaway.value ? (i.consignation_price || 0) : 0;
    return sum + (i.price + consign) * i.quantity;
  }, 0);
});

const formatPrice = (p) => new Intl.NumberFormat('fr-FR').format(p) + ' Ar';

const addItem = (product) => {
  const existing = items.value.find(i => i.product_id === product.id);
  if (existing) { existing.quantity++; }
  else {
    items.value.push({
      product_id: product.id, name: product.name,
      price: parseFloat(product.price),
      consignation_price: parseFloat(product.consignation_price || 0),
      quantity: 1,
    });
  }
};

const removeItem = (id) => { items.value = items.value.filter(i => i.product_id !== id); };

const submitOrder = async () => {
  submitting.value = true;
  try {
    const { data } = await api.post('/vendor/orders', {
      items: items.value.map(i => ({ product_id: i.product_id, quantity: i.quantity })),
      is_takeaway: isTakeaway.value,
      remarks: remarks.value,
    });
    if (data.success) {
      toast.success(`Commande ${data.data.order.order_number} créée`);
      router.push('/admin/orders');
    }
  } catch (err) { toast.error(err.response?.data?.message || 'Erreur'); }
  finally { submitting.value = false; }
};

onMounted(async () => {
  try {
    const { data } = await api.get('/client/menu');
    if (data.success) {
      categories.value = data.data.categories;
      allProducts.value = data.data.categories.flatMap(c => (c.Products || []).map(p => ({ ...p, category_id: c.id })));
      if (categories.value.length > 0) activeCat.value = categories.value[0].id;
    }
  } catch (err) { toast.error('Erreur chargement menu'); }
});
</script>

<style scoped>
.create-order-page h1 { font-family: var(--font-display); font-size: 28px; font-weight: 800; margin-bottom: 24px; }
.create-grid { display: grid; grid-template-columns: 1fr 400px; gap: 24px; }
.product-selection, .order-summary { padding: 24px; }
.product-selection h2, .order-summary h2 { font-size: 18px; font-weight: 700; margin-bottom: 16px; }
.category-tabs { display: flex; gap: 6px; flex-wrap: wrap; margin-bottom: 16px; }
.tab { padding: 6px 14px; border-radius: var(--radius-full); border: 1px solid var(--border-color); background: transparent; color: var(--text-secondary); font-size: 12px; cursor: pointer; }
.tab.active { background: var(--primary); color: white; border-color: var(--primary); }
.product-list { max-height: 500px; overflow-y: auto; display: flex; flex-direction: column; gap: 4px; }
.product-row { display: flex; justify-content: space-between; align-items: center; padding: 10px 14px; border-radius: var(--radius-md); cursor: pointer; transition: background 0.2s; font-size: 13px; }
.product-row:hover { background: rgba(99, 102, 241, 0.1); }
.p-price { font-weight: 600; color: var(--primary-light); }
.p-stock { font-size: 11px; color: var(--text-muted); }
.cart-empty { text-align: center; padding: 40px; color: var(--text-muted); }
.summary-items { display: flex; flex-direction: column; gap: 8px; margin-bottom: 16px; }
.summary-row { display: flex; align-items: center; gap: 8px; font-size: 13px; }
.s-name { flex: 1; }
.s-qty { display: flex; align-items: center; gap: 6px; }
.qty-btn { width: 24px; height: 24px; border-radius: 50%; border: 1px solid var(--border-color); background: transparent; color: var(--text-primary); cursor: pointer; display: flex; align-items: center; justify-content: center; font-size: 12px; }
.s-total { font-weight: 600; color: var(--primary-light); min-width: 80px; text-align: right; }
.remove-btn { background: none; border: none; cursor: pointer; color: var(--danger); font-size: 14px; }
.summary-options { padding: 16px 0; border-top: 1px solid var(--border-color); }
.takeaway-toggle { display: flex; align-items: center; gap: 8px; font-size: 13px; cursor: pointer; margin-bottom: 12px; }
.takeaway-toggle input { accent-color: var(--primary); }
.summary-total { display: flex; justify-content: space-between; align-items: center; padding: 16px 0; border-top: 1px solid var(--border-color); margin-bottom: 16px; }
.total-amount { font-size: 22px; font-weight: 800; color: var(--primary-light); }
@media (max-width: 900px) { .create-grid { grid-template-columns: 1fr; } }
</style>
