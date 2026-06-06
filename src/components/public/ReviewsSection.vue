<template>
  <section id="reviews" class="section reviews-section">
    <div class="container">
      <div class="section-header fade-up">
        <p class="section-label">Ce qu'ils en pensent</p>
        <h2 class="section-title">Avis clients</h2>
        <div class="avg-rating" v-if="reviews.visible.length">
          <StarRating :model-value="Math.round(Number(reviews.avgRating))" />
          <span class="avg-number">{{ reviews.avgRating }}</span>
          <span class="avg-count">sur {{ reviews.visible.length }} avis</span>
        </div>
      </div>

      <div v-if="reviews.visible.length" class="reviews-carousel fade-up">
        <div class="carousel-track" :style="{ transform: `translateX(-${currentSlide * slideWidth}%)` }">
          <div v-for="review in reviews.visible" :key="review.id" class="review-card card">
            <div class="review-top">
              <StarRating :model-value="review.rating" />
              <span class="review-date">{{ formatDate(review.date) }}</span>
            </div>
            <p class="review-text">« {{ review.text }} »</p>
            <div class="review-author">
              <div class="author-avatar">{{ review.author[0] }}</div>
              <span class="author-name">{{ review.author }}</span>
            </div>
          </div>
        </div>

        <div class="carousel-controls">
          <button class="carousel-btn" @click="prev" :disabled="currentSlide === 0">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="15 18 9 12 15 6"/></svg>
          </button>
          <div class="carousel-dots">
            <button
              v-for="(_, i) in slides"
              :key="i"
              :class="['dot', { active: i === currentSlide }]"
              @click="currentSlide = i"
            />
          </div>
          <button class="carousel-btn" @click="next" :disabled="currentSlide >= slides.length - 1">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="9 18 15 12 9 6"/></svg>
          </button>
        </div>
      </div>

      <!-- Leave a review -->
      <div class="leave-review fade-up">
        <h3 class="leave-title">Vous avez mangé chez nous ?</h3>
        <p>Partagez votre expérience, ça nous aide énormément !</p>
        <button class="btn btn-outline" @click="showForm = !showForm">
          {{ showForm ? 'Annuler' : 'Laisser un avis' }}
        </button>
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
import { ref, computed } from 'vue'
import { useReviewsStore } from '@/stores/reviews.js'
import { useToast } from '@/composables/useToast.js'
import StarRating from '@/components/ui/StarRating.vue'

const reviews = useReviewsStore()
const { success } = useToast()

const currentSlide = ref(0)
const perSlide = 3
const slideWidth = 100

const slides = computed(() => {
  const s = []
  for (let i = 0; i < reviews.visible.length; i += perSlide) s.push(i)
  return s
})

function prev() { if (currentSlide.value > 0) currentSlide.value-- }
function next() { if (currentSlide.value < slides.value.length - 1) currentSlide.value++ }

function formatDate(d) {
  return new Date(d).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })
}

const showForm = ref(false)
const newReview = ref({ author: '', rating: 0, text: '', date: new Date().toISOString().split('T')[0] })

function submitReview() {
  reviews.add({ ...newReview.value })
  showForm.value = false
  newReview.value = { author: '', rating: 0, text: '', date: new Date().toISOString().split('T')[0] }
  success('Merci pour votre avis ! Il sera visible après modération.')
}
</script>

<style scoped>
.reviews-section { background: var(--bg); }
.section-header { text-align: center; margin-bottom: 3rem; }

.avg-rating {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.75rem;
  margin-top: 0.75rem;
}

.avg-number { font-size: 2rem; font-weight: 700; color: var(--text); font-family: var(--font-heading); }
.avg-count  { color: var(--text-light); font-size: 0.9rem; }

.reviews-carousel { overflow: hidden; margin-bottom: 2.5rem; }

.carousel-track {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
  gap: 1.25rem;
  transition: transform 0.4s ease;
}

.review-card {
  padding: 1.5rem;
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.review-top {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.review-date { font-size: 0.8rem; color: var(--text-muted); }

.review-text {
  color: var(--text);
  font-style: italic;
  line-height: 1.65;
  flex: 1;
}

.review-author {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.author-avatar {
  width: 36px; height: 36px;
  background: var(--primary);
  color: #fff;
  border-radius: 50%;
  display: flex; align-items: center; justify-content: center;
  font-weight: 600;
  font-size: 0.95rem;
}

.author-name { font-weight: 500; font-size: 0.9rem; }

.carousel-controls {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 1rem;
  margin-top: 2rem;
}

.carousel-btn {
  width: 40px; height: 40px;
  border: 1.5px solid var(--border);
  border-radius: 50%;
  display: flex; align-items: center; justify-content: center;
  color: var(--text);
  transition: all 0.2s;
}

.carousel-btn:hover:not(:disabled) { border-color: var(--primary); color: var(--primary); }
.carousel-btn:disabled { opacity: 0.3; cursor: not-allowed; }

.carousel-dots { display: flex; gap: 0.4rem; }
.dot { width: 8px; height: 8px; border-radius: 50%; background: var(--border); transition: all 0.2s; }
.dot.active { background: var(--primary); width: 20px; border-radius: 4px; }

.leave-review {
  text-align: center;
  padding: 2.5rem;
  background: var(--bg-card);
  border-radius: var(--radius-lg);
  border: 1px solid var(--border);
}

.leave-title { font-family: var(--font-heading); font-size: 1.4rem; margin-bottom: 0.5rem; }
.leave-review p { color: var(--text-light); margin-bottom: 1.25rem; }

.review-form {
  margin-top: 1.5rem;
  padding: 1.5rem;
  text-align: left;
}

.slide-down-enter-active, .slide-down-leave-active { transition: all 0.3s ease; }
.slide-down-enter-from, .slide-down-leave-to { opacity: 0; transform: translateY(-10px); }
</style>
