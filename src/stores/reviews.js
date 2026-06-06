import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

const LS_KEY = 'laromate_reviews'

const DEMO_REVIEWS = [
  { id: '1', author: 'Marie L.', rating: 5, text: "Une vraie pépite ! Le burger L'Aromate avec sa burrata et son pesto maison est absolument incroyable. L'ambiance est chaleureuse et le service impeccable.", date: '2026-05-20', visible: true, createdAt: Date.now() - 86400000 * 15 },
  { id: '2', author: 'Pierre M.', rating: 5, text: "Les meilleures frites de Paris, sans hésiter. Le Philly's est une tuerie. On y retourne toutes les semaines !", date: '2026-05-28', visible: true, createdAt: Date.now() - 86400000 * 8 },
  { id: '3', author: 'Clara D.', rating: 4, text: "Très bonne adresse pour manger un burger de qualité. Les produits sont frais et les saveurs bien équilibrées. Le tiramisu maison est un must !", date: '2026-06-01', visible: true, createdAt: Date.now() - 86400000 * 4 },
  { id: '4', author: 'Antoine R.', rating: 5, text: "Le sandwich Le Parmegiano est mon péché mignon. La qualité est constante à chaque visite. Bravo à l'équipe !", date: '2026-06-03', visible: true, createdAt: Date.now() - 86400000 * 2 },
  { id: '5', author: 'Lucie B.', rating: 4, text: "Super rapport qualité/prix pour des burgers artisanaux. Le falafel végétarien est une belle surprise. Je recommande vivement.", date: '2026-06-05', visible: true, createdAt: Date.now() - 86400000 },
]

export const useReviewsStore = defineStore('reviews', () => {
  const items = ref(load())

  function load() {
    try {
      const raw = localStorage.getItem(LS_KEY)
      return raw ? JSON.parse(raw) : DEMO_REVIEWS
    } catch { return DEMO_REVIEWS }
  }

  function save() {
    localStorage.setItem(LS_KEY, JSON.stringify(items.value))
  }

  function add(review) {
    items.value.unshift({
      ...review,
      id: crypto.randomUUID(),
      visible: false, // pending moderation
      createdAt: Date.now()
    })
    save()
  }

  function toggleVisibility(id) {
    const r = items.value.find(r => r.id === id)
    if (r) { r.visible = !r.visible; save() }
  }

  function remove(id) {
    items.value = items.value.filter(r => r.id !== id)
    save()
  }

  const visible = computed(() => items.value.filter(r => r.visible))
  const pending = computed(() => items.value.filter(r => !r.visible))
  const avgRating = computed(() => {
    if (!visible.value.length) return 0
    return (visible.value.reduce((sum, r) => sum + r.rating, 0) / visible.value.length).toFixed(1)
  })

  return { items, visible, pending, avgRating, add, toggleVisibility, remove }
})
