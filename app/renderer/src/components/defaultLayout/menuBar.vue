<template>
  <div class="menu-bar-container">
    <div class="menu-top">
      <a-avatar :size="28" shape="square" class="logo-avatar">
        <img :src="logo" alt="logo" class="logo-img" />
      </a-avatar>
      <a-button class="menu-btn" type="text" @click="router.push('/home')">
        <template #icon>
          <icon-list :size="18" />
        </template>
      </a-button>
      <a-button class="menu-btn" type="text" @click="router.push('/recycleBin')">
        <template #icon>
          <icon-delete :size="18" />
        </template>
      </a-button>
      <a-button class="menu-btn" type="text" @click="showNoteSettingModal">
        <template #icon>
          <icon-settings :size="18" />
        </template>
      </a-button>
    </div>
    <div class="menu-bottom">
      <a-button class="theme-btn" type="text" @click="toggleTheme">
        <template #icon>
          <icon-sun :size="18" />
        </template>
      </a-button>
    </div>
  </div>
  <setting ref="noteSettingModalRef"></setting>
</template>

<script setup>
import router from '../../router.js'
import { useSettingsStore } from '../../store'
import { ref, onMounted } from 'vue'
import Setting from '../setting/index.vue'
import logo from '../../assets/logo.svg'

const settingsStore = useSettingsStore()
const noteSettingModalRef = ref()
const showNoteSettingModal = () => {
  noteSettingModalRef.value.showModal()
}

const toggleTheme = () => {
  settingsStore.toggleDarkMode()
}

onMounted(() => {
  settingsStore.InitDarkMode()
})
</script>

<style scoped>
.menu-bar-container {
  width: 50px;
  height: 100vh;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  align-items: center;
  box-shadow: 1px 0 3px rgba(0, 0, 0, 0.1);

  -webkit-app-region: drag;
  position: relative;
  z-index: 10;
}

.menu-top {
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 100%;
}

.menu-bottom {
  width: 100%;
  display: flex;
  justify-content: center;
}

.logo-avatar {
  margin-top: 16px;
  background-color: transparent;
}

.logo-img {
  width: 100%;
  height: 100%;
}

.menu-btn {
  margin-top: 10px;
  color: var(--color-neutral-8);
  -webkit-app-region: no-drag;
}

.theme-btn {
  margin-bottom: 10px;
  color: var(--color-neutral-8);
  -webkit-app-region: no-drag;
}
</style>
