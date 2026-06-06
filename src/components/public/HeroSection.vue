<template>
  <section id="hero" class="hero">
    <div class="hero-bg">
      <div class="hero-overlay" />
    </div>
    <div class="hero-content container">
      <div class="hero-text fade-up visible">
        <p class="hero-label">Restaurant · Bordeaux</p>
        <h1 class="hero-title">
          <em>L'art du</em><br>burger artisanal
        </h1>
        <p class="hero-desc">
          Des produits frais, des recettes maison et une passion pour les saveurs.<br>
          Burgers, sandwichs, pâtes et salades préparés avec soin.
        </p>
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
        <div class="badge-circle">
          <span class="badge-top">Fait</span>
          <span class="badge-main">Maison</span>
          <span class="badge-bottom">depuis 2020</span>
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
  background: url('https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=1600&auto=format&fit=crop') center/cover no-repeat;
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

.hero-badge {
  flex-shrink: 0;
}

.badge-circle {
  width: 160px;
  height: 160px;
  border-radius: 50%;
  border: 2px solid rgba(201, 169, 110, 0.6);
  background: rgba(201, 169, 110, 0.12);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  animation: rotate 20s linear infinite;
  backdrop-filter: blur(4px);
}

.badge-top {
  font-size: 0.7rem;
  font-weight: 600;
  letter-spacing: 0.15em;
  text-transform: uppercase;
  color: var(--accent);
}

.badge-main {
  font-family: var(--font-heading);
  font-size: 1.8rem;
  color: #fff;
  line-height: 1;
}

.badge-bottom {
  font-size: 0.72rem;
  color: rgba(255,255,255,0.6);
  letter-spacing: 0.05em;
}

@keyframes rotate {
  from { transform: rotate(0deg); }
  to   { transform: rotate(360deg); }
}

.badge-main { animation: counter-rotate 20s linear infinite; }

@keyframes counter-rotate {
  from { transform: rotate(0deg); }
  to   { transform: rotate(-360deg); }
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
