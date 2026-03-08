import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useSettingsStore = defineStore('settings', () => {
  const isDarkMode = ref(true)
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

  return { isDarkMode, toggleDarkMode, InitDarkMode }
})
