<template>
  <div class="gallery-panel">
    <div class="panel-header">
      <h2 class="panel-title">Galerie photos</h2>
      <span class="photo-count">{{ gallery.photos.length }} photo(s)</span>
    </div>

    <!-- ── Disposition de la grille ──────────────────────────────────────── -->
    <div class="card layout-card">
      <div class="section-head">🖼️ Disposition de la grille</div>
      <div class="layout-picker">
        <button
          v-for="layout in LAYOUTS"
          :key="layout.id"
          class="layout-option"
          :class="{ active: settings.layout === layout.id }"
          @click="settings.setLayout(layout.id)"
          :title="layout.desc"
        >
          <!-- Mini aperçu SVG -->
          <svg class="layout-preview" viewBox="0 0 100 95" xmlns="http://www.w3.org/2000/svg">
            <rect
              v-for="(cell, ci) in layout.cells"
              :key="ci"
              :x="cell.x"
              :y="cell.y"
              :width="cell.w"
              :height="cell.h"
              rx="3"
              class="preview-cell"
            />
          </svg>
          <div class="layout-label">{{ layout.label }}</div>
          <div class="layout-desc">{{ layout.desc }}</div>
          <!-- Checkmark -->
          <div v-if="settings.layout === layout.id" class="layout-check">✓</div>
        </button>
      </div>
      <p class="form-hint">La disposition choisie s'applique immédiatement sur le site public.</p>
    </div>

    <!-- ── Upload ─────────────────────────────────────────────────────────── -->
    <div
      class="drop-zone"
      :class="{ dragging: isDragging }"
      @dragover.prevent="isDragging = true"
      @dragleave="isDragging = false"
      @drop.prevent="handleDrop"
      @click="$refs.fileInput.click()"
    >
      <div class="dz-content">
        <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>
        <p>Glisser-déposer ou <span class="dz-link">cliquer pour choisir</span></p>
        <p class="dz-hint">PNG, JPG, WEBP · Max 5 MB par fichier · Recommandé : 9 à 12 photos</p>
      </div>
      <input ref="fileInput" type="file" multiple accept="image/*" style="display:none" @change="handleFiles" />
    </div>

    <div v-if="uploading" class="uploading-bar">
      <div class="uploading-progress" :style="{ width: uploadProgress + '%' }"></div>
      <span>Chargement… {{ uploadProgress }}%</span>
    </div>

    <div v-if="gallery.photos.length" class="gallery-grid">
      <div v-for="photo in gallery.photos" :key="photo.id" class="photo-item">
        <img :src="photo.data" :alt="`Photo ${photo.id}`" loading="lazy" />
        <div class="photo-overlay">
          <button class="delete-btn" @click="deletePhoto(photo.id)">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/><path d="M10 11v6"/><path d="M14 11v6"/></svg>
            Supprimer
          </button>
        </div>
      </div>
    </div>

    <div v-else class="empty-gallery">
      <p>Aucune photo — glissez des images pour commencer</p>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useGalleryStore } from '@/stores/gallery.js'
import { useGallerySettingsStore } from '@/stores/gallerySettings.js'
import { LAYOUTS } from '@/stores/gallerySettings.js'
import { useToast } from '@/composables/useToast.js'

const gallery  = useGalleryStore()
const settings = useGallerySettingsStore()
const { success, error } = useToast()

const isDragging    = ref(false)
const uploading     = ref(false)
const uploadProgress = ref(0)

onMounted(() => gallery.loadAll())

async function handleFiles(e) {
  await processFiles(Array.from(e.target.files))
  e.target.value = ''
}

async function handleDrop(e) {
  isDragging.value = false
  await processFiles(Array.from(e.dataTransfer.files).filter(f => f.type.startsWith('image/')))
}

async function processFiles(files) {
  if (!files.length) return
  uploading.value = true
  uploadProgress.value = 0

  for (let i = 0; i < files.length; i++) {
    const file = files[i]
    if (file.size > 5 * 1024 * 1024) {
      error(`${file.name} dépasse 5 MB`)
      continue
    }
    const dataUrl = await readFile(file)
    await gallery.addPhoto(dataUrl)
    uploadProgress.value = Math.round(((i + 1) / files.length) * 100)
  }

  uploading.value = false
  success(`${files.length} photo(s) ajoutée(s)`)
}

function readFile(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload  = e => resolve(e.target.result)
    reader.onerror = reject
    reader.readAsDataURL(file)
  })
}

async function deletePhoto(id) {
  if (!confirm('Supprimer cette photo ?')) return
  await gallery.deletePhoto(id)
  success('Photo supprimée')
}
</script>

<style scoped>
.panel-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 1.25rem; }
.panel-title  { font-family: var(--font-heading); font-size: 1.6rem; }
.photo-count  { color: var(--text-muted); font-size: 0.88rem; }

/* ── Layout picker ──────────────────────────────────────────────────────── */
.layout-card { padding: 1.5rem; margin-bottom: 1.5rem; }
.section-head {
  font-weight: 600; font-size: 0.95rem;
  margin-bottom: 1.25rem;
  padding-bottom: 0.75rem;
  border-bottom: 1px solid var(--border);
}

.layout-picker {
  display: grid;
  grid-template-columns: repeat(5, 1fr);
  gap: 0.75rem;
}

.layout-option {
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.4rem;
  padding: 0.75rem 0.5rem;
  border: 2px solid var(--border);
  border-radius: var(--radius);
  background: var(--bg);
  cursor: pointer;
  transition: all 0.2s;
  text-align: center;
}

.layout-option:hover {
  border-color: var(--primary);
  background: color-mix(in srgb, var(--primary) 5%, var(--bg));
}

.layout-option.active {
  border-color: var(--primary);
  background: color-mix(in srgb, var(--primary) 8%, var(--bg));
  box-shadow: 0 0 0 3px color-mix(in srgb, var(--primary) 20%, transparent);
}

/* SVG aperçu */
.layout-preview {
  width: 100%;
  max-width: 90px;
  height: auto;
  display: block;
}

.preview-cell {
  fill: var(--border);
  transition: fill 0.2s;
}

.layout-option:hover .preview-cell,
.layout-option.active .preview-cell {
  fill: color-mix(in srgb, var(--primary) 40%, var(--border));
}

.layout-label {
  font-weight: 600;
  font-size: 0.82rem;
  color: var(--text);
}

.layout-desc {
  font-size: 0.72rem;
  color: var(--text-muted);
  line-height: 1.3;
}

.layout-check {
  position: absolute;
  top: 0.35rem;
  right: 0.45rem;
  font-size: 0.75rem;
  font-weight: 700;
  color: var(--primary);
}

.form-hint {
  font-size: 0.78rem;
  color: var(--text-muted);
  margin-top: 1rem;
}

/* ── Drop zone ──────────────────────────────────────────────────────────── */
.drop-zone {
  border: 2px dashed var(--border);
  border-radius: var(--radius-lg);
  padding: 3rem;
  text-align: center;
  cursor: pointer;
  transition: all 0.2s;
  margin-bottom: 1.5rem;
}
.drop-zone:hover, .drop-zone.dragging { border-color: var(--primary); background: color-mix(in srgb, var(--primary) 4%, transparent); }

.dz-content { display: flex; flex-direction: column; align-items: center; gap: 0.75rem; color: var(--text-muted); }
.dz-link    { color: var(--primary); text-decoration: underline; }
.dz-hint    { font-size: 0.8rem; }

/* ── Uploading ──────────────────────────────────────────────────────────── */
.uploading-bar {
  position: relative;
  background: var(--border);
  border-radius: 4px;
  height: 8px;
  margin-bottom: 1rem;
  overflow: hidden;
}
.uploading-progress {
  position: absolute; inset: 0;
  background: var(--primary);
  border-radius: 4px;
  transition: width 0.3s;
}
.uploading-bar span {
  position: absolute;
  right: 0; top: -1.5rem;
  font-size: 0.78rem; color: var(--text-muted);
}

/* ── Photos grid ────────────────────────────────────────────────────────── */
.gallery-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
  gap: 0.75rem;
}

.photo-item {
  position: relative;
  aspect-ratio: 1;
  border-radius: var(--radius);
  overflow: hidden;
}
.photo-item img { width: 100%; height: 100%; object-fit: cover; transition: transform 0.3s; }
.photo-item:hover img { transform: scale(1.05); }

.photo-overlay {
  position: absolute; inset: 0;
  background: rgba(0,0,0,0.5);
  display: flex; align-items: center; justify-content: center;
  opacity: 0; transition: opacity 0.2s;
}
.photo-item:hover .photo-overlay { opacity: 1; }

.delete-btn {
  display: flex; align-items: center; gap: 0.4rem;
  background: #dc2626; color: #fff;
  padding: 0.5rem 0.9rem;
  border-radius: var(--radius-sm);
  font-size: 0.82rem; font-family: var(--font-body); font-weight: 500;
  transition: background 0.2s; cursor: pointer;
}
.delete-btn:hover { background: #b91c1c; }

.empty-gallery {
  text-align: center; padding: 3rem;
  color: var(--text-muted); font-style: italic;
  background: var(--bg); border-radius: var(--radius-lg);
}

/* ── Responsive ─────────────────────────────────────────────────────────── */
@media (max-width: 900px) {
  .layout-picker { grid-template-columns: repeat(3, 1fr); }
}
@media (max-width: 600px) {
  .layout-picker { grid-template-columns: repeat(2, 1fr); }
}
</style>
