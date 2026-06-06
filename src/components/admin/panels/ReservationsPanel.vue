<template>
  <div class="res-panel">
    <div class="panel-header">
      <h2 class="panel-title">Réservations</h2>
      <div class="header-filters">
        <button v-for="f in statusFilters" :key="f.value" :class="['filter-pill', { active: statusFilter === f.value }]" @click="statusFilter = f.value">
          {{ f.label }}
          <span class="pill-count">{{ countByStatus(f.value) }}</span>
        </button>
      </div>
    </div>

    <div class="res-toolbar">
      <input v-model="search" class="form-input search-input" placeholder="Rechercher par nom, email…" />
      <input v-model="dateFilter" class="form-input" type="date" style="width: 170px;" />
      <button class="btn btn-ghost btn-sm" @click="dateFilter = ''; search = ''">Réinitialiser</button>
    </div>

    <div v-if="filtered.length" class="res-table">
      <div class="table-head">
        <span>Nom</span>
        <span>Date & Heure</span>
        <span>Couverts</span>
        <span>Contact</span>
        <span>Statut</span>
        <span>Actions</span>
      </div>
      <div v-for="r in filtered" :key="r.id" class="table-row">
        <div>
          <div class="row-name">{{ r.name }}</div>
          <div class="row-msg" v-if="r.message">💬 {{ r.message }}</div>
        </div>
        <div>
          <div class="row-date">{{ formatDate(r.date) }}</div>
          <div class="row-time">🕐 {{ r.time }}</div>
        </div>
        <div class="row-covers">{{ r.covers }} 👤</div>
        <div>
          <a :href="`tel:${r.phone}`" class="contact-link">📞 {{ r.phone }}</a>
          <a :href="`mailto:${r.email}`" class="contact-link">✉️ {{ r.email }}</a>
        </div>
        <div>
          <select :value="r.status" @change="reservations.updateStatus(r.id, $event.target.value)" class="status-select" :class="`status-${r.status}`">
            <option value="pending">En attente</option>
            <option value="confirmed">Confirmé</option>
            <option value="cancelled">Annulé</option>
          </select>
        </div>
        <div class="row-actions">
          <button class="btn-icon danger" @click="remove(r.id)" title="Supprimer">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/></svg>
          </button>
        </div>
      </div>
    </div>

    <div v-else class="empty-state card">
      <p>Aucune réservation ne correspond à ces critères.</p>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useReservationsStore } from '@/stores/reservations.js'
import { useToast } from '@/composables/useToast.js'

const reservations = useReservationsStore()
const { success } = useToast()

const search = ref('')
const dateFilter = ref('')
const statusFilter = ref('all')

const statusFilters = [
  { value: 'all', label: 'Toutes' },
  { value: 'pending', label: 'En attente' },
  { value: 'confirmed', label: 'Confirmées' },
  { value: 'cancelled', label: 'Annulées' },
]

function countByStatus(status) {
  if (status === 'all') return reservations.items.length
  return reservations.items.filter(r => r.status === status).length
}

const filtered = computed(() => {
  return reservations.byDate.filter(r => {
    const matchSearch = !search.value ||
      r.name.toLowerCase().includes(search.value.toLowerCase()) ||
      r.email.toLowerCase().includes(search.value.toLowerCase()) ||
      r.phone.includes(search.value)
    const matchDate = !dateFilter.value || r.date === dateFilter.value
    const matchStatus = statusFilter.value === 'all' || r.status === statusFilter.value
    return matchSearch && matchDate && matchStatus
  })
})

function formatDate(d) {
  return new Date(d + 'T00:00:00').toLocaleDateString('fr-FR', { weekday: 'short', day: 'numeric', month: 'short' })
}

function remove(id) {
  if (!confirm('Supprimer cette réservation ?')) return
  reservations.remove(id)
  success('Réservation supprimée')
}
</script>

<style scoped>
.panel-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 1.25rem; flex-wrap: wrap; gap: 1rem; }
.panel-title { font-family: var(--font-heading); font-size: 1.6rem; }

.header-filters { display: flex; gap: 0.4rem; flex-wrap: wrap; }

.filter-pill {
  display: flex;
  align-items: center;
  gap: 0.4rem;
  padding: 0.35rem 0.85rem;
  border-radius: 99px;
  border: 1.5px solid var(--border);
  font-size: 0.82rem;
  cursor: pointer;
  background: var(--bg-card);
  color: var(--text-light);
  font-family: var(--font-body);
  transition: all 0.2s;
}

.filter-pill.active { background: var(--primary); color: #fff; border-color: var(--primary); }
.pill-count { font-size: 0.72rem; background: rgba(255,255,255,0.25); padding: 0.1rem 0.4rem; border-radius: 99px; }
.filter-pill:not(.active) .pill-count { background: var(--border); color: var(--text-muted); }

.res-toolbar { display: flex; gap: 0.75rem; margin-bottom: 1.25rem; flex-wrap: wrap; }
.search-input { flex: 1; min-width: 200px; }

.res-table { background: var(--bg-card); border-radius: var(--radius); border: 1px solid var(--border); overflow: hidden; }

.table-head {
  display: grid;
  grid-template-columns: 1.5fr 1.2fr 0.6fr 1.5fr 1fr 0.4fr;
  gap: 1rem;
  padding: 0.75rem 1rem;
  background: var(--bg);
  font-size: 0.78rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  color: var(--text-muted);
  border-bottom: 1px solid var(--border);
}

.table-row {
  display: grid;
  grid-template-columns: 1.5fr 1.2fr 0.6fr 1.5fr 1fr 0.4fr;
  gap: 1rem;
  padding: 0.9rem 1rem;
  border-bottom: 1px solid var(--border);
  align-items: center;
  font-size: 0.88rem;
  transition: background 0.15s;
}

.table-row:last-child { border-bottom: none; }
.table-row:hover { background: var(--bg); }

.row-name { font-weight: 600; }
.row-msg  { font-size: 0.78rem; color: var(--text-muted); margin-top: 0.2rem; }
.row-date { font-weight: 500; }
.row-time { font-size: 0.8rem; color: var(--text-light); }
.row-covers { font-weight: 600; color: var(--primary); }

.contact-link { display: block; font-size: 0.8rem; color: var(--text-light); text-decoration: none; margin-bottom: 0.15rem; }
.contact-link:hover { color: var(--primary); }

.status-select {
  padding: 0.3rem 0.6rem;
  border-radius: 99px;
  font-size: 0.78rem;
  font-weight: 600;
  border: none;
  cursor: pointer;
  font-family: var(--font-body);
}

.status-pending  { background: #fff3cd; color: #856404; }
.status-confirmed{ background: #d1e7dd; color: #0f5132; }
.status-cancelled{ background: #f8d7da; color: #842029; }

.row-actions { display: flex; justify-content: center; }
.danger:hover { background: #fee2e2; color: #dc2626; }

.empty-state { padding: 3rem; text-align: center; color: var(--text-muted); font-style: italic; }
</style>
