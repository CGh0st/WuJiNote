<template>
  <a-modal
    v-model:visible="visible"
    :footer="false"
    :closable="false"
    :align-center="false"
    :top="150"
    :width="950"
    modal-class="setting-modal-container"
    @cancel="visible = false"
  >
    <div class="setting-panel">
      <div class="close-btn" @click="visible = false">
        <icon-close />
      </div>
      <div class="setting-sidebar">
        <div class="setting-header">
          <div class="setting-title">设置</div>
        </div>
        <div class="setting-menu">
          <div
            v-for="item in menuItems"
            :key="item.key"
            :class="['menu-item', { active: activeKey === item.key }]"
            @click="activeKey = item.key"
          >
            <component :is="item.icon" />
            <span>{{ item.title }}</span>
          </div>
        </div>
      </div>
      <div class="setting-content">
        <repository-setting v-if="activeKey === '1'" />
        <note-setting v-if="activeKey === '2'" @close="visible = false" />
        <preference-setting v-if="activeKey === '3'" />
        <about v-if="activeKey === '4'" />
      </div>
    </div>
  </a-modal>
</template>

<script setup>
import { ref } from 'vue'
import { IconStorage, IconFile, IconSettings, IconInfoCircle, IconClose } from '@arco-design/web-vue/es/icon'
import RepositorySetting from './repository/index.vue'
import NoteSetting from './note/index.vue'
import PreferenceSetting from './preference/index.vue'
import About from './about/index.vue'

const visible = ref(false)
const activeKey = ref('1')

const menuItems = [
  { key: '1', title: '知识库管理', icon: IconStorage },
  { key: '2', title: '笔记管理', icon: IconFile },
  { key: '3', title: '偏好设置', icon: IconSettings },
  { key: '4', title: '关于吾记', icon: IconInfoCircle }
]

const showModal = () => {
  visible.value = true
}

defineExpose({
  showModal
})
</script>

<style>
/* Global modal override for this specific modal */
.setting-modal-container {
  background: transparent !important;
  box-shadow: none !important;
  padding: 0 !important;
}

.setting-modal-container .arco-modal {
  background: transparent !important;
  box-shadow: none !important;
  padding: 0 !important;
}

.setting-modal-container .arco-modal-header,
.setting-modal-container .arco-modal-footer {
  display: none;
}

.setting-modal-container .arco-modal-content {
  background: transparent !important;
  padding: 0 !important;
  border: none !important;
  box-shadow: none !important;
}

.setting-modal-container .arco-modal-body {
  padding: 0 !important;
  background: transparent !important;
}
</style>

<style scoped>
.setting-panel {
  background: var(--color-bg-2);
  border-radius: 12px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
  display: flex;
  overflow: hidden;
  height: 600px;
  position: relative;
  /* border: 1px solid var(--color-border-2); */
}

.close-btn {
  position: absolute;
  top: 16px;
  right: 16px;
  width: 28px;
  height: 28px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 4px;
  cursor: pointer;
  color: var(--color-text-3);
  transition: all 0.2s;
  z-index: 10;
}

.close-btn:hover {
  background-color: var(--color-fill-2);
  color: var(--color-text-1);
}

.setting-sidebar {
  width: 200px;
  background: var(--color-fill-1);
  border-right: 1px solid var(--color-border-1);
  display: flex;
  flex-direction: column;
}

.setting-header {
  padding: 20px 16px 12px;
}

.setting-title {
  font-size: 18px;
  font-weight: 600;
  color: var(--color-text-1);
}

.setting-menu {
  padding: 8px;
  flex: 1;
}

.menu-item {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 12px;
  border-radius: 6px;
  cursor: pointer;
  color: var(--color-text-2);
  font-size: 14px;
  transition: all 0.2s;
  margin-bottom: 2px;
}

.menu-item:hover {
  background: var(--color-fill-3);
  color: var(--color-text-1);
}

.menu-item.active {
  background: var(--color-fill-3);
  color: var(--color-text-1);
  font-weight: 500;
}

.setting-content {
  flex: 1;
  overflow-y: auto;
  padding: 72px 24px 24px;
}
</style>
