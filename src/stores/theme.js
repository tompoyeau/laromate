import { defineStore } from 'pinia'
import { ref, watch } from 'vue'
import { doc, getDoc, setDoc } from 'firebase/firestore'
import { db } from '@/firebase.js'

// Le logo (base64) reste en localStorage — trop lourd pour Firestore
const LS_LOGO = 'laromate_theme_logo'

const DEFAULT_THEME = {
  primaryColor: '#6b7c5c',
  primaryLight: '#8b9d77',
  primaryDark: '#4a5740',
  accentColor: '#c9a96e',
  bgColor: '#f9f7f4',
  restaurantName: "L'Aromate",
  restaurantTagline: "Burgers & Sandwichs artisanaux",
  fontHeading: 'Playfair Display',
  darkMode: false
}

export const useThemeStore = defineStore('theme', () => {
  const theme = ref({ ...DEFAULT_THEME, logo: loadLogo() })

  function loadLogo() {
    try { return localStorage.getItem(LS_LOGO) || null } catch { return null }
  }

  // Chargement Firestore (non bloquant)
  getDoc(doc(db, 'config', 'theme')).then(snap => {
    if (snap.exists()) {
      Object.assign(theme.value, snap.data())
      applyTheme()
    }
  }).catch(console.error)

  async function save() {
    // On ne persiste pas le logo dans Firestore
    const { logo, ...rest } = theme.value
    await setDoc(doc(db, 'config', 'theme'), JSON.parse(JSON.stringify(rest)))
    if (logo) localStorage.setItem(LS_LOGO, logo)
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

  watch(theme, () => applyTheme(), { deep: true })

  return { theme, darkMode: ref(theme.value.darkMode), update, applyTheme, toggleDark }
})
