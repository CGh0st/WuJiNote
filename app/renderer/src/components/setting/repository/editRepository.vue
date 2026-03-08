<!-- eslint-disable vue/require-prop-types -->
<template>
  <div>
    <a-modal v-model:visible="visible" :footer="false" :width="500" title-align="start" @cancel="closeModal">
      <template #title>
        <div :style="{ fontSize: '14px' }">编辑知识库</div>
      </template>
      <a-form ref="formRef" :model="form" :rules="rules" layout="vertical" @submit="editRepository">
        <a-form-item field="repositoryName" label="知识库名称" validate-trigger="change">
          <a-input v-model="form.repositoryName" placeholder="请输入知识库名称" />
        </a-form-item>
        <a-form-item>
          <a-button :loading="isLoading" :style="{ width: '100px' }" html-type="submit" type="primary"> 保存 </a-button>
        </a-form-item>
      </a-form>
    </a-modal>
  </div>
</template>

<script setup>
import { Notification } from '@arco-design/web-vue'
import { reactive, ref } from 'vue'

// --- State ---
const visible = ref(false)
const isLoading = ref(false)
const repositoryId = ref(null)
const formRef = ref(null)

const form = reactive({
  repositoryName: ''
})

const emit = defineEmits(['refresh'])

// --- Validation ---
const rules = {
  repositoryName: [
    { required: true, message: '请输入知识库名称' },
    { minLength: 1, maxLength: 20, message: '知识库名称长度在 1 到 20 个字符之间' },
    {
      validator: async (value, cb) => {
        // 如果名字没有改变，不需要校验重复
        if (value === originalRepositoryName.value) {
          cb()
          return
        }
        try {
          const isRepositoryNameExist = await window.electronAPI.getRepositoryByName(value)
          if (isRepositoryNameExist) {
            cb('知识库名称已存在')
          } else {
            cb()
          }
        } catch (error) {
          console.error('校验失败:', error)
          cb() // 校验出错时暂时放过，或根据需求处理
        }
      }
    }
  ]
}

// 记录原始名称，用于校验逻辑判断
const originalRepositoryName = ref('')

// --- Actions ---

/**
 * 打开编辑弹窗并加载数据
 * @param {number|string} id 知识库ID
 */
const showModal = async (id) => {
  visible.value = true
  repositoryId.value = id

  // 重置表单状态
  if (formRef.value) {
    formRef.value.resetFields()
    formRef.value.clearValidate()
  }

  try {
    const repository = await window.electronAPI.getRepositoryById(id)
    if (repository) {
      form.repositoryName = repository.name
      originalRepositoryName.value = repository.name
    } else {
      Notification.error({
        content: '知识库不存在或已被删除',
        style: { lineHeight: 'normal' }
      })
      visible.value = false
    }
  } catch (error) {
    console.error('加载知识库详情失败:', error)
    Notification.error({
      content: '加载失败',
      style: { lineHeight: 'normal' }
    })
  }
}

/**
 * 关闭弹窗
 */
const closeModal = () => {
  visible.value = false
}

/**
 * 提交表单
 */
const editRepository = async ({ errors }) => {
  if (errors) return

  isLoading.value = true
  try {
    const result = await window.electronAPI.updateRepository(repositoryId.value, form.repositoryName)
    if (result) {
      Notification.success({
        content: '修改成功',
        style: { lineHeight: 'normal' }
      })
      emit('refresh')
      // 触发侧边栏刷新事件
      window.dispatchEvent(new Event('refresh-side-panel-tree'))
      closeModal()
    } else {
      Notification.error({
        content: '修改失败',
        style: { lineHeight: 'normal' }
      })
    }
  } catch (error) {
    console.error('更新知识库失败:', error)
    Notification.error({
      content: '系统错误，修改失败',
      style: { lineHeight: 'normal' }
    })
  } finally {
    isLoading.value = false
  }
}

defineExpose({
  showModal
})
</script>
