import { defineStore } from 'pinia'
import { ref } from 'vue'
import { doc, getDoc, setDoc } from 'firebase/firestore'
import { db } from '@/firebase.js'

const DAYS = ['Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi', 'Dimanche']

const DEFAULT_INFO = {
  name: "L'Aromate",
  address: "123 Rue Exemple, 75001 Paris",
  phone: "01 23 45 67 89",
  email: "contact@laromate.fr",
  instagram: "laromate_restaurant",
  facebook: "laromate",
  mapsEmbed: "",
  hours: DAYS.map((d, i) => ({
    day: d,
    open: i < 5,
    lunchOpen:  true,
    dinnerOpen: true,
    lunch:  { from: '12:00', to: '14:30' },
    dinner: { from: '19:00', to: '22:30' }
  }))
}

export const useInfoStore = defineStore('info', () => {
  const data = ref(JSON.parse(JSON.stringify(DEFAULT_INFO)))

  // Chargement Firestore (non bloquant — affiche les défauts pendant le load)
  getDoc(doc(db, 'config', 'info')).then(snap => {
    if (snap.exists()) {
      const saved = snap.data()
      if (saved.hours) {
        saved.hours = saved.hours.map(h => ({ lunchOpen: true, dinnerOpen: true, ...h }))
      }
      Object.assign(data.value, saved)
    }
  }).catch(console.error)

  async function save() {
    await setDoc(doc(db, 'config', 'info'), JSON.parse(JSON.stringify(data.value)))
  }

  function update(fields) {
    Object.assign(data.value, fields)
    save()
  }

  function updateHours(hours) {
    data.value.hours = hours
    save()
  }

  return { data, update, updateHours }
})
