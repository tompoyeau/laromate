<template>
  <div class="info-panel">
    <div class="panel-header">
      <h2 class="panel-title">Informations du restaurant</h2>
      <button class="btn btn-primary btn-sm" @click="saveAll">✓ Enregistrer</button>
    </div>

    <div class="info-grid">
      <!-- Contact -->
      <div class="card info-section">
        <div class="section-head">📞 Contact & Coordonnées</div>
        <div class="form-group">
          <label class="form-label">Nom du restaurant</label>
          <input v-model="form.name" class="form-input" />
        </div>
        <div class="form-group">
          <label class="form-label">Adresse</label>
          <input v-model="form.address" class="form-input" placeholder="123 rue Exemple, 75001 Paris" />
        </div>
        <div class="form-row">
          <div class="form-group">
            <label class="form-label">Téléphone</label>
            <input v-model="form.phone" class="form-input" placeholder="01 23 45 67 89" />
          </div>
          <div class="form-group">
            <label class="form-label">Email</label>
            <input v-model="form.email" class="form-input" type="email" />
          </div>
        </div>
      </div>

      <!-- Social -->
      <div class="card info-section">
        <div class="section-head">📱 Réseaux sociaux</div>
        <div class="form-group">
          <label class="form-label">Instagram (identifiant sans @)</label>
          <div class="social-input">
            <span class="social-prefix">@</span>
            <input v-model="form.instagram" class="form-input" placeholder="laromate_restaurant" />
          </div>
        </div>
        <div class="form-group">
          <label class="form-label">Facebook (identifiant de page)</label>
          <div class="social-input">
            <span class="social-prefix">fb.com/</span>
            <input v-model="form.facebook" class="form-input" placeholder="laromate" />
          </div>
        </div>
        <div class="form-group">
          <label class="form-label">Lien Google Maps Embed</label>
          <textarea v-model="form.mapsEmbed" class="form-textarea" rows="3" placeholder='<iframe src="https://www.google.com/maps/embed?…"></iframe>'></textarea>
          <p class="form-hint">Google Maps → Partager → Intégrer une carte → copier l'URL src de l'iframe</p>
        </div>
      </div>

      <!-- Hours -->
      <div class="card info-section hours-section">
        <div class="section-head">🕐 Horaires d'ouverture</div>
        <div class="hours-list">
          <div v-for="(h, i) in form.hours" :key="h.day" class="hour-row">
            <div class="day-toggle">
              <label class="toggle">
                <input type="checkbox" v-model="h.open" />
                <span class="toggle-track"><span class="toggle-thumb" /></span>
              </label>
              <span class="day-name" :class="{ closed: !h.open }">{{ h.day }}</span>
            </div>
            <div class="hour-inputs" v-if="h.open">
              <div class="service-group">
                <span class="service-label">Déj.</span>
                <input v-model="h.lunch.from" type="time" class="time-input" />
                <span class="time-sep">–</span>
                <input v-model="h.lunch.to" type="time" class="time-input" />
              </div>
              <div class="service-group">
                <span class="service-label">Dîner</span>
                <input v-model="h.dinner.from" type="time" class="time-input" />
                <span class="time-sep">–</span>
                <input v-model="h.dinner.to" type="time" class="time-input" />
              </div>
            </div>
            <div v-else class="closed-label">Fermé</div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useInfoStore } from '@/stores/info.js'
import { useToast } from '@/composables/useToast.js'

const infoStore = useInfoStore()
const { success } = useToast()

const form = ref(JSON.parse(JSON.stringify(infoStore.data)))

function saveAll() {
  infoStore.update(form.value)
  infoStore.updateHours(form.value.hours)
  success('Informations enregistrées !')
}
</script>

<style scoped>
.panel-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 1.5rem; }
.panel-title { font-family: var(--font-heading); font-size: 1.6rem; }

.info-grid { display: flex; flex-direction: column; gap: 1.25rem; }

.info-section { padding: 1.5rem; }
.section-head { font-weight: 600; font-size: 0.95rem; margin-bottom: 1.25rem; padding-bottom: 0.75rem; border-bottom: 1px solid var(--border); }

.social-input { display: flex; align-items: center; }
.social-prefix { padding: 0.65rem 0.75rem; background: var(--bg); border: 1.5px solid var(--border); border-right: none; border-radius: var(--radius-sm) 0 0 var(--radius-sm); font-size: 0.85rem; color: var(--text-muted); white-space: nowrap; }
.social-input .form-input { border-radius: 0 var(--radius-sm) var(--radius-sm) 0; }

.form-hint { font-size: 0.78rem; color: var(--text-muted); margin-top: 0.4rem; }

.hours-section .form-group { flex: 1; }

.hours-list { display: flex; flex-direction: column; gap: 0.6rem; }

.hour-row {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 0.6rem 0.75rem;
  background: var(--bg);
  border-radius: var(--radius-sm);
  flex-wrap: wrap;
}

.day-toggle { display: flex; align-items: center; gap: 0.6rem; width: 130px; flex-shrink: 0; }
.day-name { font-size: 0.9rem; font-weight: 500; }
.day-name.closed { color: var(--text-muted); }

.hour-inputs { display: flex; flex-direction: column; gap: 0.4rem; flex: 1; }

.service-group { display: flex; align-items: center; gap: 0.4rem; }
.service-label { font-size: 0.75rem; color: var(--text-muted); width: 40px; flex-shrink: 0; }
.time-input { padding: 0.35rem 0.5rem; border: 1.5px solid var(--border); border-radius: var(--radius-sm); font-size: 0.85rem; background: var(--bg-card); color: var(--text); font-family: var(--font-body); }
.time-sep { color: var(--text-muted); }

.closed-label { font-size: 0.85rem; color: var(--text-muted); font-style: italic; }

/* Toggle */
.toggle { display: flex; align-items: center; cursor: pointer; }
.toggle input { display: none; }
.toggle-track { width: 36px; height: 20px; background: var(--border); border-radius: 99px; position: relative; transition: background 0.2s; }
.toggle input:checked + .toggle-track { background: var(--primary); }
.toggle-thumb { position: absolute; top: 2px; left: 2px; width: 16px; height: 16px; background: #fff; border-radius: 50%; transition: left 0.2s; box-shadow: 0 1px 3px rgba(0,0,0,0.2); }
.toggle input:checked + .toggle-track .toggle-thumb { left: 18px; }
</style>
