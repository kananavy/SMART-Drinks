<template>
  <div class="landing">
    <!-- ══ NAVIGATION ══ -->
    <nav class="nav-glass flex items-center justify-between sticky top-0 px-6 py-4 z-[100]">
      <div class="flex items-center gap-2">
        <img v-if="settings.logo" :src="settings.logo" class="h-8 object-contain" />
        <span v-else class="text-2xl">🍸</span>
        <span class="font-display font-extrabold text-xl tracking-tight hidden sm:block uppercase">
          {{ settings.bar_name || 'LE BAR LOUNGE' }}
        </span>
      </div>
      <div class="flex items-center gap-4">
        <a href="#menu" class="hidden md:block text-sm text-secondary hover:text-primary transition-colors">Explorer le Menu</a>
        <div class="flex gap-2">
          <router-link to="/login" class="btn btn-secondary btn-sm px-6">Connexion</router-link>
          <router-link to="/register" class="btn btn-primary btn-sm px-6">Inscription</router-link>
        </div>
      </div>
    </nav>

    <!-- ══ HERO ══ -->
    <section class="hero-section relative min-h-screen flex items-center justify-center overflow-hidden">
      <!-- Background image + overlay -->
      <div class="absolute inset-0 z-0">
        <div v-if="settings.landing_bg_image" class="absolute inset-0 bg-cover bg-center"
          :style="{ backgroundImage: `url(${settings.landing_bg_image})` }"></div>
        <div class="absolute inset-0 hero-overlay" :style="{ opacity: overlayOpacity }"></div>
        <!-- Ambient glows -->
        <div class="absolute inset-0 pointer-events-none">
          <div class="absolute top-1/4 left-1/4 w-96 h-96 rounded-full blur-3xl opacity-20" style="background: var(--primary, #6366f1)"></div>
          <div class="absolute bottom-1/4 right-1/4 w-80 h-80 rounded-full blur-3xl opacity-15" style="background: var(--secondary, #8b5cf6)"></div>
        </div>
      </div>

      <div class="relative z-10 text-center layout-container py-20">
        <!-- Badge -->
        <div v-if="settings.hero_badge_show !== 'false'" class="inline-flex items-center gap-2 px-4 py-1.5 rounded-full glass border-bright text-xs font-semibold text-primary animate-fade-in mb-8">
          <span class="relative flex h-2 w-2">
            <span class="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
            <span class="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
          </span>
          {{ settings.hero_badge_text || 'OUVERT MAINTENANT' }}
        </div>

        <h1 class="text-5xl md:text-7xl font-extrabold tracking-tighter leading-tight font-display mb-6">
          {{ settings.bar_name || 'LE BAR LOUNGE' }}<br />
          <span class="gradient-text">{{ settings.bar_slogan || 'L\'Élégance Réinventée' }}</span>
        </h1>

        <p class="text-lg text-secondary max-w-xl mx-auto leading-relaxed mb-10">
          Commandez vos boissons préférées directement depuis votre smartphone. Une expérience premium, sans attente.
        </p>

        <div class="flex flex-col sm:flex-row gap-4 justify-center">
          <router-link to="/register" class="btn btn-primary btn-lg group">
            {{ settings.hero_cta1_text || 'Réserver ma table' }}
            <span class="group-hover:translate-x-1 transition-transform ml-1">→</span>
          </router-link>
          <a href="#menu" class="btn btn-secondary btn-lg">
            {{ settings.hero_cta2_text || 'Consulter le menu' }}
          </a>
        </div>

        <!-- Stats Bar -->
        <div class="grid grid-cols-3 gap-4 mt-16 max-w-lg mx-auto">
          <div class="stat-card glass-card py-5 px-3 text-center">
            <span class="block text-3xl font-display font-black text-primary mb-1">{{ settings.landing_stat1_value || '50+' }}</span>
            <span class="text-[10px] uppercase tracking-widest font-bold text-muted">{{ settings.landing_stat1_label || 'Boissons' }}</span>
          </div>
          <div class="stat-card glass-card py-5 px-3 text-center">
            <span class="block text-3xl font-display font-black text-secondary mb-1">{{ settings.landing_stat2_value || '100%' }}</span>
            <span class="text-[10px] uppercase tracking-widest font-bold text-muted">{{ settings.landing_stat2_label || 'Satisfaction' }}</span>
          </div>
          <div class="stat-card glass-card py-5 px-3 text-center">
            <span class="block text-3xl font-display font-black text-accent mb-1">{{ settings.landing_stat3_value || '24/7' }}</span>
            <span class="text-[10px] uppercase tracking-widest font-bold text-muted">{{ settings.landing_stat3_label || 'Service' }}</span>
          </div>
        </div>
      </div>

      <!-- Scroll hint -->
      <div class="absolute bottom-8 left-1/2 -translate-x-1/2 z-10 flex flex-col items-center gap-2 opacity-60">
        <span class="text-[10px] uppercase tracking-widest font-bold text-secondary">Découvrir</span>
        <div class="scroll-hint w-6 h-10 rounded-full flex items-start justify-center pt-2">
          <div class="scroll-dot w-1.5 h-1.5 rounded-full bg-secondary animate-bounce"></div>
        </div>
      </div>
    </section>

    <!-- ══ FEATURES ══ -->
    <section class="features-section py-24">
      <div class="layout-container">
        <h2 class="section-title text-4xl font-display font-extrabold text-center mb-3 tracking-tight">Pourquoi nous choisir ?</h2>
        <p class="text-center text-secondary mb-14">Une expérience bar moderne, pensée pour vous.</p>
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <div v-for="i in 4" :key="i" class="feature-card glass-card p-8 text-center">
            <span class="text-4xl block mb-4">{{ settings[`landing_feat${i}_icon`] || features[i-1].icon }}</span>
            <h3 class="font-bold text-base mb-2">{{ settings[`landing_feat${i}_title`] || features[i-1].title }}</h3>
            <p class="text-sm text-secondary leading-relaxed">{{ settings[`landing_feat${i}_desc`] || features[i-1].desc }}</p>
          </div>
        </div>
      </div>
    </section>

    <!-- ══ MENU PREVIEW ══ -->
    <section id="menu" class="menu-section py-20">
      <div class="layout-container">
        <h2 class="text-4xl font-display font-extrabold text-center mb-3 tracking-tight">Notre Menu</h2>
        <p class="text-center text-secondary mb-12">Découvrez notre sélection de boissons</p>

        <div v-if="menuLoading" class="flex justify-center py-16"><div class="spinner"></div></div>

        <div v-else-if="categories.length" class="space-y-10">
          <div v-for="category in categories" :key="category.id">
            <div class="flex items-center gap-3 mb-4 glass-card py-3 px-5">
              <span class="text-2xl">{{ category.icon }}</span>
              <h3 class="font-bold text-lg flex-1">{{ category.name }}</h3>
              <span class="text-[11px] text-muted">{{ category.Products?.length || 0 }} produits</span>
            </div>
            <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div v-for="product in category.Products?.slice(0, 4)" :key="product.id"
                class="product-card glass-card p-5 flex items-center justify-between gap-3">
                <div>
                  <h4 class="font-semibold text-sm mb-1">{{ product.name }}</h4>
                  <span class="text-base font-bold text-primary block">{{ formatPrice(product.price) }}</span>
                  <span v-if="product.consignation_price > 0" class="text-[10px] text-muted">
                    + {{ formatPrice(product.consignation_price) }} consigne
                  </span>
                </div>
                <span :class="['text-[10px] font-semibold px-2.5 py-1 rounded-full whitespace-nowrap', product.available ? 'available' : 'unavailable']">
                  {{ product.available ? 'Dispo' : 'Indispo' }}
                </span>
              </div>
            </div>
          </div>
        </div>

        <div class="text-center mt-12">
          <router-link to="/register" class="btn btn-primary btn-lg">
            Commander maintenant →
          </router-link>
        </div>
      </div>
    </section>

    <!-- ══ CTA SECTION ══ -->
    <section class="cta-section py-20">
      <div class="layout-container text-center">
        <div class="cta-card glass-card max-w-2xl mx-auto p-12 border border-primary/20">
          <h2 class="text-3xl font-display font-extrabold mb-4 tracking-tight">Prêt à commander ?</h2>
          <p class="text-secondary mb-8">Rejoignez-nous et profitez d'une expérience unique.</p>
          <router-link to="/register" class="btn btn-primary btn-lg">
            Créer mon compte gratuit →
          </router-link>
        </div>
      </div>
    </section>

    <!-- ══ FOOTER ══ -->
    <footer class="footer glass border-t border-color py-8">
      <div class="layout-container">
        <div class="flex flex-col md:flex-row items-center justify-between gap-4">
          <div class="flex items-center gap-2">
            <span class="text-xl">🍸</span>
            <span class="font-display font-black text-sm uppercase">{{ settings.bar_name || 'Le Bar Lounge' }}</span>
          </div>
          <p class="text-xs text-muted text-center">
            {{ settings.landing_footer_tagline || "L'expérience bar réinventée, à portée de main." }}
          </p>
          <div class="flex flex-col items-end gap-1 text-xs text-muted">
            <span v-if="settings.bar_phone">📞 {{ settings.bar_phone }}</span>
            <span v-if="settings.bar_address">📍 {{ settings.bar_address }}</span>
            <router-link to="/login/admin" class="mt-2 hover:text-primary transition-colors flex items-center gap-1">
              <span>🔐</span> Accès Administration
            </router-link>
          </div>
        </div>
        <div class="border-t border-color mt-6 pt-4 text-center text-xs text-muted">
          © {{ new Date().getFullYear() }} {{ settings.bar_name || 'Le Bar Lounge' }} — Tous droits réservés
        </div>
      </div>
    </footer>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import api from '@/services/api';

const categories = ref([]);
const menuLoading = ref(true);
const settings = ref({});

const features = [
  { icon: '📱', title: 'Commande en ligne', desc: 'Commandez directement depuis votre table via votre téléphone.' },
  { icon: '⚡', title: 'Service rapide', desc: 'Vos commandes sont traitées instantanément par notre équipe.' },
  { icon: '💳', title: 'Paiement flexible', desc: 'Payez en espèces, Mobile Money ou par carte bancaire.' },
  { icon: '📊', title: 'Suivi en temps réel', desc: 'Suivez le statut de votre commande en temps réel.' },
];

const overlayOpacity = computed(() => {
  const val = parseInt(settings.value.hero_overlay_opacity ?? 55);
  return (val / 100).toFixed(2);
});

const formatPrice = (price) => new Intl.NumberFormat('fr-FR').format(price) + ' Ar';

onMounted(async () => {
  try {
    const [menuRes, settingsRes] = await Promise.all([
      api.get('/client/menu').catch(() => ({ data: { success: false } })),
      api.get('/client/settings').catch(() => ({ data: { success: false } })),
    ]);
    if (menuRes.data.success) categories.value = menuRes.data.data.categories;
    if (settingsRes.data.success) settings.value = settingsRes.data.data.settings;
  } finally {
    menuLoading.value = false;
  }
});
</script>

<style scoped>
.landing { min-height: 100vh; }

/* ── Hero ── */
.hero-section { text-align: center; }

.hero-overlay {
  background: linear-gradient(to bottom,
    rgba(10, 10, 30, 0.9) 0%,
    rgba(10, 10, 30, 0.7) 50%,
    rgba(10, 10, 30, 0.95) 100%);
}

[data-theme="light"] .hero-overlay {
  background: linear-gradient(to bottom,
    rgba(240, 241, 255, 0.88) 0%,
    rgba(240, 241, 255, 0.75) 50%,
    rgba(240, 241, 255, 0.95) 100%);
}

/* Hero stats */
.stat-card {
  transition: transform 0.3s ease, box-shadow 0.3s ease;
}

[data-theme="light"] .stat-card {
  background: rgba(255, 255, 255, 0.95) !important;
  box-shadow: 0 4px 24px rgba(99, 102, 241, 0.1);
  border-color: rgba(99, 102, 241, 0.15) !important;
}

/* ── Scroll hint ── */
.scroll-hint {
  border: 2px solid rgba(255, 255, 255, 0.25);
}

[data-theme="light"] .scroll-hint {
  border-color: rgba(99, 102, 241, 0.35);
}

/* ── Features ── */
.features-section {
  background: radial-gradient(circle at 50% 0%, rgba(99, 102, 241, 0.05), transparent 60%);
}

[data-theme="light"] .features-section {
  background: linear-gradient(180deg, #ffffff 0%, #f4f6ff 100%);
}

[data-theme="light"] .feature-card {
  background: rgba(255, 255, 255, 0.9) !important;
  box-shadow: 0 2px 20px rgba(99, 102, 241, 0.07);
  border-color: rgba(99, 102, 241, 0.1) !important;
}

/* ── Menu ── */
.menu-section {
  background: rgba(255,255,255,0.01);
}

[data-theme="light"] .menu-section {
  background: #f8f9ff;
}

.product-card {
  transition: all 0.25s ease;
}

.available {
  background: rgba(16, 185, 129, 0.15);
  color: #34d399;
  border: 1px solid rgba(16, 185, 129, 0.25);
}

.unavailable {
  background: rgba(239, 68, 68, 0.15);
  color: #f87171;
  border: 1px solid rgba(239, 68, 68, 0.25);
}

/* ── CTA ── */
[data-theme="light"] .cta-card {
  background: linear-gradient(135deg, rgba(99,102,241,0.05), rgba(139,92,246,0.05)) !important;
}

/* ── Footer ── */
.footer { text-align: left; }

/* Gradient text already defined globally, re-declare for specificity */
.gradient-text {
  background: linear-gradient(135deg, #818cf8, #8b5cf6);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

[data-theme="light"] .gradient-text {
  background: linear-gradient(135deg, #6366f1, #7c3aed);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

/* ── Light mode top accent strip ── */
[data-theme="light"] .nav-glass::after {
  content: '';
  position: absolute;
  bottom: -2px;
  left: 0;
  right: 0;
  height: 2px;
  background: linear-gradient(90deg, var(--primary, #6366f1), var(--secondary, #8b5cf6));
}

@media (max-width: 768px) {
  .features-section { padding: 60px 20px; }
  .menu-section { padding: 60px 20px; }
}
</style>
