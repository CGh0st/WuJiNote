<template>
  <a-modal
    v-model:visible="visible"
    :footer="false"
    :closable="false"
    :align-center="true"
    :width="500"
    modal-class="delete-repo-modal-container"
    @cancel="visible = false"
  >
    <div class="delete-repo-panel">
      <div class="content-wrapper">
        <div class="icon-wrapper">
          <icon-exclamation-circle-fill :size="24" style="color: rgb(var(--danger-6))" />
        </div>
        <div class="message-content">
          <div class="title">删除知识库</div>
          <div class="description">删除后，笔记将被移动到"未分类"中。确认删除？</div>
        </div>
      </div>
      <div class="action-footer">
        <a-button type="text" size="small" @click="visible = false">取消</a-button>
        <a-button type="primary" status="danger" size="small" :loading="isLoading" @click="deleteRepository">
          确认删除
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
const deleteRepositoryId = ref(null)
const isLoading = ref(false)

const showModal = (id) => {
  visible.value = true
  deleteRepositoryId.value = id
}

const emit = defineEmits(['refresh'])

const deleteRepository = async () => {
  isLoading.value = true
  try {
    const result = await window.electronAPI.deleteRepository(deleteRepositoryId.value)
    if (result) {
      emit('refresh')
      // 触发侧边栏刷新事件
      window.dispatchEvent(new Event('refresh-side-panel-tree'))
      Notification.success({
        content: '删除成功',
        style: { lineHeight: 'normal' }
      })
      visible.value = false
    } else {
      Notification.error({
        content: '删除失败',
        style: { lineHeight: 'normal' }
      })
    }
  } catch (error) {
    Notification.error({
      content: error.message || '删除失败',
      style: { lineHeight: 'normal' }
    })
  } finally {
    isLoading.value = false
  }
}

defineExpose({
  showModal
})
</script>

<style>
/* Global modal override for this specific modal */
.delete-repo-modal-container {
  background: transparent !important;
  box-shadow: none !important;
  padding: 0 !important;
}

.delete-repo-modal-container .arco-modal {
  background: transparent !important;
  box-shadow: none !important;
  padding: 0 !important;
}

.delete-repo-modal-container .arco-modal-header,
.delete-repo-modal-container .arco-modal-footer {
  display: none;
}

.delete-repo-modal-container .arco-modal-content {
  background: transparent !important;
  padding: 0 !important;
  border: none !important;
  box-shadow: none !important;
}

.delete-repo-modal-container .arco-modal-body {
  padding: 0 !important;
  background: transparent !important;
}
</style>

<style scoped>
.delete-repo-panel {
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
