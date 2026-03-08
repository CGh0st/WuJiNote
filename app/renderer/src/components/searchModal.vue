<template>
  <a-modal
    v-model:visible="visible"
    :footer="false"
    :closable="false"
    :mask-closable="true"
    :align-center="false"
    :top="100"
    :width="700"
    modal-class="search-modal-container"
    @cancel="handleClose"
    @open="handleOpen"
  >
    <div class="search-panel">
      <div class="search-input-wrapper">
        <icon-search class="search-icon" :size="20" />
        <input
          ref="searchInputRef"
          v-model="searchQuery"
          class="search-input"
          placeholder="搜索内容，或输入 > 唤醒更多"
          @input="handleSearch"
          @keydown.down.prevent="navigateResults(1)"
          @keydown.up.prevent="navigateResults(-1)"
          @keydown.enter="handleEnter"
          @keydown.esc="handleClose"
        />
        <div class="search-hint">
          <span class="hint-item"><icon-arrow-up /> <icon-arrow-down /> 切换内容</span>
        </div>
      </div>

      <div class="search-content">
        <a-spin :loading="loading" class="spin-container">
          <!-- Search Results -->
          <template v-if="searchQuery">
            <!-- Repositories Section -->
            <div v-if="repositories.length > 0" class="result-group">
              <div class="group-title">知识库</div>
              <div
                v-for="(repo, index) in repositories"
                :key="'repo-' + repo.id"
                :class="['result-item', { active: activeSection === 'repo' && activeIndex === index }]"
                @click="handleSelectRepo(repo)"
                @mouseenter="setActive('repo', index)"
              >
                <icon-folder class="item-icon" />
                <div class="item-info">
                  <span class="item-title" v-html="highlightKeyword(repo.name)"></span>
                </div>
                <span class="item-action">跳转</span>
              </div>
            </div>

            <!-- Notes Section -->
            <div v-if="notes.length > 0" class="result-group">
              <div class="group-title">页面</div>
              <div
                v-for="(note, index) in notes"
                :key="'note-' + note.id"
                :class="['result-item', { active: activeSection === 'note' && activeIndex === index }]"
                @click="handleSelectNote(note)"
                @mouseenter="setActive('note', index)"
              >
                <icon-file class="item-icon" />
                <div class="item-info">
                  <div class="item-title" v-html="highlightKeyword(note.title)"></div>
                  <div class="item-desc" v-html="highlightKeyword(extractSnippet(note.content, searchQuery))"></div>
                </div>
                <div class="item-meta">
                  <span class="meta-repo">{{ note.repositoryName }}</span>
                  <span class="meta-date">{{ formatDate(note.updatedTime) }}</span>
                </div>
              </div>
            </div>

            <div v-if="repositories.length === 0 && notes.length === 0 && !loading" class="empty-state">
              <a-empty description="未找到相关内容" />
            </div>
          </template>

          <!-- Initial State (Recent / Start) -->
          <template v-else>
            <div class="result-group">
              <div class="group-title">开始</div>
              <div class="result-item" @click="handleCreateNote">
                <icon-plus class="item-icon" />
                <div class="item-info">
                  <span class="item-title">新建文档</span>
                  <span class="item-desc">&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;快速创建一个新文档</span>
                </div>
              </div>
            </div>

            <div v-if="recentNotes.length > 0" class="result-group">
              <div class="group-title">最近浏览</div>
              <div
                v-for="(note, index) in recentNotes"
                :key="'recent-' + note.id"
                :class="['result-item', { active: activeSection === 'recent' && activeIndex === index }]"
                @click="handleSelectNote(note)"
                @mouseenter="setActive('recent', index)"
              >
                <icon-file class="item-icon" />
                <div class="item-info">
                  <span class="item-title">{{ note.title }}</span>
                </div>
                <div class="item-meta">
                  <span class="meta-repo">{{ note.repositoryName }}</span>
                  <span class="meta-date">{{ formatDate(note.updatedTime) }}</span>
                </div>
              </div>
            </div>
          </template>
        </a-spin>
      </div>
    </div>
  </a-modal>
</template>

<script setup>
import { ref, nextTick } from 'vue'
import { useRouter } from 'vue-router'
import dayjs from 'dayjs'

const router = useRouter()
const visible = ref(false)
const searchQuery = ref('')
const loading = ref(false)
const searchInputRef = ref(null)

// Data
const repositories = ref([])
const notes = ref([])
const recentNotes = ref([])

// Navigation state
const activeSection = ref('recent') // 'repo', 'note', 'recent'
const activeIndex = ref(0)

const emit = defineEmits(['create-note'])

// Expose methods
defineExpose({
  show: () => {
    visible.value = true
    searchQuery.value = ''
    fetchRecentData()
  },
  hide: () => {
    visible.value = false
  }
})

const handleOpen = () => {
  nextTick(() => {
    searchInputRef.value?.focus()
  })
}

const handleClose = () => {
  visible.value = false
}

const formatDate = (date) => {
  if (!date) return ''
  return dayjs(date).format('YYYY-MM-DD')
}

const highlightKeyword = (text) => {
  if (!text || !searchQuery.value) return text || ''
  const escapedQuery = searchQuery.value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
  const regex = new RegExp(`(${escapedQuery})`, 'gi')
  return text.replace(regex, '<span class="highlight">$1</span>')
}

const extractSnippet = (content, keyword) => {
  if (!content) return ''
  const text = content.replace(/<[^>]+>/g, '')
  if (!keyword) return text.slice(0, 100)

  const index = text.toLowerCase().indexOf(keyword.toLowerCase())
  if (index === -1) return text.slice(0, 100)

  const start = Math.max(0, index - 20)
  const end = Math.min(text.length, index + 80)
  return (start > 0 ? '...' : '') + text.slice(start, end) + (end < text.length ? '...' : '')
}

const fetchRecentData = async () => {
  loading.value = true
  try {
    // Fetch all notes and sort by updatedTime to simulate "Recent"
    // Ideally backend should provide getRecentNotes or paginated getAllNotes
    const allNotes = await window.electronAPI.getAllNotes()

    // Enrich with repository names manually since getAllNotes might not include it (checking IPC implementation)
    // Wait, getAllNotes in curd.js: SELECT * FROM notes. It does NOT join repositories.
    // So we need to fetch repositories to map names.
    const allRepos = await window.electronAPI.getAllRepositories()
    const repoMap = new Map(allRepos.map((r) => [r.id, r.name]))

    recentNotes.value = allNotes
      .sort((a, b) => new Date(b.updatedTime) - new Date(a.updatedTime))
      .slice(0, 10)
      .map((note) => ({
        ...note,
        repositoryName: repoMap.get(note.repositoryId) || '未知知识库'
      }))

    activeSection.value = 'recent'
    activeIndex.value = 0
  } catch (error) {
    console.error('Failed to fetch recent data:', error)
  } finally {
    loading.value = false
  }
}

let searchTimeout
const handleSearch = () => {
  if (searchTimeout) clearTimeout(searchTimeout)
  searchTimeout = setTimeout(performSearch, 300)
}

const performSearch = async () => {
  if (!searchQuery.value) {
    repositories.value = []
    notes.value = []
    fetchRecentData()
    return
  }

  loading.value = true
  try {
    // 1. Search Notes
    const noteResults = await window.electronAPI.searchNotes(searchQuery.value)
    notes.value = noteResults

    // 2. Search Repositories (Client-side filtering for now)
    const allRepos = await window.electronAPI.getAllRepositories()
    repositories.value = allRepos.filter((repo) => repo.name.toLowerCase().includes(searchQuery.value.toLowerCase()))

    // Reset selection
    if (repositories.value.length > 0) {
      activeSection.value = 'repo'
      activeIndex.value = 0
    } else if (notes.value.length > 0) {
      activeSection.value = 'note'
      activeIndex.value = 0
    } else {
      activeSection.value = ''
      activeIndex.value = -1
    }
  } catch (error) {
    console.error('Search failed:', error)
  } finally {
    loading.value = false
  }
}

const setActive = (section, index) => {
  activeSection.value = section
  activeIndex.value = index
}

/*
const isItemActive = (section, index) => {
  return activeSection.value === section && activeIndex.value === index
}
*/

const navigateResults = (direction) => {
  // Navigation logic across sections
  // Order: Repo -> Note (when searching) OR Recent (when empty)

  const sections = []
  if (searchQuery.value) {
    if (repositories.value.length) sections.push({ name: 'repo', count: repositories.value.length })
    if (notes.value.length) sections.push({ name: 'note', count: notes.value.length })
  } else {
    // Initial state: just recent
    // Wait, initial state has 'Start' (Create Note) which is handled as a special item or section?
    // I put it as a static item. Let's say 'start' section has 1 item.
    sections.push({ name: 'start', count: 1 }) // The "Create Document" button
    if (recentNotes.value.length) sections.push({ name: 'recent', count: recentNotes.value.length })
  }

  if (sections.length === 0) return

  // Find current section index
  let currentSectionIndex = sections.findIndex((s) => s.name === activeSection.value)
  if (currentSectionIndex === -1) {
    // Default to first
    activeSection.value = sections[0].name
    activeIndex.value = 0
    return
  }

  let newIndex = activeIndex.value + direction
  const currentSection = sections[currentSectionIndex]

  if (newIndex < 0) {
    // Move to previous section
    if (currentSectionIndex > 0) {
      activeSection.value = sections[currentSectionIndex - 1].name
      activeIndex.value = sections[currentSectionIndex - 1].count - 1
    } else {
      // Loop to last section? Or stop? Let's stop at top.
      activeIndex.value = 0
    }
  } else if (newIndex >= currentSection.count) {
    // Move to next section
    if (currentSectionIndex < sections.length - 1) {
      activeSection.value = sections[currentSectionIndex + 1].name
      activeIndex.value = 0
    } else {
      // Stop at bottom
      activeIndex.value = currentSection.count - 1
    }
  } else {
    activeIndex.value = newIndex
  }

  // Auto-scroll could be added here
}

const handleEnter = () => {
  if (activeSection.value === 'repo') {
    handleSelectRepo(repositories.value[activeIndex.value])
  } else if (activeSection.value === 'note') {
    handleSelectNote(notes.value[activeIndex.value])
  } else if (activeSection.value === 'recent') {
    handleSelectNote(recentNotes.value[activeIndex.value])
  } else if (activeSection.value === 'start') {
    handleCreateNote() // Create new note
  }
}

const handleSelectRepo = (repo) => {
  // Maybe filter side panel by repo?
  // For now just console log or maybe navigate to home with repo filter?
  // The app doesn't seem to have a repo view page yet, just side panel selection.
  // We can just close modal.
  console.log('Selected repo:', repo)
  handleClose()
}

const handleSelectNote = (note) => {
  if (!note) return
  router.push(`/noteEditor/${note.id}`)
  handleClose()
}

const handleCreateNote = () => {
  handleClose()
  emit('create-note')
}
</script>

<style>
/* Global modal override for this specific modal */
.search-modal-container {
  background: transparent !important;
  box-shadow: none !important;
  padding: 0 !important;
}

.search-modal-container .arco-modal {
  background: transparent !important;
  box-shadow: none !important;
  padding: 0 !important;
}

.search-modal-container .arco-modal-header,
.search-modal-container .arco-modal-footer {
  display: none;
}

.search-modal-container .arco-modal-content {
  background: transparent !important;
  padding: 0 !important;
  border: none !important;
  box-shadow: none !important;
}

.search-modal-container .arco-modal-body {
  padding: 0 !important;
  background: transparent !important;
}
</style>

<style scoped>
.search-panel {
  background: var(--color-bg-2);
  border-radius: 12px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
  display: flex;
  flex-direction: column;
  overflow: hidden;
  border: 1px solid var(--color-border-2);
}

.search-input-wrapper {
  display: flex;
  align-items: center;
  padding: 16px 20px;
  border-bottom: 1px solid var(--color-border-1);
  background: var(--color-bg-1);
}

.search-icon {
  color: var(--color-neutral-6);
  margin-right: 12px;
}

.search-input {
  flex: 1;
  border: none;
  outline: none;
  font-size: 16px;
  background: transparent;
  color: var(--color-text-1);
}

.search-input::placeholder {
  color: var(--color-neutral-4);
}

.search-hint {
  display: flex;
  align-items: center;
  color: var(--color-neutral-4);
  font-size: 12px;
}

.hint-item {
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 2px 6px;
  background: var(--color-fill-2);
  border-radius: 4px;
}

.search-content {
  max-height: 500px;
  overflow-y: auto;
  padding: 12px 0;
}

.spin-container {
  width: 100%;
}

.result-group {
  margin-bottom: 12px;
}

.group-title {
  padding: 8px 20px;
  font-size: 12px;
  color: var(--color-neutral-5);
  font-weight: 500;
}

.result-item {
  display: flex;
  align-items: center;
  padding: 10px 20px;
  cursor: pointer;
  transition: all 0.1s;
  border-left: 3px solid transparent;
}

.result-item:hover,
.result-item.active {
  background-color: var(--color-fill-2);
}

.result-item.active {
  border-left-color: rgb(var(--primary-6));
}

.item-icon {
  font-size: 18px;
  color: var(--color-neutral-6);
  margin-right: 12px;
  flex-shrink: 0;
}

.item-info {
  flex: 1;
  overflow: hidden;
}

.item-title {
  font-size: 14px;
  color: var(--color-text-1);
  margin-bottom: 2px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.item-desc {
  font-size: 12px;
  color: var(--color-neutral-6);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.item-meta {
  display: flex;
  align-items: center;
  font-size: 12px;
  color: var(--color-neutral-6);
  margin-left: 12px;
  flex-shrink: 0;
}

.meta-repo {
  margin-right: 12px;
}

.item-action {
  font-size: 12px;
  color: var(--color-neutral-4);
  background: var(--color-fill-3);
  padding: 2px 6px;
  border-radius: 4px;
  opacity: 0;
  transition: opacity 0.2s;
}

.result-item:hover .item-action,
.result-item.active .item-action {
  opacity: 1;
}

.empty-state {
  padding: 40px 0;
}

:deep(.highlight) {
  color: rgb(var(--primary-6));
  background-color: var(--color-primary-light-1);
  padding: 0 2px;
  border-radius: 2px;
}
</style>
