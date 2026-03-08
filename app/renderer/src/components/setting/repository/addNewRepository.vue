<template>
  <a-modal
    v-model:visible="visible"
    :footer="false"
    :closable="false"
    :align-center="false"
    :top="100"
    :width="500"
    modal-class="add-repo-modal-container"
    @cancel="visible = false"
    @open="handleOpen"
  >
    <div class="add-repo-panel">
      <div class="input-wrapper">
        <div class="icon-wrapper">
          <icon-storage :size="20" />
        </div>
        <div class="divider"></div>
        <input
          ref="nameInputRef"
          v-model="form.repositoryName"
          class="repo-input"
          placeholder="输入知识库名称，按回车创建..."
          @keydown.enter="createNewRepository"
          @keydown.esc="visible = false"
        />
        <div class="actions">
          <a-spin v-if="isLoading" :size="16" />
          <div v-else class="enter-hint" @click="createNewRepository">
            <icon-right />
          </div>
        </div>
      </div>
    </div>
  </a-modal>
</template>

<script setup>
import { ref, reactive, nextTick } from 'vue'
import { Notification } from '@arco-design/web-vue'
import { IconStorage, IconRight } from '@arco-design/web-vue/es/icon'

const visible = ref(false)
const isLoading = ref(false)
const nameInputRef = ref(null)
const emit = defineEmits(['refresh'])

const form = reactive({
  repositoryName: ''
})

const showModal = () => {
  visible.value = true
  form.repositoryName = ''
}

const handleOpen = () => {
  nextTick(() => {
    nameInputRef.value?.focus()
  })
}

const createNewRepository = async () => {
  const name = form.repositoryName?.trim()

  if (!name) {
    Notification.warning({ content: '请输入知识库名称' })
    return
  }

  if (name.length > 20) {
    Notification.warning({ content: '知识库名称长度不能超过20个字符' })
    return
  }

  isLoading.value = true
  try {
    // Check duplication
    const isExist = await window.electronAPI.getRepositoryByName(name)
    if (isExist) {
      Notification.warning({ content: '知识库名称已存在' })
      isLoading.value = false
      return
    }

    const repositoryId = await window.electronAPI.addNewRepository(name)
    if (repositoryId) {
      Notification.success({
        content: '创建成功',
        style: { lineHeight: 'normal' }
      })
      emit('refresh')
      window.dispatchEvent(new Event('refresh-side-panel-tree'))
      visible.value = false
    } else {
      Notification.error({
        content: '创建失败',
        style: { lineHeight: 'normal' }
      })
    }
  } catch (error) {
    console.error(error)
    Notification.error({ content: '创建失败' })
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
.add-repo-modal-container {
  background: transparent !important;
  box-shadow: none !important;
  padding: 0 !important;
}

.add-repo-modal-container .arco-modal {
  background: transparent !important;
  box-shadow: none !important;
  padding: 0 !important;
}

.add-repo-modal-container .arco-modal-header,
.add-repo-modal-container .arco-modal-footer {
  display: none;
}

.add-repo-modal-container .arco-modal-content {
  background: transparent !important;
  padding: 0 !important;
  border: none !important;
  box-shadow: none !important;
}

.add-repo-modal-container .arco-modal-body {
  padding: 0 !important;
  background: transparent !important;
}
</style>

<style scoped>
.add-repo-panel {
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

.icon-wrapper {
  display: flex;
  align-items: center;
  color: var(--color-neutral-6);
}

.divider {
  width: 1px;
  height: 20px;
  background-color: var(--color-border-2);
  margin: 0 16px;
}

.repo-input {
  flex: 1;
  border: none;
  outline: none;
  font-size: 16px;
  background: transparent;
  color: var(--color-text-1);
}

.repo-input::placeholder {
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
