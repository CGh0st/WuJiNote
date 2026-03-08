<template>
  <a-modal
    v-model:visible="visible"
    :footer="false"
    :closable="false"
    :align-center="true"
    :width="500"
    modal-class="delete-note-modal-container"
    @cancel="visible = false"
  >
    <div class="delete-note-panel">
      <div class="content-wrapper">
        <div class="icon-wrapper">
          <icon-exclamation-circle-fill :size="24" style="color: rgb(var(--danger-6))" />
        </div>
        <div class="message-content">
          <div class="title">删除笔记</div>
          <div class="description">确认删除该笔记？已删除的笔记可从回收站找回。</div>
        </div>
      </div>
      <div class="action-footer">
        <a-button type="text" size="small" @click="visible = false">取消</a-button>
        <a-button type="primary" status="danger" size="small" :loading="isLoading" @click="deleteNote">
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

.delete-note-modal-container .arco-modal-body {
  padding: 0 !important;
  background: transparent !important;
}
</style>

<style scoped>
.delete-note-panel {
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
