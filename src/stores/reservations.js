import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { collection, onSnapshot, doc, setDoc, deleteDoc, getDoc, getDocs } from 'firebase/firestore'
import { db } from '@/firebase.js'

// ── Helpers date locaux (évite les bugs UTC+X) ────────────────────────────────
export function toLocalDateStr(d) {
  return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`
}

// ── Générateur de créneaux ────────────────────────────────────────────────────
// startTime / endTime : 'HH:MM', intervalMin : 15 | 30 | 45 | 60
export function generateSlots(startTime, endTime, intervalMin = 15) {
  const [sh, sm] = startTime.split(':').map(Number)
  const [eh, em] = endTime.split(':').map(Number)
  const slots = []
  let cur = sh * 60 + sm
  const end = eh * 60 + em
  while (cur <= end) {
    slots.push(`${String(Math.floor(cur / 60)).padStart(2,'0')}:${String(cur % 60).padStart(2,'0')}`)
    cur += intervalMin
  }
  return slots
}
function todayStr()    { return toLocalDateStr(new Date()) }
function tomorrowStr() { const d = new Date(); d.setDate(d.getDate()+1); return toLocalDateStr(d) }

const LUNCH_END = '15:00'

const DEMO = [
  { id:'1', name:'Marie Dupont',   email:'marie@example.com',  phone:'06 12 34 56 78', date:todayStr(),    time:'12:30', covers:2, message:'',             note:'',              status:'confirmed', createdAt:Date.now()-3600000 },
  { id:'2', name:'Thomas Bernard', email:'thomas@example.com', phone:'06 98 76 54 32', date:todayStr(),    time:'20:00', covers:4, message:'Anniversaire',  note:'Table en fond', status:'confirmed', createdAt:Date.now()-7200000 },
  { id:'3', name:'Sophie Martin',  email:'sophie@example.com', phone:'07 11 22 33 44', date:todayStr(),    time:'19:30', covers:3, message:'',             note:'',              status:'confirmed', createdAt:Date.now()-1800000 },
  { id:'4', name:'Lucas Petit',    email:'lucas@example.com',  phone:'06 55 44 33 22', date:todayStr(),    time:'12:00', covers:5, message:'Déjeuner pro', note:'',              status:'confirmed', createdAt:Date.now()-5000000 },
  { id:'5', name:'Emma Richard',   email:'emma@example.com',   phone:'07 66 77 88 99', date:tomorrowStr(), time:'19:00', covers:2, message:'',             note:'',              status:'confirmed', createdAt:Date.now()-900000  },
  { id:'6', name:'Paul Durand',    email:'paul@example.com',   phone:'06 22 11 00 99', date:tomorrowStr(), time:'20:30', covers:6, message:'Dîner familia', note:'',             status:'confirmed', createdAt:Date.now()-400000  },
]

// ── Structure horaires par défaut ─────────────────────────────────────────────
// dow : 0=Dim, 1=Lun, 2=Mar, 3=Mer, 4=Jeu, 5=Ven, 6=Sam
export const DAY_DEFAULT = {
  open: true,
  lunch: true,  lunchStart:  '12:00', lunchEnd:  '14:00', maxLunch:  40,
  dinner: true, dinnerStart: '19:00', dinnerEnd: '21:30', maxDinner: 60,
}

export const DEFAULT_SETTINGS = {
  slotInterval: 15,       // minutes entre chaque créneau (15 | 30 | 45 | 60)
  maxCoversPerSlot: 12,
  schedule: {
    0: { open: true,  lunch: false, dinner: true,  maxLunch: 0,  maxDinner: 60 }, // Dim
    1: { open: true,  lunch: true,  dinner: true,  maxLunch: 40, maxDinner: 60 }, // Lun
    2: { open: true,  lunch: true,  dinner: true,  maxLunch: 40, maxDinner: 60 }, // Mar
    3: { open: true,  lunch: true,  dinner: true,  maxLunch: 40, maxDinner: 60 }, // Mer
    4: { open: true,  lunch: true,  dinner: true,  maxLunch: 40, maxDinner: 60 }, // Jeu
    5: { open: true,  lunch: true,  dinner: true,  maxLunch: 40, maxDinner: 60 }, // Ven
    6: { open: true,  lunch: true,  dinner: true,  maxLunch: 40, maxDinner: 60 }, // Sam
  }
}

export const useReservationsStore = defineStore('reservations', () => {
  const items    = ref([])
  const settings = ref(JSON.parse(JSON.stringify(DEFAULT_SETTINGS)))

  // ── Temps réel ────────────────────────────────────────────────────────────
  onSnapshot(collection(db, 'reservations'), snap => {
    items.value = snap.docs.map(d => ({ note: '', ...d.data(), id: d.id }))
  }, console.error)

  // ── Chargement settings ───────────────────────────────────────────────────
  getDoc(doc(db, 'config', 'resSettings')).then(snap => {
    if (snap.exists()) {
      const saved = snap.data()
      // Migration depuis ancien format (sans schedule)
      if (!saved.schedule) {
        const ml = saved.maxCoversLunch  ?? 40
        const md = saved.maxCoversDinner ?? 60
        saved.schedule = {}
        for (let i = 0; i <= 6; i++) {
          saved.schedule[i] = { ...DAY_DEFAULT, lunch: i !== 0, maxLunch: ml, maxDinner: md }
        }
      }
      const merged = { ...DEFAULT_SETTINGS, ...saved }
      for (let i = 0; i <= 6; i++) {
        merged.schedule[i] = { ...DAY_DEFAULT, ...(saved.schedule?.[i] ?? {}) }
      }
      settings.value = merged
    } else {
      _seedDemos()
    }
  }).catch(console.error)

  async function _seedDemos() {
    const snap = await getDocs(collection(db, 'reservations'))
    if (snap.empty) await Promise.all(DEMO.map(r => setDoc(doc(db, 'reservations', r.id), r)))
  }

  async function saveSettings() {
    await setDoc(doc(db, 'config', 'resSettings'), JSON.parse(JSON.stringify(settings.value)))
  }

  function updateSettings(fields) {
    Object.assign(settings.value, fields)
    saveSettings()
  }

  // ── Horaires par jour ─────────────────────────────────────────────────────
  function scheduleForDate(date) {
    // T12:00 pour neutraliser les problèmes DST
    const dow = new Date(date + 'T12:00:00').getDay()
    return { ...DAY_DEFAULT, ...(settings.value.schedule?.[dow] ?? {}) }
  }

  function isRestaurantOpen(date) {
    return !!scheduleForDate(date).open
  }

  function isLunchOpen(date) {
    const s = scheduleForDate(date)
    return !!s.open && !!s.lunch
  }

  function isDinnerOpen(date) {
    const s = scheduleForDate(date)
    return !!s.open && !!s.dinner
  }

  // ── Capacité ──────────────────────────────────────────────────────────────
  function coversAt(date, time) {
    return items.value
      .filter(r => r.date === date && r.time === time && ['pending','confirmed'].includes(r.status))
      .reduce((sum, r) => sum + r.covers, 0)
  }

  function coversForService(date, service) {
    return items.value
      .filter(r => r.date === date && ['pending','confirmed'].includes(r.status) &&
        (service === 'lunch' ? r.time < LUNCH_END : r.time >= LUNCH_END))
      .reduce((sum, r) => sum + r.covers, 0)
  }

  // Peut-on placer `covers` personnes sur ce créneau ?
  function canBook(date, time, covers = 1) {
    if (coversAt(date, time) + covers > settings.value.maxCoversPerSlot) return false
    const s = scheduleForDate(date)
    const service = time < LUNCH_END ? 'lunch' : 'dinner'
    const max = service === 'lunch' ? s.maxLunch : s.maxDinner
    return coversForService(date, service) + covers <= max
  }

  function isSlotFull(date, time) { return !canBook(date, time, 1) }

  function coversOnDay(date) {
    return items.value
      .filter(r => r.date === date && ['pending','confirmed'].includes(r.status))
      .reduce((sum, r) => sum + r.covers, 0)
  }

  function reservationsOnDay(date) {
    return [...items.value]
      .filter(r => r.date === date)
      .sort((a, b) => a.time.localeCompare(b.time))
  }

  // ── CRUD ──────────────────────────────────────────────────────────────────
  // Depuis le site public → auto-confirmé (si dispo = confirmé directement)
  async function add(reservation) {
    const id = crypto.randomUUID()
    const r = { ...reservation, id, note: '', status: 'confirmed', createdAt: Date.now() }
    await setDoc(doc(db, 'reservations', id), r)
    return r
  }

  // Depuis l'admin → statut au choix, peut forcer un créneau
  async function adminAdd(reservation) {
    const id = crypto.randomUUID()
    const r = { email: '', message: '', note: '', status: 'confirmed', ...reservation, id, createdAt: Date.now() }
    await setDoc(doc(db, 'reservations', id), r)
    return r
  }

  async function updateStatus(id, status) {
    const r = items.value.find(r => r.id === id)
    if (r) { r.status = status; await setDoc(doc(db, 'reservations', id), JSON.parse(JSON.stringify(r))) }
  }

  async function updateNote(id, note) {
    const r = items.value.find(r => r.id === id)
    if (r) { r.note = note; await setDoc(doc(db, 'reservations', id), JSON.parse(JSON.stringify(r))) }
  }

  async function remove(id) {
    items.value = items.value.filter(r => r.id !== id)
    await deleteDoc(doc(db, 'reservations', id))
  }

  // ── Computeds ──────────────────────────────────────────────────────────────
  const pending = computed(() => items.value.filter(r => r.status === 'pending'))

  const today = computed(() => {
    const d = todayStr()
    return items.value.filter(r => r.date === d && r.status !== 'cancelled' && r.status !== 'noshow')
  })

  const todayCovers = computed(() => today.value.reduce((s, r) => s + r.covers, 0))

  const thisWeek = computed(() => {
    const now = new Date()
    const day = now.getDay() || 7
    const mon = new Date(now); mon.setDate(now.getDate() - day + 1)
    const sun = new Date(mon); sun.setDate(mon.getDate() + 6)
    const start = toLocalDateStr(mon)
    const end   = toLocalDateStr(sun)
    return items.value.filter(r =>
      r.date >= start && r.date <= end && r.status !== 'cancelled' && r.status !== 'noshow'
    )
  })

  const byDate = computed(() =>
    [...items.value].sort((a, b) => (a.date + a.time).localeCompare(b.date + b.time))
  )

  return {
    items, settings, pending, today, todayCovers, thisWeek, byDate,
    add, adminAdd, updateStatus, updateNote, remove, updateSettings, saveSettings,
    coversAt, coversForService, canBook, isSlotFull, coversOnDay, reservationsOnDay,
    scheduleForDate, isRestaurantOpen, isLunchOpen, isDinnerOpen,
  }
})
