<template>
  <div class="content-panel">
    <div class="panel-header">
      <h2 class="panel-title">Contenu du site</h2>
      <button class="btn btn-primary btn-sm" @click="saveAll">✓ Enregistrer</button>
    </div>

    <!-- ── IMAGE HERO ─────────────────────────────────────────────────────── -->
    <div class="card section-card">
      <div class="section-head">🖼️ Image d'accueil</div>
      <p class="section-hint">L'image de fond plein-écran affiché en haut du site.</p>

      <div class="hero-img-wrap">
        <!-- Aperçu -->
        <div class="hero-preview" :style="{ backgroundImage: `url(${previewSrc})` }">
          <div class="hero-preview-overlay">
            <span class="preview-label">Aperçu</span>
          </div>
        </div>

        <!-- Actions -->
        <div class="hero-img-actions">
          <div
            class="img-dropzone"
            :class="{ dragging: heroImgDragging }"
            @dragover.prevent="heroImgDragging = true"
            @dragleave="heroImgDragging = false"
            @drop.prevent="handleHeroDrop"
            @click="$refs.heroInput.click()"
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>
            <span>Glisser une photo ou <u>cliquer</u></span>
            <span class="dz-hint">JPG, PNG, WEBP · Recommandé : paysage 1600×900+</span>
          </div>
          <input ref="heroInput" type="file" accept="image/*" style="display:none" @change="handleHeroFile" />

          <div class="hero-img-meta" v-if="content.heroImage">
            <span class="img-status">✓ Image personnalisée chargée</span>
            <button class="btn btn-ghost btn-sm" @click="resetHeroImage">↩ Remettre l'image par défaut</button>
          </div>
          <div class="hero-img-meta" v-else>
            <span class="img-status muted">Image par défaut (Unsplash)</span>
          </div>

          <div class="form-group" style="margin-top:0.75rem">
            <label class="form-label">Ou saisir une URL d'image</label>
            <input v-model="form.heroImageFallback" class="form-input" placeholder="https://…" />
            <p class="form-hint">Utilisée si aucune image n'est uploadée ci-dessus.</p>
          </div>
        </div>
      </div>
    </div>

    <!-- ── HERO TEXTES ─────────────────────────────────────────────────────── -->
    <div class="card section-card">
      <div class="section-head">✏️ Textes de la page d'accueil</div>

      <div class="form-group">
        <label class="form-label">Étiquette (au-dessus du titre)</label>
        <input v-model="form.heroLabel" class="form-input" placeholder="Restaurant · Bordeaux" />
      </div>
      <div class="form-row">
        <div class="form-group">
          <label class="form-label">Titre ligne 1 <span class="form-hint-inline">(italique)</span></label>
          <input v-model="form.heroTitle1" class="form-input" placeholder="L'art du" />
        </div>
        <div class="form-group">
          <label class="form-label">Titre ligne 2</label>
          <input v-model="form.heroTitle2" class="form-input" placeholder="burger artisanal" />
        </div>
      </div>
      <div class="form-group">
        <label class="form-label">Description</label>
        <textarea v-model="form.heroDesc" class="form-textarea" rows="3"
          placeholder="Des produits frais, des recettes maison…"></textarea>
      </div>
      <div class="form-group">
        <label class="form-label">Badge tournant</label>
        <div class="badge-fields">
          <input v-model="form.heroBadgeTop"  class="form-input" placeholder="Fait" style="flex:1" />
          <input v-model="form.heroBadgeMain" class="form-input" placeholder="Maison" style="flex:1.5" />
          <input v-model="form.heroBadgeSub"  class="form-input" placeholder="depuis 2020" style="flex:2" />
        </div>
        <p class="form-hint">Ligne 1 (petite) · Ligne 2 (grande) · Ligne 3 (petite)</p>
      </div>
    </div>

    <!-- ── EN-TÊTES DES SECTIONS ───────────────────────────────────────────── -->
    <div class="card section-card">
      <div class="section-head">📋 En-têtes des sections</div>
      <p class="section-hint">Chaque section du site a un label, un titre et un sous-titre.</p>

      <div v-for="sec in sectionHeaders" :key="sec.key" class="section-block">
        <div class="section-block-title">{{ sec.icon }} {{ sec.label }}</div>
        <div class="form-row">
          <div class="form-group">
            <label class="form-label">Étiquette</label>
            <input v-model="form[sec.key + 'Label']" class="form-input" :placeholder="sec.placeholders.label" />
          </div>
          <div class="form-group">
            <label class="form-label">Titre</label>
            <input v-model="form[sec.key + 'Title']" class="form-input" :placeholder="sec.placeholders.title" />
          </div>
        </div>
        <div v-if="sec.hasSubtitle" class="form-group">
          <label class="form-label">Sous-titre</label>
          <input v-model="form[sec.key + 'Subtitle']" class="form-input" :placeholder="sec.placeholders.subtitle" />
        </div>
      </div>
    </div>

    <!-- ── RÉSERVATION ─────────────────────────────────────────────────────── -->
    <div class="card section-card">
      <div class="section-head">📅 Section réservation</div>

      <div class="form-row">
        <div class="form-group">
          <label class="form-label">Titre ligne 1</label>
          <input v-model="form.reservationTitle" class="form-input" placeholder="Votre table" />
        </div>
        <div class="form-group">
          <label class="form-label">Titre ligne 2</label>
          <input v-model="form.reservationTitle2" class="form-input" placeholder="vous attend" />
        </div>
      </div>
      <div class="form-group">
        <label class="form-label">Description</label>
        <textarea v-model="form.reservationDesc" class="form-textarea" rows="3"
          placeholder="Réservez en ligne en quelques secondes…"></textarea>
      </div>
    </div>

    <!-- Bouton bas de page -->
    <div class="save-bar">
      <button class="btn btn-primary" @click="saveAll">✓ Enregistrer toutes les modifications</button>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useContentStore } from '@/stores/content.js'
import { useToast } from '@/composables/useToast.js'

const content = useContentStore()
const { success, error } = useToast()

// Copie locale du form
const form = ref({ ...content.data })

// Aperçu de l'image hero : image uploadée > form URL
const previewSrc = computed(() =>
  content.heroImage || form.value.heroImageFallback
)

// ── Image hero ────────────────────────────────────────────────────────────
const heroImgDragging = ref(false)

function compressImage(file, maxW = 1400, quality = 0.82) {
  return new Promise((resolve, reject) => {
    if (file.size > 10 * 1024 * 1024) { error('Image trop lourde (max 10 MB)'); resolve(''); return }
    const reader = new FileReader()
    reader.onload = e => {
      const img = new Image()
      img.onload = () => {
        const ratio = Math.min(maxW / img.width, 1)
        const w = Math.round(img.width * ratio)
        const h = Math.round(img.height * ratio)
        const canvas = document.createElement('canvas')
        canvas.width = w; canvas.height = h
        canvas.getContext('2d').drawImage(img, 0, 0, w, h)
        resolve(canvas.toDataURL('image/jpeg', quality))
      }
      img.onerror = reject
      img.src = e.target.result
    }
    reader.onerror = reject
    reader.readAsDataURL(file)
  })
}

async function handleHeroFile(e) {
  const file = e.target.files[0]
  if (!file) return
  const b64 = await compressImage(file)
  if (b64) content.setHeroImage(b64)
  e.target.value = ''
}

async function handleHeroDrop(e) {
  heroImgDragging.value = false
  const file = Array.from(e.dataTransfer.files).find(f => f.type.startsWith('image/'))
  if (!file) return
  const b64 = await compressImage(file)
  if (b64) content.setHeroImage(b64)
}

function resetHeroImage() {
  content.removeHeroImage()
}

// ── Sections headers config ───────────────────────────────────────────────
const sectionHeaders = [
  {
    key: 'menu', icon: '🍔', label: 'Menu / La Carte', hasSubtitle: true,
    placeholders: { label: 'Notre cuisine', title: 'La Carte', subtitle: 'Produits frais, recettes maison…' }
  },
  {
    key: 'gallery', icon: '📸', label: 'Galerie', hasSubtitle: true,
    placeholders: { label: 'Atmosphère', title: 'La Galerie', subtitle: 'Une cuisine authentique…' }
  },
  {
    key: 'reservation', icon: '📅', label: 'Réservation (étiquette)', hasSubtitle: false,
    placeholders: { label: 'Réserver', title: 'Faire une réservation' }
  },
  {
    key: 'reviews', icon: '⭐', label: 'Avis clients', hasSubtitle: false,
    placeholders: { label: 'Ce qu\'ils en pensent', title: 'Avis clients' }
  },
]

// ── Save ──────────────────────────────────────────────────────────────────
function saveAll() {
  content.update({ ...form.value })
  success('Contenu enregistré !')
}
</script>

<style scoped>
.panel-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 1.5rem; }
.panel-title  { font-family: var(--font-heading); font-size: 1.6rem; }

.section-card { padding: 1.5rem; margin-bottom: 1.25rem; }

.section-head {
  font-weight: 600; font-size: 0.95rem;
  margin-bottom: 0.5rem;
  padding-bottom: 0.75rem;
  border-bottom: 1px solid var(--border);
}

.section-hint { font-size: 0.82rem; color: var(--text-muted); margin-bottom: 1.25rem; }

/* ── Hero image ─────────────────────────────────────────────────────────── */
.hero-img-wrap {
  display: grid;
  grid-template-columns: 260px 1fr;
  gap: 1.5rem;
  align-items: start;
}

.hero-preview {
  height: 160px;
  border-radius: var(--radius);
  background-size: cover;
  background-position: center;
  position: relative;
  overflow: hidden;
  border: 1px solid var(--border);
  background-color: var(--border);
}

.hero-preview-overlay {
  position: absolute; inset: 0;
  background: rgba(0,0,0,0.3);
  display: flex; align-items: flex-end;
  padding: 0.5rem 0.75rem;
}

.preview-label {
  font-size: 0.7rem;
  font-weight: 600;
  color: rgba(255,255,255,0.7);
  text-transform: uppercase;
  letter-spacing: 0.08em;
}

.img-dropzone {
  border: 2px dashed var(--border);
  border-radius: var(--radius);
  padding: 1.25rem;
  display: flex; flex-direction: column; align-items: center; gap: 0.35rem;
  cursor: pointer; color: var(--text-muted);
  font-size: 0.85rem; text-align: center;
  transition: all 0.2s;
  margin-bottom: 0.75rem;
}
.img-dropzone:hover, .img-dropzone.dragging {
  border-color: var(--primary);
  background: color-mix(in srgb, var(--primary) 4%, transparent);
  color: var(--text);
}
.dz-hint { font-size: 0.73rem; color: var(--text-muted); }

.hero-img-meta { display: flex; align-items: center; justify-content: space-between; gap: 0.75rem; flex-wrap: wrap; }
.img-status { font-size: 0.82rem; color: var(--primary); font-weight: 500; }
.img-status.muted { color: var(--text-muted); }

/* ── Badge ──────────────────────────────────────────────────────────────── */
.badge-fields { display: flex; gap: 0.5rem; }

/* ── Section headers ────────────────────────────────────────────────────── */
.section-block {
  padding: 1rem 0;
  border-bottom: 1px solid var(--border);
}
.section-block:last-child { border-bottom: none; padding-bottom: 0; }

.section-block-title {
  font-weight: 600; font-size: 0.88rem;
  color: var(--text-light);
  margin-bottom: 0.75rem;
}

/* ── Save bar ────────────────────────────────────────────────────────────── */
.save-bar { display: flex; justify-content: flex-end; margin-top: 0.5rem; }

.form-hint-inline { font-size: 0.75rem; color: var(--text-muted); font-weight: 400; }

@media (max-width: 700px) {
  .hero-img-wrap { grid-template-columns: 1fr; }
  .hero-preview { height: 120px; }
}
</style>
