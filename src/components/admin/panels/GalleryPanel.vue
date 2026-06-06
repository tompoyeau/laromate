<template>
  <div class="gallery-panel">
    <div class="panel-header">
      <h2 class="panel-title">Galerie photos</h2>
      <span class="photo-count">{{ gallery.photos.length }} photo(s)</span>
    </div>

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
        <p class="dz-hint">PNG, JPG, WEBP · Max 5 MB par fichier</p>
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
import { useToast } from '@/composables/useToast.js'

const gallery = useGalleryStore()
const { success, error } = useToast()
const isDragging = ref(false)
const uploading = ref(false)
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
    reader.onload = e => resolve(e.target.result)
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
.panel-title { font-family: var(--font-heading); font-size: 1.6rem; }
.photo-count { color: var(--text-muted); font-size: 0.88rem; }

.drop-zone {
  border: 2px dashed var(--border);
  border-radius: var(--radius-lg);
  padding: 3rem;
  text-align: center;
  cursor: pointer;
  transition: all 0.2s;
  margin-bottom: 1.5rem;
}

.drop-zone:hover, .drop-zone.dragging { border-color: var(--primary); background: rgba(107,124,92,0.04); }

.dz-content { display: flex; flex-direction: column; align-items: center; gap: 0.75rem; color: var(--text-muted); }
.dz-link { color: var(--primary); text-decoration: underline; }
.dz-hint { font-size: 0.8rem; }

.uploading-bar {
  position: relative;
  background: var(--border);
  border-radius: 4px;
  height: 8px;
  margin-bottom: 1rem;
  overflow: hidden;
}

.uploading-progress {
  position: absolute;
  inset: 0;
  background: var(--primary);
  border-radius: 4px;
  transition: width 0.3s;
}

.uploading-bar span {
  position: absolute;
  right: 0;
  top: -1.5rem;
  font-size: 0.78rem;
  color: var(--text-muted);
}

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

.photo-item img {
  width: 100%; height: 100%;
  object-fit: cover;
  transition: transform 0.3s;
}

.photo-item:hover img { transform: scale(1.05); }

.photo-overlay {
  position: absolute; inset: 0;
  background: rgba(0,0,0,0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: 0;
  transition: opacity 0.2s;
}

.photo-item:hover .photo-overlay { opacity: 1; }

.delete-btn {
  display: flex;
  align-items: center;
  gap: 0.4rem;
  background: #dc2626;
  color: #fff;
  padding: 0.5rem 0.9rem;
  border-radius: var(--radius-sm);
  font-size: 0.82rem;
  font-family: var(--font-body);
  font-weight: 500;
  transition: background 0.2s;
  cursor: pointer;
}

.delete-btn:hover { background: #b91c1c; }

.empty-gallery {
  text-align: center;
  padding: 3rem;
  color: var(--text-muted);
  font-style: italic;
  background: var(--bg);
  border-radius: var(--radius-lg);
}
</style>
