<template>
  <a-modal
    v-model:visible="visible"
    :footer="false"
    :closable="false"
    :align-center="true"
    :width="480"
    modal-class="delete-note-version-modal-container"
    @cancel="visible = false"
  >
    <div class="delete-note-version-panel">
      <div class="title">删除历史版本</div>
      <div class="divider"></div>
      <div class="description">确认删除当前预览的历史版本？删除后无法恢复。</div>
      <div class="action-footer">
        <button class="btn-cancel" @click="visible = false">取消</button>
        <button class="btn-confirm" :disabled="isLoading" @click="deleteVersion">
          {{ isLoading ? '删除中...' : '确认删除' }}
        </button>
      </div>
    </div>
  </a-modal>
</template>

<script setup>
import { ref } from 'vue'
import { Notification } from '@arco-design/web-vue'

const emit = defineEmits(['version-deleted'])

const visible = ref(false)
const noteId = ref(null)
const versionId = ref(null)
const isLoading = ref(false)

const showModal = (nextNoteId, nextVersionId) => {
  noteId.value = nextNoteId
  versionId.value = nextVersionId
  visible.value = true
}

const deleteVersion = async () => {
  if (isLoading.value) return
  isLoading.value = true
  try {
    const result = await window.electronAPI.deleteNoteVersion(Number(noteId.value), Number(versionId.value))
    if (result?.success && result?.changes > 0) {
      Notification.success({ content: '历史版本已删除', style: { lineHeight: 'normal' } })
      visible.value = false
      emit('version-deleted')
      return
    }
    Notification.error({ content: result?.message || '删除失败', style: { lineHeight: 'normal' } })
  } catch (error) {
    Notification.error({ content: error?.message || '删除失败', style: { lineHeight: 'normal' } })
  } finally {
    isLoading.value = false
  }
}

defineExpose({
  showModal
})
</script>

<style>
.delete-note-version-modal-container {
  background: transparent !important;
  box-shadow: none !important;
  padding: 0 !important;
}

.delete-note-version-modal-container .arco-modal {
  background: transparent !important;
  box-shadow: none !important;
  padding: 0 !important;
  border-radius: 12px;
}

.delete-note-version-modal-container .arco-modal-header,
.delete-note-version-modal-container .arco-modal-footer {
  display: none;
}

.delete-note-version-modal-container .arco-modal-content {
  background: transparent !important;
  padding: 0 !important;
  border: none !important;
  box-shadow: none !important;
}

.delete-note-version-modal-container .arco-modal-body {
  padding: 0 !important;
  background: transparent !important;
}
</style>

<style scoped>
.delete-note-version-panel {
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
