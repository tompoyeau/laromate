<template>
  <section id="menu" class="section menu-section">
    <div class="container">
      <div class="section-header fade-up">
        <p class="section-label">{{ content.data.menuLabel }}</p>
        <h2 class="section-title">{{ content.data.menuTitle }}</h2>
        <p class="section-subtitle">{{ content.data.menuSubtitle }}</p>
      </div>

      <!-- Dietary Filters -->
      <div class="menu-filters fade-up">
        <button
          v-for="f in filters"
          :key="f.id"
          :class="['filter-btn', { active: activeFilters.includes(f.id) }]"
          @click="toggleFilter(f.id)"
        >
          {{ f.emoji }} {{ f.label }}
        </button>
      </div>

      <!-- Category Tabs -->
      <div class="menu-tabs fade-up">
        <button
          v-for="cat in menuStore.data.categories"
          :key="cat.id"
          :class="['menu-tab', { active: activeCat === cat.id }]"
          @click="activeCat = cat.id"
        >
          {{ cat.name }}
        </button>
      </div>

      <!-- Menu Panels -->
      <TransitionGroup name="fade" mode="out-in">
        <div
          v-for="cat in menuStore.data.categories"
          v-show="activeCat === cat.id"
          :key="cat.id"
          class="menu-panel"
        >
          <p v-if="cat.subtitle" class="cat-subtitle">{{ cat.subtitle }}</p>
          <div class="menu-grid">
            <TransitionGroup name="item-fade">
              <div
                v-for="item in filteredItems(cat)"
                :key="item.id"
                class="menu-item"
                :class="{
                  'has-chef': item.tags?.includes('chef-special'),
                  'has-image': !!item.image
                }"
              >
                <!-- Photo en haut si présente -->
                <div v-if="item.image" class="item-image">
                  <img :src="item.image" :alt="item.name" loading="lazy" />
                  <!-- Badge chef sur l'image -->
                  <span v-if="item.tags?.includes('chef-special')" class="chef-badge">⭐ Coup de cœur</span>
                </div>

                <div class="item-content">
                  <div class="item-top">
                    <div class="item-info">
                      <div class="item-name">
                        {{ item.name }}
                        <span v-if="item.tags?.includes('chef-special') && !item.image" class="chef-star" title="Coup de cœur du chef">⭐</span>
                      </div>
                      <div class="item-tags" v-if="item.tags?.filter(t => t !== 'chef-special').length">
                        <span v-for="tag in item.tags.filter(t => t !== 'chef-special')" :key="tag" :class="['badge', `badge-${tag}`]">
                          {{ TAG_LABELS[tag] }}
                        </span>
                      </div>
                    </div>
                    <span class="item-price">{{ item.price }}</span>
                  </div>
                  <p v-if="item.desc" class="item-desc">{{ item.desc }}</p>
                  <div class="item-allergens" v-if="item.allergens?.length">
                    <span class="allergen-label">Allergènes :</span>
                    <span v-for="a in item.allergens" :key="a" class="allergen">{{ ALLERGEN_LABELS[a] || a }}</span>
                  </div>
                </div>
              </div>
            </TransitionGroup>
          </div>
          <div v-if="filteredItems(cat).length === 0" class="no-results">
            Aucun plat ne correspond à ces filtres dans cette catégorie.
          </div>
        </div>
      </TransitionGroup>
    </div>
  </section>
</template>

<script setup>
import { ref } from 'vue'
import { useMenuStore } from '@/stores/menu.js'
import { useContentStore } from '@/stores/content.js'

const menuStore = useMenuStore()
const content   = useContentStore()
const activeCat = ref(menuStore.data.categories[0]?.id || '')
const activeFilters = ref([])

const filters = [
  { id: 'vegetarian', label: 'Végétarien', emoji: '🌱' },
  { id: 'vegan',      label: 'Vegan',      emoji: '🌿' },
  { id: 'gluten-free',label: 'Sans gluten',emoji: '🌾' },
  { id: 'spicy',      label: 'Épicé',      emoji: '🌶️' },
]

const TAG_LABELS = {
  vegetarian: '🌱 Végétarien',
  vegan: '🌿 Vegan',
  'gluten-free': '🌾 Sans gluten',
  spicy: '🌶️ Épicé',
}

const ALLERGEN_LABELS = {
  gluten: 'Gluten', lactose: 'Lactose', nuts: 'Fruits à coque',
  eggs: 'Œufs', fish: 'Poisson', shellfish: 'Crustacés',
  soy: 'Soja', peanuts: 'Cacahuètes',
}

function toggleFilter(id) {
  if (activeFilters.value.includes(id)) {
    activeFilters.value = activeFilters.value.filter(f => f !== id)
  } else {
    activeFilters.value.push(id)
  }
}

function filteredItems(cat) {
  if (!activeFilters.value.length) return cat.items
  return cat.items.filter(item =>
    activeFilters.value.every(f => item.tags?.includes(f))
  )
}
</script>

<style scoped>
.menu-section { background: var(--bg); }
.section-header { text-align: center; margin-bottom: 2rem; }

/* ── Filters ─────────────────────────────────────────────────────────────── */
.menu-filters {
  display: flex; flex-wrap: wrap; gap: 0.5rem;
  justify-content: center; margin-bottom: 2rem;
}

.filter-btn {
  padding: 0.45rem 1rem;
  border-radius: 99px;
  border: 1.5px solid var(--border);
  background: var(--bg-card);
  color: var(--text-light);
  font-size: 0.85rem;
  font-family: var(--font-body);
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
}
.filter-btn.active, .filter-btn:hover {
  border-color: var(--primary); background: var(--primary); color: #fff;
}

/* ── Tabs ────────────────────────────────────────────────────────────────── */
.menu-tabs {
  display: flex; flex-wrap: wrap; gap: 0.5rem;
  border-bottom: 2px solid var(--border);
  margin-bottom: 2.5rem; padding-bottom: 0;
}

.menu-tab {
  padding: 0.75rem 1.5rem;
  font-family: var(--font-body); font-size: 0.9rem; font-weight: 500;
  color: var(--text-light);
  border-radius: var(--radius-sm) var(--radius-sm) 0 0;
  border-bottom: 2px solid transparent;
  margin-bottom: -2px; transition: all 0.2s; cursor: pointer;
}
.menu-tab.active { color: var(--primary); border-bottom-color: var(--primary); background: var(--bg-card); }
.menu-tab:hover:not(.active) { color: var(--text); }

.cat-subtitle {
  text-align: center; color: var(--text-light);
  font-size: 0.88rem; font-style: italic; margin-bottom: 2rem;
}

/* ── Grid ────────────────────────────────────────────────────────────────── */
.menu-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
  gap: 1rem;
  align-items: start;
}

/* ── Menu item (sans image) ──────────────────────────────────────────────── */
.menu-item {
  background: var(--bg-card);
  border: 1px solid var(--border);
  border-radius: var(--radius);
  overflow: hidden;
  transition: box-shadow 0.2s, transform 0.2s;
}

.menu-item:hover {
  box-shadow: var(--shadow);
  transform: translateY(-2px);
}

.menu-item.has-chef:not(.has-image) {
  border-color: rgba(201, 169, 110, 0.4);
  background: linear-gradient(135deg, var(--bg-card) 0%, rgba(201, 169, 110, 0.04) 100%);
}

/* ── Photo ───────────────────────────────────────────────────────────────── */
.item-image {
  position: relative;
  width: 100%;
  aspect-ratio: 4 / 3;
  overflow: hidden;
}

.item-image img {
  width: 100%; height: 100%;
  object-fit: cover;
  transition: transform 0.45s ease;
}

.menu-item:hover .item-image img { transform: scale(1.06); }

/* Badge chef sur la photo */
.chef-badge {
  position: absolute;
  top: 0.65rem; left: 0.65rem;
  background: rgba(201, 169, 110, 0.92);
  color: #fff;
  font-size: 0.72rem;
  font-weight: 600;
  padding: 0.25rem 0.6rem;
  border-radius: 99px;
  backdrop-filter: blur(4px);
  letter-spacing: 0.02em;
}

/* ── Content ─────────────────────────────────────────────────────────────── */
.item-content { padding: 1.1rem 1.25rem; }

.has-image .item-content { padding-top: 0.9rem; }

.item-top {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 1rem;
  margin-bottom: 0.5rem;
}

.item-info { flex: 1; min-width: 0; }

.item-name {
  font-family: var(--font-heading);
  font-size: 1.05rem;
  color: var(--text);
  margin-bottom: 0.35rem;
}

.chef-star { font-size: 0.85rem; margin-left: 0.3rem; }

.item-tags { display: flex; flex-wrap: wrap; gap: 0.3rem; }

.item-price {
  font-weight: 600;
  color: var(--primary);
  font-size: 1.05rem;
  white-space: nowrap;
  flex-shrink: 0;
}

.item-desc {
  color: var(--text-light);
  font-size: 0.85rem;
  line-height: 1.55;
  margin-top: 0.4rem;
}

.item-allergens {
  margin-top: 0.65rem;
  font-size: 0.75rem;
  color: var(--text-muted);
  display: flex; flex-wrap: wrap; gap: 0.25rem; align-items: center;
}

.allergen-label { font-weight: 500; color: var(--text-light); }
.allergen { background: var(--border); padding: 0.1rem 0.45rem; border-radius: 99px; }

/* ── Empty ───────────────────────────────────────────────────────────────── */
.no-results {
  text-align: center; padding: 3rem;
  color: var(--text-muted); font-style: italic;
}

/* ── Transitions ─────────────────────────────────────────────────────────── */
.item-fade-enter-active, .item-fade-leave-active { transition: all 0.25s ease; }
.item-fade-enter-from, .item-fade-leave-to { opacity: 0; transform: scale(0.96); }

/* ── Responsive ──────────────────────────────────────────────────────────── */
@media (max-width: 600px) {
  .menu-grid { grid-template-columns: 1fr; }
  .menu-tabs { overflow-x: auto; flex-wrap: nowrap; padding-bottom: 0; }
}
</style>
