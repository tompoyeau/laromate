import { defineStore } from 'pinia'
import { ref, watch } from 'vue'
import { doc, getDoc, setDoc } from 'firebase/firestore'
import { db } from '@/firebase.js'
import { compressImage } from '@/utils/compress.js'

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
  const theme = ref({ ...DEFAULT_THEME, logo: null })

  // Paramètres (couleurs, typo, etc.) depuis Firestore
  getDoc(doc(db, 'config', 'theme')).then(snap => {
    if (snap.exists()) {
      Object.assign(theme.value, snap.data())
      applyTheme()
    }
  }).catch(console.error)

  // Logo dans un doc séparé (évite de réécrire la base64 à chaque modif de couleur)
  getDoc(doc(db, 'config', 'themeLogo')).then(snap => {
    if (snap.exists()) theme.value.logo = snap.data().data || null
  }).catch(console.error)

  // Sauvegarde les paramètres (hors logo) dans Firestore
  async function save() {
    const { logo, ...rest } = theme.value
    await setDoc(doc(db, 'config', 'theme'), JSON.parse(JSON.stringify(rest)))
  }

  // Compresse et sauvegarde le logo dans son propre doc Firestore
  async function setLogo(source) {
    const compressed = await compressImage(source, 400, 0.85)
    theme.value.logo = compressed
    await setDoc(doc(db, 'config', 'themeLogo'), { data: compressed })
  }

  async function removeLogo() {
    theme.value.logo = null
    await setDoc(doc(db, 'config', 'themeLogo'), { data: null })
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
    // Logo ne passe plus par update() — utiliser setLogo() / removeLogo()
    const { logo, ...rest } = fields
    Object.assign(theme.value, rest)
    save()
    applyTheme()
  }

  function toggleDark() {
    theme.value.darkMode = !theme.value.darkMode
    save()
    applyTheme()
  }

  watch(theme, () => applyTheme(), { deep: true })

  return { theme, darkMode: ref(theme.value.darkMode), update, setLogo, removeLogo, applyTheme, toggleDark }
})
