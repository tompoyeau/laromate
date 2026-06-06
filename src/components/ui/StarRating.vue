<template>
  <div class="stars" :class="{ interactive: interactive }">
    <span
      v-for="n in 5"
      :key="n"
      class="star"
      :class="{ filled: n <= (hovered || modelValue), half: false }"
      @mouseenter="interactive && (hovered = n)"
      @mouseleave="interactive && (hovered = 0)"
      @click="interactive && $emit('update:modelValue', n)"
    >★</span>
  </div>
</template>

<script setup>
import { ref } from 'vue'
const props = defineProps({
  modelValue: { type: Number, default: 0 },
  interactive: { type: Boolean, default: false }
})
defineEmits(['update:modelValue'])
const hovered = ref(0)
</script>

<style scoped>
.stars { display: inline-flex; gap: 2px; }
.star { font-size: 1.2rem; color: var(--border); transition: color 0.15s; }
.star.filled { color: var(--accent); }
.interactive .star { cursor: pointer; }
.interactive .star:hover { transform: scale(1.1); }
</style>
