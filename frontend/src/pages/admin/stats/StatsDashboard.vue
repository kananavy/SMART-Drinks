<template>
  <div class="pb-4">
    <!-- Header -->
    <div class="flex items-start justify-between mb-8 flex-wrap gap-4">
      <div>
        <h1 class="text-3xl font-display font-black tracking-tighter">TABLEAU DE BORD</h1>
        <p class="text-secondary text-sm mt-1">Vue d'ensemble des performances en temps reel</p>
      </div>
      <div class="flex items-center gap-3">
        <div class="glass px-4 py-2 rounded-xl border border-white/5 flex items-center gap-2">
          <span class="w-2 h-2 rounded-full bg-success animate-pulse"></span>
          <span class="text-[10px] font-bold uppercase tracking-widest text-muted">Refresh dans <span class="text-primary">{{ Math.floor(countdown / 60) }}:{{ String(countdown % 60).padStart(2, '0') }}</span></span>
        </div>
        <button @click="loadStats" :disabled="loading" class="glass px-4 py-2 rounded-xl border border-white/5 flex items-center gap-2 hover:border-primary/30 transition-all text-xs font-bold text-secondary hover:text-white">
          <span :class="{ 'animate-spin': loading }">🔄</span> Actualiser
        </button>
      </div>
    </div>

    <div v-if="loading" class="flex justify-center py-24"><div class="spinner"></div></div>

    <div v-else>
      <!-- KPI Cards -->
      <div class="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-4 mb-10">
        <div v-for="card in kpiCards" :key="card.label"
          :class="['glass-card p-5 flex flex-col gap-2 border-t-2', card.borderColor]">
          <div class="flex items-center justify-between">
            <span class="text-xl">{{ card.icon }}</span>
            <span :class="['text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full', card.badgeBg, card.badgeColor]">
              {{ card.badge }}
            </span>
          </div>
          <div>
            <p :class="['text-xl font-display font-black leading-tight', card.valueColor]">{{ card.value }}</p>
            <p class="text-[10px] text-muted uppercase tracking-widest font-bold mt-0.5">{{ card.label }}</p>
          </div>
        </div>
      </div>

      <!-- Charts Row -->
      <div class="grid grid-cols-1 xl:grid-cols-3 gap-6 mb-6">
        <!-- Revenue Chart (2/3 width) -->
        <div class="glass-card p-6 xl:col-span-2">
          <div class="flex items-center justify-between mb-6">
            <h3 class="font-display font-black text-base">REVENUS JOURNALIERS</h3>
            <div class="flex gap-1 glass p-1 rounded-xl border border-white/5">
              <button v-for="p in periods" :key="p.val"
                @click="revPeriod = p.val"
                :class="['px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all',
                         revPeriod === p.val ? 'bg-primary text-white' : 'text-muted hover:bg-white/5']">
                {{ p.label }}
              </button>
            </div>
          </div>

          <div v-if="filteredRevenue.length === 0" class="text-center py-8 text-muted text-sm">
            Aucune donnee pour cette periode
          </div>
          <div v-else>
            <!-- Chart bars -->
            <div class="flex items-end gap-1 h-40 mb-3">
              <div
                v-for="(d, i) in filteredRevenue" :key="i"
                class="chart-bar-wrap flex-1 flex flex-col justify-end items-center group cursor-default relative"
              >
                <!-- Tooltip -->
                <div class="chart-tooltip absolute bottom-full mb-2 left-1/2 -translate-x-1/2 z-20 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity">
                  <div class="glass text-[9px] font-bold px-2 py-1 rounded-lg border border-white/10 whitespace-nowrap shadow-lg">
                    {{ formatPrice(d.total) }}
                  </div>
                </div>
                <div
                  class="w-full rounded-t-lg transition-all duration-500 group-hover:brightness-125"
                  :style="{ height: getBarHeight(d.total) + 'px', background: getBarColor(d.total, i) }"
                ></div>
              </div>
            </div>

            <!-- X axis labels -->
            <div class="flex gap-1">
              <div
                v-for="(d, i) in filteredRevenue" :key="i"
                class="flex-1 text-center text-[8px] text-muted font-bold truncate"
              >
                {{ formatChartDate(d.date) }}
              </div>
            </div>

            <!-- Summary -->
            <div class="flex items-center justify-between mt-4 pt-4 border-t border-color">
              <div>
                <p class="text-[10px] text-muted uppercase tracking-widest">Total periode</p>
                <p class="text-lg font-display font-black text-primary">{{ formatPrice(periodTotal) }}</p>
              </div>
              <div class="text-right">
                <p class="text-[10px] text-muted uppercase tracking-widest">Moyenne/jour</p>
                <p class="text-lg font-display font-black text-secondary">{{ formatPrice(periodAvg) }}</p>
              </div>
            </div>
          </div>
        </div>

        <!-- Top Products (1/3 width) -->
        <div class="glass-card p-6">
          <h3 class="font-display font-black text-base mb-5">TOP 10 PRODUITS</h3>
          <div v-if="!stats.topProducts?.length" class="text-center py-8 text-muted text-sm">
            Aucune donnee
          </div>
          <div v-else class="space-y-3">
            <div v-for="(p, i) in stats.topProducts.slice(0, 10)" :key="i" class="flex items-center gap-3">
              <!-- Rank badge -->
              <span :class="['w-6 h-6 rounded-lg flex items-center justify-center text-[10px] font-black flex-shrink-0',
                             i === 0 ? 'bg-accent/20 text-accent' :
                             i === 1 ? 'bg-secondary/20 text-secondary' :
                             i === 2 ? 'bg-info/20 text-info' : 'bg-white/5 text-muted']">
                {{ i + 1 }}
              </span>
              <div class="flex-1 min-w-0">
                <div class="flex items-center justify-between mb-1">
                  <span class="text-xs font-bold truncate">{{ p.Product?.name }}</span>
                  <span class="text-[10px] text-muted ml-2 flex-shrink-0">{{ p.total_quantity || p.dataValues?.total_quantity }} vendus</span>
                </div>
                <div class="h-1.5 rounded-full bg-white/5 overflow-hidden">
                  <div class="h-full rounded-full transition-all duration-700"
                    :style="{ width: getProductBarWidth(p) + '%', background: i === 0 ? 'var(--accent)' : i === 1 ? 'var(--secondary)' : 'var(--primary)' }">
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Bottom row -->
      <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
        <!-- Orders today distribution -->
        <div class="glass-card p-5">
          <h3 class="font-display font-black text-sm mb-4">COMMANDES AUJOURD'HUI</h3>
          <div class="text-center">
            <p class="text-4xl font-display font-black text-primary mb-1">{{ stats.ordersToday || 0 }}</p>
            <p class="text-xs text-muted uppercase tracking-widest">Commandes</p>
          </div>
          <div class="mt-4 pt-4 border-t border-color flex justify-between">
            <div class="text-center">
              <p class="text-lg font-display font-black text-warning">{{ stats.pendingOrders || 0 }}</p>
              <p class="text-[9px] text-muted uppercase tracking-widest">En attente</p>
            </div>
            <div class="text-center">
              <p class="text-lg font-display font-black text-success">{{ (stats.ordersToday || 0) - (stats.pendingOrders || 0) }}</p>
              <p class="text-[9px] text-muted uppercase tracking-widest">Traitees</p>
            </div>
          </div>
        </div>

        <!-- Revenue today -->
        <div class="glass-card p-5">
          <h3 class="font-display font-black text-sm mb-4">REVENU AUJOURD'HUI</h3>
          <p class="text-3xl font-display font-black text-success mb-1">{{ formatPrice(stats.revenueToday || 0) }}</p>
          <p class="text-xs text-muted uppercase tracking-widest">Encaisse</p>
          <div class="mt-4 pt-4 border-t border-color">
            <p class="text-[9px] text-muted uppercase tracking-widest mb-1">Ce mois</p>
            <p class="text-xl font-display font-black text-primary">{{ formatPrice(stats.revenueMonth || 0) }}</p>
          </div>
        </div>

        <!-- Stock alerts -->
        <div class="glass-card p-5">
          <h3 class="font-display font-black text-sm mb-4">ALERTES STOCK</h3>
          <div :class="['text-center', stats.lowStock > 0 ? '' : 'opacity-50']">
            <p :class="['text-4xl font-display font-black mb-1', stats.lowStock > 0 ? 'text-danger' : 'text-success']">
              {{ stats.lowStock || 0 }}
            </p>
            <p class="text-xs text-muted uppercase tracking-widest">
              {{ stats.lowStock > 0 ? 'Produits en rupture ou quasi-rupture' : 'Tous les stocks OK' }}
            </p>
          </div>
          <div class="mt-4 pt-4 border-t border-color flex items-center gap-2">
            <div :class="['w-2 h-2 rounded-full flex-shrink-0', stats.lowStock > 0 ? 'bg-danger animate-pulse' : 'bg-success']"></div>
            <p class="text-[10px] text-muted">{{ stats.lowStock > 0 ? 'Action recommandee' : 'Aucune action requise' }}</p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue';
import api from '@/services/api';
import { useToastStore } from '@/stores/toast';

const toast = useToastStore();
const stats = ref({});
const loading = ref(true);
const revPeriod = ref(30);
const countdown = ref(300);
let refreshInterval = null;
let countdownInterval = null;

const periods = [
  { val: 7, label: '7J' },
  { val: 15, label: '15J' },
  { val: 30, label: '30J' },
];

const formatPrice = (p) => new Intl.NumberFormat('fr-FR').format(Math.round(p || 0)) + ' Ar';
const formatChartDate = (dateStr) => {
  if (!dateStr) return '';
  const d = new Date(dateStr);
  return `${d.getDate()}/${d.getMonth() + 1}`;
};

const kpiCards = computed(() => [
  {
    icon: '💰', label: "Revenu aujourd'hui", value: formatPrice(stats.value.revenueToday || 0),
    valueColor: 'text-success', borderColor: 'border-success',
    badge: 'Jour', badgeBg: 'bg-success/10', badgeColor: 'text-success',
  },
  {
    icon: '📅', label: 'Revenu du mois', value: formatPrice(stats.value.revenueMonth || 0),
    valueColor: 'text-primary', borderColor: 'border-primary',
    badge: 'Mois', badgeBg: 'bg-primary/10', badgeColor: 'text-primary',
  },
  {
    icon: '📋', label: "Commandes aujourd'hui", value: stats.value.ordersToday || 0,
    valueColor: 'text-info', borderColor: 'border-info',
    badge: 'Jour', badgeBg: 'bg-info/10', badgeColor: 'text-info',
  },
  {
    icon: '⏳', label: 'En attente', value: stats.value.pendingOrders || 0,
    valueColor: 'text-warning', borderColor: 'border-warning',
    badge: 'Live', badgeBg: 'bg-warning/10', badgeColor: 'text-warning',
  },
  {
    icon: '👥', label: 'Utilisateurs', value: stats.value.totalUsers || 0,
    valueColor: 'text-secondary', borderColor: 'border-secondary',
    badge: 'Total', badgeBg: 'bg-secondary/10', badgeColor: 'text-secondary',
  },
  {
    icon: '⚠️', label: 'Stock bas', value: stats.value.lowStock || 0,
    valueColor: stats.value.lowStock > 0 ? 'text-danger' : 'text-success',
    borderColor: stats.value.lowStock > 0 ? 'border-danger' : 'border-success',
    badge: 'Alerte', badgeBg: stats.value.lowStock > 0 ? 'bg-danger/10' : 'bg-success/10',
    badgeColor: stats.value.lowStock > 0 ? 'text-danger' : 'text-success',
  },
]);

const allRevenue = computed(() => {
  if (!stats.value.dailyRevenue) return [];
  return stats.value.dailyRevenue.map(d => ({
    date: d.dataValues?.date || d.date,
    total: parseFloat(d.dataValues?.total || d.total || 0),
    count: parseInt(d.dataValues?.count || d.count || 0),
  }));
});

const filteredRevenue = computed(() => {
  const all = allRevenue.value;
  return revPeriod.value >= all.length ? all : all.slice(all.length - revPeriod.value);
});

const maxRevenue = computed(() => Math.max(...filteredRevenue.value.map(d => d.total), 1));
const periodTotal = computed(() => filteredRevenue.value.reduce((s, d) => s + d.total, 0));
const periodAvg = computed(() => filteredRevenue.value.length ? periodTotal.value / filteredRevenue.value.length : 0);

const getBarHeight = (total) => {
  const MAX_H = 140;
  const MIN_H = 4;
  return total === 0 ? MIN_H : Math.max(MIN_H, (total / maxRevenue.value) * MAX_H);
};

const getBarColor = (total) => {
  const ratio = total / maxRevenue.value;
  if (ratio > 0.8) return 'linear-gradient(to top, #6366f1, #818cf8)';
  if (ratio > 0.5) return 'linear-gradient(to top, #8b5cf6, #a78bfa)';
  return 'rgba(99, 102, 241, 0.4)';
};

const maxProductQty = computed(() => {
  if (!stats.value.topProducts?.length) return 1;
  return Math.max(...stats.value.topProducts.map(p => parseInt(p.total_quantity || p.dataValues?.total_quantity || 0)));
});

const getProductBarWidth = (p) => {
  const qty = parseInt(p.total_quantity || p.dataValues?.total_quantity || 0);
  return maxProductQty.value > 0 ? (qty / maxProductQty.value) * 100 : 0;
};

const loadStats = async () => {
  loading.value = true;
  try {
    const { data } = await api.get('/admin/statistics');
    if (data.success) stats.value = data.data;
  } catch {
    toast.error('Erreur chargement statistiques');
  } finally {
    loading.value = false;
  }
};

const startAutoRefresh = () => {
  refreshInterval = setInterval(() => {
    loadStats();
    countdown.value = 300;
  }, 300000); // 5 minutes
  countdownInterval = setInterval(() => {
    countdown.value--;
    if (countdown.value <= 0) countdown.value = 300;
  }, 1000);
};

onMounted(() => {
  loadStats();
  startAutoRefresh();
});

onUnmounted(() => {
  clearInterval(refreshInterval);
  clearInterval(countdownInterval);
});
</script>

<style scoped>
.chart-bar-wrap {
  min-height: 4px;
}
.chart-tooltip {
  filter: drop-shadow(0 4px 12px rgba(0,0,0,0.4));
}
</style>
