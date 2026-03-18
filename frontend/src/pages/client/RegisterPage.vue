<template>
  <div class="auth-page">
    <div class="auth-bg"></div>
    <div class="auth-container">
      <router-link to="/" class="back-link">← Retour</router-link>
      <div class="auth-card glass-card">
        <div class="auth-header">
          <span class="auth-icon">🍸</span>
          <h1 class="gradient-text">Inscription</h1>
          <p>Réservez votre table pour commander</p>
        </div>
        <form @submit.prevent="handleRegister" class="auth-form">
          <div class="input-group">
            <label>Nom de la table *</label>
            <input v-model="form.table_name" type="text" class="input-field" placeholder="Ex: VIP 1, Las Vegas, Table 5" required />
          </div>
          <div class="input-group">
            <label>Contact *</label>
            <input v-model="form.contact" type="text" class="input-field" placeholder="Numéro de téléphone" required />
          </div>
          <div class="form-row">
            <div class="input-group">
              <label>Date de début *</label>
              <input v-model="form.start_date" type="date" class="input-field" required />
            </div>
            <div class="input-group">
              <label>Heure de début *</label>
              <input v-model="form.start_time" type="time" class="input-field" required />
            </div>
          </div>
          <div class="input-group">
            <label>Nombre de personnes</label>
            <input v-model.number="form.persons" type="number" class="input-field" placeholder="Optionnel" min="1" />
          </div>
          <button type="submit" class="btn btn-primary btn-lg" :disabled="submitting" style="width:100%">
            {{ submitting ? 'Inscription...' : 'S\'inscrire' }}
          </button>
          <p class="auth-footer">
            Déjà inscrit ? <router-link to="/login">Se connecter</router-link>
          </p>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '@/stores/auth';
import { useToastStore } from '@/stores/toast';

const router = useRouter();
const auth = useAuthStore();
const toast = useToastStore();
const submitting = ref(false);

const today = new Date().toISOString().split('T')[0];
const now = new Date().toTimeString().slice(0, 5);

const form = reactive({
  table_name: '',
  contact: '',
  start_date: today,
  start_time: now,
  persons: null,
});

const handleRegister = async () => {
  submitting.value = true;
  try {
    const data = await auth.registerClient(form);
    if (data.success) {
      toast.success(`Inscription réussie ! Code d'accès: ${data.data.session.access_code}`);
      router.push('/client/menu');
    }
  } catch (err) {
    toast.error(err.response?.data?.message || 'Erreur lors de l\'inscription');
  } finally {
    submitting.value = false;
  }
};
</script>

<style scoped>
.auth-page {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
  position: relative;
}
.auth-bg {
  position: absolute;
  inset: 0;
  background: radial-gradient(circle at 30% 30%, rgba(99, 102, 241, 0.12), transparent 50%),
              radial-gradient(circle at 70% 70%, rgba(139, 92, 246, 0.08), transparent 50%);
}
.auth-container { position: relative; width: 100%; max-width: 480px; }
.back-link {
  display: inline-block;
  color: var(--text-secondary);
  text-decoration: none;
  margin-bottom: 20px;
  font-size: 14px;
  transition: color 0.2s;
}
.back-link:hover { color: var(--primary-light); }
.auth-card { padding: 40px; }
.auth-header {
  text-align: center;
  margin-bottom: 32px;
}
.auth-icon { font-size: 48px; display: block; margin-bottom: 12px; }
.auth-header h1 {
  font-family: var(--font-display);
  font-size: 28px;
  font-weight: 800;
  margin-bottom: 8px;
}
.auth-header p { color: var(--text-secondary); font-size: 14px; }
.form-row { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }
.auth-footer {
  text-align: center;
  margin-top: 20px;
  font-size: 14px;
  color: var(--text-secondary);
}
.auth-footer a { color: var(--primary-light); text-decoration: none; }
</style>
