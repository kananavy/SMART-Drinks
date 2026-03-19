<template>
  <div class="pb-4">
    <!-- Header -->
    <div class="flex items-start justify-between mb-8 flex-wrap gap-4">
      <div>
        <h1 class="text-3xl font-display font-black tracking-tighter flex items-center gap-3">
          <span>👑</span> PLANS & LICENCES
        </h1>
        <p class="text-secondary text-sm mt-1">Gérez votre abonnement et les fonctionnalités disponibles</p>
      </div>
      <div class="flex items-center gap-3">
        <div class="glass px-4 py-2.5 rounded-xl border flex items-center gap-2"
          :style="{ borderColor: planStore.plan.color + '40' }">
          <span class="text-lg">{{ planStore.plan.icon }}</span>
          <div>
            <p class="text-[9px] font-black uppercase tracking-widest text-muted">Plan actuel</p>
            <p class="text-sm font-black" :style="{ color: planStore.plan.color }">{{ planStore.plan.name }}</p>
          </div>
        </div>
        <div class="glass px-4 py-2.5 rounded-xl border border-white/5 flex items-center gap-2">
          <div :class="['w-2 h-2 rounded-full', planStore.isActive ? 'bg-success animate-pulse' : 'bg-danger']"></div>
          <span class="text-xs font-bold uppercase tracking-widest text-secondary">{{ planStore.statusLabel }}</span>
        </div>
      </div>
    </div>

    <div v-if="loading" class="flex justify-center py-24"><div class="spinner"></div></div>

    <div v-else class="space-y-8">

      <!-- ══ CURRENT PLAN STATUS ══ -->
      <div class="plan-status-card glass-card overflow-hidden" :style="{ '--plan-color': planStore.plan.color }">
        <div class="plan-status-header" :style="{ background: planStore.plan.gradient }">
          <div class="flex items-center gap-4">
            <div class="plan-big-icon">{{ planStore.plan.icon }}</div>
            <div>
              <p class="text-white/70 text-xs font-bold uppercase tracking-widest">Plan Actif</p>
              <h2 class="text-white font-display font-black text-2xl tracking-tight">{{ planStore.plan.name }}</h2>
              <p class="text-white/70 text-sm">{{ planStore.plan.description }}</p>
            </div>
          </div>
          <div class="text-right text-white">
            <p class="text-white/70 text-xs font-bold uppercase mb-1">Statut</p>
            <div class="flex items-center gap-2 justify-end">
              <div :class="['w-2.5 h-2.5 rounded-full', planStore.isActive ? 'bg-white animate-pulse' : 'bg-red-300']"></div>
              <span class="font-black text-sm">{{ planStore.isActive ? 'ACTIF' : 'EXPIRÉ' }}</span>
            </div>
            <p v-if="planStore.daysRemaining !== null" class="text-white/60 text-xs mt-1">
              {{ planStore.daysRemaining > 0 ? `Expire dans ${planStore.daysRemaining} jour(s)` : 'Expiré' }}
            </p>
            <p v-else-if="planStore.currentPlanId !== 'free'" class="text-white/60 text-xs mt-1">Sans expiration</p>
          </div>
        </div>

        <div class="grid grid-cols-2 md:grid-cols-4 gap-4 p-6">
          <div v-for="(val, key) in planLimits" :key="key" class="text-center glass rounded-xl p-3 border border-white/5">
            <p class="text-xl font-display font-black" :style="{ color: planStore.plan.color }">{{ val }}</p>
            <p class="text-[9px] uppercase tracking-widest text-muted font-bold mt-0.5">{{ key }}</p>
          </div>
        </div>
      </div>

      <!-- ══ CHANGER DE PLAN ══ -->
      <div class="glass-card p-8 border-t-4 border-primary">
        <h2 class="text-lg font-display font-black mb-6 flex items-center gap-2">
          <span>🔄</span> CHANGER DE PLAN
        </h2>

        <div class="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 mb-8">
          <div v-for="plan in allPlans" :key="plan.id"
            @click="selectedPlan = plan.id"
            :class="['plan-select-card cursor-pointer rounded-2xl border-2 p-5 transition-all',
                     selectedPlan === plan.id ? 'border-primary bg-primary/10 shadow-glow' : 'border-color glass hover:border-primary/40',
                     planStore.currentPlanId === plan.id ? 'ring-1 ring-success/30' : '']">
            <!-- Current badge -->
            <div v-if="planStore.currentPlanId === plan.id"
              class="text-[9px] font-black uppercase tracking-widest text-success bg-success/10 px-2 py-0.5 rounded-full inline-block mb-3 border border-success/20">
              ✓ Plan actuel
            </div>
            <div class="flex items-center gap-2 mb-3">
              <div class="w-10 h-10 rounded-xl flex items-center justify-center text-xl"
                :style="{ background: plan.gradient }">{{ plan.icon }}</div>
              <div>
                <p class="font-black text-sm" :style="{ color: plan.color }">{{ plan.name }}</p>
                <p v-if="plan.badge" class="text-[9px] font-bold text-muted">{{ plan.badge }}</p>
              </div>
            </div>
            <div class="mb-3">
              <span v-if="plan.price === 0" class="text-xl font-display font-black">Gratuit</span>
              <div v-else class="flex items-baseline gap-1">
                <span class="text-lg font-display font-black">{{ formatPrice(plan.price) }}</span>
                <span class="text-[10px] text-muted">/{{ plan.period }}</span>
              </div>
            </div>
            <p class="text-[11px] text-secondary leading-relaxed">{{ plan.description }}</p>
          </div>
        </div>

        <!-- License form -->
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <div class="space-y-4">
            <div class="space-y-2">
              <label class="settings-label">Titulaire de la licence</label>
              <input v-model="form.planHolder" class="input-premium w-full" placeholder="Nom du bar ou de l'entreprise" />
            </div>
            <div class="space-y-2">
              <label class="settings-label">Clé de licence</label>
              <div class="relative">
                <input v-model="form.planKey" class="input-premium w-full font-mono pr-10"
                  :type="showKey ? 'text' : 'password'"
                  placeholder="XXXX-XXXX-XXXX-XXXX" />
                <button @click="showKey = !showKey"
                  class="absolute right-3 top-1/2 -translate-y-1/2 text-muted hover:text-white text-sm">
                  {{ showKey ? '🙈' : '👁️' }}
                </button>
              </div>
            </div>
          </div>
          <div class="space-y-4">
            <div class="space-y-2">
              <label class="settings-label">Date d'expiration (laisser vide = illimitée)</label>
              <input v-model="form.expiresAt" type="date" class="input-premium w-full" />
            </div>
            <!-- Selected plan preview -->
            <div v-if="selectedPlanInfo" class="glass rounded-xl p-4 border border-white/5">
              <p class="text-[9px] uppercase tracking-widest text-muted font-bold mb-2">Plan sélectionné</p>
              <div class="flex items-center gap-2">
                <span class="text-2xl">{{ selectedPlanInfo.icon }}</span>
                <div>
                  <p class="font-black text-sm" :style="{ color: selectedPlanInfo.color }">{{ selectedPlanInfo.name }}</p>
                  <p class="text-xs text-muted">{{ selectedPlanInfo.featureList.length }} fonctionnalités incluses</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div class="flex items-center gap-4 flex-wrap">
          <button @click="savePlan" :disabled="saving"
            class="btn btn-primary py-3 px-10 font-black tracking-widest uppercase flex gap-2">
            <span v-if="saving" class="animate-spin">🔄</span>
            <span v-else>💾</span>
            {{ saving ? 'Sauvegarde...' : 'Appliquer le plan' }}
          </button>
          <div v-if="saveSuccess" class="glass px-4 py-2.5 rounded-xl border border-success/20 flex items-center gap-2">
            <span class="text-success text-sm">✓</span>
            <span class="text-xs font-bold text-success">Plan mis à jour avec succès</span>
          </div>
        </div>
      </div>

      <!-- ══ MATRICE DES FONCTIONNALITÉS ══ -->
      <div class="glass-card p-8 border-t-4 border-secondary overflow-x-auto">
        <h2 class="text-lg font-display font-black mb-6 flex items-center gap-2">
          <span>📋</span> MATRICE DES FONCTIONNALITÉS
        </h2>

        <table class="w-full min-w-[640px]">
          <thead>
            <tr>
              <th class="text-left pb-4 pr-6 text-[10px] font-black uppercase tracking-widest text-muted w-1/4">Fonctionnalité</th>
              <th v-for="plan in allPlans" :key="plan.id"
                class="text-center pb-4 px-3 text-[10px] font-black uppercase tracking-widest"
                :style="{ color: plan.color }">
                {{ plan.icon }} {{ plan.name }}
              </th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(label, feat) in FEATURE_LABELS" :key="feat"
              class="border-t border-white/[0.04] hover:bg-white/[0.02] transition-colors">
              <td class="py-3 pr-6">
                <div class="flex items-center gap-2">
                  <span class="text-xs font-semibold">{{ label }}</span>
                  <span v-if="planStore.hasFeature(feat)"
                    class="text-[8px] bg-primary/15 text-primary px-1.5 py-0.5 rounded-full font-black uppercase">Actif</span>
                </div>
              </td>
              <td v-for="plan in allPlans" :key="plan.id" class="py-3 px-3 text-center">
                <span v-if="plan.features.includes(feat)" class="text-success text-base font-black">✓</span>
                <span v-else class="text-muted text-xs">—</span>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- ══ LIMITES D'UTILISATION ══ -->
      <div class="grid grid-cols-1 md:grid-cols-3 gap-5">
        <div v-for="item in usageLimits" :key="item.label" class="glass-card p-6">
          <div class="flex items-center justify-between mb-4">
            <h3 class="font-display font-black text-sm">{{ item.label }}</h3>
            <span class="text-2xl">{{ item.icon }}</span>
          </div>
          <div class="flex items-baseline gap-2 mb-3">
            <span class="text-3xl font-display font-black" :style="{ color: planStore.plan.color }">
              {{ item.limit === -1 ? '∞' : item.limit }}
            </span>
            <span class="text-xs text-muted font-bold uppercase">{{ item.limit === -1 ? 'Illimité' : 'maximum' }}</span>
          </div>
          <div class="h-2 rounded-full bg-white/5 overflow-hidden">
            <div class="h-full rounded-full transition-all duration-700"
              :style="{ width: item.limit === -1 ? '100%' : '0%', background: planStore.plan.gradient }"></div>
          </div>
          <p class="text-[10px] text-muted mt-2">Plan {{ planStore.plan.name }}</p>
        </div>
      </div>

    </div>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue';
import { usePlanStore } from '@/stores/plan';
import { useToastStore } from '@/stores/toast';
import { PLANS, PLANS_LIST, FEATURE_LABELS } from '@/config/plans';

const planStore = usePlanStore();
const toast = useToastStore();

const loading = ref(true);
const saving = ref(false);
const saveSuccess = ref(false);
const showKey = ref(false);

const selectedPlan = ref('free');
const form = reactive({ planHolder: '', planKey: '', expiresAt: '' });

const allPlans = PLANS_LIST;

const selectedPlanInfo = computed(() => PLANS[selectedPlan.value] || null);

const planLimits = computed(() => {
  const limits = planStore.plan.limits;
  return {
    Produits: limits.products === -1 ? '∞' : limits.products,
    Catégories: limits.categories === -1 ? '∞' : limits.categories,
    Utilisateurs: limits.users === -1 ? '∞' : limits.users,
    Fonctionnalités: planStore.plan.features.length,
  };
});

const usageLimits = computed(() => [
  { label: 'Produits', icon: '📦', limit: planStore.plan.limits.products },
  { label: 'Catégories', icon: '📂', limit: planStore.plan.limits.categories },
  { label: 'Utilisateurs', icon: '👥', limit: planStore.plan.limits.users },
]);

const formatPrice = (p) => new Intl.NumberFormat('fr-FR').format(p) + ' Ar';

const savePlan = async () => {
  saving.value = true;
  saveSuccess.value = false;
  try {
    await planStore.savePlan({
      planId: selectedPlan.value,
      expiresAt: form.expiresAt || null,
      planHolder: form.planHolder,
      planKey: form.planKey,
    });
    saveSuccess.value = true;
    toast.success(`Plan ${PLANS[selectedPlan.value]?.name || selectedPlan.value} activé avec succès`);
    setTimeout(() => { saveSuccess.value = false; }, 5000);
  } catch (err) {
    toast.error('Erreur lors de la mise à jour du plan');
  } finally {
    saving.value = false;
  }
};

onMounted(async () => {
  await planStore.load();
  selectedPlan.value = planStore.currentPlanId;
  form.planHolder = planStore.planHolder;
  form.planKey = planStore.planKey;
  form.expiresAt = planStore.expiresAt || '';
  loading.value = false;
});
</script>

<style scoped>
.settings-label {
  display: block;
  font-size: 9px; font-weight: 900;
  text-transform: uppercase; letter-spacing: 0.15em;
  color: var(--text-secondary, #94a3b8);
}

.plan-status-header {
  padding: 2rem;
  display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 1rem;
}

.plan-big-icon {
  width: 64px; height: 64px; border-radius: 20px;
  background: rgba(255,255,255,0.15);
  backdrop-filter: blur(8px);
  display: flex; align-items: center; justify-content: center;
  font-size: 2rem;
}

.shadow-glow {
  box-shadow: 0 0 20px rgba(99, 102, 241, 0.3);
}

.plan-select-card {
  user-select: none;
}
</style>
