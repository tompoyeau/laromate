import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { collection, getDocs, setDoc, deleteDoc, doc } from 'firebase/firestore'
import { db } from '@/firebase.js'

export const usePromotionsStore = defineStore('promotions', () => {
  const items = ref([])

  // Chargement Firestore (non bloquant)
  getDocs(collection(db, 'promos')).then(snap => {
    items.value = snap.docs.map(d => ({ id: d.id, ...d.data() }))
  }).catch(console.error)

  async function add(promo) {
    const id = crypto.randomUUID()
    const newPromo = { ...promo, id, active: true }
    items.value.push(newPromo)
    await setDoc(doc(db, 'promos', id), newPromo)
  }

  async function update(id, fields) {
    const p = items.value.find(p => p.id === id)
    if (p) {
      Object.assign(p, fields)
      await setDoc(doc(db, 'promos', id), JSON.parse(JSON.stringify(p)))
    }
  }

  async function remove(id) {
    items.value = items.value.filter(p => p.id !== id)
    await deleteDoc(doc(db, 'promos', id))
  }

  async function toggle(id) {
    const p = items.value.find(p => p.id === id)
    if (p) {
      p.active = !p.active
      await setDoc(doc(db, 'promos', id), JSON.parse(JSON.stringify(p)))
    }
  }

  const active = computed(() => {
    const today = new Date().toISOString().split('T')[0]
    return items.value.filter(p => p.active && (!p.validUntil || p.validUntil >= today))
  })

  return { items, active, add, update, remove, toggle }
})
