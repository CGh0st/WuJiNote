<template>
  <div class="editor-container">
    <header-bar>
      <div class="header-toolbar">
        <a-breadcrumb class="breadcrumb-container">
          <a-breadcrumb-item>吾记</a-breadcrumb-item>
          <a-breadcrumb-item>{{ repositoryName }}</a-breadcrumb-item>
          <a-breadcrumb-item>{{ noteTitle }}</a-breadcrumb-item>
          <a-breadcrumb-item>
            <template #droplist>
              <a-doption v-for="version in versionList" :key="version.id" @click="handleVersionChange(version)">
                {{ version.versionHash.substring(0, 12) }} ({{ formatTime(version.createdTime) }})
              </a-doption>
            </template>
            {{ currentVersionLabel }}
          </a-breadcrumb-item>
        </a-breadcrumb>
        <a-space size="small" class="toolbar-actions">
          <template v-if="!isReadOnly">
            <a-button v-if="!isEditable" class="toolbar-btn" type="text" @click="enterEditMode">
              <template #icon>
                <icon-edit :size="18" />
              </template>
            </a-button>
            <a-button v-else class="toolbar-btn" type="text" @click="saveNote">
              <template #icon>
                <icon-save :size="18" />
              </template>
            </a-button>
          </template>
          <template v-else>
            <a-tag color="arcoblue">只读模式</a-tag>
            <a-tag v-if="isLocked" color="red" class="locked-tag">已锁定</a-tag>
            <template v-if="isDeletedNote">
              <a-tag color="red">回收站</a-tag>
              <a-button class="toolbar-btn" type="text" @click="goBackToRecycleBin">
                <template #icon>
                  <icon-undo :size="18" />
                </template>
              </a-button>
            </template>
          </template>
          <a-button class="toolbar-btn" type="text" @click="showExportModal">
            <template #icon>
              <icon-share-external :size="18" />
            </template>
          </a-button>
          <a-button class="toolbar-btn" type="text" @click="showArticleMoreDrawer">
            <template #icon>
              <icon-more :size="18" />
            </template>
          </a-button>
          <a-divider class="toolbar-divider" direction="vertical" />
          <more-note-options
            ref="moreNoteOptionsDrawerRef"
            :is-editable="isEditable"
            :note-id="currentNoteId"
            :is-read-only="isReadOnly"
            :is-deleted="isDeletedNote"
            :is-history-version="isHistoryVersion"
            :previewing-version-id="previewingVersionId"
            :is-locked="isLocked"
            @save-and-quit-edit-mode="handleSaveNoteAndQuitEditMode"
            @note-restored="handleNoteRestored"
            @version-restored="fetchNoteDetails(currentNoteId)"
            @version-deleted="handleVersionDeleted"
            @note-moved="fetchNoteDetails(currentNoteId)"
            @request-toggle-lock="handleToggleLock"
          ></more-note-options>
          <export-modal ref="exportModalRef"></export-modal>
        </a-space>
      </div>
    </header-bar>
    <transition name="fade" mode="out-in">
      <rich-editor :key="currentNoteId" ref="editorRef" :title="noteTitle" :content="noteContent"></rich-editor>
    </transition>
  </div>
</template>
<script setup>
import { onMounted, ref, watch, nextTick, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import HeaderBar from '../components/defaultLayout/headerBar.vue'
import moreNoteOptions from '../components/note/moreNoteOptions/index.vue'
import exportModal from '../components/note/exportNoteModal.vue'
import { Notification } from '@arco-design/web-vue'
import richEditor from '../components/richEditor/index.vue'

const route = useRoute()
const router = useRouter()
const editorRef = ref(null)
const isEditable = ref(false)
const moreNoteOptionsDrawerRef = ref(null)
const exportModalRef = ref(null)
const noteTitle = ref('')
const repositoryName = ref('')
const noteContent = ref('')
const currentNoteId = ref(route.params.id)
const versionList = ref([])
const currentVersionLabel = ref('当前版本')
const currentVersionId = ref(null)
const previewingVersionId = ref(null)
const isDeletedNote = ref(false)
const isHistoryVersion = ref(false)
const isLocked = ref(false)

const isReadOnly = computed(() => isHistoryVersion.value || isDeletedNote.value || isLocked.value)

const formatTime = (time) => {
  if (!time) return ''
  return new Date(time).toLocaleString()
}

const fetchNoteDetails = async (id) => {
  if (!id) return
  try {
    const note = await window.electronAPI.getNoteById(id)
    if (note) {
      noteTitle.value = note.title
      noteContent.value = note.content
      repositoryName.value = note.repositoryName || '未知知识库'
      currentVersionId.value = note.activeContentVersion
      previewingVersionId.value = null
      isDeletedNote.value = note.isDeleted === 1
      isLocked.value = note.isLocked === 1
      isHistoryVersion.value = false
      fetchVersions(id)

      // 显式设置编辑器内容，确保内容被加载
      if (editorRef.value) {
        editorRef.value.setContent(note.content)
      } else {
        // 如果组件还未挂载（例如第一次加载），等待下一次 DOM 更新
        nextTick(() => {
          if (editorRef.value) {
            editorRef.value.setContent(note.content)
          }
        })
      }
      if (route.query.edit === 'true' && !isReadOnly.value) {
        enterEditMode()
      }
    }
  } catch (error) {
    console.error('Failed to fetch note details:', error)
    Notification.error({
      content: '获取笔记详情失败',
      style: {
        lineHeight: 'normal'
      }
    })
  }
}

const fetchVersions = async (id) => {
  try {
    const versions = await window.electronAPI.getNoteVersions(id)
    versionList.value = versions
    updateCurrentVersionLabel()
  } catch (error) {
    console.error('Failed to fetch versions:', error)
  }
}

const updateCurrentVersionLabel = () => {
  if (!currentVersionId.value && versionList.value.length > 0) {
    // 如果没有 activeContentVersion，可能默认显示最新
    currentVersionLabel.value = '主版本'
    return
  }

  const current = versionList.value.find((v) => v.id === currentVersionId.value)
  if (current) {
    currentVersionLabel.value = `${current.versionHash.substring(0, 12)} (主版本)`
  } else {
    currentVersionLabel.value = '主版本'
  }
}

const showExportModal = () => {
  if (currentNoteId.value) {
    exportModalRef.value.showModal(currentNoteId.value)
  }
}

const handleVersionChange = async (version) => {
  try {
    const content = await window.electronAPI.getNoteVersionContent(version.id)
    if (content !== null) {
      if (editorRef.value) {
        editorRef.value.setContent(content)
      }
    }

    const note = await window.electronAPI.getNoteById(version.noteId)
    const activeContentVersion = note.activeContentVersion
    isDeletedNote.value = note.isDeleted === 1
    isLocked.value = note.isLocked === 1

    if (activeContentVersion === version.id) {
      isHistoryVersion.value = false
      previewingVersionId.value = null
      currentVersionLabel.value = `${version.versionHash.substring(0, 12)} (主版本)`
    } else {
      isHistoryVersion.value = true // 标记为历史版本预览模式
      previewingVersionId.value = version.id
      currentVersionLabel.value = `${version.versionHash.substring(0, 12)} (历史版本)`
    }

    currentVersionId.value = version.id
    if (isEditable.value) {
      quitEditMode()
    }
  } catch (error) {
    Notification.error({
      content: '加载版本内容失败',
      style: {
        lineHeight: 'normal'
      }
    })
    console.error(error)
  }
}

const showArticleMoreDrawer = () => {
  moreNoteOptionsDrawerRef.value.showDrawer()
}

const handleNoteRestored = async () => {
  await fetchNoteDetails(currentNoteId.value)
  isHistoryVersion.value = false
  isDeletedNote.value = false
}

const handleVersionDeleted = async () => {
  await fetchNoteDetails(currentNoteId.value)
}

const goBackToRecycleBin = () => {
  router.push({ name: 'recycleBinView' })
}

const enterEditMode = () => {
  if (isReadOnly.value) {
    Notification.warning({
      content: '当前为只读模式，无法编辑',
      style: {
        lineHeight: 'normal'
      }
    })
    return
  }
  if (isEditable.value) return
  isEditable.value = true
  Notification.info({
    content: '进入编辑模式',
    style: {
      lineHeight: 'normal'
    }
  })
}

const quitEditMode = () => {
  if (!isEditable.value) return
  isEditable.value = false
  Notification.info({
    content: '已退出编辑模式',
    style: {
      lineHeight: 'normal'
    }
  })
}

const handleToggleLock = async (targetLockState) => {
  try {
    // 如果现在正在编辑，先保存当前内容
    if (targetLockState && isEditable.value) {
      const saveResult = await saveNote()
      if (!saveResult) {
        // 如果保存失败，不继续执行操作
        return
      }
      quitEditMode()
    }

    const result = await window.electronAPI.toggleNoteLock(Number(currentNoteId.value), targetLockState)
    if (result && result.changes > 0) {
      Notification.success({
        content: targetLockState ? '笔记已锁定' : '笔记已解锁',
        style: { lineHeight: 'normal' }
      })
      fetchNoteDetails(currentNoteId.value)
    } else {
      Notification.error({
        content: '操作失败',
        style: { lineHeight: 'normal' }
      })
    }
  } catch (error) {
    console.error('Failed to toggle lock:', error)
    Notification.error({
      content: '操作失败: ' + error.message,
      style: { lineHeight: 'normal' }
    })
  }
}

const saveNote = async () => {
  const content = editorRef.value.getHTML()
  try {
    const response = await window.electronAPI.saveNoteContent(currentNoteId.value, content, currentVersionId.value)

    if (response.success) {
      if (response.id) {
        // 保存成功且产生了新版本
        Notification.success({
          content: '保存成功',
          style: {
            lineHeight: 'normal'
          }
        })
        // 更新当前版本ID为新版本ID，避免后续保存触发冲突
        currentVersionId.value = response.id
        fetchVersions(currentNoteId.value)
      } else {
        // success为true但id为空，说明内容未变
        Notification.info({
          content: '内容未变更，无需保存',
          style: {
            lineHeight: 'normal'
          }
        })
      }
      return true
    } else {
      Notification.error({
        content: '保存失败',
        style: {
          lineHeight: 'normal'
        }
      })
      return false
    }
  } catch (error) {
    console.error('Failed to save note:', error)
    Notification.error({
      content: '保存失败: ' + error.message,
      style: {
        lineHeight: 'normal'
      }
    })
    return false
  }
}

const handleSaveNoteAndQuitEditMode = async () => {
  const result = await saveNote()
  if (result) {
    quitEditMode()
  }
}

watch([() => route.params.id, () => route.query.edit], async ([newId, newEdit], [oldId, oldEdit]) => {
  if (newId !== oldId) {
    if (isEditable.value) {
      quitEditMode()
    }
    currentNoteId.value = newId
    await fetchNoteDetails(newId)
  } else if (newEdit === 'true' && oldEdit !== 'true') {
    if (!isEditable.value) {
      await fetchNoteDetails(currentNoteId.value)
      isHistoryVersion.value = false
      enterEditMode()
    }
  }
})

watch([() => editorRef.value, () => isEditable.value], ([editor, editable]) => {
  if (editor && typeof editor.toggleEditing === 'function') {
    editor.toggleEditing(editable)
  }
})

onMounted(async () => {
  await fetchNoteDetails(currentNoteId.value)
})
</script>
<style scoped>
.editor-container {
  height: 100vh;
  display: flex;
  flex-direction: column;
  align-items: stretch;
}

.header-toolbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: calc(100vw - 480px);
}

.breadcrumb-container {
  color: var(--color-neutral-8);
  -webkit-app-region: no-drag;
}

.toolbar-actions {
  display: flex;
  align-items: center;
  -webkit-app-region: no-drag;
}

.toolbar-btn {
  color: var(--color-neutral-8);
}

.locked-tag {
  margin-left: 8px;
}

.toolbar-divider {
  min-height: 1.5em;
  border-left: 1.5px solid var(--color-neutral-3);
}

:deep(.arco-tree-node-title):hover {
  background: var(--color-neutral-3);
}

:deep(.arco-input-wrapper) {
  background: var(--color-neutral-3);
}

:global(.arco-notification-right) {
  display: flex;
  align-content: center;
  flex-wrap: wrap;
}

:global(.arco-trigger-content) {
  padding: 3px;
}

:global(.arco-dropdown) {
  margin-top: 3px;
  border: 0;
}

:global(.arco-popover-content) {
  margin: 0;
}

:deep(.arco-textarea) {
  font-size: 36px;
  font-weight: 600;
}

:deep(.arco-textarea-wrapper),
:deep(.arco-textarea-focus) {
  border: 0 !important;
}

:deep(.arco-anchor-link) {
  margin-left: 5px;
  /* 缩进子节点 */
  font-size: 14px;
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
