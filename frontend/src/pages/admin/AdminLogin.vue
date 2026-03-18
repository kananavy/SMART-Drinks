<template>
  <div class="auth-page">
    <div class="auth-bg"></div>
    <div class="auth-container">
      <router-link to="/" class="back-link">← Retour à l'accueil</router-link>
      <div class="auth-card glass-card">
        <div class="auth-header">
          <span class="auth-icon">🔐</span>
          <h1 class="gradient-text">Administration</h1>
          <p>Connectez-vous pour accéder au panneau</p>
        </div>
        <form @submit.prevent="handleLogin" class="auth-form">
          <div class="input-group">
            <label>Email</label>
            <input v-model="form.email" type="email" class="input-field" placeholder="admin@bar.com" required />
          </div>
          <div class="input-group">
            <label>Mot de passe</label>
            <input v-model="form.password" type="password" class="input-field" placeholder="••••••••" required />
          </div>
          <button type="submit" class="btn btn-primary btn-lg" :disabled="submitting" style="width:100%">
            {{ submitting ? 'Connexion...' : 'Se connecter' }}
          </button>
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
const form = reactive({ email: '', password: '' });

const handleLogin = async () => {
  submitting.value = true;
  try {
    const data = await auth.loginAdmin(form.email, form.password);
    if (data.success) {
      toast.success(`Bienvenue ${data.data.user.name}`);
      router.push('/admin/orders');
    }
  } catch (err) {
    toast.error(err.response?.data?.message || 'Identifiants incorrects');
  } finally {
    submitting.value = false;
  }
};
</script>

<style scoped>
.auth-page { min-height: 100vh; display: flex; align-items: center; justify-content: center; padding: 20px; position: relative; }
.auth-bg { position: absolute; inset: 0; background: radial-gradient(circle at 30% 30%, rgba(99, 102, 241, 0.12), transparent 50%), radial-gradient(circle at 70% 70%, rgba(139, 92, 246, 0.08), transparent 50%); }
.auth-container { position: relative; width: 100%; max-width: 440px; }
.back-link { display: inline-block; color: var(--text-secondary); text-decoration: none; margin-bottom: 20px; font-size: 14px; }
.back-link:hover { color: var(--primary-light); }
.auth-card { padding: 40px; }
.auth-header { text-align: center; margin-bottom: 32px; }
.auth-icon { font-size: 48px; display: block; margin-bottom: 12px; }
.auth-header h1 { font-family: var(--font-display); font-size: 28px; font-weight: 800; margin-bottom: 8px; }
.auth-header p { color: var(--text-secondary); font-size: 14px; }
</style>
