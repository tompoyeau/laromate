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
                <div class="form-group">
                  <label class="form-label">Heure *</label>
                  <div class="time-slots">
                    <div class="slot-group">
                      <p class="slot-label">Déjeuner</p>
                      <div class="slots">
                        <button type="button" v-for="t in lunchSlots" :key="t"
                          :class="['slot', { active: form.time === t, full: isSlotFull(t) }]"
                          :disabled="isSlotFull(t)"
                          @click="!isSlotFull(t) && (form.time = t)">
                          {{ t }}
                          <span v-if="isSlotFull(t)" class="slot-full-tag">Complet</span>
                        </button>
                      </div>
                    </div>
                    <div class="slot-group">
                      <p class="slot-label">Dîner</p>
                      <div class="slots">
                        <button type="button" v-for="t in dinnerSlots" :key="t"
                          :class="['slot', { active: form.time === t, full: isSlotFull(t) }]"
                          :disabled="isSlotFull(t)"
                          @click="!isSlotFull(t) && (form.time = t)">
                          {{ t }}
                          <span v-if="isSlotFull(t)" class="slot-full-tag">Complet</span>
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
                <div class="form-group">
                  <label class="form-label">Message (optionnel)</label>
                  <textarea v-model="form.message" class="form-textarea" placeholder="Allergie, anniversaire, demande particulière…" rows="3"></textarea>
                </div>
                <button type="submit" class="btn btn-primary btn-full" :disabled="!form.time || loading">
                  <svg v-if="loading" class="spin" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 12a9 9 0 1 1-6.219-8.56"/></svg>
                  {{ loading ? 'Envoi…' : 'Confirmer la réservation' }}
                </button>
              </form>
            </div>

            <div v-else key="success" class="success-screen">
              <div class="success-icon">✓</div>
              <h3>Réservation envoyée !</h3>
              <p>Merci <strong>{{ form.name }}</strong>, votre demande pour <strong>{{ form.covers }} personne(s)</strong> le <strong>{{ formatDate(form.date) }}</strong> à <strong>{{ form.time }}</strong> a bien été reçue.</p>
              <p class="success-note">Nous vous confirmerons par email ou téléphone dans les plus brefs délais.</p>
              <button class="btn btn-outline" @click="reset">Nouvelle réservation</button>
            </div>
          </Transition>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useReservationsStore } from '@/stores/reservations.js'
import { useToast } from '@/composables/useToast.js'
import { useContentStore } from '@/stores/content.js'

const reservations = useReservationsStore()
const { success } = useToast()
const content = useContentStore()

const loading = ref(false)
const submitted = ref(false)

const minDate = new Date().toISOString().split('T')[0]

const lunchSlots = ['12:00', '12:15', '12:30', '12:45', '13:00', '13:15', '13:30', '13:45', '14:00', '14:15']
const dinnerSlots = ['19:00', '19:15', '19:30', '19:45', '20:00', '20:15', '20:30', '20:45', '21:00', '21:15', '21:30']

// Vérifie si un créneau est complet pour la date sélectionnée
function isSlotFull(time) {
  if (!form.value.date) return false
  return reservations.isSlotFull(form.value.date, time)
}

const defaultForm = () => ({ name: '', email: '', phone: '', date: minDate, time: '', covers: 2, message: '' })
const form = ref(defaultForm())

const perks = [
  { icon: '⚡', title: 'Réponse rapide', desc: 'Confirmation sous 2h en moyenne' },
  { icon: '🔄', title: 'Modification facile', desc: 'Annulation gratuite jusqu\'à 24h avant' },
  { icon: '🎂', title: 'Occasions spéciales', desc: 'Anniversaires, dîners romantics…' },
]

async function submit() {
  if (!form.value.time) return
  loading.value = true
  await new Promise(r => setTimeout(r, 800)) // simulate async
  reservations.add({ ...form.value })
  loading.value = false
  submitted.value = true
  success('Réservation envoyée avec succès !')
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

.slot.full {
  background: var(--bg);
  border-color: var(--border);
  color: var(--text-muted);
  cursor: not-allowed;
  opacity: 0.55;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.1rem;
  padding-top: 0.25rem;
  padding-bottom: 0.25rem;
}

.slot-full-tag {
  font-size: 0.6rem;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  font-weight: 700;
  color: #ef4444;
  line-height: 1;
}

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
