<template>
  <div class="bubble-menu-container">
    <a-dropdown :popup-max-height="false">
      <a-button class="dropdown-btn" type="text">
        <icon-line-height :size="16" :stroke-width="4" />
        <icon-down class="icon-down" />
      </a-button>
      <template #content>
        <a-dgroup title="标题">
          <a-doption
            class="dropdown-option"
            :class="{ 'is-active': props.editor.isActive('heading', { level: 1 }) }"
            @click="props.editor.chain().focus().toggleHeading({ level: 1 }).run()"
          >
            <template #icon>
              <icon-h1 :size="16" :stroke-width="4" />
            </template>
            <template #default>一级标题</template>
          </a-doption>
          <a-doption
            class="dropdown-option"
            :class="{ 'is-active': props.editor.isActive('heading', { level: 2 }) }"
            @click="props.editor.chain().focus().toggleHeading({ level: 2 }).run()"
          >
            <template #icon>
              <icon-h2 :size="16" :stroke-width="4" />
            </template>
            <template #default>二级标题</template>
          </a-doption>
          <a-doption
            class="dropdown-option"
            :class="{ 'is-active': props.editor.isActive('heading', { level: 3 }) }"
            @click="props.editor.chain().focus().toggleHeading({ level: 3 }).run()"
          >
            <template #icon>
              <icon-h3 :size="16" :stroke-width="4" />
            </template>
            <template #default>三级标题</template>
          </a-doption>
          <a-doption
            class="dropdown-option"
            :class="{ 'is-active': props.editor.isActive('paragraph') }"
            @click="props.editor.chain().focus().setParagraph().run()"
          >
            <template #icon>
              <icon-language :size="16" :stroke-width="4" />
            </template>
            <template #default>正文段落</template>
          </a-doption>
        </a-dgroup>

        <a-dgroup title="列表">
          <a-doption
            class="dropdown-option"
            :class="{ 'is-active': props.editor.isActive('orderedList') }"
            @click="props.editor.chain().focus().toggleOrderedList().run()"
          >
            <template #icon>
              <icon-ordered-list :size="16" :stroke-width="4" />
            </template>
            <template #default>有序列表</template>
          </a-doption>
          <a-doption
            class="dropdown-option"
            :class="{ 'is-active': props.editor.isActive('unorderedList') }"
            @click="props.editor.chain().focus().toggleBulletList().run()"
          >
            <template #icon>
              <icon-unordered-list :size="16" :stroke-width="4" />
            </template>
            <template #default>无序列表</template>
          </a-doption>
          <a-doption
            class="dropdown-option"
            :class="{ 'is-active': props.editor.isActive('taskList') }"
            @click="editor.chain().focus().toggleTaskList().run()"
          >
            <template #icon>
              <icon-check-square :size="16" :stroke-width="4" />
            </template>
            <template #default>待办列表</template>
          </a-doption>
        </a-dgroup>
      </template>
    </a-dropdown>

    <a-button
      type="text"
      class="menu-btn"
      :class="{ 'is-active': props.editor.isActive('bold') }"
      @click="props.editor.chain().focus().toggleBold().run()"
    >
      <template #icon>
        <icon-bold :stroke-width="4" :size="16" />
      </template>
    </a-button>
    <a-button
      type="text"
      class="menu-btn"
      :class="{ 'is-active': props.editor.isActive('italic') }"
      @click="props.editor.chain().focus().toggleItalic().run()"
    >
      <template #icon>
        <icon-italic :stroke-width="4" :size="16" />
      </template>
    </a-button>
    <a-button
      type="text"
      class="menu-btn"
      :class="{ 'is-active': props.editor.isActive('strike') }"
      @click="props.editor.chain().focus().toggleStrike().run()"
    >
      <template #icon>
        <icon-strikethrough :stroke-width="4" :size="16" />
      </template>
    </a-button>
    <a-button
      type="text"
      class="menu-btn"
      :class="{ 'is-active': props.editor.isActive('codeBlock') }"
      @click="props.editor.chain().focus().toggleCodeBlock().run()"
    >
      <template #icon>
        <icon-code :stroke-width="4" :size="16" />
      </template>
    </a-button>

    <a-trigger trigger="click" :unmount-on-close="false" position="bottom" align-point>
      <a-button
        type="text"
        class="menu-btn"
        :class="{ 'is-active': props.editor.isActive('highlight') }"
      >
        <template #icon>
          <icon-highlight :stroke-width="4" :size="16" />
        </template>
      </a-button>
      <template #content>
        <div
          class="highlight-popup"
          @click.stop
          @mousedown.stop
        >
          <div class="highlight-header">
            <span class="highlight-title">背景颜色</span>
            <a-button
              type="text"
              size="mini"
              class="clear-btn"
              @click="props.editor.chain().unsetHighlight().run()"
            >
              清除
            </a-button>
          </div>
          <a-color-picker hide-trigger show-preset class="color-picker" @change="handleColorChange" />
        </div>
      </template>
    </a-trigger>
    <!--colorPicker ref="colorPickerModalRef" :editor="props.editor"></colorPicker-->
  </div>
</template>

<script setup>
const props = defineProps({
  editor: Object
})

const handleColorChange = (newValue) => {
  const result = props.editor.chain().toggleHighlight({ color: newValue }).run()
  console.log('Toggle Highlight Result:', result)
}
</script>

<style scoped>
.bubble-menu-container {
  background: var(--color-bg-2) !important;
  border: 1px solid var(--color-border-2);
  border-radius: 6px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  padding: 4px;
  gap: 4px;
  display: flex; /* Added display flex to handle gap */
  align-items: center; /* Align items vertically */
}

.dropdown-btn {
  height: 30px;
  color: var(--color-neutral-8);
  padding: 0 10px;
}

.icon-down {
  margin-left: 5px;
}

.dropdown-option {
  color: var(--color-neutral-8);
}

.dropdown-option.is-active {
  background-color: var(--color-neutral-2);
}

.menu-btn {
  color: var(--color-neutral-8);
}

.menu-btn.is-active {
  background-color: var(--color-neutral-2);
}

.highlight-popup {
  margin: 10px;
  width: 240px;
  background-color: var(--color-bg-3);
  border-radius: 4px;
  box-shadow: 0 2px 8px 0 rgba(0, 0, 0, 0.15);
  padding: 12px;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.highlight-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 4px;
}

.highlight-title {
  font-size: 12px;
  color: var(--color-neutral-6);
}

.clear-btn {
  padding: 0 4px;
  height: 20px;
}

.color-picker {
  width: 100%;
}

:deep(.arco-dropdown-list) {
  margin: 10px;
}

:global(.arco-dropdown) {
  background: var(--color-bg-2) !important;
}
</style>
