<template>
  <section id="hero" class="hero">
    <div class="hero-bg" :style="{ backgroundImage: `url(${content.heroImageSrc()})` }">
      <div class="hero-overlay" />
    </div>
    <div class="hero-content container">
      <div class="hero-text fade-up visible">
        <p class="hero-label">{{ content.data.heroLabel }}</p>
        <h1 class="hero-title">
          <em>{{ content.data.heroTitle1 }}</em><br>{{ content.data.heroTitle2 }}
        </h1>
        <p class="hero-desc">{{ content.data.heroDesc }}</p>
        <div class="hero-actions">
          <button class="btn btn-primary hero-btn" @click="scrollTo('reservation')">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
            Réserver une table
          </button>
          <button class="btn hero-btn-outline" @click="scrollTo('menu')">
            Voir la carte →
          </button>
        </div>
      </div>
      <div class="hero-badge">
        <div class="badge-wrapper">
          <!-- Anneau rotatif avec texte sur chemin SVG -->
          <svg class="badge-ring" viewBox="0 0 160 160" fill="none" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <!-- Le textPath tourne à r=69, entre les deux cercles décoratifs -->
              <path id="ring-path" d="M80,80 m-69,0 a69,69 0 1,1 138,0 a69,69 0 1,1 -138,0"/>
            </defs>
            <!-- Fond opaque pour masquer le centre -->
            <circle cx="80" cy="80" r="79" fill="rgba(10,14,8,0.5)" />
            <!-- Cercle extérieur -->
            <circle cx="80" cy="80" r="78" stroke="rgba(201,169,110,0.2)" stroke-width="0.6"/>
            <!-- Cercle pointillé -->
            <circle cx="80" cy="80" r="60" stroke="rgba(201,169,110,0.5)" stroke-width="0.8" stroke-dasharray="2.8 3"/>
            <!-- Fond centre pour bloquer le texte de l'anneau -->
            <circle cx="80" cy="80" r="58" fill="rgba(10,14,8,0.45)"/>
            <!-- Texte circulaire sur l'anneau -->
            <text fill="rgba(201,169,110,0.85)" font-size="9.2" font-family="'Inter', sans-serif" font-weight="600" letter-spacing="3.2">
              <textPath href="#ring-path">
                {{ ringText }}
              </textPath>
            </text>
          </svg>
          <!-- Centre statique (ne tourne pas) -->
          <div class="badge-center">
            <!-- Aromate / herb icon -->
            <svg class="badge-icon" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="rgba(201,169,110,0.9)" stroke-width="1.3" stroke-linecap="round" stroke-linejoin="round">
              <line x1="12" y1="22" x2="12" y2="10"/>
              <path d="M12 10C10 8 7 8 5.5 5.5c3 0 5.5 1.5 6.5 4.5z"/>
              <path d="M12 10C14 8 17 8 18.5 5.5c-3 0-5.5 1.5-6.5 4.5z"/>
              <path d="M12 16C10.5 14.5 8.5 14.5 7.5 12.5c2 0 3.5 1 4.5 3.5z"/>
              <path d="M12 16C13.5 14.5 15.5 14.5 16.5 12.5c-2 0-3.5 1-4.5 3.5z"/>
            </svg>
            <span class="badge-main-text">{{ content.data.heroBadgeMain }}</span>
          </div>
        </div>
      </div>
    </div>
    <div class="hero-scroll" @click="scrollTo('menu')">
      <span>Découvrir</span>
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="6 9 12 15 18 9"/></svg>
    </div>
  </section>
</template>

<script setup>
import { computed } from 'vue'
import { useContentStore } from '@/stores/content.js'
const content = useContentStore()

// Texte circulaire : répété 2× pour remplir l'anneau complet
const ringText = computed(() => {
  const top  = (content.data.heroBadgeTop  || 'FAIT').toUpperCase()
  const main = (content.data.heroBadgeMain || 'Maison').toUpperCase()
  const sub  = content.data.heroBadgeSub  || '2020'
  const segment = `${top} ${main}  ✦  DEPUIS ${sub}  ✦  `
  return segment.repeat(2)
})

function scrollTo(id) {
  document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' })
}
</script>

<style scoped>
.hero {
  position: relative;
  min-height: 100vh;
  display: flex;
  align-items: center;
  overflow: hidden;
}

.hero-bg {
  position: absolute;
  inset: 0;
  background-size: cover;
  background-position: center;
  background-repeat: no-repeat;
}

.hero-overlay {
  position: absolute;
  inset: 0;
  background: linear-gradient(135deg, rgba(26, 32, 20, 0.85) 0%, rgba(74, 87, 64, 0.6) 100%);
}

.hero-content {
  position: relative;
  z-index: 2;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 4rem;
  padding-top: 5rem;
  width: 100%;
}

.hero-label {
  font-size: 0.8rem;
  font-weight: 600;
  letter-spacing: 0.2em;
  text-transform: uppercase;
  color: var(--accent);
  margin-bottom: 1rem;
}

.hero-title {
  font-size: clamp(2.8rem, 6vw, 5rem);
  color: #fff;
  line-height: 1.1;
  margin-bottom: 1.5rem;
}

.hero-title em {
  font-style: italic;
  color: rgba(255,255,255,0.75);
  font-weight: 400;
}

.hero-desc {
  color: rgba(255, 255, 255, 0.8);
  font-size: 1.05rem;
  line-height: 1.7;
  margin-bottom: 2.5rem;
  max-width: 480px;
}

.hero-actions {
  display: flex;
  gap: 1rem;
  flex-wrap: wrap;
}

.hero-btn {
  padding: 0.9rem 2rem;
  font-size: 0.95rem;
  background: var(--primary);
  border: 2px solid var(--primary);
}

.hero-btn-outline {
  padding: 0.9rem 2rem;
  font-size: 0.95rem;
  background: transparent;
  color: #fff;
  border: 2px solid rgba(255,255,255,0.5);
  border-radius: var(--radius);
  font-family: var(--font-body);
  font-weight: 500;
  transition: all 0.3s;
  cursor: pointer;
}

.hero-btn-outline:hover { background: rgba(255,255,255,0.15); border-color: rgba(255,255,255,0.8); }

.hero-badge { flex-shrink: 0; }

/* Wrapper positionné pour superposer anneau + centre */
.badge-wrapper {
  position: relative;
  width: 160px;
  height: 160px;
}

/* Anneau SVG qui tourne lentement */
.badge-ring {
  width: 160px;
  height: 160px;
  animation: rotate 28s linear infinite;
  overflow: visible;
}

/* Centre fixe, ne tourne pas */
.badge-center {
  position: absolute;
  inset: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 0.2rem;
  pointer-events: none;
}

.badge-icon {
  margin-bottom: 0.15rem;
  opacity: 0.9;
}

.badge-main-text {
  font-family: var(--font-heading);
  font-size: 1.7rem;
  font-style: italic;
  color: #fff;
  line-height: 1;
  letter-spacing: 0.01em;
  text-shadow: 0 1px 8px rgba(0,0,0,0.5);
}

@keyframes rotate {
  from { transform: rotate(0deg); }
  to   { transform: rotate(360deg); }
}

.hero-scroll {
  position: absolute;
  bottom: 2.5rem;
  left: 50%;
  transform: translateX(-50%);
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.4rem;
  color: rgba(255,255,255,0.6);
  font-size: 0.78rem;
  cursor: pointer;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  animation: bounce 2s ease-in-out infinite;
  z-index: 2;
}

@keyframes bounce {
  0%, 100% { transform: translateX(-50%) translateY(0); }
  50% { transform: translateX(-50%) translateY(6px); }
}

@media (max-width: 768px) {
  .hero-content { flex-direction: column; gap: 2rem; padding-top: 7rem; text-align: center; }
  .hero-desc { max-width: 100%; }
  .hero-actions { justify-content: center; }
  .hero-badge { display: none; }
}
</style>
