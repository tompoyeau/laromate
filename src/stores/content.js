import { defineStore } from 'pinia'
import { ref } from 'vue'
import { doc, getDoc, setDoc } from 'firebase/firestore'
import { db } from '@/firebase.js'
import { compressImage } from '@/utils/compress.js'

export const DEFAULT_CONTENT = {
  heroLabel:  "Restaurant · Bordeaux",
  heroTitle1: "L'art du",
  heroTitle2: "burger artisanal",
  heroDesc:   "Des produits frais, des recettes maison et une passion pour les saveurs. Burgers, sandwichs, pâtes et salades préparés avec soin.",
  heroBadgeTop:  "Fait",
  heroBadgeMain: "Maison",
  heroBadgeSub:  "depuis 2020",
  heroImageFallback: "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=1600&auto=format&fit=crop",
  menuLabel:    "Notre cuisine",
  menuTitle:    "La Carte",
  menuSubtitle: "Produits frais, recettes maison, saveurs authentiques",
  galleryLabel:    "Atmosphère",
  galleryTitle:    "La Galerie",
  gallerySubtitle: "Une cuisine authentique dans un cadre chaleureux",
  reservationLabel:  "Réserver",
  reservationTitle:  "Votre table",
  reservationTitle2: "vous attend",
  reservationDesc:   "Réservez en ligne en quelques secondes. Nous vous confirmerons votre réservation dans les plus brefs délais.",
  reviewsLabel: "Ce qu'ils en pensent",
  reviewsTitle: "Avis clients",
}

export const useContentStore = defineStore('content', () => {
  const data      = ref({ ...DEFAULT_CONTENT })
  const heroImage = ref('')

  // Chargement textes + image hero depuis Firestore (non bloquant)
  getDoc(doc(db, 'config', 'content')).then(snap => {
    if (snap.exists()) Object.assign(data.value, snap.data())
  }).catch(console.error)

  // Image hero dans un doc séparé (évite de réécrire la base64 à chaque modif de texte)
  getDoc(doc(db, 'config', 'heroImage')).then(snap => {
    if (snap.exists()) heroImage.value = snap.data().data || ''
  }).catch(console.error)

  async function save() {
    await setDoc(doc(db, 'config', 'content'), JSON.parse(JSON.stringify(data.value)))
  }

  function update(fields) {
    Object.assign(data.value, fields)
    save()
  }

  async function setHeroImage(source) {
    // Compresse à 1920px max avant de stocker dans Firestore
    const compressed = await compressImage(source, 1920, 0.82)
    heroImage.value = compressed
    await setDoc(doc(db, 'config', 'heroImage'), { data: compressed })
  }

  async function removeHeroImage() {
    heroImage.value = ''
    await setDoc(doc(db, 'config', 'heroImage'), { data: '' })
  }

  function heroImageSrc() {
    return heroImage.value || data.value.heroImageFallback
  }

  return { data, heroImage, update, setHeroImage, removeHeroImage, heroImageSrc }
})
