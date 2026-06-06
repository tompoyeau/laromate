<template>
  <div class="theme-panel">
    <div class="panel-header">
      <h2 class="panel-title">Personnalisation</h2>
      <div class="live-badge">● Live preview</div>
    </div>

    <div class="theme-grid">
      <!-- Identity -->
      <div class="card theme-section">
        <div class="section-head">🏪 Identité du restaurant</div>
        <div class="form-group">
          <label class="form-label">Nom du restaurant</label>
          <input v-model="draft.restaurantName" class="form-input" @input="applyPreview" />
        </div>
        <div class="form-group">
          <label class="form-label">Sous-titre / accroche</label>
          <input v-model="draft.restaurantTagline" class="form-input" @input="applyPreview" />
        </div>
        <div class="form-group">
          <label class="form-label">Logo (PNG, JPG)</label>
          <div class="logo-upload" @click="$refs.logoInput.click()">
            <img v-if="draft.logo" :src="draft.logo" alt="Logo" class="logo-preview" />
            <div v-else class="logo-placeholder">
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>
              <span>Cliquer pour uploader</span>
            </div>
          </div>
          <input ref="logoInput" type="file" accept="image/*" style="display:none" @change="uploadLogo" />
          <button v-if="draft.logo" class="btn btn-ghost btn-sm mt-sm" @click="draft.logo = null">Supprimer le logo</button>
        </div>
      </div>

      <!-- Colors -->
      <div class="card theme-section">
        <div class="section-head">🎨 Couleurs</div>

        <div class="color-presets">
          <div class="presets-label">Thèmes prédéfinis</div>
          <div class="presets-grid">
            <button
              v-for="p in presets"
              :key="p.name"
              class="preset-btn"
              :style="{ background: p.primary }"
              :title="p.name"
              @click="applyPreset(p)"
            >
              <span class="preset-name">{{ p.name }}</span>
            </button>
          </div>
        </div>

        <div class="form-group">
          <label class="form-label">Couleur principale</label>
          <div class="color-row">
            <input v-model="draft.primaryColor" type="color" class="color-input" @input="applyPreview" />
            <input v-model="draft.primaryColor" class="form-input color-hex" @input="applyPreview" />
          </div>
        </div>

        <div class="form-group">
          <label class="form-label">Couleur accent</label>
          <div class="color-row">
            <input v-model="draft.accentColor" type="color" class="color-input" @input="applyPreview" />
            <input v-model="draft.accentColor" class="form-input color-hex" @input="applyPreview" />
          </div>
        </div>

        <div class="form-group">
          <label class="form-label">Couleur de fond</label>
          <div class="color-row">
            <input v-model="draft.bgColor" type="color" class="color-input" @input="applyPreview" />
            <input v-model="draft.bgColor" class="form-input color-hex" @input="applyPreview" />
          </div>
        </div>
      </div>

      <!-- Typography & Mode -->
      <div class="card theme-section">
        <div class="section-head">✍️ Typographie & Affichage</div>
        <div class="form-group">
          <label class="form-label">Police des titres</label>
          <select v-model="draft.fontHeading" class="form-select" @change="applyPreview">
            <option v-for="f in fonts" :key="f.value" :value="f.value">{{ f.label }}</option>
          </select>
          <p class="font-preview" :style="{ fontFamily: `'${draft.fontHeading}', serif` }">
            L'Aromate — saveurs authentiques
          </p>
        </div>
        <div class="form-group">
          <label class="form-label">Mode d'affichage</label>
          <div class="mode-toggle">
            <button :class="['mode-btn', { active: !draft.darkMode }]" @click="draft.darkMode = false; applyPreview()">
              ☀️ Clair
            </button>
            <button :class="['mode-btn', { active: draft.darkMode }]" @click="draft.darkMode = true; applyPreview()">
              🌙 Sombre
            </button>
          </div>
        </div>
      </div>

      <!-- Preview -->
      <div class="card theme-section theme-preview-card">
        <div class="section-head">👁 Aperçu</div>
        <div class="preview-box" :style="previewStyle">
          <div class="preview-nav" :style="{ background: draft.primaryColor }">
            <span class="preview-logo" :style="{ fontFamily: `'${draft.fontHeading}', serif` }">{{ draft.restaurantName }}</span>
          </div>
          <div class="preview-content">
            <div class="preview-badge" :style="{ color: draft.accentColor }">Restaurant · Bordeaux</div>
            <div class="preview-title" :style="{ fontFamily: `'${draft.fontHeading}', serif` }">{{ draft.restaurantTagline }}</div>
            <button class="preview-btn" :style="{ background: draft.primaryColor }">Réserver</button>
          </div>
        </div>
      </div>
    </div>

    <div class="save-bar">
      <button class="btn btn-ghost" @click="resetDraft">↩️ Réinitialiser</button>
      <button class="btn btn-primary" @click="save">✓ Enregistrer les modifications</button>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useThemeStore } from '@/stores/theme.js'
import { useToast } from '@/composables/useToast.js'

const themeStore = useThemeStore()
const { success } = useToast()

const draft = ref({ ...themeStore.theme })

const fonts = [
  { value: 'Playfair Display', label: 'Playfair Display (élégant)' },
  { value: 'Lora', label: 'Lora (classique)' },
  { value: 'Merriweather', label: 'Merriweather (lisible)' },
  { value: 'Cormorant Garamond', label: 'Cormorant Garamond (raffiné)' },
  { value: 'Inter', label: 'Inter (moderne)' },
]

const presets = [
  { name: 'Forêt', primary: '#6b7c5c', primaryLight: '#8b9d77', primaryDark: '#4a5740', accent: '#c9a96e', bg: '#f9f7f4' },
  { name: 'Ardoise', primary: '#374151', primaryLight: '#4b5563', primaryDark: '#1f2937', accent: '#f59e0b', bg: '#f8fafc' },
  { name: 'Bordeaux', primary: '#7c2d12', primaryLight: '#9a3412', primaryDark: '#431407', accent: '#d97706', bg: '#fffbf5' },
  { name: 'Océan', primary: '#0c4a6e', primaryLight: '#0369a1', primaryDark: '#082f49', accent: '#38bdf8', bg: '#f0f9ff' },
  { name: 'Aubergine', primary: '#5b21b6', primaryLight: '#7c3aed', primaryDark: '#3b0764', accent: '#f59e0b', bg: '#faf5ff' },
  { name: 'Terracotta', primary: '#9a3412', primaryLight: '#c2410c', primaryDark: '#7c2d12', accent: '#84cc16', bg: '#fffbf5' },
]

function applyPreset(preset) {
  draft.value.primaryColor = preset.primary
  draft.value.primaryLight = preset.primaryLight
  draft.value.primaryDark = preset.primaryDark
  draft.value.accentColor = preset.accent
  draft.value.bgColor = preset.bg
  applyPreview()
}

function applyPreview() {
  themeStore.update({ ...draft.value })
}

function save() {
  themeStore.update({ ...draft.value })
  success('Thème enregistré avec succès !')
}

function resetDraft() {
  draft.value = { ...themeStore.theme }
}

function uploadLogo(e) {
  const file = e.target.files[0]
  if (!file) return
  const reader = new FileReader()
  reader.onload = ev => { draft.value.logo = ev.target.result; applyPreview() }
  reader.readAsDataURL(file)
}

const previewStyle = computed(() => ({
  background: draft.value.bgColor,
  color: draft.value.darkMode ? '#f0ede8' : '#2c2c2c',
}))
</script>

<style scoped>
.panel-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 1.5rem; }
.panel-title { font-family: var(--font-heading); font-size: 1.6rem; }
.live-badge { background: #dcfce7; color: #166534; font-size: 0.78rem; font-weight: 600; padding: 0.3rem 0.75rem; border-radius: 99px; }

.theme-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1.25rem;
  margin-bottom: 1.5rem;
}

.theme-section { padding: 1.5rem; }
.section-head { font-weight: 600; font-size: 0.95rem; margin-bottom: 1.25rem; padding-bottom: 0.75rem; border-bottom: 1px solid var(--border); }

.color-row { display: flex; gap: 0.5rem; align-items: center; }
.color-input { width: 44px; height: 38px; padding: 2px; border-radius: var(--radius-sm); border: 1.5px solid var(--border); cursor: pointer; background: none; }
.color-hex { flex: 1; }

.color-presets { margin-bottom: 1.25rem; }
.presets-label { font-size: 0.8rem; color: var(--text-muted); margin-bottom: 0.5rem; }
.presets-grid { display: flex; flex-wrap: wrap; gap: 0.4rem; }

.preset-btn {
  width: 44px; height: 44px;
  border-radius: var(--radius-sm);
  border: 2px solid rgba(255,255,255,0.3);
  cursor: pointer;
  position: relative;
  transition: transform 0.15s;
  overflow: hidden;
}

.preset-btn:hover { transform: scale(1.1); border-color: rgba(255,255,255,0.8); }

.preset-name {
  position: absolute;
  bottom: -100%;
  left: 0; right: 0;
  background: rgba(0,0,0,0.7);
  color: #fff;
  font-size: 0.62rem;
  text-align: center;
  padding: 2px;
  transition: bottom 0.2s;
}

.preset-btn:hover .preset-name { bottom: 0; }

.font-preview {
  margin-top: 0.5rem;
  font-size: 1.1rem;
  color: var(--text);
  font-style: italic;
}

.mode-toggle { display: flex; gap: 0.5rem; }
.mode-btn {
  flex: 1;
  padding: 0.6rem;
  border-radius: var(--radius-sm);
  border: 1.5px solid var(--border);
  font-size: 0.88rem;
  cursor: pointer;
  font-family: var(--font-body);
  background: var(--bg);
  color: var(--text);
  transition: all 0.2s;
}
.mode-btn.active { background: var(--primary); color: #fff; border-color: var(--primary); }

.theme-preview-card { grid-column: span 2; }

.preview-box {
  border-radius: var(--radius);
  overflow: hidden;
  border: 1px solid var(--border);
  transition: all 0.3s;
}

.preview-nav {
  padding: 0.85rem 1.5rem;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.preview-logo { color: #fff; font-size: 1.2rem; font-weight: 600; }

.preview-content {
  padding: 2rem;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.preview-badge { font-size: 0.72rem; font-weight: 600; letter-spacing: 0.12em; text-transform: uppercase; }
.preview-title { font-size: 1.4rem; font-weight: 600; }
.preview-btn {
  align-self: flex-start;
  color: #fff;
  padding: 0.6rem 1.25rem;
  border-radius: var(--radius-sm);
  font-size: 0.88rem;
  margin-top: 0.5rem;
  cursor: default;
}

.logo-upload {
  border: 2px dashed var(--border);
  border-radius: var(--radius);
  padding: 1.25rem;
  cursor: pointer;
  text-align: center;
  transition: border-color 0.2s;
  min-height: 90px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.logo-upload:hover { border-color: var(--primary); }
.logo-preview { max-height: 60px; object-fit: contain; }

.logo-placeholder { display: flex; flex-direction: column; align-items: center; gap: 0.4rem; color: var(--text-muted); font-size: 0.85rem; }

.save-bar { display: flex; justify-content: flex-end; gap: 0.75rem; padding-top: 1rem; border-top: 1px solid var(--border); }

.mt-sm { margin-top: 0.5rem; }

@media (max-width: 900px) { .theme-grid { grid-template-columns: 1fr; } .theme-preview-card { grid-column: 1; } }
</style>
