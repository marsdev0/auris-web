<template>
  <div class="avatar-page">
    <!-- 顶栏 -->
    <div class="avatar-header">
      <div class="header-left">
        <div class="avatar-icon">V</div>
        <div>
          <div class="header-title">我的分身</div>
          <div class="header-desc">你的 AI 数字分身 — 学习你的风格，像你一样沟通</div>
        </div>
      </div>
      <el-tag type="success" effect="dark" round>已学习 {{ confirmedTags.length }} 项偏好</el-tag>
    </div>

    <!-- Tab 切换 -->
    <el-tabs v-model="activeTab" class="avatar-tabs">
      <!-- Tab 1: 对话 -->
      <el-tab-pane label="对话" name="chat">
        <div class="chat-area">
          <div class="chat-messages" ref="messagesRef">
            <div
              v-for="msg in messages"
              :key="msg.id"
              :class="['msg-row', msg.role]"
            >
              <div class="avatar-circle">
                {{ msg.role === 'user' ? 'U' : 'V' }}
              </div>
              <div class="msg-content">
                <div class="bubble" v-html="msg.content"></div>
                <!-- tag 提议卡片 -->
                <div v-if="msg.tagProposal" class="tag-proposal-card">
                  <div class="proposal-header">
                    <el-icon><Warning /></el-icon>
                    <span>分身提议新标签</span>
                  </div>
                  <div class="proposal-body">
                    <el-tag effect="plain">{{ msg.tagProposal.key }}</el-tag>
                    <span class="proposal-value">{{ msg.tagProposal.value }}</span>
                  </div>
                  <div class="proposal-evidence">
                    依据：{{ msg.tagProposal.evidence }}
                  </div>
                  <div class="proposal-actions">
                    <el-button type="primary" size="small" @click="confirmProposal(msg.tagProposal!.id)">确认</el-button>
                    <el-button size="small" @click="rejectProposal(msg.tagProposal!.id)">拒绝</el-button>
                  </div>
                </div>
              </div>
            </div>
            <div v-if="chatLoading" class="msg-row assistant">
              <div class="avatar-circle">V</div>
              <div class="bubble typing">思考中...</div>
            </div>
          </div>

          <div class="chat-input">
            <el-input
              v-model="chatInput"
              @keyup.enter="sendChat"
              placeholder="跟你的分身说话..."
              :disabled="chatLoading"
              size="large"
              clearable
            />
            <el-button
              type="primary"
              size="large"
              @click="sendChat"
              :disabled="chatLoading || !chatInput.trim()"
              :loading="chatLoading"
            >
              发送
            </el-button>
          </div>
        </div>
      </el-tab-pane>

      <!-- Tab 2: 认知管理 -->
      <el-tab-pane name="profile">
        <template #label>
          认知管理 <el-badge v-if="pendingTags.length" :value="pendingTags.length" class="tab-badge" />
        </template>
        <div class="profile-area">
          <!-- 待确认标签 -->
          <div v-if="pendingTags.length" class="section">
            <div class="section-title">
              <el-icon color="#e6a23c"><Warning /></el-icon>
              待确认 ({{ pendingTags.length }})
            </div>
            <div class="tag-cards">
              <div v-for="tag in pendingTags" :key="tag.id" class="tag-card pending">
                <div class="tag-card-top">
                  <el-tag effect="plain" type="warning">{{ tag.key }}</el-tag>
                  <span class="tag-value">{{ tag.value }}</span>
                </div>
                <div class="tag-evidence">{{ tag.evidence }}</div>
                <div class="tag-card-actions">
                  <el-button type="primary" size="small" @click="confirmProposal(tag.id)">确认</el-button>
                  <el-button size="small" @click="rejectProposal(tag.id)">拒绝</el-button>
                </div>
              </div>
            </div>
          </div>

          <!-- 已确认标签，按类别分组 -->
          <div v-for="group in tagGroups" :key="group.category" class="section">
            <div class="section-title">{{ group.category }}</div>
            <div class="tag-list">
              <div v-for="tag in group.tags" :key="tag.id" class="tag-item">
                <div class="tag-item-left">
                  <span class="tag-key">{{ tag.key }}</span>
                  <span class="tag-value">{{ tag.value }}</span>
                </div>
                <div class="tag-item-actions">
                  <el-button link type="primary" size="small" @click="editTag(tag)">编辑</el-button>
                  <el-button link type="danger" size="small" @click="deleteTag(tag.id)">删除</el-button>
                </div>
              </div>
            </div>
          </div>

          <!-- 手动添加 -->
          <div class="section">
            <el-button type="primary" plain @click="showAddDialog = true">
              <el-icon><Plus /></el-icon> 手动添加标签
            </el-button>
          </div>
        </div>
      </el-tab-pane>

      <!-- Tab 3: 权限配置 -->
      <el-tab-pane label="权限配置" name="config">
        <div class="config-area">
          <!-- 自主度等级 -->
          <div class="section">
            <div class="section-title">自主度等级</div>
            <div class="autonomy-levels">
              <div
                v-for="level in autonomyLevels"
                :key="level.value"
                :class="['level-card', { active: config.autonomy_level === level.value }]"
                @click="setAutonomyLevel(level.value)"
              >
                <div class="level-num">Lv.{{ level.value }}</div>
                <div class="level-name">{{ level.name }}</div>
                <div class="level-desc">{{ level.desc }}</div>
              </div>
            </div>
          </div>

          <!-- 能力开关 -->
          <div class="section">
            <div class="section-title">能力开关</div>
            <div class="ability-list">
              <div v-for="ability in abilities" :key="ability.key" class="ability-item">
                <div class="ability-info">
                  <span class="ability-name">{{ ability.name }}</span>
                  <span class="ability-desc">{{ ability.desc }}</span>
                </div>
                <el-switch v-model="config.abilities[ability.key]" />
              </div>
            </div>
          </div>

          <!-- 精细控制 -->
          <div class="section">
            <div class="section-title">精细控制</div>
            <div class="constraint-list">
              <div class="constraint-item">
                <span class="constraint-label">最大回复字数</span>
                <el-slider v-model="config.constraints.max_reply_length" :min="10" :max="200" :step="10" show-input size="small" />
              </div>
              <div class="constraint-item">
                <span class="constraint-label">回复延迟（秒）</span>
                <el-slider v-model="config.constraints.reply_delay_seconds" :min="0" :max="600" :step="30" show-input size="small" />
              </div>
            </div>
          </div>
        </div>
      </el-tab-pane>
    </el-tabs>

    <!-- 添加标签对话框 -->
    <el-dialog v-model="showAddDialog" title="手动添加标签" width="450px">
      <el-form label-width="80px">
        <el-form-item label="类别">
          <el-select v-model="newTag.category" placeholder="选择类别">
            <el-option label="沟通风格" value="沟通风格" />
            <el-option label="沟通节奏" value="沟通节奏" />
            <el-option label="社交偏好" value="社交偏好" />
            <el-option label="习惯用语" value="习惯用语" />
            <el-option label="知识偏好" value="知识偏好" />
          </el-select>
        </el-form-item>
        <el-form-item label="标签键">
          <el-input v-model="newTag.key" placeholder="如 reply_style" />
        </el-form-item>
        <el-form-item label="标签值">
          <el-input v-model="newTag.value" placeholder="如 简洁直接" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="showAddDialog = false">取消</el-button>
        <el-button type="primary" @click="addTag">添加</el-button>
      </template>
    </el-dialog>

    <!-- 编辑标签对话框 -->
    <el-dialog v-model="showEditDialog" title="编辑标签" width="450px">
      <el-form label-width="80px">
        <el-form-item label="标签键">
          <el-input :model-value="editingTag?.key" disabled />
        </el-form-item>
        <el-form-item label="标签值">
          <el-input v-model="editingTag!.value" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="showEditDialog = false">取消</el-button>
        <el-button type="primary" @click="saveEdit">保存</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, nextTick } from 'vue'
import { ElMessage } from 'element-plus'
import { Plus, Warning } from '@element-plus/icons-vue'

// ==================== Tab 控制 ====================
const activeTab = ref('chat')

// ==================== 对话 Tab ====================
interface ChatMsg {
  id: number
  role: 'user' | 'assistant'
  content: string
  tagProposal?: { id: number; key: string; value: string; evidence: string }
}

const messages = ref<ChatMsg[]>([
  {
    id: 1,
    role: 'assistant',
    content: '你好！我是你的 AI 分身。我会学习你的沟通风格和偏好，这样以后就能像你一样帮别人回复消息了。<br/><br/>你可以直接跟我聊天，也可以告诉我关于你的偏好，比如"我不喜欢开会"、"我回复别人一般都很简洁"。'
  }
])
const chatInput = ref('')
const chatLoading = ref(false)
const messagesRef = ref<HTMLElement | null>(null)

// mock 回复
const mockReplies: Record<string, { content: string; proposal?: { id: number; key: string; value: string; evidence: string } }> = {
  '不喜欢': {
    content: '记下了。你提到了不喜欢某件事，要我把这个记录为你的偏好吗？',
    proposal: { id: 201, key: 'dislike_pattern', value: '明确表达不喜欢时会直接说', evidence: '"我不太喜欢..." 多次出现在你的表达中' }
  },
  '帮忙': {
    content: '好的，交给我。等我进入社交模式后，就可以帮你处理这些事情了。目前我还在学习阶段，先把你的偏好了解透彻。'
  },
  '风格': {
    content: '根据我对你的了解，你的沟通风格是<strong>简洁直接</strong>，不寒暄，不用感叹号。常用"好的"、"收到"、"👌"。我会保持这个风格。'
  },
  '开会': {
    content: '了解，我把"不喜欢线上会议，倾向文字讨论"记录下来。',
    proposal: { id: 202, key: 'meeting_pref', value: '不喜欢线上会议，倾向文字讨论', evidence: '多次表达对线上会议的回避倾向' }
  },
  '_default': {
    content: '收到。我正在持续学习你的表达习惯和偏好，有什么想让我记住的随时告诉我。'
  }
}

function scrollToBottom() {
  nextTick(() => {
    if (messagesRef.value) {
      messagesRef.value.scrollTop = messagesRef.value.scrollHeight
    }
  })
}

async function sendChat() {
  const text = chatInput.value.trim()
  if (!text || chatLoading.value) return

  messages.value.push({ id: Date.now(), role: 'user', content: text })
  chatInput.value = ''
  chatLoading.value = true
  scrollToBottom()

  // mock 延迟
  await new Promise(r => setTimeout(r, 800 + Math.random() * 700))

  const matched = Object.entries(mockReplies).find(([key]) => text.includes(key) && key !== '_default')
  const reply = matched ? matched[1] : mockReplies['_default']

  messages.value.push({
    id: Date.now() + 1,
    role: 'assistant',
    content: reply.content,
    tagProposal: reply.proposal
  })

  if (reply.proposal) {
    pendingTags.value.push({
      id: reply.proposal.id,
      key: reply.proposal.key,
      value: reply.proposal.value,
      category: '沟通风格',
      status: 0,
      evidence: reply.proposal.evidence
    })
  }

  chatLoading.value = false
  scrollToBottom()
}

// ==================== 认知管理 Tab ====================
interface TagItem {
  id: number
  key: string
  value: string
  category: string
  status: number
  evidence?: string
}

const confirmedTags = ref<TagItem[]>([
  { id: 1, key: 'reply_style', value: '简洁直接，不寒暄', category: '沟通风格', status: 1 },
  { id: 2, key: 'tone', value: '专业但友好，不生硬', category: '沟通风格', status: 1 },
  { id: 3, key: 'humor_level', value: '偏幽默，但不油腻', category: '沟通风格', status: 1 },
  { id: 4, key: 'emoji_usage', value: '偶尔用，不滥用', category: '沟通风格', status: 1 },
  { id: 5, key: 'reply_speed', value: '倾向隔 5-10 分钟回复', category: '沟通节奏', status: 1 },
  { id: 6, key: 'avg_msg_length', value: '偏短，2-3 句话为主', category: '沟通节奏', status: 1 },
  { id: 7, key: 'stranger_attitude', value: '先公事公办，熟了再放松', category: '社交偏好', status: 1 },
  { id: 8, key: 'meeting_pref', value: '不喜欢线上会议，倾向文字', category: '社交偏好', status: 1 },
  { id: 9, key: 'common_phrases', value: '好的、👌、收到', category: '习惯用语', status: 1 },
  { id: 10, key: 'avoid_phrases', value: '呵呵、亲', category: '习惯用语', status: 1 },
  { id: 11, key: 'expertise', value: 'Java 后端, AI 工程化, 系统设计', category: '知识偏好', status: 1 },
  { id: 12, key: 'interests', value: '产品思维, 投资理财, 独立开发', category: '知识偏好', status: 1 },
])

const pendingTags = ref<TagItem[]>([
  { id: 101, key: 'schedule_style', value: '先做最难的那件', category: '社交偏好', status: 0, evidence: '最近一周的任务记录中你总先处理最难的' },
  { id: 102, key: 'common_phrases', value: '好的、👌、收到、行', category: '习惯用语', status: 0, evidence: '最近 20 条消息中 8 次使用"行"' },
])

const tagGroups = computed(() => {
  const groups: Record<string, TagItem[]> = {}
  for (const tag of confirmedTags.value) {
    if (!groups[tag.category]) groups[tag.category] = []
    groups[tag.category].push(tag)
  }
  return Object.entries(groups).map(([category, tags]) => ({ category, tags }))
})

function confirmProposal(id: number) {
  const idx = pendingTags.value.findIndex(t => t.id === id)
  if (idx === -1) return
  const tag = pendingTags.value.splice(idx, 1)[0]
  tag.status = 1
  confirmedTags.value.push(tag)
  ElMessage.success(`已确认标签「${tag.key}」`)
}

function rejectProposal(id: number) {
  const idx = pendingTags.value.findIndex(t => t.id === id)
  if (idx === -1) return
  const tag = pendingTags.value.splice(idx, 1)[0]
  ElMessage.info(`已拒绝标签「${tag.key}」`)
  // 也移除对话中的 proposal
  messages.value.forEach(msg => {
    if (msg.tagProposal?.id === id) msg.tagProposal = undefined
  })
}

function deleteTag(id: number) {
  const idx = confirmedTags.value.findIndex(t => t.id === id)
  if (idx === -1) return
  const tag = confirmedTags.value.splice(idx, 1)[0]
  ElMessage.success(`已删除标签「${tag.key}」`)
}

const showAddDialog = ref(false)
const newTag = reactive({ category: '', key: '', value: '' })

function addTag() {
  if (!newTag.key || !newTag.value) {
    ElMessage.warning('请填写标签键和值')
    return
  }
  confirmedTags.value.push({
    id: Date.now(),
    key: newTag.key,
    value: newTag.value,
    category: newTag.category || '沟通风格',
    status: 1
  })
  showAddDialog.value = false
  newTag.category = ''
  newTag.key = ''
  newTag.value = ''
  ElMessage.success('标签已添加')
}

const showEditDialog = ref(false)
const editingTag = ref<TagItem | null>(null)

function editTag(tag: TagItem) {
  editingTag.value = { ...tag }
  showEditDialog.value = true
}

function saveEdit() {
  if (!editingTag.value) return
  const idx = confirmedTags.value.findIndex(t => t.id === editingTag.value!.id)
  if (idx !== -1) {
    confirmedTags.value[idx].value = editingTag.value.value
  }
  showEditDialog.value = false
  ElMessage.success('标签已更新')
}

// ==================== 权限配置 Tab ====================
const config = reactive({
  autonomy_level: 1,
  abilities: {
    read_messages: true,
    summarize: true,
    suggest_reply: true,
    reply_with_confirm: false,
    reply_directly: false,
    execute_skill: false,
    social_recommend: false,
  },
  constraints: {
    max_reply_length: 50,
    reply_delay_seconds: 300,
  }
})

const autonomyLevels = [
  { value: 0, name: '纯观察', desc: '只阅读，不做任何主动行为' },
  { value: 1, name: '辅助建议', desc: '摘要 + 建议回复，需确认' },
  { value: 2, name: '有限代理', desc: '可代回复常见问题，复杂需确认' },
  { value: 3, name: '完全代理', desc: '自主回复 + 执行 Skill，事后通知' },
  { value: 4, name: '深度代理', desc: '完全代理 + 可主动发起社交' },
]

const abilities = [
  { key: 'read_messages', name: '阅读消息', desc: '分身可以读取你的消息' },
  { key: 'summarize', name: '消息摘要', desc: '推送未读消息摘要' },
  { key: 'suggest_reply', name: '回复建议', desc: '拟定回复建议，需你确认' },
  { key: 'reply_with_confirm', name: '代回复（需确认）', desc: '拟好回复等你一键确认发送' },
  { key: 'reply_directly', name: '代回复（直接发）', desc: '直接以你的风格回复' },
  { key: 'execute_skill', name: '代执行 Skill', desc: '帮你查房价、订机票等' },
  { key: 'social_recommend', name: '主动社交推荐', desc: '推荐你可能想认识的人' },
]

const autonomyPresets: Record<number, Record<string, boolean>> = {
  0: { read_messages: true, summarize: false, suggest_reply: false, reply_with_confirm: false, reply_directly: false, execute_skill: false, social_recommend: false },
  1: { read_messages: true, summarize: true, suggest_reply: true, reply_with_confirm: false, reply_directly: false, execute_skill: false, social_recommend: false },
  2: { read_messages: true, summarize: true, suggest_reply: true, reply_with_confirm: true, reply_directly: false, execute_skill: false, social_recommend: false },
  3: { read_messages: true, summarize: true, suggest_reply: true, reply_with_confirm: true, reply_directly: true, execute_skill: true, social_recommend: false },
  4: { read_messages: true, summarize: true, suggest_reply: true, reply_with_confirm: true, reply_directly: true, execute_skill: true, social_recommend: true },
}

function setAutonomyLevel(level: number) {
  config.autonomy_level = level
  const preset = autonomyPresets[level]
  if (preset) {
    Object.assign(config.abilities, preset)
  }
  ElMessage.success(`已切换到 Lv.${level} ${autonomyLevels.find(l => l.value === level)?.name}`)
}
</script>

<style scoped>
.avatar-page {
  display: flex;
  flex-direction: column;
  height: 100vh;
  background: #f5f7fa;
}

/* ==================== 顶栏 ==================== */
.avatar-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px 24px;
  background: #fff;
  border-bottom: 1px solid #e8ecf1;
}

.header-left {
  display: flex;
  align-items: center;
  gap: 12px;
}

.avatar-icon {
  width: 42px;
  height: 42px;
  border-radius: 50%;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: #fff;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 18px;
  font-weight: 700;
}

.header-title {
  font-size: 17px;
  font-weight: 600;
  color: #303133;
}

.header-desc {
  font-size: 13px;
  color: #909399;
  margin-top: 2px;
}

/* ==================== Tabs ==================== */
.avatar-tabs {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.avatar-tabs :deep(.el-tabs__header) {
  margin: 0;
  padding: 0 24px;
  background: #fff;
}

.avatar-tabs :deep(.el-tabs__content) {
  flex: 1;
  overflow: hidden;
}

.avatar-tabs :deep(.el-tab-pane) {
  height: 100%;
}

.tab-badge {
  margin-left: 6px;
}

.tab-badge :deep(.el-badge__content) {
  top: 6px;
}

/* ==================== 对话 Tab ==================== */
.chat-area {
  display: flex;
  flex-direction: column;
  height: 100%;
}

.chat-messages {
  flex: 1;
  overflow-y: auto;
  padding: 20px 24px;
}

.msg-row {
  display: flex;
  align-items: flex-start;
  margin-bottom: 18px;
  gap: 10px;
}

.msg-row.user {
  flex-direction: row-reverse;
}

.avatar-circle {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 14px;
  font-weight: 600;
  flex-shrink: 0;
}

.msg-row.user .avatar-circle {
  background: #409eff;
  color: #fff;
}

.msg-row.assistant .avatar-circle {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: #fff;
}

.msg-content {
  max-width: 65%;
}

.bubble {
  padding: 10px 16px;
  border-radius: 12px;
  font-size: 14px;
  line-height: 1.6;
  word-break: break-word;
}

.msg-row.user .bubble {
  background: #409eff;
  color: #fff;
  border-bottom-right-radius: 4px;
}

.msg-row.assistant .bubble {
  background: #fff;
  color: #303133;
  border: 1px solid #e8ecf1;
  border-bottom-left-radius: 4px;
}

.typing {
  color: #909399;
  font-style: italic;
}

/* tag 提议卡片 */
.tag-proposal-card {
  margin-top: 8px;
  padding: 12px 16px;
  background: #fdf6ec;
  border: 1px solid #e6a23c;
  border-radius: 8px;
  font-size: 13px;
}

.proposal-header {
  display: flex;
  align-items: center;
  gap: 4px;
  color: #e6a23c;
  font-weight: 600;
  margin-bottom: 8px;
}

.proposal-body {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 6px;
}

.proposal-value {
  color: #303133;
  font-weight: 500;
}

.proposal-evidence {
  color: #909399;
  font-size: 12px;
  margin-bottom: 10px;
}

.proposal-actions {
  display: flex;
  gap: 8px;
}

.chat-input {
  display: flex;
  gap: 10px;
  padding: 16px 24px;
  background: #fff;
  border-top: 1px solid #e8ecf1;
}

.chat-input .el-input {
  flex: 1;
}

/* ==================== 认知管理 Tab ==================== */
.profile-area {
  padding: 20px 24px;
  overflow-y: auto;
  height: 100%;
}

.section {
  margin-bottom: 24px;
}

.section-title {
  font-size: 15px;
  font-weight: 600;
  color: #303133;
  margin-bottom: 12px;
  display: flex;
  align-items: center;
  gap: 6px;
}

/* 待确认卡片 */
.tag-cards {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
  gap: 12px;
}

.tag-card {
  padding: 14px 16px;
  border-radius: 8px;
  border: 1px solid #e8ecf1;
  background: #fff;
}

.tag-card.pending {
  border-color: #e6a23c;
  background: #fdf6ec;
}

.tag-card-top {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 8px;
}

.tag-evidence {
  color: #909399;
  font-size: 12px;
  margin-bottom: 10px;
  line-height: 1.5;
}

.tag-card-actions {
  display: flex;
  gap: 8px;
}

/* 已确认标签列表 */
.tag-list {
  background: #fff;
  border-radius: 8px;
  border: 1px solid #e8ecf1;
  overflow: hidden;
}

.tag-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 16px;
  border-bottom: 1px solid #f0f2f5;
}

.tag-item:last-child {
  border-bottom: none;
}

.tag-item-left {
  display: flex;
  align-items: center;
  gap: 12px;
}

.tag-key {
  font-size: 13px;
  color: #909399;
  min-width: 120px;
  font-family: monospace;
}

.tag-value {
  font-size: 14px;
  color: #303133;
}

.tag-item-actions {
  display: flex;
  gap: 4px;
}

/* ==================== 权限配置 Tab ==================== */
.config-area {
  padding: 20px 24px;
  overflow-y: auto;
  height: 100%;
}

.autonomy-levels {
  display: grid;
  grid-template-columns: repeat(5, 1fr);
  gap: 10px;
}

.level-card {
  padding: 14px 12px;
  border-radius: 8px;
  border: 2px solid #e8ecf1;
  background: #fff;
  cursor: pointer;
  text-align: center;
  transition: all 0.2s;
}

.level-card:hover {
  border-color: #409eff;
}

.level-card.active {
  border-color: #409eff;
  background: #ecf5ff;
}

.level-num {
  font-size: 13px;
  color: #909399;
  margin-bottom: 4px;
}

.level-card.active .level-num {
  color: #409eff;
}

.level-name {
  font-size: 14px;
  font-weight: 600;
  color: #303133;
  margin-bottom: 4px;
}

.level-desc {
  font-size: 12px;
  color: #909399;
  line-height: 1.4;
}

.ability-list {
  background: #fff;
  border-radius: 8px;
  border: 1px solid #e8ecf1;
  overflow: hidden;
}

.ability-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 14px 16px;
  border-bottom: 1px solid #f0f2f5;
}

.ability-item:last-child {
  border-bottom: none;
}

.ability-info {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.ability-name {
  font-size: 14px;
  color: #303133;
  font-weight: 500;
}

.ability-desc {
  font-size: 12px;
  color: #909399;
}

.constraint-list {
  background: #fff;
  border-radius: 8px;
  border: 1px solid #e8ecf1;
  padding: 16px 20px;
}

.constraint-item {
  margin-bottom: 20px;
}

.constraint-item:last-child {
  margin-bottom: 0;
}

.constraint-label {
  font-size: 14px;
  color: #303133;
  font-weight: 500;
  display: block;
  margin-bottom: 8px;
}

.constraint-item :deep(.el-slider) {
  padding-right: 60px;
}
</style>
