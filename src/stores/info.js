import { defineStore } from 'pinia'
import { ref } from 'vue'

const LS_KEY = 'laromate_info'

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
    lunch: { from: '12:00', to: '14:30' },
    dinner: { from: '19:00', to: '22:30' }
  }))
}

export const useInfoStore = defineStore('info', () => {
  const data = ref(load())

  function load() {
    try {
      const raw = localStorage.getItem(LS_KEY)
      return raw ? JSON.parse(raw) : DEFAULT_INFO
    } catch { return DEFAULT_INFO }
  }

  function save() {
    localStorage.setItem(LS_KEY, JSON.stringify(data.value))
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
