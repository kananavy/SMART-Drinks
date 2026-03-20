<template>
  <div class="role-management">
    <div class="page-header flex justify-between items-end mb-8">
      <div>
        <h1 class="text-3xl font-display font-black tracking-tight">RÔLES & ACCÈS</h1>
        <p class="text-secondary text-sm mt-1">Configurez les permissions par rôle. Les changements s'appliquent à tous les utilisateurs du rôle.</p>
      </div>
      <div class="flex gap-2">
        <button @click="showCreateModal = true" class="btn btn-secondary gap-2">
          <span>✨</span> Nouvelle Permission
        </button>
        <button @click="saveAll" :disabled="saving" class="btn btn-primary gap-2 shadow-glow">
          <span v-if="saving">⏳</span><span v-else>💾</span>
          {{ saving ? 'Enregistrement...' : 'Sauvegarder tout' }}
        </button>
      </div>
    </div>

    <!-- Role Tabs -->
    <div class="glass p-1 rounded-xl flex border border-white/5 mb-8 w-fit">
      <button v-for="r in editableRoles" :key="r.key" @click="activeRole = r.key"
        :class="['px-6 py-2.5 rounded-lg text-[11px] font-black uppercase tracking-widest transition-all',
                 activeRole === r.key ? 'bg-primary text-white shadow-glow' : 'hover:bg-white/5 text-muted']">
        {{ r.icon }} {{ r.label }}
      </button>
    </div>

    <!-- Info banner -->
    <div class="glass-card p-4 mb-6 border border-primary/20 flex items-center gap-3">
      <span class="text-xl">ℹ️</span>
      <div>
        <p class="text-xs font-bold text-primary-light">Rôle actif : {{ currentRole?.label }}</p>
        <p class="text-[11px] text-muted mt-0.5">{{ currentRole?.desc }}</p>
      </div>
    </div>

    <div v-if="loading" class="flex justify-center py-24"><div class="spinner"></div></div>

    <div v-else>
      <!-- Permission groups -->
      <div v-for="(group, groupName) in groupedPermissions" :key="groupName" class="mb-6">
        <div class="flex items-center gap-3 mb-3">
          <span class="text-[10px] font-black uppercase tracking-widest text-muted">{{ groupName }}</span>
          <div class="flex-1 border-t border-white/5"></div>
          <button @click="toggleGroup(groupName)" class="text-[9px] font-black text-primary uppercase hover:underline">
            {{ groupAllGranted(group) ? 'Tout retirer' : 'Tout accorder' }}
          </button>
        </div>
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          <div v-for="perm in group" :key="perm.name"
            :class="['glass-card p-4 flex items-center justify-between gap-4 transition-all border',
                     localPerms[perm.name] ? 'border-primary/30 bg-primary/5' : 'border-white/5']">
            <div class="flex-1 min-w-0">
              <p class="text-xs font-bold truncate">{{ perm.label }}</p>
              <p class="text-[10px] text-muted font-mono">{{ perm.name }}</p>
            </div>
            <button @click="togglePerm(perm.name)"
              :class="['relative w-11 h-6 rounded-full transition-all flex-shrink-0 border',
                       localPerms[perm.name] ? 'bg-primary border-primary' : 'bg-white/5 border-white/10']">
              <span :class="['absolute top-0.5 w-5 h-5 rounded-full bg-white shadow transition-all',
                             localPerms[perm.name] ? 'left-5' : 'left-0.5']"></span>
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Create Permission Modal -->
    <div v-if="showCreateModal" class="fixed inset-0 bg-black/70 flex items-center justify-center z-50 backdrop-blur">
      <div class="glass-card border border-white/10 p-8 rounded-2xl w-full max-w-md">
        <h2 class="text-xl font-display font-bold mb-6">Créer une nouvelle permission</h2>
        <form @submit.prevent="createPermission">
          <div class="space-y-4">
            <div>
              <label class="text-xs font-bold text-muted uppercase">Label</label>
              <input v-model="newPermission.label" type="text" placeholder="Ex: Gérer les factures" class="input w-full mt-1">
            </div>
            <div>
              <label class="text-xs font-bold text-muted uppercase">Nom (auto)</label>
              <input v-model="newPermission.name" type="text" readonly class="input w-full mt-1 bg-white/5 font-mono text-xs" placeholder="ex: invoices.manage">
            </div>
            <div>
              <label class="text-xs font-bold text-muted uppercase">Catégorie</label>
              <input v-model="newPermission.category" type="text" placeholder="Ex: Facturation" class="input w-full mt-1">
            </div>
          </div>
          <div class="flex justify-end gap-3 mt-8">
            <button type="button" @click="showCreateModal = false" class="btn btn-secondary">Annuler</button>
            <button type="submit" class="btn btn-primary">Créer</button>
          </div>
        </form>
      </div>
    </div>

  </div>
</template>

<script setup>
import { ref, reactive, computed, watch, onMounted } from 'vue';
import api from '@/services/api';
import { useToastStore } from '@/stores/toast';
import { usePermissionsStore } from '@/stores/permissions';
import { slugify } from '@/utils/slugify';

const toast = useToastStore();
const permStore = usePermissionsStore();
const loading = ref(true);
const saving = ref(false);
const activeRole = ref('vendeur');
const allPermissions = ref([]);
const localPerms = reactive({});
const showCreateModal = ref(false);

const newPermission = reactive({
  name: '',
  label: '',
  category: '',
});

watch(() => newPermission.label, (label) => {
  const parts = slugify(label).split('-');
  if (parts.length > 1) {
    newPermission.name = `${parts[0]}.${parts.slice(1).join('-')}`;
  } else {
    newPermission.name = parts[0];
  }
});

const editableRoles = [
  { key: 'admin', label: 'Admin', icon: '🛡️', desc: 'Administrateur avec accès large mais limitable par le superadmin. Ne peut pas gérer les plans ni supprimer des utilisateurs par défaut.' },
  { key: 'vendeur', label: 'Vendeur', icon: '🧑‍💼', desc: 'Gère les commandes en salle (prise de commande, confirmation, validation).' },
  { key: 'caissier', label: 'Caissier', icon: '💳', desc: 'Traite les paiements et accède à la facturation.' },
];

const currentRole = computed(() => editableRoles.find(r => r.key === activeRole.value));

const groupedPermissions = computed(() => {
  const groups = {};
  allPermissions.value.forEach(p => {
    if (!groups[p.category]) groups[p.category] = [];
    groups[p.category].push(p);
  });
  return groups;
});

const groupAllGranted = (group) => group.every(p => localPerms[p.name]);

const toggleGroup = (groupName) => {
  const group = groupedPermissions.value[groupName];
  const allGranted = groupAllGranted(group);
  group.forEach(p => { localPerms[p.name] = !allGranted; });
};

const togglePerm = (name) => {
  localPerms[name] = !localPerms[name];
};

const loadRolePermissions = async (role) => {
  loading.value = true;
  try {
    const { data } = await api.get(`/admin/roles/${role}/permissions`);
    if (data.success) {
      allPermissions.value = data.data.permissions;
      // Reset localPerms
      Object.keys(localPerms).forEach(k => delete localPerms[k]);
      data.data.permissions.forEach(p => { localPerms[p.name] = p.granted; });
    }
  } catch (err) {
    toast.error('Erreur de chargement');
  } finally {
    loading.value = false;
  }
};

const saveAll = async () => {
  saving.value = true;
  try {
    const permissions = allPermissions.value.map(p => ({ name: p.name, granted: !!localPerms[p.name] }));
    await api.post(`/admin/roles/${activeRole.value}/permissions/bulk`, { permissions });
    toast.success(`Permissions du rôle ${currentRole.value?.label} sauvegardées`);

    // Refresh permissions store if we changed our own role's permissions
    if (permStore.role === activeRole.value) {
      await permStore.initialize({ role: activeRole.value });
    }
  } catch (err) {
    toast.error('Erreur de sauvegarde');
  } finally {
    saving.value = false;
  }
};

const createPermission = async () => {
  if (!newPermission.name || !newPermission.label || !newPermission.category) {
    return toast.error('Veuillez remplir tous les champs.');
  }
  try {
    await api.post('/admin/permissions', {
      name: newPermission.name,
      label: newPermission.label,
      category: newPermission.category,
    });
    toast.success('Permission créée avec succès !');
    showCreateModal.value = false;
    newPermission.name = '';
    newPermission.label = '';
    newPermission.category = '';
    // Reload permissions
    await loadRolePermissions(activeRole.value);
  } catch(err) {
    toast.error(err.response?.data?.error || 'Erreur lors de la création.');
  }
};

watch(activeRole, (role) => loadRolePermissions(role));

onMounted(() => loadRolePermissions(activeRole.value));
</script>
