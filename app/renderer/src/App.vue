<template>
  <router-view></router-view>
</template>

<script setup>
import { RouterView } from 'vue-router'
import { onMounted, onUnmounted } from 'vue'

let scrollHideTimer = null

const handleAnyScroll = () => {
  document.body.classList.add('is-scrolling')
  if (scrollHideTimer) clearTimeout(scrollHideTimer)
  scrollHideTimer = setTimeout(() => {
    document.body.classList.remove('is-scrolling')
    scrollHideTimer = null
  }, 700)
}

onMounted(() => {
  window.addEventListener('scroll', handleAnyScroll, true)
})

onUnmounted(() => {
  window.removeEventListener('scroll', handleAnyScroll, true)
  if (scrollHideTimer) clearTimeout(scrollHideTimer)
})
</script>

<style scoped>
:where(.arco-icon) {
  color: currentColor;
}

:where(.arco-btn.arco-btn-text) {
  color: var(--color-text-1);
}

:where(.arco-btn.arco-btn-text):where(:hover, :active, :focus, :focus-visible) {
  color: var(--color-text-1) !important;
}

:where(.arco-btn.arco-btn-text) :where(.arco-icon) {
  color: currentColor;
}
</style>
