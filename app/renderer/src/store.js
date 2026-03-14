import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useSettingsStore = defineStore('settings', () => {
  const isDarkMode = ref(true)
  const backgroundMaterial = ref('mica')
  // 跟随系统颜色设置
  function InitDarkMode() {
    if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
      document.body.setAttribute('arco-theme', 'dark')
      isDarkMode.value = true
    } else {
      document.body.setAttribute('arco-theme', 'light')
      isDarkMode.value = false
    }
    window.electronAPI.initDarkMode()
  }
  // 更改颜色设置
  function toggleDarkMode() {
    if (isDarkMode.value === true) {
      document.body.setAttribute('arco-theme', 'light')
      isDarkMode.value = false
      console.log('切换为明亮模式')
    } else {
      document.body.setAttribute('arco-theme', 'dark')
      isDarkMode.value = true
      console.log('切换为暗黑模式')
    }
    window.electronAPI.toggleDarkMode()
  }

  async function InitBackgroundMaterial() {
    const saved = localStorage.getItem('backgroundMaterial')
    const initial = saved || 'mica'
    backgroundMaterial.value = initial
    if (window.electronAPI?.setBackgroundMaterial) {
      await window.electronAPI.setBackgroundMaterial(initial)
    }
  }

  async function setBackgroundMaterial(material) {
    const next = material || 'mica'
    backgroundMaterial.value = next
    localStorage.setItem('backgroundMaterial', next)
    if (window.electronAPI?.setBackgroundMaterial) {
      return await window.electronAPI.setBackgroundMaterial(next)
    }
    return { success: false, message: 'electronAPI not available.' }
  }

  return { isDarkMode, toggleDarkMode, InitDarkMode, backgroundMaterial, InitBackgroundMaterial, setBackgroundMaterial }
})
