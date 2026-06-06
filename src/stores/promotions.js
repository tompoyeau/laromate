import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

const LS_KEY = 'laromate_promotions'

export const usePromotionsStore = defineStore('promotions', () => {
  const items = ref(load())

  function load() {
    try {
      const raw = localStorage.getItem(LS_KEY)
      return raw ? JSON.parse(raw) : []
    } catch { return [] }
  }

  function save() {
    localStorage.setItem(LS_KEY, JSON.stringify(items.value))
  }

  function add(promo) {
    items.value.push({ ...promo, id: crypto.randomUUID(), active: true })
    save()
  }

  function update(id, fields) {
    const p = items.value.find(p => p.id === id)
    if (p) { Object.assign(p, fields); save() }
  }

  function remove(id) {
    items.value = items.value.filter(p => p.id !== id)
    save()
  }

  function toggle(id) {
    const p = items.value.find(p => p.id === id)
    if (p) { p.active = !p.active; save() }
  }

  const active = computed(() => {
    const today = new Date().toISOString().split('T')[0]
    return items.value.filter(p => p.active && (!p.validUntil || p.validUntil >= today))
  })

  return { items, active, add, update, remove, toggle }
})
