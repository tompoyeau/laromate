import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { collection, getDocs, setDoc, deleteDoc, doc } from 'firebase/firestore'
import { db } from '@/firebase.js'

const DEMO_REVIEWS = [
  { id: '1', author: 'Marie L.', rating: 5, text: "Une vraie pépite ! Le burger L'Aromate avec sa burrata et son pesto maison est absolument incroyable. L'ambiance est chaleureuse et le service impeccable.", date: '2026-05-20', visible: true, createdAt: Date.now() - 86400000 * 15 },
  { id: '2', author: 'Pierre M.', rating: 5, text: "Les meilleures frites de Paris, sans hésiter. Le Philly's est une tuerie. On y retourne toutes les semaines !", date: '2026-05-28', visible: true, createdAt: Date.now() - 86400000 * 8 },
  { id: '3', author: 'Clara D.', rating: 4, text: "Très bonne adresse pour manger un burger de qualité. Les produits sont frais et les saveurs bien équilibrées. Le tiramisu maison est un must !", date: '2026-06-01', visible: true, createdAt: Date.now() - 86400000 * 4 },
  { id: '4', author: 'Antoine R.', rating: 5, text: "Le sandwich Le Parmegiano est mon péché mignon. La qualité est constante à chaque visite. Bravo à l'équipe !", date: '2026-06-03', visible: true, createdAt: Date.now() - 86400000 * 2 },
  { id: '5', author: 'Lucie B.', rating: 4, text: "Super rapport qualité/prix pour des burgers artisanaux. Le falafel végétarien est une belle surprise. Je recommande vivement.", date: '2026-06-05', visible: true, createdAt: Date.now() - 86400000 },
]

export const useReviewsStore = defineStore('reviews', () => {
  const items = ref([])
  const loaded = ref(false)

  // Chargement Firestore — charge les démos si la collection est vide
  getDocs(collection(db, 'reviews')).then(async snap => {
    if (snap.empty) {
      // Première utilisation : seed avec les démos
      items.value = [...DEMO_REVIEWS]
      await Promise.all(DEMO_REVIEWS.map(r => setDoc(doc(db, 'reviews', r.id), r)))
    } else {
      items.value = snap.docs.map(d => ({ id: d.id, ...d.data() }))
    }
    loaded.value = true
  }).catch(console.error)

  async function add(review) {
    const id = crypto.randomUUID()
    const newReview = { ...review, id, visible: false, createdAt: Date.now() }
    items.value.unshift(newReview)
    await setDoc(doc(db, 'reviews', id), newReview)
  }

  async function toggleVisibility(id) {
    const r = items.value.find(r => r.id === id)
    if (r) {
      r.visible = !r.visible
      await setDoc(doc(db, 'reviews', id), JSON.parse(JSON.stringify(r)))
    }
  }

  async function remove(id) {
    items.value = items.value.filter(r => r.id !== id)
    await deleteDoc(doc(db, 'reviews', id))
  }

  const visible   = computed(() => items.value.filter(r => r.visible))
  const pending   = computed(() => items.value.filter(r => !r.visible))
  const avgRating = computed(() => {
    if (!visible.value.length) return 0
    return (visible.value.reduce((sum, r) => sum + r.rating, 0) / visible.value.length).toFixed(1)
  })

  return { items, visible, pending, avgRating, add, toggleVisibility, remove }
})
