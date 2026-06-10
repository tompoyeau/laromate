<template>
  <section id="reviews" class="section reviews-section">
    <div class="container">

      <div class="section-header fade-up">
        <p class="section-label">{{ content.data.reviewsLabel }}</p>
        <h2 class="section-title">{{ content.data.reviewsTitle }}</h2>
      </div>

      <Transition name="reviews-in">
      <div v-if="google.isConfigured" class="google-block">

        <!-- Carrousel -->
        <div class="carousel">
          <button class="c-btn" @click="prev" :disabled="currentIndex === 0">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="15 18 9 12 15 6"/></svg>
          </button>

          <div class="c-viewport"
            @touchstart.passive="onTouchStart"
            @touchmove="onTouchMove"
            @touchend.passive="onTouchEnd">
            <div class="c-track" :style="{ transform: `translateX(-${currentIndex * slideWidth}px)` }">
              <div v-for="r in google.data.reviews" :key="r.id" class="c-card card">
                <div class="c-card-top">
                  <div class="c-author">
                    <div class="c-avatar">{{ r.author[0] }}</div>
                    <div>
                      <div class="c-name">{{ r.author }}</div>
                      <div class="c-date">{{ r.date }}</div>
                    </div>
                  </div>
                  <div class="c-stars">
                    <span v-for="i in 5" :key="i" :style="{ color: i <= r.rating ? '#fbbc04' : '#e0e0e0' }">★</span>
                  </div>
                </div>
                <p class="c-text">{{ r.text }}</p>
                <div class="c-footer">
                  <GoogleLogo :size="13" />
                  <span>Avis Google</span>
                </div>
              </div>
            </div>
          </div>

          <button class="c-btn" @click="next" :disabled="currentIndex >= maxIndex">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="9 18 15 12 9 6"/></svg>
          </button>
        </div>

        <!-- Dots -->
        <div class="c-dots" v-if="google.data.reviews.length > 1">
          <button
            v-for="i in dotCount" :key="i"
            :class="['dot', { active: i - 1 === currentIndex }]"
            @click="currentIndex = i - 1"
          />
        </div>

        <!-- CTA -->
        <div class="g-cta" v-if="google.data.mapsUrl">
          <a :href="google.data.mapsUrl" target="_blank" rel="noopener" class="btn g-cta-btn">
            <GoogleLogo :size="16" />
            Laisser un avis sur Google
          </a>
        </div>

      </div>
      </Transition>

    </div>
  </section>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useGooglePlacesStore } from '@/stores/googlePlaces.js'
import { useContentStore } from '@/stores/content.js'

const GoogleLogo = {
  props: { size: { default: 18 } },
  template: `<svg :width="size" :height="size" viewBox="0 0 24 24" style="flex-shrink:0">
    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
  </svg>`
}

const google  = useGooglePlacesStore()
const content = useContentStore()

const currentIndex = ref(0)
const perView = ref(3)
const gap = 16
const slideWidth = computed(() => {
  const vp = document.querySelector('.c-viewport')
  if (!vp) return 356
  return Math.floor((vp.offsetWidth - gap * (perView.value - 1)) / perView.value) + gap
})

const maxIndex = computed(() => Math.max(0, google.data.reviews.length - perView.value))
const dotCount = computed(() => maxIndex.value + 1)

function prev() { currentIndex.value = Math.max(0, currentIndex.value - 1) }
function next() { currentIndex.value = Math.min(maxIndex.value, currentIndex.value + 1) }

function updatePerView() {
  const w = window.innerWidth
  perView.value = w < 640 ? 1 : w < 960 ? 2 : 3
}

// ── Swipe touch ───────────────────────────────────────────────────────────────
let touchStartX = 0
let touchStartY = 0
let isSwiping = false

function onTouchStart(e) {
  touchStartX = e.touches[0].clientX
  touchStartY = e.touches[0].clientY
  isSwiping = false
}

function onTouchMove(e) {
  const dx = e.touches[0].clientX - touchStartX
  const dy = e.touches[0].clientY - touchStartY
  // Détermine si c'est un swipe horizontal (et non un scroll vertical)
  if (!isSwiping && Math.abs(dx) > Math.abs(dy) && Math.abs(dx) > 8) {
    isSwiping = true
  }
  if (isSwiping) e.preventDefault()
}

function onTouchEnd(e) {
  if (!isSwiping) return
  const dx = e.changedTouches[0].clientX - touchStartX
  if (dx < -40) next()
  else if (dx > 40) prev()
  isSwiping = false
}

onMounted(() => { updatePerView(); window.addEventListener('resize', updatePerView) })
onUnmounted(() => window.removeEventListener('resize', updatePerView))
</script>

<style scoped>
.reviews-section { background: var(--bg); }
.section-header { text-align: center; margin-bottom: 2.5rem; }

.google-block {}

/* Animation d'entrée des avis (remplace fade-up pour gérer le v-if async) */
.reviews-in-enter-active { transition: opacity 0.55s ease, transform 0.55s ease; }
.reviews-in-enter-from   { opacity: 0; transform: translateY(18px); }

/* Badge */
.g-badge {
  display: inline-flex;
  align-items: center;
  gap: 1rem;
  background: var(--bg-card);
  border: 1px solid var(--border);
  border-radius: var(--radius-lg);
  padding: 1rem 1.5rem;
  margin-bottom: 2rem;
  box-shadow: var(--shadow-sm);
  flex-wrap: wrap;
}

.g-badge-score {
  font-size: 2.4rem;
  font-weight: 700;
  font-family: var(--font-heading);
  color: var(--text);
  line-height: 1;
}

.g-badge-right {}
.g-stars { display: flex; gap: 2px; font-size: 1.15rem; }
.g-count { font-size: 0.82rem; color: var(--text-light); margin-top: 0.15rem; }

.g-maps-link {
  margin-left: auto;
  font-size: 0.8rem;
  color: #1a73e8;
  text-decoration: underline;
  white-space: nowrap;
}

/* Carousel */
.carousel {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  margin-bottom: 1.25rem;
}

.c-viewport { flex: 1; overflow: hidden; }

.c-track {
  display: flex;
  gap: 16px;
  transition: transform 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94);
}

.c-card {
  flex: 0 0 calc((100% - 32px) / 3);
  padding: 1.25rem;
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.c-card-top {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 0.5rem;
}

.c-author { display: flex; align-items: center; gap: 0.6rem; }

.c-avatar {
  width: 38px; height: 38px;
  border-radius: 50%;
  background: #4285F4;
  color: #fff;
  display: flex; align-items: center; justify-content: center;
  font-weight: 700; font-size: 1rem;
  flex-shrink: 0;
}

.c-name { font-weight: 600; font-size: 0.9rem; }
.c-date { font-size: 0.75rem; color: var(--text-muted); margin-top: 0.1rem; }
.c-stars { font-size: 1rem; display: flex; gap: 1px; }

.c-text {
  flex: 1;
  color: var(--text-light);
  font-size: 0.88rem;
  line-height: 1.65;
}

.c-footer {
  display: flex;
  align-items: center;
  gap: 0.3rem;
  font-size: 0.72rem;
  color: var(--text-muted);
  padding-top: 0.6rem;
  border-top: 1px solid var(--border);
}

/* Nav */
.c-btn {
  width: 38px; height: 38px;
  border: 1.5px solid var(--border);
  border-radius: 50%;
  display: flex; align-items: center; justify-content: center;
  color: var(--text);
  flex-shrink: 0;
  transition: all 0.2s;
  background: var(--bg-card);
}
.c-btn:hover:not(:disabled) { border-color: var(--primary); color: var(--primary); }
.c-btn:disabled { opacity: 0.25; cursor: not-allowed; }

/* Dots */
.c-dots { display: flex; justify-content: center; gap: 0.4rem; margin-bottom: 1.5rem; }
.dot { width: 8px; height: 8px; border-radius: 50%; background: var(--border); transition: all 0.2s; cursor: pointer; }
.dot.active { background: var(--primary); width: 22px; border-radius: 4px; }

/* CTA */
.g-cta { display: flex; justify-content: center; }
.g-cta-btn {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.7rem 1.5rem;
  border: none;
  border-radius: var(--radius);
  color: #fff;
  font-size: 0.9rem;
  font-weight: 500;
  font-family: var(--font-body);
  background: var(--primary);
  transition: background 0.2s, transform 0.15s;
  cursor: pointer;
  text-decoration: none;
}
.g-cta-btn:hover { background: var(--primary-dark); transform: translateY(-1px); }

@media (max-width: 960px) { .c-card { flex: 0 0 calc((100% - 16px) / 2); } }
@media (max-width: 640px) { .c-card { flex: 0 0 100%; } .c-btn { display: none; } }
</style>
