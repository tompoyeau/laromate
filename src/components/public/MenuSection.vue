<template>
  <section id="menu" class="section menu-section">
    <div class="container">
      <div class="section-header fade-up">
        <p class="section-label">Notre cuisine</p>
        <h2 class="section-title">La Carte</h2>
        <p class="section-subtitle">Produits frais, recettes maison, saveurs authentiques</p>
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
                :class="{ 'has-chef': item.tags?.includes('chef-special') }"
              >
                <div class="item-top">
                  <div>
                    <div class="item-name">
                      {{ item.name }}
                      <span v-if="item.tags?.includes('chef-special')" class="chef-star" title="Coup de cœur du chef">⭐</span>
                    </div>
                    <div class="item-tags" v-if="item.tags?.length">
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

const menuStore = useMenuStore()
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
  gluten: 'Gluten',
  lactose: 'Lactose',
  nuts: 'Fruits à coque',
  eggs: 'Œufs',
  fish: 'Poisson',
  shellfish: 'Crustacés',
  soy: 'Soja',
  peanuts: 'Cacahuètes',
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

.menu-filters {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  justify-content: center;
  margin-bottom: 2rem;
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

.filter-btn.active,
.filter-btn:hover {
  border-color: var(--primary);
  background: var(--primary);
  color: #fff;
}

.menu-tabs {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  border-bottom: 2px solid var(--border);
  margin-bottom: 2.5rem;
  padding-bottom: 0;
}

.menu-tab {
  padding: 0.75rem 1.5rem;
  font-family: var(--font-body);
  font-size: 0.9rem;
  font-weight: 500;
  color: var(--text-light);
  border-radius: var(--radius-sm) var(--radius-sm) 0 0;
  border-bottom: 2px solid transparent;
  margin-bottom: -2px;
  transition: all 0.2s;
  cursor: pointer;
}

.menu-tab.active {
  color: var(--primary);
  border-bottom-color: var(--primary);
  background: var(--bg-card);
}

.menu-tab:hover:not(.active) { color: var(--text); }

.cat-subtitle {
  text-align: center;
  color: var(--text-light);
  font-size: 0.88rem;
  font-style: italic;
  margin-bottom: 2rem;
}

.menu-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(340px, 1fr));
  gap: 1rem;
}

.menu-item {
  background: var(--bg-card);
  border: 1px solid var(--border);
  border-radius: var(--radius);
  padding: 1.25rem;
  transition: all 0.2s;
}

.menu-item:hover {
  box-shadow: var(--shadow);
  transform: translateY(-2px);
}

.menu-item.has-chef {
  border-color: rgba(201, 169, 110, 0.4);
  background: linear-gradient(135deg, var(--bg-card) 0%, rgba(201, 169, 110, 0.04) 100%);
}

.item-top {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 1rem;
  margin-bottom: 0.5rem;
}

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
  font-size: 1rem;
  white-space: nowrap;
}

.item-desc {
  color: var(--text-light);
  font-size: 0.85rem;
  line-height: 1.5;
  margin-top: 0.5rem;
}

.item-allergens {
  margin-top: 0.6rem;
  font-size: 0.75rem;
  color: var(--text-muted);
  display: flex;
  flex-wrap: wrap;
  gap: 0.25rem;
  align-items: center;
}

.allergen-label { font-weight: 500; color: var(--text-light); }

.allergen {
  background: var(--border);
  padding: 0.1rem 0.45rem;
  border-radius: 99px;
}

.no-results {
  text-align: center;
  padding: 3rem;
  color: var(--text-muted);
  font-style: italic;
}

.item-fade-enter-active, .item-fade-leave-active { transition: all 0.25s ease; }
.item-fade-enter-from, .item-fade-leave-to { opacity: 0; transform: scale(0.96); }

@media (max-width: 600px) {
  .menu-grid { grid-template-columns: 1fr; }
  .menu-tabs { overflow-x: auto; flex-wrap: nowrap; padding-bottom: 0; }
}
</style>
