<template>
  <section id="info" class="section info-section">
    <div class="container">
      <div class="section-header fade-up">
        <p class="section-label">Nous trouver</p>
        <h2 class="section-title">Informations</h2>
      </div>

      <div class="info-grid">
        <!-- Hours -->
        <div class="info-card card fade-up">
          <div class="info-card-title">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
            Horaires d'ouverture
          </div>
          <div class="hours-list">
            <div v-for="h in info.data.hours" :key="h.day" class="hour-row" :class="{ today: isToday(h.day) }">
              <span class="day-name">{{ h.day }}</span>
              <span v-if="!h.open" class="day-closed">Fermé</span>
              <span v-else class="day-hours">
                <!-- Midi -->
                <span v-if="h.lunchOpen !== false" class="service-slot">
                  <span class="service-tag">Midi</span>
                  {{ h.lunch.from }} – {{ h.lunch.to }}
                </span>
                <!-- Séparateur uniquement si les deux sont ouverts -->
                <span v-if="h.lunchOpen !== false && h.dinnerOpen !== false" class="sep">·</span>
                <!-- Soir -->
                <span v-if="h.dinnerOpen !== false" class="service-slot">
                  <span class="service-tag">Soir</span>
                  {{ h.dinner.from }} – {{ h.dinner.to }}
                </span>
                <!-- Aucun service actif mais jour marqué ouvert -->
                <span v-if="h.lunchOpen === false && h.dinnerOpen === false" class="day-closed">Fermé</span>
              </span>
            </div>
          </div>
        </div>

        <!-- Contact -->
        <div class="info-card card fade-up">
          <div class="info-card-title">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 12a19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 3.6 1.27h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L7.91 8.94a16 16 0 0 0 6 6l.92-.93a2 2 0 0 1 2.11-.45c.907.34 1.85.573 2.81.7A2 2 0 0 1 21.73 16.92z"/></svg>
            Contact & Adresse
          </div>
          <div class="contact-list">
            <a v-if="info.data.address" :href="`https://maps.google.com/?q=${encodeURIComponent(info.data.address)}`" target="_blank" class="contact-row">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>
              {{ info.data.address }}
            </a>
            <a v-if="info.data.phone" :href="`tel:${info.data.phone}`" class="contact-row">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 12a19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 3.6 1.27h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L7.91 8.94a16 16 0 0 0 6 6l.92-.93a2 2 0 0 1 2.11-.45c.907.34 1.85.573 2.81.7A2 2 0 0 1 21.73 16.92z"/></svg>
              {{ info.data.phone }}
            </a>
            <a v-if="info.data.email" :href="`mailto:${info.data.email}`" class="contact-row">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>
              {{ info.data.email }}
            </a>
          </div>

          <div v-if="info.data.instagram || info.data.facebook" class="socials">
            <a v-if="info.data.instagram" :href="`https://instagram.com/${info.data.instagram}`" target="_blank" class="social-btn instagram">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="2" y="2" width="20" height="20" rx="5"/><circle cx="12" cy="12" r="4"/><circle cx="17.5" cy="6.5" r="0.5" fill="currentColor"/></svg>
              @{{ info.data.instagram }}
            </a>
            <a v-if="info.data.facebook" :href="`https://facebook.com/${info.data.facebook}`" target="_blank" class="social-btn facebook">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/></svg>
              {{ info.data.facebook }}
            </a>
          </div>
        </div>

        <!-- Map -->
        <div v-if="mapsSrc" class="info-map card fade-up">
          <iframe :src="mapsSrc" width="100%" height="100%" style="border:0" allowfullscreen loading="lazy" referrerpolicy="no-referrer-when-downgrade"></iframe>
        </div>
        <div v-else class="info-map card fade-up map-placeholder">
          <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" opacity="0.3"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>
          <p>Carte à configurer dans l'administration</p>
        </div>
      </div>
    </div>
  </section>

  <!-- Footer -->
  <footer class="footer">
    <div class="container footer-inner">
      <span class="footer-brand">{{ info.data.name }}</span>
      <span class="footer-copy">© {{ new Date().getFullYear() }} · Tous droits réservés</span>
      <RouterLink to="/admin" class="footer-admin">⚙</RouterLink>
    </div>
  </footer>
</template>

<script setup>
import { computed } from 'vue'
import { useInfoStore } from '@/stores/info.js'
const info = useInfoStore()

const DAYS_FR = ['Dimanche', 'Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi']

function isToday(dayName) {
  return DAYS_FR[new Date().getDay()] === dayName
}

// L'utilisateur peut coller soit l'URL brute, soit le tag <iframe> complet.
// On extrait toujours l'URL propre pour l'attribut src.
const mapsSrc = computed(() => {
  const raw = info.data.mapsEmbed?.trim()
  if (!raw) return ''
  // Si c'est un tag <iframe ...>, on extrait la valeur de src="..."
  const match = raw.match(/src=["']([^"']+)["']/)
  return match ? match[1] : raw
})
</script>

<style scoped>
.info-section { background: var(--bg-card); }
.section-header { text-align: center; margin-bottom: 3rem; }

.info-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  grid-template-rows: auto auto;
  gap: 1.5rem;
}

.info-card { padding: 1.75rem; }

.info-card-title {
  display: flex;
  align-items: center;
  gap: 0.6rem;
  font-family: var(--font-heading);
  font-size: 1.1rem;
  color: var(--text);
  margin-bottom: 1.25rem;
  padding-bottom: 0.75rem;
  border-bottom: 1px solid var(--border);
}

.hours-list { display: flex; flex-direction: column; gap: 0.5rem; }

.hour-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 0.88rem;
  padding: 0.35rem 0.5rem;
  border-radius: var(--radius-sm);
}

.hour-row.today {
  background: rgba(107, 124, 92, 0.08);
  color: var(--primary);
  font-weight: 600;
}

.day-name { color: var(--text); }
.day-hours { display: flex; align-items: center; gap: 0.35rem; flex-wrap: wrap; color: var(--text-light); }
.sep { opacity: 0.35; }
.day-closed { color: var(--text-muted); font-style: italic; }

.service-slot { display: flex; align-items: center; gap: 0.3rem; }
.service-tag {
  font-size: 0.68rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.06em;
  color: var(--primary);
  background: color-mix(in srgb, var(--primary) 10%, transparent);
  padding: 0.1rem 0.35rem;
  border-radius: 4px;
}

.contact-list { display: flex; flex-direction: column; gap: 0.75rem; margin-bottom: 1.5rem; }

.contact-row {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  font-size: 0.9rem;
  color: var(--text-light);
  text-decoration: none;
  padding: 0.5rem;
  border-radius: var(--radius-sm);
  transition: all 0.2s;
}

.contact-row:hover { background: var(--border); color: var(--primary); }

.socials { display: flex; flex-direction: column; gap: 0.5rem; }

.social-btn {
  display: flex;
  align-items: center;
  gap: 0.6rem;
  padding: 0.6rem 0.9rem;
  border-radius: var(--radius-sm);
  font-size: 0.85rem;
  font-weight: 500;
  text-decoration: none;
  transition: all 0.2s;
}

.instagram { background: #fce4ec; color: #c62828; }
.instagram:hover { background: #f48fb1; }
.facebook  { background: #e3f2fd; color: #1565c0; }
.facebook:hover  { background: #90caf9; }

.info-map {
  grid-column: span 2;
  height: 300px;
  overflow: hidden;
  padding: 0;
}

.map-placeholder {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 0.75rem;
  color: var(--text-muted);
  font-style: italic;
  font-size: 0.9rem;
}

/* Footer */
.footer {
  background: var(--primary-dark);
  color: rgba(255,255,255,0.7);
  padding: 1.25rem 0;
}

.footer-inner {
  display: flex;
  align-items: center;
  justify-content: space-between;
  font-size: 0.85rem;
}

.footer-brand { font-family: var(--font-heading); color: #fff; font-size: 1rem; }
.footer-admin { color: rgba(255,255,255,0.3); text-decoration: none; font-size: 1rem; transition: color 0.2s; }
.footer-admin:hover { color: rgba(255,255,255,0.7); }

@media (max-width: 768px) {
  .info-grid { grid-template-columns: 1fr; }
  .info-map { grid-column: 1; }
  .footer-inner { flex-direction: column; gap: 0.5rem; text-align: center; }
}
</style>
