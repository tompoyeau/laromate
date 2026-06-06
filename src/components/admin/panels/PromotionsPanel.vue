<template>
  <div class="promo-panel">
    <div class="panel-header">
      <h2 class="panel-title">Offres & Promotions</h2>
      <button class="btn btn-primary btn-sm" @click="openAdd">+ Nouvelle offre</button>
    </div>

    <div v-if="promos.items.length" class="promo-list">
      <div v-for="p in promos.items" :key="p.id" class="promo-card card" :class="{ inactive: !p.active }">
        <div class="promo-head">
          <div class="promo-info">
            <div class="promo-title-text">{{ p.title }}</div>
            <div class="promo-discount-badge" v-if="p.discount">{{ p.discount }}</div>
          </div>
          <div class="promo-controls">
            <label class="toggle" :title="p.active ? 'Désactiver' : 'Activer'">
              <input type="checkbox" :checked="p.active" @change="promos.toggle(p.id)" />
              <span class="toggle-track"><span class="toggle-thumb" /></span>
            </label>
          </div>
        </div>
        <p class="promo-desc-text" v-if="p.description">{{ p.description }}</p>
        <div class="promo-meta">
          <span v-if="p.validUntil" class="promo-until">📅 Valable jusqu'au {{ formatDate(p.validUntil) }}</span>
          <span :class="['promo-status', p.active ? 'active' : 'inactive']">
            {{ p.active ? '● Actif' : '● Inactif' }}
          </span>
        </div>
        <div class="promo-actions">
          <button class="btn btn-ghost btn-sm" @click="openEdit(p)">✏️ Modifier</button>
          <button class="btn btn-sm" style="background:#fee2e2;color:#dc2626" @click="remove(p.id)">🗑 Supprimer</button>
        </div>
      </div>
    </div>

    <div v-else class="empty-state card">
      <div class="empty-icon">🎉</div>
      <h3>Aucune offre configurée</h3>
      <p>Créez des promotions qui s'afficheront en bannière sur le site.</p>
      <button class="btn btn-primary" @click="openAdd">Créer une offre</button>
    </div>

    <AppModal v-model="modal" :title="editing ? 'Modifier l\'offre' : 'Nouvelle offre'">
      <div class="form-group">
        <label class="form-label">Titre *</label>
        <input v-model="form.title" class="form-input" placeholder="Happy Hour, Menu du jour…" required />
      </div>
      <div class="form-group">
        <label class="form-label">Description</label>
        <input v-model="form.description" class="form-input" placeholder="Détails de l'offre…" />
      </div>
      <div class="form-row">
        <div class="form-group">
          <label class="form-label">Remise / accroche</label>
          <input v-model="form.discount" class="form-input" placeholder="-20%, 2 pour 1…" />
        </div>
        <div class="form-group">
          <label class="form-label">Valable jusqu'au</label>
          <input v-model="form.validUntil" class="form-input" type="date" />
        </div>
      </div>
      <template #footer>
        <button class="btn btn-ghost" @click="modal = false">Annuler</button>
        <button class="btn btn-primary" @click="save">{{ editing ? 'Mettre à jour' : 'Créer' }}</button>
      </template>
    </AppModal>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { usePromotionsStore } from '@/stores/promotions.js'
import { useToast } from '@/composables/useToast.js'
import AppModal from '@/components/ui/AppModal.vue'

const promos = usePromotionsStore()
const { success } = useToast()

const modal = ref(false)
const editing = ref(null)
const form = ref({ title: '', description: '', discount: '', validUntil: '' })

function openAdd() { editing.value = null; form.value = { title: '', description: '', discount: '', validUntil: '' }; modal.value = true }
function openEdit(p) { editing.value = p; form.value = { ...p }; modal.value = true }

function save() {
  if (!form.value.title.trim()) return
  if (editing.value) {
    promos.update(editing.value.id, form.value)
    success('Offre mise à jour')
  } else {
    promos.add(form.value)
    success('Offre créée !')
  }
  modal.value = false
}

function remove(id) {
  if (!confirm('Supprimer cette offre ?')) return
  promos.remove(id)
  success('Offre supprimée')
}

function formatDate(d) {
  return new Date(d).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })
}
</script>

<style scoped>
.panel-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 1.5rem; }
.panel-title { font-family: var(--font-heading); font-size: 1.6rem; }

.promo-list { display: flex; flex-direction: column; gap: 0.75rem; }

.promo-card { padding: 1.25rem; transition: opacity 0.2s; }
.promo-card.inactive { opacity: 0.6; }

.promo-head { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 0.5rem; }

.promo-title-text { font-weight: 600; font-size: 1rem; margin-bottom: 0.25rem; }

.promo-discount-badge {
  display: inline-block;
  background: var(--accent);
  color: #fff;
  font-size: 0.78rem;
  font-weight: 700;
  padding: 0.2rem 0.6rem;
  border-radius: 99px;
}

.promo-desc-text { color: var(--text-light); font-size: 0.88rem; margin-bottom: 0.6rem; }

.promo-meta { display: flex; align-items: center; gap: 1rem; margin-bottom: 0.75rem; font-size: 0.82rem; }
.promo-until { color: var(--text-light); }
.promo-status { font-weight: 600; }
.promo-status.active  { color: #16a34a; }
.promo-status.inactive{ color: var(--text-muted); }

.promo-actions { display: flex; gap: 0.5rem; padding-top: 0.75rem; border-top: 1px solid var(--border); }

/* Toggle switch */
.toggle { display: flex; align-items: center; cursor: pointer; }
.toggle input { display: none; }

.toggle-track {
  width: 42px; height: 24px;
  background: var(--border);
  border-radius: 99px;
  position: relative;
  transition: background 0.2s;
}

.toggle input:checked + .toggle-track { background: var(--primary); }

.toggle-thumb {
  position: absolute;
  top: 3px; left: 3px;
  width: 18px; height: 18px;
  background: #fff;
  border-radius: 50%;
  transition: left 0.2s;
  box-shadow: 0 1px 4px rgba(0,0,0,0.2);
}

.toggle input:checked + .toggle-track .toggle-thumb { left: 21px; }

.empty-state {
  padding: 4rem 2rem;
  text-align: center;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.75rem;
}

.empty-icon { font-size: 3rem; }
.empty-state h3 { font-family: var(--font-heading); font-size: 1.3rem; }
.empty-state p  { color: var(--text-light); }
</style>
