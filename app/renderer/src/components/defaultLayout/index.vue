<template>
  <div class="layout-container">
    <a-row class="main-row">
      <a-col :flex="3" class="side-col">
        <div class="side-wrapper">
          <div class="menu-wrapper">
            <menu-bar></menu-bar>
          </div>
          <side-panel></side-panel>
        </div>
      </a-col>
      <a-col :flex="9" class="content-col">
        <router-view v-slot="{ Component }">
          <!-- 为组件添加过渡动画 -->
          <transition name="fade">
            <!-- 为组件添加keep-alive特性，帮助缓存页面 -->
            <keep-alive :max="50">
              <component :is="Component"></component>
            </keep-alive>
          </transition>
        </router-view>
      </a-col>
    </a-row>
  </div>
</template>

<script setup>
import MenuBar from './menuBar.vue'
import SidePanel from './sidePanel.vue'
</script>

<style scoped>
.layout-container {
  height: 100vh;
  width: 100vw;
}

.main-row {
  height: 100vh;
  width: 100vw;
  overflow: hidden;
}

.side-col {
  height: 100vh;
  box-shadow: none;
}

.side-wrapper {
  display: flex;
  height: 100%;
}

.menu-wrapper {
  height: 100vh;
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-direction: column;
}

.content-col {
  height: 100vh;
  overflow-y: hidden;
  background: var(--color-bg-1) !important;
  position: relative;
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s;
}

.fade-enter,
.fade-leave-to {
  opacity: 0;
}

:deep(.arco-layout-sider-light) {
  box-shadow: none !important;
}
</style>
