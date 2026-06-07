<template>
  <!-- Login Screen -->
  <div v-if="!auth.isAuthenticated" class="login-screen">
    <div class="login-card">
      <div class="login-logo">🍔</div>
      <h1 class="login-title">Administration</h1>
      <p class="login-sub">L'Aromate — Espace réservé</p>

      <div v-if="lockMsg" class="login-error lock-error">🔒 {{ lockMsg }}</div>

      <form @submit.prevent="doLogin" class="login-form">
        <div class="form-group">
          <label class="form-label">Mot de passe</label>
          <div class="pass-wrap">
            <input
              v-model="password"
              :type="showPass ? 'text' : 'password'"
              class="form-input"
              placeholder="••••••••"
              autofocus
              ref="passInput"
            />
            <button type="button" class="show-pass" @click="showPass = !showPass">
              {{ showPass ? '🙈' : '👁' }}
            </button>
          </div>
        </div>
        <div v-if="loginError" class="login-error">{{ loginError }}</div>
        <button type="submit" class="btn btn-primary btn-full" :disabled="loading">
          <svg v-if="loading" class="spin" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 12a9 9 0 1 1-6.219-8.56"/></svg>
          {{ loading ? 'Vérification…' : 'Se connecter' }}
        </button>
      </form>
      <p class="login-hint">3 tentatives incorrectes = blocage 5 min</p>
    </div>
  </div>

  <!-- Admin App -->
  <div v-else class="admin-app">
    <AdminSidebar
      :active-panel="activePanel"
      :collapsed="sidebarCollapsed"
      @navigate="navigate"
      @logout="doLogout"
      @toggle="sidebarCollapsed = !sidebarCollapsed"
    />

    <div class="admin-content">
      <header class="admin-header">
        <div class="header-left">
          <button class="hamburger-admin" @click="sidebarCollapsed = !sidebarCollapsed">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/></svg>
          </button>
          <h2 class="header-title">{{ PANEL_TITLES[activePanel] }}</h2>
        </div>
        <div class="header-right">
          <RouterLink to="/" target="_blank" class="btn btn-ghost btn-sm">
            🌐 Voir le site
          </RouterLink>
          <button class="btn btn-ghost btn-sm" @click="doLogout">Déconnexion</button>
        </div>
      </header>

      <main class="admin-main">
        <component
          :is="currentPanel"
          @navigate="navigate"
        />
      </main>
    </div>

    <AppToast />
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useAuthStore } from '@/stores/auth.js'
import { useToast } from '@/composables/useToast.js'
import AdminSidebar from '@/components/admin/AdminSidebar.vue'
import AppToast from '@/components/ui/AppToast.vue'

// Panels
import DashboardPanel from '@/components/admin/panels/DashboardPanel.vue'
import MenuPanel from '@/components/admin/panels/MenuPanel.vue'
import GalleryPanel from '@/components/admin/panels/GalleryPanel.vue'
import ReservationsPanel from '@/components/admin/panels/ReservationsPanel.vue'
import ReviewsPanel from '@/components/admin/panels/ReviewsPanel.vue'
import ThemePanel from '@/components/admin/panels/ThemePanel.vue'
import PromotionsPanel from '@/components/admin/panels/PromotionsPanel.vue'
import QRCodePanel from '@/components/admin/panels/QRCodePanel.vue'
import InfoPanel from '@/components/admin/panels/InfoPanel.vue'
import PasswordPanel from '@/components/admin/panels/PasswordPanel.vue'
import GoogleReviewsPanel from '@/components/admin/panels/GoogleReviewsPanel.vue'

const auth = useAuthStore()
const { success, error: toastError } = useToast()

const activePanel = ref('dashboard')
const sidebarCollapsed = ref(false)
const password = ref('')
const loginError = ref('')
const lockMsg = ref('')
const loading = ref(false)
const showPass = ref(false)

const PANELS = {
  dashboard: DashboardPanel,
  menu: MenuPanel,
  gallery: GalleryPanel,
  reservations: ReservationsPanel,
  reviews: ReviewsPanel,
  theme: ThemePanel,
  promotions: PromotionsPanel,
  qrcode: QRCodePanel,
  info: InfoPanel,
  password: PasswordPanel,
  google: GoogleReviewsPanel,
}

const PANEL_TITLES = {
  dashboard: 'Vue d\'ensemble',
  menu: 'La Carte',
  gallery: 'Galerie photos',
  reservations: 'Réservations',
  reviews: 'Avis clients',
  theme: 'Thème & Identité',
  promotions: 'Offres & Promotions',
  qrcode: 'QR Code',
  info: 'Informations du restaurant',
  password: 'Mot de passe',
  google: 'Google Reviews',
}

const currentPanel = computed(() => PANELS[activePanel.value] || DashboardPanel)

function navigate(panel) { activePanel.value = panel }

onMounted(() => {
  // Check lockout on mount
  const lock = auth.getLockout()
  if (lock) {
    const mins = Math.ceil((lock.until - Date.now()) / 60000)
    lockMsg.value = `Compte bloqué. Réessayez dans ${mins} min.`
  }
  // Auto-login from session
  auth.checkSession()
})

async function doLogin() {
  loading.value = true
  loginError.value = ''
  const res = await auth.login(password.value)
  loading.value = false

  if (!res.success) {
    loginError.value = res.error
    // Recheck lockout
    const lock = auth.getLockout()
    if (lock) {
      const mins = Math.ceil((lock.until - Date.now()) / 60000)
      lockMsg.value = `Compte bloqué. Réessayez dans ${mins} min.`
    }
  } else {
    password.value = ''
  }
}

function doLogout() {
  auth.logout()
}
</script>

<style scoped>
/* ── LOGIN ── */
.login-screen {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--bg);
  padding: 1rem;
}

.login-card {
  background: var(--bg-card);
  border-radius: var(--radius-lg);
  padding: 2.5rem;
  width: 100%;
  max-width: 400px;
  box-shadow: var(--shadow-lg);
  border: 1px solid var(--border);
  text-align: center;
}

.login-logo { font-size: 2.5rem; margin-bottom: 0.75rem; }
.login-title { font-family: var(--font-heading); font-size: 1.6rem; margin-bottom: 0.3rem; }
.login-sub { color: var(--text-light); font-size: 0.88rem; margin-bottom: 2rem; }

.login-form { text-align: left; }

.pass-wrap { position: relative; }
.show-pass {
  position: absolute;
  right: 0.75rem;
  top: 50%; transform: translateY(-50%);
  font-size: 1rem;
  cursor: pointer;
  background: none; border: none;
}

.login-error {
  background: #fee2e2;
  color: #dc2626;
  padding: 0.6rem 0.85rem;
  border-radius: var(--radius-sm);
  font-size: 0.85rem;
  margin-bottom: 1rem;
  text-align: left;
}

.lock-error { background: #fff3cd; color: #856404; margin-bottom: 0; margin-top: 0; margin-bottom: 1rem; }

.login-hint { font-size: 0.75rem; color: var(--text-muted); margin-top: 1rem; }

.spin { animation: spin 0.8s linear infinite; }
@keyframes spin { to { transform: rotate(360deg); } }

/* ── ADMIN APP ── */
.admin-app {
  display: flex;
  min-height: 100vh;
  background: var(--bg);
}

.admin-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  min-width: 0;
}

.admin-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1rem 1.5rem;
  background: var(--bg-card);
  border-bottom: 1px solid var(--border);
  position: sticky;
  top: 0;
  z-index: 100;
  gap: 1rem;
}

.header-left { display: flex; align-items: center; gap: 0.75rem; }

.hamburger-admin {
  color: var(--text-light);
  padding: 0.35rem;
  border-radius: var(--radius-sm);
  display: none;
}

.hamburger-admin:hover { background: var(--border); }

.header-title { font-family: var(--font-heading); font-size: 1.1rem; }

.header-right { display: flex; align-items: center; gap: 0.5rem; }

.admin-main { flex: 1; padding: 1.5rem; max-width: 1200px; width: 100%; }

@media (max-width: 768px) {
  .hamburger-admin { display: flex; }
  .header-right .btn:first-child { display: none; }
}
</style>
