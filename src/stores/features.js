import { defineStore } from 'pinia'
import { ref } from 'vue'
import { doc, getDoc, setDoc } from 'firebase/firestore'
import { db } from '@/firebase.js'

// ── Définition des modules disponibles ────────────────────────────────────────
// Chaque entrée décrit un module vendable indépendamment.
// key      : identifiant technique (utilisé dans les v-if du template)
// label    : nom affiché dans le panneau admin
// desc     : description courte (aide à la vente / au devis)
// icon     : emoji affiché dans la sidebar et le panneau
// adminTab : id du panneau admin associé (peut être null si pas de panneau dédié)
export const FEATURE_DEFS = [
  {
    key:      'reservations',
    label:    'Réservations en ligne',
    desc:     'Formulaire de réservation public + gestion admin complète (créneaux, capacité, calendrier)',
    icon:     '📅',
    adminTab: 'reservations',
  },
  {
    key:      'menu',
    label:    'Carte du restaurant',
    desc:     'Affichage de la carte avec catégories, plats, prix et allergènes',
    icon:     '🍔',
    adminTab: 'menu',
  },
  {
    key:      'gallery',
    label:    'Galerie photos',
    desc:     'Grille de photos administrable directement depuis le back-office',
    icon:     '📸',
    adminTab: 'gallery',
  },
  {
    key:      'reviews',
    label:    'Avis Google',
    desc:     "Carrousel d'avis Google en temps réel via l'API Places",
    icon:     '🔵',
    adminTab: 'google',
  },
  {
    key:      'promotions',
    label:    'Offres & Promotions',
    desc:     'Bandeau promotionnel configurable en haut du site',
    icon:     '🎉',
    adminTab: 'promotions',
  },
  {
    key:      'qrcode',
    label:    'QR Code',
    desc:     'Générateur de QR code vers le site ou la carte, téléchargeable',
    icon:     '📱',
    adminTab: 'qrcode',
  },
  {
    key:      'schemaOrg',
    label:    'SEO — Données structurées',
    desc:     'Balisage Schema.org injecté dans le <head> pour améliorer le référencement Google et activer le bouton "Réserver"',
    icon:     '🔍',
    adminTab: null,
  },
]

export const DEFAULT_FEATURES = Object.fromEntries(FEATURE_DEFS.map(f => [f.key, true]))

export const useFeaturesStore = defineStore('features', () => {
  const flags  = ref({ ...DEFAULT_FEATURES })
  const loaded = ref(false)

  // Chargement depuis Firestore (non bloquant)
  getDoc(doc(db, 'config', 'features')).then(snap => {
    if (snap.exists()) Object.assign(flags.value, snap.data())
    loaded.value = true
  }).catch(console.error)

  async function _save() {
    await setDoc(doc(db, 'config', 'features'), { ...flags.value })
  }

  function set(key, val) {
    flags.value[key] = !!val
    _save()
  }

  function toggle(key) { set(key, !flags.value[key]) }

  // Helper : un module est-il actif ?
  function is(key) { return !!flags.value[key] }

  return { flags, loaded, set, toggle, is }
})
