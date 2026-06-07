import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

const LS_KEY = 'laromate_google'

const DEFAULT = {
  enabled: true,
  rating: '',          // note globale ex: "4.7"
  totalReviews: '',    // ex: "128"
  mapsUrl: '',         // lien vers la fiche Google Maps
  reviews: []          // avis saisis manuellement
}

export const useGooglePlacesStore = defineStore('googlePlaces', () => {
  const data = ref(load())

  function load() {
    try {
      const raw = localStorage.getItem(LS_KEY)
      return raw ? { ...DEFAULT, ...JSON.parse(raw) } : { ...DEFAULT }
    } catch { return { ...DEFAULT } }
  }

  function save() {
    localStorage.setItem(LS_KEY, JSON.stringify(data.value))
  }

  function update(fields) {
    Object.assign(data.value, fields)
    save()
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
    const idx = data.value.reviews.findIndex(r => r.id === id)
    if (idx > 0) {
      const arr = data.value.reviews
      ;[arr[idx - 1], arr[idx]] = [arr[idx], arr[idx - 1]]
      save()
    }
  }

  function moveDown(id) {
    const arr = data.value.reviews
    const idx = arr.findIndex(r => r.id === id)
    if (idx < arr.length - 1) {
      ;[arr[idx], arr[idx + 1]] = [arr[idx + 1], arr[idx]]
      save()
    }
  }

  const isConfigured = computed(() => data.value.enabled && data.value.reviews.length > 0)

  return { data, isConfigured, update, addReview, updateReview, removeReview, moveUp, moveDown }
})
