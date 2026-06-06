import { defineStore } from 'pinia'
import { ref } from 'vue'

const DB_NAME = 'laromate_db'
const DB_VER = 1
const STORE_NAME = 'photos'

function openDB() {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, DB_VER)
    req.onupgradeneeded = e => e.target.result.createObjectStore(STORE_NAME, { keyPath: 'id', autoIncrement: true })
    req.onsuccess = e => resolve(e.target.result)
    req.onerror = () => reject(req.error)
  })
}

export const useGalleryStore = defineStore('gallery', () => {
  const photos = ref([])

  async function loadAll() {
    const db = await openDB()
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, 'readonly')
      const req = tx.objectStore(STORE_NAME).getAll()
      req.onsuccess = () => { photos.value = req.result; resolve(req.result) }
      req.onerror = () => reject(req.error)
    })
  }

  async function addPhoto(dataUrl) {
    const db = await openDB()
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, 'readwrite')
      const req = tx.objectStore(STORE_NAME).add({ data: dataUrl, createdAt: Date.now() })
      req.onsuccess = async () => { await loadAll(); resolve() }
      req.onerror = () => reject(req.error)
    })
  }

  async function deletePhoto(id) {
    const db = await openDB()
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, 'readwrite')
      const req = tx.objectStore(STORE_NAME).delete(id)
      req.onsuccess = async () => { await loadAll(); resolve() }
      req.onerror = () => reject(req.error)
    })
  }

  return { photos, loadAll, addPhoto, deletePhoto }
})
