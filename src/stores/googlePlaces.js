import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { doc, onSnapshot, setDoc } from 'firebase/firestore'
import { db } from '@/firebase.js'

const DOC_REF = doc(db, 'config', 'googlePlaces')

const DEFAULT = {
  mapsUrl: '',   // lien fiche Google Maps (bouton "Laisser un avis")
  reviews: [],   // avis saisis manuellement
}

export const useGooglePlacesStore = defineStore('googlePlaces', () => {
  const data   = ref({ ...DEFAULT })
  const loaded = ref(false)

  // Écoute temps réel
  onSnapshot(DOC_REF, snap => {
    if (snap.exists()) {
      // Compatibilité : on garde mapsUrl et reviews, on ignore les anciens champs
      const { mapsUrl = '', reviews = [] } = snap.data()
      data.value = { mapsUrl, reviews }
    }
    loaded.value = true
  }, console.error)

  async function save() {
    await setDoc(DOC_REF, JSON.parse(JSON.stringify(data.value)))
  }

  function addReview(review) {
    data.value.reviews.push({ ...review, id: crypto.randomUUID() })
    save()
  }

  function updateReview(id, fields) {
    const r = data.value.reviews.find(r => r.id === id)
    if (r) { Object.assign(r, fields); save() }
  }

  function removeReview(id) {
    data.value.reviews = data.value.reviews.filter(r => r.id !== id)
    save()
  }

  function moveUp(id) {
    const arr = data.value.reviews
    const idx = arr.findIndex(r => r.id === id)
    if (idx > 0) { ;[arr[idx - 1], arr[idx]] = [arr[idx], arr[idx - 1]]; save() }
  }

  function moveDown(id) {
    const arr = data.value.reviews
    const idx = arr.findIndex(r => r.id === id)
    if (idx < arr.length - 1) { ;[arr[idx], arr[idx + 1]] = [arr[idx + 1], arr[idx]]; save() }
  }

  // Note moyenne calculée automatiquement depuis les avis
  const avgRating = computed(() => {
    if (!data.value.reviews.length) return 0
    const sum = data.value.reviews.reduce((s, r) => s + (r.rating || 0), 0)
    return Math.round((sum / data.value.reviews.length) * 10) / 10
  })

  // Section visible dès qu'il y a au moins un avis
  const isConfigured = computed(() => data.value.reviews.length > 0)

  return { data, loaded, isConfigured, avgRating, save, addReview, updateReview, removeReview, moveUp, moveDown }
})
