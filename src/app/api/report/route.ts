import { NextRequest, NextResponse } from 'next/server'
import GitHubClient from '@/lib/api-clients/github'
import CryptoClient from '@/lib/api-clients/crypto'
import { ApiResponse } from '@/types'

// 获取智谱 AI Key
function getZhipuKey(): string {
  return process.env.ZHIPU_API_KEY || ''
}

// 获取 GitHub Token
function getGitHubToken(): string {
  return process.env.GITHUB_API_TOKEN || ''
}

// 生成 AI 综合报告
async function generateAIReport(data: {
  github: any[]
  stocks: any[]
  crypto: any
  zhipuKey: string
}): Promise<string> {
  const { github, stocks, crypto, zhipuKey } = data
  
  if (!zhipuKey) {
    return '⚠️ 未配置智谱AI Key，无法生成综合报告'
  }

  const prompt = `你是一个专业的科技金融量化分析师。请基于以下数据生成一份综合金融报告。

## 1. GitHub 热门项目 Top 10（影响科技行业趋势）
${github.slice(0, 5).map((r, i) => `${i + 1}. ${r.name} - ${r.description || '无描述'} (⭐ ${r.stars})`).join('\n')}

## 2. 股票市场数据
${stocks.slice(0, 5).map((s: any) => `${s.symbol}: $${s.price || 'N/A'} (${s.changePercent >= 0 ? '+' : ''}${s.changePercent || 0}%)`).join('\n')}

## 3. 加密货币市场
- BTC: $${crypto.btc?.price || 'N/A'} (${crypto.btc?.changePercent >= 0 ? '+' : ''}${crypto.btc?.changePercent || 0}%)
- ETH: $${crypto.eth?.price || 'N/A'} (${crypto.eth?.changePercent >= 0 ? '+' : ''}${crypto.eth?.changePercent || 0}%)
- XAU: $${crypto.xau?.price || 'N/A'} (${crypto.xau?.changePercent >= 0 ? '+' : ''}${crypto.xau?.changePercent || 0}%)

## 请生成报告，包含以下内容：

### 📊 市场情绪总览
基于 GitHub 热门项目的技术趋势，分析市场关注点

### 💹 A股 & 美股分析
- 分析科技股走势
- 给出投资建议

### 🪙 加密货币分析
- BTC/ETH 走势分析
- 与 XAU（黄金）对比
- 短期预测

### 🎯 综合投资建议
给出明确的方向和风险提示

请用 Markdown 格式，使用表格增强可读性。`

  try {
    const response = await fetch('https://open.bigmodel.cn/api/paas/v4/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${zhipuKey}`,
      },
      body: JSON.stringify({
        model: 'glm-4-flash',
        messages: [
          { role: 'system', content: '你是一个专业的科技金融量化分析师，用简洁专业的语言分析市场。' },
          { role: 'user', content: prompt },
        ],
        temperature: 0.7,
        max_tokens: 4000,
      }),
    })

    if (!response.ok) {
      const errorText = await response.text()
      throw new Error(`AI 错误: ${response.status}`)
    }

    const result = await response.json()
    return result.choices?.[0]?.message?.content || '报告生成失败'
  } catch (error) {
    console.error('AI 报告生成失败:', error)
    return `⚠️ AI 报告生成失败: ${error instanceof Error ? error.message : '未知错误'}`
  }
}

export async function POST(request: NextRequest) {
  try {
    const githubToken = getGitHubToken()
    const zhipuKey = getZhipuKey()
    
    // 并行获取所有数据
    const [githubClient, cryptoClient] = await Promise.all([
      Promise.resolve(new GitHubClient(githubToken)),
      Promise.resolve(new CryptoClient('', '')),
    ])

    // 获取 GitHub 趋势
    let githubData: any[] = []
    try {
      githubData = await githubClient.getTrendingRepositories() || []
    } catch (e) {
      console.error('GitHub API 失败:', e)
    }

    // 获取加密货币数据
    let cryptoData: any = { btc: null, eth: null, xau: null }
    try {
      const [btc, eth, xau] = await Promise.all([
        cryptoClient.getCryptoData('BTC'),
        cryptoClient.getCryptoData('ETH'),
        cryptoClient.getGoldData(),
      ])
      cryptoData = {
        btc: btc || { price: 0, changePercent: 0 },
        eth: eth || { price: 0, changePercent: 0 },
        xau: xau || { price: 0, changePercent: 0 },
      }
    } catch (e) {
      console.error('加密货币 API 失败:', e)
    }

    // 获取股票数据（模拟A股和美股）
    const stocks = [
      { symbol: 'NVDA', name: 'NVIDIA', price: 875.50, changePercent: 2.35 },
      { symbol: 'AMD', name: 'AMD', price: 168.20, changePercent: -1.20 },
      { symbol: 'COIN', name: 'Coinbase', price: 245.80, changePercent: 5.60 },
      { symbol: '600519', name: '贵州茅台', price: 1680.00, changePercent: 0.85 },
      { symbol: '000858', name: '五粮液', price: 145.50, changePercent: -0.45 },
      { symbol: 'GOOGL', name: 'Google', price: 175.30, changePercent: 1.15 },
      { symbol: 'MSFT', name: 'Microsoft', price: 425.60, changePercent: 0.92 },
      { symbol: 'AAPL', name: 'Apple', price: 192.30, changePercent: -0.35 },
    ]

    // 生成 AI 综合报告
    let aiReport = ''
    if (zhipuKey) {
      try {
        aiReport = await generateAIReport({
          github: githubData,
          stocks,
          crypto: cryptoData,
          zhipuKey,
        })
      } catch (e) {
        console.error('AI 报告生成失败:', e)
        aiReport = `⚠️ AI 报告生成失败`
      }
    }

    return NextResponse.json({
      success: true,
      data: {
        github: githubData.slice(0, 10),
        stocks,
        crypto: cryptoData,
        aiReport,
        timestamp: new Date().toISOString(),
      },
    } as ApiResponse<any>)
  } catch (error) {
    console.error('综合报告生成失败:', error)
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : '综合报告生成失败',
    }, { status: 500 })
  }
}
