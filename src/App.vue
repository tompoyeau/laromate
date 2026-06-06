<template>
  <div :class="['app-root', { dark: theme.darkMode }]">
    <AppToast />
    <RouterView />
  </div>
</template>

<script setup>
import { onMounted } from 'vue'
import { useThemeStore } from '@/stores/theme.js'
import AppToast from '@/components/ui/AppToast.vue'

const theme = useThemeStore()

onMounted(() => {
  theme.applyTheme()
})
</script>

<style>
.app-root {
  min-height: 100vh;
}
</style>
