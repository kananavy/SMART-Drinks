<template>
  <div class="stock-dashboard-premium">
    <div class="page-header mb-10">
      <h1 class="text-3xl font-display font-black tracking-tight">MOUVEMENTS DE STOCK</h1>
      <p class="text-secondary text-sm">Contrôlez les entrées et sorties de vos boissons.</p>
    </div>

    <!-- Inventory Summary Cards -->
    <div class="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
      <div class="glass-card p-6 border-l-4 border-primary">
         <span class="text-[10px] font-black uppercase tracking-widest text-secondary">Alerte Rupture</span>
         <div class="flex items-end justify-between mt-2">
           <span class="text-3xl font-display font-black text-danger">{{ lowStockCount }}</span>
           <span class="text-[10px] font-bold text-danger/50 uppercase">RÉFÉRENCES < 5</span>
         </div>
      </div>
      <div class="glass-card p-6 border-l-4 border-success">
         <span class="text-[10px] font-black uppercase tracking-widest text-secondary">Total Stock</span>
         <div class="flex items-end justify-between mt-2">
           <span class="text-3xl font-display font-black text-success">{{ totalItems }}</span>
           <span class="text-[10px] font-bold text-success/50 uppercase">UNITÉS CUMULÉES</span>
         </div>
      </div>
      <div class="glass-card p-6">
         <button @click="openModal('in')" class="w-full h-full btn btn-primary py-4 uppercase font-black tracking-widest shadow-glow">
           + ENTRÉE DE STOCK
         </button>
      </div>
    </div>

    <!-- Stock Table (Premium) -->
    <div class="glass-card overflow-hidden">
      <div class="px-8 py-5 border-b border-color bg-white/5">
        <h3 class="font-display font-black text-xs uppercase tracking-widest">État du inventaire</h3>
      </div>
      <div class="overflow-x-auto">
        <table class="w-full text-left">
          <thead>
            <tr class="text-[10px] font-black uppercase tracking-[0.2em] text-secondary border-b border-color">
              <th class="px-8 py-4">Produit</th>
              <th class="px-8 py-4">Catégorie</th>
              <th class="px-8 py-4">Quantité actuelle</th>
              <th class="px-8 py-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-color">
            <tr v-for="p in products" :key="p.id" class="hover:bg-white/[0.02] transition-colors">
              <td class="px-8 py-5 font-bold tracking-tight uppercase text-sm">{{ p.name }}</td>
              <td class="px-8 py-5"><span class="text-[10px] bg-white/5 px-2 py-1 rounded-lg uppercase font-bold">{{ p.Category?.name }}</span></td>
              <td class="px-8 py-5">
                <span :class="['font-black text-base', p.stock_quantity <= 5 ? 'text-danger shadow-[0_0_15px_rgba(239,68,68,0.2)]' : 'text-primary-light']">
                  {{ p.stock_quantity }}
                </span>
                <span class="text-[10px] text-muted ml-2 uppercase font-bold">Unités</span>
              </td>
              <td class="px-8 py-5 text-right space-x-2">
                <button @click="openModal('in', p)" class="btn btn-secondary btn-sm px-3 py-1 font-black text-[10px]">IN</button>
                <button @click="openModal('out', p)" class="btn btn-secondary btn-sm px-3 py-1 font-black text-[10px] !text-accent">OUT</button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Movement Modal -->
    <div v-if="showModal" class="modal-overlay z-[300]" @click.self="showModal = false">
      <div class="modal-content-glass max-w-md w-full p-8 animate-zoom-in">
        <h2 class="text-2xl font-display font-black tracking-tight mb-8 uppercase italic">
          {{ type === 'in' ? 'Entrée' : 'Sortie' }} de stock
        </h2>
        
        <form @submit.prevent="submitMovement" class="space-y-6">
          <div class="space-y-2">
            <label class="text-[10px] font-black uppercase tracking-widest text-secondary">Produit concerné</label>
            <select v-model="form.product_id" class="input-premium w-full" required>
              <option v-for="p in products" :key="p.id" :value="p.id">{{ p.name }}</option>
            </select>
          </div>

          <div class="space-y-2">
            <label class="text-[10px] font-black uppercase tracking-widest text-secondary">Quantité</label>
            <input v-model.number="form.quantity" type="number" min="1" class="input-premium w-full" required />
          </div>

          <div class="space-y-2">
            <label class="text-[10px] font-black uppercase tracking-widest text-secondary">Motif / Commentaire</label>
            <input v-model="form.reason" class="input-premium w-full" :placeholder="type === 'in' ? 'Approvisionnement hebdomadaire' : 'Casse ou perte...'" />
          </div>

          <div class="flex gap-4 pt-6">
            <button type="submit" class="btn btn-primary flex-1 py-4 uppercase font-black" :disabled="submitting">
              {{ submitting ? '...' : (type === 'in' ? 'VALIDER L\'ENTRÉE' : 'VALIDER LA SORTIE') }}
            </button>
            <button type="button" @click="showModal = false" class="btn btn-secondary px-6">
              ANNULER
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue';
import api from '@/services/api';
import { useToastStore } from '@/stores/toast';

const toast = useToastStore();
const products = ref([]);
const loading = ref(true);
const showModal = ref(false);
const type = ref('in');
const submitting = ref(false);

const form = reactive({ product_id: '', quantity: 1, reason: '' });

const lowStockCount = computed(() => products.value.filter(p => p.stock_quantity <= 5).length);
const totalItems = computed(() => products.value.reduce((acc, p) => acc + p.stock_quantity, 0));

const fetchData = async () => {
  loading.value = true;
  try {
    const { data } = await api.get('/admin/stock');
    if (data.success) products.value = data.data.products;
  } catch (err) { toast.error('Échec de synchronisation'); }
  finally { loading.value = false; }
};

const openModal = (mType, product = null) => {
  type.value = mType;
  form.product_id = product ? product.id : (products.value[0]?.id || '');
  form.quantity = 1;
  form.reason = '';
  showModal.value = true;
};

const submitMovement = async () => {
  submitting.value = true;
  try {
    const endpoint = `/admin/stock/${type.value}`;
    await api.post(endpoint, form);
    toast.success('Inventaire mis à jour');
    showModal.value = false;
    fetchData();
  } catch (err) { toast.error(err.response?.data?.message || 'Erreur technique'); }
  finally { submitting.value = false; }
};

onMounted(fetchData);
</script>

<style scoped>
.modal-content-glass {
  background: rgba(15, 15, 30, 0.95);
  backdrop-filter: blur(40px);
  -webkit-backdrop-filter: blur(40px);
  border-radius: 32px;
  border: 1px solid rgba(255, 255, 255, 0.1);
}
</style>
