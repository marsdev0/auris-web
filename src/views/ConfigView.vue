<template>
  <div class="config-page">
    <div class="config-header">
      <h2>Agent 配置</h2>
      <p class="desc">调整 AI Agent 的运行参数</p>
    </div>

    <el-card class="config-card">
      <el-form :model="form" label-width="120px" label-position="left">
        <el-form-item label="最大迭代次数">
          <el-input-number v-model="form.maxIterations" :min="1" :max="100" />
        </el-form-item>
        <el-form-item label="最大 Token 数">
          <el-input-number v-model="form.maxTokens" :min="256" :max="128000" :step="256" />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="save" :loading="saving">保存配置</el-button>
        </el-form-item>
      </el-form>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { reactive, ref } from 'vue'
import { ElMessage } from 'element-plus'
import { updateConfig } from '@/api/config'

const form = reactive({
  maxIterations: 10,
  maxTokens: 4096
})

const saving = ref(false)

async function save() {
  saving.value = true
  try {
    await updateConfig({
      maxIterations: form.maxIterations,
      maxTokens: form.maxTokens
    })
    ElMessage.success('配置已更新')
  } catch {
    // 拦截器已处理错误提示
  } finally {
    saving.value = false
  }
}
</script>

<style scoped>
.config-page {
  padding: 32px;
  max-width: 600px;
  margin: 0 auto;
}

.config-header {
  margin-bottom: 28px;
}

.config-header h2 {
  margin: 0 0 6px;
  font-size: 22px;
  color: #303133;
}

.config-header .desc {
  margin: 0;
  color: #909399;
  font-size: 14px;
}

.config-card {
  border-radius: 8px;
}
</style>
