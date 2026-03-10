<template>
  <div class="draw-board-page">
    <div class="header-container">
      <header-bar>
        <a-breadcrumb class="breadcrumb-container">
          <a-breadcrumb-item>吾记</a-breadcrumb-item>
          <a-breadcrumb-item class="breadcrumb-item">画板</a-breadcrumb-item>
        </a-breadcrumb>
      </header-bar>
    </div>
    <div class="canvas-container">
      <excali-draw />
    </div>
  </div>
</template>

<script setup>
defineOptions({
  name: 'DrawBoard'
})
import ExcaliDraw from '../components/excaliDraw.vue'
import HeaderBar from '../components/defaultLayout/headerBar.vue'
</script>

<style scoped>
.draw-board-page {
  display: flex;
  flex-direction: column;
  width: 100%;
  height: 100vh;
  overflow: hidden;
}

.header-container {
  height: 60px; /* Adjust based on HeaderBar's actual height if needed */
  flex-shrink: 0;
  z-index: 10;
}

.canvas-container {
  flex: 1;
  position: relative;
  overflow: hidden;
  /* Ensure Excalidraw takes remaining space */
}

.breadcrumb-container {
  color: var(--color-neutral-8);
}
</style>
