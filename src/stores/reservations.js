import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { collection, onSnapshot, doc, setDoc, deleteDoc, getDoc, getDocs } from 'firebase/firestore'
import { db } from '@/firebase.js'

const TODAY    = new Date().toISOString().split('T')[0]
const TOMORROW = new Date(Date.now() + 86400000).toISOString().split('T')[0]

const DEMO = [
  { id: '1', name: 'Marie Dupont',   email: 'marie@example.com',  phone: '06 12 34 56 78', date: TODAY,    time: '12:30', covers: 2, message: '',             note: '',              status: 'confirmed', createdAt: Date.now() - 3600000  },
  { id: '2', name: 'Thomas Bernard', email: 'thomas@example.com', phone: '06 98 76 54 32', date: TODAY,    time: '20:00', covers: 4, message: 'Anniversaire',  note: 'Table en fond', status: 'pending',   createdAt: Date.now() - 7200000  },
  { id: '3', name: 'Sophie Martin',  email: 'sophie@example.com', phone: '07 11 22 33 44', date: TODAY,    time: '19:30', covers: 3, message: '',             note: '',              status: 'confirmed', createdAt: Date.now() - 1800000  },
  { id: '4', name: 'Lucas Petit',    email: 'lucas@example.com',  phone: '06 55 44 33 22', date: TODAY,    time: '12:00', covers: 5, message: 'Déjeuner pro', note: '',              status: 'confirmed', createdAt: Date.now() - 5000000  },
  { id: '5', name: 'Emma Richard',   email: 'emma@example.com',   phone: '07 66 77 88 99', date: TOMORROW, time: '19:00', covers: 2, message: '',             note: '',              status: 'pending',   createdAt: Date.now() - 900000   },
  { id: '6', name: 'Paul Durand',    email: 'paul@example.com',   phone: '06 22 11 00 99', date: TOMORROW, time: '20:30', covers: 6, message: 'Dîner familia', note: '',             status: 'pending',   createdAt: Date.now() - 400000   },
]

const DEFAULT_SETTINGS = {
  maxCoversPerSlot: 12,
  maxCoversLunch:   40,
  maxCoversDinner:  60,
}

export const useReservationsStore = defineStore('reservations', () => {
  const items    = ref([])
  const settings = ref({ ...DEFAULT_SETTINGS })

  // ── Écoute temps réel (onSnapshot) ──────────────────────────────────────
  // L'admin panel se met à jour dès qu'un client soumet une réservation
  onSnapshot(collection(db, 'reservations'), snap => {
    items.value = snap.docs
      .map(d => ({ note: '', ...d.data(), id: d.id }))
  }, console.error)

  // ── Paramètres capacité ──────────────────────────────────────────────────
  getDoc(doc(db, 'config', 'resSettings')).then(snap => {
    if (snap.exists()) Object.assign(settings.value, snap.data())
    else {
      // Seed démos si collection vide
      getDemosAndSeed()
    }
  }).catch(console.error)

  async function getDemosAndSeed() {
    const snap = await getDocs(collection(db, 'reservations'))
    if (snap.empty) {
      await Promise.all(DEMO.map(r => setDoc(doc(db, 'reservations', r.id), r)))
    }
  }

  async function saveSettings() {
    await setDoc(doc(db, 'config', 'resSettings'), JSON.parse(JSON.stringify(settings.value)))
  }

  function updateSettings(fields) {
    Object.assign(settings.value, fields)
    saveSettings()
  }

  // ── CRUD ─────────────────────────────────────────────────────────────────
  async function add(reservation) {
    const id = crypto.randomUUID()
    const newRes = { ...reservation, id, note: '', status: 'pending', createdAt: Date.now() }
    await setDoc(doc(db, 'reservations', id), newRes)
    // onSnapshot met à jour items automatiquement
    return newRes
  }

  async function updateStatus(id, status) {
    const r = items.value.find(r => r.id === id)
    if (r) {
      r.status = status
      await setDoc(doc(db, 'reservations', id), JSON.parse(JSON.stringify(r)))
    }
  }

  async function updateNote(id, note) {
    const r = items.value.find(r => r.id === id)
    if (r) {
      r.note = note
      await setDoc(doc(db, 'reservations', id), JSON.parse(JSON.stringify(r)))
    }
  }

  async function remove(id) {
    items.value = items.value.filter(r => r.id !== id)
    await deleteDoc(doc(db, 'reservations', id))
  }

  // ── Capacité ─────────────────────────────────────────────────────────────
  function coversAt(date, time) {
    return items.value
      .filter(r => r.date === date && r.time === time && ['pending', 'confirmed'].includes(r.status))
      .reduce((sum, r) => sum + r.covers, 0)
  }

  function isSlotFull(date, time) {
    return coversAt(date, time) >= settings.value.maxCoversPerSlot
  }

  function coversOnDay(date) {
    return items.value
      .filter(r => r.date === date && ['pending', 'confirmed'].includes(r.status))
      .reduce((sum, r) => sum + r.covers, 0)
  }

  function reservationsOnDay(date) {
    return [...items.value]
      .filter(r => r.date === date)
      .sort((a, b) => a.time.localeCompare(b.time))
  }

  // ── Computeds ─────────────────────────────────────────────────────────────
  const pending = computed(() => items.value.filter(r => r.status === 'pending'))

  const today = computed(() => {
    const d = new Date().toISOString().split('T')[0]
    return items.value.filter(r => r.date === d && r.status !== 'cancelled' && r.status !== 'noshow')
  })

  const todayCovers = computed(() => today.value.reduce((s, r) => s + r.covers, 0))

  const thisWeek = computed(() => {
    const now = new Date()
    const day = now.getDay() || 7
    const mon = new Date(now); mon.setDate(now.getDate() - day + 1)
    const sun = new Date(mon); sun.setDate(mon.getDate() + 6)
    const start = mon.toISOString().split('T')[0]
    const end   = sun.toISOString().split('T')[0]
    return items.value.filter(r =>
      r.date >= start && r.date <= end &&
      r.status !== 'cancelled' && r.status !== 'noshow'
    )
  })

  const byDate = computed(() =>
    [...items.value].sort((a, b) => (a.date + a.time).localeCompare(b.date + b.time))
  )

  return {
    items, settings, pending, today, todayCovers, thisWeek, byDate,
    add, updateStatus, updateNote, remove, updateSettings,
    coversAt, isSlotFull, coversOnDay, reservationsOnDay
  }
})
