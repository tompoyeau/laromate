<template>
  <section id="gallery" class="section gallery-section">
    <div class="container">
      <div class="section-header fade-up">
        <p class="section-label">{{ content.data.galleryLabel }}</p>
        <h2 class="section-title">{{ content.data.galleryTitle }}</h2>
        <p class="section-subtitle">{{ content.data.gallerySubtitle }}</p>
      </div>

      <div v-if="gallery.photos.length" class="gallery-grid" :class="`layout-${settings.layout}`">
        <div
          v-for="(photo, i) in gallery.photos"
          :key="photo.id"
          class="gallery-item"
          :class="getClass(i)"
          @click="openLightbox(i)"
        >
          <img :src="photo.data" :alt="`Photo ${i + 1}`" loading="lazy" />
          <div class="gallery-overlay">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/><line x1="11" y1="8" x2="11" y2="14"/><line x1="8" y1="11" x2="14" y2="11"/></svg>
          </div>
        </div>
      </div>

      <div v-else class="gallery-placeholder fade-up">
        <p>Les photos seront bientôt disponibles.</p>
      </div>
    </div>

    <!-- Lightbox -->
    <Teleport to="body">
      <Transition name="lightbox">
        <div v-if="lightboxOpen" class="lightbox" @click.self="closeLightbox">
          <button class="lb-close" @click="closeLightbox">✕</button>
          <button class="lb-prev" @click="prevPhoto" v-if="gallery.photos.length > 1">‹</button>
          <button class="lb-next" @click="nextPhoto" v-if="gallery.photos.length > 1">›</button>
          <img :src="gallery.photos[lightboxIdx]?.data" :alt="`Photo ${lightboxIdx + 1}`" class="lb-img" />
          <div class="lb-counter">{{ lightboxIdx + 1 }} / {{ gallery.photos.length }}</div>
        </div>
      </Transition>
    </Teleport>
  </section>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import { useGalleryStore } from '@/stores/gallery.js'
import { useGallerySettingsStore } from '@/stores/gallerySettings.js'
import { useContentStore } from '@/stores/content.js'

const gallery  = useGalleryStore()
const settings = useGallerySettingsStore()
const content  = useContentStore()

// Recharge depuis IndexedDB au montage et quand l'onglet reprend le focus
function reload() { gallery.loadAll() }
onMounted(() => {
  reload()
  window.addEventListener('focus', reload)
})
onUnmounted(() => window.removeEventListener('focus', reload))

// ─── Patterns de grille ────────────────────────────────────────────────────
// Chaque fonction reçoit l'index de la photo et retourne des classes CSS
const PATTERNS = {
  // 3 colonnes égales — clean et simple
  uniform:  () => '',

  // 4 colonnes — alternance tall/wide, style magazine
  mosaic:   i => ['', 'span-2r', '', 'span-2c', '', '', 'span-2r', ''][i % 8],

  // 3 colonnes — 1re photo vedette (2×2), reste normal
  featured: i => i === 0 ? 'span-2c span-2r' : '',

  // 4 colonnes égales — style Instagram
  columns:  () => '',

  // 2 grandes colonnes — alternance de photos verticales
  duo:      i => ['span-2r', '', '', 'span-2r'][i % 4],
}

function getClass(i) {
  const fn = PATTERNS[settings.layout] || PATTERNS.mosaic
  return fn(i)
}

// ─── Lightbox ──────────────────────────────────────────────────────────────
const lightboxOpen = ref(false)
const lightboxIdx  = ref(0)

function openLightbox(i) { lightboxOpen.value = true; lightboxIdx.value = i }
function closeLightbox() { lightboxOpen.value = false }
function prevPhoto() { lightboxIdx.value = (lightboxIdx.value - 1 + gallery.photos.length) % gallery.photos.length }
function nextPhoto() { lightboxIdx.value = (lightboxIdx.value + 1) % gallery.photos.length }

function handleKey(e) {
  if (!lightboxOpen.value) return
  if (e.key === 'Escape') closeLightbox()
  if (e.key === 'ArrowLeft') prevPhoto()
  if (e.key === 'ArrowRight') nextPhoto()
}

onMounted(() => window.addEventListener('keydown', handleKey))
onUnmounted(() => window.removeEventListener('keydown', handleKey))
</script>

<style scoped>
.gallery-section { background: var(--bg-card); }
.section-header { text-align: center; }

/* ── Grille ──────────────────────────────────────────────────────────────── */
.gallery-grid {
  display: grid;
  gap: 0.75rem;
  /* défaut fallback */
  grid-template-columns: repeat(4, 1fr);
  grid-auto-rows: 220px;
}

/* Grille uniforme — 3 colonnes toutes égales */
.layout-uniform  { grid-template-columns: repeat(3, 1fr); grid-auto-rows: 230px; }

/* Mosaïque — 4 colonnes mix tall/wide */
.layout-mosaic   { grid-template-columns: repeat(4, 1fr); grid-auto-rows: 220px; }

/* Vedette — 3 colonnes, 1re photo grande */
.layout-featured { grid-template-columns: repeat(3, 1fr); grid-auto-rows: 200px; }

/* Colonnes — 4 colonnes régulières, style Instagram */
.layout-columns  { grid-template-columns: repeat(4, 1fr); grid-auto-rows: 200px; }

/* Duo — 2 grandes colonnes */
.layout-duo      { grid-template-columns: repeat(2, 1fr); grid-auto-rows: 280px; }

/* ── Classes de span ─────────────────────────────────────────────────────── */
.span-2c { grid-column: span 2; }
.span-2r { grid-row: span 2; }

/* ── Item ────────────────────────────────────────────────────────────────── */
.gallery-item {
  position: relative;
  overflow: hidden;
  border-radius: var(--radius);
  cursor: pointer;
}

.gallery-item img {
  width: 100%; height: 100%;
  object-fit: cover;
  transition: transform 0.4s ease;
}

.gallery-item:hover img { transform: scale(1.06); }

.gallery-overlay {
  position: absolute; inset: 0;
  background: rgba(0,0,0,0.3);
  display: flex; align-items: center; justify-content: center;
  opacity: 0;
  transition: opacity 0.3s;
}

.gallery-item:hover .gallery-overlay { opacity: 1; }

.gallery-placeholder {
  text-align: center;
  padding: 4rem;
  color: var(--text-muted);
  background: var(--border);
  border-radius: var(--radius-lg);
  font-style: italic;
}

/* ── Lightbox ────────────────────────────────────────────────────────────── */
.lightbox {
  position: fixed; inset: 0;
  background: rgba(0,0,0,0.95);
  display: flex; align-items: center; justify-content: center;
  z-index: 9999;
}

.lb-img {
  max-width: 90vw;
  max-height: 90vh;
  object-fit: contain;
  border-radius: var(--radius);
}

.lb-close {
  position: absolute; top: 1.5rem; right: 1.5rem;
  color: #fff; font-size: 1.5rem;
  padding: 0.5rem 0.75rem;
  background: rgba(255,255,255,0.1);
  border-radius: var(--radius-sm);
  transition: background 0.2s;
}
.lb-close:hover { background: rgba(255,255,255,0.2); }

.lb-prev, .lb-next {
  position: absolute;
  top: 50%; transform: translateY(-50%);
  color: #fff; font-size: 2.5rem;
  padding: 1rem;
  background: rgba(255,255,255,0.1);
  border-radius: var(--radius-sm);
  transition: background 0.2s;
}
.lb-prev { left: 1.5rem; }
.lb-next { right: 1.5rem; }
.lb-prev:hover, .lb-next:hover { background: rgba(255,255,255,0.2); }

.lb-counter {
  position: absolute; bottom: 1.5rem; left: 50%; transform: translateX(-50%);
  color: rgba(255,255,255,0.6); font-size: 0.85rem;
}

.lightbox-enter-active, .lightbox-leave-active { transition: opacity 0.25s ease; }
.lightbox-enter-from, .lightbox-leave-to { opacity: 0; }

/* ── Responsive ──────────────────────────────────────────────────────────── */
@media (max-width: 768px) {
  .gallery-grid {
    grid-template-columns: repeat(2, 1fr) !important;
    grid-auto-rows: 160px !important;
  }
  /* Annule les spans sur mobile pour éviter des cellules trop grandes */
  .span-2c { grid-column: span 1 !important; }
  .span-2r { grid-row: span 1 !important; }
}
</style>
