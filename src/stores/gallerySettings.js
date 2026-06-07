import { defineStore } from 'pinia'
import { ref } from 'vue'
import { doc, getDoc, setDoc } from 'firebase/firestore'
import { db } from '@/firebase.js'

export const LAYOUTS = [
  {
    id: 'uniform',
    label: 'Grille uniforme',
    desc: '3 colonnes, toutes identiques',
    cells: [
      { x: 0,   y: 0,   w: 30, h: 28 },
      { x: 35,  y: 0,   w: 30, h: 28 },
      { x: 70,  y: 0,   w: 30, h: 28 },
      { x: 0,   y: 33,  w: 30, h: 28 },
      { x: 35,  y: 33,  w: 30, h: 28 },
      { x: 70,  y: 33,  w: 30, h: 28 },
    ]
  },
  {
    id: 'mosaic',
    label: 'Mosaïque',
    desc: '4 colonnes, mix tall/wide',
    cells: [
      { x: 0,   y: 0,   w: 22, h: 28 },
      { x: 26,  y: 0,   w: 22, h: 61 },
      { x: 52,  y: 0,   w: 22, h: 28 },
      { x: 74,  y: 0,   w: 26, h: 28 },
      { x: 0,   y: 33,  w: 48, h: 28 },
      { x: 52,  y: 33,  w: 22, h: 28 },
      { x: 74,  y: 33,  w: 26, h: 28 },
    ]
  },
  {
    id: 'featured',
    label: 'Vedette',
    desc: '1 grande photo + grille',
    cells: [
      { x: 0,   y: 0,   w: 64, h: 61 },
      { x: 68,  y: 0,   w: 32, h: 28 },
      { x: 68,  y: 33,  w: 32, h: 28 },
      { x: 0,   y: 66,  w: 32, h: 28 },
      { x: 34,  y: 66,  w: 32, h: 28 },
      { x: 68,  y: 66,  w: 32, h: 28 },
    ]
  },
  {
    id: 'columns',
    label: 'Colonnes',
    desc: '4 colonnes régulières',
    cells: [
      { x: 0,   y: 0,   w: 22, h: 28 },
      { x: 26,  y: 0,   w: 22, h: 28 },
      { x: 52,  y: 0,   w: 22, h: 28 },
      { x: 74,  y: 0,   w: 26, h: 28 },
      { x: 0,   y: 33,  w: 22, h: 28 },
      { x: 26,  y: 33,  w: 22, h: 28 },
      { x: 52,  y: 33,  w: 22, h: 28 },
      { x: 74,  y: 33,  w: 26, h: 28 },
    ]
  },
  {
    id: 'duo',
    label: 'Duo',
    desc: '2 grandes colonnes',
    cells: [
      { x: 0,   y: 0,   w: 48, h: 61 },
      { x: 52,  y: 0,   w: 48, h: 28 },
      { x: 52,  y: 33,  w: 48, h: 28 },
      { x: 0,   y: 66,  w: 48, h: 28 },
      { x: 52,  y: 66,  w: 48, h: 28 },
    ]
  },
]

export const useGallerySettingsStore = defineStore('gallerySettings', () => {
  const layout = ref('mosaic')

  // Chargement Firestore (non bloquant)
  getDoc(doc(db, 'config', 'galleryLayout')).then(snap => {
    if (snap.exists()) layout.value = snap.data().layout || 'mosaic'
  }).catch(console.error)

  function setLayout(id) {
    layout.value = id
    setDoc(doc(db, 'config', 'galleryLayout'), { layout: id }).catch(console.error)
  }

  return { layout, setLayout }
})
