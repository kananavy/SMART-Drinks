<template>
  <div class="category-management-premium">
    <div class="page-header flex justify-between items-center mb-10">
      <div>
        <h1 class="text-3xl font-display font-black tracking-tight">CLASSES DE PRODUITS</h1>
        <p class="text-secondary text-sm">Organisez votre catalogue par univers et conditionnement.</p>
      </div>
      <button @click="openForm()" class="btn btn-primary shadow-glow">
        <span class="mr-2">＋</span> NOUVELLE CATÉGORIE
      </button>
    </div>

    <div v-if="loading" class="flex justify-center py-24"><div class="spinner"></div></div>
    
    <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
      <div v-for="cat in categories" :key="cat.id" class="glass-card flex flex-col group overflow-hidden border border-white/5 translate-hover">
        <!-- Category Image / Hero -->
        <div class="h-40 relative overflow-hidden bg-gradient-to-br from-primary/10 to-secondary/10">
           <img v-if="cat.image" :src="cat.image" class="w-full h-full object-cover opacity-80 group-hover:scale-110 transition-transform duration-700" />
           <div v-else class="w-full h-full flex items-center justify-center text-4xl grayscale opacity-30">
             {{ cat.icon || '📦' }}
           </div>
           
           <div class="absolute top-4 left-4">
             <span class="px-3 py-1 bg-black/60 backdrop-blur-md rounded-full text-[9px] font-black uppercase tracking-widest text-primary-light border border-white/10">
                #{{ cat.sort_order }}
             </span>
           </div>
           
           <div class="absolute inset-0 bg-gradient-to-t from-bg-primary via-transparent to-transparent"></div>
        </div>

        <div class="p-6 pt-2">
           <div class="flex justify-between items-start mb-4">
              <div>
                <h3 class="text-xl font-display font-black uppercase tracking-tight">{{ cat.name }}</h3>
                <span class="text-[10px] font-bold text-muted uppercase tracking-widest">
                  Conditionné en : <span class="text-accent">{{ cat.packaging_type || 'Unité' }}</span>
                </span>
              </div>
              <div class="flex gap-1">
                <button @click="openForm(cat)" class="p-2 hover:bg-white/10 rounded-lg text-secondary transition-colors"><svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg></button>
                <button @click="deleteCategory(cat.id)" class="p-2 hover:bg-danger/10 rounded-lg text-danger transition-colors"><svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-4v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg></button>
              </div>
           </div>
           
           <div class="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-secondary pt-4 border-t border-color">
              <span class="w-2 h-2 rounded-full bg-primary shadow-glow"></span>
              {{ cat.Products?.length || 0 }} références liées
           </div>
        </div>
      </div>
    </div>

    <!-- Modal Category Form -->
    <div v-if="showForm" class="modal-overlay z-[300]" @click.self="showForm = false">
      <div class="modal-content-glass max-w-lg w-full p-8 animate-zoom-in">
        <h2 class="text-2xl font-display font-black tracking-tight mb-8">
          {{ editing ? 'MISE À JOUR CATÉGORIE' : 'NOUVEL UNIVERS' }}
        </h2>
        
        <form @submit.prevent="submitCategory" class="space-y-6">
          <div class="space-y-2">
            <label class="text-[10px] font-black uppercase tracking-widest text-secondary">Désignation</label>
            <input v-model="form.name" class="input-premium w-full" placeholder="Ex: Rhums Vieux, Soft-drinks..." required />
          </div>

          <div class="grid grid-cols-2 gap-4">
            <div class="space-y-2">
              <label class="text-[10px] font-black uppercase tracking-widest text-secondary">Type de contenant</label>
              <select v-model="form.packaging_type" class="input-premium w-full">
                <option value="Bouteille">Bouteille 🍾</option>
                <option value="Verre">Verre/Dose 🥃</option>
                <option value="Pack/Carton">Pack / Carton 📦</option>
                <option value="Cageau">Cageau 🚛</option>
                <option value="Paquet">Paquet 🏷️</option>
                <option value="Unité">Unité simple</option>
              </select>
            </div>
            <div class="space-y-2">
              <label class="text-[10px] font-black uppercase tracking-widest text-secondary">Ordre d'affichage</label>
              <input v-model.number="form.sort_order" type="number" class="input-premium w-full" />
            </div>
          </div>

          <div class="space-y-2">
             <label class="text-[10px] font-black uppercase tracking-widest text-secondary">Image de couverture</label>
             <ImageUploader :modelValue="previewImage || form.image" @uploaded="(file) => { fileToUpload = file; previewImage = URL.createObjectURL(file); }" />
          </div>

          <div class="flex gap-4 pt-6">
            <button type="submit" class="btn btn-primary flex-1 py-4 uppercase font-black" :disabled="submitting">
              {{ submitting ? 'Synchronisation...' : 'Enregistrer la catégorie' }}
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
import { ref, reactive, onMounted } from 'vue';
import api from '@/services/api';
import { useToastStore } from '@/stores/toast';
import ImageUploader from '@/components/ImageUploader.vue';

const toast = useToastStore();
const categories = ref([]);
const loading = ref(true);
const showForm = ref(false);
const editing = ref(false);
const submitting = ref(false);
const editingId = ref(null);
const previewImage = ref(null);
const fileToUpload = ref(null);

const form = reactive({ name: '', packaging_type: 'Bouteille', sort_order: 0, image: '', icon: '' });

const fetchCategories = async () => {
  loading.value = true;
  try {
    const { data } = await api.get('/admin/categories');
    if (data.success) categories.value = data.data.categories;
  } catch (err) { toast.error('Échec du chargement'); }
  finally { loading.value = false; }
};

const openForm = (cat = null) => {
  if (cat) {
    editing.value = true; editingId.value = cat.id;
    Object.assign(form, { 
      name: cat.name, 
      packaging_type: cat.packaging_type || 'Bouteille', 
      sort_order: cat.sort_order,
      image: cat.image || '',
      icon: cat.icon || ''
    });
  } else {
    editing.value = false;
    Object.assign(form, { name: '', packaging_type: 'Bouteille', sort_order: categories.value.length, image: '', icon: '' });
  }
  previewImage.value = null;
  fileToUpload.value = null;
  showForm.value = true;
};

const handleImageUpload = (e) => {
  const file = e.target.files[0];
  if (!file) return;
  fileToUpload.value = file;
  previewImage.value = URL.createObjectURL(file);
};

const submitCategory = async () => {
  submitting.value = true;
  try {
    let catId = editingId.value;
    if (editing.value) {
      await api.put(`/admin/categories/${editingId.value}`, form);
    } else {
      const { data } = await api.post('/admin/categories', form);
      catId = data.data.category.id;
    }

    // Handle image upload if selected
    if (fileToUpload.value) {
      const formData = new FormData();
      formData.append('image', fileToUpload.value);
      await api.post(`/admin/categories/${catId}/image`, formData);
    }

    toast.success('Données sauvegardées');
    showForm.value = false;
    fetchCategories();
  } catch (err) { toast.error('Erreur technique'); }
  finally { submitting.value = false; }
};

const deleteCategory = async (id) => {
  if (!confirm('Supprimer cette catégorie ? Les produits liés ne seront pas supprimés mais pourraient être orphelins.')) return;
  try {
    await api.delete(`/admin/categories/${id}`);
    toast.success('Catégorie retirée');
    fetchCategories();
  } catch (err) { toast.error('Échec de la suppression'); }
};

onMounted(fetchCategories);
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
