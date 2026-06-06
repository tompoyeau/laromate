import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

const LS_KEY = 'laromate_reservations'

const DEMO_RESERVATIONS = [
  { id: '1', name: 'Marie Dupont', email: 'marie@example.com', phone: '06 12 34 56 78', date: new Date().toISOString().split('T')[0], time: '12:30', covers: 2, message: '', status: 'confirmed', createdAt: Date.now() - 3600000 },
  { id: '2', name: 'Thomas Bernard', email: 'thomas@example.com', phone: '06 98 76 54 32', date: new Date().toISOString().split('T')[0], time: '20:00', covers: 4, message: 'Anniversaire', status: 'pending', createdAt: Date.now() - 7200000 },
  { id: '3', name: 'Sophie Martin', email: 'sophie@example.com', phone: '07 11 22 33 44', date: new Date(Date.now() + 86400000).toISOString().split('T')[0], time: '19:30', covers: 3, message: '', status: 'pending', createdAt: Date.now() - 1800000 },
]

export const useReservationsStore = defineStore('reservations', () => {
  const items = ref(load())

  function load() {
    try {
      const raw = localStorage.getItem(LS_KEY)
      return raw ? JSON.parse(raw) : DEMO_RESERVATIONS
    } catch { return DEMO_RESERVATIONS }
  }

  function save() {
    localStorage.setItem(LS_KEY, JSON.stringify(items.value))
  }

  function add(reservation) {
    items.value.unshift({
      ...reservation,
      id: crypto.randomUUID(),
      status: 'pending',
      createdAt: Date.now()
    })
    save()
    return items.value[0]
  }

  function updateStatus(id, status) {
    const r = items.value.find(r => r.id === id)
    if (r) { r.status = status; save() }
  }

  function remove(id) {
    items.value = items.value.filter(r => r.id !== id)
    save()
  }

  const today = computed(() => {
    const d = new Date().toISOString().split('T')[0]
    return items.value.filter(r => r.date === d && r.status !== 'cancelled')
  })

  const thisWeek = computed(() => {
    const now = new Date()
    const start = new Date(now.setDate(now.getDate() - now.getDay() + 1)).toISOString().split('T')[0]
    const end = new Date(now.setDate(now.getDate() - now.getDay() + 7)).toISOString().split('T')[0]
    return items.value.filter(r => r.date >= start && r.date <= end && r.status !== 'cancelled')
  })

  const pending = computed(() => items.value.filter(r => r.status === 'pending'))

  const byDate = computed(() => {
    return [...items.value].sort((a, b) => {
      const da = a.date + a.time, db = b.date + b.time
      return da.localeCompare(db)
    })
  })

  return { items, today, thisWeek, pending, byDate, add, updateStatus, remove }
})
