<template>
  <a-modal
    v-model:visible="visible"
    :footer="false"
    :closable="false"
    :align-center="false"
    :top="100"
    :width="600"
    modal-class="move-note-modal-container"
    @cancel="visible = false"
    @open="handleOpen"
  >
    <div class="move-note-panel">
      <div class="input-wrapper">
        <div class="repo-select-wrapper">
          <icon-folder :size="18" class="icon" />
          <a-select v-model="selectedRepo" placeholder="选择知识库" :bordered="false" class="repo-select">
            <a-option v-for="repo in repositories" :key="repo.id" :value="repo.id">{{ repo.name }}</a-option>
          </a-select>
        </div>

        <div class="divider"></div>

        <div class="title-input-wrapper">
          <icon-edit :size="18" class="icon" />
          <input
            ref="titleInputRef"
            v-model="noteTitle"
            class="title-input"
            placeholder="输入笔记标题..."
            @keydown.enter="moveNote"
            @keydown.esc="visible = false"
          />
        </div>

        <div class="actions">
          <div class="enter-hint" @click="moveNote">
            <icon-right />
          </div>
        </div>
      </div>
    </div>
  </a-modal>
</template>

<script setup>
import { ref, nextTick } from 'vue'
import { Notification } from '@arco-design/web-vue'
import { IconFolder, IconEdit, IconRight } from '@arco-design/web-vue/es/icon'

const props = defineProps({
  noteId: {
    type: [Number, String],
    required: true
  }
})

const emit = defineEmits(['note-moved'])

const visible = ref(false)
const repositories = ref([])
const selectedRepo = ref('')
const noteTitle = ref('')
const titleInputRef = ref(null)

const fetchRepositories = async () => {
  try {
    const repos = await window.electronAPI.getAllRepositories()
    repositories.value = repos.filter((repo) => repo.id !== 0)
  } catch (error) {
    console.error('Failed to fetch repositories:', error)
  }
}

const fetchNoteDetails = async () => {
  try {
    const note = await window.electronAPI.getNoteById(Number(props.noteId))
    if (note) {
      selectedRepo.value = note.repositoryId
      noteTitle.value = note.title
    }
  } catch (error) {
    console.error('Failed to fetch note details:', error)
  }
}

const showModal = async () => {
  await Promise.all([fetchRepositories(), fetchNoteDetails()])
  visible.value = true
}

const handleOpen = () => {
  nextTick(() => {
    titleInputRef.value?.focus()
  })
}

const moveNote = async () => {
  if (!selectedRepo.value || !noteTitle.value) {
    Notification.warning({
      content: '请填写完整信息',
      style: { lineHeight: 'normal' }
    })
    return
  }

  try {
    const result = await window.electronAPI.updateNote(Number(props.noteId), noteTitle.value, selectedRepo.value)
    if (result && result.changes > 0) {
      Notification.success({
        content: '笔记移动成功',
        style: { lineHeight: 'normal' }
      })
      window.dispatchEvent(new Event('refresh-side-panel-tree'))
      emit('note-moved')
      visible.value = false
    } else {
      // Even if changes is 0 (e.g. no change in data), we might want to close if it was successful logic-wise?
      // But typically update returns changes=0 if data matches.
      // Let's assume strict check for now, or maybe just success if no error thrown.
      // If user didn't change anything and pressed enter, we should probably just close.
      Notification.info({
        content: '未检测到变更',
        style: { lineHeight: 'normal' }
      })
      visible.value = false
    }
  } catch (error) {
    console.error('Failed to move note:', error)
    Notification.error({
      content: '移动失败: ' + error.message,
      style: { lineHeight: 'normal' }
    })
  }
}

defineExpose({
  showModal
})
</script>

<style>
/* Global modal override for this specific modal */
.move-note-modal-container {
  background: transparent !important;
  box-shadow: none !important;
  padding: 0 !important;
}

.move-note-modal-container .arco-modal {
  background: transparent !important;
  box-shadow: none !important;
  padding: 0 !important;
}

.move-note-modal-container .arco-modal-header,
.move-note-modal-container .arco-modal-footer {
  display: none;
}

.move-note-modal-container .arco-modal-content {
  background: transparent !important;
  padding: 0 !important;
  border: none !important;
  box-shadow: none !important;
}

.move-note-modal-container .arco-modal-body {
  padding: 0 !important;
  background: transparent !important;
}
</style>

<style scoped>
.move-note-panel {
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
  background: var(--color-bg-2);
  height: 38px;
}

.repo-select-wrapper,
.title-input-wrapper {
  display: flex;
  align-items: center;
}

.repo-select-wrapper {
  width: 180px;
  flex-shrink: 0;
}

.title-input-wrapper {
  flex: 1;
}

.icon {
  color: var(--color-neutral-6);
  margin-right: 8px;
}

.repo-select {
  width: 100%;
  background: transparent !important;
}

:deep(.arco-select-view-single) {
  background-color: transparent !important;
  padding-left: 0;
}

.divider {
  width: 1px;
  height: 24px;
  background-color: var(--color-border-2);
  margin: 0 16px;
}

.title-input {
  flex: 1;
  border: none;
  outline: none;
  font-size: 15px;
  background: transparent;
  color: var(--color-text-1);
  width: 100%;
}

.title-input::placeholder {
  color: var(--color-neutral-4);
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
