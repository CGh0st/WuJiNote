<template>
  <a-modal
    v-model:visible="visible"
    :footer="false"
    :closable="false"
    :align-center="true"
    :width="480"
    modal-class="delete-note-modal-container"
    @cancel="visible = false"
  >
    <div class="delete-note-panel">
      <div class="title">删除笔记</div>
      <div class="divider"></div>
      <div class="description">确认删除该笔记？已删除的笔记可从回收站找回。</div>
      <div class="action-footer">
        <button class="btn-cancel" @click="visible = false">取消</button>
        <button class="btn-confirm" :disabled="isLoading" @click="deleteNote">
          {{ isLoading ? '删除中...' : '确认删除' }}
        </button>
      </div>
    </div>
  </a-modal>
</template>

<script setup>
import { ref } from 'vue'
import { Notification } from '@arco-design/web-vue'

const props = defineProps({
  noteId: {
    type: [Number, String],
    default: null
  }
})

const visible = ref(false)
const deleteNoteId = ref(null)
const isLoading = ref(false)

const emit = defineEmits(['refresh', 'note-deleted'])

const showModal = (id) => {
  visible.value = true
  if (id) {
    deleteNoteId.value = id
  } else {
    deleteNoteId.value = props.noteId
  }
}

const deleteNote = async () => {
  if (isLoading.value) return
  isLoading.value = true
  try {
    const result = await window.electronAPI.deleteNote(Number(deleteNoteId.value))
    if (result) {
      emit('refresh')
      emit('note-deleted')
      // Trigger global refresh for side panel
      window.dispatchEvent(new Event('refresh-side-panel-tree'))
      Notification.success({
        content: '笔记已删除至回收站',
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
      content: '删除笔记失败: ' + error.message,
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
.delete-note-modal-container {
  background: transparent !important;
  box-shadow: none !important;
  padding: 0 !important;
}

.delete-note-modal-container .arco-modal {
  background: transparent !important;
  box-shadow: none !important;
  padding: 0 !important;
  border-radius: 12px;
}

.delete-note-modal-container .arco-modal-header,
.delete-note-modal-container .arco-modal-footer {
  display: none;
}

.delete-note-modal-container .arco-modal-content {
  background: transparent !important;
  padding: 0 !important;
  border: none !important;
  box-shadow: none !important;
}
</style>

<style scoped>
.delete-note-panel {
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
