<template>
  <div class="menu-panel">
    <div class="panel-header">
      <h2 class="panel-title">La Carte</h2>
      <button class="btn btn-primary btn-sm" @click="openAddCat">+ Catégorie</button>
    </div>

    <!-- Category Tabs -->
    <div class="cat-tabs">
      <button
        v-for="cat in menu.data.categories"
        :key="cat.id"
        :class="['cat-tab', { active: activeCat === cat.id }]"
        @click="activeCat = cat.id"
      >
        {{ cat.name }}
        <span class="cat-count">{{ cat.items.length }}</span>
      </button>
    </div>

    <div v-if="currentCat" class="cat-panel">
      <div class="cat-toolbar">
        <div>
          <div class="cat-name">{{ currentCat.name }}</div>
          <div class="cat-subtitle-text" v-if="currentCat.subtitle">{{ currentCat.subtitle }}</div>
        </div>
        <div class="cat-actions">
          <button class="btn btn-outline btn-sm" @click="openEditCat">✏️ Modifier</button>
          <button class="btn btn-sm" style="background:#fee2e2;color:#dc2626" @click="deleteCat">🗑 Supprimer</button>
          <button class="btn btn-primary btn-sm" @click="openAddItem">+ Plat</button>
        </div>
      </div>

      <div class="items-grid">
        <div v-for="item in currentCat.items" :key="item.id" class="item-card card">
          <div class="item-head">
            <span class="item-name">{{ item.name }}</span>
            <span class="item-price">{{ item.price }}</span>
          </div>
          <p class="item-desc" v-if="item.desc">{{ item.desc }}</p>
          <div class="item-tags" v-if="item.tags?.length || item.allergens?.length">
            <span v-for="t in item.tags" :key="t" :class="['badge', `badge-${t}`]">{{ TAG_LABELS[t] }}</span>
            <span v-for="a in item.allergens" :key="a" class="badge allergen-badge">{{ a }}</span>
          </div>
          <div class="item-actions">
            <button class="btn-icon" @click="openEditItem(item)" title="Modifier">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
            </button>
            <button class="btn-icon danger" @click="deleteItem(item.id)" title="Supprimer">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/><path d="M10 11v6"/><path d="M14 11v6"/><path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/></svg>
            </button>
          </div>
        </div>
        <div v-if="!currentCat.items.length" class="empty-cat">
          Aucun plat — <button class="link" @click="openAddItem">Ajouter le premier</button>
        </div>
      </div>
    </div>

    <!-- Category Modal -->
    <AppModal v-model="catModal" :title="editingCat ? 'Modifier la catégorie' : 'Nouvelle catégorie'">
      <div class="form-group">
        <label class="form-label">Nom *</label>
        <input v-model="catForm.name" class="form-input" placeholder="Burgers, Salades…" required />
      </div>
      <div class="form-group">
        <label class="form-label">Sous-titre</label>
        <input v-model="catForm.subtitle" class="form-input" placeholder="Servis avec frites maison…" />
      </div>
      <template #footer>
        <button class="btn btn-ghost" @click="catModal = false">Annuler</button>
        <button class="btn btn-primary" @click="saveCat">{{ editingCat ? 'Mettre à jour' : 'Créer' }}</button>
      </template>
    </AppModal>

    <!-- Item Modal -->
    <AppModal v-model="itemModal" :title="editingItem ? 'Modifier le plat' : 'Nouveau plat'">
      <div class="form-group">
        <label class="form-label">Nom *</label>
        <input v-model="itemForm.name" class="form-input" placeholder="Le Classique" required />
      </div>
      <div class="form-row">
        <div class="form-group">
          <label class="form-label">Prix *</label>
          <input v-model="itemForm.price" class="form-input" placeholder="14€90" required />
        </div>
      </div>
      <div class="form-group">
        <label class="form-label">Description</label>
        <textarea v-model="itemForm.desc" class="form-textarea" placeholder="Ingrédients, sauce…" rows="3"></textarea>
      </div>
      <div class="form-group">
        <label class="form-label">Tags</label>
        <div class="tag-picker">
          <label v-for="t in ALL_TAGS" :key="t.id" :class="['tag-opt', { active: itemForm.tags.includes(t.id) }]">
            <input type="checkbox" :value="t.id" v-model="itemForm.tags" style="display:none" />
            {{ t.emoji }} {{ t.label }}
          </label>
        </div>
      </div>
      <div class="form-group">
        <label class="form-label">Allergènes</label>
        <div class="allergen-picker">
          <label v-for="a in ALL_ALLERGENS" :key="a.id" :class="['allergen-opt', { active: itemForm.allergens.includes(a.id) }]">
            <input type="checkbox" :value="a.id" v-model="itemForm.allergens" style="display:none" />
            {{ a.label }}
          </label>
        </div>
      </div>
      <template #footer>
        <button class="btn btn-ghost" @click="itemModal = false">Annuler</button>
        <button class="btn btn-primary" @click="saveItem">{{ editingItem ? 'Mettre à jour' : 'Ajouter' }}</button>
      </template>
    </AppModal>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useMenuStore } from '@/stores/menu.js'
import { useToast } from '@/composables/useToast.js'
import AppModal from '@/components/ui/AppModal.vue'

const menu = useMenuStore()
const { success, error } = useToast()

const activeCat = ref(menu.data.categories[0]?.id || '')
const currentCat = computed(() => menu.data.categories.find(c => c.id === activeCat.value))

const TAG_LABELS = {
  vegetarian: '🌱 Végétarien',
  vegan: '🌿 Vegan',
  'gluten-free': '🌾 Sans gluten',
  spicy: '🌶️ Épicé',
  'chef-special': '⭐ Coup de cœur'
}

const ALL_TAGS = [
  { id: 'vegetarian', label: 'Végétarien', emoji: '🌱' },
  { id: 'vegan', label: 'Vegan', emoji: '🌿' },
  { id: 'gluten-free', label: 'Sans gluten', emoji: '🌾' },
  { id: 'spicy', label: 'Épicé', emoji: '🌶️' },
  { id: 'chef-special', label: 'Coup de cœur', emoji: '⭐' },
]

const ALL_ALLERGENS = [
  { id: 'gluten', label: 'Gluten' }, { id: 'lactose', label: 'Lactose' },
  { id: 'nuts', label: 'Fruits à coque' }, { id: 'eggs', label: 'Œufs' },
  { id: 'fish', label: 'Poisson' }, { id: 'shellfish', label: 'Crustacés' },
  { id: 'soy', label: 'Soja' }, { id: 'peanuts', label: 'Cacahuètes' },
]

// Category modal
const catModal = ref(false)
const editingCat = ref(null)
const catForm = ref({ name: '', subtitle: '' })

function openAddCat() { editingCat.value = null; catForm.value = { name: '', subtitle: '' }; catModal.value = true }
function openEditCat() {
  editingCat.value = currentCat.value
  catForm.value = { name: currentCat.value.name, subtitle: currentCat.value.subtitle || '' }
  catModal.value = true
}

function saveCat() {
  if (!catForm.value.name.trim()) return
  if (editingCat.value) {
    menu.updateCategory(editingCat.value.id, catForm.value)
    success('Catégorie mise à jour')
  } else {
    const id = catForm.value.name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '')
    menu.addCategory({ id, ...catForm.value })
    activeCat.value = id
    success('Catégorie créée')
  }
  catModal.value = false
}

function deleteCat() {
  if (!confirm(`Supprimer "${currentCat.value.name}" et tous ses plats ?`)) return
  const cats = menu.data.categories
  const idx = cats.findIndex(c => c.id === activeCat.value)
  menu.deleteCategory(activeCat.value)
  activeCat.value = menu.data.categories[Math.max(0, idx - 1)]?.id || ''
  success('Catégorie supprimée')
}

// Item modal
const itemModal = ref(false)
const editingItem = ref(null)
const itemForm = ref({ name: '', price: '', desc: '', tags: [], allergens: [] })

function openAddItem() {
  editingItem.value = null
  itemForm.value = { name: '', price: '', desc: '', tags: [], allergens: [] }
  itemModal.value = true
}

function openEditItem(item) {
  editingItem.value = item
  itemForm.value = { ...item, tags: [...(item.tags || [])], allergens: [...(item.allergens || [])] }
  itemModal.value = true
}

function saveItem() {
  if (!itemForm.value.name.trim() || !itemForm.value.price.trim()) return
  if (editingItem.value) {
    menu.updateItem(activeCat.value, editingItem.value.id, itemForm.value)
    success('Plat mis à jour')
  } else {
    menu.addItem(activeCat.value, itemForm.value)
    success('Plat ajouté')
  }
  itemModal.value = false
}

function deleteItem(id) {
  if (!confirm('Supprimer ce plat ?')) return
  menu.deleteItem(activeCat.value, id)
  success('Plat supprimé')
}
</script>

<style scoped>
.panel-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 1.5rem; }
.panel-title { font-family: var(--font-heading); font-size: 1.6rem; }

.cat-tabs { display: flex; flex-wrap: wrap; gap: 0.4rem; margin-bottom: 1.5rem; border-bottom: 2px solid var(--border); padding-bottom: 0; }

.cat-tab {
  display: flex;
  align-items: center;
  gap: 0.4rem;
  padding: 0.6rem 1.2rem;
  border-radius: var(--radius-sm) var(--radius-sm) 0 0;
  font-size: 0.88rem;
  font-weight: 500;
  color: var(--text-light);
  background: none;
  border-bottom: 2px solid transparent;
  margin-bottom: -2px;
  cursor: pointer;
  font-family: var(--font-body);
  transition: all 0.2s;
}

.cat-tab.active { color: var(--primary); border-bottom-color: var(--primary); background: var(--bg-card); }
.cat-count { background: var(--border); color: var(--text-muted); font-size: 0.7rem; padding: 0.1rem 0.4rem; border-radius: 99px; }
.cat-tab.active .cat-count { background: rgba(107, 124, 92, 0.15); color: var(--primary); }

.cat-toolbar { display: flex; justify-content: space-between; align-items: center; margin-bottom: 1.25rem; }
.cat-name { font-family: var(--font-heading); font-size: 1.2rem; }
.cat-subtitle-text { font-size: 0.82rem; color: var(--text-light); font-style: italic; }
.cat-actions { display: flex; gap: 0.5rem; }

.items-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(300px, 1fr)); gap: 0.75rem; }

.item-card { padding: 1rem; }

.item-head { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 0.35rem; gap: 0.5rem; }
.item-name { font-weight: 600; font-size: 0.95rem; }
.item-price { font-weight: 600; color: var(--primary); white-space: nowrap; }
.item-desc { font-size: 0.82rem; color: var(--text-light); line-height: 1.4; margin-bottom: 0.5rem; }
.item-tags { display: flex; flex-wrap: wrap; gap: 0.25rem; margin-bottom: 0.5rem; }
.allergen-badge { background: var(--border); color: var(--text-muted); font-size: 0.7rem; padding: 0.15rem 0.4rem; border-radius: 99px; }

.item-actions { display: flex; gap: 0.25rem; justify-content: flex-end; padding-top: 0.5rem; border-top: 1px solid var(--border); }
.danger:hover { background: #fee2e2; color: #dc2626; }

.empty-cat { color: var(--text-muted); font-style: italic; padding: 1.5rem; text-align: center; grid-column: 1/-1; }
.link { color: var(--primary); text-decoration: underline; cursor: pointer; background: none; border: none; font-family: inherit; }

.tag-picker, .allergen-picker { display: flex; flex-wrap: wrap; gap: 0.4rem; }

.tag-opt, .allergen-opt {
  padding: 0.35rem 0.75rem;
  border-radius: 99px;
  border: 1.5px solid var(--border);
  font-size: 0.82rem;
  cursor: pointer;
  transition: all 0.15s;
  user-select: none;
}

.tag-opt.active   { background: var(--primary); color: #fff; border-color: var(--primary); }
.allergen-opt.active { background: #fee2e2; color: #dc2626; border-color: #dc2626; }
</style>
