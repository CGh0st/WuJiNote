<template>
  <div class="home-container">
    <header-bar>
      <a-breadcrumb class="breadcrumb-container">
        <a-breadcrumb-item>吾记</a-breadcrumb-item>
        <a-breadcrumb-item class="breadcrumb-item">主页</a-breadcrumb-item>
      </a-breadcrumb>
    </header-bar>
    <a-empty>吾记，记录吾言</a-empty>
  </div>
</template>
<script setup>
import HeaderBar from '../components/defaultLayout/headerBar.vue'
</script>
<style scoped>
.home-container {
  height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
}

.breadcrumb-container {
  color: var(--color-neutral-8);
}

.breadcrumb-item {
  color: var(--color-neutral-8);
}

:deep(.arco-tree-node-selected .arco-tree-node-title, .arco-tree-node-selected),
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
</style>
