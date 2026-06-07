<template>
  <div class="res-panel">

    <!-- ── Header ───────────────────────────────────────────────────────── -->
    <div class="panel-header">
      <h2 class="panel-title">Réservations</h2>
      <div class="view-tabs">
        <button v-for="v in views" :key="v.id"
          :class="['view-tab', { active: view === v.id }]"
          @click="view = v.id">
          {{ v.icon }} {{ v.label }}
        </button>
      </div>
    </div>

    <!-- ── KPI bar ───────────────────────────────────────────────────────── -->
    <div class="kpi-bar">
      <div class="kpi">
        <div class="kpi-val">{{ reservations.todayCovers }}</div>
        <div class="kpi-label">Couverts aujourd'hui</div>
      </div>
      <div class="kpi">
        <div class="kpi-val">{{ reservations.pending.length }}</div>
        <div class="kpi-label">En attente</div>
      </div>
      <div class="kpi">
        <div class="kpi-val">{{ reservations.today.length }}</div>
        <div class="kpi-label">Résa ce jour</div>
      </div>
      <div class="kpi">
        <div class="kpi-val">{{ weekCovers }}</div>
        <div class="kpi-label">Couverts cette semaine</div>
      </div>
    </div>

    <!-- ══════════════════════════════════════════════════════════════════ -->
    <!-- VUE : SERVICE DU JOUR                                             -->
    <!-- ══════════════════════════════════════════════════════════════════ -->
    <template v-if="view === 'service'">
      <div class="service-toolbar">
        <button class="btn btn-ghost btn-sm" @click="shiftDay(-1)">‹</button>
        <input type="date" v-model="serviceDate" class="form-input date-pick" />
        <button class="btn btn-ghost btn-sm" @click="shiftDay(1)">›</button>
        <button class="btn btn-ghost btn-sm" @click="serviceDate = todayStr">Aujourd'hui</button>
      </div>

      <!-- Résumé du jour -->
      <div class="day-summary">
        <div class="day-stat">
          <span class="ds-icon">🌞</span>
          <span class="ds-val">{{ lunchCovers }} cvt</span>
          <span class="ds-label">Déjeuner</span>
        </div>
        <div class="day-divider"></div>
        <div class="day-stat">
          <span class="ds-icon">🌙</span>
          <span class="ds-val">{{ dinnerCovers }} cvt</span>
          <span class="ds-label">Dîner</span>
        </div>
        <div class="day-divider"></div>
        <div class="day-stat">
          <span class="ds-icon">👥</span>
          <span class="ds-val">{{ lunchCovers + dinnerCovers }} cvt</span>
          <span class="ds-label">Total</span>
        </div>
      </div>

      <!-- Déjeuner -->
      <div v-if="dayLunch.length" class="service-group">
        <div class="service-group-title">🌞 Déjeuner</div>
        <div class="res-cards">
          <div v-for="r in dayLunch" :key="r.id" class="res-card" :class="`card-${r.status}`" @click="openDetail(r)">
            <div class="rc-top">
              <div class="rc-time">{{ r.time }}</div>
              <span :class="['status-badge', `sb-${r.status}`]">{{ STATUS_LABELS[r.status] }}</span>
            </div>
            <div class="rc-name">{{ r.name }}</div>
            <div class="rc-meta">
              <span>👤 {{ r.covers }} couvert{{ r.covers > 1 ? 's' : '' }}</span>
              <span v-if="r.message">💬 {{ r.message }}</span>
            </div>
            <div class="rc-actions" @click.stop>
              <button v-if="r.status === 'pending'" class="rc-btn confirm" @click="quickStatus(r.id, 'confirmed')">✓ Confirmer</button>
              <button v-if="r.status === 'pending' || r.status === 'confirmed'" class="rc-btn cancel" @click="quickStatus(r.id, 'cancelled')">✕ Annuler</button>
              <button v-if="r.status === 'confirmed'" class="rc-btn noshow" @click="quickStatus(r.id, 'noshow')">⊘ No-show</button>
            </div>
          </div>
        </div>
      </div>

      <!-- Dîner -->
      <div v-if="dayDinner.length" class="service-group">
        <div class="service-group-title">🌙 Dîner</div>
        <div class="res-cards">
          <div v-for="r in dayDinner" :key="r.id" class="res-card" :class="`card-${r.status}`" @click="openDetail(r)">
            <div class="rc-top">
              <div class="rc-time">{{ r.time }}</div>
              <span :class="['status-badge', `sb-${r.status}`]">{{ STATUS_LABELS[r.status] }}</span>
            </div>
            <div class="rc-name">{{ r.name }}</div>
            <div class="rc-meta">
              <span>👤 {{ r.covers }} couvert{{ r.covers > 1 ? 's' : '' }}</span>
              <span v-if="r.message">💬 {{ r.message }}</span>
            </div>
            <div class="rc-actions" @click.stop>
              <button v-if="r.status === 'pending'" class="rc-btn confirm" @click="quickStatus(r.id, 'confirmed')">✓ Confirmer</button>
              <button v-if="r.status === 'pending' || r.status === 'confirmed'" class="rc-btn cancel" @click="quickStatus(r.id, 'cancelled')">✕ Annuler</button>
              <button v-if="r.status === 'confirmed'" class="rc-btn noshow" @click="quickStatus(r.id, 'noshow')">⊘ No-show</button>
            </div>
          </div>
        </div>
      </div>

      <div v-if="!dayLunch.length && !dayDinner.length" class="empty-state card">
        <div class="empty-icon">📅</div>
        <p>Aucune réservation ce jour-là.</p>
      </div>
    </template>

    <!-- ══════════════════════════════════════════════════════════════════ -->
    <!-- VUE : CALENDRIER                                                   -->
    <!-- ══════════════════════════════════════════════════════════════════ -->
    <template v-else-if="view === 'calendar'">
      <div class="cal-header">
        <button class="btn btn-ghost btn-sm" @click="shiftMonth(-1)">‹</button>
        <div class="cal-month-title">{{ calMonthLabel }}</div>
        <button class="btn btn-ghost btn-sm" @click="shiftMonth(1)">›</button>
      </div>

      <div class="calendar">
        <div class="cal-dow" v-for="d in DOW" :key="d">{{ d }}</div>
        <div
          v-for="cell in calCells"
          :key="cell.key"
          :class="['cal-cell', {
            'cal-other': !cell.current,
            'cal-today': cell.isToday,
            'cal-selected': calSelected === cell.dateStr,
            'cal-has-res': cell.current && cell.count > 0
          }]"
          @click="cell.current && selectCalDay(cell.dateStr)"
        >
          <span class="cal-day-num">{{ cell.day }}</span>
          <span v-if="cell.current && cell.count > 0" class="cal-chip" :class="chipClass(cell)">
            {{ cell.covers }} cvt
          </span>
        </div>
      </div>

      <!-- Détail du jour sélectionné -->
      <div v-if="calSelected" class="cal-detail">
        <div class="cal-detail-title">
          {{ formatDateFull(calSelected) }}
          <span class="cal-detail-sub">{{ selectedDayRes.length }} réservation(s) · {{ selectedDayCovers }} couverts</span>
        </div>
        <div v-if="selectedDayRes.length" class="res-cards">
          <div v-for="r in selectedDayRes" :key="r.id" class="res-card" :class="`card-${r.status}`" @click="openDetail(r)">
            <div class="rc-top">
              <div class="rc-time">{{ r.time }}</div>
              <span :class="['status-badge', `sb-${r.status}`]">{{ STATUS_LABELS[r.status] }}</span>
            </div>
            <div class="rc-name">{{ r.name }}</div>
            <div class="rc-meta">
              <span>👤 {{ r.covers }} cvt</span>
              <span v-if="r.message">💬 {{ r.message }}</span>
            </div>
            <div class="rc-actions" @click.stop>
              <button v-if="r.status === 'pending'" class="rc-btn confirm" @click="quickStatus(r.id, 'confirmed')">✓</button>
              <button v-if="r.status === 'pending' || r.status === 'confirmed'" class="rc-btn cancel" @click="quickStatus(r.id, 'cancelled')">✕</button>
              <button v-if="r.status === 'confirmed'" class="rc-btn noshow" @click="quickStatus(r.id, 'noshow')">⊘</button>
            </div>
          </div>
        </div>
        <div v-else class="empty-cal-day">Aucune réservation.</div>
      </div>
    </template>

    <!-- ══════════════════════════════════════════════════════════════════ -->
    <!-- VUE : LISTE COMPLÈTE                                               -->
    <!-- ══════════════════════════════════════════════════════════════════ -->
    <template v-else-if="view === 'list'">
      <div class="list-toolbar">
        <input v-model="search" class="form-input search-input" placeholder="Nom, email, téléphone…" />
        <input v-model="dateFilter" class="form-input" type="date" style="width:165px" />
        <div class="status-pills">
          <button v-for="f in STATUS_FILTERS" :key="f.value"
            :class="['filter-pill', { active: statusFilter === f.value }]"
            @click="statusFilter = f.value">
            {{ f.label }}
            <span class="pill-count">{{ countByStatus(f.value) }}</span>
          </button>
        </div>
        <button class="btn btn-ghost btn-sm" @click="dateFilter = ''; search = ''; statusFilter = 'all'">Tout réinitialiser</button>
      </div>

      <div v-if="filtered.length" class="res-table">
        <div class="table-head">
          <span>Nom</span>
          <span>Date & Heure</span>
          <span>Cvt</span>
          <span>Contact</span>
          <span>Statut</span>
          <span></span>
        </div>
        <div v-for="r in filtered" :key="r.id" class="table-row" @click="openDetail(r)">
          <div>
            <div class="row-name">{{ r.name }}</div>
            <div class="row-msg" v-if="r.message">💬 {{ r.message }}</div>
            <div class="row-note" v-if="r.note">📝 {{ r.note }}</div>
          </div>
          <div>
            <div class="row-date">{{ formatDate(r.date) }}</div>
            <div class="row-time">{{ r.time }}</div>
          </div>
          <div class="row-covers">{{ r.covers }}</div>
          <div>
            <a :href="`tel:${r.phone}`" class="contact-link" @click.stop>📞 {{ r.phone }}</a>
            <a :href="`mailto:${r.email}`" class="contact-link" @click.stop>✉️ {{ r.email }}</a>
          </div>
          <div @click.stop>
            <span :class="['status-badge', `sb-${r.status}`]">{{ STATUS_LABELS[r.status] }}</span>
          </div>
          <div @click.stop class="row-actions">
            <button class="btn-icon danger" @click="remove(r.id)">
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/></svg>
            </button>
          </div>
        </div>
      </div>

      <div v-else class="empty-state card">
        <div class="empty-icon">🔍</div>
        <p>Aucune réservation ne correspond.</p>
      </div>
    </template>

    <!-- ══════════════════════════════════════════════════════════════════ -->
    <!-- VUE : PARAMÈTRES CAPACITÉ                                          -->
    <!-- ══════════════════════════════════════════════════════════════════ -->
    <template v-else-if="view === 'settings'">
      <div class="card settings-card">
        <div class="section-head">⚙️ Capacité</div>
        <p class="settings-hint">Ces valeurs contrôlent les créneaux disponibles sur le formulaire public. Un créneau est désactivé dès que sa capacité est atteinte.</p>

        <div class="settings-grid">
          <div class="form-group">
            <label class="form-label">
              Max couverts par créneau
              <span class="form-hint-inline">· Un créneau = 15 min</span>
            </label>
            <div class="num-input-wrap">
              <button class="num-btn" @click="dec('maxCoversPerSlot')">−</button>
              <input v-model.number="settingsForm.maxCoversPerSlot" type="number" min="1" max="200" class="form-input num-input" />
              <button class="num-btn" @click="inc('maxCoversPerSlot')">+</button>
            </div>
          </div>
          <div class="form-group">
            <label class="form-label">Max couverts déjeuner</label>
            <div class="num-input-wrap">
              <button class="num-btn" @click="dec('maxCoversLunch')">−</button>
              <input v-model.number="settingsForm.maxCoversLunch" type="number" min="1" max="500" class="form-input num-input" />
              <button class="num-btn" @click="inc('maxCoversLunch')">+</button>
            </div>
          </div>
          <div class="form-group">
            <label class="form-label">Max couverts dîner</label>
            <div class="num-input-wrap">
              <button class="num-btn" @click="dec('maxCoversDinner')">−</button>
              <input v-model.number="settingsForm.maxCoversDinner" type="number" min="1" max="500" class="form-input num-input" />
              <button class="num-btn" @click="inc('maxCoversDinner')">+</button>
            </div>
          </div>
        </div>

        <button class="btn btn-primary" @click="saveSettingsForm" style="margin-top:1.5rem">✓ Enregistrer</button>
      </div>
    </template>

    <!-- ══════════════════════════════════════════════════════════════════ -->
    <!-- MODAL DÉTAIL / FICHE RÉSERVATION                                   -->
    <!-- ══════════════════════════════════════════════════════════════════ -->
    <AppModal v-model="detailOpen" :title="`Réservation — ${detailRes?.name || ''}`" width="520px">
      <template v-if="detailRes">
        <div class="detail-grid">
          <div class="detail-item">
            <div class="di-label">Date & Heure</div>
            <div class="di-val">{{ formatDateFull(detailRes.date) }} à {{ detailRes.time }}</div>
          </div>
          <div class="detail-item">
            <div class="di-label">Couverts</div>
            <div class="di-val">{{ detailRes.covers }} personne{{ detailRes.covers > 1 ? 's' : '' }}</div>
          </div>
          <div class="detail-item">
            <div class="di-label">Téléphone</div>
            <a :href="`tel:${detailRes.phone}`" class="di-val di-link">{{ detailRes.phone }}</a>
          </div>
          <div class="detail-item">
            <div class="di-label">Email</div>
            <a :href="`mailto:${detailRes.email}`" class="di-val di-link">{{ detailRes.email }}</a>
          </div>
          <div v-if="detailRes.message" class="detail-item full">
            <div class="di-label">Message client</div>
            <div class="di-val di-msg">{{ detailRes.message }}</div>
          </div>
          <div class="detail-item full">
            <div class="di-label">Reçue le</div>
            <div class="di-val">{{ formatCreatedAt(detailRes.createdAt) }}</div>
          </div>
        </div>

        <!-- Statut -->
        <div class="form-group" style="margin-top:1.25rem">
          <label class="form-label">Statut</label>
          <div class="status-btns">
            <button v-for="s in STATUS_OPTIONS" :key="s.value"
              :class="['status-opt', `sopt-${s.value}`, { active: detailRes.status === s.value }]"
              @click="reservations.updateStatus(detailRes.id, s.value)">
              {{ s.icon }} {{ s.label }}
            </button>
          </div>
        </div>

        <!-- Note interne -->
        <div class="form-group" style="margin-top:1rem">
          <label class="form-label">Note interne <span class="form-hint-inline">(non visible par le client)</span></label>
          <textarea
            :value="detailRes.note"
            @input="reservations.updateNote(detailRes.id, $event.target.value)"
            class="form-textarea"
            rows="3"
            placeholder="Table fenêtre, allergie noix, client VIP…"
          ></textarea>
        </div>
      </template>
      <template #footer>
        <button class="btn btn-ghost" style="color:#dc2626" @click="removeFromDetail">🗑 Supprimer</button>
        <button class="btn btn-primary" @click="detailOpen = false">Fermer</button>
      </template>
    </AppModal>

  </div>
</template>

<script setup>
import { ref, computed, reactive } from 'vue'
import { useReservationsStore } from '@/stores/reservations.js'
import { useToast } from '@/composables/useToast.js'
import AppModal from '@/components/ui/AppModal.vue'

const reservations = useReservationsStore()
const { success } = useToast()

// ── Views ─────────────────────────────────────────────────────────────────
const view = ref('service')
const views = [
  { id: 'service',  icon: '🍽️', label: 'Service' },
  { id: 'calendar', icon: '📅', label: 'Calendrier' },
  { id: 'list',     icon: '📋', label: 'Liste' },
  { id: 'settings', icon: '⚙️', label: 'Capacité' },
]

const STATUS_LABELS = {
  pending:   'En attente',
  confirmed: 'Confirmée',
  cancelled: 'Annulée',
  noshow:    'No-show',
}

const STATUS_OPTIONS = [
  { value: 'pending',   icon: '🕐', label: 'En attente' },
  { value: 'confirmed', icon: '✅', label: 'Confirmée' },
  { value: 'cancelled', icon: '❌', label: 'Annulée' },
  { value: 'noshow',    icon: '👻', label: 'No-show' },
]

const STATUS_FILTERS = [
  { value: 'all',       label: 'Toutes' },
  { value: 'pending',   label: 'En attente' },
  { value: 'confirmed', label: 'Confirmées' },
  { value: 'cancelled', label: 'Annulées' },
  { value: 'noshow',    label: 'No-show' },
]

// ── KPI ───────────────────────────────────────────────────────────────────
const weekCovers = computed(() => {
  const now = new Date()
  const day = now.getDay() || 7
  const mon = new Date(now); mon.setDate(now.getDate() - day + 1)
  const sun = new Date(mon); sun.setDate(mon.getDate() + 6)
  const start = mon.toISOString().split('T')[0]
  const end   = sun.toISOString().split('T')[0]
  return reservations.items
    .filter(r => r.date >= start && r.date <= end && ['pending','confirmed'].includes(r.status))
    .reduce((s, r) => s + r.covers, 0)
})

// ── Service du jour ────────────────────────────────────────────────────────
const todayStr   = new Date().toISOString().split('T')[0]
const serviceDate = ref(todayStr)

function shiftDay(n) {
  const d = new Date(serviceDate.value + 'T00:00:00')
  d.setDate(d.getDate() + n)
  serviceDate.value = d.toISOString().split('T')[0]
}

const LUNCH_END = '15:00'
const dayRes = computed(() =>
  reservations.reservationsOnDay(serviceDate.value).filter(r => r.status !== 'cancelled')
)
const dayLunch  = computed(() => dayRes.value.filter(r => r.time < LUNCH_END))
const dayDinner = computed(() => dayRes.value.filter(r => r.time >= LUNCH_END))
const lunchCovers  = computed(() => dayLunch.value.reduce((s, r) => s + r.covers, 0))
const dinnerCovers = computed(() => dayDinner.value.reduce((s, r) => s + r.covers, 0))

// ── Calendrier ────────────────────────────────────────────────────────────
const DOW = ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim']
const calYear  = ref(new Date().getFullYear())
const calMonth = ref(new Date().getMonth())
const calSelected = ref(null)

const calMonthLabel = computed(() =>
  new Date(calYear.value, calMonth.value, 1)
    .toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' })
)

function shiftMonth(n) {
  const d = new Date(calYear.value, calMonth.value + n, 1)
  calYear.value  = d.getFullYear()
  calMonth.value = d.getMonth()
  calSelected.value = null
}

const calCells = computed(() => {
  const firstDay = new Date(calYear.value, calMonth.value, 1)
  const lastDay  = new Date(calYear.value, calMonth.value + 1, 0)
  const todayIso = new Date().toISOString().split('T')[0]
  const cells = []

  // Padding début (lundi = 0)
  let startDow = firstDay.getDay() - 1
  if (startDow < 0) startDow = 6
  for (let i = startDow - 1; i >= 0; i--) {
    const d = new Date(firstDay); d.setDate(d.getDate() - i - 1)
    const ds = d.toISOString().split('T')[0]
    cells.push({ key: 'p' + ds, day: d.getDate(), dateStr: ds, current: false, isToday: false, count: 0, covers: 0 })
  }

  // Jours du mois
  for (let d = 1; d <= lastDay.getDate(); d++) {
    const date = new Date(calYear.value, calMonth.value, d)
    const ds = date.toISOString().split('T')[0]
    const dayItems = reservations.items.filter(r => r.date === ds && ['pending','confirmed'].includes(r.status))
    cells.push({
      key: ds, day: d, dateStr: ds, current: true,
      isToday: ds === todayIso,
      count:  dayItems.length,
      covers: dayItems.reduce((s, r) => s + r.covers, 0)
    })
  }

  // Padding fin
  const remaining = (7 - (cells.length % 7)) % 7
  for (let i = 1; i <= remaining; i++) {
    const d = new Date(lastDay); d.setDate(d.getDate() + i)
    const ds = d.toISOString().split('T')[0]
    cells.push({ key: 'n' + ds, day: d.getDate(), dateStr: ds, current: false, isToday: false, count: 0, covers: 0 })
  }

  return cells
})

function chipClass(cell) {
  if (cell.covers >= reservations.settings.maxCoversDinner) return 'chip-full'
  if (cell.covers >= reservations.settings.maxCoversDinner * 0.7) return 'chip-busy'
  return 'chip-ok'
}

function selectCalDay(dateStr) {
  calSelected.value = calSelected.value === dateStr ? null : dateStr
}

const selectedDayRes = computed(() =>
  calSelected.value ? reservations.reservationsOnDay(calSelected.value) : []
)
const selectedDayCovers = computed(() =>
  selectedDayRes.value.filter(r => ['pending','confirmed'].includes(r.status)).reduce((s,r) => s + r.covers, 0)
)

// ── Liste ──────────────────────────────────────────────────────────────────
const search       = ref('')
const dateFilter   = ref('')
const statusFilter = ref('all')

function countByStatus(status) {
  if (status === 'all') return reservations.items.length
  return reservations.items.filter(r => r.status === status).length
}

const filtered = computed(() =>
  reservations.byDate.filter(r => {
    const q = search.value.toLowerCase()
    const matchSearch = !q || r.name.toLowerCase().includes(q) || r.email.toLowerCase().includes(q) || r.phone.includes(search.value)
    const matchDate   = !dateFilter.value || r.date === dateFilter.value
    const matchStatus = statusFilter.value === 'all' || r.status === statusFilter.value
    return matchSearch && matchDate && matchStatus
  })
)

// ── Paramètres ────────────────────────────────────────────────────────────
const settingsForm = reactive({ ...reservations.settings })

function inc(k) { settingsForm[k]++ }
function dec(k) { if (settingsForm[k] > 1) settingsForm[k]-- }

function saveSettingsForm() {
  reservations.updateSettings({ ...settingsForm })
  success('Paramètres enregistrés')
}

// ── Modal détail ──────────────────────────────────────────────────────────
const detailOpen = ref(false)
const detailRes  = ref(null)

function openDetail(r) {
  detailRes.value = r
  detailOpen.value = true
}

function quickStatus(id, status) {
  reservations.updateStatus(id, status)
  success(status === 'confirmed' ? 'Réservation confirmée ✓' : status === 'cancelled' ? 'Réservation annulée' : 'No-show enregistré')
}

function remove(id) {
  if (!confirm('Supprimer cette réservation ?')) return
  reservations.remove(id)
  success('Supprimée')
}

function removeFromDetail() {
  if (!confirm('Supprimer cette réservation ?')) return
  reservations.remove(detailRes.value.id)
  detailOpen.value = false
  success('Supprimée')
}

// ── Formatters ────────────────────────────────────────────────────────────
function formatDate(d) {
  return new Date(d + 'T00:00:00').toLocaleDateString('fr-FR', { weekday: 'short', day: 'numeric', month: 'short' })
}

function formatDateFull(d) {
  return new Date(d + 'T00:00:00').toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })
}

function formatCreatedAt(ts) {
  return new Date(ts).toLocaleString('fr-FR', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })
}
</script>

<style scoped>
.res-panel { display: flex; flex-direction: column; gap: 1.25rem; }

/* ── Header ──────────────────────────────────────────────────────────── */
.panel-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 1rem;
}
.panel-title { font-family: var(--font-heading); font-size: 1.6rem; }

.view-tabs { display: flex; gap: 0.35rem; background: var(--bg); border-radius: var(--radius); padding: 0.25rem; }
.view-tab {
  padding: 0.45rem 1rem;
  border-radius: calc(var(--radius) - 2px);
  font-size: 0.82rem; font-weight: 500;
  color: var(--text-light);
  font-family: var(--font-body);
  cursor: pointer;
  transition: all 0.2s;
}
.view-tab.active { background: var(--bg-card); color: var(--primary); box-shadow: var(--shadow-sm); }
.view-tab:hover:not(.active) { color: var(--text); }

/* ── KPI bar ─────────────────────────────────────────────────────────── */
.kpi-bar {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 0.75rem;
}

.kpi {
  background: var(--bg-card);
  border: 1px solid var(--border);
  border-radius: var(--radius);
  padding: 1rem 1.25rem;
  text-align: center;
}
.kpi-val { font-family: var(--font-heading); font-size: 2rem; color: var(--primary); line-height: 1; }
.kpi-label { font-size: 0.75rem; color: var(--text-muted); margin-top: 0.35rem; }

/* ── Service du jour ─────────────────────────────────────────────────── */
.service-toolbar {
  display: flex; gap: 0.5rem; align-items: center; flex-wrap: wrap;
}
.date-pick { width: 160px; }

.day-summary {
  display: flex;
  align-items: center;
  background: var(--bg-card);
  border: 1px solid var(--border);
  border-radius: var(--radius);
  padding: 1rem 1.5rem;
  gap: 1.5rem;
}
.day-stat { display: flex; align-items: center; gap: 0.6rem; }
.ds-icon { font-size: 1.2rem; }
.ds-val { font-family: var(--font-heading); font-size: 1.4rem; color: var(--text); }
.ds-label { font-size: 0.78rem; color: var(--text-muted); }
.day-divider { width: 1px; height: 32px; background: var(--border); flex-shrink: 0; }

.service-group {}
.service-group-title {
  font-weight: 700; font-size: 0.85rem;
  text-transform: uppercase; letter-spacing: 0.08em;
  color: var(--text-muted);
  margin-bottom: 0.75rem;
  padding-bottom: 0.5rem;
  border-bottom: 1px solid var(--border);
}

.res-cards { display: grid; grid-template-columns: repeat(auto-fill, minmax(240px, 1fr)); gap: 0.75rem; }

.res-card {
  background: var(--bg-card);
  border: 1px solid var(--border);
  border-radius: var(--radius);
  padding: 1rem;
  cursor: pointer;
  transition: all 0.2s;
  border-left: 3px solid var(--border);
}
.res-card:hover { box-shadow: var(--shadow); transform: translateY(-1px); }

.card-pending   { border-left-color: #f59e0b; }
.card-confirmed { border-left-color: #10b981; }
.card-cancelled { border-left-color: #ef4444; opacity: 0.6; }
.card-noshow    { border-left-color: #6b7280; opacity: 0.7; }

.rc-top { display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.5rem; }
.rc-time { font-size: 1.1rem; font-weight: 700; font-family: var(--font-heading); color: var(--text); }
.rc-name { font-weight: 600; font-size: 0.95rem; margin-bottom: 0.4rem; }
.rc-meta { display: flex; flex-direction: column; gap: 0.15rem; font-size: 0.8rem; color: var(--text-light); margin-bottom: 0.75rem; }

.rc-actions { display: flex; gap: 0.4rem; flex-wrap: wrap; }
.rc-btn {
  padding: 0.3rem 0.65rem;
  border-radius: var(--radius-sm);
  font-size: 0.75rem;
  font-weight: 600;
  font-family: var(--font-body);
  cursor: pointer;
  transition: all 0.15s;
  border: none;
}
.rc-btn.confirm { background: #d1fae5; color: #065f46; }
.rc-btn.confirm:hover { background: #10b981; color: #fff; }
.rc-btn.cancel  { background: #fee2e2; color: #991b1b; }
.rc-btn.cancel:hover  { background: #ef4444; color: #fff; }
.rc-btn.noshow  { background: #f3f4f6; color: #374151; }
.rc-btn.noshow:hover  { background: #6b7280; color: #fff; }

/* ── Status badge ────────────────────────────────────────────────────── */
.status-badge {
  display: inline-block;
  padding: 0.2rem 0.55rem;
  border-radius: 99px;
  font-size: 0.72rem;
  font-weight: 600;
}
.sb-pending   { background: #fff3cd; color: #856404; }
.sb-confirmed { background: #d1e7dd; color: #0f5132; }
.sb-cancelled { background: #f8d7da; color: #842029; }
.sb-noshow    { background: #e5e7eb; color: #374151; }

/* ── Calendrier ──────────────────────────────────────────────────────── */
.cal-header { display: flex; align-items: center; gap: 1rem; }
.cal-month-title { font-family: var(--font-heading); font-size: 1.2rem; flex: 1; text-align: center; text-transform: capitalize; }

.calendar {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  gap: 3px;
  background: var(--bg-card);
  border: 1px solid var(--border);
  border-radius: var(--radius);
  padding: 0.75rem;
}

.cal-dow {
  text-align: center;
  font-size: 0.72rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.06em;
  color: var(--text-muted);
  padding: 0.4rem 0;
}

.cal-cell {
  min-height: 64px;
  border-radius: var(--radius-sm);
  padding: 0.35rem 0.4rem;
  cursor: pointer;
  transition: background 0.15s;
  display: flex;
  flex-direction: column;
  gap: 0.2rem;
}
.cal-cell:hover:not(.cal-other) { background: var(--bg); }
.cal-other { opacity: 0.25; cursor: default; }

.cal-today .cal-day-num {
  background: var(--primary);
  color: #fff;
  border-radius: 50%;
  width: 22px; height: 22px;
  display: flex; align-items: center; justify-content: center;
  font-weight: 700;
}

.cal-selected { background: color-mix(in srgb, var(--primary) 8%, var(--bg-card)); outline: 2px solid var(--primary); }

.cal-day-num { font-size: 0.82rem; font-weight: 500; }

.cal-chip {
  font-size: 0.68rem;
  font-weight: 600;
  padding: 0.1rem 0.4rem;
  border-radius: 4px;
  white-space: nowrap;
}
.chip-ok   { background: #d1fae5; color: #065f46; }
.chip-busy { background: #fef3c7; color: #92400e; }
.chip-full { background: #fee2e2; color: #991b1b; }

.cal-detail { background: var(--bg-card); border: 1px solid var(--border); border-radius: var(--radius); padding: 1.25rem; }
.cal-detail-title { font-family: var(--font-heading); font-size: 1.05rem; margin-bottom: 1rem; display: flex; align-items: baseline; gap: 0.75rem; text-transform: capitalize; }
.cal-detail-sub { font-size: 0.82rem; color: var(--text-muted); font-family: var(--font-body); }
.empty-cal-day { color: var(--text-muted); font-style: italic; font-size: 0.88rem; }

/* ── Liste ───────────────────────────────────────────────────────────── */
.list-toolbar { display: flex; gap: 0.65rem; flex-wrap: wrap; align-items: center; }
.search-input { flex: 1; min-width: 180px; }
.status-pills { display: flex; gap: 0.35rem; flex-wrap: wrap; }

.filter-pill {
  display: flex; align-items: center; gap: 0.35rem;
  padding: 0.3rem 0.75rem;
  border-radius: 99px;
  border: 1.5px solid var(--border);
  font-size: 0.78rem; cursor: pointer;
  background: var(--bg-card); color: var(--text-light);
  font-family: var(--font-body);
  transition: all 0.2s;
}
.filter-pill.active { background: var(--primary); color: #fff; border-color: var(--primary); }
.pill-count { font-size: 0.68rem; background: rgba(255,255,255,0.25); padding: 0.1rem 0.35rem; border-radius: 99px; }
.filter-pill:not(.active) .pill-count { background: var(--border); color: var(--text-muted); }

.res-table { background: var(--bg-card); border-radius: var(--radius); border: 1px solid var(--border); overflow: hidden; }

.table-head {
  display: grid;
  grid-template-columns: 1.5fr 1.2fr 0.4fr 1.5fr 0.9fr 0.3fr;
  gap: 0.75rem;
  padding: 0.65rem 1rem;
  background: var(--bg);
  font-size: 0.72rem; font-weight: 700;
  text-transform: uppercase; letter-spacing: 0.05em;
  color: var(--text-muted);
  border-bottom: 1px solid var(--border);
}

.table-row {
  display: grid;
  grid-template-columns: 1.5fr 1.2fr 0.4fr 1.5fr 0.9fr 0.3fr;
  gap: 0.75rem;
  padding: 0.8rem 1rem;
  border-bottom: 1px solid var(--border);
  align-items: center;
  font-size: 0.85rem;
  transition: background 0.15s;
  cursor: pointer;
}
.table-row:last-child { border-bottom: none; }
.table-row:hover { background: var(--bg); }

.row-name { font-weight: 600; }
.row-msg, .row-note { font-size: 0.75rem; color: var(--text-muted); margin-top: 0.15rem; }
.row-date { font-weight: 500; }
.row-time { font-size: 0.78rem; color: var(--text-light); }
.row-covers { font-weight: 700; color: var(--primary); text-align: center; }

.contact-link { display: block; font-size: 0.78rem; color: var(--text-light); text-decoration: none; }
.contact-link:hover { color: var(--primary); }

.row-actions { display: flex; justify-content: center; }
.danger:hover { background: #fee2e2; color: #dc2626; }

/* ── Paramètres ──────────────────────────────────────────────────────── */
.settings-card { padding: 1.5rem; }
.section-head { font-weight: 600; font-size: 0.95rem; margin-bottom: 0.5rem; padding-bottom: 0.75rem; border-bottom: 1px solid var(--border); }
.settings-hint { font-size: 0.82rem; color: var(--text-muted); margin-bottom: 1.5rem; }
.settings-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 1.25rem; }

.num-input-wrap { display: flex; align-items: center; gap: 0; }
.num-btn {
  width: 36px; height: 38px;
  background: var(--bg);
  border: 1.5px solid var(--border);
  font-size: 1.1rem;
  cursor: pointer;
  transition: background 0.15s;
  flex-shrink: 0;
}
.num-btn:first-child { border-radius: var(--radius-sm) 0 0 var(--radius-sm); border-right: none; }
.num-btn:last-child  { border-radius: 0 var(--radius-sm) var(--radius-sm) 0; border-left: none; }
.num-btn:hover { background: var(--border); }
.num-input { border-radius: 0; text-align: center; width: 70px; flex-shrink: 0; }

/* ── Modal détail ────────────────────────────────────────────────────── */
.detail-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; }
.detail-item.full { grid-column: 1/-1; }
.di-label { font-size: 0.72rem; font-weight: 700; text-transform: uppercase; letter-spacing: 0.06em; color: var(--text-muted); margin-bottom: 0.25rem; }
.di-val { font-size: 0.92rem; color: var(--text); }
.di-link { color: var(--primary); text-decoration: none; }
.di-link:hover { text-decoration: underline; }
.di-msg { background: var(--bg); padding: 0.6rem 0.75rem; border-radius: var(--radius-sm); font-style: italic; color: var(--text-light); }

.status-btns { display: flex; gap: 0.5rem; flex-wrap: wrap; }
.status-opt {
  padding: 0.45rem 1rem;
  border-radius: var(--radius-sm);
  font-size: 0.82rem; font-weight: 500;
  cursor: pointer;
  border: 2px solid var(--border);
  background: var(--bg);
  font-family: var(--font-body);
  transition: all 0.15s;
}
.status-opt.active.sopt-pending   { border-color: #f59e0b; background: #fff3cd; color: #856404; }
.status-opt.active.sopt-confirmed { border-color: #10b981; background: #d1fae5; color: #065f46; }
.status-opt.active.sopt-cancelled { border-color: #ef4444; background: #fee2e2; color: #991b1b; }
.status-opt.active.sopt-noshow    { border-color: #6b7280; background: #f3f4f6; color: #374151; }
.status-opt:hover:not(.active) { border-color: var(--primary); }

.form-hint-inline { font-size: 0.75rem; color: var(--text-muted); font-weight: 400; }

/* ── Empty ───────────────────────────────────────────────────────────── */
.empty-state { padding: 3rem; text-align: center; display: flex; flex-direction: column; align-items: center; gap: 0.5rem; }
.empty-icon { font-size: 2.5rem; }
.empty-state p { color: var(--text-muted); font-style: italic; }

/* ── Responsive ──────────────────────────────────────────────────────── */
@media (max-width: 900px) {
  .kpi-bar { grid-template-columns: repeat(2, 1fr); }
  .settings-grid { grid-template-columns: 1fr; }
  .table-head, .table-row { grid-template-columns: 1.2fr 1fr 0.4fr 1fr; }
  .table-head span:nth-child(4), .table-row > div:nth-child(4) { display: none; }
  .table-head span:last-child, .table-row > div:last-child { display: none; }
}
@media (max-width: 600px) {
  .kpi-bar { grid-template-columns: repeat(2, 1fr); }
  .view-tab { padding: 0.4rem 0.6rem; font-size: 0.75rem; }
  .res-cards { grid-template-columns: 1fr; }
  .day-summary { flex-wrap: wrap; gap: 1rem; }
}
</style>
