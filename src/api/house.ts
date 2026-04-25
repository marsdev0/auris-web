import type { HouseProperty, HouseCompareRow } from '@/types'

// TODO: 后端 API 开发完成后替换 mock 实现

const MOCK_PROPERTIES: HouseProperty[] = [
  {
    id: 1,
    name: '万科·天空之城',
    city: '杭州',
    district: '余杭区 · 未来科技城',
    avgPrice: 32000,
    totalPriceRange: '280-350万',
    area: '89-128㎡',
    tags: ['学区房', '地铁房', '品牌开发商'],
    score: 4.5,
    school: '学军小学（海创园校区）',
    schoolLevel: 'A',
    metro: '5号线·绿汀路站 500m',
    developer: '万科',
    imageUrl: ''
  },
  {
    id: 2,
    name: '绿城·晓月澄庐',
    city: '杭州',
    district: '余杭区 · 未来科技城',
    avgPrice: 35000,
    totalPriceRange: '310-420万',
    area: '89-140㎡',
    tags: ['学区房', '改善住宅', '低密社区'],
    score: 4.7,
    school: '未来科技城海创小学',
    schoolLevel: 'A',
    metro: '5号线·良睦路站 800m',
    developer: '绿城',
    imageUrl: ''
  },
  {
    id: 3,
    name: '龙湖·天街三期',
    city: '杭州',
    district: '余杭区 · 未来科技城',
    avgPrice: 29000,
    totalPriceRange: '240-320万',
    area: '79-118㎡',
    tags: ['地铁房', '商业配套', '刚需上车'],
    score: 4.2,
    school: '仓前中心小学',
    schoolLevel: 'B+',
    metro: '5号线·仓前站 200m',
    developer: '龙湖',
    imageUrl: ''
  },
  {
    id: 4,
    name: '阳光城·未来悦',
    city: '杭州',
    district: '余杭区 · 未来科技城',
    avgPrice: 27500,
    totalPriceRange: '220-290万',
    area: '75-105㎡',
    tags: ['高性价比', '新盘', '投资'],
    score: 4.0,
    school: '五常中心小学',
    schoolLevel: 'B',
    metro: '5号线·五常站 1.2km',
    developer: '阳光城',
    imageUrl: ''
  }
]

const MOCK_COMPARE: HouseCompareRow[] = [
  { dimension: '均价', values: ['3.2万/㎡', '3.5万/㎡'] },
  { dimension: '总价区间', values: ['280-350万', '310-420万'] },
  { dimension: '面积', values: ['89-128㎡', '89-140㎡'] },
  { dimension: '学区', values: ['学军小学(A)', '海创小学(A)'] },
  { dimension: '地铁距离', values: ['500m', '800m'] },
  { dimension: '开发商', values: ['万科', '绿城'] },
  { dimension: '综合评分', values: ['4.5', '4.7'] },
]

/** 房产对话（mock） */
export function chatHouse(message: string): Promise<{ data: { reply: string; properties?: HouseProperty[]; compare?: { names: string[]; rows: HouseCompareRow[] } } }> {
  return new Promise(resolve => {
    setTimeout(() => {
      if (message.includes('对比') || message.includes('比较')) {
        resolve({
          data: {
            reply: `为您对比「万科·天空之城」和「绿城·晓月澄庐」：`,
            compare: {
              names: ['万科·天空之城', '绿城·晓月澄庐'],
              rows: MOCK_COMPARE
            }
          }
        })
      } else {
        resolve({
          data: {
            reply: `根据您的需求「${message}」，为您筛选出以下楼盘：`,
            properties: MOCK_PROPERTIES
          }
        })
      }
    }, 800)
  })
}
