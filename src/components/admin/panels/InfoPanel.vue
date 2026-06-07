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
          <label class="form-label">Google Maps Embed</label>
          <textarea v-model="form.mapsEmbed" class="form-textarea" rows="3" placeholder="Coller ici le tag iframe complet ou uniquement l'URL src"></textarea>
          <p class="form-hint">Google Maps → Partager → Intégrer une carte → copier le code iframe complet (ou juste l'URL). Les deux formats sont acceptés.</p>
        </div>
      </div>

      <!-- Hours -->
      <div class="card info-section hours-section">
        <div class="section-head">🕐 Horaires d'ouverture</div>
        <div class="hours-list">
          <div v-for="h in form.hours" :key="h.day" class="hour-row">

            <!-- Nom du jour + toggle ouvert/fermé -->
            <div class="day-toggle">
              <label class="toggle">
                <input type="checkbox" v-model="h.open" />
                <span class="toggle-track"><span class="toggle-thumb" /></span>
              </label>
              <span class="day-name" :class="{ closed: !h.open }">{{ h.day }}</span>
            </div>

            <!-- Services (visible seulement si le jour est ouvert) -->
            <div v-if="h.open" class="hour-services">

              <!-- Déjeuner -->
              <div class="service-line">
                <label class="service-toggle">
                  <label class="toggle toggle-sm">
                    <input type="checkbox" v-model="h.lunchOpen" />
                    <span class="toggle-track"><span class="toggle-thumb" /></span>
                  </label>
                  <span class="service-label" :class="{ 'service-off': !h.lunchOpen }">Midi</span>
                </label>
                <div v-if="h.lunchOpen" class="service-times">
                  <input v-model="h.lunch.from" type="time" class="time-input" />
                  <span class="time-sep">–</span>
                  <input v-model="h.lunch.to" type="time" class="time-input" />
                </div>
                <span v-else class="service-closed-tag">Fermé le midi</span>
              </div>

              <!-- Dîner -->
              <div class="service-line">
                <label class="service-toggle">
                  <label class="toggle toggle-sm">
                    <input type="checkbox" v-model="h.dinnerOpen" />
                    <span class="toggle-track"><span class="toggle-thumb" /></span>
                  </label>
                  <span class="service-label" :class="{ 'service-off': !h.dinnerOpen }">Soir</span>
                </label>
                <div v-if="h.dinnerOpen" class="service-times">
                  <input v-model="h.dinner.from" type="time" class="time-input" />
                  <span class="time-sep">–</span>
                  <input v-model="h.dinner.to" type="time" class="time-input" />
                </div>
                <span v-else class="service-closed-tag">Fermé le soir</span>
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

.hours-list { display: flex; flex-direction: column; gap: 0.5rem; }

.hour-row {
  display: flex;
  align-items: flex-start;
  gap: 1rem;
  padding: 0.65rem 0.75rem;
  background: var(--bg);
  border-radius: var(--radius-sm);
  flex-wrap: wrap;
}

.day-toggle {
  display: flex; align-items: center; gap: 0.6rem;
  width: 120px; flex-shrink: 0;
  padding-top: 0.2rem;
}
.day-name { font-size: 0.9rem; font-weight: 500; }
.day-name.closed { color: var(--text-muted); }

/* Services */
.hour-services { display: flex; flex-direction: column; gap: 0.45rem; flex: 1; }

.service-line {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  flex-wrap: wrap;
}

.service-toggle {
  display: flex; align-items: center; gap: 0.45rem;
  cursor: pointer; width: 80px; flex-shrink: 0;
}

.service-label {
  font-size: 0.82rem; font-weight: 500; color: var(--text);
  user-select: none;
}
.service-label.service-off { color: var(--text-muted); }

.service-times { display: flex; align-items: center; gap: 0.35rem; }

.service-closed-tag {
  font-size: 0.78rem;
  color: var(--text-muted);
  font-style: italic;
}

/* Toggle taille réduite */
.toggle-sm .toggle-track { width: 30px; height: 17px; }
.toggle-sm .toggle-thumb { width: 13px; height: 13px; }
.toggle-sm input:checked + .toggle-track .toggle-thumb { left: 15px; }

.time-input {
  padding: 0.3rem 0.45rem;
  border: 1.5px solid var(--border);
  border-radius: var(--radius-sm);
  font-size: 0.82rem;
  background: var(--bg-card);
  color: var(--text);
  font-family: var(--font-body);
}

.time-sep { color: var(--text-muted); font-size: 0.85rem; }

.closed-label { font-size: 0.85rem; color: var(--text-muted); font-style: italic; padding-top: 0.15rem; }

/* Toggle */
.toggle { display: flex; align-items: center; cursor: pointer; }
.toggle input { display: none; }
.toggle-track { width: 36px; height: 20px; background: var(--border); border-radius: 99px; position: relative; transition: background 0.2s; }
.toggle input:checked + .toggle-track { background: var(--primary); }
.toggle-thumb { position: absolute; top: 2px; left: 2px; width: 16px; height: 16px; background: #fff; border-radius: 50%; transition: left 0.2s; box-shadow: 0 1px 3px rgba(0,0,0,0.2); }
.toggle input:checked + .toggle-track .toggle-thumb { left: 18px; }
</style>
