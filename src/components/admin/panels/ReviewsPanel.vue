<template>
  <div class="reviews-panel">
    <div class="panel-header">
      <h2 class="panel-title">Avis clients</h2>
      <div class="avg-badge" v-if="reviews.visible.length">
        ⭐ {{ reviews.avgRating }} / 5
      </div>
    </div>

    <div class="tabs">
      <button :class="['tab', { active: tab === 'pending' }]" @click="tab = 'pending'">
        En attente <span class="badge-count" v-if="reviews.pending.length">{{ reviews.pending.length }}</span>
      </button>
      <button :class="['tab', { active: tab === 'published' }]" @click="tab = 'published'">
        Publiés ({{ reviews.visible.length }})
      </button>
    </div>

    <div class="reviews-list">
      <TransitionGroup name="list">
        <div v-for="r in currentList" :key="r.id" class="review-card card">
          <div class="review-head">
            <div class="review-meta">
              <div class="author-av">{{ r.author[0] }}</div>
              <div>
                <div class="author-name">{{ r.author }}</div>
                <div class="review-date">{{ formatDate(r.date || new Date(r.createdAt).toISOString().split('T')[0]) }}</div>
              </div>
            </div>
            <StarRating :model-value="r.rating" />
          </div>
          <p class="review-text">{{ r.text }}</p>
          <div class="review-actions">
            <button
              :class="['btn btn-sm', r.visible ? 'btn-ghost' : 'btn-primary']"
              @click="reviews.toggleVisibility(r.id)"
            >
              {{ r.visible ? '👁 Masquer' : '✓ Publier' }}
            </button>
            <button class="btn btn-sm" style="background:#fee2e2;color:#dc2626" @click="remove(r.id)">
              🗑 Supprimer
            </button>
          </div>
        </div>
      </TransitionGroup>
      <div v-if="!currentList.length" class="empty-state">
        {{ tab === 'pending' ? 'Aucun avis en attente 🎉' : 'Aucun avis publié' }}
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useReviewsStore } from '@/stores/reviews.js'
import { useToast } from '@/composables/useToast.js'
import StarRating from '@/components/ui/StarRating.vue'

const reviews = useReviewsStore()
const { success } = useToast()
const tab = ref('pending')

const currentList = computed(() => tab.value === 'pending' ? reviews.pending : reviews.visible)

function formatDate(d) {
  return new Date(d).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })
}

function remove(id) {
  if (!confirm('Supprimer cet avis définitivement ?')) return
  reviews.remove(id)
  success('Avis supprimé')
}
</script>

<style scoped>
.panel-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 1.5rem; }
.panel-title { font-family: var(--font-heading); font-size: 1.6rem; }

.avg-badge {
  background: #fff8e1;
  color: #f57f17;
  font-weight: 700;
  padding: 0.4rem 1rem;
  border-radius: 99px;
  font-size: 0.9rem;
}

.tabs { display: flex; gap: 0; border-bottom: 2px solid var(--border); margin-bottom: 1.5rem; }

.tab {
  padding: 0.6rem 1.25rem;
  font-size: 0.88rem;
  font-weight: 500;
  color: var(--text-light);
  background: none;
  border-bottom: 2px solid transparent;
  margin-bottom: -2px;
  cursor: pointer;
  font-family: var(--font-body);
  transition: all 0.2s;
  display: flex;
  align-items: center;
  gap: 0.4rem;
}

.tab.active { color: var(--primary); border-bottom-color: var(--primary); }

.badge-count {
  background: var(--accent);
  color: #fff;
  font-size: 0.7rem;
  padding: 0.1rem 0.45rem;
  border-radius: 99px;
}

.reviews-list { display: flex; flex-direction: column; gap: 1rem; }

.review-card { padding: 1.25rem; }

.review-head { display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.75rem; }

.review-meta { display: flex; align-items: center; gap: 0.75rem; }

.author-av {
  width: 36px; height: 36px;
  background: var(--primary);
  color: #fff;
  border-radius: 50%;
  display: flex; align-items: center; justify-content: center;
  font-weight: 600; font-size: 0.95rem;
}

.author-name { font-weight: 600; font-size: 0.92rem; }
.review-date { font-size: 0.78rem; color: var(--text-muted); }
.review-text { color: var(--text-light); line-height: 1.6; margin-bottom: 0.75rem; font-size: 0.92rem; }
.review-actions { display: flex; gap: 0.5rem; }

.empty-state { text-align: center; padding: 3rem; color: var(--text-muted); font-style: italic; }

.list-enter-active, .list-leave-active { transition: all 0.3s ease; }
.list-enter-from, .list-leave-to { opacity: 0; transform: translateY(-8px); }
</style>
