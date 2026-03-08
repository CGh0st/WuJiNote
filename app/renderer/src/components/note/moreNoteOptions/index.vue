<template>
  <div>
    <a-drawer
      :visible="visible"
      :width="320"
      :footer="false"
      :header="false"
      :mask="false"
      unmount-on-close
      :mask-closable="true"
      class="more-options-drawer"
      @cancel="hideDrawer"
    >
      <div ref="drawerContentRef" class="more-options-panel">
        <div class="history-section">
          <div class="section-title">编辑记录</div>
          <a-scrollbar class="timeline-wrapper" style="max-height: 200px; overflow-y: auto; margin-left: 15px">
            <a-timeline>
              <a-timeline-item v-for="log in noteLogs" :key="log.id" :label="formatDate(log.createdTime)">
                {{ log.details }}
              </a-timeline-item>
              <a-timeline-item v-if="noteLogs.length === 0" label="暂无记录"> 暂无编辑记录 </a-timeline-item>
            </a-timeline>
          </a-scrollbar>
        </div>

        <div class="actions-section">
          <template v-if="isHistoryVersion">
            <div class="action-item" @click="restoreVersion">
              <icon-history :size="18" />
              <span>设为主版本</span>
            </div>
          </template>
          <template v-else-if="isReadOnly && isDeleted">
            <div class="action-item" @click="restoreNote">
              <icon-reply :size="18" />
              <span>恢复笔记</span>
            </div>
          </template>
          <template v-else>
            <div class="action-item" @click="copyNote">
              <icon-copy :size="16" />
              <span>复制笔记</span>
            </div>
            <div class="action-item" @click="showMoveNoteModal">
              <icon-rotate-right :size="18" />
              <span>移动笔记</span>
            </div>
            <div class="action-item" @click="toggleLock">
              <icon-unlock v-if="isLocked" :size="16" />
              <icon-lock v-else :size="16" />
              <span>{{ isLocked ? '解锁笔记' : '锁定笔记' }}</span>
            </div>

            <div v-if="isEditable" class="action-item" @click="saveAndQuitEditMode">
              <icon-close :size="16" />
              <span>退出编辑</span>
            </div>
            <div class="action-item delete" @click="showDeleteNoteModal">
              <icon-delete :size="16" />
              <span>删除笔记</span>
            </div>
          </template>
        </div>
      </div>
    </a-drawer>
    <move-note-modal ref="moveNoteModalRef" :note-id="noteId" @note-moved="handleNoteMoved"></move-note-modal>
    <delete-note-modal ref="deleteNoteModalRef" @note-deleted="handleNoteDeleted"></delete-note-modal>
  </div>
</template>

<script setup>
import { ref, onUnmounted, watch } from 'vue'
import MoveNoteModal from './moveNoteModal.vue'
import deleteNoteModal from './deleteNoteModal.vue'
import { Notification } from '@arco-design/web-vue'
import router from '../../../router.js'

// ... existing script content ...

const props = defineProps({
  noteId: {
    type: [Number, String],
    required: true
  },
  isReadOnly: {
    type: Boolean,
    default: false
  },
  isDeleted: {
    type: Boolean,
    default: false
  },
  isHistoryVersion: {
    type: Boolean,
    default: false
  },
  previewingVersionId: {
    type: [Number, String],
    default: null
  },
  isLocked: {
    type: Boolean,
    default: false
  }
})

const visible = ref(false)
const drawerContentRef = ref(null)
const moveNoteModalRef = ref()
const deleteNoteModalRef = ref()
const noteLogs = ref([])
const isEditable = defineModel('isEditable', {
  type: Boolean,
  default: false
})

const formatDate = (timestamp) => {
  if (!timestamp) return ''

  // SQLite CURRENT_TIMESTAMP is UTC "YYYY-MM-DD HH:MM:SS"
  // We want to treat it as UTC so it converts to local time correctly.
  let timeStr = timestamp
  if (typeof timestamp === 'string' && /^\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}$/.test(timestamp)) {
    timeStr = timestamp.replace(' ', 'T') + 'Z'
  }

  const date = new Date(timeStr)
  // Check if date is valid
  if (isNaN(date.getTime())) return timestamp

  return date.toLocaleString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  })
}

const fetchLogs = async () => {
  if (!props.noteId) return
  try {
    const logs = await window.electronAPI.getNoteLogs(props.noteId)
    noteLogs.value = (logs || []).sort((a, b) => a.id - b.id)
  } catch (error) {
    console.error('Failed to fetch note logs:', error)
    noteLogs.value = []
  }
}

const emit = defineEmits([
  'save-and-quit-edit-mode',
  'note-restored',
  'version-restored',
  'note-moved',
  'request-toggle-lock'
])

const handleClickOutside = (event) => {
  if (visible.value && drawerContentRef.value && !drawerContentRef.value.contains(event.target)) {
    // If clicking on a modal/dialog (like delete confirm), don't close the drawer immediately
    if (event.target.closest('.arco-modal-container')) {
      return
    }

    hideDrawer()
  }
}

watch(visible, (newVal) => {
  if (newVal) {
    fetchLogs()
    // Delay adding the event listener to avoid immediate closing if triggered by a click
    setTimeout(() => {
      document.addEventListener('click', handleClickOutside)
    }, 0)
  } else {
    document.removeEventListener('click', handleClickOutside)
  }
})

watch(
  () => props.noteId,
  (newId) => {
    if (visible.value && newId) {
      fetchLogs()
    }
  }
)

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside)
})

const showDrawer = () => {
  visible.value = true
}

const hideDrawer = () => {
  visible.value = false
}

const handleNoteMoved = () => {
  hideDrawer()
  emit('note-moved')
}

const handleNoteDeleted = () => {
  hideDrawer()
  router.push('/')
}

const showMoveNoteModal = () => {
  moveNoteModalRef.value.showModal()
}

const showDeleteNoteModal = () => {
  deleteNoteModalRef.value.showModal(props.noteId)
}

const toggleLock = () => {
  emit('request-toggle-lock', !props.isLocked)
  visible.value = false
}

const saveAndQuitEditMode = () => {
  emit('save-and-quit-edit-mode', false)
  isEditable.value = false
  visible.value = false
}

const restoreNote = async () => {
  try {
    const result = await window.electronAPI.restoreNote(Number(props.noteId))
    if (result) {
      window.dispatchEvent(new Event('refresh-side-panel-tree'))
      Notification.success({
        content: '笔记已恢复',
        style: { lineHeight: 'normal' }
      })
      visible.value = false
      emit('note-restored')
      router.push({
        name: 'noteEditor',
        params: { id: props.noteId },
        query: { edit: 'false' }
      })
    } else {
      Notification.error({
        content: '恢复失败',
        style: { lineHeight: 'normal' }
      })
    }
  } catch (error) {
    console.error('Failed to restore note:', error)
    Notification.error({
      content: '恢复失败',
      style: { lineHeight: 'normal' }
    })
  }
}

const restoreVersion = async () => {
  if (!props.previewingVersionId) return
  try {
    const result = await window.electronAPI.restoreNoteVersion(Number(props.noteId), Number(props.previewingVersionId))
    if (result && result.changes > 0) {
      Notification.success({
        content: '已将当前版本设为主版本',
        style: { lineHeight: 'normal' }
      })
      visible.value = false
      emit('version-restored')
    } else {
      Notification.error({
        content: '设置主版本失败',
        style: { lineHeight: 'normal' }
      })
    }
  } catch (error) {
    console.error('Failed to restore version:', error)
    Notification.error({
      content: '设置主版本失败: ' + error.message,
      style: { lineHeight: 'normal' }
    })
  }
}

const copyNote = async () => {
  try {
    const newNoteId = await window.electronAPI.copyNote(Number(props.noteId))
    if (newNoteId) {
      window.dispatchEvent(new Event('refresh-side-panel-tree'))
      Notification.success({
        content: '笔记复制成功',
        style: { lineHeight: 'normal' }
      })
      visible.value = false
      router.push({
        name: 'noteEditor',
        params: { id: newNoteId }
      })
    } else {
      Notification.error({
        content: '复制失败',
        style: { lineHeight: 'normal' }
      })
    }
  } catch (error) {
    console.error('Failed to copy note:', error)
    Notification.error({
      content: '复制失败: ' + error.message,
      style: { lineHeight: 'normal' }
    })
  }
}

defineExpose({
  showDrawer
})
</script>

<style>
/* Global drawer override */
.more-options-drawer .arco-drawer {
  background: transparent !important;
  box-shadow: none !important;
  top: 80px !important;
  right: 20px !important;
  height: auto !important;
  max-height: calc(100vh - 100px);
  position: absolute !important;
  border-radius: 12px;
  overflow: visible !important;
}

.more-options-drawer .arco-drawer-body {
  padding: 0 !important;
  background: transparent !important;
  overflow: visible !important;
}
</style>

<style scoped>
.more-options-panel {
  background: var(--color-bg-2);
  border-radius: 12px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
  display: flex;
  flex-direction: column;
  overflow: hidden;
  padding: 16px;
  border: 1px solid var(--color-border-2);
}

.history-section {
  margin-bottom: 20px;
}

.section-title {
  font-size: 14px;
  font-weight: 500;
  color: var(--color-text-2);
  margin-bottom: 12px;
}

.timeline-wrapper {
  padding: 10px 8px;
}

.actions-section {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.action-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 10px 12px;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.2s;
  color: var(--color-text-2);
  font-size: 14px;
}

.action-item:hover {
  background-color: var(--color-fill-2);
  color: var(--color-text-1);
}

.action-item.delete {
  color: rgb(var(--red-6));
}

.action-item.delete:hover {
  background-color: var(--color-danger-light-1);
}

:deep(.arco-timeline-item-content) {
  font-size: 13px;
  color: var(--color-text-3);
}

:deep(.arco-timeline-item-label) {
  font-size: 12px;
  color: var(--color-text-4);
}
</style>
