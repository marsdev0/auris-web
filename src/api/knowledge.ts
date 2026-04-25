import type { KnowledgeItem } from '@/types'

// TODO: 后端 API 开发完成后替换 mock 实现

const MOCK_DATA: KnowledgeItem[] = [
  {
    id: 1,
    title: 'Andrej Karpathy：如何从零训练 GPT',
    sourceType: 'url',
    sourceUrl: 'https://www.bilibili.com/video/BV1xxx',
    sourceName: 'B站 · Karpathy',
    status: 'done',
    duration: 3540,
    keywords: ['GPT', 'Transformer', '训练', '深度学习'],
    summary: {
      title: 'Andrej Karpathy：如何从零训练 GPT',
      overview: 'Karpathy 在这个视频中从零开始实现了一个 GPT 模型，详细讲解了 Transformer 架构的每个组件，包括多头注意力、位置编码、层归一化等。视频还介绍了训练技巧和常见的优化方法。',
      chapters: [
        { title: '开场与项目介绍', timestamp: '00:00', summary: '介绍视频目标：从零构建一个 GPT 模型，以及项目的代码结构' },
        { title: '数据准备与 Tokenization', timestamp: '05:30', summary: '讲解如何准备训练数据，实现字符级别的 tokenizer' },
        { title: '自注意力机制', timestamp: '15:20', summary: '深入讲解自注意力的数学原理，包括 Q/K/V 矩阵的计算' },
        { title: '多头注意力与 Transformer Block', timestamp: '28:45', summary: '实现多头注意力层，组装完整的 Transformer Block' },
        { title: '训练与生成', timestamp: '42:10', summary: '配置训练参数，开始训练，展示生成效果' }
      ],
      keyPoints: [
        'Transformer 的核心是自注意力机制，它允许模型关注输入序列中的任意位置',
        'GPT 使用的是 Decoder-only 架构，通过因果掩码实现自回归生成',
        '训练的关键在于学习率调度和梯度裁剪',
        '现代 GPT 规模的扩大主要靠数据量和计算资源的增加'
      ]
    },
    transcript: '[00:00] 大家好，今天我要从零开始实现一个 GPT 模型...\n\n[05:30] 首先我们需要准备训练数据。我使用的是莎士比亚的文本...\n\n[15:20] 现在我们来看自注意力机制。这是 Transformer 最核心的部分...\n\n[28:45] 接下来我们实现多头注意力。简单来说，就是把注意力做多次...\n\n[42:10] 好了，模型结构已经搭建完成，现在我们来训练它...',
    createdAt: '2026-04-22 20:30'
  },
  {
    id: 2,
    title: 'RAG 实战：从原理到生产部署',
    sourceType: 'url',
    sourceUrl: 'https://www.bilibili.com/video/BV2xxx',
    sourceName: 'B站 · AI工程实战',
    status: 'done',
    duration: 4800,
    keywords: ['RAG', '向量数据库', 'Embedding', 'LLM'],
    summary: {
      title: 'RAG 实战：从原理到生产部署',
      overview: '本视频系统讲解了 RAG（检索增强生成）的完整技术栈，从基础的向量检索到高级的 RAG 优化策略，涵盖了文档解析、分块策略、Embedding 模型选择、检索排序等关键环节。',
      chapters: [
        { title: 'RAG 原理与架构', timestamp: '00:00', summary: '介绍 RAG 的基本原理：检索 + 生成，以及为什么需要 RAG' },
        { title: '文档解析与分块', timestamp: '12:30', summary: '讲解 PDF/Word 等文档的解析方法，以及分块策略的选择' },
        { title: 'Embedding 与向量数据库', timestamp: '25:00', summary: '对比不同 Embedding 模型，介绍 Milvus/Qdrant 等向量数据库' },
        { title: '检索优化与 Rerank', timestamp: '40:15', summary: '讲解混合检索、重排序等提升检索质量的技巧' },
        { title: '生产部署经验', timestamp: '55:00', summary: '分享线上 RAG 系统的监控、评估和迭代经验' }
      ],
      keyPoints: [
        '分块策略是 RAG 效果的基础，建议从 512 token 开始实验',
        '混合检索（关键词 + 向量）通常优于单一检索方式',
        'Rerank 模型能显著提升检索的准确率',
        'RAG 的评估需要建立 golden dataset，定期回归测试'
      ]
    },
    transcript: '[00:00] 今天我们来聊聊 RAG，也就是检索增强生成...\n\n[12:30] 文档解析是 RAG 的第一步，也是最容易被忽视的...\n\n[25:00] 接下来聊聊 Embedding 模型的选择...\n\n[40:15] 检索优化是提升 RAG 效果的关键...\n\n[55:00] 最后分享一下生产部署的经验...',
    createdAt: '2026-04-22 18:15'
  },
  {
    id: 3,
    title: '播客录音 - 2024 年度 AI 回顾',
    sourceType: 'file',
    sourceName: 'local_file',
    status: 'done',
    duration: 2100,
    keywords: ['AI', '年度总结', '大模型', '多模态'],
    summary: {
      title: '播客录音 - 2024 年度 AI 回顾',
      overview: '本期播客回顾了 2024 年 AI 领域的重要进展，包括 GPT-4o 的发布、Claude 3 的崛起、开源模型的追赶、多模态能力的突破等话题。',
      chapters: [
        { title: '开年回顾', timestamp: '00:00', summary: '回顾 2024 年初 AI 领域的重大事件和产品发布' },
        { title: '大模型竞赛', timestamp: '08:20', summary: '讨论 OpenAI、Anthropic、Google 三家在大模型领域的竞争格局' },
        { title: '开源生态', timestamp: '18:40', summary: 'Llama、Qwen、Mistral 等开源模型的发展和社区生态' },
        { title: '展望 2025', timestamp: '28:00', summary: '对 2025 年 AI 发展的预测和期待' }
      ],
      keyPoints: [
        '2024 年是大模型从尝鲜走向生产的一年',
        '开源模型与闭源模型的差距在缩小',
        '多模态能力成为新的竞争焦点',
        'AI Agent 是 2025 年最值得关注的方向'
      ]
    },
    transcript: '[00:00] 欢迎收听我们的年度 AI 回顾节目...\n\n[08:20] 今年大模型领域的竞争真是精彩...\n\n[18:40] 开源社区今年也非常活跃...\n\n[28:00] 展望明年，我觉得 Agent 是最大的看点...',
    createdAt: '2026-04-21 10:00'
  }
]

/** 获取知识库列表 */
export function getKnowledgeList(): Promise<{ data: KnowledgeItem[] }> {
  return Promise.resolve({ data: MOCK_DATA })
}

/** 获取知识条目详情 */
export function getKnowledgeDetail(id: number): Promise<{ data: KnowledgeItem | undefined }> {
  const item = MOCK_DATA.find(i => i.id === id)
  return Promise.resolve({ data: item })
}

/** 提交处理任务 */
export function submitKnowledge(_data: { url?: string; file?: File }): Promise<{ data: { id: number } }> {
  // TODO: 对接 POST /v1/knowledge/submit
  return new Promise(resolve => {
    setTimeout(() => resolve({ data: { id: Date.now() } }), 1500)
  })
}

/** 删除知识条目 */
export function deleteKnowledge(_id: number): Promise<void> {
  // TODO: 对接 DELETE /v1/knowledge/{id}
  return Promise.resolve()
}

/** 针对知识条目追问 */
export function chatKnowledge(_id: number, _question: string): Promise<{ data: { reply: string } }> {
  // TODO: 对接 POST /v1/knowledge/{id}/chat
  return new Promise(resolve => {
    setTimeout(() => resolve({
      data: { reply: '这是一个 mock 回复。后端 API 开发完成后，将基于视频内容进行智能问答。' }
    }), 1000)
  })
}
