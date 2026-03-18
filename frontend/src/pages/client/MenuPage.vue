<template>
  <div class="menu-page-premium pb-12">
    <!-- Header -->
    <div class="menu-header mb-8 px-2">
      <h1 class="text-4xl font-display font-black tracking-tighter">CARTE DES BOISSONS</h1>
      <p class="text-secondary text-sm font-medium tracking-wide">Sélectionnez vos envies, nous nous occupons du reste.</p>
    </div>

    <!-- Category Tabs (Sticky) -->
    <div class="category-tabs sticky-tabs scroll-hide flex gap-3 overflow-x-auto pb-4 mb-8 z-[60]">
      <button
        v-for="cat in categories"
        :key="cat.id"
        :class="['tab-premium px-6 py-3 rounded-full border transition-all whitespace-nowrap font-bold text-xs uppercase tracking-widest', 
                 activeCategory === cat.id ? 'bg-primary border-primary text-white shadow-glow' : 'glass border-color text-secondary hover:border-primary-light']"
        @click="activeCategory = cat.id"
      >
        <span class="mr-2">{{ cat.icon }}</span> {{ cat.name }}
      </button>
    </div>

    <!-- Products Grid -->
    <div v-if="loading" class="flex justify-center py-20"><div class="spinner"></div></div>
    
    <div v-else class="products-section px-2">
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        <div
          v-for="product in filteredProducts"
          :key="product.id"
          class="glass-card flex flex-col p-6 group relative overflow-hidden"
        >
          <!-- Stock Badge -->
          <div class="absolute top-4 right-4 z-10">
            <span :class="['text-[10px] font-black px-2 py-0.5 rounded-full uppercase tracking-tighter', 
                           product.stock_quantity > 0 ? 'bg-success/20 text-success' : 'bg-danger/20 text-danger']">
              {{ product.stock_quantity > 0 ? `${product.stock_quantity} EN STOCK` : 'RUPTURE' }}
            </span>
          </div>

          <div class="flex-1">
            <h3 class="font-display font-extrabold text-xl group-hover:text-primary transition-colors">{{ product.name }}</h3>
            <p class="text-xs text-muted mt-2 line-clamp-2" v-if="product.description">{{ product.description }}</p>
            
            <div class="mt-6 space-y-1">
              <div class="flex items-baseline gap-2">
                <span class="text-2xl font-display font-black text-primary-light">{{ formatPrice(product.price) }}</span>
              </div>
              <span v-if="product.consignation_price > 0" class="text-[10px] text-accent font-bold uppercase tracking-widest">
                + Consigne: {{ formatPrice(product.consignation_price) }}
              </span>
            </div>
          </div>

          <button
            class="btn btn-primary w-full mt-6 py-3 rounded-xl uppercase tracking-widest text-[11px]"
            @click="addToCart(product)"
            :disabled="product.stock_quantity <= 0"
          >
            {{ product.stock_quantity > 0 ? 'Ajouter au panier' : 'Indisponible' }}
          </button>
        </div>
      </div>
    </div>

    <!-- Mobile Floating Action Box & Sidebar Cart -->
    <div :class="['cart-panel glass-heavy', { 'mobile-open': showMobileCart }]">
      <div class="cart-header border-b border-color py-6 px-8 flex justify-between items-center bg-bg-glass-heavy">
        <h2 class="font-display font-black text-2xl tracking-tighter">MON PANIER</h2>
        <button @click="showMobileCart = false" class="md:hidden p-2 text-secondary hover:text-white transition-colors">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" /></svg>
        </button>
      </div>

      <div v-if="cart.items.length === 0" class="flex-1 flex flex-col items-center justify-center p-12 text-center opacity-40">
        <span class="text-8xl mb-6">🛒</span>
        <p class="font-display font-extrabold text-xl">SOIF ?</p>
        <p class="text-sm">Votre panier attend vos boissons préférées.</p>
      </div>

      <div v-else class="cart-items flex-1 overflow-y-auto scroll-hide p-6 space-y-4">
        <div v-for="item in cart.items" :key="item.product_id" class="glass-card p-5 flex justify-between items-center border border-white/5 hover:border-primary/30 transition-all">
          <div class="flex flex-col">
            <span class="font-extrabold text-base tracking-tight leading-tight">{{ item.name }}</span>
            <div class="flex items-center gap-2 mt-1">
              <span class="text-xs text-primary-light font-bold">{{ formatPrice(item.price) }}</span>
              <span v-if="cart.isTakeaway && (item.consignation_price > 0)" class="text-[9px] text-accent uppercase font-black tracking-widest">+ {{ formatPrice(item.consignation_price) }} C.</span>
            </div>
          </div>
          <div class="flex items-center gap-4 bg-white/5 rounded-2xl px-4 py-2 border border-white/10">
            <button @click="cart.decrementItem(item.product_id)" class="text-secondary hover:text-white transition-all text-xl font-bold">−</button>
            <span class="font-display font-black text-lg w-4 text-center">{{ item.quantity }}</span>
            <button @click="cart.addItem({ id: item.product_id, name: item.name, price: item.price, consignation_price: item.consignation_price })" class="text-primary-light hover:text-white transition-all text-xl font-bold">+</button>
          </div>
        </div>
      </div>

      <div class="cart-footer p-8 glass-card rounded-t-[40px] border-t border-bright bg-bg-glass-heavy shadow-glow" v-if="cart.items.length > 0">
        <div class="flex items-center justify-between mb-8 glass-card p-5 border-white/10">
          <div class="flex flex-col">
            <span class="text-sm font-bold tracking-tight">COMMANDE À EMPORTER</span>
            <span class="text-[10px] text-muted font-bold tracking-widest uppercase">Inclure les consignes</span>
          </div>
          <label class="switch scale-90">
            <input type="checkbox" v-model="cart.isTakeaway">
            <span class="slider"></span>
          </label>
        </div>

        <div class="space-y-4 mb-8">
          <div class="flex justify-between items-center text-xs font-bold uppercase tracking-widest text-secondary">
            <span>Sous-total</span>
            <span class="text-text-primary">{{ formatPrice(cart.subtotal) }}</span>
          </div>
          <div v-if="cart.isTakeaway && cart.consignationTotal > 0" class="flex justify-between items-center text-xs font-bold uppercase tracking-widest text-accent">
            <span>Total Consignes</span>
            <span>+ {{ formatPrice(cart.consignationTotal) }}</span>
          </div>
          <div class="flex justify-between items-center pt-5 border-t border-color mt-4">
            <span class="font-display font-black text-xs uppercase tracking-[0.2em]">Total</span>
            <span class="font-display font-black text-4xl text-primary drop-shadow-sm">{{ formatPrice(cart.total) }}</span>
          </div>
        </div>

        <button @click="handleOrder" class="btn btn-primary w-full py-5 rounded-2xl shadow-glow text-lg font-black tracking-widest hover:scale-[1.02] active:scale-[0.98] transition-all" :disabled="ordering">
          {{ ordering ? 'TRAITEMENT...' : 'VALIDER LA COMMANDE' }}
        </button>
      </div>
    </div>

    <!-- Mobile Action Button (Cart Toggle) -->
    <div v-if="cart.totalItems > 0 && !showMobileCart" class="md:hidden fixed bottom-24 right-6 z-[200]">
      <button @click="showMobileCart = true" class="relative w-18 h-18 rounded-3xl bg-primary shadow-glow flex items-center justify-center animate-bounce-slow border-2 border-white/20">
        <span class="text-3xl">🛒</span>
        <div class="absolute -top-2 -right-2 bg-accent text-black font-black text-[12px] w-8 h-8 rounded-full border-4 border-bg-primary flex items-center justify-center">
          {{ cart.totalItems }}
        </div>
      </button>
    </div>
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
const activeCategory = ref(null);
const loading = ref(true);
const showMobileCart = ref(false);
const ordering = ref(false);

const filteredProducts = computed(() => {
  if (!activeCategory.value) return allProducts.value;
  return allProducts.value.filter(p => p.category_id === activeCategory.value);
});

const formatPrice = (price) => new Intl.NumberFormat('fr-FR').format(price) + ' Ar';

const addToCart = (product) => {
  cart.addItem(product);
  toast.success(`${product.name} ajouté au panier`);
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
      toast.success('Votre commande est en préparation !');
      cart.clear();
      showMobileCart.value = false;
    }
  } catch (err) {
    toast.error(err.response?.data?.message || 'Erreur lors de la prise de commande');
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
      if (categories.value.length > 0) {
        activeCategory.value = categories.value[0].id;
      }
    }
  } catch (err) {
    toast.error('Oups, la carte n\'est pas accessible.');
  } finally {
    loading.value = false;
  }
});
</script>

<style scoped>
.menu-page-premium { background: radial-gradient(circle at bottom left, rgba(129, 140, 248, 0.05), transparent); }

.tab-premium { transition: 0.4s cubic-bezier(0.165, 0.84, 0.44, 1); }

/* Cart Sidebar Behavior */
.cart-panel {
  position: fixed; top: 0; right: -100%; bottom: 0; width: 440px;
  z-index: 500; display: flex; flex-direction: column;
  transition: all 0.5s cubic-bezier(0.4, 0, 0.2, 1);
  box-shadow: -10px 0 40px rgba(0, 0, 0, 0.6);
}

@media (min-width: 1440px) {
  .cart-panel { right: -480px; width: 440px; }
  .cart-panel.mobile-open { right: 0; }
}

@media (max-width: 768px) {
  .cart-panel { width: 100%; }
}

.cart-panel.mobile-open { right: 0; }

.cart-items::-webkit-scrollbar { width: 0; }

.animate-bounce-slow {
  animation: bounce 3s infinite;
}

@keyframes bounce {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-10px); }
}

.shadow-glow { box-shadow: 0 0 25px rgba(129, 140, 248, 0.3); }

/* Sidebar/Mobile specific glass */
.glass-heavy {
  background: rgba(10, 10, 26, 0.95); backdrop-filter: blur(40px); -webkit-backdrop-filter: blur(40px);
}
</style>
