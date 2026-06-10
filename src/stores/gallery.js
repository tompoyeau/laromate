import { defineStore } from 'pinia'
import { ref } from 'vue'
import { collection, onSnapshot, addDoc, deleteDoc, doc } from 'firebase/firestore'
import { db } from '@/firebase.js'
import { compressImage } from '@/utils/compress.js'

// ── Store ─────────────────────────────────────────────────────────────────────
export const useGalleryStore = defineStore('gallery', () => {
  const photos = ref([])

  // Écoute temps réel → tous les appareils voient les mêmes photos
  onSnapshot(
    collection(db, 'gallery'),
    snap => {
      photos.value = snap.docs
        .map(d => ({ id: d.id, ...d.data() }))
        .sort((a, b) => (a.createdAt || 0) - (b.createdAt || 0))
    },
    console.error
  )

  /**
   * Compresse et upload un fichier image vers Firestore.
   * @param {File}   file
   * @param {(n: number) => void} onProgress  progression 0-100
   */
  async function addPhoto(file, onProgress) {
    onProgress?.(5)
    const data = await compressImage(file, 1200, 0.78)   // canvas → base64
    onProgress?.(75)
    await addDoc(collection(db, 'gallery'), {
      data,                                  // base64 JPEG compressé
      name: file.name,
      createdAt: Date.now(),
    })
    onProgress?.(100)
    // onSnapshot met à jour photos.value automatiquement
  }

  /** Supprime une photo de Firestore */
  async function deletePhoto(id) {
    await deleteDoc(doc(db, 'gallery', id))
  }

  // Gardé pour compatibilité avec GallerySection (no-op, onSnapshot suffit)
  async function loadAll() {}

  return { photos, loadAll, addPhoto, deletePhoto }
})
