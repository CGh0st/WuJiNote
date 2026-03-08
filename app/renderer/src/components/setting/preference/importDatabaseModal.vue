<template>
  <a-modal
    v-model:visible="visible"
    :footer="false"
    :closable="false"
    :align-center="true"
    :width="500"
    modal-class="import-db-modal-container"
    @cancel="visible = false"
  >
    <div class="import-db-panel">
      <div class="content-wrapper">
        <div class="icon-wrapper">
          <icon-exclamation-circle-fill :size="24" style="color: rgb(var(--danger-6))" />
        </div>
        <div class="message-content">
          <div class="title">确认导入数据库</div>
          <div class="description">此操作将覆盖当前所有数据，且不可撤销！建议您先备份当前数据。确定要继续导入吗？</div>
        </div>
      </div>
      <div class="action-footer">
        <a-button type="text" size="small" @click="visible = false">取消</a-button>
        <a-button type="primary" status="danger" size="small" :loading="isLoading" @click="handleOk">
          确认导入
        </a-button>
      </div>
    </div>
  </a-modal>
</template>

<script setup>
import { ref } from 'vue'
import { Notification } from '@arco-design/web-vue'
import { IconExclamationCircleFill } from '@arco-design/web-vue/es/icon'

const visible = ref(false)
const isLoading = ref(false)

const showModal = () => {
  visible.value = true
}

const handleOk = async () => {
  isLoading.value = true
  try {
    const result = await window.electronAPI.importDatabase()
    if (result.success) {
      Notification.success({
        content: '数据库已成功导入',
        style: { lineHeight: 'normal' }
      })
      visible.value = false
      // 刷新页面以加载新数据
      setTimeout(() => {
        window.location.reload()
      }, 1000)
    } else {
      if (result.message !== 'Import canceled.') {
        Notification.warning({
          content: result.message,
          style: { lineHeight: 'normal' }
        })
      }
      isLoading.value = false
    }
  } catch (error) {
    Notification.error({
      content: '导入失败: ' + error.message,
      style: { lineHeight: 'normal' }
    })
    isLoading.value = false
  }
}

defineExpose({
  showModal
})
</script>

<style>
/* Global modal override for this specific modal */
.import-db-modal-container {
  background: transparent !important;
  box-shadow: none !important;
  padding: 0 !important;
}

.import-db-modal-container .arco-modal {
  background: transparent !important;
  box-shadow: none !important;
  padding: 0 !important;
}

.import-db-modal-container .arco-modal-header,
.import-db-modal-container .arco-modal-footer {
  display: none;
}

.import-db-modal-container .arco-modal-content {
  background: transparent !important;
  padding: 0 !important;
  border: none !important;
  box-shadow: none !important;
}

.import-db-modal-container .arco-modal-body {
  padding: 0 !important;
  background: transparent !important;
}
</style>

<style scoped>
.import-db-panel {
  background: var(--color-bg-2);
  border-radius: 12px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
  display: flex;
  flex-direction: column;
  overflow: hidden;
  /* border: 1px solid var(--color-border-2); */
}

.content-wrapper {
  display: flex;
  padding: 24px 24px 16px;
  gap: 16px;
}

.icon-wrapper {
  flex-shrink: 0;
  margin-top: 2px;
}

.message-content {
  flex: 1;
}

.title {
  font-size: 16px;
  font-weight: 600;
  color: var(--color-text-1);
  margin-bottom: 8px;
}

.description {
  font-size: 14px;
  color: var(--color-text-2);
  line-height: 1.5;
}

.action-footer {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  padding: 12px 24px 20px;
  background: var(--color-bg-2);
}
</style>
