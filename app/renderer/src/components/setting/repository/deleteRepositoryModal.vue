<template>
  <a-modal
    v-model:visible="visible"
    :footer="false"
    :closable="false"
    :align-center="true"
    :width="480"
    modal-class="delete-repo-modal-container"
    @cancel="visible = false"
  >
    <div class="delete-repo-panel">
      <div class="title">删除知识库</div>
      <div class="divider"></div>
      <div class="description">删除后，笔记将被移动到"未分类"中。确认删除？</div>
      <div class="action-footer">
        <button class="btn-cancel" @click="visible = false">取消</button>
        <button class="btn-confirm" :disabled="isLoading" @click="deleteRepository">
          {{ isLoading ? '删除中...' : '确定' }}
        </button>
      </div>
    </div>
  </a-modal>
</template>

<script setup>
import { ref } from 'vue'
import { Notification } from '@arco-design/web-vue'

const visible = ref(false)
const deleteRepositoryId = ref(null)
const isLoading = ref(false)

const showModal = (id) => {
  visible.value = true
  deleteRepositoryId.value = id
}

const emit = defineEmits(['refresh'])

const deleteRepository = async () => {
  if (isLoading.value) return
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
  border-radius: 12px;
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
</style>

<style scoped>
.delete-repo-panel {
  background: var(--color-bg-2);
  border-radius: 12px;
  box-shadow: 0 4px 24px rgba(0, 0, 0, 0.1);
  display: flex;
  flex-direction: column;
  padding: 22px;
  width: 100%;
  box-sizing: border-box;
}

.title {
  font-size: 1.25rem;
  font-weight: 600;
  color: var(--color-text-1);
  margin-bottom: 24px;
}

.divider {
  height: 1px;
  background-color: var(--color-border-2);
  margin-bottom: 24px;
  width: 100%;
}

.description {
  font-size: 14px;
  color: var(--color-text-2);
  margin-bottom: 48px;
  line-height: 1.6;
}

.action-footer {
  display: flex;
  justify-content: flex-end;
  gap: 16px;
}

.btn-cancel {
  padding: 10px 32px;
  background: var(--color-bg-2);
  border: 1px solid var(--color-border-2);
  border-radius: 8px;
  font-size: 16px;
  cursor: pointer;
  color: var(--color-text-1);
  font-weight: 600;
  transition: all 0.2s;
}

.btn-cancel:hover {
  background: var(--color-fill-2);
  border-color: var(--color-border-3);
}

.btn-confirm {
  padding: 10px 32px;
  background: rgb(var(--danger-6));
  border: none;
  border-radius: 8px;
  font-size: 16px;
  cursor: pointer;
  color: white;
  font-weight: 600;
  box-shadow: 0 4px 12px rgba(var(--danger-6), 0.3);
  transition: all 0.2s;
}

.btn-confirm:hover {
  background: rgb(var(--danger-5));
}

.btn-confirm:disabled {
  background: var(--color-neutral-4);
  cursor: not-allowed;
  box-shadow: none;
}
</style>
