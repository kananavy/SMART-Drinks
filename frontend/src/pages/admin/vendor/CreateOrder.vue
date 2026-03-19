<template>
  <div class="pb-4">
    <!-- Header -->
    <div class="mb-8">
      <h1 class="text-3xl font-display font-black tracking-tighter">NOUVELLE COMMANDE</h1>
      <p class="text-secondary text-sm mt-1">Commande directe — sur place ou a emporter</p>
    </div>

    <div class="flex flex-col xl:flex-row gap-6 items-start">
      <!-- LEFT: Product Selection -->
      <div class="flex-1 min-w-0 space-y-5">

        <!-- Search + Category Tabs -->
        <div class="glass-card p-5">
          <div class="relative mb-4">
            <span class="absolute left-3 top-1/2 -translate-y-1/2 text-muted text-sm">🔍</span>
            <input
              v-model="searchQuery"
              type="text"
              placeholder="Rechercher un produit..."
              class="input-premium pl-9 w-full"
            />
            <button v-if="searchQuery" @click="searchQuery = ''"
              class="absolute right-3 top-1/2 -translate-y-1/2 text-muted hover:text-white transition-colors text-sm">✕</button>
          </div>
          <div class="flex gap-2 overflow-x-auto pb-1 scroll-hide">
            <button
              :class="['flex-shrink-0 px-4 py-2 rounded-full border transition-all font-bold text-xs uppercase tracking-widest',
                       activeCat === null ? 'bg-primary border-primary text-white shadow-glow' : 'glass border-color text-secondary hover:border-primary/40']"
              @click="activeCat = null; searchQuery = ''"
            >
              🛒 Tous
            </button>
            <button
              v-for="cat in categories" :key="cat.id"
              :class="['flex-shrink-0 px-4 py-2 rounded-full border transition-all font-bold text-xs uppercase tracking-widest',
                       activeCat === cat.id ? 'bg-primary border-primary text-white shadow-glow' : 'glass border-color text-secondary hover:border-primary/40']"
              @click="activeCat = cat.id; searchQuery = ''"
            >
              {{ cat.icon }} {{ cat.name }}
            </button>
          </div>
        </div>

        <!-- Products Grid -->
        <div v-if="productLoading" class="flex justify-center py-12"><div class="spinner"></div></div>

        <div v-else-if="filteredProducts.length === 0" class="glass-card text-center py-12">
          <div class="text-4xl mb-3">📦</div>
          <p class="text-secondary text-sm">Aucun produit correspondant</p>
        </div>

        <div v-else class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
          <div
            v-for="product in filteredProducts" :key="product.id"
            :class="['glass-card p-4 flex flex-col gap-2 cursor-pointer transition-all relative overflow-hidden',
                     product.stock_quantity <= 0 ? 'opacity-50 pointer-events-none' : 'hover:border-primary/40 hover:shadow-glow']"
            @click="addItem(product)"
          >
            <!-- Stock -->
            <div class="absolute top-2 right-2">
              <span :class="['text-[8px] font-black px-1.5 py-0.5 rounded-full uppercase',
                             product.stock_quantity > 5 ? 'bg-success/20 text-success' :
                             product.stock_quantity > 0 ? 'bg-warning/20 text-warning' :
                             'bg-danger/20 text-danger']">
                {{ product.stock_quantity > 0 ? product.stock_quantity : '0' }}
              </span>
            </div>

            <!-- In cart indicator -->
            <div v-if="getQty(product.id) > 0"
              class="absolute top-2 left-2 bg-primary text-white text-[10px] font-black w-5 h-5 rounded-full flex items-center justify-center">
              {{ getQty(product.id) }}
            </div>

            <div class="pt-3">
              <p class="font-bold text-sm leading-tight">{{ product.name }}</p>
              <p class="text-primary font-display font-black text-base mt-2">{{ formatPrice(product.price) }}</p>
              <p v-if="product.consignation_price > 0" class="text-[9px] text-accent font-bold">
                +{{ formatPrice(product.consignation_price) }} consigne
              </p>
            </div>

            <div :class="['w-full py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest text-center transition-all mt-1',
                          getQty(product.id) > 0 ? 'bg-primary/20 text-primary border border-primary/30' : 'bg-white/5 text-muted']">
              {{ getQty(product.id) > 0 ? 'Ajoute' : '+ Ajouter' }}
            </div>
          </div>
        </div>
      </div>

      <!-- RIGHT: Order Cart -->
      <div class="w-full xl:w-[380px] flex-shrink-0 sticky top-5">
        <div class="glass-card overflow-hidden">
          <!-- Cart Header -->
          <div class="px-5 py-4 border-b border-color flex items-center justify-between bg-primary/5">
            <div class="flex items-center gap-2">
              <span class="text-xl">🧾</span>
              <h2 class="font-display font-black text-base tracking-tight">RESUME</h2>
              <span v-if="items.length > 0" class="bg-primary text-white text-[10px] font-black w-5 h-5 rounded-full flex items-center justify-center">
                {{ totalItems }}
              </span>
            </div>
            <button v-if="items.length > 0" @click="items = []" class="text-[10px] text-danger font-bold hover:underline">
              Vider
            </button>
          </div>

          <!-- Table Name -->
          <div class="px-5 pt-4">
            <label class="block text-[9px] font-black uppercase tracking-widest text-muted mb-1.5">Nom de la table (optionnel)</label>
            <input v-model="tableName" class="input-premium w-full text-sm" placeholder="Ex: VIP 1, Table 5..." />
          </div>

          <!-- Empty state -->
          <div v-if="items.length === 0" class="px-5 py-10 text-center opacity-50">
            <div class="text-4xl mb-3">🛒</div>
            <p class="text-secondary text-sm">Cliquez sur un produit pour l'ajouter</p>
          </div>

          <!-- Items list -->
          <div v-else class="px-5 py-3 max-h-[280px] overflow-y-auto scroll-hide space-y-2">
            <div v-for="item in items" :key="item.product_id"
              class="flex items-center gap-3 glass-card p-3 border-white/5">
              <div class="flex-1 min-w-0">
                <p class="text-sm font-bold truncate">{{ item.name }}</p>
                <p class="text-xs text-primary font-bold">{{ formatPrice(item.price) }}</p>
              </div>
              <!-- Qty controls -->
              <div class="flex items-center gap-1.5 bg-white/5 rounded-xl px-2 py-1 border border-white/8">
                <button @click="item.quantity = Math.max(1, item.quantity - 1)" class="text-secondary hover:text-white text-sm font-bold w-4 text-center">−</button>
                <span class="font-display font-black text-sm w-5 text-center">{{ item.quantity }}</span>
                <button @click="item.quantity++" class="text-primary hover:text-white text-sm font-bold w-4 text-center">+</button>
              </div>
              <!-- Item total -->
              <span class="text-xs font-bold text-secondary min-w-[70px] text-right">{{ formatPrice(item.price * item.quantity) }}</span>
              <button @click="removeItem(item.product_id)" class="text-danger/60 hover:text-danger text-base transition-colors">✕</button>
            </div>
          </div>

          <!-- Options & Total -->
          <div class="px-5 py-4 border-t border-color space-y-3">
            <!-- Takeaway toggle -->
            <div class="flex items-center justify-between glass-card p-3 border-white/5">
              <div>
                <p class="text-xs font-bold">A emporter</p>
                <p class="text-[10px] text-muted">Appliquer les consignes</p>
              </div>
              <button @click="isTakeaway = !isTakeaway"
                :class="['w-10 h-5 rounded-full transition-all relative', isTakeaway ? 'bg-primary' : 'bg-white/10']">
                <span :class="['absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-all', isTakeaway ? 'left-5' : 'left-0.5']"></span>
              </button>
            </div>

            <!-- Remarks -->
            <div>
              <label class="block text-[9px] font-black uppercase tracking-widest text-muted mb-1.5">Remarques</label>
              <textarea v-model="remarks" class="input-premium w-full text-xs resize-none h-14 py-2" placeholder="Remarques, instructions speciales..."></textarea>
            </div>

            <!-- Total breakdown -->
            <div class="space-y-1.5 pt-1">
              <div class="flex justify-between text-xs text-secondary font-bold">
                <span>Sous-total</span>
                <span>{{ formatPrice(subtotal) }}</span>
              </div>
              <div v-if="isTakeaway && consignTotal > 0" class="flex justify-between text-xs text-accent font-bold">
                <span>Consignes</span>
                <span>+ {{ formatPrice(consignTotal) }}</span>
              </div>
              <div class="flex justify-between items-center pt-2 border-t border-color">
                <span class="text-xs font-black uppercase tracking-widest">TOTAL</span>
                <span class="font-display font-black text-2xl text-primary">{{ formatPrice(total) }}</span>
              </div>
            </div>

            <!-- Submit -->
            <button
              @click="submitOrder"
              :disabled="items.length === 0 || submitting"
              class="btn btn-primary w-full py-4 font-black tracking-widest text-sm"
            >
              <span v-if="!submitting">CREER LA COMMANDE →</span>
              <span v-else class="flex items-center gap-2 justify-center"><span class="animate-spin">🔄</span> Creation...</span>
            </button>
          </div>
        </div>
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
const activeCat = ref(null); // null = tous les produits
const searchQuery = ref('');
const items = ref([]);
const tableName = ref('');
const isTakeaway = ref(false);
const remarks = ref('');
const submitting = ref(false);
const productLoading = ref(true);

const filteredProducts = computed(() => {
  let list = allProducts.value;
  if (activeCat.value !== null) list = list.filter(p => p.category_id === activeCat.value);
  if (searchQuery.value.trim()) {
    const q = searchQuery.value.toLowerCase().trim();
    list = list.filter(p => p.name.toLowerCase().includes(q));
  }
  return list;
});

const totalItems = computed(() => items.value.reduce((s, i) => s + i.quantity, 0));

const subtotal = computed(() =>
  items.value.reduce((s, i) => s + i.price * i.quantity, 0)
);

const consignTotal = computed(() =>
  isTakeaway.value
    ? items.value.reduce((s, i) => s + (i.consignation_price || 0) * i.quantity, 0)
    : 0
);

const total = computed(() => subtotal.value + consignTotal.value);

const formatPrice = (p) => new Intl.NumberFormat('fr-FR').format(Math.round(p || 0)) + ' Ar';

const getQty = (productId) => {
  const item = items.value.find(i => i.product_id === productId);
  return item ? item.quantity : 0;
};

const addItem = (product) => {
  if (product.stock_quantity <= 0) return;
  const existing = items.value.find(i => i.product_id === product.id);
  if (existing) {
    existing.quantity++;
  } else {
    items.value.push({
      product_id: product.id,
      name: product.name,
      price: parseFloat(product.price),
      consignation_price: parseFloat(product.consignation_price || 0),
      quantity: 1,
    });
  }
};

const removeItem = (id) => {
  items.value = items.value.filter(i => i.product_id !== id);
};

const submitOrder = async () => {
  if (items.value.length === 0) return;
  submitting.value = true;
  try {
    const { data } = await api.post('/vendor/orders', {
      table_name: tableName.value || null,
      items: items.value.map(i => ({ product_id: i.product_id, quantity: i.quantity })),
      is_takeaway: isTakeaway.value,
      remarks: remarks.value || null,
    });
    if (data.success) {
      toast.success(`Commande ${data.data.order.order_number} creee et envoyee au caissier`);
      items.value = [];
      tableName.value = '';
      remarks.value = '';
      isTakeaway.value = false;
      router.push('/admin/orders');
    }
  } catch (err) {
    toast.error(err.response?.data?.message || 'Erreur lors de la creation');
  } finally {
    submitting.value = false;
  }
};

onMounted(async () => {
  try {
    const { data } = await api.get('/client/menu');
    if (data.success) {
      categories.value = data.data.categories;
      allProducts.value = data.data.categories.flatMap(c =>
        (c.Products || []).map(p => ({ ...p, category_id: c.id }))
      );
      // activeCat reste null = afficher tous les produits par défaut
    }
  } catch {
    toast.error('Erreur chargement menu');
  } finally {
    productLoading.value = false;
  }
});
</script>

<style scoped>
.scroll-hide { scrollbar-width: none; }
.scroll-hide::-webkit-scrollbar { display: none; }
.shadow-glow { box-shadow: 0 0 15px rgba(99, 102, 241, 0.3); }
</style>
