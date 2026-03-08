<template>
  <div :style="{ height: '100vh', padding: '15px 30px', background: 'var(--color-bg-1)' }">
    <div :style="{ width: '100%' }">
      <header-bar>
        <a-breadcrumb>
          <a-breadcrumb-item>吾记</a-breadcrumb-item>
          <a-breadcrumb-item :style="{ color: 'var(--color-neutral-8)' }">回收站</a-breadcrumb-item>
        </a-breadcrumb>
      </header-bar>
      <div :style="{ margin: '60px 0' }">
        <div :style="{ display: 'flex', alignItems: 'center', margin: '20px 0 ', justifyContent: 'end' }">
          <a-input-search
            v-model="searchQuery"
            :style="{ width: '200px', background: 'var(--color-neutral-2) !important' }"
            placeholder="搜索"
          />
        </div>
        <a-table :bordered="false" :columns="columns" :data="filteredData" size="large" stripe>
          <template #action="{ record }">
            <a-button :style="{ padding: '0 28px' }" type="text" @click="handleView(record)">查看</a-button>
            <a-button type="text" @click="handleRestore(record)">恢复</a-button>
            <a-button type="text" status="danger" @click="handlePermanentlyDelete(record)">彻底删除</a-button>
          </template>
        </a-table>
        <permanently-delete-note-modal
          ref="permanentlyDeleteNoteModalRef"
          :note-id="currentNoteId"
          @note-deleted="fetchDeletedNotes"
        />
      </div>
    </div>
  </div>
</template>
<script setup>
import { ref, onMounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import HeaderBar from '../components/defaultLayout/headerBar.vue'
import { Notification } from '@arco-design/web-vue'
import PermanentlyDeleteNoteModal from '../components/note/permanentlyDeleteNoteModal.vue'

const columns = [
  { title: '名称', dataIndex: 'name', sortable: { sortDirections: ['ascend', 'descend'] } },
  { title: '知识库', dataIndex: 'repository' },
  { title: '删除时间', dataIndex: 'deleteTime', sortable: { sortDirections: ['ascend', 'descend'] } },
  { title: '操作', slotName: 'action', align: 'center' }
]

const router = useRouter()
const data = ref([])
const permanentlyDeleteNoteModalRef = ref()
const currentNoteId = ref(null)
const searchQuery = ref('')

const filteredData = computed(() => {
  if (!searchQuery.value) return data.value
  const query = searchQuery.value.toLowerCase()
  return data.value.filter((item) => item.name.toLowerCase().includes(query))
})

const fetchDeletedNotes = async () => {
  const notes = await window.electronAPI.getDeletedNotes()
  data.value = (notes || []).map((n) => ({
    key: n.id,
    name: n.title,
    repository: n.repositoryName || '未知知识库',
    deleteTime: n.deleteTime
  }))
}

const handleRestore = async (record) => {
  try {
    const result = await window.electronAPI.restoreNote(record.key)
    if (result) {
      Notification.success({
        content: '笔记已恢复',
        style: { lineHeight: 'normal' }
      })
      await fetchDeletedNotes()
      window.dispatchEvent(new Event('refresh-side-panel-tree'))
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

const handlePermanentlyDelete = (record) => {
  currentNoteId.value = record.key
  permanentlyDeleteNoteModalRef.value.showModal()
}

const handleView = (record) => {
  router.push({ name: 'noteEditor', params: { id: record.key } })
}

onMounted(() => {
  fetchDeletedNotes()
  const handler = () => fetchDeletedNotes()
  window.addEventListener('refresh-side-panel-tree', handler)
})
</script>
<style scoped>
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
  margin-left: 5px; /* 缩进子节点 */
  font-size: 14px;
}
</style>
