<template>
  <div class="settings-page-premium">
    <div class="page-header mb-8 flex flex-wrap items-start justify-between gap-4">
      <div>
        <h1 class="text-3xl font-display font-black tracking-tight">CONFIGURATION SYSTÈME</h1>
        <p class="text-secondary text-sm mt-1">Personnalisez votre plateforme, l'apparence et la page d'accueil.</p>
      </div>
      <a href="/" target="_blank"
        class="glass px-4 py-2.5 rounded-xl border border-white/5 flex items-center gap-2 hover:border-primary/30 transition-all text-xs font-bold text-secondary hover:text-white">
        <span>🌐</span> Voir la page d'accueil
      </a>
    </div>

    <div v-if="loading" class="flex justify-center py-24"><div class="spinner"></div></div>

    <div v-else>
      <!-- Tabs (scrollable on mobile) -->
      <div class="overflow-x-auto pb-1 mb-8 -mx-1 px-1">
        <div class="glass p-1 rounded-2xl flex border border-white/5 w-fit">
          <button v-for="t in tabDefs" :key="t.id" @click="activeTab = t.id"
            :class="['px-4 sm:px-6 py-2.5 rounded-xl text-[11px] font-black uppercase tracking-widest transition-all flex items-center gap-2 whitespace-nowrap',
                     activeTab === t.id ? 'bg-primary text-white shadow-glow' : 'hover:bg-white/5 text-muted']">
            <span>{{ t.icon }}</span> {{ t.label }}
          </button>
        </div>
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

            <!-- Logo & Favicon -->
            <div class="space-y-4">
              <div class="space-y-2">
                <label class="settings-label">Logo</label>
                <ImageUploader v-model="s.logo" uploadKey="logo" fieldName="file" compact />
              </div>
              <div class="space-y-2">
                <label class="settings-label">Favicon</label>
                <ImageUploader v-model="s.favicon" uploadKey="favicon" fieldName="file" compact />
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
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div class="space-y-2">
                <label class="settings-label">Texte du badge (ex: OUVERT MAINTENANT)</label>
                <input v-model="s.hero_badge_text" class="input-premium w-full" />
              </div>
              <div class="space-y-2">
                <label class="settings-label">Afficher le badge</label>
                <div class="flex items-center gap-3 pt-2">
                  <button @click="toggleBadge"
                    :class="['w-12 h-6 rounded-full transition-all relative flex-shrink-0', s.hero_badge_show === 'true' ? 'bg-primary' : 'bg-white/10']">
                    <span :class="['absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-all', s.hero_badge_show === 'true' ? 'left-6' : 'left-0.5']"></span>
                  </button>
                  <span class="text-xs font-bold">{{ s.hero_badge_show === 'true' ? 'Visible' : 'Masqué' }}</span>
                </div>
              </div>
            </div>

            <div class="space-y-2">
              <label class="settings-label">Description héro</label>
              <input v-model="s.hero_description" class="input-premium w-full" placeholder="Commandez, suivez et payez en temps réel depuis votre table." />
            </div>

            <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div class="space-y-2">
                <label class="settings-label">Bouton CTA 1</label>
                <input v-model="s.hero_cta1_text" class="input-premium w-full" placeholder="Réserver ma table" />
              </div>
              <div class="space-y-2">
                <label class="settings-label">Bouton CTA 2</label>
                <input v-model="s.hero_cta2_text" class="input-premium w-full" placeholder="Consulter le menu" />
              </div>
            </div>

            <!-- Background image with preview -->
            <div class="space-y-2">
              <label class="settings-label">Image de fond</label>
              <ImageUploader v-model="s.landing_bg_image" uploadKey="landing_bg_image" fieldName="file" />
            </div>

            <div class="space-y-2">
              <label class="settings-label">Opacité de l'overlay ({{ s.hero_overlay_opacity }}%)</label>
              <input v-model="s.hero_overlay_opacity" type="range" min="0" max="100" class="w-full accent-primary" />
              <div class="flex justify-between text-[9px] text-muted font-bold">
                <span>0% (transparent)</span><span>50%</span><span>100% (opaque)</span>
              </div>
            </div>
          </div>
        </div>

        <!-- Stats -->
        <div class="glass-card p-8 border-t-4 border-secondary">
          <h2 class="text-lg font-display font-black mb-6 flex items-center gap-2"><span>📊</span> STATISTIQUES HERO</h2>
          <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <div v-for="i in 4" :key="i" class="space-y-3">
              <div class="glass rounded-xl p-3 text-center border border-white/5">
                <span class="text-xl font-display font-black text-primary">{{ s[`landing_stat${i}_value`] || '—' }}</span>
                <span class="block text-[9px] text-muted uppercase tracking-widest mt-0.5">{{ s[`landing_stat${i}_label`] || '—' }}</span>
              </div>
              <div class="space-y-2">
                <label class="settings-label">Valeur</label>
                <input v-model="s[`landing_stat${i}_value`]" class="input-premium w-full" :placeholder="['50+', '100%', '24/7', '5★'][i-1]" />
              </div>
              <div class="space-y-2">
                <label class="settings-label">Label</label>
                <input v-model="s[`landing_stat${i}_label`]" class="input-premium w-full" :placeholder="['Boissons', 'Satisfaction', 'Service', 'Note'][i-1]" />
              </div>
            </div>
          </div>
        </div>

        <!-- Features -->
        <div class="glass-card p-8 border-t-4 border-accent">
          <h2 class="text-lg font-display font-black mb-6 flex items-center gap-2"><span>✨</span> POINTS FORTS</h2>
          <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div v-for="i in 6" :key="i" class="glass rounded-2xl p-5 border border-white/5 space-y-3">
              <div class="flex items-center gap-3">
                <span class="text-3xl">{{ s[`landing_feat${i}_icon`] || '⭐' }}</span>
                <span class="font-bold text-sm truncate">{{ s[`landing_feat${i}_title`] || `Fonctionnalité ${i}` }}</span>
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

        <!-- How it works -->
        <div class="glass-card p-8 border-t-4 border-primary">
          <div class="flex items-center justify-between mb-6">
            <h2 class="text-lg font-display font-black flex items-center gap-2"><span>🔢</span> COMMENT ÇA FONCTIONNE</h2>
            <button @click="s.how_show = s.how_show === 'true' ? 'false' : 'true'"
              :class="['w-12 h-6 rounded-full transition-all relative flex-shrink-0', s.how_show === 'true' ? 'bg-primary' : 'bg-white/10']">
              <span :class="['absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-all', s.how_show === 'true' ? 'left-6' : 'left-0.5']"></span>
            </button>
          </div>
          <div class="space-y-4 mb-6">
            <div class="space-y-2">
              <label class="settings-label">Titre de la section</label>
              <input v-model="s.how_title" class="input-premium w-full" placeholder="Comment ça fonctionne" />
            </div>
          </div>
          <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div v-for="i in 3" :key="i" class="glass rounded-2xl p-4 border border-white/5 space-y-3">
              <p class="text-[9px] font-black uppercase tracking-widest text-muted">Étape {{ i }}</p>
              <div class="grid grid-cols-3 gap-2">
                <div class="space-y-1">
                  <label class="settings-label">Icône</label>
                  <input v-model="s[`step${i}_icon`]" class="input-premium w-full text-center text-lg" maxlength="4" />
                </div>
                <div class="space-y-1 col-span-2">
                  <label class="settings-label">Titre</label>
                  <input v-model="s[`step${i}_title`]" class="input-premium w-full" />
                </div>
              </div>
              <div class="space-y-1">
                <label class="settings-label">Description</label>
                <input v-model="s[`step${i}_desc`]" class="input-premium w-full" />
              </div>
            </div>
          </div>
        </div>

        <!-- Pricing section -->
        <div class="glass-card p-8 border-t-4 border-accent">
          <div class="flex items-center justify-between mb-6">
            <h2 class="text-lg font-display font-black flex items-center gap-2"><span>💰</span> SECTION TARIFS</h2>
            <button @click="s.pricing_show = s.pricing_show === 'true' ? 'false' : 'true'"
              :class="['w-12 h-6 rounded-full transition-all relative flex-shrink-0', s.pricing_show === 'true' ? 'bg-primary' : 'bg-white/10']">
              <span :class="['absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-all', s.pricing_show === 'true' ? 'left-6' : 'left-0.5']"></span>
            </button>
          </div>
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div class="space-y-2">
              <label class="settings-label">Titre</label>
              <input v-model="s.pricing_title" class="input-premium w-full" placeholder="Nos offres" />
            </div>
            <div class="space-y-2">
              <label class="settings-label">Sous-titre</label>
              <input v-model="s.pricing_subtitle" class="input-premium w-full" placeholder="Choisissez le plan adapté à votre établissement." />
            </div>
          </div>
          <p class="text-[10px] text-muted mt-4">Les plans affichés (Starter, Pro, Enterprise) sont définis dans <strong>Plans & Licences</strong>.</p>
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
                <div class="h-2 rounded-full mt-2 transition-all" :style="{ background: s.primary_color }"></div>
              </div>
              <div class="space-y-2">
                <label class="settings-label">Couleur Secondaire</label>
                <div class="flex gap-2 items-center">
                  <input v-model="s.secondary_color" type="color" class="w-12 h-10 rounded-lg border-none cursor-pointer bg-transparent" />
                  <input v-model="s.secondary_color" class="input-premium flex-1 font-mono" />
                </div>
                <div class="h-2 rounded-full mt-2 transition-all" :style="{ background: s.secondary_color }"></div>
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
              <div class="grid grid-cols-3 gap-3">
                <div v-for="bg in bgOptions" :key="bg.val" @click="s.bg_style = bg.val"
                  :class="['h-16 rounded-xl border cursor-pointer transition-all flex items-end p-2',
                           s.bg_style === bg.val ? 'border-primary shadow-glow' : 'border-color hover:border-white/20']"
                  :style="{ background: bg.preview }">
                  <span :class="['text-[9px] font-black uppercase tracking-widest', s.bg_style === bg.val ? 'text-primary' : 'text-muted']">{{ bg.label }}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Preview -->
        <div class="glass-card p-8 border-t-4 border-primary flex flex-col">
          <h2 class="text-lg font-display font-black mb-6 flex items-center gap-2"><span>👁️</span> APERÇU EN DIRECT</h2>
          <div class="flex-1 rounded-2xl overflow-hidden border border-white/10 p-6 flex flex-col gap-4 min-h-[260px]" :style="{ background: bgPreview, fontFamily: s.font_family }">
            <!-- Mini nav -->
            <div class="flex items-center justify-between pb-3 border-b border-white/10">
              <div class="flex items-center gap-2">
                <img v-if="s.logo" :src="s.logo" class="h-6 object-contain" />
                <span v-else class="text-lg">🍸</span>
                <span class="font-black text-sm uppercase" :style="{ color: s.primary_color }">{{ s.bar_name || 'LE BAR' }}</span>
              </div>
              <div class="flex gap-1">
                <div class="w-12 h-5 rounded-md border border-white/20 bg-white/5"></div>
                <div class="w-14 h-5 rounded-md text-[9px] font-black text-white flex items-center justify-center" :style="{ background: s.primary_color }">CTA</div>
              </div>
            </div>
            <!-- Mini content -->
            <div class="space-y-2 flex-1">
              <div class="h-4 rounded-full w-3/4" :style="{ background: s.primary_color, opacity: 0.75 }"></div>
              <div class="h-3 rounded-full w-2/3" :style="{ background: s.secondary_color, opacity: 0.5 }"></div>
              <div class="h-3 rounded-full w-1/2 bg-white/10"></div>
            </div>
            <div class="flex gap-2">
              <div class="px-4 py-2 rounded-lg text-xs font-black text-white" :style="{ background: s.primary_color }">Primaire</div>
              <div class="px-4 py-2 rounded-lg text-xs font-black text-white" :style="{ background: s.secondary_color }">Secondaire</div>
            </div>
          </div>
          <!-- Color swatch row -->
          <div class="flex gap-2 mt-4">
            <div class="flex-1 h-8 rounded-xl" :style="{ background: s.primary_color }"></div>
            <div class="flex-1 h-8 rounded-xl" :style="{ background: s.secondary_color }"></div>
            <div class="w-8 h-8 rounded-xl bg-accent"></div>
            <div class="w-8 h-8 rounded-xl bg-success"></div>
            <div class="w-8 h-8 rounded-xl bg-danger"></div>
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

      <!-- ══ TAB: PLANS & LICENCES ══ -->
      <div v-show="activeTab === 'plans'" class="space-y-6">
        <div class="glass-card p-8 border-t-4 border-primary flex flex-col md:flex-row items-start md:items-center gap-6 justify-between">
          <div>
            <h2 class="text-lg font-display font-black mb-1 flex items-center gap-2"><span>👑</span> GESTION DES PLANS</h2>
            <p class="text-secondary text-sm">Gérez votre abonnement, activez des licences et contrôlez les fonctionnalités disponibles.</p>
          </div>
          <router-link to="/admin/plans"
            class="btn btn-primary px-8 py-3 font-black tracking-widest uppercase flex items-center gap-2 whitespace-nowrap">
            <span>👑</span> Gérer les plans
          </router-link>
        </div>

        <!-- Quick plan status -->
        <div class="grid grid-cols-1 md:grid-cols-3 gap-5">
          <div class="glass-card p-6">
            <p class="text-[9px] font-black uppercase tracking-widest text-muted mb-3">Plan actif</p>
            <div class="flex items-center gap-3">
              <span class="text-3xl">{{ planStore.plan.icon }}</span>
              <div>
                <p class="font-black text-lg" :style="{ color: planStore.plan.color }">{{ planStore.plan.name }}</p>
                <p class="text-[10px] text-muted">{{ planStore.plan.description }}</p>
              </div>
            </div>
          </div>
          <div class="glass-card p-6">
            <p class="text-[9px] font-black uppercase tracking-widest text-muted mb-3">Statut</p>
            <div class="flex items-center gap-2">
              <div :class="['w-3 h-3 rounded-full', planStore.isActive ? 'bg-success animate-pulse' : 'bg-danger']"></div>
              <span class="font-black text-sm">{{ planStore.statusLabel }}</span>
            </div>
            <p v-if="planStore.daysRemaining !== null" class="text-xs text-muted mt-2">
              {{ planStore.daysRemaining > 0 ? `Expire dans ${planStore.daysRemaining} jour(s)` : 'Expiré' }}
            </p>
          </div>
          <div class="glass-card p-6">
            <p class="text-[9px] font-black uppercase tracking-widest text-muted mb-3">Fonctionnalités</p>
            <p class="text-3xl font-display font-black" :style="{ color: planStore.plan.color }">{{ planStore.plan.features.length }}</p>
            <p class="text-[10px] text-muted mt-1">actives sur ce plan</p>
          </div>
        </div>

        <div class="glass-card p-6 border border-warning/20">
          <p class="text-xs font-bold text-warning flex items-center gap-2">
            <span>💡</span>
            La section Plans & Licences n'est pas affectée par le bouton "Sauvegarder" ci-dessous. Les modifications de plan sont enregistrées directement depuis la page dédiée.
          </p>
        </div>
      </div>

      <!-- Save Button -->
      <div class="mt-10 flex items-center gap-4 flex-wrap" v-show="activeTab !== 'plans'">
        <button @click="saveSettings" :disabled="saving"
          class="btn btn-primary py-4 px-12 text-base font-black tracking-widest shadow-glow uppercase flex gap-3">
          <span v-if="saving" class="animate-spin">🔄</span>
          <span v-else>💾</span>
          {{ saving ? 'SYNCHRONISATION...' : 'SAUVEGARDER' }}
        </button>
        <div v-if="saveSuccess" class="glass p-3 rounded-xl border border-success/20 flex items-center gap-2 animate-fade-in">
          <div class="w-2 h-2 rounded-full bg-success"></div>
          <span class="text-[10px] font-bold text-success uppercase tracking-widest">Sauvegardé avec succès</span>
        </div>
        <div v-else class="glass p-3 rounded-xl border border-white/5 flex items-center gap-2">
          <div class="w-2 h-2 rounded-full bg-muted"></div>
          <span class="text-[10px] font-bold text-muted uppercase tracking-widest">Non sauvegardé</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue';
import api from '@/services/api';
import { useToastStore } from '@/stores/toast';
import { usePlanStore } from '@/stores/plan';
import ImageUploader from '@/components/ImageUploader.vue';

const toast = useToastStore();
const planStore = usePlanStore();
const loading = ref(true);
const saving = ref(false);
const saveSuccess = ref(false);
const activeTab = ref('identity');

const tabDefs = [
  { id: 'identity', label: 'Identité', icon: '🏷️' },
  { id: 'landing', label: "Page d'Accueil", icon: '🌐' },
  { id: 'appearance', label: 'Apparence', icon: '🎨' },
  { id: 'billing', label: 'Facturation', icon: '🧾' },
  { id: 'plans', label: 'Plans & Licences', icon: '👑' },
];

const bgOptions = [
  { label: 'Abyssal', val: 'deep', preview: '#0f0f23' },
  { label: 'Midnight', val: 'black', preview: '#000000' },
  { label: 'Eclipse', val: 'gradient', preview: 'linear-gradient(135deg, #0a0a1a, #1a0a2e)' },
];

const s = reactive({
  bar_name: '', bar_slogan: '', bar_address: '', bar_phone: '', bar_email: '',
  invoice_header: '', currency: 'Ar', currency_symbol: 'Ar',
  primary_color: '#6366f1', secondary_color: '#8b5cf6',
  logo: '', favicon: '',
  nif: '', stat: '', rcs: '',
  font_family: "'Outfit', sans-serif", base_font_size: '14px', bg_style: 'deep',
  hero_badge_text: 'OUVERT MAINTENANT', hero_badge_show: 'true',
  hero_cta1_text: 'Réserver ma table', hero_cta2_text: 'Consulter le menu',
  hero_overlay_opacity: '55', landing_bg_image: '',
  landing_stat1_value: '50+', landing_stat1_label: 'Boissons',
  landing_stat2_value: '100%', landing_stat2_label: 'Satisfaction',
  landing_stat3_value: '24/7', landing_stat3_label: 'Service',
  hero_description: 'Commandez, suivez et payez en temps réel depuis votre table.',
  landing_feat1_icon: '📱', landing_feat1_title: 'Commande en ligne', landing_feat1_desc: 'Commandez depuis votre table via smartphone.',
  landing_feat2_icon: '⚡', landing_feat2_title: 'Service rapide', landing_feat2_desc: 'Traitées instantanément par notre équipe.',
  landing_feat3_icon: '💳', landing_feat3_title: 'Paiement flexible', landing_feat3_desc: 'Espèces, Mobile Money ou carte bancaire.',
  landing_feat4_icon: '📊', landing_feat4_title: 'Suivi en temps réel', landing_feat4_desc: 'Suivez le statut de votre commande.',
  landing_feat5_icon: '🔒', landing_feat5_title: 'Sécurisé', landing_feat5_desc: 'Données protégées, transactions sécurisées.',
  landing_feat6_icon: '🌙', landing_feat6_title: 'Mode nuit', landing_feat6_desc: 'Interface adaptée pour les soirées.',
  landing_stat4_value: '5★', landing_stat4_label: 'Note moyenne',
  how_show: 'true', how_title: 'Comment ça fonctionne',
  step1_icon: '📲', step1_title: 'Scannez & Connectez', step1_desc: 'Scannez le QR code de votre table pour accéder au menu.',
  step2_icon: '🛒', step2_title: 'Choisissez & Commandez', step2_desc: 'Parcourez le menu et ajoutez vos articles au panier.',
  step3_icon: '✅', step3_title: 'Savourez & Payez', step3_desc: 'Profitez de votre commande et réglez en un clic.',
  pricing_show: 'true', pricing_title: 'Nos offres', pricing_subtitle: 'Choisissez le plan adapté à votre établissement.',
  landing_footer_tagline: "L'expérience bar réinventée, à portée de main.",
});

const bgPreview = computed(() => {
  if (s.bg_style === 'black') return '#000000';
  if (s.bg_style === 'gradient') return 'linear-gradient(135deg, #0a0a1a, #1a0a2e)';
  return '#0f0f23';
});

// Normalize hero_badge_show to string 'true'/'false'
const normalizeBadgeShow = (val) => {
  if (val === false || val === 'false') return 'false';
  return 'true';
};

const toggleBadge = () => {
  s.hero_badge_show = s.hero_badge_show === 'true' ? 'false' : 'true';
};

onMounted(async () => {
  try {
    const [{ data }] = await Promise.all([
      api.get('/admin/settings'),
      planStore.load(),
    ]);
    if (data.success) {
      Object.assign(s, data.data.settings);
      s.hero_badge_show = normalizeBadgeShow(s.hero_badge_show);
    }
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
  saveSuccess.value = false;
  try {
    await api.put('/admin/settings', s);
    applyTheme();
    saveSuccess.value = true;
    toast.success('Paramètres synchronisés avec succès');
    setTimeout(() => { saveSuccess.value = false; }, 4000);
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

.shadow-glow {
  box-shadow: 0 4px 20px rgba(99, 102, 241, 0.3);
}
</style>
