import { defineStore } from 'pinia'
import { ref, watch } from 'vue'

const LS_KEY = 'laromate_theme'

const DEFAULT_THEME = {
  primaryColor: '#6b7c5c',
  primaryLight: '#8b9d77',
  primaryDark: '#4a5740',
  accentColor: '#c9a96e',
  bgColor: '#f9f7f4',
  restaurantName: "L'Aromate",
  restaurantTagline: "Burgers & Sandwichs artisanaux",
  logo: null,
  fontHeading: 'Playfair Display',
  darkMode: false
}

export const useThemeStore = defineStore('theme', () => {
  const theme = ref(load())

  function load() {
    try {
      const raw = localStorage.getItem(LS_KEY)
      return raw ? { ...DEFAULT_THEME, ...JSON.parse(raw) } : { ...DEFAULT_THEME }
    } catch { return { ...DEFAULT_THEME } }
  }

  function save() {
    localStorage.setItem(LS_KEY, JSON.stringify(theme.value))
  }

  function applyTheme() {
    const r = document.documentElement
    r.style.setProperty('--primary', theme.value.primaryColor)
    r.style.setProperty('--primary-light', theme.value.primaryLight)
    r.style.setProperty('--primary-dark', theme.value.primaryDark)
    r.style.setProperty('--accent', theme.value.accentColor)
    r.style.setProperty('--bg', theme.value.darkMode ? '#1a1a1a' : theme.value.bgColor)
    r.style.setProperty('--bg-card', theme.value.darkMode ? '#252525' : '#ffffff')
    r.style.setProperty('--text', theme.value.darkMode ? '#f0ede8' : '#2c2c2c')
    r.style.setProperty('--text-light', theme.value.darkMode ? '#b0b0b0' : '#6b6b6b')
    r.style.setProperty('--border', theme.value.darkMode ? '#333' : '#e8e4de')
    r.style.setProperty('--font-heading', `'${theme.value.fontHeading}', serif`)
  }

  function update(fields) {
    Object.assign(theme.value, fields)
    save()
    applyTheme()
  }

  function toggleDark() {
    theme.value.darkMode = !theme.value.darkMode
    save()
    applyTheme()
  }

  // Auto-apply on changes
  watch(theme, () => applyTheme(), { deep: true })

  return { theme, darkMode: ref(theme.value.darkMode), update, applyTheme, toggleDark }
})
