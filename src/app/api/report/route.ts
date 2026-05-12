import { NextRequest, NextResponse } from 'next/server'
import GitHubClient from '@/lib/api-clients/github'
import CryptoClient from '@/lib/api-clients/crypto'
import { getConfig } from '@/lib/db/config'
import { ApiResponse } from '@/types'
import Database from 'better-sqlite3'
import path from 'path'

const DB_PATH = process.env.DB_PATH || path.join(process.cwd(), 'data', 'config.db')
const db = new Database(DB_PATH)

// 确保缓存表存在
db.exec('CREATE TABLE IF NOT EXISTS report_cache (date TEXT PRIMARY KEY, github TEXT, stocks TEXT, crypto TEXT, ai_report TEXT, created_at DATETIME DEFAULT CURRENT_TIMESTAMP)')

function getTodayDate(): string {
  return new Date().toISOString().split('T')[0]
}

function getCachedReport(date: string): any {
  const stmt = db.prepare('SELECT * FROM report_cache WHERE date = ?')
  return stmt.get(date) as any
}

function saveReportCache(date: string, github: any[], stocks: any[], crypto: any, aiReport: string): void {
  const stmt = db.prepare('INSERT OR REPLACE INTO report_cache (date, github, stocks, crypto, ai_report, created_at) VALUES (?, ?, ?, ?, ?, CURRENT_TIMESTAMP)')
  stmt.run(date, JSON.stringify(github), JSON.stringify(stocks), JSON.stringify(crypto), aiReport)
}

async function generateAIReport(data: { github: any[]; stocks: any[]; crypto: any; apiKey: string }): Promise<string> {
  const { github, stocks, crypto, apiKey } = data
  if (!apiKey) return '⚠️ 未配置 AI Key'

  const githubList = github.slice(0, 5).map((r, i) => i + 1 + '. ' + r.name + ' - ' + (r.description || '无描述') + ' (⭐ ' + r.stars + ')').join('\n')
  const stockList = stocks.slice(0, 5).map((s: any) => s.symbol + ': $' + (s.price || 'N/A') + ' (' + (s.changePercent >= 0 ? '+' : '') + (s.changePercent || 0) + '%)').join('\n')

  const prompt = '你是一个专业的科技金融量化分析师。请基于以下数据生成一份综合金融报告。\n\n## 1. GitHub 热门项目\n' + githubList + '\n\n## 2. 股票市场数据\n' + stockList + '\n\n## 3. 加密货币市场\n- BTC: $' + (crypto.btc?.price || 'N/A') + ' (' + (crypto.btc?.changePercent >= 0 ? '+' : '') + (crypto.btc?.changePercent || 0) + '%)\n- ETH: $' + (crypto.eth?.price || 'N/A') + ' (' + (crypto.eth?.changePercent >= 0 ? '+' : '') + (crypto.eth?.changePercent || 0) + '%)\n- XAU: $' + (crypto.xau?.price || 'N/A') + ' (' + (crypto.xau?.changePercent >= 0 ? '+' : '') + (crypto.xau?.changePercent || 0) + '%)\n\n请用Markdown格式生成报告，包含市场情绪总览、股票分析、加密货币分析、投资建议。'

  try {
    const response = await fetch('https://api.minimax.chat/v1/text/chatcompletion_v2', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + apiKey },
      body: JSON.stringify({ model: 'MiniMax-M2.7', messages: [
        { role: 'system', content: '你是一个专业的科技金融量化分析师，用简洁专业的语言分析市场。' },
        { role: 'user', content: prompt }
      ], temperature: 0.7, max_tokens: 2000 }),
    })
    if (!response.ok) throw new Error('AI 错误: ' + response.status)
    const result = await response.json()
    return result.choices?.[0]?.message?.content || '报告生成失败'
  } catch (error) {
    return '⚠️ AI 报告生成失败: ' + (error instanceof Error ? error.message : '未知错误')
  }
}

export async function GET(request: NextRequest) { return POST(request) }

export async function POST(request: NextRequest) {
  try {
    const today = getTodayDate()
    const cached = getCachedReport(today)

    // 命中缓存，直接返回
    if (cached) {
      return NextResponse.json({
        success: true,
        data: {
          github: JSON.parse(cached.github || '[]'),
          stocks: JSON.parse(cached.stocks || '[]'),
          crypto: JSON.parse(cached.crypto || '{}'),
          aiReport: cached.ai_report || '',
          timestamp: cached.created_at,
          cached: true,
        },
      } as ApiResponse<any>)
    }

    // 未命中缓存，重新生成
    const githubToken = getConfig('githubToken') || process.env.GITHUB_API_TOKEN || ''
    const miniMaxKey = getConfig('MINIMAX_API_KEY') || process.env.MINIMAX_API_KEY || ''

    const [githubClient, cryptoClient] = await Promise.all([
      Promise.resolve(new GitHubClient(githubToken)),
      Promise.resolve(new CryptoClient('', '')),
    ])

    let githubData: any[] = []
    try { githubData = await githubClient.getTrendingRepositories() || [] } catch (e) { console.error('GitHub API 失败:', e) }

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
    } catch (e) { console.error('加密货币 API 失败:', e) }

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

    let aiReport = ''
    if (miniMaxKey) {
      try { aiReport = await generateAIReport({ github: githubData, stocks, crypto: cryptoData, apiKey: miniMaxKey }) } catch (e) { aiReport = '⚠️ AI 报告生成失败' }
    } else {
      aiReport = '⚠️ 未配置 MiniMax API Key'
    }

    // 保存到缓存
    saveReportCache(today, githubData, stocks, cryptoData, aiReport)

    return NextResponse.json({
      success: true,
      data: { github: githubData.slice(0, 10), stocks, crypto: cryptoData, aiReport, timestamp: new Date().toISOString(), cached: false },
    } as ApiResponse<any>)
  } catch (error) {
    return NextResponse.json({ success: false, error: error instanceof Error ? error.message : '综合报告生成失败' }, { status: 500 })
  }
}
