<template>
  <div v-if="promos.active.length" class="promo-banner">
    <div class="promo-inner container">
      <span class="promo-icon">🎉</span>
      <TransitionGroup name="promo" mode="out-in">
        <span :key="currentIdx" class="promo-text">
          <strong>{{ current.title }}</strong>
          <span v-if="current.description"> · {{ current.description }}</span>
          <span v-if="current.discount" class="promo-discount"> — {{ current.discount }}</span>
          <span v-if="current.validUntil" class="promo-until"> jusqu'au {{ formatDate(current.validUntil) }}</span>
        </span>
      </TransitionGroup>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { usePromotionsStore } from '@/stores/promotions.js'

const promos = usePromotionsStore()
const currentIdx = ref(0)
let interval = null

const current = computed(() => promos.active[currentIdx.value] || {})

function formatDate(d) {
  return new Date(d).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long' })
}

onMounted(() => {
  if (promos.active.length > 1) {
    interval = setInterval(() => {
      currentIdx.value = (currentIdx.value + 1) % promos.active.length
    }, 4000)
  }
})

onUnmounted(() => clearInterval(interval))
</script>

<style scoped>
.promo-banner {
  background: var(--primary);
  color: #fff;
  padding: 0.6rem 0;
  text-align: center;
  position: relative;
  z-index: 999;
}

.promo-inner {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.6rem;
  font-size: 0.88rem;
}

.promo-discount { color: var(--accent); font-weight: 600; }
.promo-until { opacity: 0.75; font-size: 0.8rem; }

.promo-enter-active, .promo-leave-active { transition: all 0.4s ease; }
.promo-enter-from { opacity: 0; transform: translateY(-8px); }
.promo-leave-to  { opacity: 0; transform: translateY(8px); }
</style>
