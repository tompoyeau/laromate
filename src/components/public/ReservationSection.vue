<template>
  <section id="reservation" class="section reservation-section">
    <div class="container">
      <div class="reservation-inner">
        <div class="res-info fade-up">
          <p class="section-label">{{ content.data.reservationLabel }}</p>
          <h2 class="section-title">{{ content.data.reservationTitle }}<br>{{ content.data.reservationTitle2 }}</h2>
          <p class="res-desc">{{ content.data.reservationDesc }}</p>
          <div class="res-perks">
            <div class="perk" v-for="p in perks" :key="p.icon">
              <div class="perk-icon">{{ p.icon }}</div>
              <div>
                <div class="perk-title">{{ p.title }}</div>
                <div class="perk-desc">{{ p.desc }}</div>
              </div>
            </div>
          </div>
        </div>

        <div class="res-form-card card fade-up">
          <Transition name="slide" mode="out-in">
            <div v-if="!submitted" key="form">
              <h3 class="form-card-title">Faire une réservation</h3>
              <form @submit.prevent="submit" class="res-form">
                <div class="form-row">
                  <div class="form-group">
                    <label class="form-label">Prénom & Nom *</label>
                    <input v-model="form.name" class="form-input" placeholder="Marie Dupont" required />
                  </div>
                  <div class="form-group">
                    <label class="form-label">Téléphone *</label>
                    <input v-model="form.phone" class="form-input" type="tel" placeholder="06 12 34 56 78" required />
                  </div>
                </div>
                <div class="form-group">
                  <label class="form-label">Email *</label>
                  <input v-model="form.email" class="form-input" type="email" placeholder="vous@exemple.fr" required />
                </div>
                <div class="form-row">
                  <div class="form-group">
                    <label class="form-label">Date *</label>
                    <input v-model="form.date" class="form-input" type="date" :min="minDate" required />
                  </div>
                  <div class="form-group">
                    <label class="form-label">Nombre de couverts *</label>
                    <select v-model="form.covers" class="form-select" required>
                      <option v-for="n in 20" :key="n" :value="n">{{ n }} personne{{ n > 1 ? 's' : '' }}</option>
                    </select>
                  </div>
                </div>

                <!-- Créneaux horaires adaptatifs -->
                <div class="form-group">
                  <label class="form-label">Heure *</label>

                  <!-- Restaurant fermé ce jour -->
                  <div v-if="form.date && restaurantClosed" class="closed-notice">
                    🚫 Le restaurant est fermé ce jour-là. Choisissez une autre date.
                  </div>

                  <div v-else-if="form.date" class="time-slots">
                    <!-- Déjeuner -->
                    <div v-if="showLunch" class="slot-group">
                      <p class="slot-label">🌞 Déjeuner</p>
                      <div class="slots">
                        <button type="button" v-for="t in lunchSlots" :key="t"
                          :class="['slot', { active: form.time === t, full: slotUnavailable(t), past: isSlotPast(t) }]"
                          :disabled="slotUnavailable(t)"
                          @click="!slotUnavailable(t) && (form.time = t)">
                          {{ t }}
                          <span v-if="isSlotPast(t)" class="slot-tag">Passé</span>
                          <span v-else-if="slotUnavailable(t)" class="slot-tag">Complet</span>
                        </button>
                      </div>
                    </div>

                    <!-- Dîner -->
                    <div v-if="showDinner" class="slot-group">
                      <p class="slot-label">🌙 Dîner</p>
                      <div class="slots">
                        <button type="button" v-for="t in dinnerSlots" :key="t"
                          :class="['slot', { active: form.time === t, full: slotUnavailable(t), past: isSlotPast(t) }]"
                          :disabled="slotUnavailable(t)"
                          @click="!slotUnavailable(t) && (form.time = t)">
                          {{ t }}
                          <span v-if="isSlotPast(t)" class="slot-tag">Passé</span>
                          <span v-else-if="slotUnavailable(t)" class="slot-tag">Complet</span>
                        </button>
                      </div>
                    </div>

                    <!-- Aucun service disponible (restaurant ouvert mais tout fermé) -->
                    <div v-if="!showLunch && !showDinner && !restaurantClosed" class="closed-notice">
                      🚫 Aucun service disponible ce jour-là.
                    </div>
                  </div>

                  <div v-else class="slot-placeholder">
                    Choisissez une date pour voir les disponibilités.
                  </div>
                </div>

                <div class="form-group">
                  <label class="form-label">Message (optionnel)</label>
                  <textarea v-model="form.message" class="form-textarea" placeholder="Allergie, anniversaire, demande particulière…" rows="3"></textarea>
                </div>
                <button type="submit" class="btn btn-primary btn-full" :disabled="!form.time || loading">
                  <svg v-if="loading" class="spin" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 12a9 9 0 1 1-6.219-8.56"/></svg>
                  {{ loading ? 'Confirmation…' : 'Confirmer la réservation' }}
                </button>
              </form>
            </div>

            <div v-else key="success" class="success-screen">
              <div class="success-icon">✓</div>
              <h3>Réservation confirmée !</h3>
              <p>Merci <strong>{{ form.name }}</strong>, votre table pour <strong>{{ form.covers }} personne(s)</strong> le <strong>{{ formatDate(form.date) }}</strong> à <strong>{{ form.time }}</strong> est bien réservée.</p>
              <p class="success-note">Un rappel vous sera envoyé. En cas de besoin, contactez-nous directement.</p>
              <button class="btn btn-outline" @click="reset">Nouvelle réservation</button>
            </div>
          </Transition>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { useReservationsStore, generateSlots } from '@/stores/reservations.js'
import { useContentStore } from '@/stores/content.js'

const reservations = useReservationsStore()
const content = useContentStore()

const loading  = ref(false)
const submitted = ref(false)

// Date minimum en heure locale (évite le décalage UTC)
const minDate = (() => {
  const d = new Date()
  return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`
})()

const lunchSlots = computed(() => {
  if (!form.value.date) return []
  const s = reservations.scheduleForDate(form.value.date)
  return generateSlots(s.lunchStart || '12:00', s.lunchEnd || '14:00', reservations.settings.slotInterval || 15)
})
const dinnerSlots = computed(() => {
  if (!form.value.date) return []
  const s = reservations.scheduleForDate(form.value.date)
  return generateSlots(s.dinnerStart || '19:00', s.dinnerEnd || '21:30', reservations.settings.slotInterval || 15)
})

const defaultForm = () => ({ name: '', email: '', phone: '', date: minDate, time: '', covers: 2, message: '' })
const form = ref(defaultForm())

// ── Disponibilités selon le jour ─────────────────────────────────────────
const restaurantClosed = computed(() => {
  if (!form.value.date) return false
  return !reservations.isRestaurantOpen(form.value.date)
})

const showLunch = computed(() => {
  if (!form.value.date) return false
  return reservations.isLunchOpen(form.value.date)
})

const showDinner = computed(() => {
  if (!form.value.date) return false
  return reservations.isDinnerOpen(form.value.date)
})

// Créneau dans le passé (aujourd'hui seulement)
function isSlotPast(time) {
  if (!form.value.date) return false
  const now = new Date()
  const todayLocal = `${now.getFullYear()}-${String(now.getMonth()+1).padStart(2,'0')}-${String(now.getDate()).padStart(2,'0')}`
  if (form.value.date !== todayLocal) return false
  const [h, m] = time.split(':').map(Number)
  return h * 60 + m <= now.getHours() * 60 + now.getMinutes()
}

// Créneau indisponible : passé ou capacité dépassée
function slotUnavailable(time) {
  if (!form.value.date) return false
  if (isSlotPast(time)) return true
  return !reservations.canBook(form.value.date, time, form.value.covers)
}

// Réinitialise l'heure si la date, les couverts ou l'intervalle/plages changent
watch([
  () => form.value.date,
  () => form.value.covers,
  () => reservations.settings.slotInterval,
  () => JSON.stringify(reservations.settings.schedule),
], () => {
  const t = form.value.time
  if (!t) return
  if (restaurantClosed.value)              { form.value.time = ''; return }
  const isLunch = t < '15:00'
  if (isLunch  && !showLunch.value)        { form.value.time = ''; return }
  if (!isLunch && !showDinner.value)       { form.value.time = ''; return }
  if (isSlotPast(t) || slotUnavailable(t)) { form.value.time = '' }
})

// ── Formulaire ────────────────────────────────────────────────────────────
const perks = [
  { icon: '⚡', title: 'Confirmation immédiate',  desc: 'Votre réservation est confirmée en ligne' },
  { icon: '🔄', title: 'Modification facile',     desc: 'Annulation gratuite jusqu\'à 24h avant' },
  { icon: '🎂', title: 'Occasions spéciales',     desc: 'Anniversaires, dîners romantiques…' },
]

async function submit() {
  if (!form.value.time) return
  loading.value = true
  try {
    await reservations.add({ ...form.value })
    submitted.value = true
  } finally {
    loading.value = false
  }
}

function reset() {
  submitted.value = false
  form.value = defaultForm()
}

function formatDate(d) {
  return new Date(d + 'T00:00:00').toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' })
}
</script>

<style scoped>
.reservation-section {
  background: linear-gradient(135deg, rgba(107, 124, 92, 0.05) 0%, var(--bg) 60%);
}

.reservation-inner {
  display: grid;
  grid-template-columns: 1fr 1.2fr;
  gap: 4rem;
  align-items: start;
}

.res-desc {
  color: var(--text-light);
  line-height: 1.7;
  margin-bottom: 2rem;
}

.res-perks { display: flex; flex-direction: column; gap: 1.25rem; }

.perk { display: flex; gap: 1rem; align-items: flex-start; }

.perk-icon {
  width: 44px;
  height: 44px;
  background: rgba(107, 124, 92, 0.1);
  border-radius: var(--radius-sm);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.3rem;
  flex-shrink: 0;
}

.perk-title { font-weight: 600; font-size: 0.95rem; margin-bottom: 0.15rem; }
.perk-desc  { font-size: 0.85rem; color: var(--text-light); }

.res-form-card { padding: 2rem; }

.form-card-title {
  font-family: var(--font-heading);
  font-size: 1.4rem;
  margin-bottom: 1.5rem;
  color: var(--text);
}

/* Créneaux */
.time-slots { display: flex; flex-direction: column; gap: 1rem; }

.slot-label {
  font-size: 0.8rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  color: var(--text-muted);
  margin-bottom: 0.5rem;
}

.slots { display: flex; flex-wrap: wrap; gap: 0.4rem; }

.slot {
  padding: 0.4rem 0.75rem;
  border-radius: var(--radius-sm);
  border: 1.5px solid var(--border);
  background: var(--bg);
  color: var(--text);
  font-size: 0.82rem;
  font-family: var(--font-body);
  cursor: pointer;
  transition: all 0.15s;
}

.slot.active {
  background: var(--primary);
  border-color: var(--primary);
  color: #fff;
}

.slot:hover:not(.active):not(.full) { border-color: var(--primary); color: var(--primary); }

.slot.full,
.slot.past {
  background: var(--bg);
  border-color: var(--border);
  color: var(--text-muted);
  cursor: not-allowed;
  opacity: 0.5;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.1rem;
  padding-top: 0.25rem;
  padding-bottom: 0.25rem;
}

.slot.past { text-decoration: line-through; }

.slot-tag {
  font-size: 0.6rem;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  font-weight: 700;
  line-height: 1;
}
.slot.full .slot-tag { color: #ef4444; }
.slot.past .slot-tag { color: var(--text-muted); text-decoration: none; }

.closed-notice {
  padding: 0.75rem 1rem;
  background: #fee2e2;
  color: #991b1b;
  border-radius: var(--radius-sm);
  font-size: 0.88rem;
  font-weight: 500;
}

.slot-placeholder {
  font-size: 0.85rem;
  color: var(--text-muted);
  font-style: italic;
  padding: 0.5rem 0;
}

/* Succès */
.success-screen { text-align: center; padding: 2rem 1rem; }

.success-icon {
  width: 64px;
  height: 64px;
  background: var(--primary);
  color: #fff;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.8rem;
  margin: 0 auto 1.5rem;
}

.success-screen h3 { font-family: var(--font-heading); font-size: 1.5rem; margin-bottom: 1rem; }
.success-screen p  { color: var(--text-light); margin-bottom: 0.5rem; line-height: 1.6; }
.success-note { font-size: 0.85rem; color: var(--text-muted) !important; margin-bottom: 1.5rem !important; }

.spin { animation: spin-anim 0.8s linear infinite; }
@keyframes spin-anim { to { transform: rotate(360deg); } }

.slide-enter-active, .slide-leave-active { transition: all 0.3s ease; }
.slide-enter-from { opacity: 0; transform: translateX(12px); }
.slide-leave-to  { opacity: 0; transform: translateX(-12px); }

@media (max-width: 900px) {
  .reservation-inner { grid-template-columns: 1fr; gap: 2rem; }
}
</style>
