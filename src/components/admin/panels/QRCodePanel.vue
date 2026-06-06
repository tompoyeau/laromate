<template>
  <div class="qr-panel">
    <h2 class="panel-title">QR Code</h2>
    <div class="qr-content">
      <div class="card qr-card">
        <div class="section-head">📱 QR Code du menu</div>
        <p class="qr-desc">
          Générez un QR code pointant vers votre site/menu. Vos clients pourront le scanner pour accéder directement à la carte depuis leur téléphone.
        </p>

        <div class="form-group">
          <label class="form-label">URL cible</label>
          <input v-model="qrUrl" class="form-input" placeholder="https://votre-site.fr" />
        </div>

        <div class="form-group">
          <label class="form-label">Taille</label>
          <select v-model="qrSize" class="form-select">
            <option :value="256">256 × 256 px</option>
            <option :value="512">512 × 512 px</option>
            <option :value="1024">1024 × 1024 px (haute qualité)</option>
          </select>
        </div>

        <div class="form-group">
          <label class="form-label">Couleur</label>
          <div class="color-row">
            <input v-model="qrColor" type="color" class="color-input" />
            <span class="color-label">Code QR</span>
            <input v-model="qrBg" type="color" class="color-input" />
            <span class="color-label">Fond</span>
          </div>
        </div>

        <button class="btn btn-primary" @click="generate" :disabled="generating">
          <svg v-if="generating" class="spin" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 12a9 9 0 1 1-6.219-8.56"/></svg>
          {{ generating ? 'Génération…' : '🔄 Générer le QR Code' }}
        </button>
      </div>

      <div class="card qr-preview-card">
        <div class="section-head">👁 Aperçu</div>
        <div v-if="qrDataUrl" class="qr-preview-box">
          <img :src="qrDataUrl" :alt="qrUrl" class="qr-image" />
          <p class="qr-url">{{ qrUrl }}</p>
          <div class="qr-actions">
            <a :href="qrDataUrl" :download="`qrcode-menu.png`" class="btn btn-primary">
              ⬇️ Télécharger PNG
            </a>
            <button class="btn btn-outline" @click="printQR">🖨️ Imprimer</button>
          </div>
        </div>
        <div v-else class="qr-empty">
          <svg width="80" height="80" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1" opacity="0.2">
            <rect x="3" y="3" width="8" height="8"/><rect x="3" y="13" width="8" height="8"/><rect x="13" y="3" width="8" height="8"/>
            <rect x="5" y="5" width="4" height="4" fill="currentColor"/><rect x="5" y="15" width="4" height="4" fill="currentColor"/>
            <rect x="15" y="5" width="4" height="4" fill="currentColor"/>
            <line x1="13" y1="13" x2="13" y2="21"/><line x1="13" y1="13" x2="21" y2="13"/>
            <line x1="21" y1="17" x2="21" y2="21"/><line x1="17" y1="21" x2="21" y2="21"/>
          </svg>
          <p>Cliquez sur "Générer" pour créer votre QR code</p>
        </div>
      </div>
    </div>

    <!-- Usage tips -->
    <div class="card tips-card">
      <div class="section-head">💡 Conseils d'utilisation</div>
      <div class="tips-grid">
        <div class="tip" v-for="t in tips" :key="t.title">
          <div class="tip-icon">{{ t.icon }}</div>
          <div>
            <div class="tip-title">{{ t.title }}</div>
            <div class="tip-desc">{{ t.desc }}</div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useToast } from '@/composables/useToast.js'
import QRCode from 'qrcode'

const { success, error } = useToast()

const qrUrl = ref(window.location.origin + window.location.pathname)
const qrSize = ref(512)
const qrColor = ref('#2c2c2c')
const qrBg = ref('#ffffff')
const qrDataUrl = ref('')
const generating = ref(false)

async function generate() {
  if (!qrUrl.value) return
  generating.value = true
  try {
    qrDataUrl.value = await QRCode.toDataURL(qrUrl.value, {
      width: qrSize.value,
      color: { dark: qrColor.value, light: qrBg.value },
      margin: 2,
      errorCorrectionLevel: 'H'
    })
    success('QR Code généré !')
  } catch (e) {
    error('Erreur lors de la génération')
  }
  generating.value = false
}

function printQR() {
  const w = window.open('')
  w.document.write(`<img src="${qrDataUrl.value}" style="max-width:100%">`)
  w.document.close()
  w.print()
}

// Auto-generate on mount
onMounted(generate)

const tips = [
  { icon: '🍽️', title: 'Sur les tables', desc: 'Imprimez et plastifiez le QR code pour chaque table.' },
  { icon: '🪟', title: 'En vitrine', desc: 'Affichez-le à l\'entrée pour que les clients consultent la carte avant d\'entrer.' },
  { icon: '📋', title: 'Sur les menus imprimés', desc: 'Ajoutez-le au bas des menus papier pour accéder aux infos à jour.' },
  { icon: '📱', title: 'Sur les réseaux sociaux', desc: 'Partagez-le dans vos stories pour diriger vers votre site.' },
]

const tips2 = tips

const spin_style = 'animation: spin 0.8s linear infinite;'
</script>

<style scoped>
.panel-title { font-family: var(--font-heading); font-size: 1.6rem; margin-bottom: 1.5rem; }

.qr-content { display: grid; grid-template-columns: 1fr 1fr; gap: 1.25rem; margin-bottom: 1.25rem; }

.qr-card, .qr-preview-card { padding: 1.5rem; }

.section-head { font-weight: 600; font-size: 0.95rem; margin-bottom: 1.25rem; padding-bottom: 0.75rem; border-bottom: 1px solid var(--border); }

.qr-desc { color: var(--text-light); font-size: 0.88rem; line-height: 1.6; margin-bottom: 1.25rem; }

.color-row { display: flex; align-items: center; gap: 0.75rem; }
.color-input { width: 40px; height: 38px; padding: 2px; border-radius: var(--radius-sm); border: 1.5px solid var(--border); cursor: pointer; }
.color-label { font-size: 0.82rem; color: var(--text-light); }

.qr-preview-box { display: flex; flex-direction: column; align-items: center; gap: 1rem; }
.qr-image { border-radius: var(--radius); box-shadow: var(--shadow); max-width: 220px; }
.qr-url { font-size: 0.75rem; color: var(--text-muted); text-align: center; word-break: break-all; }
.qr-actions { display: flex; gap: 0.75rem; }

.qr-empty { display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 1rem; padding: 3rem 1rem; color: var(--text-muted); font-style: italic; text-align: center; }

.tips-card { padding: 1.5rem; }

.tips-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; }

.tip { display: flex; gap: 0.75rem; }
.tip-icon { font-size: 1.4rem; width: 36px; flex-shrink: 0; }
.tip-title { font-weight: 600; font-size: 0.88rem; margin-bottom: 0.15rem; }
.tip-desc { font-size: 0.8rem; color: var(--text-light); line-height: 1.4; }

.spin { animation: spin 0.8s linear infinite; }
@keyframes spin { to { transform: rotate(360deg); } }

@media (max-width: 768px) { .qr-content, .tips-grid { grid-template-columns: 1fr; } }
</style>
