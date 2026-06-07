<template>
  <div class="google-panel">
    <div class="panel-header">
      <h2 class="panel-title">
        <svg class="google-g" viewBox="0 0 24 24" width="28" height="28">
          <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
          <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
          <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
          <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
        </svg>
        Intégration Google Reviews
      </h2>
      <div :class="['status-badge', google.isConfigured ? 'active' : 'inactive']">
        {{ google.isConfigured ? '● Connecté' : '○ Non configuré' }}
      </div>
    </div>

    <!-- Current data preview -->
    <div v-if="google.placeData" class="google-preview card">
      <div class="preview-rating">
        <div class="rating-number">{{ google.placeData.rating }}</div>
        <div class="rating-stars">
          <span v-for="i in 5" :key="i" class="star" :class="{ filled: i <= Math.round(google.placeData.rating) }">★</span>
        </div>
        <div class="rating-count">{{ google.placeData.userRatingsTotal?.toLocaleString('fr-FR') }} avis Google</div>
      </div>
      <div class="preview-name">{{ google.placeData.name }}</div>
      <div class="preview-meta">
        <span class="cache-info">🕐 Mis à jour : {{ formatCacheDate(google.placeData.fetchedAt) }}</span>
        <a v-if="google.placeData.url" :href="google.placeData.url" target="_blank" class="btn btn-ghost btn-sm">
          Voir sur Google Maps ↗
        </a>
      </div>

      <!-- Reviews preview -->
      <div v-if="google.placeData.reviews?.length" class="reviews-preview">
        <div class="reviews-preview-title">Avis récupérés ({{ google.placeData.reviews.length }})</div>
        <div v-for="r in google.placeData.reviews.slice(0, 3)" :key="r.authorName" class="review-mini">
          <img v-if="r.profilePhotoUrl" :src="r.profilePhotoUrl" :alt="r.authorName" class="review-avatar" />
          <div v-else class="review-avatar-placeholder">{{ r.authorName[0] }}</div>
          <div class="review-mini-content">
            <div class="review-mini-head">
              <span class="review-mini-name">{{ r.authorName }}</span>
              <span class="review-mini-stars">{{ '★'.repeat(r.rating) }}</span>
              <span class="review-mini-time">{{ r.relativeTimeDescription }}</span>
            </div>
            <p class="review-mini-text">{{ r.text?.slice(0, 120) }}{{ r.text?.length > 120 ? '…' : '' }}</p>
          </div>
        </div>
      </div>
    </div>

    <!-- Configuration -->
    <div class="config-card card">
      <div class="section-head">⚙️ Configuration</div>

      <div class="form-group">
        <label class="form-label">
          <span class="toggle-label">
            <label class="toggle">
              <input type="checkbox" v-model="form.enabled" />
              <span class="toggle-track"><span class="toggle-thumb" /></span>
            </label>
            Activer l'intégration Google Reviews
          </span>
        </label>
      </div>

      <div class="form-group">
        <label class="form-label">
          Google Place ID
          <a href="https://developers.google.com/maps/documentation/javascript/place-id#find-id" target="_blank" class="help-link">Comment trouver mon Place ID ?</a>
        </label>
        <input v-model="form.placeId" class="form-input" placeholder="ChIJN1t_tDeuEmsRUsoyG83frY4" />
        <p class="form-hint">
          Astuce : cherchez votre restaurant sur <a href="https://developers.google.com/maps/documentation/javascript/examples/places-placeid-finder" target="_blank">Place ID Finder</a> ou dans l'URL Google Maps (après <code>1s</code>)
        </p>
      </div>

      <div class="form-group">
        <label class="form-label">
          Clé API Google Maps
          <a href="https://console.cloud.google.com/apis/credentials" target="_blank" class="help-link">Créer une clé API ↗</a>
        </label>
        <div class="api-key-wrap">
          <input
            v-model="form.apiKey"
            :type="showKey ? 'text' : 'password'"
            class="form-input"
            placeholder="AIzaSy…"
          />
          <button type="button" class="toggle-key" @click="showKey = !showKey">{{ showKey ? '🙈' : '👁' }}</button>
        </div>
        <p class="form-hint">
          Activer les APIs : <strong>Maps JavaScript API</strong> + <strong>Places API</strong><br/>
          Restreindre à vos domaines (HTTP referrers) pour la sécurité.
        </p>
      </div>

      <div class="config-actions">
        <button class="btn btn-ghost" @click="resetForm">Annuler</button>
        <button class="btn btn-outline" @click="testAndFetch" :disabled="!form.placeId || !form.apiKey || testing">
          <svg v-if="testing" class="spin" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 12a9 9 0 1 1-6.219-8.56"/></svg>
          {{ testing ? 'Test en cours…' : '🔍 Tester la connexion' }}
        </button>
        <button class="btn btn-primary" @click="save">✓ Enregistrer</button>
      </div>

      <div v-if="testResult" :class="['test-result', testResult.success ? 'success' : 'error']">
        {{ testResult.message }}
      </div>
    </div>

    <!-- How it works -->
    <div class="card info-card">
      <div class="section-head">💡 Comment ça fonctionne ?</div>
      <div class="steps">
        <div class="step" v-for="s in steps" :key="s.n">
          <div class="step-n">{{ s.n }}</div>
          <div>
            <div class="step-title">{{ s.title }}</div>
            <div class="step-desc">{{ s.desc }}</div>
          </div>
        </div>
      </div>
      <div class="api-note">
        📊 <strong>Quota gratuit Google :</strong> 5 000 appels/mois · Les avis sont mis en cache 24h pour minimiser les appels.
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue'
import { useGooglePlacesStore } from '@/stores/googlePlaces.js'
import { useToast } from '@/composables/useToast.js'

const google = useGooglePlacesStore()
const { success, error: toastError } = useToast()

const showKey = ref(false)
const testing = ref(false)
const testResult = ref(null)

const form = reactive({ ...google.config })

function resetForm() {
  Object.assign(form, google.config)
}

function save() {
  google.updateConfig({ ...form })
  success('Configuration enregistrée !')
  if (form.enabled && form.placeId && form.apiKey) {
    google.clearCache()
    google.fetch()
  }
}

async function testAndFetch() {
  testing.value = true
  testResult.value = null

  // Temporarily save config to test
  google.updateConfig({ ...form })
  google.clearCache()

  await google.fetch(true)
  testing.value = false

  if (google.error) {
    testResult.value = { success: false, message: `❌ Erreur : ${google.error}` }
  } else if (google.placeData) {
    testResult.value = {
      success: true,
      message: `✅ Connecté ! "${google.placeData.name}" — Note : ${google.placeData.rating}/5 (${google.placeData.userRatingsTotal} avis)`
    }
  }
}

function formatCacheDate(ts) {
  if (!ts) return '—'
  return new Date(ts).toLocaleString('fr-FR', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })
}

const steps = [
  { n: '1', title: 'Créez une clé API Google', desc: 'Dans Google Cloud Console, activez "Maps JavaScript API" et "Places API".' },
  { n: '2', title: 'Trouvez votre Place ID', desc: 'Utilisez le Place ID Finder avec le nom et l\'adresse de votre restaurant.' },
  { n: '3', title: 'Configurez ici', desc: 'Entrez votre Place ID et clé API, cliquez sur "Tester".' },
  { n: '4', title: 'Affiché automatiquement', desc: 'La note et les 5 meilleurs avis Google s\'affichent sur le site. Cache de 24h.' },
]
</script>

<style scoped>
.panel-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 1.5rem; flex-wrap: wrap; gap: 1rem; }

.panel-title {
  font-family: var(--font-heading);
  font-size: 1.6rem;
  display: flex;
  align-items: center;
  gap: 0.6rem;
}

.google-g { flex-shrink: 0; }

.status-badge {
  font-size: 0.82rem;
  font-weight: 600;
  padding: 0.35rem 0.85rem;
  border-radius: 99px;
}
.status-badge.active   { background: #d1fae5; color: #065f46; }
.status-badge.inactive { background: var(--border); color: var(--text-muted); }

/* Preview */
.google-preview { padding: 1.5rem; margin-bottom: 1.25rem; }

.preview-rating {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  margin-bottom: 0.5rem;
}

.rating-number {
  font-size: 2.5rem;
  font-weight: 700;
  color: var(--text);
  font-family: var(--font-heading);
  line-height: 1;
}

.rating-stars { display: flex; gap: 2px; }
.star { font-size: 1.3rem; color: var(--border); }
.star.filled { color: #fbbc04; }

.rating-count { font-size: 0.88rem; color: var(--text-light); }

.preview-name { font-weight: 600; margin-bottom: 0.5rem; }

.preview-meta {
  display: flex;
  align-items: center;
  justify-content: space-between;
  font-size: 0.82rem;
  color: var(--text-muted);
  padding-bottom: 1rem;
  margin-bottom: 1rem;
  border-bottom: 1px solid var(--border);
}

.cache-info { font-size: 0.78rem; }

.reviews-preview { display: flex; flex-direction: column; gap: 0.75rem; }

.reviews-preview-title { font-size: 0.8rem; font-weight: 600; color: var(--text-muted); text-transform: uppercase; letter-spacing: 0.05em; margin-bottom: 0.25rem; }

.review-mini { display: flex; gap: 0.75rem; padding: 0.75rem; background: var(--bg); border-radius: var(--radius-sm); }

.review-avatar { width: 32px; height: 32px; border-radius: 50%; object-fit: cover; flex-shrink: 0; }
.review-avatar-placeholder {
  width: 32px; height: 32px;
  border-radius: 50%;
  background: #4285F4;
  color: #fff;
  display: flex; align-items: center; justify-content: center;
  font-size: 0.85rem;
  font-weight: 600;
  flex-shrink: 0;
}

.review-mini-content { flex: 1; min-width: 0; }

.review-mini-head { display: flex; align-items: center; gap: 0.5rem; margin-bottom: 0.25rem; flex-wrap: wrap; }
.review-mini-name { font-weight: 600; font-size: 0.85rem; }
.review-mini-stars { color: #fbbc04; font-size: 0.8rem; }
.review-mini-time { font-size: 0.75rem; color: var(--text-muted); }
.review-mini-text { font-size: 0.82rem; color: var(--text-light); line-height: 1.4; }

/* Config */
.config-card { padding: 1.5rem; margin-bottom: 1.25rem; }
.section-head { font-weight: 600; font-size: 0.95rem; margin-bottom: 1.25rem; padding-bottom: 0.75rem; border-bottom: 1px solid var(--border); }

.toggle-label { display: flex; align-items: center; gap: 0.75rem; font-weight: 500; }

.toggle { display: inline-flex; align-items: center; cursor: pointer; }
.toggle input { display: none; }
.toggle-track { width: 42px; height: 24px; background: var(--border); border-radius: 99px; position: relative; transition: background 0.2s; }
.toggle input:checked + .toggle-track { background: var(--primary); }
.toggle-thumb { position: absolute; top: 3px; left: 3px; width: 18px; height: 18px; background: #fff; border-radius: 50%; transition: left 0.2s; box-shadow: 0 1px 3px rgba(0,0,0,0.2); }
.toggle input:checked + .toggle-track .toggle-thumb { left: 21px; }

.help-link { margin-left: 0.5rem; color: #4285F4; font-size: 0.8rem; text-decoration: underline; }

.api-key-wrap { position: relative; }
.toggle-key {
  position: absolute; right: 0.75rem; top: 50%; transform: translateY(-50%);
  background: none; border: none; cursor: pointer; font-size: 1rem;
}

.form-hint { font-size: 0.78rem; color: var(--text-muted); margin-top: 0.4rem; line-height: 1.5; }
.form-hint code { background: var(--border); padding: 0.1rem 0.3rem; border-radius: 3px; font-size: 0.75rem; }

.config-actions { display: flex; gap: 0.75rem; justify-content: flex-end; margin-top: 1.25rem; }

.test-result {
  margin-top: 1rem;
  padding: 0.75rem 1rem;
  border-radius: var(--radius-sm);
  font-size: 0.88rem;
}
.test-result.success { background: #d1fae5; color: #065f46; }
.test-result.error   { background: #fee2e2; color: #dc2626; }

/* Info card */
.info-card { padding: 1.5rem; }
.steps { display: flex; flex-direction: column; gap: 1rem; margin-bottom: 1.25rem; }

.step { display: flex; gap: 1rem; align-items: flex-start; }
.step-n {
  width: 28px; height: 28px;
  background: #4285F4;
  color: #fff;
  border-radius: 50%;
  display: flex; align-items: center; justify-content: center;
  font-size: 0.82rem;
  font-weight: 700;
  flex-shrink: 0;
}
.step-title { font-weight: 600; font-size: 0.9rem; margin-bottom: 0.15rem; }
.step-desc  { font-size: 0.82rem; color: var(--text-light); line-height: 1.4; }

.api-note {
  background: #e8f0fe;
  color: #1a73e8;
  padding: 0.75rem 1rem;
  border-radius: var(--radius-sm);
  font-size: 0.85rem;
}

.spin { animation: spin 0.8s linear infinite; }
@keyframes spin { to { transform: rotate(360deg); } }
</style>
