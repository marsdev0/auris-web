<template>
  <div class="avatar-page">
    <!-- ==================== 主聊天区 ==================== -->
    <div class="chat-main">
      <!-- 顶部栏 -->
      <header class="chat-header">
        <div class="header-left">
          <div class="avatar-orb-wrap">
            <div class="avatar-orb">V</div>
            <div class="orb-pulse"></div>
          </div>
          <div class="header-text">
            <h1 class="header-name">我的分身</h1>
            <p class="header-sub">
              <span class="status-dot"></span>
              已学习 {{ confirmedTags.length }} 项偏好
            </p>
          </div>
        </div>
        <div class="header-right">
          <button class="hdr-btn" :class="{ active: showProfile }" @click="togglePanel('profile')">
            <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
              <path d="M12 2a8 8 0 0 0-8 8c0 3.4 2.1 6.3 5 7.5V20a2 2 0 0 0 2 2h2a2 2 0 0 0 2-2v-2.5c2.9-1.2 5-4.1 5-7.5a8 8 0 0 0-8-8z"/>
              <path d="M9 22h6M10 14h4"/>
            </svg>
            <span>认知</span>
            <span v-if="pendingTags.length" class="dot-badge">{{ pendingTags.length }}</span>
          </button>
          <button class="hdr-btn" :class="{ active: showConfig }" @click="togglePanel('config')">
            <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
              <circle cx="12" cy="12" r="3"/>
              <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/>
            </svg>
            <span>配置</span>
          </button>
        </div>
      </header>

      <!-- 消息区 -->
      <div class="messages-scroll" ref="messagesRef">
        <div class="messages-inner">
          <div v-for="msg in messages" :key="msg.id" class="msg" :class="msg.role">
            <div v-if="msg.role === 'assistant'" class="msg-orb">V</div>
            <div class="msg-body">
              <div class="msg-bubble" v-html="msg.content"></div>
              <div v-if="msg.tagProposal" class="proposal-card">
                <div class="proposal-inner">
                  <div class="proposal-label">
                    <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round">
                      <path d="M12 9v4m0 4h.01M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0z"/>
                    </svg>
                    分身提议新标签
                  </div>
                  <div class="proposal-tag">
                    <span class="key-pill">{{ msg.tagProposal.key }}</span>
                    <span class="val-text">{{ msg.tagProposal.value }}</span>
                  </div>
                  <div class="proposal-evidence">{{ msg.tagProposal.evidence }}</div>
                  <div class="proposal-btns">
                    <button class="btn-confirm sm" @click="confirmProposal(msg.tagProposal!.id)">确认</button>
                    <button class="btn-ghost sm" @click="rejectProposal(msg.tagProposal!.id)">拒绝</button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- 打字动画 -->
          <div v-if="chatLoading" class="msg assistant">
            <div class="msg-orb">V</div>
            <div class="msg-body">
              <div class="typing-dots">
                <span></span><span></span><span></span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- 输入区 -->
      <div class="input-area">
        <div class="input-wrap">
          <input
            v-model="chatInput"
            @keyup.enter="sendChat"
            :disabled="chatLoading"
            placeholder="跟你的分身说话..."
            class="chat-input"
          />
          <button
            class="send-btn"
            @click="sendChat"
            :disabled="chatLoading || !chatInput.trim()"
          >
            <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <line x1="22" y1="2" x2="11" y2="13"/>
              <polygon points="22 2 15 22 11 13 2 9 22 2"/>
            </svg>
          </button>
        </div>
      </div>
    </div>

    <!-- ==================== 遮罩 ==================== -->
    <transition name="fade">
      <div v-if="showProfile || showConfig" class="backdrop" @click="showProfile = false; showConfig = false"></div>
    </transition>

    <!-- ==================== 侧边抽屉 ==================== -->
    <transition name="drawer">
      <div v-if="showProfile || showConfig" class="side-drawer">
        <!-- ===== 认知管理 ===== -->
        <template v-if="showProfile">
          <div class="drawer-head">
            <h2>认知管理</h2>
            <button class="close-btn" @click="showProfile = false">
              <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round">
                <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
              </svg>
            </button>
          </div>
          <div class="drawer-body">
            <!-- 待确认 -->
            <div v-if="pendingTags.length" class="drawer-section">
              <div class="sec-label">
                <span class="glow-dot amber"></span>
                待确认 ({{ pendingTags.length }})
              </div>
              <div class="pending-list">
                <div v-for="tag in pendingTags" :key="tag.id" class="pending-card">
                  <div class="pending-top">
                    <span class="key-pill amber">{{ tag.key }}</span>
                    <span class="pending-val">{{ tag.value }}</span>
                  </div>
                  <div class="pending-evidence">{{ tag.evidence }}</div>
                  <div class="pending-actions">
                    <button class="btn-confirm sm" @click="confirmProposal(tag.id)">确认</button>
                    <button class="btn-ghost sm" @click="rejectProposal(tag.id)">拒绝</button>
                  </div>
                </div>
              </div>
            </div>

            <!-- 已确认（按类别分组） -->
            <div v-for="group in tagGroups" :key="group.category" class="drawer-section">
              <div class="sec-label">{{ group.category }}</div>
              <div class="tag-list">
                <div v-for="tag in group.tags" :key="tag.id" class="tag-row">
                  <div class="tag-info">
                    <span class="tag-key">{{ tag.key }}</span>
                    <span class="tag-val">{{ tag.value }}</span>
                  </div>
                  <div class="tag-actions">
                    <button class="tag-btn" @click="editTag(tag)" title="编辑">
                      <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                        <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                        <path d="M18.5 2.5a2.12 2.12 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
                      </svg>
                    </button>
                    <button class="tag-btn danger" @click="deleteTag(tag.id)" title="删除">
                      <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                        <polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
                      </svg>
                    </button>
                  </div>
                </div>
              </div>
            </div>

            <!-- 添加按钮 -->
            <button class="add-tag-btn" @click="showAddDialog = true">
              <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round">
                <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
              </svg>
              添加标签
            </button>
          </div>
        </template>

        <!-- ===== 权限配置 ===== -->
        <template v-if="showConfig">
          <div class="drawer-head">
            <h2>权限配置</h2>
            <button class="close-btn" @click="showConfig = false">
              <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round">
                <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
              </svg>
            </button>
          </div>
          <div class="drawer-body">
            <!-- 自主度等级 -->
            <div class="drawer-section">
              <div class="sec-label">自主度等级</div>
              <div class="level-grid">
                <div
                  v-for="level in autonomyLevels"
                  :key="level.value"
                  class="level-card"
                  :class="{ active: config.autonomy_level === level.value }"
                  @click="setAutonomyLevel(level.value)"
                >
                  <div class="lv-num">Lv.{{ level.value }}</div>
                  <div class="lv-name">{{ level.name }}</div>
                  <div class="lv-desc">{{ level.desc }}</div>
                </div>
              </div>
            </div>

            <!-- 能力开关 -->
            <div class="drawer-section">
              <div class="sec-label">能力开关</div>
              <div class="ability-list">
                <div v-for="ability in abilities" :key="ability.key" class="ability-row">
                  <div class="ability-text">
                    <div class="ability-name">{{ ability.name }}</div>
                    <div class="ability-desc">{{ ability.desc }}</div>
                  </div>
                  <label class="toggle">
                    <input type="checkbox" v-model="config.abilities[ability.key]" />
                    <span class="toggle-track"></span>
                  </label>
                </div>
              </div>
            </div>

            <!-- 精细控制 -->
            <div class="drawer-section">
              <div class="sec-label">精细控制</div>
              <div class="constraint-list">
                <div class="constraint-row">
                  <div class="constraint-head">
                    <span>最大回复字数</span>
                    <span class="constraint-val">{{ config.constraints.max_reply_length }}</span>
                  </div>
                  <input
                    type="range"
                    v-model.number="config.constraints.max_reply_length"
                    min="10" max="200" step="10"
                    class="range-slider"
                  />
                </div>
                <div class="constraint-row">
                  <div class="constraint-head">
                    <span>回复延迟</span>
                    <span class="constraint-val">{{ config.constraints.reply_delay_seconds }}s</span>
                  </div>
                  <input
                    type="range"
                    v-model.number="config.constraints.reply_delay_seconds"
                    min="0" max="600" step="30"
                    class="range-slider"
                  />
                </div>
              </div>
            </div>
          </div>
        </template>
      </div>
    </transition>

    <!-- ==================== 添加标签弹窗 ==================== -->
    <el-dialog
      v-model="showAddDialog"
      title="手动添加标签"
      width="420px"
      custom-class="av-dialog"
    >
      <div class="dialog-form">
        <div class="form-field">
          <label>类别</label>
          <select v-model="newTag.category" class="form-select">
            <option value="">选择类别</option>
            <option value="沟通风格">沟通风格</option>
            <option value="沟通节奏">沟通节奏</option>
            <option value="社交偏好">社交偏好</option>
            <option value="习惯用语">习惯用语</option>
            <option value="知识偏好">知识偏好</option>
          </select>
        </div>
        <div class="form-field">
          <label>标签键</label>
          <input v-model="newTag.key" placeholder="如 reply_style" class="form-input" />
        </div>
        <div class="form-field">
          <label>标签值</label>
          <input v-model="newTag.value" placeholder="如 简洁直接" class="form-input" />
        </div>
      </div>
      <template #footer>
        <button class="btn-ghost" @click="showAddDialog = false">取消</button>
        <button class="btn-confirm" @click="addTag">添加</button>
      </template>
    </el-dialog>

    <!-- ==================== 编辑标签弹窗 ==================== -->
    <el-dialog
      v-model="showEditDialog"
      title="编辑标签"
      width="420px"
      custom-class="av-dialog"
    >
      <div class="dialog-form">
        <div class="form-field">
          <label>标签键</label>
          <input :value="editingTag?.key" disabled class="form-input disabled" />
        </div>
        <div class="form-field">
          <label>标签值</label>
          <input v-model="editingTag!.value" class="form-input" />
        </div>
      </div>
      <template #footer>
        <button class="btn-ghost" @click="showEditDialog = false">取消</button>
        <button class="btn-confirm" @click="saveEdit">保存</button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, nextTick } from 'vue'
import { ElMessage } from 'element-plus'

// ==================== 面板控制 ====================
const showProfile = ref(false)
const showConfig = ref(false)

function togglePanel(panel: 'profile' | 'config') {
  if (panel === 'profile') {
    showProfile.value = !showProfile.value
    showConfig.value = false
  } else {
    showConfig.value = !showConfig.value
    showProfile.value = false
  }
}

// ==================== 对话 ====================
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

// ==================== 认知管理 ====================
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

// ==================== 权限配置 ====================
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
/* ==================== 变量 ==================== */
.avatar-page {
  --bg: #0a0a1a;
  --surface: rgba(255, 255, 255, 0.04);
  --surface-hover: rgba(255, 255, 255, 0.07);
  --border: rgba(255, 255, 255, 0.07);
  --border-light: rgba(255, 255, 255, 0.12);
  --text: #e4e4e7;
  --text-dim: #71717a;
  --accent: #8b5cf6;
  --accent2: #6366f1;
  --amber: #f59e0b;
  --amber-dim: rgba(245, 158, 11, 0.12);
  --radius: 14px;

  position: relative;
  height: 100%;
  display: flex;
  flex-direction: column;
  background: var(--bg);
  overflow: hidden;
}

/* ==================== 顶栏 ==================== */
.chat-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px 28px;
  background: rgba(10, 10, 26, 0.85);
  backdrop-filter: blur(24px);
  border-bottom: 1px solid var(--border);
  z-index: 10;
}

.header-left {
  display: flex;
  align-items: center;
  gap: 14px;
}

.avatar-orb-wrap {
  position: relative;
  width: 40px;
  height: 40px;
}

.avatar-orb {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: linear-gradient(135deg, var(--accent), var(--accent2));
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 16px;
  font-weight: 700;
  color: #fff;
  position: relative;
  z-index: 1;
}

.orb-pulse {
  position: absolute;
  inset: -4px;
  border-radius: 50%;
  background: linear-gradient(135deg, var(--accent), var(--accent2));
  opacity: 0;
  animation: pulse 3s ease-in-out infinite;
  z-index: 0;
}

@keyframes pulse {
  0%, 100% { opacity: 0; transform: scale(1); }
  50% { opacity: 0.2; transform: scale(1.15); }
}

.header-name {
  font-size: 17px;
  font-weight: 600;
  color: var(--text);
  margin: 0;
}

.header-sub {
  font-size: 12px;
  color: var(--text-dim);
  margin: 2px 0 0;
  display: flex;
  align-items: center;
  gap: 6px;
}

.status-dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: #10b981;
  box-shadow: 0 0 6px #10b981;
}

.header-right {
  display: flex;
  gap: 6px;
}

.hdr-btn {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 8px 14px;
  border-radius: 10px;
  border: 1px solid var(--border);
  background: transparent;
  color: var(--text-dim);
  font-size: 13px;
  cursor: pointer;
  transition: all 0.2s;
  position: relative;
}

.hdr-btn:hover {
  background: var(--surface);
  color: var(--text);
  border-color: var(--border-light);
}

.hdr-btn.active {
  background: var(--surface-hover);
  color: var(--text);
  border-color: var(--accent);
  box-shadow: 0 0 12px rgba(139, 92, 246, 0.15);
}

.dot-badge {
  position: absolute;
  top: -4px;
  right: -4px;
  width: 18px;
  height: 18px;
  border-radius: 50%;
  background: var(--amber);
  color: #000;
  font-size: 11px;
  font-weight: 700;
  display: flex;
  align-items: center;
  justify-content: center;
}

/* ==================== 消息区 ==================== */
.chat-main {
  flex: 1;
  display: flex;
  flex-direction: column;
  min-height: 0;
}

.messages-scroll {
  flex: 1;
  overflow-y: auto;
  padding: 24px 0;
  background: radial-gradient(ellipse at 50% 0%, rgba(139, 92, 246, 0.04) 0%, transparent 60%);
}

.messages-scroll::-webkit-scrollbar { width: 5px; }
.messages-scroll::-webkit-scrollbar-track { background: transparent; }
.messages-scroll::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.08); border-radius: 3px; }
.messages-scroll::-webkit-scrollbar-thumb:hover { background: rgba(255,255,255,0.15); }

.messages-inner {
  max-width: 780px;
  margin: 0 auto;
  padding: 0 32px;
}

/* 单条消息 */
.msg {
  display: flex;
  align-items: flex-start;
  gap: 10px;
  margin-bottom: 20px;
  animation: msgIn 0.35s ease-out;
}

.msg.user {
  flex-direction: row-reverse;
}

@keyframes msgIn {
  from { opacity: 0; transform: translateY(8px); }
  to   { opacity: 1; transform: translateY(0); }
}

.msg-orb {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background: linear-gradient(135deg, var(--accent), var(--accent2));
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 13px;
  font-weight: 700;
  color: #fff;
  flex-shrink: 0;
}

.msg-body {
  max-width: 70%;
  min-width: 60px;
}

.msg-bubble {
  padding: 12px 18px;
  border-radius: var(--radius);
  font-size: 14px;
  line-height: 1.65;
  word-break: break-word;
}

.msg.assistant .msg-bubble {
  background: var(--surface);
  border: 1px solid var(--border);
  color: var(--text);
  border-top-left-radius: 4px;
}

.msg.user .msg-bubble {
  background: linear-gradient(135deg, var(--accent), var(--accent2));
  color: #fff;
  border-top-right-radius: 4px;
}

.msg-bubble :deep(strong) {
  color: #c4b5fd;
}

.msg.user .msg-bubble :deep(strong) {
  color: #fff;
}

/* 打字动画 */
.typing-dots {
  display: flex;
  gap: 5px;
  padding: 14px 18px;
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: var(--radius);
  border-top-left-radius: 4px;
  width: fit-content;
}

.typing-dots span {
  width: 7px;
  height: 7px;
  border-radius: 50%;
  background: rgba(255,255,255,0.3);
  animation: bounce 1.4s ease-in-out infinite both;
}

.typing-dots span:nth-child(1) { animation-delay: -0.32s; }
.typing-dots span:nth-child(2) { animation-delay: -0.16s; }

@keyframes bounce {
  0%, 80%, 100% { transform: scale(0.4); opacity: 0.3; }
  40% { transform: scale(1); opacity: 1; }
}

/* ==================== 提议卡片 ==================== */
.proposal-card {
  margin-top: 10px;
  border-radius: 12px;
  overflow: hidden;
  border: 1px solid rgba(245, 158, 11, 0.25);
  background: var(--amber-dim);
}

.proposal-inner {
  padding: 14px 16px;
}

.proposal-label {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 12px;
  color: var(--amber);
  font-weight: 600;
  margin-bottom: 10px;
}

.proposal-tag {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 8px;
}

.key-pill {
  display: inline-block;
  padding: 3px 10px;
  border-radius: 6px;
  font-size: 12px;
  font-weight: 600;
  font-family: 'SF Mono', 'Fira Code', monospace;
  background: rgba(139, 92, 246, 0.15);
  color: #a78bfa;
}

.key-pill.amber {
  background: rgba(245, 158, 11, 0.18);
  color: var(--amber);
}

.val-text {
  font-size: 14px;
  color: var(--text);
  font-weight: 500;
}

.proposal-evidence {
  font-size: 12px;
  color: var(--text-dim);
  margin-bottom: 12px;
  line-height: 1.5;
}

.proposal-btns {
  display: flex;
  gap: 8px;
}

/* ==================== 按钮通用 ==================== */
.btn-confirm {
  padding: 8px 20px;
  border-radius: 8px;
  border: none;
  background: linear-gradient(135deg, var(--accent), var(--accent2));
  color: #fff;
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-confirm:hover { filter: brightness(1.1); box-shadow: 0 0 16px rgba(139,92,246,0.3); }
.btn-confirm:disabled { opacity: 0.4; cursor: not-allowed; }

.btn-confirm.sm { padding: 5px 14px; font-size: 12px; }

.btn-ghost {
  padding: 8px 20px;
  border-radius: 8px;
  border: 1px solid var(--border-light);
  background: transparent;
  color: var(--text-dim);
  font-size: 13px;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-ghost:hover { background: var(--surface); color: var(--text); }
.btn-ghost.sm { padding: 5px 14px; font-size: 12px; }

/* ==================== 输入区 ==================== */
.input-area {
  padding: 16px 28px 20px;
  background: rgba(10, 10, 26, 0.85);
  backdrop-filter: blur(24px);
  border-top: 1px solid var(--border);
}

.input-wrap {
  max-width: 780px;
  margin: 0 auto;
  display: flex;
  gap: 10px;
  align-items: center;
}

.chat-input {
  flex: 1;
  padding: 12px 18px;
  border-radius: 12px;
  border: 1px solid var(--border);
  background: var(--surface);
  color: var(--text);
  font-size: 14px;
  outline: none;
  transition: all 0.2s;
}

.chat-input::placeholder { color: var(--text-dim); }
.chat-input:focus { border-color: var(--accent); box-shadow: 0 0 0 3px rgba(139,92,246,0.12); }

.send-btn {
  width: 44px;
  height: 44px;
  border-radius: 12px;
  border: none;
  background: linear-gradient(135deg, var(--accent), var(--accent2));
  color: #fff;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;
  flex-shrink: 0;
}

.send-btn:hover:not(:disabled) { filter: brightness(1.1); box-shadow: 0 0 20px rgba(139,92,246,0.35); }
.send-btn:disabled { opacity: 0.35; cursor: not-allowed; }

/* ==================== 遮罩 ==================== */
.backdrop {
  position: absolute;
  inset: 0;
  background: rgba(0, 0, 0, 0.45);
  z-index: 90;
}

.fade-enter-active, .fade-leave-active { transition: opacity 0.25s ease; }
.fade-enter-from, .fade-leave-to { opacity: 0; }

/* ==================== 侧边抽屉 ==================== */
.side-drawer {
  position: absolute;
  top: 0;
  right: 0;
  width: 400px;
  height: 100%;
  background: #0e0e20;
  border-left: 1px solid var(--border);
  z-index: 100;
  display: flex;
  flex-direction: column;
  box-shadow: -8px 0 32px rgba(0, 0, 0, 0.4);
}

.drawer-enter-active, .drawer-leave-active { transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1); }
.drawer-enter-from, .drawer-leave-to { transform: translateX(100%); }

.drawer-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 18px 22px;
  border-bottom: 1px solid var(--border);
}

.drawer-head h2 {
  font-size: 16px;
  font-weight: 600;
  color: var(--text);
  margin: 0;
}

.close-btn {
  width: 32px;
  height: 32px;
  border-radius: 8px;
  border: none;
  background: transparent;
  color: var(--text-dim);
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;
}

.close-btn:hover { background: var(--surface); color: var(--text); }

.drawer-body {
  flex: 1;
  overflow-y: auto;
  padding: 20px 22px 32px;
}

.drawer-body::-webkit-scrollbar { width: 4px; }
.drawer-body::-webkit-scrollbar-track { background: transparent; }
.drawer-body::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.08); border-radius: 2px; }

/* ==================== 抽屉内通用 ==================== */
.drawer-section {
  margin-bottom: 24px;
}

.sec-label {
  font-size: 12px;
  font-weight: 600;
  color: var(--text-dim);
  text-transform: uppercase;
  letter-spacing: 0.5px;
  margin-bottom: 12px;
  display: flex;
  align-items: center;
  gap: 6px;
}

.glow-dot {
  width: 7px;
  height: 7px;
  border-radius: 50%;
}

.glow-dot.amber {
  background: var(--amber);
  box-shadow: 0 0 8px var(--amber);
}

/* ==================== 待确认标签 ==================== */
.pending-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.pending-card {
  padding: 14px 16px;
  border-radius: 12px;
  border: 1px solid rgba(245, 158, 11, 0.2);
  background: var(--amber-dim);
}

.pending-top {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 6px;
}

.pending-val {
  font-size: 14px;
  color: var(--text);
  font-weight: 500;
}

.pending-evidence {
  font-size: 12px;
  color: var(--text-dim);
  margin-bottom: 10px;
  line-height: 1.5;
}

.pending-actions {
  display: flex;
  gap: 8px;
}

/* ==================== 已确认标签 ==================== */
.tag-list {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.tag-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 10px 12px;
  border-radius: 10px;
  background: var(--surface);
  transition: background 0.15s;
}

.tag-row:hover {
  background: var(--surface-hover);
}

.tag-info {
  display: flex;
  align-items: center;
  gap: 12px;
  flex: 1;
  min-width: 0;
}

.tag-key {
  font-size: 12px;
  font-family: 'SF Mono', 'Fira Code', monospace;
  color: var(--accent);
  opacity: 0.8;
  min-width: 110px;
  flex-shrink: 0;
}

.tag-val {
  font-size: 13px;
  color: var(--text);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.tag-actions {
  display: flex;
  gap: 2px;
  opacity: 0;
  transition: opacity 0.15s;
}

.tag-row:hover .tag-actions {
  opacity: 1;
}

.tag-btn {
  width: 28px;
  height: 28px;
  border-radius: 6px;
  border: none;
  background: transparent;
  color: var(--text-dim);
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.15s;
}

.tag-btn:hover { background: var(--surface); color: var(--text); }
.tag-btn.danger:hover { color: #ef4444; }

/* ==================== 添加标签按钮 ==================== */
.add-tag-btn {
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 12px;
  border-radius: 10px;
  border: 1px dashed var(--border-light);
  background: transparent;
  color: var(--text-dim);
  font-size: 13px;
  cursor: pointer;
  transition: all 0.2s;
}

.add-tag-btn:hover {
  border-color: var(--accent);
  color: var(--accent);
  background: rgba(139, 92, 246, 0.06);
}

/* ==================== 自主度等级 ==================== */
.level-grid {
  display: grid;
  grid-template-columns: repeat(5, 1fr);
  gap: 8px;
}

.level-card {
  padding: 14px 10px;
  border-radius: 10px;
  border: 1px solid var(--border);
  background: var(--surface);
  cursor: pointer;
  text-align: center;
  transition: all 0.2s;
}

.level-card:hover {
  border-color: var(--border-light);
  background: var(--surface-hover);
}

.level-card.active {
  border-color: var(--accent);
  background: rgba(139, 92, 246, 0.1);
  box-shadow: 0 0 16px rgba(139, 92, 246, 0.12);
}

.lv-num {
  font-size: 11px;
  color: var(--text-dim);
  margin-bottom: 4px;
}

.level-card.active .lv-num { color: var(--accent); }

.lv-name {
  font-size: 13px;
  font-weight: 600;
  color: var(--text);
  margin-bottom: 4px;
}

.lv-desc {
  font-size: 11px;
  color: var(--text-dim);
  line-height: 1.4;
}

/* ==================== 能力开关 ==================== */
.ability-list {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.ability-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 14px;
  border-radius: 10px;
  background: var(--surface);
}

.ability-text {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.ability-name {
  font-size: 13px;
  font-weight: 500;
  color: var(--text);
}

.ability-desc {
  font-size: 11px;
  color: var(--text-dim);
}

/* 自定义 Toggle */
.toggle {
  position: relative;
  display: inline-block;
  width: 40px;
  height: 22px;
  flex-shrink: 0;
}

.toggle input { opacity: 0; width: 0; height: 0; }

.toggle-track {
  position: absolute;
  cursor: pointer;
  inset: 0;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 11px;
  transition: 0.25s;
}

.toggle-track::before {
  content: '';
  position: absolute;
  width: 16px;
  height: 16px;
  border-radius: 50%;
  background: #fff;
  left: 3px;
  bottom: 3px;
  transition: 0.25s;
}

.toggle input:checked + .toggle-track {
  background: linear-gradient(135deg, var(--accent), var(--accent2));
}

.toggle input:checked + .toggle-track::before {
  transform: translateX(18px);
}

/* ==================== 精细控制 ==================== */
.constraint-list {
  display: flex;
  flex-direction: column;
  gap: 18px;
}

.constraint-head {
  display: flex;
  justify-content: space-between;
  margin-bottom: 8px;
  font-size: 13px;
  color: var(--text);
}

.constraint-val {
  color: var(--accent);
  font-weight: 600;
  font-family: 'SF Mono', 'Fira Code', monospace;
  font-size: 12px;
}

/* 自定义 Range */
.range-slider {
  -webkit-appearance: none;
  appearance: none;
  width: 100%;
  height: 4px;
  border-radius: 2px;
  background: rgba(255, 255, 255, 0.1);
  outline: none;
}

.range-slider::-webkit-slider-thumb {
  -webkit-appearance: none;
  width: 16px;
  height: 16px;
  border-radius: 50%;
  background: linear-gradient(135deg, var(--accent), var(--accent2));
  cursor: pointer;
  box-shadow: 0 0 8px rgba(139, 92, 246, 0.3);
  transition: box-shadow 0.2s;
}

.range-slider::-webkit-slider-thumb:hover {
  box-shadow: 0 0 14px rgba(139, 92, 246, 0.5);
}

.range-slider::-moz-range-thumb {
  width: 16px;
  height: 16px;
  border-radius: 50%;
  background: linear-gradient(135deg, var(--accent), var(--accent2));
  cursor: pointer;
  border: none;
}

/* ==================== 弹窗表单 ==================== */
.dialog-form {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.form-field {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.form-field label {
  font-size: 12px;
  font-weight: 600;
  color: #a1a1aa;
  text-transform: uppercase;
  letter-spacing: 0.3px;
}

.form-input, .form-select {
  padding: 10px 14px;
  border-radius: 10px;
  border: 1px solid rgba(255,255,255,0.1);
  background: rgba(255,255,255,0.05);
  color: #e4e4e7;
  font-size: 14px;
  outline: none;
  transition: border-color 0.2s;
}

.form-input:focus, .form-select:focus {
  border-color: #8b5cf6;
}

.form-input.disabled {
  opacity: 0.4;
  cursor: not-allowed;
}

.form-select option {
  background: #1a1a2e;
  color: #e4e4e7;
}
</style>

<!-- 全局样式：覆盖 el-dialog 在暗色主题下的外观 -->
<style>
.av-dialog {
  --el-dialog-bg-color: #141428 !important;
  --el-dialog-border-radius: 16px !important;
  border: 1px solid rgba(255,255,255,0.08) !important;
}

.av-dialog .el-dialog__header {
  border-bottom: 1px solid rgba(255,255,255,0.06);
  padding: 18px 22px;
}

.av-dialog .el-dialog__title {
  color: #e4e4e7 !important;
  font-weight: 600;
  font-size: 16px;
}

.av-dialog .el-dialog__headerbtn .el-dialog__close {
  color: #71717a !important;
}

.av-dialog .el-dialog__headerbtn:hover .el-dialog__close {
  color: #e4e4e7 !important;
}

.av-dialog .el-dialog__body {
  padding: 22px !important;
}

.av-dialog .el-dialog__footer {
  padding: 14px 22px 18px !important;
  border-top: 1px solid rgba(255,255,255,0.06);
  display: flex;
  justify-content: flex-end;
  gap: 8px;
}

.av-dialog .el-overlay {
  background-color: rgba(0, 0, 0, 0.6) !important;
}
</style>
