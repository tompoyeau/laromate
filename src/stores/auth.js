import { defineStore } from 'pinia'
import { ref } from 'vue'

const LS_PASS = 'laromate_password'
const LS_LOCK = 'laromate_lockout'
const SESSION_KEY = 'laromate_session'
const SESSION_TTL = 8 * 60 * 60 * 1000   // 8h
const MAX_ATTEMPTS = 3
const LOCK_TTL = 5 * 60 * 1000           // 5 min
// SHA-256 of 'admin'
const DEFAULT_HASH = '8c6976e5b5410415bde908bd4dee15dfb167a9c873fc4bb8a81f6f2ab448a918'

async function sha256(str) {
  const buf = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(str))
  return Array.from(new Uint8Array(buf)).map(b => b.toString(16).padStart(2, '0')).join('')
}

export const useAuthStore = defineStore('auth', () => {
  const isAuthenticated = ref(false)
  const lockoutInfo = ref(null)

  function getStoredHash() {
    return localStorage.getItem(LS_PASS) || DEFAULT_HASH
  }

  function setStoredHash(h) {
    localStorage.setItem(LS_PASS, h)
  }

  function createSession() {
    sessionStorage.setItem(SESSION_KEY, JSON.stringify({
      token: crypto.randomUUID(),
      expires: Date.now() + SESSION_TTL
    }))
  }

  function hasValidSession() {
    try {
      const s = JSON.parse(sessionStorage.getItem(SESSION_KEY))
      return s && s.expires > Date.now()
    } catch { return false }
  }

  function clearSession() {
    sessionStorage.removeItem(SESSION_KEY)
  }

  function getLockout() {
    try {
      const l = JSON.parse(localStorage.getItem(LS_LOCK))
      if (!l) return null
      if (Date.now() > l.until) { localStorage.removeItem(LS_LOCK); return null }
      return l
    } catch { return null }
  }

  function recordFail() {
    const l = JSON.parse(localStorage.getItem(LS_LOCK) || '{"attempts":0}')
    l.attempts = (l.attempts || 0) + 1
    if (l.attempts >= MAX_ATTEMPTS) {
      l.until = Date.now() + LOCK_TTL
    }
    localStorage.setItem(LS_LOCK, JSON.stringify(l))
    lockoutInfo.value = getLockout()
    return l
  }

  function clearLock() {
    localStorage.removeItem(LS_LOCK)
    lockoutInfo.value = null
  }

  async function login(password) {
    // Lockout désactivé temporairement
    // const lock = getLockout()
    // if (lock) { ... }

    if (!password) return { success: false, error: '' }

    const hash = await sha256(password)
    if (hash === getStoredHash()) {
      clearLock()
      createSession()
      isAuthenticated.value = true
      return { success: true }
    } else {
      return { success: false, error: 'Mot de passe incorrect.' }
    }
  }

  function logout() {
    clearSession()
    isAuthenticated.value = false
  }

  async function changePassword(newPass) {
    if (!newPass || newPass.length < 6) return { success: false, error: 'Minimum 6 caractères' }
    const hash = await sha256(newPass)
    setStoredHash(hash)
    return { success: true }
  }

  function checkSession() {
    if (hasValidSession()) {
      isAuthenticated.value = true
      return true
    }
    return false
  }

  return {
    isAuthenticated, lockoutInfo,
    login, logout, changePassword, checkSession, getLockout,
    MAX_ATTEMPTS, LOCK_TTL
  }
})
