<template>
  <div class="preference-setting">
    <!-- 常规设置 -->
    <div class="section-title">常规</div>

    <div class="setting-item">
      <div class="item-left">
        <div class="icon-wrapper">
          <icon-skin />
        </div>
        <div class="text-content">
          <div class="item-title">应用程序主题</div>
          <div class="item-desc">切换应用程序的明亮/暗黑模式</div>
        </div>
      </div>
      <div class="item-right">
        <a-switch :model-value="settingsStore.isDarkMode" @change="settingsStore.toggleDarkMode">
          <template #checked> 暗黑 </template>
          <template #unchecked> 明亮 </template>
        </a-switch>
      </div>
    </div>

    <!-- 数据管理 -->
    <div class="section-title">数据管理</div>

    <div class="setting-item">
      <div class="item-left">
        <div class="icon-wrapper">
          <icon-storage />
        </div>
        <div class="text-content">
          <div class="item-title">数据库状态</div>
          <div class="item-desc">
            <a-space size="small">
              <a-tag size="small" :color="databaseStatus.exists ? 'green' : 'red'">
                {{ databaseStatus.exists ? '正常' : '缺失' }}
              </a-tag>
              <span>{{ formatSize(databaseStatus.size) }}</span>
            </a-space>
            <div class="path-info" :title="databaseStatus.path">{{ databaseStatus.path || '未知路径' }}</div>
          </div>
        </div>
      </div>
      <div class="item-right">
        <a-button type="primary" @click="checkDatabase">
          <template #icon><icon-refresh /></template>
          刷新
        </a-button>
      </div>
    </div>

    <div class="setting-item">
      <div class="item-left">
        <div class="icon-wrapper">
          <icon-save />
        </div>
        <div class="text-content">
          <div class="item-title">数据备份</div>
          <div class="item-desc">将当前数据库备份到指定位置，防止数据丢失</div>
        </div>
      </div>
      <div class="item-right">
        <a-button type="primary" @click="backupDatabase">立即备份</a-button>
      </div>
    </div>

    <div class="setting-item">
      <div class="item-left">
        <div class="icon-wrapper">
          <icon-import />
        </div>
        <div class="text-content">
          <div class="item-title">导入数据库</div>
          <div class="item-desc">从备份文件恢复数据库（警告：当前数据将被覆盖）</div>
        </div>
      </div>
      <div class="item-right">
        <a-button status="danger" @click="importDatabase">导入数据</a-button>
      </div>
    </div>

    <ImportDatabaseModal ref="importModalRef" />
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useSettingsStore } from '../../../store'
import { Notification } from '@arco-design/web-vue'
import { IconSkin, IconStorage, IconSave, IconRefresh, IconImport } from '@arco-design/web-vue/es/icon'
import ImportDatabaseModal from './importDatabaseModal.vue'

const settingsStore = useSettingsStore()
const importModalRef = ref(null)
const databaseStatus = ref({
  exists: false,
  path: '',
  size: 0
})

const formatSize = (bytes) => {
  if (bytes === 0) return '0 B'
  const k = 1024
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}

const checkDatabase = async () => {
  try {
    const status = await window.electronAPI.checkDatabaseStatus()
    databaseStatus.value = status
  } catch (error) {
    Notification.error({
      content: '获取数据库状态失败: ' + error.message
    })
  }
}

const backupDatabase = async () => {
  try {
    const result = await window.electronAPI.backupDatabase()
    if (result.success) {
      Notification.success({
        title: '数据库备份成功',
        content: `已保存至: ${result.path}`
      })
    } else if (result.message && result.message !== 'Backup canceled.') {
      Notification.warning({
        content: result.message
      })
    }
  } catch (error) {
    Notification.error({
      content: '备份失败: ' + error.message
    })
  }
}

const importDatabase = () => {
  importModalRef.value.showModal()
}

onMounted(() => {
  checkDatabase()
})
</script>

<style scoped>
.preference-setting {
  padding: 0 10px;
}

.section-title {
  margin: 20px 0 12px 0;
  font-size: 14px;
  color: var(--color-text-2);
}

.section-title:first-child {
  margin-top: 0;
}

.setting-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 20px;
  background-color: var(--color-fill-2);
  border-radius: 8px;
  margin-bottom: 12px;
  transition: all 0.2s;
}

.setting-item:hover {
  background-color: var(--color-fill-3);
}

.item-left {
  display: flex;
  align-items: center;
  gap: 16px;
  flex: 1;
  min-width: 0; /* 防止文本溢出撑开 */
}

.icon-wrapper {
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 18px;
  color: var(--color-text-1);
}

.text-content {
  display: flex;
  flex-direction: column;
  flex: 1;
  min-width: 0;
}

.item-title {
  font-size: 14px;
  font-weight: 500;
  color: var(--color-text-1);
  margin-bottom: 4px;
}

.item-desc {
  font-size: 12px;
  color: var(--color-text-3);
  line-height: 1.5;
}

.path-info {
  margin-top: 4px;
  opacity: 0.8;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 400px;
}

.item-right {
  margin-left: 20px;
  flex-shrink: 0;
}
</style>
