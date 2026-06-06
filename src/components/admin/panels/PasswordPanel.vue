<template>
  <div class="pass-panel">
    <h2 class="panel-title">Mot de passe admin</h2>
    <div class="card pass-card">
      <div class="security-info">
        <div class="security-badge">🔐</div>
        <div>
          <h3>Sécurité renforcée</h3>
          <p>Le mot de passe est hashé en SHA-256 avant stockage. Il n'est jamais enregistré en clair. La session expire après 8h ou à la fermeture de l'onglet.</p>
        </div>
      </div>

      <div class="form-group">
        <label class="form-label">Nouveau mot de passe</label>
        <div class="pass-input-wrap">
          <input
            v-model="newPass"
            :type="showPass ? 'text' : 'password'"
            class="form-input"
            placeholder="Minimum 6 caractères"
          />
          <button type="button" class="pass-toggle" @click="showPass = !showPass">
            {{ showPass ? '🙈' : '👁' }}
          </button>
        </div>
        <div class="pass-strength" v-if="newPass">
          <div class="strength-bar">
            <div class="strength-fill" :style="{ width: strengthPct + '%', background: strengthColor }"></div>
          </div>
          <span :style="{ color: strengthColor }">{{ strengthLabel }}</span>
        </div>
      </div>

      <div class="form-group">
        <label class="form-label">Confirmer le mot de passe</label>
        <input
          v-model="confPass"
          :type="showPass ? 'text' : 'password'"
          class="form-input"
          :class="{ 'input-error': confPass && confPass !== newPass }"
          placeholder="Répéter le mot de passe"
        />
      </div>

      <div v-if="error" class="error-msg">{{ error }}</div>

      <button class="btn btn-primary" @click="change" :disabled="!newPass || !confPass">
        Changer le mot de passe
      </button>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useAuthStore } from '@/stores/auth.js'
import { useToast } from '@/composables/useToast.js'

const auth = useAuthStore()
const { success, error: toastError } = useToast()

const newPass = ref('')
const confPass = ref('')
const showPass = ref(false)
const error = ref('')

const strength = computed(() => {
  const p = newPass.value
  if (!p) return 0
  let s = 0
  if (p.length >= 6) s++
  if (p.length >= 10) s++
  if (/[A-Z]/.test(p)) s++
  if (/[0-9]/.test(p)) s++
  if (/[^A-Za-z0-9]/.test(p)) s++
  return s
})

const strengthPct = computed(() => [0, 25, 50, 75, 90, 100][strength.value])
const strengthColor = computed(() => ['', '#dc2626', '#f59e0b', '#eab308', '#22c55e', '#16a34a'][strength.value])
const strengthLabel = computed(() => ['', 'Très faible', 'Faible', 'Moyen', 'Fort', 'Très fort'][strength.value])

async function change() {
  error.value = ''
  if (newPass.value !== confPass.value) { error.value = 'Les mots de passe ne correspondent pas'; return }
  const res = await auth.changePassword(newPass.value)
  if (res.success) {
    success('Mot de passe mis à jour !')
    newPass.value = ''
    confPass.value = ''
  } else {
    error.value = res.error
  }
}
</script>

<style scoped>
.panel-title { font-family: var(--font-heading); font-size: 1.6rem; margin-bottom: 1.5rem; }

.pass-card { padding: 2rem; max-width: 500px; }

.security-info {
  display: flex;
  gap: 1rem;
  padding: 1rem;
  background: rgba(107, 124, 92, 0.08);
  border-radius: var(--radius);
  margin-bottom: 1.5rem;
}

.security-badge { font-size: 1.8rem; }
.security-info h3 { font-family: var(--font-heading); margin-bottom: 0.25rem; }
.security-info p  { font-size: 0.85rem; color: var(--text-light); line-height: 1.5; }

.pass-input-wrap { position: relative; }
.pass-toggle {
  position: absolute;
  right: 0.75rem;
  top: 50%;
  transform: translateY(-50%);
  background: none;
  border: none;
  cursor: pointer;
  font-size: 1rem;
}

.pass-strength { margin-top: 0.5rem; display: flex; align-items: center; gap: 0.75rem; }
.strength-bar { flex: 1; height: 4px; background: var(--border); border-radius: 2px; overflow: hidden; }
.strength-fill { height: 100%; border-radius: 2px; transition: all 0.3s; }

.input-error { border-color: #dc2626 !important; }
.error-msg { color: #dc2626; font-size: 0.85rem; margin-bottom: 1rem; }
</style>
