<template>
  <div class="task-page">
    <div class="task-header">
      <h2>任务执行</h2>
      <p class="desc">输入任务描述，让 AI Agent 帮你执行</p>
    </div>

    <div class="task-body">
      <el-input
        v-model="taskInput"
        type="textarea"
        :rows="4"
        placeholder="请输入任务描述，例如：Read the file requirements.txt"
        :disabled="loading"
      />
      <el-button
        type="primary"
        size="large"
        class="run-btn"
        @click="runTask"
        :loading="loading"
        :disabled="!taskInput.trim()"
      >
        执行任务
      </el-button>

      <div v-if="result !== null" class="result-card">
        <div class="result-title">执行结果</div>
        <div class="result-content">{{ result }}</div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { ElMessage } from 'element-plus'
import { startTask } from '@/api/task'

const taskInput = ref('')
const loading = ref(false)
const result = ref<string | null>(null)

async function runTask() {
  const task = taskInput.value.trim()
  if (!task || loading.value) return

  loading.value = true
  result.value = null

  try {
    const res = await startTask({ task })
    result.value = res.data?.result || '无返回结果'
    ElMessage.success('任务执行完成')
  } catch {
    result.value = '任务执行失败，请重试'
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
.task-page {
  padding: 32px;
  max-width: 720px;
  margin: 0 auto;
  height: 100vh;
}

.task-header {
  margin-bottom: 28px;
}

.task-header h2 {
  margin: 0 0 6px;
  font-size: 22px;
  color: #303133;
}

.task-header .desc {
  margin: 0;
  color: #909399;
  font-size: 14px;
}

.task-body {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.run-btn {
  align-self: flex-start;
  padding: 10px 32px;
}

.result-card {
  background: #fff;
  border: 1px solid #e8ecf1;
  border-radius: 8px;
  overflow: hidden;
}

.result-title {
  padding: 12px 20px;
  background: #f5f7fa;
  font-weight: 600;
  font-size: 14px;
  color: #606266;
  border-bottom: 1px solid #e8ecf1;
}

.result-content {
  padding: 20px;
  font-size: 14px;
  line-height: 1.7;
  color: #303133;
  white-space: pre-wrap;
  word-break: break-word;
}
</style>
