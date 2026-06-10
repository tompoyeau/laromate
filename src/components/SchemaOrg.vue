<template><!-- renderless --></template>

<script setup>
/**
 * SchemaOrg.vue — injecte le JSON-LD Restaurant dans <head>
 *
 * Ce balisage sert à deux choses :
 *  1. Indiquer à Google que le site est un restaurant avec réservation en ligne
 *     → Google peut afficher un bouton "Réserver" dans les résultats de recherche
 *       qui pointe vers votre formulaire (option "lien de réservation" dans GBP)
 *  2. Améliorer le SEO général (rich results, Knowledge Panel…)
 *
 * Pour activer le bouton "Réserver" sur Google Maps / Recherche :
 *   → Google Business Profile > Infos > "Lien de réservation" :
 *     collez l'URL de votre site + anchor  https://votre-site.fr/#reservation
 */
import { onMounted, onUnmounted, watch, computed } from 'vue'
import { useInfoStore }    from '@/stores/info.js'
import { useContentStore } from '@/stores/content.js'

const info    = useInfoStore()
const content = useContentStore()

// Mapping jours FR → valeur Schema.org
const DOW_MAP = {
  Lundi:    'https://schema.org/Monday',
  Mardi:    'https://schema.org/Tuesday',
  Mercredi: 'https://schema.org/Wednesday',
  Jeudi:    'https://schema.org/Thursday',
  Vendredi: 'https://schema.org/Friday',
  Samedi:   'https://schema.org/Saturday',
  Dimanche: 'https://schema.org/Sunday',
}

// Construit les openingHoursSpecification depuis les horaires du store
function buildHours(hours) {
  const specs = []
  for (const h of (hours ?? [])) {
    if (!h.open || (!h.lunchOpen && !h.dinnerOpen)) continue
    const dow = DOW_MAP[h.day]
    if (!dow) continue
    if (h.lunchOpen !== false && h.lunch?.from && h.lunch?.to) {
      specs.push({ '@type': 'OpeningHoursSpecification', dayOfWeek: dow, opens: h.lunch.from, closes: h.lunch.to })
    }
    if (h.dinnerOpen !== false && h.dinner?.from && h.dinner?.to) {
      specs.push({ '@type': 'OpeningHoursSpecification', dayOfWeek: dow, opens: h.dinner.from, closes: h.dinner.to })
    }
  }
  return specs
}

// Parse l'adresse en PostalAddress si possible
function buildAddress(raw) {
  if (!raw) return undefined
  return { '@type': 'PostalAddress', streetAddress: raw, addressCountry: 'FR' }
}

const siteUrl = window.location.origin

const schema = computed(() => {
  const d = info.data
  return {
    '@context': 'https://schema.org',
    '@type': 'Restaurant',
    name:        d.name || "L'Aromate",
    url:         siteUrl,
    telephone:   d.phone   || undefined,
    email:       d.email   || undefined,
    address:     buildAddress(d.address),
    description: content.data.heroDesc || undefined,
    acceptsReservations: 'True',
    // Indique à Google l'URL du formulaire de réservation
    potentialAction: {
      '@type': 'ReserveAction',
      target: {
        '@type': 'EntryPoint',
        urlTemplate:     `${siteUrl}/#reservation`,
        inLanguage:      'fr-FR',
        actionPlatform: [
          'http://schema.org/DesktopWebPlatform',
          'http://schema.org/IOSPlatform',
          'http://schema.org/AndroidPlatform',
        ],
      },
      result: { '@type': 'Reservation', name: 'Réserver une table' },
    },
    openingHoursSpecification: buildHours(d.hours),
    // Réseaux sociaux
    sameAs: [
      d.instagram ? `https://www.instagram.com/${d.instagram}` : null,
      d.facebook  ? `https://www.facebook.com/${d.facebook}`  : null,
    ].filter(Boolean),
  }
})

let scriptEl = null

function inject() {
  remove()
  scriptEl = document.createElement('script')
  scriptEl.type = 'application/ld+json'
  scriptEl.id   = 'schema-org-restaurant'
  scriptEl.text = JSON.stringify(schema.value, null, 2)
  document.head.appendChild(scriptEl)
}

function remove() {
  const existing = document.getElementById('schema-org-restaurant')
  if (existing) existing.remove()
  scriptEl = null
}

// (Re)injecte à chaque fois que les données du store changent
let stopWatch
onMounted(() => {
  inject()
  stopWatch = watch(schema, inject, { deep: true })
})
onUnmounted(() => {
  stopWatch?.()
  remove()
})
</script>
