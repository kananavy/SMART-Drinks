<template>
  <div class="permissions-page-premium">
    <!-- Header / Nav -->
    <div class="flex items-center justify-between mb-8">
      <div>
        <router-link to="/admin/users" class="text-xs font-bold text-primary uppercase tracking-[0.2em] hover:opacity-70 transition-opacity flex items-center gap-2 mb-2">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" /></svg>
          Retour aux utilisateurs
        </router-link>
        <h1 class="text-3xl font-display font-black tracking-tight">PERMISSIONS: <span class="text-primary">{{ userName }}</span></h1>
      </div>

      <!-- Quick Actions / Presets -->
      <div class="flex items-center gap-3">
        <span class="text-[10px] font-black text-secondary uppercase tracking-widest mr-2">Appliquer un profil :</span>
        <button @click="applyPreset('vendeur')" class="btn-preset">VENDEUR</button>
        <button @click="applyPreset('caissier')" class="btn-preset">CAISSIER</button>
      </div>
    </div>

    <div v-if="loading" class="flex justify-center py-24"><div class="spinner"></div></div>
    
    <div v-else class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
      <div v-for="(perms, cat) in groupedPermissions" :key="cat" class="glass-card overflow-hidden">
        <div class="bg-white/5 px-6 py-4 border-b border-color flex items-center justify-between">
          <h3 class="font-display font-black text-sm uppercase tracking-widest">{{ cat }}</h3>
          <span class="text-[10px] bg-primary/20 text-primary px-2 py-0.5 rounded-full font-bold">{{ perms.length }}</span>
        </div>
        
        <div class="p-4 space-y-2">
          <div v-for="p in perms" :key="p.id" class="permission-row group p-4 rounded-xl hover:bg-white/5 transition-all border border-transparent hover:border-white/5 flex items-center justify-between">
            <div class="flex flex-col">
              <span class="text-sm font-bold tracking-tight">{{ p.label }}</span>
              <span class="text-[10px] text-muted font-mono">{{ p.name }}</span>
            </div>
            
            <label class="switch scale-90">
              <input 
                type="checkbox" 
                :checked="p.granted" 
                @change="handleToggle(p)"
                :disabled="toggling === p.id"
              >
              <span class="slider text-primary"></span>
            </label>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { useRoute } from 'vue-router';
import api from '@/services/api';
import { useToastStore } from '@/stores/toast';

const route = useRoute();
const toast = useToastStore();
const userId = route.params.id;
const userName = ref('Utilisateur');
const userRole = ref('');
const permissions = ref([]);
const loading = ref(true);
const toggling = ref(null);

const groupedPermissions = computed(() => {
  return permissions.value.reduce((acc, p) => {
    const cat = p.category || 'Général';
    if (!acc[cat]) acc[cat] = [];
    acc[cat].push(p);
    return acc;
  }, {});
});

const fetchDetails = async () => {
  loading.value = true;
  try {
    const { data: userResp } = await api.get(`/admin/users`, { params: { limit: 200 } });
    const user = userResp.data.find(u => u.id == userId);
    if(user) {
      userName.value = user.name;
      userRole.value = user.role;
    }

    const { data } = await api.get(`/admin/users/${userId}/permissions`);
    if (data.success) {
      permissions.value = data.data.permissions;
    }
  } catch (err) {
    toast.error('Erreur de chargement');
  } finally {
    loading.value = false;
  }
};

const handleToggle = async (p) => {
  toggling.value = p.id;
  const newState = !p.granted;
  try {
    const { data } = await api.post(`/admin/users/${userId}/permissions/toggle`, {
      permission_id: p.id,
      granted: newState
    });
    if (data.success) {
      p.granted = newState;
      toast.success('Accès mis à jour');
    }
  } catch (err) {
    toast.error('Échec de la mise à jour');
  } finally {
    toggling.value = null;
  }
};

const applyPreset = async (roleName) => {
  if (!confirm(`Appliquer les permissions par défaut pour le profil [${roleName.toUpperCase()}] ?`)) return;
  
  const presets = {
    vendeur: ['orders.view', 'orders.create', 'products.view', 'stock.view'],
    caissier: ['orders.view', 'payments.manage', 'payments.view']
  };

  const target = presets[roleName] || [];
  
  loading.value = true;
  try {
    for (const p of permissions.value) {
      const shouldGrant = target.includes(p.name);
      if (p.granted !== shouldGrant) {
        await api.post(`/admin/users/${userId}/permissions/toggle`, {
          permission_id: p.id,
          granted: shouldGrant
        });
        p.granted = shouldGrant;
      }
    }
    toast.success(`Profil ${roleName} appliqué avec succès`);
  } catch (err) {
    toast.error('Erreur lors de l\'application du profil');
  } finally {
    loading.value = false;
  }
};

onMounted(fetchDetails);
</script>

<style scoped>
.permissions-page-premium {
  min-height: 80vh;
}

.btn-preset {
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  padding: 8px 16px;
  border-radius: 12px;
  font-size: 10px;
  font-weight: 800;
  letter-spacing: 0.1em;
  transition: all 0.3s;
}
.btn-preset:hover {
  background: var(--primary);
  border-color: var(--primary);
  color: white;
  transform: translateY(-2px);
  box-shadow: 0 4px 15px rgba(129, 140, 248, 0.3);
}

.permission-row:hover {
  background: rgba(129, 140, 248, 0.05);
}
</style>
