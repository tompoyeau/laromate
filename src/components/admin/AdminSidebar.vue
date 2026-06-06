<template>
  <aside class="sidebar" :class="{ collapsed: collapsed }">
    <div class="sidebar-header">
      <div v-if="!collapsed" class="sidebar-brand">
        <div class="brand-icon">🍔</div>
        <div class="brand-text">
          <div class="brand-name">L'Aromate</div>
          <div class="brand-role">Administration</div>
        </div>
      </div>
      <div v-else class="brand-icon">🍔</div>
      <button class="collapse-btn" @click="$emit('toggle')" :title="collapsed ? 'Développer' : 'Réduire'">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <polyline :points="collapsed ? '9 18 15 12 9 6' : '15 18 9 12 15 6'"/>
        </svg>
      </button>
    </div>

    <nav class="sidebar-nav">
      <div v-for="section in navSections" :key="section.label">
        <div v-if="!collapsed" class="nav-section-label">{{ section.label }}</div>
        <button
          v-for="item in section.items"
          :key="item.id"
          :class="['nav-item', { active: activePanel === item.id }]"
          @click="$emit('navigate', item.id)"
          :title="collapsed ? item.label : ''"
        >
          <span class="nav-icon">{{ item.icon }}</span>
          <span v-if="!collapsed" class="nav-label">{{ item.label }}</span>
          <span v-if="!collapsed && item.badge" class="nav-badge">{{ item.badge }}</span>
        </button>
      </div>
    </nav>

    <div class="sidebar-footer">
      <button class="nav-item nav-item-footer" @click="goPublic" :title="collapsed ? 'Voir le site' : ''">
        <span class="nav-icon">🌐</span>
        <span v-if="!collapsed">Voir le site</span>
      </button>
      <button class="nav-item nav-item-danger" @click="$emit('logout')" :title="collapsed ? 'Déconnexion' : ''">
        <span class="nav-icon">🚪</span>
        <span v-if="!collapsed">Déconnexion</span>
      </button>
    </div>
  </aside>
</template>

<script setup>
import { useRouter } from 'vue-router'
import { useReservationsStore } from '@/stores/reservations.js'
import { useReviewsStore } from '@/stores/reviews.js'
import { computed } from 'vue'

const props = defineProps({
  activePanel: String,
  collapsed: Boolean
})

defineEmits(['navigate', 'logout', 'toggle'])

const router = useRouter()
const reservations = useReservationsStore()
const reviews = useReviewsStore()

function goPublic() {
  window.open(router.resolve('/').href, '_blank')
}

const navSections = computed(() => [
  {
    label: 'Tableau de bord',
    items: [
      { id: 'dashboard', icon: '📊', label: 'Vue d\'ensemble' }
    ]
  },
  {
    label: 'Contenu',
    items: [
      { id: 'menu', icon: '🍔', label: 'La Carte' },
      { id: 'gallery', icon: '📸', label: 'Galerie' },
      { id: 'promotions', icon: '🎉', label: 'Offres & Promos' },
    ]
  },
  {
    label: 'Clients',
    items: [
      {
        id: 'reservations',
        icon: '📅',
        label: 'Réservations',
        badge: reservations.pending.length || null
      },
      {
        id: 'reviews',
        icon: '⭐',
        label: 'Avis clients',
        badge: reviews.pending.length || null
      },
    ]
  },
  {
    label: 'Paramètres',
    items: [
      { id: 'theme', icon: '🎨', label: 'Thème & Identité' },
      { id: 'qrcode', icon: '📱', label: 'QR Code' },
      { id: 'info', icon: '🏪', label: 'Infos restaurant' },
      { id: 'password', icon: '🔐', label: 'Mot de passe' },
    ]
  }
])
</script>

<style scoped>
.sidebar {
  width: 240px;
  background: var(--bg-card);
  border-right: 1px solid var(--border);
  display: flex;
  flex-direction: column;
  height: 100vh;
  position: sticky;
  top: 0;
  overflow-y: auto;
  transition: width 0.25s ease;
  flex-shrink: 0;
}

.sidebar.collapsed { width: 64px; }

.sidebar-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1.25rem;
  border-bottom: 1px solid var(--border);
  min-height: 72px;
}

.sidebar-brand { display: flex; align-items: center; gap: 0.75rem; overflow: hidden; }
.brand-icon { font-size: 1.4rem; flex-shrink: 0; }
.brand-name { font-family: var(--font-heading); font-size: 0.95rem; white-space: nowrap; }
.brand-role { font-size: 0.72rem; color: var(--text-muted); white-space: nowrap; }

.collapse-btn {
  padding: 0.3rem;
  border-radius: var(--radius-sm);
  color: var(--text-muted);
  transition: all 0.2s;
  flex-shrink: 0;
}
.collapse-btn:hover { background: var(--border); color: var(--text); }

.sidebar-nav {
  flex: 1;
  padding: 0.75rem 0;
  overflow-y: auto;
}

.nav-section-label {
  font-size: 0.68rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.1em;
  color: var(--text-muted);
  padding: 0.75rem 1.25rem 0.35rem;
}

.nav-item {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  width: 100%;
  padding: 0.65rem 1.25rem;
  font-size: 0.88rem;
  color: var(--text-light);
  font-family: var(--font-body);
  font-weight: 500;
  transition: all 0.15s;
  cursor: pointer;
  text-align: left;
  position: relative;
  white-space: nowrap;
}

.nav-item:hover { background: var(--bg); color: var(--text); }

.nav-item.active {
  background: rgba(107, 124, 92, 0.1);
  color: var(--primary);
}

.nav-item.active::before {
  content: '';
  position: absolute;
  left: 0; top: 0; bottom: 0;
  width: 3px;
  background: var(--primary);
  border-radius: 0 2px 2px 0;
}

.nav-icon { font-size: 1rem; width: 20px; text-align: center; flex-shrink: 0; }
.nav-label { flex: 1; overflow: hidden; text-overflow: ellipsis; }

.nav-badge {
  background: var(--accent);
  color: #fff;
  font-size: 0.68rem;
  font-weight: 700;
  padding: 0.1rem 0.4rem;
  border-radius: 99px;
  min-width: 18px;
  text-align: center;
}

.sidebar-footer {
  border-top: 1px solid var(--border);
  padding: 0.5rem 0;
}

.nav-item-footer { color: var(--primary); }
.nav-item-danger { color: #dc2626; }
.nav-item-danger:hover { background: #fee2e2; }
</style>
