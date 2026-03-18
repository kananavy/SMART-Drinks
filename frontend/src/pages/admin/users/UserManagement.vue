<template>
  <div class="user-management-premium">
    <div class="page-header flex justify-between items-center mb-10">
      <div>
        <h1 class="text-3xl font-display font-black tracking-tight">ANNUAIRE DU STAFF</h1>
        <p class="text-secondary text-sm">Gérez les accès et les profils de votre équipe.</p>
      </div>
      <button @click="openForm()" class="btn btn-primary shadow-glow">
        <span class="mr-2">＋</span> NOUVEL UTILISATEUR
      </button>
    </div>

    <div v-if="loading" class="flex justify-center py-24"><div class="spinner"></div></div>
    
    <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
      <div v-for="user in users" :key="user.id" class="glass-card p-8 flex flex-col group translate-hover border border-white/5 relative overflow-hidden">
        <!-- Role Badge -->
        <div class="absolute top-0 right-0">
          <div :class="['px-4 py-1 rounded-bl-2xl text-[10px] font-black uppercase tracking-widest', user.role === 'superadmin' ? 'bg-primary text-white shadow-glow' : 'bg-white/5 text-secondary']">
            {{ roleLabel(user.role) }}
          </div>
        </div>

        <div class="flex items-center gap-6 mb-8 mt-2">
          <div class="w-16 h-16 rounded-2xl bg-gradient-to-tr from-primary/20 to-secondary/20 border border-white/10 flex items-center justify-center text-2xl font-black text-primary-light shadow-inner">
            {{ user.name.charAt(0) }}
          </div>
          <div class="flex flex-col">
            <h3 class="font-display font-extrabold text-xl tracking-tight leading-none mb-1 uppercase">{{ user.name }}</h3>
            <span class="text-xs text-muted font-medium">{{ user.email }}</span>
          </div>
        </div>

        <div class="grid grid-cols-2 gap-4 mb-8">
          <div class="glass p-3 rounded-xl border border-white/5">
            <span class="text-[9px] font-bold text-muted uppercase tracking-widest block mb-1">Statut</span>
            <span :class="['text-[10px] font-black uppercase flex items-center gap-1.5', user.active ? 'text-success' : 'text-danger']">
               <span class="w-1.5 h-1.5 rounded-full bg-current"></span>
               {{ user.active ? 'Opérationnel' : 'Inactif' }}
            </span>
          </div>
          <router-link :to="`/admin/users/${user.id}/permissions`" class="glass p-3 rounded-xl border border-white/5 hover:border-primary/50 transition-all text-center flex flex-col items-center justify-center group/btn">
            <span class="text-[9px] font-bold text-muted uppercase tracking-widest block mb-1">Accès</span>
            <span class="text-[10px] font-black uppercase text-primary-light group-hover/btn:scale-105 transition-transform">GÉRER 🔐</span>
          </router-link>
        </div>

        <div class="mt-auto flex gap-3">
          <button @click="editUser(user)" class="flex-1 btn btn-secondary py-3 text-[10px] font-black uppercase tracking-tighter">Modifier Profil</button>
          <button @click="deleteUser(user.id)" class="btn btn-danger/20 hover:bg-danger/20 text-danger p-3 rounded-xl border border-danger/10 transition-colors">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-4v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
          </button>
        </div>
      </div>
    </div>

    <!-- Modal Form (Premium Version) -->
    <div v-if="showForm" class="modal-overlay z-[300]" @click.self="showForm = false">
      <div class="modal-content-glass max-w-md w-full p-8 animate-zoom-in">
        <h2 class="text-2xl font-display font-black tracking-tight mb-8">
          {{ editing ? 'MODIFIER LE PROFIL' : 'NOUVEAU COLLABORATEUR' }}
        </h2>
        
        <form @submit.prevent="submitUser" class="space-y-6">
          <div class="space-y-2">
            <label class="text-[10px] font-black uppercase tracking-widest text-secondary">Identité</label>
            <input v-model="form.name" class="input-premium w-full" placeholder="Nom complet" required />
          </div>

          <div class="space-y-2">
            <label class="text-[10px] font-black uppercase tracking-widest text-secondary">Email professionnel</label>
            <input v-model="form.email" type="email" class="input-premium w-full" placeholder="staff@barlounge.com" required />
          </div>

          <div v-if="!editing" class="space-y-2">
            <label class="text-[10px] font-black uppercase tracking-widest text-secondary">Mot de passe provisoire</label>
            <input v-model="form.password" type="password" class="input-premium w-full" required />
          </div>

          <div class="grid grid-cols-2 gap-4">
            <div class="space-y-2">
              <label class="text-[10px] font-black uppercase tracking-widest text-secondary">Rôle Système</label>
              <select v-model="form.role" class="input-premium w-full">
                <option value="vendeur">Vendeur</option>
                <option value="caissier">Caissier</option>
                <option value="superadmin">Super Admin</option>
              </select>
            </div>
            <div class="space-y-2">
              <label class="text-[10px] font-black uppercase tracking-widest text-secondary">Mobile</label>
              <input v-model="form.phone" class="input-premium w-full" placeholder="+261" />
            </div>
          </div>

          <div class="flex gap-4 pt-6">
            <button type="submit" class="btn btn-primary flex-1 py-4 uppercase font-black" :disabled="submitting">
              {{ submitting ? 'Enregistrement...' : 'Confirmer le profil' }}
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

const toast = useToastStore();
const users = ref([]);
const loading = ref(true);
const showForm = ref(false);
const editing = ref(false);
const submitting = ref(false);
const editingId = ref(null);
const form = reactive({ name: '', email: '', password: '', phone: '', role: 'vendeur' });

const roleLabel = (r) => ({ vendeur: 'Vendeur Staff', caissier: 'Caissier', superadmin: 'Administrateur', client: 'Client' }[r] || r);

const fetchUsers = async () => {
  loading.value = true;
  try {
    const { data } = await api.get('/admin/users');
    if (data.success) users.value = data.data;
  } catch (err) { toast.error('Erreur annuaire'); }
  finally { loading.value = false; }
};

const openForm = (u = null) => {
  if (u) {
    editing.value = true; editingId.value = u.id;
    form.name = u.name; form.email = u.email; form.phone = u.phone || '';
    form.role = u.role; form.password = '';
  } else {
    editing.value = false;
    Object.assign(form, { name: '', email: '', password: '', phone: '', role: 'vendeur' });
  }
  showForm.value = true;
};

const submitUser = async () => {
  submitting.value = true;
  try {
    if (editing.value) {
      const payload = { name: form.name, email: form.email, phone: form.phone, role: form.role };
      if (form.password) payload.password = form.password;
      await api.put(`/admin/users/${editingId.value}`, payload);
      toast.success('Profil mis à jour');
    } else {
      await api.post('/admin/users', form);
      toast.success('Nouveau membre ajouté');
    }
    showForm.value = false;
    fetchUsers();
  } catch (err) { toast.error(err.response?.data?.message || 'Erreur technique'); }
  finally { submitting.value = false; }
};

const deleteUser = async (id) => {
  if (!confirm('Révoquer l\'accès et supprimer ce profil ?')) return;
  try {
    await api.delete(`/admin/users/${id}`);
    toast.success('Profil supprimé');
    fetchUsers();
  } catch (err) { toast.error('Échec de la suppression'); }
};

onMounted(fetchUsers);
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
