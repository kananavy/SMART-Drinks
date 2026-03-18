<template>
  <div class="stats-page">
    <h1>📊 Statistiques</h1>
    <div v-if="loading" class="loading-center"><div class="spinner"></div></div>
    <div v-else>
      <div class="stats-cards">
        <div class="stat glass-card" v-for="s in cards" :key="s.label">
          <span class="s-icon">{{ s.icon }}</span>
          <span class="s-value">{{ s.value }}</span>
          <span class="s-label">{{ s.label }}</span>
        </div>
      </div>
      <div class="charts-grid">
        <div class="chart-card glass-card">
          <h3>Top 10 Produits</h3>
          <div class="top-list">
            <div v-for="(p,i) in stats.topProducts" :key="i" class="top-item">
              <span class="rank">#{{ i+1 }}</span>
              <span class="name">{{ p.Product?.name }}</span>
              <span class="qty">{{ p.dataValues?.total_quantity || p.total_quantity }} vendus</span>
            </div>
          </div>
        </div>
        <div class="chart-card glass-card">
          <h3>Revenus (30 jours)</h3>
          <div class="rev-list">
            <div v-for="d in stats.dailyRevenue" :key="d.dataValues?.date||d.date" class="rev-item">
              <span>{{ d.dataValues?.date || d.date }}</span>
              <span class="rev-amount">{{ formatPrice(d.dataValues?.total || d.total) }}</span>
              <div class="rev-bar" :style="{width: getBarWidth(d)+'%'}"></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
<script setup>
import { ref, computed, onMounted } from 'vue';
import api from '@/services/api';
import { useToastStore } from '@/stores/toast';
const toast = useToastStore();
const stats = ref({});
const loading = ref(true);
const formatPrice = (p) => new Intl.NumberFormat('fr-FR').format(p)+' Ar';

const cards = computed(() => [
  { icon:'👥', value:stats.value.totalUsers||0, label:'Utilisateurs' },
  { icon:'📋', value:stats.value.ordersToday||0, label:'Commandes aujourd\'hui' },
  { icon:'💰', value:formatPrice(stats.value.revenueToday||0), label:'Revenu aujourd\'hui' },
  { icon:'📅', value:formatPrice(stats.value.revenueMonth||0), label:'Revenu du mois' },
  { icon:'⏳', value:stats.value.pendingOrders||0, label:'Commandes en attente' },
  { icon:'⚠️', value:stats.value.lowStock||0, label:'Stock bas' },
]);

const maxRev = computed(() => {
  if (!stats.value.dailyRevenue?.length) return 1;
  return Math.max(...stats.value.dailyRevenue.map(d => parseFloat(d.dataValues?.total||d.total||0)));
});
const getBarWidth = (d) => {
  const val = parseFloat(d.dataValues?.total||d.total||0);
  return maxRev.value > 0 ? (val/maxRev.value)*100 : 0;
};

onMounted(async () => {
  try {
    const { data } = await api.get('/admin/statistics');
    if (data.success) stats.value = data.data;
  } catch(e) { toast.error('Erreur chargement stats'); }
  finally { loading.value = false; }
});
</script>
<style scoped>
.stats-page h1{font-family:var(--font-display);font-size:28px;font-weight:800;margin-bottom:24px}
.loading-center{display:flex;justify-content:center;padding:60px}
.stats-cards{display:grid;grid-template-columns:repeat(auto-fill,minmax(180px,1fr));gap:16px;margin-bottom:30px}
.stat{padding:20px;text-align:center;display:flex;flex-direction:column;gap:4px}
.s-icon{font-size:28px}
.s-value{font-size:24px;font-weight:800;color:var(--primary-light);font-family:var(--font-display)}
.s-label{font-size:12px;color:var(--text-muted)}
.charts-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(400px,1fr));gap:20px}
.chart-card{padding:24px}
.chart-card h3{font-size:16px;font-weight:700;margin-bottom:16px}
.top-list,.rev-list{display:flex;flex-direction:column;gap:8px}
.top-item{display:flex;align-items:center;gap:12px;font-size:13px}
.rank{font-weight:800;color:var(--accent);min-width:30px}
.name{flex:1}
.qty{color:var(--text-muted);font-size:12px}
.rev-item{display:flex;align-items:center;gap:12px;font-size:13px;position:relative}
.rev-amount{font-weight:600;color:var(--primary-light);min-width:100px;text-align:right}
.rev-bar{position:absolute;left:0;bottom:-2px;height:2px;background:var(--primary);border-radius:2px;transition:width .3s}
</style>
