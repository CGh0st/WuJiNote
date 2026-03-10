<template>
  <div ref="containerRef" class="container">
    <div ref="excalidrawRef" class="excalidraw-wrapper"></div>
  </div>
</template>

<script setup>
import { onMounted, onUnmounted, watch, nextTick, ref } from 'vue'
import { useSettingsStore } from '../store'
import React from 'react'
import { createRoot } from 'react-dom/client'
import { Excalidraw } from '@excalidraw/excalidraw'
import '@excalidraw/excalidraw/index.css'

const settingsStore = useSettingsStore()
const containerRef = ref(null)
const excalidrawRef = ref(null)
let root = null
let excalidrawAPI = null

const handleDrawingChange = (elements, state) => {
  const appState = { ...state }
  delete appState.collaborators
  localStorage.setItem('excalidrawElements', JSON.stringify({ elements, appState }))
}

const initializeExcalidraw = () => {
  if (!excalidrawRef.value) return

  const savedElements = localStorage.getItem('excalidrawElements')

  let initialData = {
    elements: [],
    appState: {
      defaultBackgroundColor: '#f8f9fa',
      // viewBackgroundColor: '#f8f9fa',
      currentItemStrokeColor: '#000000',
      currentItemBackgroundColor: '#ffffff',
      activeTool: 'selection',
      zoom: 1
    }
  }

  if (savedElements) {
    try {
      const parsed = JSON.parse(savedElements)
      if (parsed.elements) initialData.elements = parsed.elements
      if (parsed.appState) {
        initialData.appState = { ...initialData.appState, ...parsed.appState }
      }
    } catch (e) {
      console.error('Failed to parse saved elements', e)
      localStorage.removeItem('excalidrawElements')
    }
  }

  const theme = settingsStore.isDarkMode ? 'dark' : 'light'

  try {
    const excalidrawElement = React.createElement(Excalidraw, {
      initialData: initialData,
      onChange: handleDrawingChange,
      excalidrawAPI: (api) => {
        excalidrawAPI = api
      },
      langCode: 'zh-CN',
      theme: theme
    })

    if (!root) {
      root = createRoot(excalidrawRef.value)
    }
    root.render(excalidrawElement)
  } catch (error) {
    console.error('Failed to render Excalidraw:', error)
    // 如果渲染失败，可能是由于存储的状态数据损坏，尝试清除
    localStorage.removeItem('excalidrawElements')
  }
}

onMounted(() => {
  // Use nextTick and a small delay to ensure DOM is fully rendered and styled
  nextTick(() => {
    setTimeout(() => {
      initializeExcalidraw()
    }, 350)
  })
})

onUnmounted(() => {
  if (root) {
    root.unmount()
    root = null
  }
})

watch(
  () => settingsStore.isDarkMode,
  (newVal) => {
    const theme = newVal ? 'dark' : 'light'
    if (excalidrawAPI) {
      excalidrawAPI.updateScene({ appState: { theme } })
    }
  }
)
</script>

<style scoped lang="scss">
.container {
  width: 100%;
  height: 100%;
  overflow: hidden;
  position: relative;
}

.excalidraw-wrapper {
  width: 100%;
  height: 100%;
  position: absolute;
  top: 0;
  left: 0;
}
</style>
