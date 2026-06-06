<template>
  <div class="public-view">
    <NavBar />
    <PromoBanner />
    <HeroSection />
    <MenuSection />
    <ReservationSection />
    <GallerySection />
    <ReviewsSection />
    <InfoSection />
  </div>
</template>

<script setup>
import { onMounted } from 'vue'
import NavBar from '@/components/public/NavBar.vue'
import PromoBanner from '@/components/public/PromoBanner.vue'
import HeroSection from '@/components/public/HeroSection.vue'
import MenuSection from '@/components/public/MenuSection.vue'
import ReservationSection from '@/components/public/ReservationSection.vue'
import GallerySection from '@/components/public/GallerySection.vue'
import ReviewsSection from '@/components/public/ReviewsSection.vue'
import InfoSection from '@/components/public/InfoSection.vue'

// Fade-up intersection observer
onMounted(() => {
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(e => { if (e.isIntersecting) e.target.classList.add('visible') })
  }, { threshold: 0.12 })
  document.querySelectorAll('.fade-up').forEach(el => observer.observe(el))
})
</script>
