<template>
  <div class="about-container">
    <div class="app-info">
      <img :src="logo" alt="WuJiNote Logo" class="app-logo" />
      <div class="app-name">吾记 (WuJiNote)</div>
      <div class="app-version">当前版本：v{{ version }}</div>
      <div class="app-description">
        吾记，记录吾言。一款简洁、高效的本地笔记应用，专注于提供极致的写作体验，助您随时随地捕捉灵感。
      </div>
    </div>

    <div class="action-section">
      <a-space :size="20">
        <a-button type="primary" shape="round" @click="checkUpdate">
          <template #icon><icon-refresh /></template>
          检查更新
        </a-button>
        <a-button shape="round" @click="openGithub">
          <template #icon><icon-github /></template>
          开源主页
        </a-button>
      </a-space>
    </div>

    <div class="footer">
      <p>Copyright © {{ currentYear }} WuJiNote Team. All Rights Reserved.</p>
      <p class="tech-stack">Powered by Electron, Vue 3 & Arco Design</p>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import logo from '../../../assets/logo.svg'
import { IconRefresh, IconGithub } from '@arco-design/web-vue/es/icon'
import { Notification } from '@arco-design/web-vue'

const version = ref('1.0.0')
const currentYear = new Date().getFullYear()

const checkUpdate = () => {
  Notification.info({
    content: '当前已是最新版本'
  })
}

const openGithub = () => {
  // 尝试使用 window.open 打开链接
  // 注意：在 Electron 生产环境中，通常需要主进程配置 setWindowOpenHandler 来调用 shell.openExternal
  window.open('https://github.com/imzbf/WuJiNote', '_blank')
}
</script>

<style scoped>
.about-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100%;
  padding: 40px;
  color: var(--color-text-1);
  background-color: var(--color-bg-6);
  box-sizing: border-box;
}

.app-info {
  text-align: center;
  margin-bottom: 40px;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.app-logo {
  width: 120px;
  height: 120px;
  margin-bottom: 24px;
  transition: transform 0.3s ease;
  filter: drop-shadow(0 0 10px rgba(var(--primary-6), 0.3));
}

.app-logo:hover {
  transform: scale(1.05) rotate(5deg);
}

.app-name {
  font-size: 28px;
  font-weight: 700;
  margin-bottom: 12px;
  background: linear-gradient(120deg, rgb(var(--primary-6)), rgb(var(--success-6)));
  -webkit-background-clip: text;
  background-clip: text;
  color: transparent;
  letter-spacing: 1px;
}

.app-version {
  font-size: 13px;
  color: var(--color-text-3);
  margin-bottom: 24px;
  background: var(--color-fill-2);
  padding: 4px 12px;
  border-radius: 12px;
}

.app-description {
  font-size: 15px;
  color: var(--color-text-2);
  max-width: 480px;
  line-height: 1.6;
  text-align: center;
}

.action-section {
  margin-bottom: auto; /* 让 footer 沉底 */
}

.footer {
  margin-top: 40px;
  text-align: center;
  color: var(--color-text-4);
  font-size: 12px;
}

.tech-stack {
  margin-top: 8px;
  opacity: 0.7;
}
</style>
