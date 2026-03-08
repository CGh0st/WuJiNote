<template>
  <div class="dropdown-menu">
    <template v-if="items.length">
      <div v-for="(item, index) in items" :key="index" class="menu-item-wrapper">
        <button
          v-if="item.type === 1"
          class="menu-item"
          :class="{ 'is-selected': index === selectedIndex }"
          @click="selectItem(index)"
        >
          <div class="icon-wrapper">
            <component :is="icons[item.iconName]" v-if="item.iconName && icons[item.iconName]" />
          </div>
          <span class="menu-title">{{ item.title }}</span>
        </button>
        <div v-else class="menu-divider"></div>
      </div>
    </template>
    <div v-else class="no-result">无结果</div>
  </div>
</template>

<script setup>
import { ref, watch } from 'vue'
import {
  IconH1,
  IconH2,
  IconH3,
  IconAlignLeft,
  IconCode,
  IconUnorderedList,
  IconOrderedList,
  IconBold,
  IconItalic,
  IconStrikethrough
} from '@arco-design/web-vue/es/icon'

const icons = {
  'icon-h1': IconH1,
  'icon-h2': IconH2,
  'icon-h3': IconH3,
  'icon-align-left': IconAlignLeft,
  'icon-code': IconCode,
  'icon-unordered-list': IconUnorderedList,
  'icon-ordered-list': IconOrderedList,
  'icon-bold': IconBold,
  'icon-italic': IconItalic,
  'icon-strikethrough': IconStrikethrough
}

const props = defineProps({
  items: {
    type: Array,
    required: true
  },
  command: {
    type: Function,
    required: true
  }
})

const selectedIndex = ref(0)

watch(
  () => props.items,
  () => {
    selectedIndex.value = 0
  }
)

const onKeyDown = ({ event }) => {
  if (event.key === 'ArrowUp') {
    upHandler()
    return true
  }

  if (event.key === 'ArrowDown') {
    downHandler()
    return true
  }

  if (event.key === 'Enter') {
    enterHandler()
    return true
  }

  return false
}

const upHandler = () => {
  selectedIndex.value = (selectedIndex.value + props.items.length - 1) % props.items.length
}

const downHandler = () => {
  selectedIndex.value = (selectedIndex.value + 1) % props.items.length
}

const enterHandler = () => {
  selectItem(selectedIndex.value)
}

const selectItem = (index) => {
  const item = props.items[index]

  if (item) {
    props.command(item)
  }
}

defineExpose({
  onKeyDown
})
</script>

<style scoped lang="scss">
/* Dropdown menu - Reference bubbleButton.vue style */
.dropdown-menu {
  background: var(--color-bg-2) !important;
  border: 1px solid var(--color-border-2);
  border-radius: 6px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  padding: 4px;
  display: flex;
  flex-direction: column;
  max-height: 300px;
  overflow-y: auto;
  width: 200px; /* Adjust width as needed */
  gap: 2px;

  /* Hide Scrollbar */
  scrollbar-width: none; /* Firefox */
  -ms-overflow-style: none; /* IE 10+ */

  &::-webkit-scrollbar {
    display: none;
  }
}

.menu-item-wrapper {
  width: 100%;
}

.menu-item {
  display: flex;
  align-items: center;
  justify-content: flex-start;
  width: 100%;
  height: 30px; /* Match bubbleButton button height */
  padding: 0 10px;
  color: var(--color-neutral-8);
  background: transparent;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
  transition: all 0.1s;
  text-align: left;
  gap: 8px;

  &:hover,
  &.is-selected {
    background-color: var(--color-neutral-2);
    color: var(--color-text-1);
  }

  .icon-wrapper {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 16px;
    height: 16px;
    
    /* Ensure icon inherits color or specific style if needed */
    :deep(svg) {
      width: 16px;
      height: 16px;
      stroke-width: 4; /* Match bubbleButton icon stroke width */
    }
  }

  .menu-title {
    flex: 1;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }
}

.menu-divider {
  border-top: 1px solid var(--color-border-2);
  margin: 4px 0;
}

.no-result {
  color: var(--color-neutral-8);
  padding: 8px;
  text-align: center;
  font-size: 14px;
}
</style>