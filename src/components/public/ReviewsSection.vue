<template>
  <section id="reviews" class="section reviews-section">
    <div class="container">

      <!-- Header -->
      <div class="section-header fade-up">
        <p class="section-label">Ce qu'ils en pensent</p>
        <h2 class="section-title">Avis clients</h2>

        <!-- Google Rating Badge -->
        <div v-if="google.isConfigured && google.placeData" class="google-rating-badge">
          <div class="g-badge-inner">
            <div class="g-logo">
              <svg viewBox="0 0 24 24" width="22" height="22">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
            </div>
            <div class="g-score">{{ google.placeData.rating }}</div>
            <div class="g-stars">
              <span v-for="i in 5" :key="i" class="g-star"
                :style="{ color: i <= google.placeData.rating ? '#fbbc04' : '#e0e0e0' }">★</span>
            </div>
            <div class="g-count">{{ google.placeData.userRatingsTotal?.toLocaleString('fr-FR') }} avis</div>
            <a v-if="google.placeData.url" :href="google.placeData.url" target="_blank" rel="noopener" class="g-link">
              Voir sur Google Maps ↗
            </a>
          </div>
        </div>

        <!-- Fallback avg rating (manual reviews) -->
        <div v-else-if="reviews.visible.length" class="avg-rating">
          <StarRating :model-value="Math.round(Number(reviews.avgRating))" />
          <span class="avg-number">{{ reviews.avgRating }}</span>
          <span class="avg-count">sur {{ reviews.visible.length }} avis</span>
        </div>
      </div>

      <!-- Google Reviews Carousel -->
      <div v-if="google.isConfigured && googleReviews.length" class="reviews-block fade-up">
        <div class="block-label">
          <svg viewBox="0 0 24 24" width="16" height="16">
            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
          </svg>
          Avis Google
        </div>

        <div class="carousel-viewport" ref="carouselEl">
          <div class="carousel-track" :style="{ transform: `translateX(-${gSlide * 100}%)` }">
            <div v-for="chunk in googleChunks" :key="chunk[0].authorName" class="carousel-slide">
              <div class="reviews-grid">
                <div v-for="r in chunk" :key="r.authorName + r.time" class="review-card card google-card">
                  <div class="review-top">
                    <div class="reviewer">
                      <img v-if="r.profilePhotoUrl" :src="r.profilePhotoUrl" :alt="r.authorName" class="reviewer-avatar" referrerpolicy="no-referrer" />
                      <div v-else class="reviewer-initials">{{ r.authorName[0] }}</div>
                      <div class="reviewer-info">
                        <a :href="r.authorUrl" target="_blank" rel="noopener" class="reviewer-name">{{ r.authorName }}</a>
                        <div class="review-time">{{ r.relativeTimeDescription }}</div>
                      </div>
                    </div>
                    <div class="review-stars">
                      <span v-for="i in 5" :key="i" class="r-star" :style="{ color: i <= r.rating ? '#fbbc04' : '#e0e0e0' }">★</span>
                    </div>
                  </div>
                  <p v-if="r.text" class="review-text">{{ r.text }}</p>
                  <div class="google-attribution">
                    <svg viewBox="0 0 24 24" width="14" height="14">
                      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                    </svg>
                    Avis Google
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Carousel nav -->
        <div class="carousel-nav" v-if="googleChunks.length > 1">
          <button class="carousel-btn" @click="gSlide = Math.max(0, gSlide - 1)" :disabled="gSlide === 0">‹</button>
          <div class="carousel-dots">
            <button v-for="(_, i) in googleChunks" :key="i" :class="['dot', { active: i === gSlide }]" @click="gSlide = i" />
          </div>
          <button class="carousel-btn" @click="gSlide = Math.min(googleChunks.length - 1, gSlide + 1)" :disabled="gSlide === googleChunks.length - 1">›</button>
        </div>

        <!-- CTA Google -->
        <div class="google-cta" v-if="google.placeData?.url">
          <a :href="google.placeData.url" target="_blank" rel="noopener" class="btn btn-outline google-cta-btn">
            <svg viewBox="0 0 24 24" width="16" height="16">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
            Laisser un avis sur Google
          </a>
          <span class="powered-by">Données fournies par Google</span>
        </div>
      </div>

      <!-- Loading state -->
      <div v-else-if="google.isConfigured && google.loading" class="loading-state fade-up">
        <div class="loader"></div>
        <p>Chargement des avis Google…</p>
      </div>

      <!-- Manual reviews (always shown, below Google if present) -->
      <div v-if="reviews.visible.length" class="reviews-block fade-up">
        <div v-if="google.isConfigured && googleReviews.length" class="block-label">⭐ Avis de nos clients</div>

        <div class="reviews-grid">
          <div v-for="r in reviews.visible" :key="r.id" class="review-card card">
            <div class="review-top">
              <div class="reviewer">
                <div class="reviewer-initials">{{ r.author[0] }}</div>
                <div class="reviewer-info">
                  <div class="reviewer-name">{{ r.author }}</div>
                  <div class="review-time">{{ formatDate(r.date) }}</div>
                </div>
              </div>
              <StarRating :model-value="r.rating" />
            </div>
            <p class="review-text">{{ r.text }}</p>
          </div>
        </div>
      </div>

      <!-- Leave a review -->
      <div class="leave-review fade-up">
        <h3>Vous avez dîné chez nous ?</h3>
        <p>Votre avis nous aide à progresser et à accueillir de nouveaux clients.</p>
        <div class="leave-actions">
          <a v-if="google.placeData?.url" :href="google.placeData.url" target="_blank" rel="noopener" class="btn btn-primary">
            <svg viewBox="0 0 24 24" width="16" height="16">
              <path fill="white" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="white" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="white" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
              <path fill="white" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
            Laisser un avis Google
          </a>
          <button class="btn btn-outline" @click="showForm = !showForm">
            {{ showForm ? 'Annuler' : '✏️ Laisser un avis ici' }}
          </button>
        </div>

        <Transition name="slide-down">
          <form v-if="showForm" @submit.prevent="submitReview" class="review-form card">
            <div class="form-row">
              <div class="form-group">
                <label class="form-label">Votre prénom *</label>
                <input v-model="newReview.author" class="form-input" placeholder="Marie" required />
              </div>
              <div class="form-group">
                <label class="form-label">Note *</label>
                <StarRating v-model="newReview.rating" :interactive="true" />
              </div>
            </div>
            <div class="form-group">
              <label class="form-label">Votre avis *</label>
              <textarea v-model="newReview.text" class="form-textarea" placeholder="Partagez votre expérience…" required rows="4"></textarea>
            </div>
            <button type="submit" class="btn btn-primary" :disabled="newReview.rating === 0">
              Envoyer mon avis
            </button>
          </form>
        </Transition>
      </div>

    </div>
  </section>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useReviewsStore } from '@/stores/reviews.js'
import { useGooglePlacesStore } from '@/stores/googlePlaces.js'
import { useToast } from '@/composables/useToast.js'
import StarRating from '@/components/ui/StarRating.vue'

const reviews = useReviewsStore()
const google = useGooglePlacesStore()
const { success } = useToast()

// Fetch Google reviews on mount if configured
onMounted(() => {
  if (google.isConfigured) google.fetch()
})

// Google reviews with text only
const googleReviews = computed(() =>
  (google.placeData?.reviews || []).filter(r => r.text)
)

// Chunk Google reviews for carousel (3 per slide)
const PER_SLIDE = 3
const googleChunks = computed(() => {
  const chunks = []
  for (let i = 0; i < googleReviews.value.length; i += PER_SLIDE) {
    chunks.push(googleReviews.value.slice(i, i + PER_SLIDE))
  }
  return chunks
})

const gSlide = ref(0)

function formatDate(d) {
  return new Date(d).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })
}

const showForm = ref(false)
const newReview = ref({ author: '', rating: 0, text: '', date: new Date().toISOString().split('T')[0] })

function submitReview() {
  reviews.add({ ...newReview.value })
  showForm.value = false
  newReview.value = { author: '', rating: 0, text: '', date: new Date().toISOString().split('T')[0] }
  success('Merci ! Votre avis sera visible après modération.')
}
</script>

<style scoped>
.reviews-section { background: var(--bg); }

.section-header { text-align: center; margin-bottom: 3rem; }

/* Google Rating Badge */
.google-rating-badge {
  margin-top: 1.25rem;
  display: inline-block;
}

.g-badge-inner {
  display: inline-flex;
  flex-direction: column;
  align-items: center;
  gap: 0.3rem;
  background: var(--bg-card);
  border: 1px solid var(--border);
  border-radius: var(--radius-lg);
  padding: 1.25rem 2rem;
  box-shadow: var(--shadow-sm);
}

.g-logo { display: flex; }

.g-score {
  font-size: 2.8rem;
  font-weight: 700;
  font-family: var(--font-heading);
  color: var(--text);
  line-height: 1;
}

.g-stars { display: flex; gap: 2px; font-size: 1.3rem; }
.g-count { font-size: 0.88rem; color: var(--text-light); }
.g-link {
  font-size: 0.78rem;
  color: #1a73e8;
  text-decoration: underline;
  margin-top: 0.25rem;
}

/* Avg (fallback) */
.avg-rating { display: flex; align-items: center; justify-content: center; gap: 0.75rem; margin-top: 0.75rem; }
.avg-number { font-size: 2rem; font-weight: 700; color: var(--text); font-family: var(--font-heading); }
.avg-count  { color: var(--text-light); font-size: 0.9rem; }

/* Reviews blocks */
.reviews-block { margin-bottom: 2.5rem; }

.block-label {
  display: flex;
  align-items: center;
  gap: 0.4rem;
  font-size: 0.8rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  color: var(--text-muted);
  margin-bottom: 1rem;
}

/* Carousel */
.carousel-viewport { overflow: hidden; }
.carousel-track {
  display: flex;
  transition: transform 0.4s ease;
}
.carousel-slide { flex: 0 0 100%; }

/* Grid */
.reviews-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 1rem;
}

/* Review cards */
.review-card { padding: 1.25rem; }

.google-card { border-top: 3px solid #4285F4; }

.review-top {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 0.75rem;
  gap: 0.5rem;
}

.reviewer { display: flex; align-items: center; gap: 0.6rem; }

.reviewer-avatar {
  width: 38px; height: 38px;
  border-radius: 50%;
  object-fit: cover;
  flex-shrink: 0;
}

.reviewer-initials {
  width: 38px; height: 38px;
  border-radius: 50%;
  background: var(--primary);
  color: #fff;
  display: flex; align-items: center; justify-content: center;
  font-weight: 700; font-size: 1rem;
  flex-shrink: 0;
}

.reviewer-name {
  font-weight: 600;
  font-size: 0.9rem;
  color: var(--text);
  text-decoration: none;
}

a.reviewer-name:hover { color: #1a73e8; text-decoration: underline; }

.review-time { font-size: 0.75rem; color: var(--text-muted); margin-top: 0.1rem; }

.review-stars, .r-star { font-size: 1rem; }

.review-text {
  color: var(--text-light);
  font-size: 0.88rem;
  line-height: 1.6;
}

.google-attribution {
  display: flex;
  align-items: center;
  gap: 0.3rem;
  margin-top: 0.75rem;
  font-size: 0.72rem;
  color: var(--text-muted);
  padding-top: 0.5rem;
  border-top: 1px solid var(--border);
}

/* Carousel nav */
.carousel-nav { display: flex; align-items: center; justify-content: center; gap: 1rem; margin-top: 1.25rem; }
.carousel-btn {
  width: 38px; height: 38px;
  border: 1.5px solid var(--border);
  border-radius: 50%;
  display: flex; align-items: center; justify-content: center;
  font-size: 1.3rem;
  color: var(--text);
  transition: all 0.2s;
  line-height: 1;
}
.carousel-btn:hover:not(:disabled) { border-color: var(--primary); color: var(--primary); }
.carousel-btn:disabled { opacity: 0.3; cursor: not-allowed; }

.carousel-dots { display: flex; gap: 0.4rem; }
.dot { width: 8px; height: 8px; border-radius: 50%; background: var(--border); transition: all 0.2s; }
.dot.active { background: var(--primary); width: 20px; border-radius: 4px; }

/* Google CTA */
.google-cta {
  display: flex;
  align-items: center;
  gap: 1rem;
  margin-top: 1.25rem;
  flex-wrap: wrap;
}

.google-cta-btn {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  border-color: #4285F4;
  color: #1a73e8;
}

.google-cta-btn:hover { background: #e8f0fe; }

.powered-by { font-size: 0.75rem; color: var(--text-muted); }

/* Loading */
.loading-state { display: flex; flex-direction: column; align-items: center; gap: 1rem; padding: 3rem; color: var(--text-muted); }
.loader {
  width: 36px; height: 36px;
  border: 3px solid var(--border);
  border-top-color: #4285F4;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}
@keyframes spin { to { transform: rotate(360deg); } }

/* Leave review */
.leave-review {
  text-align: center;
  padding: 2.5rem;
  background: var(--bg-card);
  border-radius: var(--radius-lg);
  border: 1px solid var(--border);
}
.leave-review h3 { font-family: var(--font-heading); font-size: 1.4rem; margin-bottom: 0.5rem; }
.leave-review p  { color: var(--text-light); margin-bottom: 1.25rem; }
.leave-actions { display: flex; justify-content: center; gap: 0.75rem; flex-wrap: wrap; }

.review-form { margin-top: 1.5rem; padding: 1.5rem; text-align: left; }

.slide-down-enter-active, .slide-down-leave-active { transition: all 0.3s ease; }
.slide-down-enter-from, .slide-down-leave-to { opacity: 0; transform: translateY(-10px); }

@media (max-width: 600px) { .reviews-grid { grid-template-columns: 1fr; } }
</style>
