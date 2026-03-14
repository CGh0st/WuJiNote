<template>
  <div class="repository-setting-container">
    <a-space direction="vertical" style="width: 100%">
      <div class="repository-setting-header">
        <a-typography-text :style="{ display: 'flex', alignContent: 'center', flexWrap: 'wrap' }" type="secondary">
          当前知识库
        </a-typography-text>
        <a-button type="primary" @click="showAddNewRepository()">
          <template #icon>
            <icon-plus />
          </template>
          新增知识库
        </a-button>
      </div>
      <a-table
        :bordered="false"
        :columns="columns"
        :data="data"
        size="large"
        :pagination="{
          pageSize: 5,
          showTotal: true
        }"
        stripe
      >
        <template #action="{ record }">
          <a-button type="text" @click="showEditNewRepository(record.key)">编辑</a-button>
          <a-button type="text" status="danger" @click="deleteRepository(record.key)">删除</a-button>
        </template>
      </a-table>
    </a-space>
    <add-new-repository ref="addNewRepositoryModalRef" @refresh="getAllRepositories"></add-new-repository>
    <edit-repository ref="editRepositoryModalRef" @refresh="getAllRepositories"></edit-repository>
    <delete-repository-modal ref="deleteRepositoryModalRef" @refresh="getAllRepositories"></delete-repository-modal>
  </div>
</template>
<script setup>
import { onMounted, ref } from 'vue'
import { Notification } from '@arco-design/web-vue'
import AddNewRepository from './addNewRepository.vue'
import editRepository from './editRepository.vue'
import deleteRepositoryModal from './deleteRepositoryModal.vue'

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

const addNewRepositoryModalRef = ref(null)
const editRepositoryModalRef = ref(null)
const deleteRepositoryModalRef = ref(null)

const getAllRepositories = async () => {
  const repositories = await window.electronAPI.getAllRepositories()
  if (repositories) {
    data.value = repositories.map((repository) => ({
      key: repository.id,
      name: repository.name,
      createdTime: repository.createdTime
    }))
  }
}

const showAddNewRepository = () => {
  addNewRepositoryModalRef.value.showModal()
}

const showEditNewRepository = (repositoryId) => {
  editRepositoryModalRef.value.showModal(repositoryId)
}

const showDeleteRepositoryModal = (repositoryId) => {
  deleteRepositoryModalRef.value.showModal(repositoryId)
}

const deleteRepository = async (repositoryId) => {
  if (Number(repositoryId) === -1) {
    Notification.warning({
      content: '该知识库不能删除',
      style: { lineHeight: 'normal' }
    })
    return
  } else if (Number(repositoryId) === 0) {
    Notification.warning({
      content: '该知识库不能删除',
      style: { lineHeight: 'normal' }
    })
    return
  } else {
    showDeleteRepositoryModal(repositoryId)
  }
}

onMounted(() => {
  getAllRepositories()
})
</script>

<style scoped>
.repository-setting-container {
  margin-left: 20px;
}

.repository-setting-header {
  display: flex;
  justify-content: space-between;
  align-content: center;
  flex-wrap: wrap;
}
</style>
