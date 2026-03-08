<template>
  <div :style="{ marginLeft: '20px' }">
    <a-space direction="vertical" style="width: 100%">
      <div
        :style="{
          display: 'flex',
          justifyContent: 'space-between',
          alignContent: 'center',
          flexWrap: 'wrap'
        }"
      >
        <a-typography-text :style="{ display: 'flex', alignContent: 'center', flexWrap: 'wrap' }" type="secondary">
          当前笔记
        </a-typography-text>
        <a-button type="primary" @click="showCreateNewNoteModal">
          <template #icon>
            <icon-plus />
          </template>
          新增笔记
        </a-button>
      </div>
      <a-table
        :bordered="false"
        :columns="columns"
        :data="data"
        size="large"
        stripe
        :pagination="{
          pageSize: 5,
          showTotal: true
        }"
      >
        <template #repository="{ record }">
          {{ record.repositoryName || '未分类' }}
        </template>
        <template #action="{ record }">
          <a-button type="text" @click="viewNote(record.key)">查看</a-button>
          <a-button type="text" status="danger" @click="showDeleteNoteModal(record.key)">删除</a-button>
        </template>
      </a-table>
    </a-space>
    <create-new-note ref="createNewNoteModalRef"></create-new-note>
    <delete-note-modal ref="deleteNoteModalRef" @refresh="getAllNotes"></delete-note-modal>
  </div>
</template>

<script setup>
import { onMounted, onUnmounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import { IconPlus } from '@arco-design/web-vue/es/icon'
import CreateNewNote from '../../note/createNewNoteModal.vue'
import DeleteNoteModal from '../../note/moreNoteOptions/deleteNoteModal.vue'

const router = useRouter()

const columns = [
  {
    title: '名称',
    dataIndex: 'name',
    sortable: {
      sortDirections: ['ascend', 'descend']
    },

    ellipsis: true,
    tooltip: true
  },
  {
    title: '所属知识库',
    dataIndex: 'repositoryName',
    slotName: 'repository'
  },
  {
    title: '创建时间',
    dataIndex: 'createdTime',
    sortable: {
      sortDirections: ['ascend', 'descend']
    }
  },
  {
    title: '操作',
    slotName: 'action',
    align: 'center'
  }
]

const data = ref([])
const createNewNoteModalRef = ref(null)
const deleteNoteModalRef = ref(null)

const getAllNotes = async () => {
  try {
    const [notes, repositories] = await Promise.all([
      window.electronAPI.getAllNotes(),
      window.electronAPI.getAllRepositories()
    ])

    const repoMap = new Map()
    if (repositories) {
      repositories.forEach((repo) => {
        repoMap.set(repo.id, repo.name)
      })
    }

    if (notes) {
      data.value = notes.map((note) => ({
        key: note.id,
        name: note.title,
        repositoryName: repoMap.get(note.repositoryId) || '未知知识库',
        createdTime: note.createdTime
      }))
    }
  } catch (error) {
    console.error('Failed to fetch notes:', error)
  }
}

const showCreateNewNoteModal = () => {
  createNewNoteModalRef.value.showModal()
}

const emit = defineEmits(['close'])

const viewNote = (noteId) => {
  router.push({ name: 'noteEditor', params: { id: noteId } })
  emit('close')
}

const showDeleteNoteModal = (noteId) => {
  deleteNoteModalRef.value.showModal(noteId)
}

// Listen for refresh event
const refreshHandler = () => {
  getAllNotes()
}

onMounted(() => {
  getAllNotes()
  window.addEventListener('refresh-side-panel-tree', refreshHandler)
})

onUnmounted(() => {
  window.removeEventListener('refresh-side-panel-tree', refreshHandler)
})
</script>
