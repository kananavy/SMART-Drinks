<template>
  <div class="product-management-premium">
    <!-- Header -->
    <div class="page-header flex justify-between items-center mb-8">
      <div>
        <h1 class="text-3xl font-display font-black tracking-tight">PORTFOLIO PRODUITS</h1>
        <p class="text-secondary text-sm">Gérez vos références et leur disponibilité.</p>
      </div>
      <button @click="openForm()" class="btn btn-primary shadow-glow">
        <span class="mr-2">＋</span> NOUVEAU PRODUIT
      </button>
    </div>

    <!-- Category Filters (High-end) -->
    <div class="filter-tabs flex gap-3 overflow-x-auto pb-4 mb-10 scroll-hide">
      <button :class="['px-6 py-2.5 rounded-xl border transition-all text-xs font-bold uppercase tracking-widest', !activeCat ? 'bg-primary border-primary text-white shadow-glow' : 'glass border-color text-secondary hover:border-primary-light']" @click="activeCat = null">
        TOUS
      </button>
      <button v-for="c in categories" :key="c.id" :class="['px-6 py-2.5 rounded-xl border transition-all text-xs font-bold uppercase tracking-widest whitespace-nowrap', activeCat === c.id ? 'bg-primary border-primary text-white shadow-glow' : 'glass border-color text-secondary hover:border-primary-light']" @click="activeCat = c.id">
        <span class="mr-2">{{ c.icon }}</span> {{ c.name }}
      </button>
    </div>

    <div v-if="loading" class="flex justify-center py-24"><div class="spinner"></div></div>
    
    <!-- Product Adaptive Grid -->
    <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      <div v-for="p in filtered" :key="p.id" class="glass-card flex flex-col group translate-hover border border-white/5 overflow-hidden">
        <!-- Product image -->
        <div v-if="p.image" class="h-36 overflow-hidden relative">
          <img :src="p.image" class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
          <div class="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
        </div>
        <div class="flex-1 p-6" :class="p.image ? 'pt-3' : ''">
          <div class="flex justify-between items-start mb-4">
             <span class="text-[10px] font-black uppercase tracking-widest bg-primary/10 text-primary-light px-2 py-0.5 rounded-full border border-primary/20">
               {{ p.Category?.name }}
             </span>
             <div class="flex gap-1">
               <button @click="openForm(p)" class="p-2 hover:bg-white/10 rounded-lg text-secondary transition-colors"><svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg></button>
               <button @click="deleteProduct(p.id)" class="p-2 hover:bg-danger/10 rounded-lg text-danger transition-colors"><svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-4v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg></button>
             </div>
          </div>
          <h3 class="font-display font-extrabold text-lg mb-2 uppercase">{{ p.name }}</h3>
          <p class="text-xs text-muted mb-4 line-clamp-2">{{ p.description || 'Aucune description' }}</p>
          
          <div class="flex flex-col gap-1 mb-6">
            <span class="text-xl font-display font-black text-primary">{{ formatPrice(p.price) }}</span>
            <span v-if="p.consignation_price > 0" class="text-[9px] text-accent font-black uppercase tracking-[0.1em]">Consigne: {{ formatPrice(p.consignation_price) }}</span>
          </div>
        </div>

          <div class="pt-4 border-t border-color flex items-center justify-between">
            <div class="flex flex-col">
              <span class="text-[9px] font-bold text-muted uppercase tracking-widest">Stock Disponible</span>
              <span :class="['font-black text-sm', p.stock_quantity <= 5 ? 'text-danger' : 'text-success']">{{ p.stock_quantity }} unités</span>
            </div>
            <div :class="['w-2.5 h-2.5 rounded-full shadow-glow', p.available ? 'bg-success' : 'bg-danger']"></div>
          </div>
        </div>
      </div>
    </div>

    <!-- Modal Form (Premium Version) -->
    <div v-if="showForm" class="modal-overlay z-[300]" @click.self="showForm = false">
      <div class="modal-content-glass max-w-lg w-full p-8 animate-zoom-in">
        <h2 class="text-2xl font-display font-black tracking-tight mb-8">
          {{ editing ? 'MISE À JOUR PRODUIT' : 'NOUVEAU PRODUIT' }}
        </h2>
        
        <form @submit.prevent="submitProduct" class="space-y-6">
          <div class="space-y-2">
            <label class="text-[10px] font-black uppercase tracking-widest text-secondary">Désignation</label>
            <input v-model="form.name" class="input-premium w-full" placeholder="Ex: Negroni Classico" required />
          </div>

          <div class="grid grid-cols-2 gap-4">
            <div class="space-y-2">
              <label class="text-[10px] font-black uppercase tracking-widest text-secondary">Catégorie</label>
              <select v-model="form.category_id" class="input-premium w-full" required>
                <option v-for="c in categories" :key="c.id" :value="c.id">{{ c.name }}</option>
              </select>
            </div>
            <div class="space-y-2">
              <label class="text-[10px] font-black uppercase tracking-widest text-secondary">Prix de vente</label>
              <input v-model.number="form.price" type="number" class="input-premium w-full" required />
            </div>
          </div>

          <div class="grid grid-cols-2 gap-4">
            <div class="space-y-2">
              <label class="text-[10px] font-black uppercase tracking-widest text-secondary">Consigne (Ar)</label>
              <input v-model.number="form.consignation_price" type="number" class="input-premium w-full" />
            </div>
            <div class="space-y-2">
              <label class="text-[10px] font-black uppercase tracking-widest text-secondary">Stock Initial</label>
              <input v-model.number="form.stock_quantity" type="number" class="input-premium w-full" />
            </div>
          </div>

          <div class="space-y-2">
            <label class="text-[10px] font-black uppercase tracking-widest text-secondary">Description courte</label>
            <textarea v-model="form.description" class="input-premium w-full" rows="3" placeholder="Ingrédients ou informations..."></textarea>
          </div>

          <!-- Image upload -->
          <div class="space-y-2">
            <label class="text-[10px] font-black uppercase tracking-widest text-secondary">Photo du produit</label>
            <div class="relative glass border-color rounded-2xl h-32 flex flex-col items-center justify-center group overflow-hidden cursor-pointer hover:border-primary/30 transition-all">
              <img v-if="productImagePreview || form.image" :src="productImagePreview || form.image" class="absolute inset-0 w-full h-full object-cover opacity-60" />
              <div class="z-10 text-center">
                <span class="text-2xl mb-1 block">📸</span>
                <span class="text-[9px] font-black uppercase opacity-70">{{ productImagePreview ? 'Changer la photo' : 'Ajouter une photo' }}</span>
              </div>
              <input type="file" accept="image/*" @change="handleProductImage" class="absolute inset-0 opacity-0 cursor-pointer" />
            </div>
          </div>

          <div class="flex gap-4 pt-6">
            <button type="submit" class="btn btn-primary flex-1 py-4 uppercase font-black" :disabled="submitting">
              {{ submitting ? 'Enregistrement...' : 'Enregistrer le produit' }}
            </button>
            <button type="button" @click="showForm = false" class="btn btn-secondary px-6">
              Annuler
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
const categories = ref([]);
const loading = ref(true);
const showForm = ref(false);
const editing = ref(false);
const submitting = ref(false);
const editingId = ref(null);
const activeCat = ref(null);

const form = reactive({ name: '', category_id: '', price: 0, consignation_price: 0, stock_quantity: 0, description: '', image: '' });
const productImageFile = ref(null);
const productImagePreview = ref(null);

const handleProductImage = (e) => {
  const file = e.target.files[0];
  if (!file) return;
  productImageFile.value = file;
  productImagePreview.value = URL.createObjectURL(file);
};

const filtered = computed(() => activeCat.value ? products.value.filter(p => p.category_id === activeCat.value) : products.value);
const formatPrice = (p) => new Intl.NumberFormat('fr-FR').format(p) + ' Ar';

const fetchData = async () => {
  loading.value = true;
  try {
    const [prodRes, catRes] = await Promise.all([api.get('/admin/products'), api.get('/admin/categories')]);
    if (prodRes.data.success) products.value = prodRes.data.data;
    if (catRes.data.success) categories.value = catRes.data.data.categories;
  } catch (err) { toast.error('Erreur technique'); }
  finally { loading.value = false; }
};

const openForm = (p = null) => {
  productImageFile.value = null;
  productImagePreview.value = null;
  if (p) {
    editing.value = true; editingId.value = p.id;
    Object.assign(form, { name: p.name, category_id: p.category_id, price: p.price, consignation_price: p.consignation_price, stock_quantity: p.stock_quantity, description: p.description || '', image: p.image || '' });
  } else {
    editing.value = false;
    Object.assign(form, { name: '', category_id: categories.value[0]?.id || '', price: 0, consignation_price: 0, stock_quantity: 0, description: '', image: '' });
  }
  showForm.value = true;
};

const submitProduct = async () => {
  submitting.value = true;
  try {
    // Use FormData to support optional image upload
    const fd = new FormData();
    fd.append('name', form.name);
    fd.append('category_id', form.category_id);
    fd.append('price', form.price);
    fd.append('consignation_price', form.consignation_price);
    fd.append('stock_quantity', form.stock_quantity);
    fd.append('description', form.description || '');
    if (productImageFile.value) fd.append('image', productImageFile.value);

    if (editing.value) {
      await api.put(`/admin/products/${editingId.value}`, fd);
      toast.success('Produit mis à jour');
    } else {
      await api.post('/admin/products', fd);
      toast.success('Référence créée');
    }
    showForm.value = false;
    fetchData();
  } catch (err) { toast.error(err.response?.data?.message || 'Erreur lors de la sauvegarde'); }
  finally { submitting.value = false; }
};

const deleteProduct = async (id) => {
  if (!confirm('Supprimer définitivement ce produit du catalogue ?')) return;
  try { await api.delete(`/admin/products/${id}`); toast.success('Produit supprimé'); fetchData(); }
  catch (err) { toast.error('Suppression impossible'); }
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
  box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5);
}
</style>
