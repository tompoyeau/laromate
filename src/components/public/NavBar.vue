<template>
  <nav class="navbar" :class="{ scrolled: isScrolled, 'menu-open': menuOpen }">
    <div class="nav-container">
      <a class="nav-brand" href="#" @click.prevent="scrollTo('hero')">
        <img v-if="theme.theme.logo" :src="theme.theme.logo" alt="Logo" class="nav-logo" />
        <span class="nav-name">{{ theme.theme.restaurantName }}</span>
      </a>

      <div class="nav-links" :class="{ open: menuOpen }">
        <a v-for="link in links" :key="link.id" :href="`#${link.id}`" class="nav-link"
          @click.prevent="scrollTo(link.id); menuOpen = false">
          {{ link.label }}
        </a>
        <button class="btn btn-primary btn-sm nav-cta" @click="scrollTo('reservation'); menuOpen = false">
          Réserver
        </button>
      </div>

      <div class="nav-actions">
        <button class="btn-icon dark-toggle" @click="theme.toggleDark()" :title="theme.theme.darkMode ? 'Mode clair' : 'Mode sombre'">
          <svg v-if="theme.theme.darkMode" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/></svg>
          <svg v-else width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>
        </button>
        <button class="hamburger" @click="menuOpen = !menuOpen" :class="{ open: menuOpen }">
          <span /><span /><span />
        </button>
      </div>
    </div>
  </nav>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import { useThemeStore } from '@/stores/theme.js'

const theme = useThemeStore()
const isScrolled = ref(false)
const menuOpen = ref(false)

const links = [
  { id: 'menu', label: 'La carte' },
  { id: 'reservation', label: 'Réservation' },
  { id: 'gallery', label: 'Galerie' },
  { id: 'reviews', label: 'Avis' },
  { id: 'info', label: 'Infos' },
]

function scrollTo(id) {
  const el = document.getElementById(id)
  if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' })
}

function handleScroll() {
  isScrolled.value = window.scrollY > 50
}

onMounted(() => window.addEventListener('scroll', handleScroll))
onUnmounted(() => window.removeEventListener('scroll', handleScroll))
</script>

<style scoped>
.navbar {
  position: fixed;
  top: 0; left: 0; right: 0;
  z-index: 1000;
  padding: 1.25rem 0;
  transition: all 0.3s ease;
}

.navbar.scrolled {
  background: var(--bg-card);
  box-shadow: var(--shadow);
  padding: 0.85rem 0;
}

.nav-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 2rem;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 2rem;
}

.nav-brand {
  display: flex;
  align-items: center;
  gap: 0.6rem;
  text-decoration: none;
}

.nav-logo { height: 36px; width: 36px; object-fit: cover; border-radius: 50%; }

.nav-name {
  font-family: var(--font-heading);
  font-size: 1.35rem;
  color: var(--text);
  transition: color 0.3s;
}

.navbar:not(.scrolled) .nav-name { color: #fff; }

.nav-links {
  display: flex;
  align-items: center;
  gap: 0.25rem;
}

.nav-link {
  padding: 0.5rem 0.85rem;
  border-radius: var(--radius-sm);
  font-size: 0.88rem;
  font-weight: 500;
  color: var(--text);
  transition: all 0.2s;
}

.navbar:not(.scrolled) .nav-link { color: rgba(255,255,255,0.9); }
.navbar:not(.scrolled) .nav-link:hover { background: rgba(255,255,255,0.15); color: #fff; }
.nav-link:hover { background: var(--border); }

.nav-cta { margin-left: 0.5rem; }
.navbar:not(.scrolled) .nav-cta { background: rgba(255,255,255,0.2); border: 1.5px solid rgba(255,255,255,0.4); }
.navbar:not(.scrolled) .nav-cta:hover { background: rgba(255,255,255,0.3); }

.nav-actions { display: flex; align-items: center; gap: 0.5rem; }

.dark-toggle {
  color: var(--text-light);
  border-radius: var(--radius-sm);
  padding: 0.45rem;
}
.navbar:not(.scrolled) .dark-toggle { color: rgba(255,255,255,0.8); }

.hamburger {
  display: none;
  flex-direction: column;
  gap: 4px;
  padding: 0.4rem;
  background: none;
  border: none;
  cursor: pointer;
}
.hamburger span {
  display: block;
  width: 22px;
  height: 2px;
  background: var(--text);
  border-radius: 2px;
  transition: all 0.25s;
}
.navbar:not(.scrolled) .hamburger span { background: #fff; }

.hamburger.open span:nth-child(1) { transform: translateY(6px) rotate(45deg); }
.hamburger.open span:nth-child(2) { opacity: 0; }
.hamburger.open span:nth-child(3) { transform: translateY(-6px) rotate(-45deg); }

@media (max-width: 900px) {
  .hamburger { display: flex; }
  .nav-links {
    display: none;
    position: fixed;
    top: var(--nav-h);
    left: 0; right: 0;
    background: var(--bg-card);
    flex-direction: column;
    padding: 1.5rem 2rem;
    gap: 0.5rem;
    box-shadow: var(--shadow-lg);
    border-top: 1px solid var(--border);
  }
  .nav-links.open { display: flex; }
  .nav-link { width: 100%; padding: 0.75rem 1rem; color: var(--text) !important; }
  .nav-cta { width: 100%; justify-content: center; margin-left: 0; margin-top: 0.5rem;
    background: var(--primary) !important; color: #fff !important; }
}
</style>
