<template>
  <div class="landing-v2" :class="{ 'nav-solid': scrolled }">

    <!-- ══ NAVIGATION ══ -->
    <nav class="lp-nav">
      <div class="layout-container flex items-center justify-between h-full">
        <!-- Logo -->
        <div class="flex items-center gap-3">
          <div class="lp-logo-icon">
            <img v-if="cfg.logo" :src="cfg.logo" class="h-8 w-8 object-contain" />
            <span v-else>🍸</span>
          </div>
          <div class="hidden sm:block">
            <p class="font-display font-black text-base uppercase tracking-tight leading-none">{{ cfg.bar_name || 'LE BAR LOUNGE' }}</p>
            <p class="text-[9px] font-bold uppercase tracking-[0.2em] mt-0.5" style="color: var(--primary)">{{ cfg.bar_slogan || 'Expérience Premium' }}</p>
          </div>
        </div>
        <!-- Links -->
        <div class="hidden md:flex items-center gap-8">
          <a href="#features" class="lp-nav-link">Fonctionnalités</a>
          <a href="#menu" class="lp-nav-link">Menu</a>
          <a href="#how" class="lp-nav-link">Comment ça marche</a>
          <a v-if="showPricing" href="#pricing" class="lp-nav-link">Tarifs</a>
        </div>
        <!-- CTA & Theme toggle -->
        <div class="flex items-center gap-2">
          <button @click="toggleTheme" :title="isDark ? 'Mode clair' : 'Mode sombre'"
            class="w-9 h-9 rounded-xl glass border border-white/10 flex items-center justify-center text-base hover:border-primary/30 transition-all">
            {{ isDark ? '☀️' : '🌙' }}
          </button>
          <router-link to="/login" class="btn btn-secondary btn-sm hidden sm:inline-flex">Connexion</router-link>
          <router-link to="/register" class="btn btn-primary btn-sm">Commencer →</router-link>
        </div>
      </div>
    </nav>

    <!-- ══ HERO ══ -->
    <section class="hero-v2 min-h-screen flex items-center relative overflow-hidden">
      <!-- Background -->
      <div class="hero-bg absolute inset-0 z-0">
        <div class="hero-mesh"></div>
        <div v-if="cfg.landing_bg_image" class="absolute inset-0 bg-cover bg-center"
          :style="{ backgroundImage: `url(${cfg.landing_bg_image})`, opacity: overlayOpacity * 0.3 }"></div>
        <div class="hero-orb orb-a"></div>
        <div class="hero-orb orb-b"></div>
        <div class="hero-orb orb-c"></div>
        <div class="hero-grid-lines"></div>
      </div>

      <div class="layout-container relative z-10 py-28 w-full">
        <div class="hero-layout">
          <!-- LEFT: Content -->
          <div class="hero-content-left">
            <!-- Badge -->
            <div v-if="cfg.hero_badge_show !== 'false'" class="hero-badge animate-hero-badge">
              <span class="badge-pulse"></span>
              {{ cfg.hero_badge_text || 'OUVERT MAINTENANT' }}
            </div>

            <!-- Title -->
            <h1 class="hero-h1 animate-hero-title">
              {{ cfg.bar_name || 'LE BAR LOUNGE' }}
              <span class="hero-gradient-line">{{ cfg.bar_slogan || "L'Élégance Réinventée" }}</span>
            </h1>

            <!-- Description -->
            <p class="hero-description animate-hero-desc">
              {{ cfg.hero_description || 'Commandez vos boissons préférées directement depuis votre smartphone. Zéro attente, expérience 100% premium.' }}
            </p>

            <!-- CTAs -->
            <div class="hero-ctas animate-hero-ctas">
              <router-link to="/register" class="btn btn-primary btn-lg cta-main group">
                <span>{{ cfg.hero_cta1_text || 'Commander maintenant' }}</span>
                <span class="group-hover:translate-x-1.5 transition-transform duration-200">→</span>
              </router-link>
              <a href="#menu" class="btn btn-ghost btn-lg">
                {{ cfg.hero_cta2_text || 'Voir le menu' }}
              </a>
            </div>

            <!-- Stats strip -->
            <div class="hero-stats-strip animate-hero-stats">
              <div v-for="i in 4" :key="i" class="hero-stat-item">
                <span class="hero-stat-num" :class="`stat-color-${i}`">
                  {{ cfg[`landing_stat${i}_value`] || ['50+', '100%', '24/7', '★ 4.9'][i-1] }}
                </span>
                <span class="hero-stat-lbl">
                  {{ cfg[`landing_stat${i}_label`] || ['Boissons', 'Satisfaits', 'Service', 'Avis clients'][i-1] }}
                </span>
              </div>
            </div>
          </div>

          <!-- RIGHT: App Preview Card -->
          <div class="hero-preview-side animate-hero-preview hidden lg:flex items-center justify-center relative">
            <!-- Floating badges -->
            <div class="float-chip chip-top glass">
              <span>⚡</span><span>Service express</span>
            </div>
            <div class="float-chip chip-bottom glass">
              <span>💳</span><span>Paiement facile</span>
            </div>

            <!-- App card -->
            <div class="app-preview glass-heavy">
              <!-- App header -->
              <div class="app-header">
                <div class="app-status-dot"></div>
                <span class="app-bar-name">{{ cfg.bar_name || 'Le Bar Lounge' }}</span>
                <span class="app-time">{{ currentTime }}</span>
              </div>
              <!-- Category tab -->
              <div class="app-cat-tabs">
                <span v-for="c in ['🍸 Cocktails','🍺 Bières','🥤 Softs']" :key="c"
                  :class="['app-cat', c.includes('Cocktails') ? 'active' : '']">{{ c }}</span>
              </div>
              <!-- Menu items -->
              <div class="app-items">
                <div v-for="item in staticItems" :key="item.name" class="app-item">
                  <div>
                    <p class="app-item-name">{{ item.name }}</p>
                    <p class="app-item-price">{{ item.price }}</p>
                  </div>
                  <button class="app-add-btn">+</button>
                </div>
              </div>
              <!-- Cart button -->
              <div class="app-cart-btn">
                <span>🛒</span>
                <span>Voir mon panier</span>
                <span class="app-cart-badge">3</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Scroll hint -->
      <div class="scroll-hint-v2">
        <div class="scroll-mouse-v2">
          <div class="scroll-ball"></div>
        </div>
        <span>Découvrir</span>
      </div>
    </section>

    <!-- ══ FEATURES ══ -->
    <section id="features" class="lp-section features-v2">
      <div class="layout-container">
        <div class="section-head reveal-b">
          <div class="eyebrow">Pourquoi nous choisir</div>
          <h2 class="section-h2">Tout ce dont votre bar a besoin</h2>
          <p class="section-sub">Une plateforme complète pour digitaliser votre service et ravir vos clients.</p>
        </div>

        <div class="features-grid-v2">
          <div v-for="i in 6" :key="i"
            class="feat-card-v2 glass-card reveal-b"
            :style="{ transitionDelay: `${(i-1)*70}ms` }">
            <div class="feat-icon-v2" :style="{ background: featGradients[(i-1) % featGradients.length] }">
              <span>{{ cfg[`landing_feat${i}_icon`] || features[i-1].icon }}</span>
            </div>
            <h3 class="feat-title-v2">{{ cfg[`landing_feat${i}_title`] || features[i-1].title }}</h3>
            <p class="feat-desc-v2">{{ cfg[`landing_feat${i}_desc`] || features[i-1].desc }}</p>
          </div>
        </div>
      </div>
    </section>

    <!-- ══ HOW IT WORKS ══ -->
    <section v-if="showHow" id="how" class="lp-section how-section">
      <div class="layout-container">
        <div class="section-head reveal-b">
          <div class="eyebrow">Simple & Intuitif</div>
          <h2 class="section-h2">{{ cfg.how_title || 'Comment ça marche ?' }}</h2>
        </div>

        <div class="steps-wrapper">
          <div class="steps-line-bg"></div>
          <div v-for="i in 3" :key="i"
            class="step-card reveal-b"
            :style="{ transitionDelay: `${(i-1)*120}ms` }">
            <div class="step-num-badge">{{ i }}</div>
            <div class="step-icon-circle">
              <span class="text-3xl">{{ cfg[`step${i}_icon`] || steps[i-1].icon }}</span>
            </div>
            <h3 class="step-title">{{ cfg[`step${i}_title`] || steps[i-1].title }}</h3>
            <p class="step-desc">{{ cfg[`step${i}_desc`] || steps[i-1].desc }}</p>
          </div>
        </div>
      </div>
    </section>

    <!-- ══ MENU PREVIEW ══ -->
    <section id="menu" class="lp-section menu-v2">
      <div class="layout-container">
        <div class="section-head reveal-b">
          <div class="eyebrow">Notre Carte</div>
          <h2 class="section-h2">Découvrez Notre Menu</h2>
          <p class="section-sub">Parcourez notre sélection et commandez en quelques secondes depuis votre table.</p>
        </div>

        <div v-if="menuLoading" class="flex justify-center py-16"><div class="spinner"></div></div>

        <div v-else-if="categories.length" class="reveal-b">
          <!-- Category tabs -->
          <div class="menu-tabs-v2">
            <button v-for="cat in categories" :key="cat.id"
              @click="previewCat = cat.id"
              :class="['menu-tab-v2', previewCat === cat.id ? 'active' : '']">
              <span>{{ cat.icon }}</span>
              <span>{{ cat.name }}</span>
              <span class="tab-count-v2">{{ cat.Products?.length || 0 }}</span>
            </button>
          </div>

          <!-- Product grid -->
          <div class="products-grid-v2">
            <div v-for="prod in activePreviewProducts" :key="prod.id" class="prod-card-v2 glass-card">
              <div class="prod-header-v2">
                <h4 class="prod-name-v2">{{ prod.name }}</h4>
                <span :class="['prod-badge-v2', prod.available ? 'avail' : 'unavail']">
                  {{ prod.available ? '✓' : '✗' }}
                </span>
              </div>
              <p v-if="prod.description" class="prod-desc-v2">{{ prod.description }}</p>
              <div class="prod-footer-v2">
                <span class="prod-price-v2">{{ formatPrice(prod.price) }}</span>
                <span v-if="prod.consignation_price > 0" class="prod-consigne-v2">
                  +{{ formatPrice(prod.consignation_price) }} consigne
                </span>
              </div>
            </div>
          </div>
        </div>

        <div class="menu-cta-v2 reveal-b">
          <router-link to="/register" class="btn btn-primary btn-lg">Commander maintenant →</router-link>
          <p class="menu-note">Inscription gratuite · Aucune carte requise</p>
        </div>
      </div>
    </section>

    <!-- ══ PRICING ══ -->
    <section v-if="showPricing" id="pricing" class="lp-section pricing-v2">
      <div class="layout-container">
        <div class="section-head reveal-b">
          <div class="eyebrow">Tarification transparente</div>
          <h2 class="section-h2">{{ cfg.pricing_title || 'Nos Formules' }}</h2>
          <p class="section-sub">{{ cfg.pricing_subtitle || 'Choisissez le plan adapté à votre établissement. Sans engagement.' }}</p>
        </div>

        <div class="pricing-grid-v2">
          <div v-for="plan in publicPlans" :key="plan.id"
            class="pricing-card-v2 glass-card reveal-b"
            :class="{ 'pricing-featured': plan.badge === 'Populaire' }">
            <!-- Badge -->
            <div v-if="plan.badge" class="plan-badge-v2" :style="{ background: plan.gradient }">
              {{ plan.badge === 'Populaire' ? '⭐ ' : '👑 ' }}{{ plan.badge }}
            </div>

            <!-- Header -->
            <div class="plan-header-v2">
              <div class="plan-icon-v2" :style="{ background: plan.gradient }">{{ plan.icon }}</div>
              <h3 class="plan-name-v2">{{ plan.name }}</h3>
              <p class="plan-desc-v2">{{ plan.description }}</p>
            </div>

            <!-- Price -->
            <div class="plan-price-v2">
              <span v-if="plan.price === 0" class="price-free-v2">Gratuit</span>
              <div v-else class="price-paid-v2">
                <span class="price-amount-v2">{{ formatPrice(plan.price) }}</span>
                <span class="price-period-v2">/ {{ plan.period }}</span>
              </div>
            </div>

            <!-- Features -->
            <ul class="plan-feats-v2">
              <li v-for="feat in plan.publicFeatureList" :key="feat" class="plan-feat-v2">
                <span class="feat-check-v2" :style="{ color: plan.color }">✓</span>
                <span>{{ feat }}</span>
              </li>
            </ul>

            <!-- CTA -->
            <a :href="`mailto:${cfg.bar_email || 'contact@bar.mg'}?subject=Demande plan ${plan.name}`"
              class="btn plan-btn-v2 w-full"
              :class="plan.badge === 'Populaire' ? 'btn-primary' : 'btn-secondary'">
              Commencer avec {{ plan.name }}
            </a>
          </div>
        </div>
      </div>
    </section>

    <!-- ══ CTA FINAL ══ -->
    <section class="lp-section cta-v2-section">
      <div class="layout-container">
        <div class="cta-v2-card glass-card reveal-b">
          <div class="cta-glow-bg"></div>
          <div class="cta-v2-inner">
            <div class="cta-icon-row">
              <span class="cta-big-icon">🍸</span>
            </div>
            <h2 class="cta-v2-title">Prêt à moderniser votre bar ?</h2>
            <p class="cta-v2-sub">Inscrivez-vous gratuitement et commencez à prendre des commandes en ligne dès aujourd'hui.</p>
            <div class="cta-v2-actions">
              <router-link to="/register" class="btn btn-primary btn-lg cta-main">
                Créer mon compte gratuitement →
              </router-link>
              <router-link to="/login" class="btn btn-ghost btn-lg">
                J'ai déjà un compte
              </router-link>
            </div>
            <div class="cta-trust-badges">
              <span>🔒 Sécurisé</span>
              <span>⚡ Rapide</span>
              <span>🆓 Gratuit pour démarrer</span>
              <span>📱 Mobile friendly</span>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- ══ FOOTER ══ -->
    <footer class="lp-footer glass border-t border-color">
      <div class="layout-container">
        <div class="footer-grid-v2">
          <!-- Brand -->
          <div class="footer-brand-v2">
            <div class="flex items-center gap-2 mb-3">
              <span class="text-2xl">🍸</span>
              <span class="font-display font-black uppercase text-sm">{{ cfg.bar_name || 'Le Bar Lounge' }}</span>
            </div>
            <p class="footer-tagline-v2">{{ cfg.landing_footer_tagline || "L'expérience bar réinventée." }}</p>
          </div>

          <!-- Contact -->
          <div class="footer-col-v2">
            <h4 class="footer-col-title-v2">Contact</h4>
            <div class="space-y-1.5">
              <p v-if="cfg.bar_phone" class="footer-info-v2">📞 {{ cfg.bar_phone }}</p>
              <p v-if="cfg.bar_email" class="footer-info-v2">✉️ {{ cfg.bar_email }}</p>
              <p v-if="cfg.bar_address" class="footer-info-v2">📍 {{ cfg.bar_address }}</p>
            </div>
          </div>

          <!-- Navigation -->
          <div class="footer-col-v2">
            <h4 class="footer-col-title-v2">Navigation</h4>
            <div class="space-y-1.5">
              <router-link to="/register" class="footer-link-v2">Créer un compte</router-link>
              <router-link to="/login" class="footer-link-v2">Connexion client</router-link>
              <a href="#menu" class="footer-link-v2">Voir le menu</a>
              <a v-if="showPricing" href="#pricing" class="footer-link-v2">Nos tarifs</a>
            </div>
          </div>

          <!-- Admin -->
          <div class="footer-col-v2">
            <h4 class="footer-col-title-v2">Administration</h4>
            <div class="space-y-1.5">
              <router-link to="/login/admin" class="footer-link-v2 flex items-center gap-1">
                <span>🔐</span> Accès Admin
              </router-link>
            </div>
          </div>
        </div>

        <div class="footer-bottom-v2">
          <span>© {{ new Date().getFullYear() }} {{ cfg.bar_name || 'Le Bar Lounge' }} — Tous droits réservés</span>
          <span class="text-muted text-xs">Propulsé par BarPOS</span>
        </div>
      </div>
    </footer>

    <!-- Back to top -->
    <button v-if="scrolled" @click="scrollToTop" class="btn-back-top">↑</button>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue';
import api from '@/services/api';
import { PUBLIC_PLANS } from '@/config/plans';

const cfg = ref({});
const categories = ref([]);
const menuLoading = ref(true);
const scrolled = ref(false);
const previewCat = ref(null);
const currentTime = ref('');

// ── Theme (dark/light) ──
const isDark = ref(true);
const toggleTheme = () => {
  isDark.value = !isDark.value;
  document.documentElement.setAttribute('data-theme', isDark.value ? 'dark' : 'light');
  localStorage.setItem('bar_theme', isDark.value ? 'dark' : 'light');
};

// Apply settings-based CSS variables to the document root
const applySettingsTheme = (settings) => {
  const root = document.documentElement.style;
  if (settings.primary_color) {
    root.setProperty('--primary', settings.primary_color);
    root.setProperty('--color-primary', settings.primary_color);
  }
  if (settings.secondary_color) {
    root.setProperty('--secondary', settings.secondary_color);
    root.setProperty('--color-secondary', settings.secondary_color);
  }
  if (settings.font_family) {
    root.setProperty('--font-primary', settings.font_family);
  }
  if (settings.bg_style) {
    const bgMap = { black: '#000000', gradient: '#0a0a1a', deep: '#0f0f23' };
    root.setProperty('--bg-primary', bgMap[settings.bg_style] || '#0f0f23');
    root.setProperty('--color-bg-primary', bgMap[settings.bg_style] || '#0f0f23');
  }
};

// Static items for the app preview card
const staticItems = [
  { name: 'Mojito Classic', price: '8 500 Ar' },
  { name: 'Sex on the Beach', price: '9 000 Ar' },
  { name: 'Piña Colada', price: '10 500 Ar' },
];

const publicPlans = PUBLIC_PLANS;

const features = [
  { icon: '📱', title: 'Commande mobile', desc: 'Vos clients commandent depuis leur téléphone, sans application à installer.' },
  { icon: '⚡', title: 'Service express', desc: 'Les commandes arrivent en temps réel chez votre équipe, zéro délai.' },
  { icon: '💳', title: 'Paiement flexible', desc: 'Espèces, Mobile Money, carte bancaire — tous les modes acceptés.' },
  { icon: '📊', title: 'Statistiques live', desc: 'Suivez vos ventes, stocks et performances en temps réel.' },
  { icon: '🏪', title: 'Gestion des stocks', desc: 'Alertes de rupture, suivi des entrées et sorties automatique.' },
  { icon: '🧾', title: 'Facturation PDF', desc: 'Générez des reçus et factures professionnels en un clic.' },
];

const steps = [
  { icon: '📝', title: 'Créez votre compte', desc: 'Inscrivez-vous en 30 secondes, aucune carte requise.' },
  { icon: '🍸', title: 'Parcourez le menu', desc: 'Explorez notre sélection et ajoutez vos boissons au panier.' },
  { icon: '✅', title: 'Commandez & Réglez', desc: 'Validez votre commande et choisissez votre mode de paiement.' },
];

const featGradients = [
  'linear-gradient(135deg, rgba(99,102,241,0.2), rgba(139,92,246,0.2))',
  'linear-gradient(135deg, rgba(16,185,129,0.2), rgba(5,150,105,0.2))',
  'linear-gradient(135deg, rgba(245,158,11,0.2), rgba(217,119,6,0.2))',
  'linear-gradient(135deg, rgba(59,130,246,0.2), rgba(37,99,235,0.2))',
  'linear-gradient(135deg, rgba(239,68,68,0.2), rgba(220,38,38,0.2))',
  'linear-gradient(135deg, rgba(139,92,246,0.2), rgba(109,40,217,0.2))',
];

const overlayOpacity = computed(() => {
  const val = parseInt(cfg.value.hero_overlay_opacity ?? 55);
  return val / 100;
});

const showPricing = computed(() => cfg.value.pricing_show === 'true');
const showHow = computed(() => cfg.value.how_show !== 'false');

const activePreviewProducts = computed(() => {
  if (!previewCat.value) return [];
  const cat = categories.value.find(c => c.id === previewCat.value);
  return (cat?.Products || []).filter(p => p.available).slice(0, 8);
});

const formatPrice = (p) => new Intl.NumberFormat('fr-FR').format(p || 0) + ' Ar';

const scrollToTop = () => window.scrollTo({ top: 0, behavior: 'smooth' });

const handleScroll = () => { scrolled.value = window.scrollY > 60; };

const updateTime = () => {
  currentTime.value = new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
};

let observer = null;
let timeInterval = null;

const setupReveal = () => {
  observer = new IntersectionObserver((entries) => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        e.target.classList.add('revealed');
        observer.unobserve(e.target);
      }
    });
  }, { threshold: 0.1 });
  document.querySelectorAll('.reveal-b').forEach(el => observer.observe(el));
};

onMounted(async () => {
  // Restore saved theme
  const savedTheme = localStorage.getItem('bar_theme') || 'dark';
  isDark.value = savedTheme !== 'light';
  document.documentElement.setAttribute('data-theme', savedTheme);

  window.addEventListener('scroll', handleScroll, { passive: true });
  updateTime();
  timeInterval = setInterval(updateTime, 30000);

  try {
    const [menuRes, settingsRes] = await Promise.all([
      api.get('/client/menu').catch(() => ({ data: { success: false } })),
      api.get('/client/settings').catch(() => ({ data: { success: false } })),
    ]);
    if (menuRes.data.success) {
      categories.value = menuRes.data.data.categories;
      if (categories.value.length > 0) previewCat.value = categories.value[0].id;
    }
    if (settingsRes.data.success) {
      cfg.value = settingsRes.data.data.settings;
      applySettingsTheme(cfg.value);
    }
  } finally {
    menuLoading.value = false;
    setTimeout(setupReveal, 150);
  }
});

onUnmounted(() => {
  window.removeEventListener('scroll', handleScroll);
  observer?.disconnect();
  clearInterval(timeInterval);
});
</script>

<style scoped>
/* ═══════════════════════════════════════════
   ROOT & LAYOUT
═══════════════════════════════════════════ */
.landing-v2 { min-height: 100vh; background: var(--bg-primary, #0a0a1a); }

/* ── Navigation ── */
.lp-nav {
  position: sticky;
  top: 0;
  z-index: 200;
  height: 68px;
  background: rgba(10,10,26,0.5);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  border-bottom: 1px solid rgba(255,255,255,0.05);
  transition: background 0.3s ease, box-shadow 0.3s ease;
}

.nav-solid .lp-nav {
  background: rgba(10,10,26,0.97);
  box-shadow: 0 4px 30px rgba(0,0,0,0.4);
}

.lp-logo-icon {
  width: 40px; height: 40px;
  border-radius: 12px;
  background: linear-gradient(135deg, var(--primary,#6366f1), var(--secondary,#8b5cf6));
  display: flex; align-items: center; justify-content: center;
  font-size: 22px;
  box-shadow: 0 4px 16px rgba(99,102,241,0.35);
}

.lp-nav-link {
  font-size: 13px; font-weight: 600;
  color: var(--text-secondary, #94a3b8);
  transition: color 0.2s;
  text-decoration: none;
}
.lp-nav-link:hover { color: var(--text-primary, #e2e8f0); }

/* ── Hero Background ── */
.hero-bg {
  background: #080814;
}

.hero-mesh {
  position: absolute; inset: 0;
  background:
    radial-gradient(ellipse 80% 50% at 20% 40%, rgba(99,102,241,0.15) 0%, transparent 60%),
    radial-gradient(ellipse 60% 40% at 80% 70%, rgba(139,92,246,0.1) 0%, transparent 55%),
    radial-gradient(ellipse 50% 30% at 50% 10%, rgba(245,158,11,0.05) 0%, transparent 50%);
}

.hero-grid-lines {
  position: absolute; inset: 0;
  background-image:
    linear-gradient(rgba(255,255,255,0.02) 1px, transparent 1px),
    linear-gradient(90deg, rgba(255,255,255,0.02) 1px, transparent 1px);
  background-size: 60px 60px;
  mask-image: radial-gradient(ellipse 80% 80% at 50% 50%, black, transparent);
}

.hero-orb {
  position: absolute; border-radius: 50%;
  filter: blur(80px); pointer-events: none;
  animation: orb-float 12s ease-in-out infinite;
}
.orb-a { width: 500px; height: 500px; top: 0%; left: -5%; background: rgba(99,102,241,0.18); }
.orb-b { width: 400px; height: 400px; bottom: 5%; right: -5%; background: rgba(139,92,246,0.12); animation-delay: 3s; animation-duration: 15s; }
.orb-c { width: 300px; height: 300px; top: 50%; left: 50%; background: rgba(245,158,11,0.06); animation-delay: 6s; animation-duration: 18s; }

@keyframes orb-float {
  0%, 100% { transform: translate(0, 0) scale(1); }
  33% { transform: translate(30px, -25px) scale(1.05); }
  66% { transform: translate(-20px, 15px) scale(0.95); }
}

/* ── Hero Layout ── */
.hero-layout {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 4rem;
  align-items: center;
}

@media (max-width: 1024px) {
  .hero-layout { grid-template-columns: 1fr; }
}

/* ── Hero Content Left ── */
.hero-badge {
  display: inline-flex; align-items: center; gap: 8px;
  padding: 6px 16px; border-radius: 9999px;
  background: rgba(99,102,241,0.12);
  border: 1px solid rgba(99,102,241,0.3);
  font-size: 11px; font-weight: 800;
  text-transform: uppercase; letter-spacing: 0.12em;
  color: var(--primary, #6366f1);
  margin-bottom: 1.5rem;
}
.badge-pulse {
  width: 8px; height: 8px; border-radius: 50%;
  background: var(--primary, #6366f1);
  box-shadow: 0 0 0 0 rgba(99,102,241,0.6);
  animation: badge-pulse 2s infinite;
}
@keyframes badge-pulse {
  0% { box-shadow: 0 0 0 0 rgba(99,102,241,0.6); }
  70% { box-shadow: 0 0 0 8px rgba(99,102,241,0); }
  100% { box-shadow: 0 0 0 0 rgba(99,102,241,0); }
}

.hero-h1 {
  font-family: var(--font-display, 'Outfit'), sans-serif;
  font-size: clamp(2.5rem, 5vw, 4.5rem);
  font-weight: 900;
  letter-spacing: -0.03em;
  line-height: 1.05;
  margin-bottom: 1.25rem;
  display: flex; flex-direction: column; gap: 0.2em;
}

.hero-gradient-line {
  background: linear-gradient(135deg, #818cf8 0%, #a78bfa 50%, #f472b6 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.hero-description {
  font-size: 1.0625rem;
  color: var(--text-secondary, #94a3b8);
  line-height: 1.7;
  max-width: 500px;
  margin-bottom: 2rem;
}

.hero-ctas { display: flex; gap: 1rem; flex-wrap: wrap; margin-bottom: 2.5rem; }

.cta-main {
  background: linear-gradient(135deg, #6366f1, #8b5cf6);
  box-shadow: 0 8px 30px rgba(99,102,241,0.4);
  border: none;
  font-weight: 800;
  letter-spacing: 0.02em;
}
.cta-main:hover { box-shadow: 0 12px 40px rgba(99,102,241,0.55); transform: translateY(-2px); }

.btn-ghost {
  background: transparent;
  border: 1px solid rgba(255,255,255,0.12);
  color: var(--text-secondary);
  transition: all 0.2s;
}
.btn-ghost:hover { border-color: rgba(255,255,255,0.3); color: var(--text-primary); }

/* Hero stats strip */
.hero-stats-strip {
  display: flex; gap: 1.5rem;
  padding-top: 1.5rem;
  border-top: 1px solid rgba(255,255,255,0.06);
  flex-wrap: wrap;
}
.hero-stat-item { display: flex; flex-direction: column; gap: 2px; }
.hero-stat-num {
  font-family: var(--font-display, 'Outfit'), sans-serif;
  font-size: 1.5rem; font-weight: 900;
  line-height: 1;
}
.stat-color-1 { color: var(--primary, #6366f1); }
.stat-color-2 { color: var(--secondary, #8b5cf6); }
.stat-color-3 { color: var(--accent, #f59e0b); }
.stat-color-4 { color: var(--success, #10b981); }
.hero-stat-lbl { font-size: 10px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.1em; color: var(--text-muted, #64748b); }

/* Hero entrance animations */
.animate-hero-badge  { animation: fadeUp 0.6s ease both 0.2s; opacity: 0; }
.animate-hero-title  { animation: fadeUp 0.7s ease both 0.35s; opacity: 0; }
.animate-hero-desc   { animation: fadeUp 0.7s ease both 0.5s; opacity: 0; }
.animate-hero-ctas   { animation: fadeUp 0.7s ease both 0.65s; opacity: 0; }
.animate-hero-stats  { animation: fadeUp 0.7s ease both 0.8s; opacity: 0; }
.animate-hero-preview { animation: fadeRight 0.8s ease both 0.5s; opacity: 0; }

@keyframes fadeUp {
  from { opacity: 0; transform: translateY(24px); }
  to   { opacity: 1; transform: translateY(0); }
}
@keyframes fadeRight {
  from { opacity: 0; transform: translateX(32px); }
  to   { opacity: 1; transform: translateX(0); }
}

/* ── App Preview Card ── */
.hero-preview-side { position: relative; }

.float-chip {
  position: absolute; z-index: 10;
  display: flex; align-items: center; gap: 6px;
  padding: 8px 14px;
  border-radius: 12px;
  font-size: 12px; font-weight: 700;
  animation: float-chip 4s ease-in-out infinite;
}
.chip-top { top: 8%; right: -5%; animation-delay: 0s; }
.chip-bottom { bottom: 15%; left: -8%; animation-delay: 2s; }
@keyframes float-chip {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-8px); }
}

.app-preview {
  width: 300px; border-radius: 24px;
  overflow: hidden;
  border: 1px solid rgba(255,255,255,0.1);
  box-shadow: 0 32px 80px rgba(0,0,0,0.5), 0 0 0 1px rgba(99,102,241,0.1);
}

.app-header {
  display: flex; align-items: center; justify-content: space-between;
  padding: 14px 16px;
  background: linear-gradient(135deg, rgba(99,102,241,0.2), rgba(139,92,246,0.15));
  border-bottom: 1px solid rgba(255,255,255,0.06);
}
.app-status-dot {
  width: 8px; height: 8px; border-radius: 50%;
  background: var(--success, #10b981);
  box-shadow: 0 0 8px var(--success, #10b981);
  animation: pulse-dot 2s infinite;
}
@keyframes pulse-dot {
  0%, 100% { box-shadow: 0 0 8px var(--success, #10b981); }
  50% { box-shadow: 0 0 16px var(--success, #10b981); }
}
.app-bar-name { font-size: 12px; font-weight: 800; text-transform: uppercase; letter-spacing: 0.1em; }
.app-time { font-size: 11px; font-weight: 600; color: var(--text-muted); font-variant-numeric: tabular-nums; }

.app-cat-tabs { display: flex; gap: 4px; padding: 10px 12px; background: rgba(255,255,255,0.02); }
.app-cat {
  font-size: 10px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.08em;
  padding: 4px 10px; border-radius: 8px;
  color: var(--text-muted);
  white-space: nowrap;
}
.app-cat.active { background: var(--primary, #6366f1); color: white; }

.app-items { padding: 8px 12px; display: flex; flex-direction: column; gap: 8px; }
.app-item {
  display: flex; align-items: center; justify-content: space-between;
  padding: 10px 12px;
  background: rgba(255,255,255,0.03);
  border: 1px solid rgba(255,255,255,0.06);
  border-radius: 10px;
}
.app-item-name { font-size: 12px; font-weight: 600; }
.app-item-price { font-size: 11px; color: var(--primary, #6366f1); font-weight: 700; }
.app-add-btn {
  width: 28px; height: 28px; border-radius: 8px;
  background: var(--primary, #6366f1);
  color: white; font-size: 18px; font-weight: 700;
  display: flex; align-items: center; justify-content: center;
  cursor: pointer; border: none;
  transition: transform 0.15s, background 0.15s;
}
.app-add-btn:hover { transform: scale(1.1); }

.app-cart-btn {
  margin: 10px 12px 14px;
  background: linear-gradient(135deg, #6366f1, #8b5cf6);
  border-radius: 12px;
  padding: 10px 14px;
  display: flex; align-items: center; gap: 8px;
  font-size: 12px; font-weight: 800; color: white;
  position: relative;
}
.app-cart-badge {
  position: absolute; top: -6px; right: -4px;
  width: 20px; height: 20px; border-radius: 50%;
  background: var(--accent, #f59e0b);
  color: white; font-size: 10px; font-weight: 900;
  display: flex; align-items: center; justify-content: center;
}

/* Scroll hint */
.scroll-hint-v2 {
  position: absolute; bottom: 2rem; left: 50%; transform: translateX(-50%);
  display: flex; flex-direction: column; align-items: center; gap: 6px;
  opacity: 0.5; z-index: 10;
}
.scroll-mouse-v2 {
  width: 24px; height: 38px; border-radius: 12px;
  border: 2px solid rgba(255,255,255,0.25);
  display: flex; justify-content: center; padding-top: 6px;
}
.scroll-ball {
  width: 4px; height: 8px; border-radius: 2px;
  background: rgba(255,255,255,0.5);
  animation: scroll-ball 2s ease-in-out infinite;
}
@keyframes scroll-ball {
  0% { transform: translateY(0); opacity: 1; }
  100% { transform: translateY(14px); opacity: 0; }
}
.scroll-hint-v2 span { font-size: 9px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.15em; color: var(--text-muted); }

/* ═══════════════════════════════════════════
   SECTIONS COMMUNE
═══════════════════════════════════════════ */
.lp-section { padding: 7rem 0; }

.section-head {
  text-align: center; margin-bottom: 4rem;
}
.eyebrow {
  display: inline-block;
  font-size: 11px; font-weight: 800;
  text-transform: uppercase; letter-spacing: 0.18em;
  color: var(--primary, #6366f1);
  background: rgba(99,102,241,0.1);
  border: 1px solid rgba(99,102,241,0.2);
  padding: 5px 14px; border-radius: 99px;
  margin-bottom: 1rem;
}
.section-h2 {
  font-family: var(--font-display, 'Outfit'), sans-serif;
  font-size: clamp(1.75rem, 4vw, 2.75rem);
  font-weight: 900;
  letter-spacing: -0.02em;
  line-height: 1.1;
  margin-bottom: 0.75rem;
}
.section-sub {
  color: var(--text-secondary, #94a3b8);
  font-size: 1.0625rem;
  max-width: 560px; margin: 0 auto;
  line-height: 1.65;
}

/* Scroll reveal */
.reveal-b {
  opacity: 0; transform: translateY(28px);
  transition: opacity 0.6s ease, transform 0.6s ease;
}
.reveal-b.revealed { opacity: 1; transform: translateY(0); }

/* ═══════════════════════════════════════════
   FEATURES
═══════════════════════════════════════════ */
.features-v2 {
  background: radial-gradient(ellipse 80% 40% at 50% 0%, rgba(99,102,241,0.07), transparent 70%);
}

.features-grid-v2 {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 1.25rem;
}

@media (max-width: 1024px) { .features-grid-v2 { grid-template-columns: repeat(2, 1fr); } }
@media (max-width: 640px) { .features-grid-v2 { grid-template-columns: 1fr; } }

.feat-card-v2 {
  padding: 2rem 1.75rem;
  position: relative; overflow: hidden;
  transition: transform 0.3s ease, box-shadow 0.3s ease !important;
}
.feat-card-v2:hover { transform: translateY(-6px) !important; }
.feat-card-v2::before {
  content: '';
  position: absolute; top: 0; left: 0; right: 0; height: 2px;
  background: linear-gradient(90deg, var(--primary,#6366f1), var(--secondary,#8b5cf6));
  opacity: 0; transition: opacity 0.3s;
}
.feat-card-v2:hover::before { opacity: 1; }

.feat-icon-v2 {
  width: 52px; height: 52px; border-radius: 14px;
  display: flex; align-items: center; justify-content: center;
  font-size: 1.6rem; margin-bottom: 1.25rem;
  transition: transform 0.35s ease;
}
.feat-card-v2:hover .feat-icon-v2 { transform: scale(1.15) rotate(5deg); }

.feat-title-v2 { font-weight: 800; font-size: 1rem; margin-bottom: 0.5rem; }
.feat-desc-v2 { font-size: 0.875rem; color: var(--text-secondary); line-height: 1.6; }

/* ═══════════════════════════════════════════
   HOW IT WORKS
═══════════════════════════════════════════ */
.how-section {
  background: rgba(255,255,255,0.01);
  border-top: 1px solid var(--border-color);
  border-bottom: 1px solid var(--border-color);
}

.steps-wrapper {
  display: grid; grid-template-columns: repeat(3, 1fr);
  gap: 2rem; position: relative;
}
@media (max-width: 768px) { .steps-wrapper { grid-template-columns: 1fr; } }

.steps-line-bg {
  position: absolute; top: 60px; left: 16.66%; right: 16.66%; height: 2px;
  background: linear-gradient(90deg, var(--primary,#6366f1), var(--secondary,#8b5cf6));
  opacity: 0.2;
  pointer-events: none;
}
@media (max-width: 768px) { .steps-line-bg { display: none; } }

.step-card {
  text-align: center; padding: 2rem 1.5rem;
  background: rgba(255,255,255,0.02);
  border: 1px solid rgba(255,255,255,0.05);
  border-radius: 20px;
  position: relative;
}

.step-num-badge {
  position: absolute; top: -14px; left: 50%; transform: translateX(-50%);
  width: 28px; height: 28px; border-radius: 50%;
  background: linear-gradient(135deg, var(--primary,#6366f1), var(--secondary,#8b5cf6));
  color: white; font-size: 11px; font-weight: 900;
  display: flex; align-items: center; justify-content: center;
  box-shadow: 0 4px 16px rgba(99,102,241,0.4);
}

.step-icon-circle {
  width: 72px; height: 72px; border-radius: 50%;
  background: rgba(99,102,241,0.1);
  border: 2px solid rgba(99,102,241,0.2);
  display: flex; align-items: center; justify-content: center;
  margin: 1.5rem auto 1.25rem;
  transition: transform 0.3s ease, background 0.3s ease;
}
.step-card:hover .step-icon-circle { transform: scale(1.1); background: rgba(99,102,241,0.18); }

.step-title { font-weight: 800; font-size: 1rem; margin-bottom: 0.5rem; }
.step-desc { font-size: 0.875rem; color: var(--text-secondary); line-height: 1.6; }

/* ═══════════════════════════════════════════
   MENU PREVIEW
═══════════════════════════════════════════ */
.menu-v2 {
  background: radial-gradient(ellipse 60% 40% at 80% 50%, rgba(139,92,246,0.06), transparent 60%);
}

.menu-tabs-v2 {
  display: flex; gap: 0.5rem; overflow-x: auto;
  scrollbar-width: none; padding-bottom: 0.75rem;
  margin-bottom: 1.75rem;
}
.menu-tabs-v2::-webkit-scrollbar { display: none; }

.menu-tab-v2 {
  flex-shrink: 0;
  display: flex; align-items: center; gap: 6px;
  padding: 8px 18px; border-radius: 9999px;
  font-size: 12px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.06em;
  border: 1px solid var(--border-color);
  background: var(--bg-glass);
  color: var(--text-secondary);
  cursor: pointer; transition: all 0.2s;
}
.menu-tab-v2:hover { border-color: rgba(99,102,241,0.4); color: var(--text-primary); }
.menu-tab-v2.active {
  background: var(--primary, #6366f1);
  border-color: var(--primary, #6366f1);
  color: white;
  box-shadow: 0 4px 16px rgba(99,102,241,0.35);
}
.tab-count-v2 {
  font-size: 10px; padding: 1px 7px; border-radius: 99px;
  background: rgba(255,255,255,0.15);
}
.menu-tab-v2.active .tab-count-v2 { background: rgba(255,255,255,0.25); }

.products-grid-v2 {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 1rem;
  margin-bottom: 3rem;
}
@media (max-width: 1024px) { .products-grid-v2 { grid-template-columns: repeat(3, 1fr); } }
@media (max-width: 768px) { .products-grid-v2 { grid-template-columns: repeat(2, 1fr); } }
@media (max-width: 480px) { .products-grid-v2 { grid-template-columns: 1fr; } }

.prod-card-v2 { padding: 1.25rem; display: flex; flex-direction: column; gap: 0.5rem; }
.prod-header-v2 { display: flex; align-items: flex-start; justify-content: space-between; gap: 0.5rem; }
.prod-name-v2 { font-weight: 700; font-size: 0.875rem; line-height: 1.3; }
.prod-badge-v2 { font-size: 10px; font-weight: 800; padding: 2px 7px; border-radius: 99px; flex-shrink: 0; }
.prod-badge-v2.avail { background: rgba(16,185,129,0.15); color: #34d399; border: 1px solid rgba(16,185,129,0.25); }
.prod-badge-v2.unavail { background: rgba(239,68,68,0.15); color: #f87171; border: 1px solid rgba(239,68,68,0.25); }
.prod-desc-v2 { font-size: 11px; color: var(--text-muted); line-height: 1.5; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; }
.prod-footer-v2 { margin-top: auto; display: flex; align-items: baseline; gap: 0.5rem; flex-wrap: wrap; }
.prod-price-v2 { font-family: var(--font-display); font-weight: 900; font-size: 1rem; color: var(--primary, #6366f1); }
.prod-consigne-v2 { font-size: 10px; color: var(--accent, #f59e0b); font-weight: 700; }

.menu-cta-v2 { text-align: center; padding-top: 1rem; }
.menu-note { margin-top: 0.75rem; font-size: 12px; color: var(--text-muted); }

/* ═══════════════════════════════════════════
   PRICING
═══════════════════════════════════════════ */
.pricing-v2 {
  background: radial-gradient(ellipse 70% 50% at 50% 100%, rgba(99,102,241,0.08), transparent 60%);
}

.pricing-grid-v2 {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 1.25rem;
  align-items: start;
}
@media (max-width: 1024px) { .pricing-grid-v2 { grid-template-columns: repeat(2, 1fr); } }
@media (max-width: 640px) { .pricing-grid-v2 { grid-template-columns: 1fr; } }

.pricing-card-v2 {
  padding: 2rem 1.75rem;
  position: relative; overflow: hidden;
  transition: transform 0.3s ease !important;
}
.pricing-card-v2:hover { transform: translateY(-4px) !important; }

.pricing-featured {
  border-color: var(--primary, #6366f1) !important;
  box-shadow: 0 0 0 1px rgba(99,102,241,0.3), 0 20px 60px rgba(99,102,241,0.15) !important;
  transform: scale(1.02);
}
.pricing-featured:hover { transform: scale(1.02) translateY(-4px) !important; }

.plan-badge-v2 {
  position: absolute; top: 0; right: 20px;
  padding: 4px 14px; border-radius: 0 0 10px 10px;
  font-size: 10px; font-weight: 800;
  text-transform: uppercase; letter-spacing: 0.1em;
  color: white;
}

.plan-header-v2 { text-align: center; margin-bottom: 1.5rem; }
.plan-icon-v2 {
  width: 56px; height: 56px; border-radius: 16px;
  font-size: 1.75rem;
  display: flex; align-items: center; justify-content: center;
  margin: 0 auto 1rem;
  box-shadow: 0 8px 24px rgba(0,0,0,0.2);
}
.plan-name-v2 { font-family: var(--font-display); font-size: 1.375rem; font-weight: 900; letter-spacing: -0.01em; margin-bottom: 0.25rem; }
.plan-desc-v2 { font-size: 0.8125rem; color: var(--text-secondary); }

.plan-price-v2 { text-align: center; margin-bottom: 1.75rem; padding: 1.25rem 0; border-top: 1px solid var(--border-color); border-bottom: 1px solid var(--border-color); }
.price-free-v2 { font-family: var(--font-display); font-size: 2rem; font-weight: 900; }
.price-paid-v2 { display: flex; align-items: baseline; gap: 4px; justify-content: center; }
.price-amount-v2 { font-family: var(--font-display); font-size: 2rem; font-weight: 900; }
.price-period-v2 { font-size: 0.875rem; color: var(--text-muted); }

.plan-feats-v2 { list-style: none; margin-bottom: 1.75rem; display: flex; flex-direction: column; gap: 0.6rem; }
.plan-feat-v2 { display: flex; align-items: flex-start; gap: 8px; font-size: 0.875rem; }
.feat-check-v2 { font-weight: 900; font-size: 0.9rem; flex-shrink: 0; }
.plan-btn-v2 { font-weight: 800; letter-spacing: 0.03em; }

/* ═══════════════════════════════════════════
   CTA FINAL
═══════════════════════════════════════════ */
.cta-v2-section {
  background: radial-gradient(ellipse 60% 60% at 50% 50%, rgba(99,102,241,0.06), transparent);
}

.cta-v2-card {
  padding: 4rem 3rem;
  text-align: center;
  position: relative; overflow: hidden;
  border-color: rgba(99,102,241,0.2) !important;
}
.cta-glow-bg {
  position: absolute; top: -50%; left: 50%; transform: translateX(-50%);
  width: 600px; height: 400px; border-radius: 50%;
  background: radial-gradient(ellipse, rgba(99,102,241,0.12), transparent 70%);
  pointer-events: none;
}
.cta-v2-inner { position: relative; z-index: 1; }
.cta-big-icon { font-size: 3.5rem; display: block; margin-bottom: 1rem; }
.cta-v2-title { font-family: var(--font-display); font-size: clamp(1.75rem, 4vw, 2.5rem); font-weight: 900; letter-spacing: -0.02em; margin-bottom: 0.75rem; }
.cta-v2-sub { font-size: 1.0625rem; color: var(--text-secondary); max-width: 480px; margin: 0 auto 2rem; line-height: 1.65; }
.cta-v2-actions { display: flex; gap: 1rem; justify-content: center; flex-wrap: wrap; margin-bottom: 2rem; }
.cta-trust-badges {
  display: flex; gap: 1.5rem; justify-content: center; flex-wrap: wrap;
  font-size: 12px; font-weight: 600; color: var(--text-muted);
}

/* ═══════════════════════════════════════════
   FOOTER
═══════════════════════════════════════════ */
.lp-footer { padding: 3.5rem 0 2rem; }

.footer-grid-v2 {
  display: grid;
  grid-template-columns: 2fr 1fr 1fr 1fr;
  gap: 2.5rem;
  margin-bottom: 2.5rem;
}
@media (max-width: 1024px) { .footer-grid-v2 { grid-template-columns: 1fr 1fr; } }
@media (max-width: 640px) { .footer-grid-v2 { grid-template-columns: 1fr; } }

.footer-tagline-v2 { font-size: 13px; color: var(--text-muted); line-height: 1.6; max-width: 260px; }
.footer-col-title-v2 { font-size: 11px; font-weight: 800; text-transform: uppercase; letter-spacing: 0.15em; color: var(--text-muted); margin-bottom: 1rem; }
.footer-link-v2 { display: block; font-size: 13px; color: var(--text-secondary); text-decoration: none; transition: color 0.2s; line-height: 2; }
.footer-link-v2:hover { color: var(--primary, #6366f1); }
.footer-info-v2 { font-size: 13px; color: var(--text-secondary); line-height: 1.8; }

.footer-bottom-v2 {
  display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 0.5rem;
  padding-top: 1.5rem;
  border-top: 1px solid var(--border-color);
  font-size: 12px; color: var(--text-muted);
}

/* Back to top */
.btn-back-top {
  position: fixed; bottom: 2rem; right: 2rem; z-index: 50;
  width: 44px; height: 44px; border-radius: 14px;
  background: linear-gradient(135deg, var(--primary,#6366f1), var(--secondary,#8b5cf6));
  color: white; font-size: 1.1rem; font-weight: 800;
  display: flex; align-items: center; justify-content: center;
  border: none; cursor: pointer;
  box-shadow: 0 8px 24px rgba(99,102,241,0.4);
  transition: transform 0.2s, box-shadow 0.2s;
  animation: fadeUp 0.3s ease both;
}
.btn-back-top:hover { transform: translateY(-3px); box-shadow: 0 12px 32px rgba(99,102,241,0.5); }

/* ═══════════════════════════════════════════
   LIGHT MODE OVERRIDES
═══════════════════════════════════════════ */
[data-theme="light"] .landing-v2 { background: #f8f8ff; color: #1e1e2e; }
[data-theme="light"] .lp-nav {
  background: rgba(248,248,255,0.85);
  border-bottom-color: rgba(99,102,241,0.12);
}
[data-theme="light"] .nav-solid .lp-nav {
  background: rgba(248,248,255,0.98);
  box-shadow: 0 4px 30px rgba(0,0,0,0.08);
}
[data-theme="light"] .lp-nav-link { color: #64748b; }
[data-theme="light"] .lp-nav-link:hover { color: #1e1e2e; }
[data-theme="light"] .hero-bg { background: #ededff; }
[data-theme="light"] .hero-mesh {
  background:
    radial-gradient(ellipse 80% 50% at 20% 40%, rgba(99,102,241,0.12), transparent 60%),
    radial-gradient(ellipse 60% 40% at 80% 70%, rgba(139,92,246,0.08), transparent 55%);
}
[data-theme="light"] .hero-grid-lines {
  background-image:
    linear-gradient(rgba(99,102,241,0.06) 1px, transparent 1px),
    linear-gradient(90deg, rgba(99,102,241,0.06) 1px, transparent 1px);
}
[data-theme="light"] .orb-a { background: rgba(99,102,241,0.1); }
[data-theme="light"] .orb-b { background: rgba(139,92,246,0.07); }
[data-theme="light"] .hero-h1 { color: #1e1e2e; }
[data-theme="light"] .hero-description { color: #64748b; }
[data-theme="light"] .hero-stats-strip { border-top-color: rgba(99,102,241,0.12); }
[data-theme="light"] .hero-stat-lbl { color: #94a3b8; }
[data-theme="light"] .btn-ghost { border-color: rgba(99,102,241,0.2); color: #64748b; }
[data-theme="light"] .btn-ghost:hover { border-color: rgba(99,102,241,0.4); color: #1e1e2e; }
[data-theme="light"] .app-preview { background: #fff; border-color: rgba(99,102,241,0.15); box-shadow: 0 32px 80px rgba(99,102,241,0.1); }
[data-theme="light"] .app-item { background: rgba(99,102,241,0.04); border-color: rgba(99,102,241,0.1); }
[data-theme="light"] .app-cat { color: #94a3b8; }
[data-theme="light"] .app-cat-tabs { background: rgba(99,102,241,0.03); }
[data-theme="light"] .float-chip { background: rgba(255,255,255,0.9); border-color: rgba(99,102,241,0.15); color: #1e1e2e; box-shadow: 0 4px 16px rgba(99,102,241,0.1); }
[data-theme="light"] .features-v2 { background: radial-gradient(ellipse 80% 40% at 50% 0%, rgba(99,102,241,0.05), transparent 70%); }
[data-theme="light"] .feat-card-v2 { background: #fff; border-color: rgba(99,102,241,0.1); }
[data-theme="light"] .feat-title-v2 { color: #1e1e2e; }
[data-theme="light"] .feat-desc-v2 { color: #64748b; }
[data-theme="light"] .how-section { background: rgba(99,102,241,0.03); border-color: rgba(99,102,241,0.1); }
[data-theme="light"] .step-card { background: #fff; border-color: rgba(99,102,241,0.12); }
[data-theme="light"] .step-title { color: #1e1e2e; }
[data-theme="light"] .step-desc { color: #64748b; }
[data-theme="light"] .menu-tab-v2 { background: #fff; border-color: rgba(99,102,241,0.12); color: #64748b; }
[data-theme="light"] .menu-tab-v2:hover { color: #1e1e2e; }
[data-theme="light"] .prod-card-v2 { background: #fff; border-color: rgba(99,102,241,0.08); }
[data-theme="light"] .prod-name-v2 { color: #1e1e2e; }
[data-theme="light"] .prod-desc-v2 { color: #94a3b8; }
[data-theme="light"] .menu-note { color: #94a3b8; }
[data-theme="light"] .pricing-card-v2 { background: #fff; border-color: rgba(99,102,241,0.1); }
[data-theme="light"] .plan-name-v2 { color: #1e1e2e; }
[data-theme="light"] .plan-desc-v2 { color: #64748b; }
[data-theme="light"] .plan-price-v2 { border-color: rgba(99,102,241,0.1); }
[data-theme="light"] .price-period-v2 { color: #94a3b8; }
[data-theme="light"] .plan-feat-v2 { color: #374151; }
[data-theme="light"] .cta-v2-section { background: radial-gradient(ellipse 60% 60% at 50% 50%, rgba(99,102,241,0.05), transparent); }
[data-theme="light"] .cta-v2-card { background: #fff; border-color: rgba(99,102,241,0.15) !important; }
[data-theme="light"] .cta-v2-title { color: #1e1e2e; }
[data-theme="light"] .cta-v2-sub { color: #64748b; }
[data-theme="light"] .cta-trust-badges { color: #94a3b8; }
[data-theme="light"] .lp-footer { background: rgba(248,248,255,0.95); border-top-color: rgba(99,102,241,0.1); }
[data-theme="light"] .footer-tagline-v2 { color: #94a3b8; }
[data-theme="light"] .footer-col-title-v2 { color: #94a3b8; }
[data-theme="light"] .footer-link-v2 { color: #64748b; }
[data-theme="light"] .footer-info-v2 { color: #64748b; }
[data-theme="light"] .footer-bottom-v2 { border-top-color: rgba(99,102,241,0.1); color: #94a3b8; }
[data-theme="light"] .section-h2 { color: #1e1e2e; }
[data-theme="light"] .section-sub { color: #64748b; }
[data-theme="light"] .scroll-hint-v2 { opacity: 0.35; }

@media (max-width: 640px) {
  .cta-v2-card { padding: 2.5rem 1.5rem; }
  .hero-stats-strip { gap: 1rem; }
  .btn-back-top { bottom: 90px; right: 1rem; }
}
</style>
