import { defineStore } from 'pinia'
import { ref } from 'vue'

const LS_KEY    = 'laromate_content'
const LS_IMG    = 'laromate_hero_image'   // séparé car potentiellement lourd

export const DEFAULT_CONTENT = {
  // ── Hero ────────────────────────────────────────────────────────────────
  heroLabel:  "Restaurant · Bordeaux",
  heroTitle1: "L'art du",
  heroTitle2: "burger artisanal",
  heroDesc:   "Des produits frais, des recettes maison et une passion pour les saveurs. Burgers, sandwichs, pâtes et salades préparés avec soin.",
  heroBadgeTop:  "Fait",
  heroBadgeMain: "Maison",
  heroBadgeSub:  "depuis 2020",
  heroImageFallback: "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=1600&auto=format&fit=crop",

  // ── Menu ─────────────────────────────────────────────────────────────────
  menuLabel:    "Notre cuisine",
  menuTitle:    "La Carte",
  menuSubtitle: "Produits frais, recettes maison, saveurs authentiques",

  // ── Galerie ───────────────────────────────────────────────────────────────
  galleryLabel:    "Atmosphère",
  galleryTitle:    "La Galerie",
  gallerySubtitle: "Une cuisine authentique dans un cadre chaleureux",

  // ── Réservation ───────────────────────────────────────────────────────────
  reservationLabel:  "Réserver",
  reservationTitle:  "Votre table",
  reservationTitle2: "vous attend",
  reservationDesc:   "Réservez en ligne en quelques secondes. Nous vous confirmerons votre réservation dans les plus brefs délais.",

  // ── Avis ─────────────────────────────────────────────────────────────────
  reviewsLabel: "Ce qu'ils en pensent",
  reviewsTitle: "Avis clients",
}

export const useContentStore = defineStore('content', () => {
  const data     = ref(loadText())
  const heroImage = ref(loadImage())

  function loadText() {
    try {
      const raw = localStorage.getItem(LS_KEY)
      return raw ? { ...DEFAULT_CONTENT, ...JSON.parse(raw) } : { ...DEFAULT_CONTENT }
    } catch { return { ...DEFAULT_CONTENT } }
  }

  function loadImage() {
    try { return localStorage.getItem(LS_IMG) || '' } catch { return '' }
  }

  function save() {
    localStorage.setItem(LS_KEY, JSON.stringify(data.value))
  }

  function update(fields) {
    Object.assign(data.value, fields)
    save()
  }

  function setHeroImage(base64) {
    heroImage.value = base64
    try { localStorage.setItem(LS_IMG, base64) } catch (e) {
      console.warn('Hero image trop lourde pour localStorage', e)
    }
  }

  function removeHeroImage() {
    heroImage.value = ''
    localStorage.removeItem(LS_IMG)
  }

  // URL finale : image uploadée en priorité, sinon l'URL de fallback
  function heroImageSrc() {
    return heroImage.value || data.value.heroImageFallback
  }

  return { data, heroImage, update, setHeroImage, removeHeroImage, heroImageSrc }
})
