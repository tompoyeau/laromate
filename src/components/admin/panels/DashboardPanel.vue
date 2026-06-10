<template>
  <div class="dashboard">
    <h2 class="panel-title">Vue d'ensemble</h2>

    <div class="stats-grid">
      <div class="stat-card card" v-for="s in stats" :key="s.label">
        <div class="stat-icon" :style="{ background: s.color + '20', color: s.color }">{{ s.icon }}</div>
        <div class="stat-value">{{ s.value }}</div>
        <div class="stat-label">{{ s.label }}</div>
      </div>
    </div>

    <div class="dash-grid">
      <!-- Today's reservations -->
      <div class="card dash-card">
        <div class="card-title">
          📅 Réservations du jour
          <span class="pill">{{ reservations.today.length }}</span>
        </div>
        <div v-if="reservations.today.length" class="res-list">
          <div v-for="r in reservations.today" :key="r.id" class="res-item">
            <div class="res-info">
              <div class="res-name">{{ r.name }}</div>
              <div class="res-meta">{{ r.time }} · {{ r.covers }} couvert(s)</div>
            </div>
            <span :class="['status', `status-${r.status}`]">{{ STATUS_LABELS[r.status] }}</span>
          </div>
        </div>
        <p v-else class="empty-state">Aucune réservation aujourd'hui</p>
      </div>

      <!-- Quick actions -->
      <div class="card dash-card">
        <div class="card-title">⚡ Actions rapides</div>
        <div class="quick-actions">
          <button class="qa-btn" @click="$emit('navigate', 'reservations')">
            <span class="qa-icon">📅</span>
            <span>Gérer les réservations</span>
          </button>
          <button class="qa-btn" @click="$emit('navigate', 'menu')">
            <span class="qa-icon">🍔</span>
            <span>Modifier la carte</span>
          </button>
          <button class="qa-btn" @click="$emit('navigate', 'theme')">
            <span class="qa-icon">🎨</span>
            <span>Personnaliser le thème</span>
          </button>
          <button class="qa-btn" @click="$emit('navigate', 'gallery')">
            <span class="qa-icon">📸</span>
            <span>Gérer la galerie</span>
          </button>
          <button class="qa-btn" @click="$emit('navigate', 'qrcode')">
            <span class="qa-icon">📱</span>
            <span>QR Code du menu</span>
          </button>
          <button class="qa-btn" @click="$emit('navigate', 'promotions')">
            <span class="qa-icon">🎉</span>
            <span>Gérer les offres</span>
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useReservationsStore } from '@/stores/reservations.js'
import { useMenuStore } from '@/stores/menu.js'

defineEmits(['navigate'])

const reservations = useReservationsStore()
const menu = useMenuStore()

const STATUS_LABELS = { pending: 'En attente', confirmed: 'Confirmé', cancelled: 'Annulé', noshow: 'No-show' }

const stats = computed(() => [
  {
    icon: '📅',
    label: "Résa aujourd'hui",
    value: reservations.today.length,
    color: '#6b7c5c'
  },
  {
    icon: '🗓️',
    label: 'Résa cette semaine',
    value: reservations.thisWeek.length,
    color: '#8b9d77'
  },
  {
    icon: '🍽️',
    label: 'Plats au menu',
    value: menu.totalItems,
    color: '#7c6b5c'
  },
  {
    icon: '⏳',
    label: 'Résa en attente',
    value: reservations.pending.length,
    color: '#856404'
  },
])
</script>

<style scoped>
.panel-title { font-family: var(--font-heading); font-size: 1.6rem; margin-bottom: 2rem; }

.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
  gap: 1rem;
  margin-bottom: 1.5rem;
}

.stat-card {
  padding: 1.25rem;
  display: flex;
  flex-direction: column;
  gap: 0.4rem;
}

.stat-icon { width: 40px; height: 40px; border-radius: var(--radius-sm); display: flex; align-items: center; justify-content: center; font-size: 1.2rem; margin-bottom: 0.25rem; }
.stat-value { font-size: 1.8rem; font-weight: 700; font-family: var(--font-heading); color: var(--text); }
.stat-label { font-size: 0.8rem; color: var(--text-light); }

.dash-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1.25rem;
}

.dash-card { padding: 1.25rem; }

.card-title {
  font-weight: 600;
  font-size: 0.95rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-bottom: 1rem;
  padding-bottom: 0.75rem;
  border-bottom: 1px solid var(--border);
}

.pill {
  background: var(--primary);
  color: #fff;
  font-size: 0.72rem;
  padding: 0.15rem 0.5rem;
  border-radius: 99px;
  margin-left: auto;
}

.pill-accent { background: #c9a96e; }

.res-list, .rev-list { display: flex; flex-direction: column; gap: 0.75rem; }

.res-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.6rem 0.75rem;
  background: var(--bg);
  border-radius: var(--radius-sm);
  font-size: 0.88rem;
}

.res-name { font-weight: 500; }
.res-meta { color: var(--text-light); font-size: 0.8rem; }

.rev-item {
  padding: 0.75rem;
  background: var(--bg);
  border-radius: var(--radius-sm);
  font-size: 0.88rem;
}

.rev-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.35rem; }
.rev-author { font-weight: 500; }
.rev-text { color: var(--text-light); margin-bottom: 0.5rem; font-size: 0.83rem; line-height: 1.4; }
.rev-actions { display: flex; gap: 0.4rem; }

.empty-state { color: var(--text-muted); font-style: italic; font-size: 0.88rem; padding: 0.5rem 0; }

.quick-actions {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 0.5rem;
}

.qa-btn {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem;
  background: var(--bg);
  border-radius: var(--radius-sm);
  font-size: 0.83rem;
  font-family: var(--font-body);
  color: var(--text);
  font-weight: 500;
  transition: all 0.2s;
  text-align: left;
  cursor: pointer;
}

.qa-btn:hover { background: rgba(107, 124, 92, 0.1); color: var(--primary); }
.qa-icon { font-size: 1rem; }

@media (max-width: 900px) { .dash-grid { grid-template-columns: 1fr; } }
</style>
