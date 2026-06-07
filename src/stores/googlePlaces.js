import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

const LS_CONFIG = 'laromate_google_config'
const LS_CACHE  = 'laromate_google_cache'
const CACHE_TTL = 24 * 60 * 60 * 1000 // 24h

const DEFAULT_CONFIG = {
  enabled: false,
  placeId: '',
  apiKey: '',
}

export const useGooglePlacesStore = defineStore('googlePlaces', () => {
  const config = ref(loadConfig())
  const placeData = ref(loadCache())
  const loading = ref(false)
  const error = ref('')

  function loadConfig() {
    try {
      const raw = localStorage.getItem(LS_CONFIG)
      return raw ? { ...DEFAULT_CONFIG, ...JSON.parse(raw) } : { ...DEFAULT_CONFIG }
    } catch { return { ...DEFAULT_CONFIG } }
  }

  function loadCache() {
    try {
      const raw = localStorage.getItem(LS_CACHE)
      if (!raw) return null
      const cached = JSON.parse(raw)
      if (Date.now() - cached.fetchedAt > CACHE_TTL) return null
      return cached
    } catch { return null }
  }

  function saveConfig() {
    localStorage.setItem(LS_CONFIG, JSON.stringify(config.value))
  }

  function saveCache(data) {
    const entry = { ...data, fetchedAt: Date.now() }
    localStorage.setItem(LS_CACHE, JSON.stringify(entry))
    placeData.value = entry
  }

  function clearCache() {
    localStorage.removeItem(LS_CACHE)
    placeData.value = null
  }

  function updateConfig(fields) {
    Object.assign(config.value, fields)
    saveConfig()
  }

  // Load the Google Maps JS API dynamically
  function loadGoogleMapsAPI(apiKey) {
    return new Promise((resolve, reject) => {
      // Already loaded
      if (window.google?.maps?.places) { resolve(window.google.maps); return }

      // Already loading (another call in flight)
      if (window.__gmLoading) {
        const wait = setInterval(() => {
          if (window.google?.maps?.places) { clearInterval(wait); resolve(window.google.maps) }
        }, 100)
        setTimeout(() => { clearInterval(wait); reject(new Error('Timeout')) }, 10000)
        return
      }

      window.__gmLoading = true
      const callbackName = '__gm_init_' + Date.now()
      window[callbackName] = () => {
        window.__gmLoading = false
        resolve(window.google.maps)
      }

      const script = document.createElement('script')
      script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places&language=fr&callback=${callbackName}`
      script.async = true
      script.defer = true
      script.onerror = () => {
        window.__gmLoading = false
        reject(new Error('Impossible de charger l\'API Google Maps'))
      }
      document.head.appendChild(script)
    })
  }

  // Fetch place details from Google Places API
  async function fetchPlaceDetails(placeId, apiKey) {
    const maps = await loadGoogleMapsAPI(apiKey)
    const div = document.createElement('div')
    const service = new maps.places.PlacesService(div)

    return new Promise((resolve, reject) => {
      service.getDetails(
        {
          placeId,
          fields: ['name', 'rating', 'user_ratings_total', 'reviews', 'url', 'formatted_address', 'opening_hours'],
          language: 'fr'
        },
        (place, status) => {
          if (status === maps.places.PlacesServiceStatus.OK) {
            resolve(place)
          } else {
            reject(new Error(`Google Places erreur : ${status}`))
          }
        }
      )
    })
  }

  async function fetch(forceRefresh = false) {
    if (!config.value.enabled || !config.value.placeId || !config.value.apiKey) return
    if (!forceRefresh && placeData.value) return // Cache hit

    loading.value = true
    error.value = ''

    try {
      const place = await fetchPlaceDetails(config.value.placeId, config.value.apiKey)
      saveCache({
        name: place.name,
        rating: place.rating,
        userRatingsTotal: place.user_ratings_total,
        reviews: (place.reviews || []).map(r => ({
          authorName: r.author_name,
          authorUrl: r.author_url,
          profilePhotoUrl: r.profile_photo_url,
          rating: r.rating,
          relativeTimeDescription: r.relative_time_description,
          text: r.text,
          time: r.time,
        })),
        url: place.url,
        address: place.formatted_address,
      })
    } catch (e) {
      error.value = e.message
    } finally {
      loading.value = false
    }
  }

  const isConfigured = computed(() =>
    config.value.enabled && config.value.placeId && config.value.apiKey
  )

  return {
    config, placeData, loading, error, isConfigured,
    updateConfig, fetch, clearCache, saveConfig
  }
})
