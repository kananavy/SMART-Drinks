<template>
  <div class="user-management-premium">
    <div class="page-header flex justify-between items-center mb-8">
      <div>
        <h1 class="text-3xl font-display font-black tracking-tight">ANNUAIRE DU STAFF</h1>
        <p class="text-secondary text-sm">Gérez les accès et les profils de votre équipe.</p>
      </div>
      <div class="flex gap-3">
        <router-link to="/admin/roles" class="btn btn-secondary gap-2 text-xs">
          🔐 Rôles & Accès
        </router-link>
        <button @click="openForm()" class="btn btn-primary shadow-glow">
          <span class="mr-2">＋</span> NOUVEL UTILISATEUR
        </button>
      </div>
    </div>

    <!-- Filters -->
    <div class="glass-card p-4 mb-6 flex flex-wrap gap-3 items-center">
      <input v-model="search" @input="onSearch" placeholder="Rechercher par nom ou email..."
        class="input-filter flex-1 min-w-[200px]" />
      <div class="glass p-1 rounded-xl flex border border-white/5">
        <button v-for="r in roleFilters" :key="r.val" @click="roleFilter = r.val; currentPage = 1; fetchUsers()"
          :class="['px-4 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all',
                   roleFilter === r.val ? 'bg-primary text-white shadow-glow' : 'hover:bg-white/5 text-muted']">
          {{ r.label }}
        </button>
      </div>
    </div>

    <div v-if="loading" class="flex justify-center py-24"><div class="spinner"></div></div>

    <div v-else>
      <div v-if="users.length === 0" class="glass-card p-16 text-center">
        <div class="text-5xl mb-4 opacity-20">👥</div>
        <p class="text-muted font-display uppercase tracking-widest text-sm">Aucun utilisateur trouvé</p>
      </div>

      <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div v-for="user in users" :key="user.id"
          class="glass-card p-6 flex flex-col group border border-white/5 relative overflow-hidden">
          <!-- Role Badge -->
          <div class="absolute top-0 right-0">
            <div :class="['px-4 py-1 rounded-bl-2xl text-[10px] font-black uppercase tracking-widest',
              user.role === 'superadmin' ? 'bg-primary text-white shadow-glow' :
              user.role === 'admin' ? 'bg-info/20 text-info' :
              user.role === 'caissier' ? 'bg-warning/20 text-warning' : 'bg-white/5 text-secondary']">
              {{ roleLabel(user.role) }}
            </div>
          </div>

          <div class="flex items-center gap-4 mb-6 mt-2">
            <div class="w-14 h-14 rounded-2xl bg-gradient-to-tr from-primary/20 to-secondary/20 border border-white/10
              flex items-center justify-center text-2xl font-black text-primary-light shadow-inner flex-shrink-0">
              {{ user.name?.charAt(0) }}
            </div>
            <div class="flex flex-col min-w-0">
              <h3 class="font-display font-extrabold text-lg tracking-tight leading-none mb-1 uppercase truncate">{{ user.name }}</h3>
              <span class="text-xs text-muted font-medium truncate">{{ user.email }}</span>
              <span v-if="user.phone" class="text-[10px] text-muted">{{ user.phone }}</span>
            </div>
          </div>

          <div class="grid grid-cols-2 gap-3 mb-5">
            <!-- Active toggle -->
            <div class="glass p-3 rounded-xl border border-white/5 flex flex-col gap-1">
              <span class="text-[9px] font-bold text-muted uppercase tracking-widest">Statut</span>
              <button @click="toggleActive(user)"
                :class="['text-[10px] font-black uppercase flex items-center gap-1.5 transition-colors',
                         user.active ? 'text-success hover:text-danger' : 'text-danger hover:text-success']">
                <span class="w-1.5 h-1.5 rounded-full bg-current"></span>
                {{ user.active ? 'Actif' : 'Inactif' }}
              </button>
            </div>
            <router-link :to="`/admin/users/${user.id}/permissions`"
              class="glass p-3 rounded-xl border border-white/5 hover:border-primary/50 transition-all flex flex-col gap-1">
              <span class="text-[9px] font-bold text-muted uppercase tracking-widest">Permissions</span>
              <span class="text-[10px] font-black uppercase text-primary-light">GÉRER 🔐</span>
            </router-link>
          </div>

          <div class="mt-auto flex gap-2">
            <button @click="openForm(user)" class="flex-1 btn btn-secondary py-2.5 text-[10px] font-black uppercase">
              ✏️ Modifier
            </button>
            <button @click="resetPassword(user)" class="btn btn-secondary py-2.5 px-3 text-[10px]" title="Réinitialiser MDP">
              🔑
            </button>
            <button @click="deleteUser(user.id)" class="btn py-2.5 px-3 rounded-xl border border-danger/20 text-danger hover:bg-danger/10 transition-colors">
              🗑️
            </button>
          </div>
        </div>
      </div>

      <!-- Pagination -->
      <div v-if="totalPages > 1" class="mt-8 flex items-center justify-between">
        <span class="text-[10px] text-muted font-bold uppercase">{{ totalItems }} utilisateurs — Page {{ currentPage }} / {{ totalPages }}</span>
        <div class="flex gap-1">
          <button @click="goToPage(currentPage - 1)" :disabled="currentPage === 1"
            class="px-3 py-1.5 rounded-lg text-[10px] font-black border border-white/10 hover:bg-white/5 disabled:opacity-30 transition-all">←</button>
          <button v-for="p in pageRange" :key="p" @click="goToPage(p)"
            :class="['px-3 py-1.5 rounded-lg text-[10px] font-black border transition-all',
                     p === currentPage ? 'bg-primary text-white border-primary' : 'border-white/10 hover:bg-white/5']">
            {{ p }}
          </button>
          <button @click="goToPage(currentPage + 1)" :disabled="currentPage === totalPages"
            class="px-3 py-1.5 rounded-lg text-[10px] font-black border border-white/10 hover:bg-white/5 disabled:opacity-30 transition-all">→</button>
        </div>
      </div>
    </div>

    <!-- Modal Form -->
    <div v-if="showForm" class="modal-overlay z-[300]" @click.self="showForm = false">
      <div class="modal-content-glass max-w-md w-full p-8 animate-zoom-in">
        <h2 class="text-2xl font-display font-black tracking-tight mb-8">
          {{ editing ? 'MODIFIER LE PROFIL' : 'NOUVEAU COLLABORATEUR' }}
        </h2>

        <form @submit.prevent="submitUser" class="space-y-5">
          <div class="space-y-1.5">
            <label class="text-[10px] font-black uppercase tracking-widest text-secondary">Identité</label>
            <input v-model="form.name" class="input-premium w-full" placeholder="Nom complet" required />
          </div>

          <div class="space-y-1.5">
            <label class="text-[10px] font-black uppercase tracking-widest text-secondary">Email professionnel</label>
            <input v-model="form.email" type="email" class="input-premium w-full" placeholder="staff@barlounge.com" required />
          </div>

          <div v-if="!editing" class="space-y-1.5">
            <label class="text-[10px] font-black uppercase tracking-widest text-secondary">Mot de passe</label>
            <input v-model="form.password" type="password" class="input-premium w-full" required />
          </div>

          <div v-if="editing" class="space-y-1.5">
            <label class="text-[10px] font-black uppercase tracking-widest text-secondary">Nouveau mot de passe (optionnel)</label>
            <input v-model="form.password" type="password" class="input-premium w-full" placeholder="Laisser vide pour ne pas changer" />
          </div>

          <div class="grid grid-cols-2 gap-4">
            <div class="space-y-1.5">
              <label class="text-[10px] font-black uppercase tracking-widest text-secondary">Rôle</label>
              <select v-model="form.role" class="input-premium w-full">
                <option value="vendeur">Vendeur</option>
                <option value="caissier">Caissier</option>
                <option value="admin">Admin</option>
                <option value="superadmin">Super Admin</option>
              </select>
            </div>
            <div class="space-y-1.5">
              <label class="text-[10px] font-black uppercase tracking-widest text-secondary">Mobile</label>
              <input v-model="form.phone" class="input-premium w-full" placeholder="+261" />
            </div>
          </div>

          <div v-if="editing" class="space-y-1.5">
            <label class="text-[10px] font-black uppercase tracking-widest text-secondary">Statut</label>
            <select v-model="form.active" class="input-premium w-full">
              <option :value="true">Actif</option>
              <option :value="false">Inactif</option>
            </select>
          </div>

          <div class="flex gap-4 pt-4">
            <button type="submit" class="btn btn-primary flex-1 py-4 uppercase font-black" :disabled="submitting">
              {{ submitting ? 'Enregistrement...' : 'Confirmer' }}
            </button>
            <button type="button" @click="showForm = false" class="btn btn-secondary px-6">Annuler</button>
          </div>
        </form>
      </div>
    </div>

    <!-- Reset Password Modal -->
    <div v-if="showResetModal" class="modal-overlay z-[300]" @click.self="showResetModal = false">
      <div class="modal-content-glass max-w-sm w-full p-8 animate-zoom-in">
        <h2 class="text-xl font-display font-black tracking-tight mb-2">RÉINITIALISER LE MOT DE PASSE</h2>
        <p class="text-secondary text-sm mb-6">Définir un nouveau mot de passe pour <strong>{{ resetTarget?.name }}</strong></p>
        <form @submit.prevent="confirmResetPassword" class="space-y-4">
          <input v-model="newPassword" type="password" class="input-premium w-full" placeholder="Nouveau mot de passe" required minlength="6" />
          <div class="flex gap-3">
            <button type="submit" class="btn btn-primary flex-1 py-3 font-black uppercase" :disabled="submitting">
              {{ submitting ? '...' : 'Confirmer' }}
            </button>
            <button type="button" @click="showResetModal = false" class="btn btn-secondary px-5">Annuler</button>
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
const users = ref([]);
const loading = ref(true);
const showForm = ref(false);
const editing = ref(false);
const submitting = ref(false);
const editingId = ref(null);
const search = ref('');
const roleFilter = ref('');
const currentPage = ref(1);
const totalPages = ref(1);
const totalItems = ref(0);
const showResetModal = ref(false);
const resetTarget = ref(null);
const newPassword = ref('');
let searchTimer = null;

const form = reactive({ name: '', email: '', password: '', phone: '', role: 'vendeur', active: true });

const roleFilters = [
  { label: 'Tous', val: '' },
  { label: 'Vendeurs', val: 'vendeur' },
  { label: 'Caissiers', val: 'caissier' },
  { label: 'Admins', val: 'admin' },
  { label: 'Super Admin', val: 'superadmin' },
];

const pageRange = computed(() => {
  const range = [];
  const start = Math.max(1, currentPage.value - 2);
  const end = Math.min(totalPages.value, currentPage.value + 2);
  for (let i = start; i <= end; i++) range.push(i);
  return range;
});

const roleLabel = (r) => ({ vendeur: 'Vendeur', caissier: 'Caissier', admin: 'Admin', superadmin: 'Super Admin', client: 'Client' }[r] || r);

const fetchUsers = async () => {
  loading.value = true;
  try {
    const params = { page: currentPage.value, limit: 12 };
    if (roleFilter.value) params.role = roleFilter.value;
    if (search.value) params.search = search.value;
    const { data } = await api.get('/admin/users', { params });
    if (data.success) {
      users.value = data.data;
      totalPages.value = data.pagination?.totalPages || 1;
      totalItems.value = data.pagination?.total || data.data.length;
    }
  } catch (err) {
    toast.error('Erreur annuaire');
  } finally {
    loading.value = false;
  }
};

const onSearch = () => {
  clearTimeout(searchTimer);
  searchTimer = setTimeout(() => { currentPage.value = 1; fetchUsers(); }, 400);
};

const goToPage = (p) => {
  if (p >= 1 && p <= totalPages.value) { currentPage.value = p; fetchUsers(); }
};

const openForm = (u = null) => {
  if (u) {
    editing.value = true; editingId.value = u.id;
    Object.assign(form, { name: u.name, email: u.email, phone: u.phone || '', role: u.role, password: '', active: u.active });
  } else {
    editing.value = false;
    Object.assign(form, { name: '', email: '', password: '', phone: '', role: 'vendeur', active: true });
  }
  showForm.value = true;
};

const submitUser = async () => {
  submitting.value = true;
  try {
    if (editing.value) {
      const payload = { name: form.name, email: form.email, phone: form.phone, role: form.role, active: form.active };
      if (form.password) payload.password = form.password;
      await api.put(`/admin/users/${editingId.value}`, payload);
      toast.success('Profil mis à jour');
    } else {
      await api.post('/admin/users', form);
      toast.success('Nouveau membre ajouté');
    }
    showForm.value = false;
    fetchUsers();
  } catch (err) {
    toast.error(err.response?.data?.message || 'Erreur technique');
  } finally {
    submitting.value = false;
  }
};

const toggleActive = async (user) => {
  try {
    await api.put(`/admin/users/${user.id}`, { name: user.name, email: user.email, role: user.role, active: !user.active });
    user.active = !user.active;
    toast.success(user.active ? 'Compte activé' : 'Compte désactivé');
  } catch {
    toast.error('Échec de la mise à jour');
  }
};

const resetPassword = (user) => {
  resetTarget.value = user;
  newPassword.value = '';
  showResetModal.value = true;
};

const confirmResetPassword = async () => {
  submitting.value = true;
  try {
    await api.put(`/admin/users/${resetTarget.value.id}`, { password: newPassword.value });
    toast.success('Mot de passe réinitialisé');
    showResetModal.value = false;
  } catch {
    toast.error('Échec de la réinitialisation');
  } finally {
    submitting.value = false;
  }
};

const deleteUser = async (id) => {
  if (!confirm('Révoquer l\'accès et supprimer ce profil ?')) return;
  try {
    await api.delete(`/admin/users/${id}`);
    toast.success('Profil supprimé');
    fetchUsers();
  } catch {
    toast.error('Échec de la suppression');
  }
};

onMounted(fetchUsers);
</script>

<style scoped>
.input-filter {
  background: rgba(255,255,255,0.04);
  border: 1px solid rgba(255,255,255,0.08);
  border-radius: 10px;
  padding: 8px 14px;
  color: inherit;
  font-size: 12px;
  outline: none;
  transition: border-color 0.2s;
}
.input-filter:focus { border-color: var(--primary, #6366f1); }

.modal-content-glass {
  background: rgba(15, 15, 30, 0.95);
  backdrop-filter: blur(40px);
  -webkit-backdrop-filter: blur(40px);
  border-radius: 32px;
  border: 1px solid rgba(255, 255, 255, 0.1);
}
</style>
