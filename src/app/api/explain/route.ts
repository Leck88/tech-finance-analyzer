import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { repo, analysis } = body

    if (!repo && !analysis) {
      return NextResponse.json({
        success: false,
        error: '缺少必要参数',
      }, { status: 400 })
    }

    // 构建提示词
    const context = repo || analysis
    const explanation = generateExplanation(context)

    return NextResponse.json({
      success: true,
      data: {
        explanation,
        timestamp: new Date().toISOString(),
      },
    })
  } catch (error) {
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'AI 解释生成失败',
    }, { status: 500 })
  }
}

function generateExplanation(context: any): string {
  // 模拟 AI 解释功能
  // 在实际生产环境中，可以接入 OpenAI / Claude 等 API
  
  const name = context.name || '未知项目'
  const description = context.description || ''
  const tags = context.tags || []
  const stars = context.stars || 0
  
  // 生成专业术语解释
  const termExplanations = tags.map((tag: string) => {
    return `**${tag}**: ${getTermExplanation(tag)}`
  }).join('\n')

  // 生成上下游影响分析
  const upstreamImpact = getUpstreamImpact(tags)
  const downstreamImpact = getDownstreamImpact(tags)
  const stockImpact = getStockImpact(tags)
  
  // 生成整体解释
  const explanation = `
## 📋 ${name} 专业术语解释

### 项目概述
${description || '暂无描述'}

### 核心技术术语
${termExplanations || '暂无术语分析'}

---

## 🔗 产业链影响分析

### 上游影响（对底层基础设施）
${upstreamImpact.description}
- 促进程度: ${upstreamImpact.level === 'promote' ? '🚀 显著促进' : upstreamImpact.level === 'hinder' ? '📉 有所阻碍' : '➡️ 影响较小'}

### 下游影响（对行业应用）
${downstreamImpact.description}
- 促进程度: ${downstreamImpact.level === 'promote' ? '🚀 显著促进' : downstreamImpact.level === 'hinder' ? '📉 有所阻碍' : '➡️ 影响较小'}

---

## 📈 相关股票影响

${stockImpact.map((s: any) => `- **${s.name}** (${s.symbol}): ${s.impact} - ${s.reason}`).join('\n')}

---

## 💰 价格影响预测

基于当前热度（${stars} ⭐）和技术趋势：
${stars > 100 ? '🔥 高热度项目，预计对相关领域产生显著影响' : stars > 50 ? '📊 中高热度，预计产生积极影响' : '📉 热度一般，影响有限'}
`.trim()

  return explanation
}

function getTermExplanation(tag: string): string {
  const explanations: Record<string, string> = {
    'bitcoin': '比特币 - 一种去中心化的加密货币，使用区块链技术实现点对点转账',
    'ethereum': '以太坊 - 开源区块链平台，支持智能合约和去中心化应用开发',
    'polymarket': '预测市场协议 - 基于区块链的预测市场平台，允许用户对事件结果进行投注',
    'arbitrage': '套利 - 利用不同市场价格差异获取利润的交易策略',
    'bot': '自动化机器人 - 执行自动化交易或任务的程序',
    'flash-transactions': '闪电交易 - 比特币的一种交易方式，可在几秒内完成',
    'bruteforce': '暴力破解 - 通过穷举尝试所有可能的密码组合来破解加密',
    'copytrading': '跟单交易 - 复制其他成功交易者的策略进行交易',
    'trading': '交易 - 金融资产的买卖活动',
    'ai': '人工智能 - 使计算机具有人类智能的技术',
    'defi': '去中心化金融 - 基于区块链的金融服务',
    'nft': '非同质化代币 - 代表独特资产的加密货币',
  }
  
  return explanations[tag.toLowerCase()] || '新兴技术方向，需要持续关注'
}

function getUpstreamImpact(tags: string[]): { description: string, level: string } {
  const hasCrypto = tags.some(t => ['bitcoin', 'ethereum', 'crypto', 'defi'].includes(t.toLowerCase()))
  const hasAI = tags.some(t => t.toLowerCase() === 'ai')
  
  if (hasCrypto) {
    return {
      description: '对 GPU 算力、矿机硬件、区块链底层设施需求提升',
      level: 'promote'
    }
  }
  if (hasAI) {
    return {
      description: '对算力芯片、云服务、大数据基础设施需求增加',
      level: 'promote'
    }
  }
  return {
    description: '对底层技术基础设施影响较小',
    level: 'neutral'
  }
}

function getDownstreamImpact(tags: string[]): { description: string, level: string } {
  const hasTrading = tags.some(t => ['trading', 'arbitrage', 'bot', 'copytrading'].includes(t.toLowerCase()))
  const hasPolymarket = tags.some(t => t.toLowerCase().includes('polymarket'))
  
  if (hasTrading || hasPolymarket) {
    return {
      description: '推动金融科技创新，降低交易门槛，促进市场活跃',
      level: 'promote'
    }
  }
  return {
    description: '对下游行业应用产生积极影响',
    level: 'neutral'
  }
}

function getStockImpact(tags: string[]): { name: string, symbol: string, impact: string, reason: string }[] {
  const impacts: { name: string, symbol: string, impact: string, reason: string }[] = []
  
  const hasCrypto = tags.some(t => ['bitcoin', 'ethereum', 'crypto'].includes(t.toLowerCase()))
  const hasAI = tags.some(t => t.toLowerCase() === 'ai')
  const hasSecurity = tags.some(t => t.toLowerCase().includes('security') || t.toLowerCase().includes('waf'))
  
  if (hasCrypto) {
    impacts.push(
      { name: 'Coinbase', symbol: 'COIN', impact: '📈 利好', reason: '加密交易平台需求增加' },
      { name: 'NVIDIA', symbol: 'NVDA', impact: '📈 利好', reason: '挖矿算力需求带动 GPU 销售' }
    )
  }
  
  if (hasAI) {
    impacts.push(
      { name: 'NVIDIA', symbol: 'NVDA', impact: '📈 利好', reason: 'AI 芯片需求持续旺盛' },
      { name: 'AMD', symbol: 'AMD', impact: '📈 利好', reason: '数据中心业务增长' }
    )
  }
  
  if (hasSecurity) {
    impacts.push(
      { name: 'CrowdStrike', symbol: 'CRWD', impact: '📈 利好', reason: '安全需求提升' }
    )
  }
  
  if (impacts.length === 0) {
    impacts.push(
      { name: '暂无直接关联股票', symbol: '-', impact: '-', reason: '暂未发现明显股票影响' }
    )
  }
  
  return impacts
}