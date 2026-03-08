<template>
  <a-modal
    v-model:visible="visible"
    :footer="false"
    :closable="false"
    :align-center="false"
    :top="100"
    :width="600"
    modal-class="export-note-modal-container"
    @cancel="handleCancel"
    @open="handleOpen"
  >
    <div class="export-note-panel">
      <div class="input-wrapper">
        <div class="select-wrapper">
          <icon-export :size="18" class="icon" />
          <a-select
            ref="selectRef"
            v-model="form.format"
            placeholder="选择导出格式"
            :bordered="false"
            class="format-select"
            @keydown.enter="exportNote"
            @keydown.esc="visible = false"
          >
            <a-option value="markdown">
              <span class="option-content">
                <icon-drive-file class="option-icon" />
                Markdown
              </span>
            </a-option>
            <a-option value="word">
              <span class="option-content">
                <icon-file class="option-icon" />
                Word
              </span>
            </a-option>
            <a-option value="pdf">
              <span class="option-content">
                <icon-file-pdf class="option-icon" />
                PDF
              </span>
            </a-option>
          </a-select>
        </div>

        <div class="actions">
          <div class="enter-hint" @click="exportNote">
            <icon-right />
          </div>
        </div>
      </div>
    </div>
  </a-modal>
</template>

<script setup>
import { ref, nextTick } from 'vue'
import { Notification, Message } from '@arco-design/web-vue'
import { IconExport, IconRight, IconDriveFile, IconFile, IconFilePdf } from '@arco-design/web-vue/es/icon'

const visible = ref(false)
const isLoading = ref(false)
const currentNoteId = ref(null)
const form = ref({
  format: 'markdown'
})
const selectRef = ref(null)

const showModal = (noteId) => {
  currentNoteId.value = noteId
  visible.value = true
  form.value.format = 'markdown' // 重置默认选项
}

const handleOpen = () => {
  nextTick(() => {
    selectRef.value?.focus()
  })
}

const handleCancel = () => {
  visible.value = false
  isLoading.value = false
}

const exportNote = async () => {
  if (!currentNoteId.value) {
    Notification.error({ content: '未指定要导出的笔记' })
    return
  }

  isLoading.value = true
  const msg = Message.warning({
    content: '正在导出...',
    duration: 0
  })

  try {
    const result = await window.electronAPI.exportNote(currentNoteId.value, form.value.format)

    msg.close()

    if (result) {
      Notification.success({
        content: '导出成功',
        duration: 2000
      })
      visible.value = false
    }
  } catch (error) {
    msg.close()
    console.error('Export failed:', error)
    Notification.error({
      content: error.message || '发生未知错误'
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
.export-note-modal-container {
  background: transparent !important;
  box-shadow: none !important;
  padding: 0 !important;
}

.export-note-modal-container .arco-modal {
  background: transparent !important;
  box-shadow: none !important;
  padding: 0 !important;
}

.export-note-modal-container .arco-modal-header,
.export-note-modal-container .arco-modal-footer {
  display: none;
}

.export-note-modal-container .arco-modal-content {
  background: transparent !important;
  padding: 0 !important;
  border: none !important;
  box-shadow: none !important;
}

.export-note-modal-container .arco-modal-body {
  padding: 0 !important;
  background: transparent !important;
}
</style>

<style scoped>
.export-note-panel {
  background: var(--color-bg-2);
  border-radius: 12px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.input-wrapper {
  display: flex;
  align-items: center;
  padding: 12px 16px;
  height: 56px;
  box-sizing: border-box;
}

.select-wrapper {
  display: flex;
  align-items: center;
  flex: 1;
}

.icon {
  color: var(--color-text-2);
  margin-right: 12px;
}

.format-select {
  flex: 1;
  background: transparent !important;
}

:deep(.arco-select-view-single) {
  background-color: transparent !important;
  padding-left: 0;
  border: none;
}

.option-content {
  display: flex;
  align-items: center;
}

.option-icon {
  margin-right: 8px;
  font-size: 16px;
}

.actions {
  display: flex;
  align-items: center;
  margin-left: 12px;
}

.enter-hint {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 28px;
  height: 28px;
  border: 1px solid var(--color-neutral-3);
  border-radius: 6px;
  color: var(--color-neutral-4);
  cursor: pointer;
  transition: all 0.2s;
}

.enter-hint:hover {
  background-color: var(--color-fill-2);
  color: var(--color-text-1);
}
</style>
