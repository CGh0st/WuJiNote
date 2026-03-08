<template>
  <a-modal
    v-model:visible="visible"
    :footer="false"
    :closable="false"
    :align-center="false"
    :top="100"
    :width="600"
    modal-class="create-note-modal-container"
    @cancel="handleClose"
    @open="handleOpen"
  >
    <div class="create-note-panel">
      <div class="input-wrapper">
        <div class="repo-selector">
          <a-select v-model="form.repositoryId" placeholder="选择知识库" :bordered="false" :style="{ width: '200px' }">
            <template #prefix>
              <icon-folder />
            </template>
            <a-option v-for="repo in repositories" :key="repo.value" :value="repo.value">
              {{ repo.label }}
            </a-option>
          </a-select>
        </div>
        <div class="divider"></div>
        <input
          ref="titleInputRef"
          v-model="form.noteTitle"
          class="title-input"
          placeholder="输入笔记标题，按回车创建..."
          @keydown.enter="createNewNote"
          @keydown.esc="handleClose"
        />
        <div class="actions">
          <a-spin v-if="isLoading" :size="16" />
          <div v-else class="enter-hint" @click="createNewNote">
            <icon-right />
          </div>
        </div>
      </div>
    </div>
  </a-modal>
</template>

<script setup>
import { ref, nextTick } from 'vue'
import { useRouter } from 'vue-router'
import { Notification } from '@arco-design/web-vue'

const router = useRouter()
const visible = ref(false)
const isLoading = ref(false)
const titleInputRef = ref(null)

const repositories = ref([])
const form = ref({
  repositoryId: null,
  noteTitle: ''
})

const getAllRepositories = async () => {
  const result = await window.electronAPI.getAllRepositories()
  if (result && result.length > 0) {
    repositories.value = result
      .filter((r) => r.id >= 1)
      .map((r) => ({
        label: r.name,
        value: r.id
      }))

    // Auto-select first repository if none selected
    if (!form.value.repositoryId && repositories.value.length > 0) {
      form.value.repositoryId = repositories.value[0].value
    }
  }
}

const showModal = () => {
  visible.value = true
  form.value.noteTitle = ''
  getAllRepositories()
}

const handleOpen = () => {
  nextTick(() => {
    titleInputRef.value?.focus()
  })
}

const handleClose = () => {
  visible.value = false
}

const createNewNote = async () => {
  // Manual validation
  if (!form.value.repositoryId) {
    Notification.warning({ content: '请选择知识库' })
    return
  }
  if (!form.value.noteTitle || form.value.noteTitle.trim() === '') {
    Notification.warning({ content: '请输入笔记标题' })
    return
  }
  if (form.value.noteTitle.length > 50) {
    Notification.warning({ content: '笔记标题不能超过50个字符' })
    return
  }

  isLoading.value = true
  try {
    const noteId = await window.electronAPI.addNewNote(form.value.noteTitle, form.value.repositoryId)
    if (noteId) {
      Notification.success({
        content: '新建笔记成功，正在跳转...',
        duration: 2000
      })
      window.dispatchEvent(new Event('refresh-side-panel-tree'))

      setTimeout(() => {
        visible.value = false
        isLoading.value = false
        router.push({ name: 'noteEditor', params: { id: noteId }, query: { edit: 'true' } })
      }, 500)
    }
  } catch (error) {
    console.error(error)
    Notification.error({
      content: '新建笔记失败',
      duration: 3000
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
.create-note-modal-container {
  background: transparent !important;
  box-shadow: none !important;
  padding: 0 !important;
}

.create-note-modal-container .arco-modal {
  background: transparent !important;
  box-shadow: none !important;
  padding: 0 !important;
}

.create-note-modal-container .arco-modal-header,
.create-note-modal-container .arco-modal-footer {
  display: none;
}

.create-note-modal-container .arco-modal-content {
  background: transparent !important;
  padding: 0 !important;
  border: none !important;
  box-shadow: none !important;
}

.create-note-modal-container .arco-modal-body {
  padding: 0 !important;
  background: transparent !important;
}
</style>

<style scoped>
.create-note-panel {
  background: var(--color-bg-2);
  border-radius: 12px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
  display: flex;
  flex-direction: column;
  overflow: hidden;
  /* border: 1px solid var(--color-border-2); */
}

.input-wrapper {
  display: flex;
  align-items: center;
  padding: 16px 20px;
  background: var(--color-bg-2);
}

.repo-selector {
  display: flex;
  align-items: center;
}

.divider {
  width: 1px;
  height: 20px;
  background-color: var(--color-border-2);
  margin: 0 16px;
}

.title-input {
  flex: 1;
  border: none;
  outline: none;
  font-size: 16px;
  background: transparent;
  color: var(--color-text-1);
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
  width: 24px;
  height: 24px;
  border: 1px solid var(--color-neutral-3);
  border-radius: 4px;
  color: var(--color-neutral-4);
  cursor: pointer;
  transition: all 0.2s;
}

.enter-hint:hover {
  background-color: var(--color-fill-2);
  color: var(--color-text-1);
}
</style>
