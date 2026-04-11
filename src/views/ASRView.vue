<template>
  <div class="asr-page">
    <div class="asr-header">
      <h2>语音识别</h2>
      <p class="desc">上传音频文件或使用浏览器录音，进行语音转文字</p>
    </div>

    <div class="asr-body">
      <!-- 录音区 -->
      <el-card shadow="never" class="section-card">
        <div class="section-title">录音</div>
        <div class="record-area">
          <el-button
            :type="recording ? 'danger' : 'primary'"
            size="large"
            circle
            @click="toggleRecording"
          >
            <el-icon :size="24"><Microphone /></el-icon>
          </el-button>
          <span class="record-hint">{{ recording ? '点击停止' : '点击开始录音' }}</span>
          <span v-if="recording" class="record-timer">{{ recordDuration }}s</span>
        </div>
      </el-card>

      <!-- 上传区 -->
      <el-card shadow="never" class="section-card">
        <div class="section-title">上传文件</div>
        <el-upload
          ref="uploadRef"
          drag
          :auto-upload="false"
          :limit="1"
          accept=".wav,.mp3,.m4a,.flac"
          :on-change="onFileChange"
          :on-remove="onFileRemove"
        >
          <el-icon :size="40" class="upload-icon"><Upload /></el-icon>
          <div>拖拽文件到此处，或<em>点击选择</em></div>
          <template #tip>
            <div class="upload-tip">支持 WAV / MP3 / M4A / FLAC，最大 10MB</div>
          </template>
        </el-upload>
      </el-card>

      <!-- 操作按钮 -->
      <el-button
        type="primary"
        size="large"
        class="recognize-btn"
        :loading="loading"
        :disabled="!audioFile"
        @click="recognize"
      >
        {{ loading ? '识别中...' : '开始识别' }}
      </el-button>

      <!-- 结果 -->
      <div v-if="result" class="result-card">
        <div class="result-title">识别结果</div>
        <div class="result-content">{{ result }}</div>
        <div class="result-meta">
          <span v-if="duration">耗时 {{ (duration / 1000).toFixed(1) }}s</span>
          <el-button text type="primary" size="small" @click="copyResult">复制</el-button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onUnmounted } from 'vue'
import { ElMessage } from 'element-plus'
import { Microphone, Upload } from '@element-plus/icons-vue'
import { transcribeAudio } from '@/api/asr'
import type { UploadFile } from 'element-plus'

const loading = ref(false)
const result = ref('')
const duration = ref(0)
const audioFile = ref<File | null>(null)
const uploadRef = ref()

// 录音相关
const recording = ref(false)
const recordDuration = ref(0)
let mediaRecorder: MediaRecorder | null = null
let audioChunks: Blob[] = []
let timer: ReturnType<typeof setInterval> | null = null

async function toggleRecording() {
  if (recording.value) {
    stopRecording()
  } else {
    await startRecording()
  }
}

async function startRecording() {
  try {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
    mediaRecorder = new MediaRecorder(stream, { mimeType: 'audio/webm' })
    audioChunks = []

    mediaRecorder.ondataavailable = (e) => {
      if (e.data.size > 0) audioChunks.push(e.data)
    }

    mediaRecorder.onstop = () => {
      const blob = new Blob(audioChunks, { type: 'audio/webm' })
      audioFile.value = new File([blob], 'recording.webm', { type: 'audio/webm' })
      stream.getTracks().forEach(t => t.stop())
    }

    mediaRecorder.start()
    recording.value = true
    recordDuration.value = 0
    timer = setInterval(() => { recordDuration.value++ }, 1000)
  } catch {
    ElMessage.error('无法访问麦克风，请检查浏览器权限')
  }
}

function stopRecording() {
  if (mediaRecorder && mediaRecorder.state !== 'inactive') {
    mediaRecorder.stop()
  }
  recording.value = false
  if (timer) { clearInterval(timer); timer = null }
}

function onFileChange(file: UploadFile) {
  if (file.raw) {
    if (file.raw.size > 10 * 1024 * 1024) {
      ElMessage.warning('文件大小不能超过 10MB')
      uploadRef.value?.clearFiles()
      return
    }
    audioFile.value = file.raw
  }
}

function onFileRemove() {
  audioFile.value = null
}

async function recognize() {
  if (!audioFile.value || loading.value) return
  loading.value = true
  result.value = ''
  duration.value = 0

  try {
    const res = await transcribeAudio(audioFile.value)
    result.value = res.data.text
    duration.value = res.data.duration
  } catch {
    result.value = '识别失败，请重试'
  } finally {
    loading.value = false
  }
}

function copyResult() {
  navigator.clipboard.writeText(result.value)
  ElMessage.success('已复制到剪贴板')
}

onUnmounted(() => {
  if (timer) clearInterval(timer)
  if (mediaRecorder && mediaRecorder.state !== 'inactive') {
    mediaRecorder.stop()
  }
})
</script>

<style scoped>
.asr-page {
  padding: 32px;
  max-width: 720px;
  margin: 0 auto;
  height: 100vh;
  overflow-y: auto;
}

.asr-header {
  margin-bottom: 28px;
}

.asr-header h2 {
  margin: 0 0 6px;
  font-size: 22px;
  color: #303133;
}

.asr-header .desc {
  margin: 0;
  color: #909399;
  font-size: 14px;
}

.asr-body {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.section-card {
  border-radius: 8px;
}

.section-title {
  font-weight: 600;
  font-size: 15px;
  color: #303133;
  margin-bottom: 16px;
}

/* 录音区 */
.record-area {
  display: flex;
  align-items: center;
  gap: 12px;
}

.record-hint {
  font-size: 14px;
  color: #606266;
}

.record-timer {
  font-size: 14px;
  color: #f56c6c;
  font-variant-numeric: tabular-nums;
}

/* 上传区 */
.upload-icon {
  color: #c0c4cc;
  margin-bottom: 8px;
}

.upload-tip {
  font-size: 12px;
  color: #909399;
  margin-top: 4px;
}

/* 识别按钮 */
.recognize-btn {
  align-self: flex-start;
  padding: 10px 32px;
}

/* 结果卡片 */
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
  font-size: 15px;
  line-height: 1.7;
  color: #303133;
  white-space: pre-wrap;
  word-break: break-word;
}

.result-meta {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 8px 20px;
  border-top: 1px solid #e8ecf1;
  font-size: 12px;
  color: #909399;
}
</style>
