import { createApp } from 'vue'
import { createPinia } from 'pinia'
import router from './router'
import App from './App.vue'
import './style.css'
import { vCan, vCannot } from '@/directives/can'

const app = createApp(App)
const pinia = createPinia()
app.use(pinia)
app.use(router)
app.directive('can', vCan)
app.directive('cannot', vCannot)

// Restore cached permissions for existing sessions (after pinia is set up)
import('@/stores/auth').then(({ useAuthStore }) => {
  const auth = useAuthStore()
  auth.initializePermissions()
})

app.mount('#app')
