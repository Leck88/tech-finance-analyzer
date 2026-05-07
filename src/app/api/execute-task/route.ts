import { NextRequest, NextResponse } from 'next/server'
import GitHubClient from '@/lib/api-clients/github'
import StockClient from '@/lib/api-clients/stock'
import CryptoClient from '@/lib/api-clients/crypto'
import AnalysisEngine from '@/lib/analysis/engine'
import EmailService from '@/lib/email/service'
import { DailyReport, ApiResponse } from '@/types'

export async function GET(request: NextRequest) {
  try {
    // 验证API密钥（演示模式：如果未设置API_KEY，允许任何请求）
    const apiKey = request.headers.get('x-api-key')
    if (process.env.API_KEY && apiKey !== process.env.API_KEY) {
      return NextResponse.json(
        { success: false, error: '无效的API密钥' },
        { status: 401 }
      )
    }

    const report = await executeDailyTask()
    return NextResponse.json({
      success: true,
      data: report,
      timestamp: new Date().toISOString(),
    } as ApiResponse<DailyReport>)
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : '未知错误',
        timestamp: new Date().toISOString(),
      } as ApiResponse<null>,
      { status: 500 }
    )
  }
}

async function executeDailyTask(): Promise<DailyReport> {
  const date = new Date().toISOString().split('T')[0]

  // 初始化客户端
  const githubClient = new GitHubClient(process.env.GITHUB_API_TOKEN || '')
  const stockClient = new StockClient(process.env.STOCK_API_KEY || '')
  const cryptoClient = new CryptoClient(
    process.env.BINANCE_API_KEY || '',
    process.env.BINANCE_API_SECRET || ''
  )
  const analysisEngine = new AnalysisEngine()

  // 1. 获取GitHub趋势项目
  let githubTrending: any[] = []
  try {
    githubTrending = await githubClient.getTrendingRepositories()
  } catch (error) {
    console.error('GitHub API failed:', error)
  }

  // 2. 技术分析和产业链分析
  const analysis: Record<string, any> = {}
  const industryChain: Record<string, any> = {}

  for (const repo of githubTrending) {
    const key = repo.name
    const techAnalysis = analysisEngine.analyzeGitHubTech(repo.name, repo.description, repo.tags)
    analysis[key] = techAnalysis

    // 获取主要标签的产业链分析
    if (repo.tags && repo.tags.length > 0) {
      industryChain[key] = analysisEngine.analyzeIndustryChain(repo.tags[0])
    }
  }

  // 3. 股票影响追踪
  const allTechs = Object.values(analysis)
    .flatMap((a: any) => a.keywords || [])
    .filter((v: any, i: any, a: any) => a.indexOf(v) === i)

  let stocks: any[] = []
  try {
    stocks = await stockClient.getStocksImpactedByTechs(allTechs)
  } catch (error) {
    console.error('Stock API failed:', error)
  }

  // 4. 价格预测
  const predictions: Record<string, any> = {}
  for (const stock of stocks) {
    const key = stock.symbol
    predictions[key] = analysisEngine.predictNextDay(stock.changePercent || 0, stock.changePercent || 0, 'neutral')
  }

  // 5. 加密货币分析
  let btc = null
  let eth = null
  try {
    btc = await cryptoClient.getCryptoData('BTC')
    eth = await cryptoClient.getCryptoData('ETH')
  } catch (error) {
    console.error('Crypto API failed:', error)
  }

  // 6. 黄金价格分析
  let gold = null
  try {
    gold = await cryptoClient.getGoldData()
  } catch (error) {
    console.error('Gold API failed:', error)
  }

  // 7. 邮件发送
  let emailStatus = {
    sent: false,
    error: undefined as string | undefined,
    retries: 0,
  }

  if (process.env.EMAIL_USER && process.env.EMAIL_PASSWORD) {
    const emailService = new EmailService(
      process.env.EMAIL_HOST || 'smtp.gmail.com',
      parseInt(process.env.EMAIL_PORT || '587'),
      process.env.EMAIL_USER,
      process.env.EMAIL_PASSWORD
    )

    const recipients = (process.env.EMAIL_RECIPIENTS || '').split(',').filter(Boolean)

    if (recipients.length > 0) {
      const report: DailyReport = {
        date,
        githubTrending,
        analysis,
        industryChain,
        stocks,
        predictions,
        verification: {}, // T+1执行时更新
        crypto: { btc: btc || ({} as any), eth: eth || ({} as any) },
        gold: gold || ({} as any),
        emailStatus: { sent: false, retries: 0 },
      }

      const result = await emailService.sendDailyReport(report, recipients)
      emailStatus = { sent: result.success, error: result.error, retries: result.retries }
    }
  }

  return {
    date,
    githubTrending,
    analysis,
    industryChain,
    stocks,
    predictions,
    verification: {},
    crypto: { btc: btc || ({} as any), eth: eth || ({} as any) },
    gold: gold || ({} as any),
    emailStatus,
  }
}
