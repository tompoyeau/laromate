<template>
  <div class="google-panel">
    <div class="panel-header">
      <h2 class="panel-title">
        <GoogleLogo :size="26" />
        Google Reviews
      </h2>
      <button class="btn btn-primary btn-sm" @click="openAdd">+ Ajouter un avis</button>
    </div>

    <!-- Lien Google Maps -->
    <div class="card maps-card">
      <div class="maps-row">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="flex-shrink:0;color:var(--text-muted)"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>
        <input v-model="data.mapsUrl" class="form-input maps-input" placeholder="Lien Google Maps (optionnel) — pour le bouton « Laisser un avis »" @change="save" />
      </div>
    </div>

    <!-- Reviews list -->
    <div v-if="google.data.reviews.length" class="reviews-list">
      <div v-for="(r, i) in google.data.reviews" :key="r.id" class="review-row card">
        <div class="review-row-top">
          <div class="review-row-author">
            <div class="author-av">{{ r.author[0] }}</div>
            <div>
              <div class="author-name">{{ r.author }}</div>
              <div class="review-stars">
                <span v-for="s in 5" :key="s" :style="{ color: s <= r.rating ? '#fbbc04' : '#e0e0e0' }">★</span>
                <span class="review-date-text">· {{ r.date }}</span>
              </div>
            </div>
          </div>
          <div class="review-row-actions">
            <button class="btn-icon" @click="google.moveUp(r.id)" :disabled="i === 0" title="Monter">↑</button>
            <button class="btn-icon" @click="google.moveDown(r.id)" :disabled="i === google.data.reviews.length - 1" title="Descendre">↓</button>
            <button class="btn-icon" @click="openEdit(r)" title="Modifier">✏️</button>
            <button class="btn-icon danger" @click="remove(r.id)" title="Supprimer">🗑</button>
          </div>
        </div>
        <p class="review-text-preview">{{ r.text }}</p>
      </div>
    </div>

    <div v-else class="empty-state card">
      <div class="empty-icon">
        <GoogleLogo :size="48" />
      </div>
      <h3>Aucun avis Google ajouté</h3>
      <p>Copie tes meilleurs avis depuis Google Maps et ajoute-les ici pour les afficher sur le site.</p>
      <button class="btn btn-primary" @click="openAdd">Ajouter le premier avis</button>
    </div>

    <!-- Modal -->
    <AppModal v-model="modal" :title="editing ? 'Modifier l\'avis' : 'Ajouter un avis Google'">
      <div class="form-group">
        <label class="form-label">Nom du client *</label>
        <input v-model="form.author" class="form-input" placeholder="Marie L." required />
      </div>
      <div class="form-row">
        <div class="form-group">
          <label class="form-label">Note *</label>
          <div class="star-picker">
            <span
              v-for="n in 5" :key="n"
              class="pick-star"
              :style="{ color: n <= form.rating ? '#fbbc04' : '#e0e0e0' }"
              @click="form.rating = n"
            >★</span>
          </div>
        </div>
        <div class="form-group">
          <label class="form-label">Date affichée</label>
          <input v-model="form.date" class="form-input" placeholder="il y a 2 semaines" />
        </div>
      </div>
      <div class="form-group">
        <label class="form-label">Texte de l'avis *</label>
        <textarea v-model="form.text" class="form-textarea" rows="5"
          placeholder="Copier l'avis depuis Google Maps…" required></textarea>
      </div>
      <template #footer>
        <button class="btn btn-ghost" @click="modal = false">Annuler</button>
        <button class="btn btn-primary" @click="saveReview">{{ editing ? 'Mettre à jour' : 'Ajouter' }}</button>
      </template>
    </AppModal>
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue'
import { useGooglePlacesStore } from '@/stores/googlePlaces.js'
import { useToast } from '@/composables/useToast.js'
import AppModal from '@/components/ui/AppModal.vue'

// Inline Google logo component
const GoogleLogo = {
  props: { size: { default: 20 } },
  template: `<svg :width="size" :height="size" viewBox="0 0 24 24">
    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
  </svg>`
}

const google = useGooglePlacesStore()
const { success } = useToast()

const data = google.data

const modal = ref(false)
const editing = ref(null)
const defaultForm = () => ({ author: '', rating: 5, text: '', date: 'il y a quelques jours' })
const form = reactive(defaultForm())

function openAdd() { editing.value = null; Object.assign(form, defaultForm()); modal.value = true }
function openEdit(r) { editing.value = r; Object.assign(form, { ...r }); modal.value = true }

function saveReview() {
  if (!form.author.trim() || !form.text.trim() || !form.rating) return
  if (editing.value) {
    google.updateReview(editing.value.id, { ...form })
    success('Avis mis à jour')
  } else {
    google.addReview({ ...form })
    success('Avis ajouté !')
  }
  modal.value = false
}

function save() { google.save() }

function remove(id) {
  if (!confirm('Supprimer cet avis ?')) return
  google.removeReview(id)
  success('Avis supprimé')
}
</script>

<style scoped>
.panel-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 1.5rem; }
.panel-title { font-family: var(--font-heading); font-size: 1.6rem; display: flex; align-items: center; gap: 0.6rem; }

.maps-card { padding: 0.6rem 1rem; margin-bottom: 1.25rem; }
.maps-row { display: flex; align-items: center; gap: 0.6rem; }
.maps-input { flex: 1; font-size: 0.88rem; }

.reviews-list { display: flex; flex-direction: column; gap: 0.75rem; }

.review-row { padding: 1rem 1.25rem; }
.review-row-top { display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.5rem; }
.review-row-author { display: flex; align-items: center; gap: 0.75rem; }

.author-av {
  width: 36px; height: 36px;
  border-radius: 50%;
  background: #4285F4;
  color: #fff;
  display: flex; align-items: center; justify-content: center;
  font-weight: 700; font-size: 0.95rem;
  flex-shrink: 0;
}

.author-name { font-weight: 600; font-size: 0.92rem; }

.review-stars { font-size: 0.9rem; display: flex; align-items: center; gap: 0.2rem; }
.review-date-text { font-size: 0.78rem; color: var(--text-muted); margin-left: 0.2rem; }

.review-row-actions { display: flex; gap: 0.25rem; }
.danger:hover { background: #fee2e2; color: #dc2626; }

.review-text-preview { font-size: 0.85rem; color: var(--text-light); line-height: 1.5; }

.empty-state {
  padding: 4rem 2rem;
  text-align: center;
  display: flex; flex-direction: column; align-items: center; gap: 0.75rem;
}
.empty-icon { opacity: 0.5; }
.empty-state h3 { font-family: var(--font-heading); font-size: 1.3rem; }
.empty-state p  { color: var(--text-light); max-width: 400px; }

.star-picker { display: flex; gap: 4px; cursor: pointer; }
.pick-star { font-size: 1.8rem; transition: transform 0.1s; }
.pick-star:hover { transform: scale(1.2); }
</style>
