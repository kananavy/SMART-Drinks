<template>
  <div class="settings-page-premium">
    <div class="page-header mb-8">
      <h1 class="text-3xl font-display font-black tracking-tight">CONFIGURATION SYSTÈME</h1>
      <p class="text-secondary text-sm mt-1">Personnalisez votre plateforme, l'apparence et la page d'accueil.</p>
    </div>

    <div v-if="loading" class="flex justify-center py-24"><div class="spinner"></div></div>

    <div v-else>
      <!-- Tabs -->
      <div class="glass p-1 rounded-2xl flex mb-8 border border-white/5 w-fit">
        <button v-for="t in tabDefs" :key="t.id" @click="activeTab = t.id"
          :class="['px-6 py-2.5 rounded-xl text-[11px] font-black uppercase tracking-widest transition-all flex items-center gap-2',
                   activeTab === t.id ? 'bg-primary text-white shadow-glow' : 'hover:bg-white/5 text-muted']">
          <span>{{ t.icon }}</span> {{ t.label }}
        </button>
      </div>

      <!-- ══ TAB: IDENTITÉ ══ -->
      <div v-show="activeTab === 'identity'" class="grid grid-cols-1 xl:grid-cols-2 gap-8">
        <div class="glass-card p-8 border-t-4 border-primary">
          <h2 class="text-lg font-display font-black mb-6 flex items-center gap-2"><span>🏷️</span> IDENTITÉ DU BAR</h2>
          <div class="space-y-5">
            <div class="grid grid-cols-2 gap-4">
              <div class="space-y-2">
                <label class="settings-label">Nom de l'établissement</label>
                <input v-model="s.bar_name" class="input-premium w-full" />
              </div>
              <div class="space-y-2">
                <label class="settings-label">Slogan</label>
                <input v-model="s.bar_slogan" class="input-premium w-full" placeholder="L'élégance à chaque goutte" />
              </div>
            </div>
            <div class="grid grid-cols-2 gap-4">
              <div class="space-y-2">
                <label class="settings-label">Téléphone</label>
                <input v-model="s.bar_phone" class="input-premium w-full" />
              </div>
              <div class="space-y-2">
                <label class="settings-label">Email</label>
                <input v-model="s.bar_email" class="input-premium w-full" />
              </div>
            </div>
            <div class="space-y-2">
              <label class="settings-label">Adresse</label>
              <input v-model="s.bar_address" class="input-premium w-full" />
            </div>
            <div class="space-y-2">
              <label class="settings-label">Logo & Favicon</label>
              <div class="flex gap-4">
                <div class="flex-1 glass border-color rounded-2xl p-4 flex flex-col items-center justify-center gap-3 relative overflow-hidden cursor-pointer hover:border-primary/30 transition-all">
                  <img v-if="s.logo" :src="s.logo" class="h-14 object-contain" />
                  <div v-else class="text-3xl opacity-20">Logo</div>
                  <input type="file" accept="image/*" @change="e => uploadFile(e, 'logo')" class="absolute inset-0 opacity-0 cursor-pointer" />
                  <span class="text-[9px] font-black uppercase tracking-tighter opacity-50">Cliquer pour changer</span>
                </div>
                <div class="w-24 glass border-color rounded-2xl p-4 flex flex-col items-center justify-center gap-3 relative overflow-hidden cursor-pointer hover:border-primary/30 transition-all">
                  <img v-if="s.favicon" :src="s.favicon" class="h-8 w-8 object-contain" />
                  <span v-else class="text-2xl">🌟</span>
                  <input type="file" accept="image/*" @change="e => uploadFile(e, 'favicon')" class="absolute inset-0 opacity-0 cursor-pointer" />
                  <span class="text-[8px] font-black uppercase opacity-50">Favicon</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div class="glass-card p-8 border-t-4 border-accent">
          <h2 class="text-lg font-display font-black mb-6 flex items-center gap-2"><span>⚖️</span> INFOS JURIDIQUES</h2>
          <div class="space-y-4">
            <div class="grid grid-cols-2 gap-4">
              <div class="space-y-2">
                <label class="settings-label">NIF</label>
                <input v-model="s.nif" class="input-premium w-full" />
              </div>
              <div class="space-y-2">
                <label class="settings-label">STAT</label>
                <input v-model="s.stat" class="input-premium w-full" />
              </div>
            </div>
            <div class="space-y-2">
              <label class="settings-label">RCS</label>
              <input v-model="s.rcs" class="input-premium w-full" />
            </div>
            <div class="space-y-2">
              <label class="settings-label">En-tête de facture</label>
              <textarea v-model="s.invoice_header" class="input-premium w-full h-24 resize-none" placeholder="Texte affiché en haut des factures..."></textarea>
            </div>
            <div class="grid grid-cols-2 gap-4">
              <div class="space-y-2">
                <label class="settings-label">Devise</label>
                <input v-model="s.currency" class="input-premium w-full" placeholder="Ar" />
              </div>
              <div class="space-y-2">
                <label class="settings-label">Symbole</label>
                <input v-model="s.currency_symbol" class="input-premium w-full" placeholder="Ar" />
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- ══ TAB: PAGE D'ACCUEIL ══ -->
      <div v-show="activeTab === 'landing'" class="space-y-8">
        <!-- Hero section -->
        <div class="glass-card p-8 border-t-4 border-primary">
          <h2 class="text-lg font-display font-black mb-6 flex items-center gap-2"><span>🎯</span> SECTION HERO</h2>
          <div class="space-y-5">
            <div class="grid grid-cols-2 gap-4">
              <div class="space-y-2">
                <label class="settings-label">Texte du badge (ex: OUVERT MAINTENANT)</label>
                <input v-model="s.hero_badge_text" class="input-premium w-full" />
              </div>
              <div class="space-y-2">
                <label class="settings-label">Afficher le badge</label>
                <div class="flex items-center gap-3 pt-2">
                  <button @click="s.hero_badge_show = s.hero_badge_show === 'true' ? 'false' : 'true'"
                    :class="['w-12 h-6 rounded-full transition-all relative', s.hero_badge_show === 'true' ? 'bg-primary' : 'bg-white/10']">
                    <span :class="['absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-all', s.hero_badge_show === 'true' ? 'left-6' : 'left-0.5']"></span>
                  </button>
                  <span class="text-xs font-bold">{{ s.hero_badge_show === 'true' ? 'Visible' : 'Masqué' }}</span>
                </div>
              </div>
            </div>
            <div class="grid grid-cols-2 gap-4">
              <div class="space-y-2">
                <label class="settings-label">Bouton CTA 1</label>
                <input v-model="s.hero_cta1_text" class="input-premium w-full" placeholder="Réserver ma table" />
              </div>
              <div class="space-y-2">
                <label class="settings-label">Bouton CTA 2</label>
                <input v-model="s.hero_cta2_text" class="input-premium w-full" placeholder="Consulter le menu" />
              </div>
            </div>
            <div class="space-y-2">
              <label class="settings-label">Image de fond (URL ou chemin)</label>
              <div class="flex gap-3">
                <input v-model="s.landing_bg_image" class="input-premium flex-1" placeholder="/uploads/hero-bg.jpg" />
                <div class="relative">
                  <input type="file" accept="image/*" @change="e => uploadFile(e, 'landing_bg_image')" class="absolute inset-0 opacity-0 cursor-pointer w-full" />
                  <button class="btn btn-secondary text-xs px-4 py-2">📁 Upload</button>
                </div>
              </div>
            </div>
            <div class="space-y-2">
              <label class="settings-label">Opacité de l'overlay ({{ s.hero_overlay_opacity }}%)</label>
              <input v-model="s.hero_overlay_opacity" type="range" min="0" max="100" class="w-full accent-primary" />
            </div>
          </div>
        </div>

        <!-- Stats -->
        <div class="glass-card p-8 border-t-4 border-secondary">
          <h2 class="text-lg font-display font-black mb-6 flex items-center gap-2"><span>📊</span> STATISTIQUES HERO</h2>
          <div class="grid grid-cols-3 gap-6">
            <div v-for="i in 3" :key="i" class="space-y-3">
              <div class="glass rounded-xl p-3 text-center border border-white/5">
                <span class="text-xl font-display font-black text-primary">{{ s[`landing_stat${i}_value`] }}</span>
                <span class="block text-[9px] text-muted uppercase tracking-widest">{{ s[`landing_stat${i}_label`] }}</span>
              </div>
              <div class="space-y-2">
                <label class="settings-label">Valeur</label>
                <input v-model="s[`landing_stat${i}_value`]" class="input-premium w-full" />
              </div>
              <div class="space-y-2">
                <label class="settings-label">Label</label>
                <input v-model="s[`landing_stat${i}_label`]" class="input-premium w-full" />
              </div>
            </div>
          </div>
        </div>

        <!-- Features -->
        <div class="glass-card p-8 border-t-4 border-accent">
          <h2 class="text-lg font-display font-black mb-6 flex items-center gap-2"><span>✨</span> POINTS FORTS (Fonctionnalités)</h2>
          <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div v-for="i in 4" :key="i" class="glass rounded-2xl p-5 border border-white/5 space-y-3">
              <div class="flex items-center gap-3">
                <span class="text-3xl">{{ s[`landing_feat${i}_icon`] }}</span>
                <span class="font-bold text-sm">{{ s[`landing_feat${i}_title`] }}</span>
              </div>
              <div class="grid grid-cols-3 gap-2">
                <div class="space-y-1">
                  <label class="settings-label">Icône</label>
                  <input v-model="s[`landing_feat${i}_icon`]" class="input-premium w-full text-center text-lg" maxlength="4" />
                </div>
                <div class="space-y-1 col-span-2">
                  <label class="settings-label">Titre</label>
                  <input v-model="s[`landing_feat${i}_title`]" class="input-premium w-full" />
                </div>
              </div>
              <div class="space-y-1">
                <label class="settings-label">Description</label>
                <input v-model="s[`landing_feat${i}_desc`]" class="input-premium w-full" />
              </div>
            </div>
          </div>
        </div>

        <!-- Footer -->
        <div class="glass-card p-8 border-t-4 border-info">
          <h2 class="text-lg font-display font-black mb-6 flex items-center gap-2"><span>🔗</span> FOOTER</h2>
          <div class="space-y-2">
            <label class="settings-label">Tagline du footer</label>
            <input v-model="s.landing_footer_tagline" class="input-premium w-full" placeholder="L'expérience bar réinventée." />
          </div>
        </div>
      </div>

      <!-- ══ TAB: APPARENCE ══ -->
      <div v-show="activeTab === 'appearance'" class="grid grid-cols-1 xl:grid-cols-2 gap-8">
        <div class="glass-card p-8 border-t-4 border-secondary">
          <h2 class="text-lg font-display font-black mb-6 flex items-center gap-2"><span>🎨</span> COULEURS & THÈME</h2>
          <div class="space-y-6">
            <div class="grid grid-cols-2 gap-6">
              <div class="space-y-2">
                <label class="settings-label">Couleur Primaire</label>
                <div class="flex gap-2 items-center">
                  <input v-model="s.primary_color" type="color" class="w-12 h-10 rounded-lg border-none cursor-pointer bg-transparent" />
                  <input v-model="s.primary_color" class="input-premium flex-1 font-mono" />
                </div>
                <div class="h-2 rounded-full mt-2" :style="{ background: s.primary_color }"></div>
              </div>
              <div class="space-y-2">
                <label class="settings-label">Couleur Secondaire</label>
                <div class="flex gap-2 items-center">
                  <input v-model="s.secondary_color" type="color" class="w-12 h-10 rounded-lg border-none cursor-pointer bg-transparent" />
                  <input v-model="s.secondary_color" class="input-premium flex-1 font-mono" />
                </div>
                <div class="h-2 rounded-full mt-2" :style="{ background: s.secondary_color }"></div>
              </div>
            </div>

            <div class="grid grid-cols-2 gap-4">
              <div class="space-y-2">
                <label class="settings-label">Police de caractères</label>
                <select v-model="s.font_family" class="input-premium w-full">
                  <option value="'Outfit', sans-serif">Modern (Outfit)</option>
                  <option value="'Inter', sans-serif">Sleek (Inter)</option>
                  <option value="'Space Grotesk', sans-serif">Tech (Space)</option>
                  <option value="system-ui">Classic System</option>
                </select>
              </div>
              <div class="space-y-2">
                <label class="settings-label">Taille de base</label>
                <select v-model="s.base_font_size" class="input-premium w-full">
                  <option value="12px">Compacte (12px)</option>
                  <option value="14px">Standard (14px)</option>
                  <option value="16px">Confort (16px)</option>
                </select>
              </div>
            </div>

            <div class="space-y-2">
              <label class="settings-label">Ambiance Arrière-plan</label>
              <div class="grid grid-cols-3 gap-3 h-20">
                <div v-for="bg in bgOptions" :key="bg.val" @click="s.bg_style = bg.val"
                  :class="['rounded-xl border cursor-pointer transition-all flex items-center justify-center text-[10px] font-black uppercase',
                           s.bg_style === bg.val ? 'border-primary bg-primary/20 shadow-glow' : 'border-color glass hover:border-white/20']">
                  {{ bg.label }}
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Preview -->
        <div class="glass-card p-8 border-t-4 border-primary flex flex-col">
          <h2 class="text-lg font-display font-black mb-6 flex items-center gap-2"><span>👁️</span> APERÇU</h2>
          <div class="flex-1 rounded-2xl overflow-hidden border border-white/10 p-6 flex flex-col gap-4" :style="{ background: bgPreview, fontFamily: s.font_family }">
            <div class="flex items-center gap-2">
              <img v-if="s.logo" :src="s.logo" class="h-8 object-contain" />
              <span v-else class="text-2xl">🍸</span>
              <span class="font-black text-base uppercase" :style="{ color: s.primary_color }">{{ s.bar_name || 'LE BAR' }}</span>
            </div>
            <div class="space-y-2">
              <div class="h-4 rounded-full w-3/4" :style="{ background: s.primary_color, opacity: 0.8 }"></div>
              <div class="h-3 rounded-full w-1/2 bg-white/10"></div>
            </div>
            <div class="flex gap-2">
              <div class="px-4 py-2 rounded-lg text-xs font-black text-white" :style="{ background: s.primary_color }">CTA Primaire</div>
              <div class="px-4 py-2 rounded-lg text-xs font-black border border-white/20 bg-white/5">Secondaire</div>
            </div>
          </div>
        </div>
      </div>

      <!-- ══ TAB: FACTURATION ══ -->
      <div v-show="activeTab === 'billing'" class="glass-card p-8 border-t-4 border-accent max-w-2xl">
        <h2 class="text-lg font-display font-black mb-6 flex items-center gap-2"><span>🧾</span> PARAMÈTRES DE FACTURATION</h2>
        <div class="space-y-4">
          <div class="grid grid-cols-2 gap-4">
            <div class="space-y-2">
              <label class="settings-label">NIF</label>
              <input v-model="s.nif" class="input-premium w-full" />
            </div>
            <div class="space-y-2">
              <label class="settings-label">STAT</label>
              <input v-model="s.stat" class="input-premium w-full" />
            </div>
          </div>
          <div class="space-y-2">
            <label class="settings-label">RCS</label>
            <input v-model="s.rcs" class="input-premium w-full" />
          </div>
          <div class="space-y-2">
            <label class="settings-label">En-tête de facture</label>
            <textarea v-model="s.invoice_header" class="input-premium w-full h-28 resize-none" placeholder="Ce texte sera affiché en haut de toutes les factures PDF..."></textarea>
          </div>
          <div class="grid grid-cols-2 gap-4">
            <div class="space-y-2">
              <label class="settings-label">Devise</label>
              <input v-model="s.currency" class="input-premium w-full" placeholder="Ariary" />
            </div>
            <div class="space-y-2">
              <label class="settings-label">Symbole</label>
              <input v-model="s.currency_symbol" class="input-premium w-full" placeholder="Ar" />
            </div>
          </div>
        </div>
      </div>

      <!-- Save Button (always visible) -->
      <div class="mt-10 flex items-center gap-4">
        <button @click="saveSettings" :disabled="saving" class="btn btn-primary py-4 px-12 text-base font-black tracking-widest shadow-glow uppercase flex gap-3">
          {{ saving ? '🔄 SYNCHRONISATION...' : '💾 SAUVEGARDER' }}
        </button>
        <div class="glass p-3 rounded-xl border border-white/5 flex items-center gap-2">
          <div class="w-2 h-2 rounded-full bg-success animate-pulse"></div>
          <span class="text-[10px] font-bold text-muted uppercase tracking-widest">Mis à jour en temps réel</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue';
import api from '@/services/api';
import { useToastStore } from '@/stores/toast';

const toast = useToastStore();
const loading = ref(true);
const saving = ref(false);
const activeTab = ref('identity');

const tabDefs = [
  { id: 'identity', label: 'Identité', icon: '🏷️' },
  { id: 'landing', label: "Page d'Accueil", icon: '🌐' },
  { id: 'appearance', label: 'Apparence', icon: '🎨' },
  { id: 'billing', label: 'Facturation', icon: '🧾' },
];

const bgOptions = [
  { label: 'Abyssal', val: 'deep' },
  { label: 'Midnight', val: 'black' },
  { label: 'Eclipse', val: 'gradient' },
];

const s = reactive({
  bar_name: '', bar_slogan: '', bar_address: '', bar_phone: '', bar_email: '',
  invoice_header: '', currency: 'Ar', currency_symbol: 'Ar',
  primary_color: '#6366f1', secondary_color: '#8b5cf6',
  logo: '', favicon: '',
  nif: '', stat: '', rcs: '',
  font_family: "'Outfit', sans-serif", base_font_size: '14px', bg_style: 'deep',
  // Landing page
  hero_badge_text: 'OUVERT MAINTENANT', hero_badge_show: 'true',
  hero_cta1_text: 'Réserver ma table', hero_cta2_text: 'Consulter le menu',
  hero_overlay_opacity: '55', landing_bg_image: '',
  landing_stat1_value: '50+', landing_stat1_label: 'Boissons',
  landing_stat2_value: '100%', landing_stat2_label: 'Satisfaction',
  landing_stat3_value: '24/7', landing_stat3_label: 'Service',
  landing_feat1_icon: '📱', landing_feat1_title: 'Commande en ligne', landing_feat1_desc: 'Commandez depuis votre table via smartphone.',
  landing_feat2_icon: '⚡', landing_feat2_title: 'Service rapide', landing_feat2_desc: 'Traitées instantanément par notre équipe.',
  landing_feat3_icon: '💳', landing_feat3_title: 'Paiement flexible', landing_feat3_desc: 'Espèces, Mobile Money ou carte bancaire.',
  landing_feat4_icon: '📊', landing_feat4_title: 'Suivi en temps réel', landing_feat4_desc: 'Suivez le statut de votre commande.',
  landing_footer_tagline: "L'expérience bar réinventée, à portée de main.",
});

const bgPreview = computed(() => {
  if (s.bg_style === 'black') return '#000000';
  if (s.bg_style === 'gradient') return 'linear-gradient(135deg, #0a0a1a, #1a0a2e)';
  return '#0f0f23';
});

onMounted(async () => {
  try {
    const { data } = await api.get('/admin/settings');
    if (data.success) Object.assign(s, data.data.settings);
  } catch (err) {
    toast.error('Erreur de chargement');
  } finally {
    loading.value = false;
  }
});

const uploadFile = async (e, key) => {
  const file = e.target.files[0];
  if (!file) return;
  const formData = new FormData();
  formData.append('file', file);
  try {
    const { data } = await api.post(`/admin/settings/upload/${key}`, formData);
    if (data.success) {
      s[key] = data.data.path;
      toast.success('Fichier mis à jour');
    }
  } catch (err) {
    toast.error('Upload échoué');
  }
};

const applyTheme = () => {
  const root = document.documentElement.style;
  root.setProperty('--primary-color', s.primary_color);
  root.setProperty('--primary-light-color', s.primary_color + 'cc');
  root.setProperty('--primary-dark-color', s.primary_color);
  root.setProperty('--secondary-color', s.secondary_color);
  root.setProperty('--font-primary', s.font_family);
  root.setProperty('--base-font-size', s.base_font_size);
  const bgMap = { black: '#000000', gradient: '#0a0a1a', deep: '#0f0f23' };
  root.setProperty('--color-bg-primary', bgMap[s.bg_style] || '#0f0f23');
};

const saveSettings = async () => {
  saving.value = true;
  try {
    await api.put('/admin/settings', s);
    applyTheme();
    toast.success('Paramètres synchronisés avec succès');
  } catch (err) {
    toast.error('Échec de sauvegarde');
  } finally {
    saving.value = false;
  }
};
</script>

<style scoped>
.settings-label {
  display: block;
  font-size: 9px;
  font-weight: 900;
  text-transform: uppercase;
  letter-spacing: 0.15em;
  color: var(--text-secondary, #94a3b8);
}

.input-premium {
  background: rgba(255,255,255,0.04);
  border: 1px solid rgba(255,255,255,0.08);
  border-radius: 10px;
  padding: 10px 14px;
  color: inherit;
  font-size: 13px;
  outline: none;
  transition: border-color 0.2s;
  font-family: inherit;
}
.input-premium:focus { border-color: var(--primary, #6366f1); }

textarea.input-premium { padding: 10px 14px; }

.animate-pulse-subtle {
  animation: pulse-subtle 4s ease-in-out infinite;
}
@keyframes pulse-subtle {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.9; }
}
</style>
