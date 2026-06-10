<template>
  <div class="features-panel">
    <div class="panel-intro">
      <h3 class="panel-intro-title">Modules actifs</h3>
      <p class="panel-intro-desc">
        Activez ou désactivez chaque module indépendamment. Un module désactivé disparaît
        du site public et de cette interface — rien n'est supprimé, il peut être réactivé à tout moment.
      </p>
    </div>

    <div class="features-grid">
      <div
        v-for="def in FEATURE_DEFS"
        :key="def.key"
        :class="['feature-card', { active: features.flags[def.key] }]"
      >
        <div class="feature-header">
          <span class="feature-icon">{{ def.icon }}</span>
          <div class="feature-meta">
            <div class="feature-label">{{ def.label }}</div>
            <div :class="['feature-status', features.flags[def.key] ? 'status-on' : 'status-off']">
              {{ features.flags[def.key] ? 'Actif' : 'Inactif' }}
            </div>
          </div>
          <!-- Toggle switch -->
          <button
            :class="['toggle', { on: features.flags[def.key] }]"
            @click="features.toggle(def.key)"
            :aria-label="`${features.flags[def.key] ? 'Désactiver' : 'Activer'} ${def.label}`"
          >
            <span class="toggle-thumb" />
          </button>
        </div>
        <p class="feature-desc">{{ def.desc }}</p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { useFeaturesStore, FEATURE_DEFS } from '@/stores/features.js'
const features = useFeaturesStore()
</script>

<style scoped>
.features-panel { max-width: 860px; }

.panel-intro {
  background: var(--bg-card);
  border: 1px solid var(--border);
  border-radius: var(--radius);
  padding: 1.25rem 1.5rem;
  margin-bottom: 2rem;
}
.panel-intro-title { font-family: var(--font-heading); font-size: 1rem; margin-bottom: 0.4rem; }
.panel-intro-desc  { font-size: 0.85rem; color: var(--text-light); line-height: 1.6; }

.features-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(340px, 1fr));
  gap: 1rem;
}

.feature-card {
  background: var(--bg-card);
  border: 1.5px solid var(--border);
  border-radius: var(--radius);
  padding: 1.25rem 1.5rem;
  transition: border-color 0.2s, box-shadow 0.2s;
}

.feature-card.active {
  border-color: var(--primary);
  box-shadow: 0 0 0 3px rgba(107, 124, 92, 0.08);
}

.feature-header {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  margin-bottom: 0.75rem;
}

.feature-icon { font-size: 1.5rem; flex-shrink: 0; }

.feature-meta { flex: 1; min-width: 0; }
.feature-label { font-weight: 600; font-size: 0.92rem; }

.feature-status {
  font-size: 0.72rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.06em;
  margin-top: 0.15rem;
}
.status-on  { color: var(--primary); }
.status-off { color: var(--text-muted); }

.feature-desc {
  font-size: 0.83rem;
  color: var(--text-light);
  line-height: 1.55;
  padding-top: 0.6rem;
  border-top: 1px solid var(--border);
}

/* Toggle switch */
.toggle {
  width: 44px;
  height: 24px;
  border-radius: 99px;
  background: var(--border);
  position: relative;
  cursor: pointer;
  transition: background 0.2s;
  flex-shrink: 0;
  border: none;
  padding: 0;
}
.toggle.on { background: var(--primary); }

.toggle-thumb {
  position: absolute;
  top: 3px;
  left: 3px;
  width: 18px;
  height: 18px;
  border-radius: 50%;
  background: #fff;
  box-shadow: 0 1px 3px rgba(0,0,0,0.2);
  transition: left 0.2s;
}
.toggle.on .toggle-thumb { left: 23px; }

@media (max-width: 600px) {
  .features-grid { grid-template-columns: 1fr; }
}
</style>
