<template>
  <div spellcheck="false">
    <a-scrollbar
      :style="{
        padding: '24px',
        maxWidth: '1500px',
        margin: '0 auto',
        position: 'relative'
      }"
      class="editor-content"
    >
      <a-row :style="{ alignItems: 'stretch' }">
        <a-col :md="16" :lg="18">
          <div :style="{ margin: '100px 20px' }">
            <a-typography-title :style="{ fontWeight: '600', margin: '50px 0' }">
              {{ title }}
            </a-typography-title>
            <bubble-menu
              v-if="editor"
              :editor="editor"
              :tippy-options="{
                duration: 100,
                placement: 'top-start'
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
        <a-col
          :md="8"
          :lg="6"
          :style="{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'flex-start',
            justifyContent: 'flex-start',
            paddingLeft: '20px'
          }"
        >
          <div
            class="toc-container"
            :style="{
              position: 'sticky',
              top: '22vh',
              width: '100%',
              maxWidth: '300px',
              borderRadius: '8px',
              padding: '12px',
              maxHeight: '60vh',
              overflowY: 'auto'
            }"
          >
            <a-anchor
              :change-hash="false"
              :style="{
                width: '100%',
                minHeight: '100px'
              }"
              scroll-container=".editor-content"
            >
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
  height: 92vh;
  overflow: auto;
}

.ProseMirror-focused {
  outline: none;
  box-shadow: none;
}
</style>

<style scoped>
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
