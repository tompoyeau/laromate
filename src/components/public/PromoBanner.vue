<template>
  <div v-if="promos.active.length" ref="bannerEl" class="promo-banner">
    <div class="promo-inner container">
      <span class="promo-icon">🎉</span>
      <div class="promo-slot">
        <Transition name="promo">
          <span :key="currentIdx" class="promo-text">
            <strong>{{ current.title }}</strong>
            <span v-if="current.description"> · {{ current.description }}</span>
            <span v-if="current.discount" class="promo-discount"> — {{ current.discount }}</span>
            <span v-if="current.validUntil" class="promo-until"> jusqu'au {{ formatDate(current.validUntil) }}</span>
          </span>
        </Transition>
      </div>
      <!-- Indicateurs si plusieurs promos -->
      <div v-if="promos.active.length > 1" class="promo-dots">
        <span
          v-for="(_, i) in promos.active"
          :key="i"
          :class="['promo-dot', { active: i === currentIdx }]"
        />
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted, watch } from 'vue'
import { usePromotionsStore } from '@/stores/promotions.js'

const promos = usePromotionsStore()
const currentIdx = ref(0)
const bannerEl = ref(null)
let interval = null
let ro = null

const current = computed(() => promos.active[currentIdx.value] || {})

function formatDate(d) {
  return new Date(d).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long' })
}

// Met à jour --promo-h sur :root pour que le NavBar puisse se décaler
function updateHeight() {
  const h = bannerEl.value ? bannerEl.value.offsetHeight : 0
  document.documentElement.style.setProperty('--promo-h', `${h}px`)
}

onMounted(() => {
  updateHeight()
  ro = new ResizeObserver(updateHeight)
  if (bannerEl.value) ro.observe(bannerEl.value)

  if (promos.active.length > 1) {
    interval = setInterval(() => {
      currentIdx.value = (currentIdx.value + 1) % promos.active.length
    }, 4000)
  }
})

onUnmounted(() => {
  clearInterval(interval)
  ro?.disconnect()
  // Remet à 0 si le composant est démonté
  document.documentElement.style.setProperty('--promo-h', '0px')
})

// Recalcule si les promos changent (ex. ajout/suppression en admin)
watch(() => promos.active.length, () => {
  setTimeout(updateHeight, 50)
})
</script>

<style scoped>
.promo-banner {
  background: var(--primary);
  color: #fff;
  padding: 0.6rem 0;
  text-align: center;
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 1001;
}

.promo-inner {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.6rem;
  font-size: 0.88rem;
}

/* Conteneur du texte — hauteur stable pendant la transition */
.promo-slot {
  position: relative;
  display: flex;
  align-items: center;
  overflow: hidden;
  min-height: 1.3em;
}

.promo-text {
  display: block;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 60vw;
}

.promo-discount { color: var(--accent); font-weight: 600; }
.promo-until { opacity: 0.75; font-size: 0.8rem; }

/* Indicateurs */
.promo-dots {
  display: flex;
  gap: 5px;
  align-items: center;
  margin-left: 0.25rem;
}

.promo-dot {
  width: 5px;
  height: 5px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.4);
  transition: all 0.3s ease;
  flex-shrink: 0;
}

.promo-dot.active {
  background: #fff;
  width: 14px;
  border-radius: 3px;
}

/* ── Transition fluide ────────────────────────────────────────────────────── */
/* L'élément sortant passe en absolu → ne perturbe pas la hauteur du bandeau */
.promo-enter-active {
  transition: opacity 0.45s ease, transform 0.45s ease;
}
.promo-leave-active {
  transition: opacity 0.45s ease, transform 0.45s ease;
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
}

.promo-enter-from  { opacity: 0; transform: translateY(10px); }
.promo-leave-to    { opacity: 0; transform: translateY(-10px); }
</style>
