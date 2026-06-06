import { ref } from 'vue'

const toasts = ref([])

export function useToast() {
  function show(message, type = 'default', duration = 3000) {
    const id = Date.now() + Math.random()
    toasts.value.push({ id, message, type })
    setTimeout(() => {
      toasts.value = toasts.value.filter(t => t.id !== id)
    }, duration)
  }

  function success(msg) { show(msg, 'success') }
  function error(msg) { show(msg, 'error') }

  return { toasts, show, success, error }
}
