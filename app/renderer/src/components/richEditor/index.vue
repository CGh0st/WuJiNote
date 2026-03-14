<template>
  <div spellcheck="false">
    <a-scrollbar class="editor-content">
      <a-row class="editor-row">
        <a-col :md="16" :lg="18">
          <div class="editor-main">
            <a-typography-title class="editor-title">
              {{ title }}
            </a-typography-title>
            <bubble-menu
              v-if="editor"
              :editor="editor"
              :tippy-options="{
                duration: 100,
                placement: 'top-start',
                appendTo: () => document.body,
                popperOptions: {
                  strategy: 'fixed'
                }
              }"
            >
              <bubbleButton :editor="editor"></bubbleButton>
            </bubble-menu>
            <editor-content :editor="editor" class="tiptap" />
            <drag-handle v-if="editor" :editor="editor">
              <div class="custom-drag-handle" />
            </drag-handle>
          </div>
        </a-col>
        <a-col :md="8" :lg="6" class="editor-toc-col">
          <div class="toc-container">
            <a-anchor :change-hash="false" class="toc-anchor" scroll-container=".editor-content">
              <a-anchor-link title="大纲"></a-anchor-link>
              <!-- 调用递归渲染方法 -->
              <template v-for="node in tocTree" :key="node.content">
                <a-anchor-link :href="'#' + node.id" :title="node.content">
                  <!-- 如果有子节点，递归渲染 -->
                  <template v-if="node.children && node.children.length > 0" #sublist>
                    <a-anchor-link
                      v-for="child in node.children"
                      :key="child.id"
                      :href="'#' + child.id"
                      :title="child.content"
                    >
                      <template #sublist>
                        <!-- 递归调用子目录 -->
                        <template v-for="subChild in child.children" :key="subChild.id">
                          <a-anchor-link :href="'#' + subChild.id" :title="subChild.content">
                            <!-- 可以继续嵌套，支持更深层级 -->
                          </a-anchor-link>
                        </template>
                      </template>
                    </a-anchor-link>
                  </template>
                </a-anchor-link>
              </template>
            </a-anchor>
          </div>
        </a-col>
      </a-row>
    </a-scrollbar>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import bubbleButton from './bubbleButton.vue'
import { DragHandle } from '@tiptap-pro/extension-drag-handle-vue-3'
import { BubbleMenu, EditorContent } from '@tiptap/vue-3'
import { useTiptapEditor } from './useTiptapEditor.js'

const props = defineProps({
  title: {
    type: String,
    default: '未命名笔记'
  },
  content: {
    type: [String, Object],
    default: ''
  }
})

const emit = defineEmits(['update:content'])

// 目录数据
const tocTree = ref([])

// 使用自定义 Hook 初始化编辑器
const editor = useTiptapEditor(props, emit, tocTree)

const toggleEditing = (isEditable) => {
  if (editor.value) {
    editor.value.setEditable(isEditable)
  }
}

const getHTML = () => {
  if (editor.value) {
    return editor.value.getHTML()
  }
  return ''
}

const getJSON = () => {
  if (editor.value) {
    return editor.value.getJSON()
  }
  return {}
}

const setContent = (content) => {
  if (editor.value) {
    editor.value.commands.setContent(content)
  }
}

defineExpose({
  toggleEditing,
  getHTML,
  getJSON,
  setContent
})
</script>

<style>
/* 引入提取的样式 */
@import './editor.scss';

.editor-content {
  padding: 24px;
  max-width: 1500px;
  margin: 0 auto;
  position: relative;
  height: 92vh;
  overflow: auto;
}

.editor-row {
  align-items: stretch;
}

.editor-main {
  margin: 100px 20px;
}

.editor-title {
  font-weight: 600;
  margin: 50px 0;
}

.editor-toc-col {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  justify-content: flex-start;
  padding-left: 20px;
}

.ProseMirror-focused {
  outline: none;
  box-shadow: none;
}
</style>

<style scoped>
.toc-container {
  position: sticky;
  top: 22vh;
  width: 100%;
  max-width: 300px;
  border-radius: 8px;
  padding: 12px;
  max-height: 60vh;
  overflow-y: auto;
}

.toc-anchor {
  width: 100%;
  min-height: 100px;
}

.toc-container::-webkit-scrollbar {
  display: none;
}
.toc-container {
  scrollbar-width: none; /* Firefox */
}

:deep(.arco-anchor-line-slider) {
  background: rgb(var(--primary-6)) !important;
}
</style>
