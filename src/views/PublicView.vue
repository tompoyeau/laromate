<template>
  <div class="public-view">
    <!-- SEO : JSON-LD Restaurant injecté dans <head> -->
    <SchemaOrg v-if="features.is('schemaOrg')" />

    <NavBar />

    <!-- Bandeau promotionnel (module optionnel) -->
    <PromoBanner v-if="features.is('promotions')" />

    <!-- Shell — toujours présent -->
    <HeroSection />

    <!-- Modules optionnels -->
    <MenuSection        v-if="features.is('menu')" />
    <ReservationSection v-if="features.is('reservations')" />
    <GallerySection     v-if="features.is('gallery')" />
    <ReviewsSection     v-if="features.is('reviews')" />

    <!-- Shell — toujours présent -->
    <InfoSection />
  </div>
</template>

<script setup>
import { onMounted } from 'vue'
import SchemaOrg from '@/components/SchemaOrg.vue'
import { useFeaturesStore } from '@/stores/features.js'
import NavBar from '@/components/public/NavBar.vue'
import PromoBanner from '@/components/public/PromoBanner.vue'
import HeroSection from '@/components/public/HeroSection.vue'
import MenuSection from '@/components/public/MenuSection.vue'
import ReservationSection from '@/components/public/ReservationSection.vue'
import GallerySection from '@/components/public/GallerySection.vue'
import ReviewsSection from '@/components/public/ReviewsSection.vue'
import InfoSection from '@/components/public/InfoSection.vue'

const features = useFeaturesStore()

// Fade-up intersection observer
// Utilise aussi un MutationObserver pour les éléments montés après le premier render
// (ex : .google-block et .gallery injectés quand les données Firestore arrivent)
onMounted(() => {
  const io = new IntersectionObserver((entries) => {
    entries.forEach(e => { if (e.isIntersecting) { e.target.classList.add('visible'); io.unobserve(e.target) } })
  }, { threshold: 0.12 })

  function observeEl(el) {
    if (el.nodeType !== 1) return
    if (el.classList.contains('fade-up') && !el.classList.contains('visible')) io.observe(el)
    el.querySelectorAll?.('.fade-up:not(.visible)').forEach(child => io.observe(child))
  }

  // Éléments présents au montage
  document.querySelectorAll('.fade-up').forEach(el => io.observe(el))

  // Éléments ajoutés dynamiquement (données Firestore async)
  const mo = new MutationObserver(mutations => {
    mutations.forEach(m => m.addedNodes.forEach(node => observeEl(node)))
  })
  mo.observe(document.body, { childList: true, subtree: true })
})
</script>
