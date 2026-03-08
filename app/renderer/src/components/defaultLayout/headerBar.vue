<template>
  <div class="header-bar-container">
    <slot></slot>
    <a-space size="mini">
      <a-button class="window-control-btn" type="text" @click="minimizeWindow">
        <template #icon>
          <icon-minus />
        </template>
      </a-button>
      <a-button class="window-control-btn" type="text" @click="windowMaximizeWindow">
        <template #icon>
          <icon-fullscreen-exit v-if="isMaximized" />
          <icon-expand v-else />
        </template>
      </a-button>
      <a-button class="window-control-btn" type="text" @click="closeWindow">
        <template #icon>
          <icon-close />
        </template>
      </a-button>
    </a-space>
  </div>
</template>
<script setup>
import { ref } from 'vue'

const isMaximized = ref(false)

const minimizeWindow = () => {
  window.electronAPI.windowMinimize()
}

const windowMaximizeWindow = () => {
  window.electronAPI.windowMaximize()
}

const closeWindow = () => {
  window.electronAPI.windowClose()
}
</script>
<style scoped>
.header-bar-container {
  position: absolute;
  top: 0;
  left: 0;
  height: 60px;
  width: 100%;
  -webkit-app-region: drag; /* 启用拖动 */
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 20px;
  z-index: 1000;
  background-color: rgba(255, 255, 255, 0.001); /* 半透明背景 */
  backdrop-filter: blur(10px); /* 背景模糊效果 */
  box-sizing: border-box;
}

.window-control-btn {
  color: var(--color-neutral-8);
  -webkit-app-region: no-drag;
}
</style>
