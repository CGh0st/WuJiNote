<template>
  <div class="side-panel-container">
    <div class="side-panel-header">
      <a-typography-text bold type="secondary">我的笔记</a-typography-text>
      <a-button class="add-note-btn" type="text" @click="showCreateNewArticleModel">
        <template #icon>
          <icon-plus :size="15" />
        </template>
      </a-button>
      <create-new-article-modal ref="createNewArticleModelRef"></create-new-article-modal>
    </div>
    <div class="search-bar" @click="showSearchModal">
      <icon-search class="search-icon" />
      <span class="search-text">搜索...</span>
    </div>
    <search-modal ref="searchModalRef" @create-note="showCreateNewArticleModel" />
    <a-scrollbar class="tree-scroll-container">
      <a-tree
        v-model:selected-keys="selectedKeys"
        v-model:expanded-keys="expandedKeys"
        :data="treeData"
        class="note-tree"
        block-node
        show-line
        @select="routeToArticleView"
      />
    </a-scrollbar>
  </div>
</template>

<script setup>
import { onMounted, ref, watch, onUnmounted } from 'vue'
import { useRoute } from 'vue-router'
import router from '../../router.js'
import CreateNewArticleModal from '../note/createNewNoteModal.vue'
import SearchModal from '../searchModal.vue'

const route = useRoute()
const treeData = ref([])
const selectedKeys = ref([])
const expandedKeys = ref([])
const createNewArticleModelRef = ref()
const searchModalRef = ref()

const showSearchModal = () => {
  searchModalRef.value?.show()
}

const handleKeydown = (e) => {
  if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
    e.preventDefault()
    showSearchModal()
  }
}

const updateTreeSelection = () => {
  const currentPath = route.path
  // 仅在是具体笔记页面时才更新选中状态
  if (currentPath.startsWith('/noteEditor/')) {
    selectedKeys.value = [currentPath]

    // 递归查找目标节点及其所有父级key
    const findNodeAndParents = (nodes, targetKey, parents = []) => {
      for (const node of nodes) {
        if (node.key === targetKey) {
          return { found: true, parents }
        }
        if (node.children && node.children.length > 0) {
          const result = findNodeAndParents(node.children, targetKey, [...parents, node.key])
          if (result && result.found) {
            return result
          }
        }
      }
      return null
    }

    const result = findNodeAndParents(treeData.value, currentPath)
    if (result && result.parents) {
      // 合并并去重，保持用户已展开的节点，同时确保当前笔记的父级都被展开
      const newExpandedKeys = new Set([...expandedKeys.value, ...result.parents])
      expandedKeys.value = Array.from(newExpandedKeys)
    }
  } else {
    // 非笔记页面，恢复默认展开状态
    expandedKeys.value = ['root-repos']
    selectedKeys.value = []
  }
}

// 暴露刷新方法供外部调用
const refreshTree = () => {
  fetchTreeData()
}

const fetchTreeData = async () => {
  const repositories = await window.electronAPI.getAllRepositories()
  const notes = await window.electronAPI.getAllNotes()

  const repoMap = new Map()
  repositories
    .filter((repo) => repo.id !== 0)
    .forEach((repo) => {
      repoMap.set(repo.id, {
        title: repo.name,
        key: `repo-${repo.id}`,
        children: []
      })
    })

  notes.forEach((note) => {
    if (repoMap.has(note.repositoryId)) {
      repoMap.get(note.repositoryId).children.push({
        title: note.title,
        key: `/noteEditor/${note.id}`,
        isLeaf: true
      })
    }
  })

  treeData.value = [
    {
      title: '知识库',
      key: 'root-repos',
      children: Array.from(repoMap.values())
    }
  ]

  // 数据加载完成后，确保展开状态正确
  updateTreeSelection()
}

const showCreateNewArticleModel = () => {
  createNewArticleModelRef.value.showModal()
}

const routeToArticleView = (selectedKey) => {
  if (selectedKey[0] && selectedKey[0].startsWith('/')) {
    router.push(selectedKey[0])
  } else {
    // 如果点击的是当前已选中的节点（导致selectedKey为空）或者非跳转节点，保持高亮状态
    updateTreeSelection()
  }
}

watch(
  () => route.path,
  () => {
    updateTreeSelection()
  }
)

onMounted(() => {
  fetchTreeData()
  // 监听全局刷新事件（例如知识库更新）
  window.addEventListener('refresh-side-panel-tree', refreshTree)
  window.addEventListener('keydown', handleKeydown)
})

// 组件卸载时移除监听
onUnmounted(() => {
  window.removeEventListener('refresh-side-panel-tree', refreshTree)
  window.removeEventListener('keydown', handleKeydown)
})
</script>

<style scoped>
.side-panel-container {
  flex: 1;
  overflow: hidden;
}

.side-panel-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin: 14px 15px 10px 15px;
}

.add-note-btn {
  margin-left: 10px;
  color: var(--color-neutral-8);
}

.search-bar {
  width: 84%;
  margin: 0px 15px;
  background: var(--color-bg-3);
  border-radius: 4px;
  padding: 4px 8px;
  display: flex;
  align-items: center;
  cursor: pointer;
  color: var(--color-neutral-6);
  height: 28px;
}

.search-icon {
  margin-right: 8px;
}

.search-text {
  font-size: 14px;
}

.tree-scroll-container {
  height: 85vh;
  overflow: auto;
}

.note-tree {
  margin: 10px 15px;
}

:deep(.arco-tree-node) {
  color: var(--color-neutral-8);
}

:deep(.arco-tree-node-title:hover) {
  color: var(--color-neutral-8);
  background-color: rgba(255, 255, 255, 0.03);
}

:deep(.arco-input-wrapper) {
  background-color: rgba(255, 255, 255, 0.03);
}
</style>
