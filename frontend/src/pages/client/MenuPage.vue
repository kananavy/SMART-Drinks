<template>
  <div class="menu-page-premium pb-4">
    <!-- Header + Search -->
    <div class="flex flex-col sm:flex-row sm:items-center gap-4 mb-6">
      <div class="flex-1">
        <h1 class="text-3xl font-display font-black tracking-tighter">CARTE DES BOISSONS</h1>
        <p class="text-secondary text-sm">Selectionnez vos envies, nous nous occupons du reste.</p>
      </div>
      <div class="relative w-full sm:w-72">
        <span class="absolute left-3 top-1/2 -translate-y-1/2 text-muted text-sm">🔍</span>
        <input
          v-model="searchQuery"
          type="text"
          placeholder="Rechercher une boisson..."
          class="input-premium pl-9 w-full text-sm"
        />
        <button v-if="searchQuery" @click="searchQuery = ''"
          class="absolute right-3 top-1/2 -translate-y-1/2 text-muted hover:text-white transition-colors text-sm">✕</button>
      </div>
    </div>

    <!-- Category Tabs -->
    <div class="flex gap-2 overflow-x-auto pb-3 mb-6 scroll-hide">
      <button
        :class="['flex-shrink-0 px-5 py-2.5 rounded-full border transition-all font-bold text-xs uppercase tracking-widest',
                 activeCategory === null ? 'bg-primary border-primary text-white shadow-glow' : 'glass border-color text-secondary hover:border-primary/40']"
        @click="activeCategory = null"
      >
        🍹 Tous
      </button>
      <button
        v-for="cat in categories" :key="cat.id"
        :class="['flex-shrink-0 px-5 py-2.5 rounded-full border transition-all font-bold text-xs uppercase tracking-widest',
                 activeCategory === cat.id ? 'bg-primary border-primary text-white shadow-glow' : 'glass border-color text-secondary hover:border-primary/40']"
        @click="activeCategory = cat.id"
      >
        <span class="mr-1.5">{{ cat.icon }}</span>{{ cat.name }}
      </button>
    </div>

    <!-- Desktop 2-col layout -->
    <div class="flex gap-6 items-start">

      <!-- Products (left) -->
      <div class="flex-1 min-w-0">
        <div v-if="loading" class="flex justify-center py-20"><div class="spinner"></div></div>

        <div v-else-if="filteredProducts.length === 0" class="glass-card text-center py-16">
          <div class="text-5xl mb-3">🍸</div>
          <p class="font-display font-bold text-lg mb-1">Aucun produit</p>
          <p class="text-secondary text-sm">Essayez un autre filtre ou terme de recherche.</p>
        </div>

        <div v-else class="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
          <div
            v-for="product in filteredProducts" :key="product.id"
            class="glass-card flex flex-col p-5 group relative overflow-hidden"
            :class="{ 'opacity-60': product.stock_quantity <= 0 }"
          >
            <!-- Stock Badge -->
            <div class="absolute top-3 right-3">
              <span :class="['text-[9px] font-black px-2 py-0.5 rounded-full uppercase tracking-tight',
                             product.stock_quantity > 5 ? 'bg-success/20 text-success' :
                             product.stock_quantity > 0 ? 'bg-warning/20 text-warning' :
                             'bg-danger/20 text-danger']">
                {{ product.stock_quantity > 0 ? `${product.stock_quantity} stock` : 'Rupture' }}
              </span>
            </div>

            <div class="flex-1 pr-12">
              <h3 class="font-display font-extrabold text-base group-hover:text-primary transition-colors leading-tight">{{ product.name }}</h3>
              <p v-if="product.description" class="text-xs text-muted mt-1 line-clamp-2">{{ product.description }}</p>
              <div class="mt-3">
                <span class="text-xl font-display font-black text-primary">{{ formatPrice(product.price) }}</span>
                <span v-if="product.consignation_price > 0" class="text-[10px] text-accent font-bold uppercase tracking-widest ml-2">
                  +{{ formatPrice(product.consignation_price) }} consigne
                </span>
              </div>
            </div>

            <!-- Add button + qty controls -->
            <div class="mt-4">
              <div v-if="getCartQty(product.id) > 0" class="flex items-center justify-between glass rounded-xl px-3 py-2 border border-primary/30">
                <button @click="cart.decrementItem(product.id)" class="text-secondary hover:text-white transition-all text-lg font-bold w-7 h-7 flex items-center justify-center">−</button>
                <span class="font-display font-black text-lg text-primary w-8 text-center">{{ getCartQty(product.id) }}</span>
                <button @click="addToCart(product)" class="text-primary hover:text-white transition-all text-lg font-bold w-7 h-7 flex items-center justify-center">+</button>
              </div>
              <button v-else
                @click="addToCart(product)"
                :disabled="product.stock_quantity <= 0"
                class="btn btn-primary w-full py-2.5 rounded-xl text-xs uppercase tracking-widest"
              >
                {{ product.stock_quantity > 0 ? '+ Ajouter' : 'Indisponible' }}
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- Cart Sidebar (desktop: sticky, mobile: overlay) -->
      <aside :class="['cart-panel glass-heavy flex flex-col', { 'mobile-open': showMobileCart }]">
        <div class="cart-header border-b border-color py-4 px-5 flex justify-between items-center flex-shrink-0">
          <div class="flex items-center gap-2">
            <h2 class="font-display font-black text-lg tracking-tighter">MON PANIER</h2>
            <span v-if="cart.totalItems > 0" class="bg-primary text-white text-[10px] font-black w-5 h-5 rounded-full flex items-center justify-center">
              {{ cart.totalItems }}
            </span>
          </div>
          <button @click="showMobileCart = false" class="md:hidden p-1.5 text-secondary hover:text-white transition-colors">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
            </svg>
          </button>
        </div>

        <!-- Empty state -->
        <div v-if="cart.items.length === 0" class="flex-1 flex flex-col items-center justify-center p-8 text-center opacity-50">
          <span class="text-6xl mb-4">🛒</span>
          <p class="font-display font-bold text-base">Panier vide</p>
          <p class="text-xs text-secondary mt-1">Ajoutez des boissons depuis le menu.</p>
        </div>

        <!-- Cart items -->
        <div v-else class="flex-1 overflow-y-auto scroll-hide px-4 py-3 space-y-2">
          <div
            v-for="item in cart.items" :key="item.product_id"
            class="glass-card p-3.5 flex items-center justify-between gap-3 border border-white/5 hover:border-primary/20 transition-all"
          >
            <div class="flex-1 min-w-0">
              <p class="font-bold text-sm truncate">{{ item.name }}</p>
              <div class="flex items-center gap-1.5 mt-0.5">
                <span class="text-xs text-primary font-bold">{{ formatPrice(item.price) }}</span>
                <span v-if="cart.isTakeaway && item.consignation_price > 0" class="text-[9px] text-accent font-black">
                  +{{ formatPrice(item.consignation_price) }}C
                </span>
              </div>
            </div>
            <div class="flex items-center gap-2 bg-white/5 rounded-xl px-3 py-1.5 border border-white/8">
              <button @click="cart.decrementItem(item.product_id)" class="text-secondary hover:text-white text-base font-bold w-5 flex items-center justify-center">−</button>
              <span class="font-display font-black text-sm w-4 text-center">{{ item.quantity }}</span>
              <button @click="cart.addItem({ id: item.product_id, name: item.name, price: item.price, consignation_price: item.consignation_price })" class="text-primary hover:text-white text-base font-bold w-5 flex items-center justify-center">+</button>
            </div>
          </div>
        </div>

        <!-- Cart Footer -->
        <div v-if="cart.items.length > 0" class="cart-footer p-4 border-t border-color flex-shrink-0 space-y-3">
          <!-- Takeaway toggle -->
          <div class="flex items-center justify-between glass-card p-3 border-white/5">
            <div>
              <p class="text-xs font-bold">A emporter</p>
              <p class="text-[10px] text-muted">Inclure les consignes</p>
            </div>
            <button @click="cart.isTakeaway = !cart.isTakeaway"
              :class="['w-10 h-5 rounded-full transition-all relative flex-shrink-0', cart.isTakeaway ? 'bg-primary' : 'bg-white/10']">
              <span :class="['absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-all', cart.isTakeaway ? 'left-5' : 'left-0.5']"></span>
            </button>
          </div>

          <!-- Subtotals -->
          <div class="space-y-1.5">
            <div class="flex justify-between text-xs text-secondary font-bold">
              <span>Sous-total ({{ cart.totalItems }} articles)</span>
              <span>{{ formatPrice(cart.subtotal) }}</span>
            </div>
            <div v-if="cart.isTakeaway && cart.consignationTotal > 0" class="flex justify-between text-xs text-accent font-bold">
              <span>Consignes</span>
              <span>+ {{ formatPrice(cart.consignationTotal) }}</span>
            </div>
          </div>

          <!-- Total -->
          <div class="flex justify-between items-center pt-2 border-t border-color">
            <span class="text-xs font-black uppercase tracking-widest">Total</span>
            <span class="font-display font-black text-2xl text-primary">{{ formatPrice(cart.total) }}</span>
          </div>

          <!-- Remarks -->
          <textarea
            v-model="cart.remarks"
            placeholder="Remarques particulieres..."
            class="input-premium w-full text-xs resize-none h-14 py-2"
          ></textarea>

          <!-- Order button -->
          <button
            @click="handleOrder"
            :disabled="ordering"
            class="btn btn-primary w-full py-3.5 rounded-xl font-black tracking-widest text-sm"
          >
            <span v-if="!ordering">VALIDER — {{ formatPrice(cart.total) }}</span>
            <span v-else class="flex items-center gap-2 justify-center"><span class="animate-spin">🔄</span> Traitement...</span>
          </button>
        </div>
      </aside>
    </div>

    <!-- Mobile FAB -->
    <div v-if="cart.totalItems > 0 && !showMobileCart" class="md:hidden fixed bottom-24 right-5 z-[200]">
      <button @click="showMobileCart = true"
        class="relative w-16 h-16 rounded-2xl bg-primary shadow-glow flex items-center justify-center border border-white/20 hover:scale-105 transition-transform">
        <span class="text-2xl">🛒</span>
        <div class="absolute -top-2 -right-2 bg-accent text-black font-black text-[11px] w-7 h-7 rounded-full border-2 border-bg-primary flex items-center justify-center">
          {{ cart.totalItems }}
        </div>
      </button>
    </div>

    <!-- Mobile overlay backdrop -->
    <div v-if="showMobileCart" class="md:hidden fixed inset-0 bg-black/50 z-[499] backdrop-blur-sm" @click="showMobileCart = false"></div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import api from '@/services/api';
import { useCartStore } from '@/stores/cart';
import { useAuthStore } from '@/stores/auth';
import { useToastStore } from '@/stores/toast';

const cart = useCartStore();
const auth = useAuthStore();
const toast = useToastStore();

const categories = ref([]);
const allProducts = ref([]);
const activeCategory = ref(null); // null = tous les produits
const searchQuery = ref('');
const loading = ref(true);
const showMobileCart = ref(false);
const ordering = ref(false);

const filteredProducts = computed(() => {
  let list = allProducts.value;
  if (activeCategory.value !== null) list = list.filter(p => p.category_id === activeCategory.value);
  if (searchQuery.value.trim()) {
    const q = searchQuery.value.toLowerCase().trim();
    list = list.filter(p => p.name.toLowerCase().includes(q) || (p.description || '').toLowerCase().includes(q));
  }
  return list;
});

const getCartQty = (productId) => {
  const item = cart.items.find(i => i.product_id === productId);
  return item ? item.quantity : 0;
};

const formatPrice = (price) => new Intl.NumberFormat('fr-FR').format(price) + ' Ar';

const addToCart = (product) => {
  cart.addItem(product);
  toast.success(`${product.name} ajoute au panier`);
};

const handleOrder = async () => {
  ordering.value = true;
  try {
    const { data } = await api.post('/client/orders', {
      session_id: auth.session?.id,
      items: cart.items.map(i => ({ product_id: i.product_id, quantity: i.quantity })),
      remarks: cart.remarks,
      is_takeaway: cart.isTakeaway,
    });
    if (data.success) {
      toast.success('Commande envoyee ! En cours de preparation.');
      cart.clear();
      showMobileCart.value = false;
    }
  } catch (err) {
    toast.error(err.response?.data?.message || 'Erreur lors de la commande');
  } finally {
    ordering.value = false;
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
      if (categories.value.length > 0) activeCategory.value = categories.value[0].id;
    }
  } catch {
    toast.error('Impossible de charger la carte.');
  } finally {
    loading.value = false;
  }
});
</script>

<style scoped>
.scroll-hide { scrollbar-width: none; }
.scroll-hide::-webkit-scrollbar { display: none; }

.shadow-glow { box-shadow: 0 0 20px rgba(99, 102, 241, 0.4); }

.glass-heavy {
  background: rgba(10, 10, 26, 0.97);
  backdrop-filter: blur(40px);
  -webkit-backdrop-filter: blur(40px);
  border: 1px solid rgba(255, 255, 255, 0.06);
  border-radius: 20px;
}

/* Desktop: sticky sidebar */
@media (min-width: 768px) {
  .cart-panel {
    width: 360px;
    flex-shrink: 0;
    position: sticky;
    top: 80px;
    max-height: calc(100vh - 100px);
    overflow: hidden;
    display: flex;
    flex-direction: column;
  }
}

/* Mobile: fixed overlay */
@media (max-width: 767px) {
  .cart-panel {
    position: fixed;
    top: 0;
    right: -100%;
    bottom: 0;
    width: 100%;
    z-index: 500;
    border-radius: 0;
    transition: right 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  }
  .cart-panel.mobile-open {
    right: 0;
  }
}
</style>
