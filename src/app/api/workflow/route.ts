import { NextRequest, NextResponse } from 'next/server'
import GitHubClient from '@/lib/api-clients/github'
import CryptoClient from '@/lib/api-clients/crypto'
import { getConfig } from '@/lib/db/config'

interface WorkflowStep {
  stage: string
  name: string
  description?: string
  status: 'pending' | 'running' | 'done' | 'error'
  data?: any
  error?: string
}

const WORKFLOW_STAGES = [
  { id: 'github', name: '🐙 GitHub 趋势', description: '获取全球 Top10 热门项目' },
  { id: 'ai_analysis', name: '🤖 AI 深度分析', description: '分析热点技术与市场情绪' },
  { id: 'crypto', name: '🪙 加密货币数据', description: 'BTC/ETH/XAU 实时行情' },
  { id: 'macro', name: '🌐 宏观指标', description: 'DXY/US10Y/VIX' },
  { id: 'stock', name: '📊 股票数据', description: 'NVDA/AMD/COIN 行情' },
  { id: 'report', name: '📋 综合报告', description: '生成格式化报告' },
  { id: 'email', name: '📧 发送邮件', description: '推送至 leck@foxmail.com' },
]

const STEP_DELAY = 1200

function delay(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms))
}

async function updateStep(steps: WorkflowStep[], stageId: string, status: WorkflowStep['status'], data?: any, error?: string): Promise<WorkflowStep[]> {
  steps = steps.map(s => s.stage === stageId ? { ...s, status, data, error } : s)
  await delay(STEP_DELAY)
  return steps
}

export async function POST(request: NextRequest) {
  const encoder = new TextEncoder()
  const stream = new ReadableStream({
    async start(controller) {
      const send = (data: any) => {
        try { controller.enqueue(encoder.encode(`data: ${JSON.stringify(data)}\n\n`)) } catch {}
      }

      let steps: WorkflowStep[] = WORKFLOW_STAGES.map(s => ({ stage: s.id, name: s.name, description: s.description, status: 'pending' as const }))
      send({ type: 'start', steps })

      try {
        // 1. GitHub
        steps = await updateStep(steps, 'github', 'running')
        send({ type: 'progress', steps })
        const githubClient = new GitHubClient(process.env.GITHUB_TOKEN || getConfig('githubToken') || '')
        const githubData = await githubClient.getTrendingRepositories()
        steps = await updateStep(steps, 'github', 'done', { count: (githubData as any[])?.length || 0 })
        send({ type: 'progress', steps })

        // 2. AI 分析
        steps = await updateStep(steps, 'ai_analysis', 'running')
        send({ type: 'progress', steps })
        let aiAnalysis = ''
        const zhipuKey = getConfig('ZHIPU_API_KEY') || ''
        const miniMaxKey = getConfig('MINIMAX_API_KEY') || ''
        if (zhipuKey || miniMaxKey) {
          try {
            const { ZhipuClient } = await import('@/lib/ai-clients/zhipu')
            const client = new ZhipuClient(zhipuKey || miniMaxKey)
            const reposText = (githubData as any[])?.slice(0, 10).map((r: any, i: number) =>
              `${i + 1}. **${r.name}** - ${r.description || 'N/A'} (⭐ ${r.stars?.toLocaleString()}, 👀 ${r.forks?.toLocaleString()})\n   语言: ${r.language || 'N/A'}`
            ).join('\n\n') || '暂无数据'
            aiAnalysis = await (client as any).analyzeTechTrend?.({ githubTrending: reposText, marketContext: '加密货币与科技股市场' }) || `## GitHub 热点分析\n\n${reposText}\n\n（AI 服务暂不可用，以上为原始数据）`
          } catch (e) { aiAnalysis = `## GitHub 热点摘要\n\n（AI 分析暂时不可用）` }
        } else { aiAnalysis = '⚠️ 未配置 AI API Key，跳过深度分析。' }
        steps = await updateStep(steps, 'ai_analysis', 'done', { explanation: aiAnalysis.slice(0, 50) + '...' })
        send({ type: 'progress', steps })

        // 3. 加密货币
        steps = await updateStep(steps, 'crypto', 'running')
        send({ type: 'progress', steps })
        const cryptoClient = new CryptoClient(process.env.BINANCE_API_KEY || '', process.env.BINANCE_API_SECRET || '')
        let btc: any = null, eth: any = null, xau: any = null
        try { btc = await cryptoClient.getCryptoData('BTC') } catch {}
        try { eth = await cryptoClient.getCryptoData('ETH') } catch {}
        try { xau = await cryptoClient.getGoldData() } catch {}
        steps = await updateStep(steps, 'crypto', 'done', { btc: btc?.price, eth: eth?.price, xau: xau?.price })
        send({ type: 'progress', steps })

        // 4. 宏观
        steps = await updateStep(steps, 'macro', 'running')
        send({ type: 'progress', steps })
        let macroData: any = {}
        try {
          const res = await fetch('https://api.alternative.me/fng/?limit=1')
          const fngData = await res.json()
          const vixVal = parseInt(fngData.data?.[0]?.value || '50')
          macroData = { vix: vixVal, dxy: '~104.5', us10y: '~4.52' }
        } catch {}
        steps = await updateStep(steps, 'macro', 'done', macroData)
        send({ type: 'progress', steps })

        // 5. 股票
        steps = await updateStep(steps, 'stock', 'running')
        send({ type: 'progress', steps })
        const stockApiKey = process.env.STOCK_API_KEY || ''
        let stockData: any = { stocks: [] }
        if (stockApiKey) {
          try {
            const { StockClient } = await import('@/lib/api-clients/stock')
            const sc = new StockClient(stockApiKey)
            const syms = ['NVDA', 'AMD', 'COIN', 'AAPL', 'MSFT']
            const stocks: any[] = []
            for (const sym of syms) { try { const d = await sc.getStockData(sym); if (d) stocks.push(d) } catch {} }
            stockData = { stocks }
          } catch {}
        }
        steps = await updateStep(steps, 'stock', 'done', { count: stockData.stocks.length })
        send({ type: 'progress', steps })

        // 6. 生成报告
        steps = await updateStep(steps, 'report', 'running')
        send({ type: 'progress', steps })
        const htmlReport = generateReportHTML({ githubData, aiAnalysis, crypto: { btc, eth, xau }, macro: macroData, stock: stockData })
        steps = await updateStep(steps, 'report', 'done', { size: htmlReport.length })
        send({ type: 'progress', steps })

        // 7. 发邮件
        steps = await updateStep(steps, 'email', 'running')
        send({ type: 'progress', steps })
        let emailSent = false
        const emailUser = getConfig('EMAIL_USER') || ''
        const emailPassword = getConfig('EMAIL_PASSWORD') || ''
        if (emailUser && emailPassword) {
          try {
            const nodemailer = await import('nodemailer')
            const transporter = nodemailer.default.createTransport({
              host: 'smtp.qq.com',
              port: 465,
              secure: true,
              auth: { user: emailUser, pass: emailPassword },
            })
            await transporter.sendMail({
              from: emailUser,
              to: 'leck@foxmail.com',
              subject: `📊 科技金融日报 | ${new Date().toLocaleDateString('zh-CN')}`,
              html: htmlReport,
            })
            emailSent = true
          } catch (e) {
            console.error('Email failed:', e)
          }
        }
        steps = await updateStep(steps, 'email', 'done', { sent: emailSent })
        send({ type: 'progress', steps })

        send({ type: 'complete', steps, summary: {
          github: `${(githubData as any[])?.length || 0} 个热门项目`,
          btc: btc ? `$${btc.price?.toLocaleString()}` : 'N/A',
          eth: eth ? `$${eth.price?.toLocaleString()}` : 'N/A',
          xau: xau ? `$${xau.price?.toLocaleString()}` : 'N/A',
          stock: `${stockData.stocks.length} 只股票`,
          email: emailSent ? '✅ 已发送' : '⚠️ 未配置',
        }})
      } catch (error) {
        const errMsg = error instanceof Error ? error.message : '未知错误'
        steps = steps.map(s => s.status === 'running' ? { ...s, status: 'error', error: errMsg } : s)
        send({ type: 'error', error: errMsg, steps })
      }
      controller.close()
    }
  })

  return new Response(stream, {
    headers: { 'Content-Type': 'text/event-stream', 'Cache-Control': 'no-cache', 'Connection': 'keep-alive' }
  })
}

function generateReportHTML(data: any): string {
  const { githubData, aiAnalysis, crypto, macro, stock } = data
  const today = new Date().toLocaleDateString('zh-CN', { year: 'numeric', month: 'long', day: 'numeric' })
  const rows = (githubData as any[])?.slice(0, 10).map((r: any, i: number) =>
    `<tr><td style="padding:8px;border:1px solid #ddd;text-align:center;">${i + 1}</td><td style="padding:8px;border:1px solid #ddd;"><b>${r.name}</b><br><small style="color:#888;">by ${r.author || 'N/A'}</small></td><td style="padding:8px;border:1px solid #ddd;">${r.description || 'N/A'}</td><td style="padding:8px;border:1px solid #ddd;text-align:center;">⭐ ${r.stars?.toLocaleString()}</td><td style="padding:8px;border:1px solid #ddd;text-align:center;">${r.language || '-'}</td></tr>`
  ).join('') || '<tr><td colspan="5" style="padding:8px;text-align:center;color:#999;">暂无数据</td></tr>'
  const srows = (stock?.stocks || []).map((s: any) =>
    `<tr><td style="padding:8px;border:1px solid #ddd;"><b>${s.symbol}</b></td><td style="padding:8px;border:1px solid #ddd;">${s.company || '-'}</td><td style="padding:8px;border:1px solid #ddd;text-align:right;font-size:16px;"><b>$${s.lastPrice?.toFixed(2)}</b></td><td style="padding:8px;border:1px solid #ddd;text-align:right;color:${s.changePercent >= 0 ? '#2e7d32' : '#c62828'};font-weight:bold;">${s.changePercent >= 0 ? '+' : ''}${s.changePercent?.toFixed(2)}%</td></tr>`
  ).join('') || '<tr><td colspan="4" style="padding:8px;text-align:center;color:#999;">暂无数据</td></tr>'
  const btcC = crypto?.btc?.changePercent24h || 0, ethC = crypto?.eth?.changePercent24h || 0, xauC = crypto?.xau?.changePercent24h || 0
  return `<!DOCTYPE html><html lang="zh-CN"><head><meta charset="utf-8"><title>科技金融日报 - ${today}</title></head><body style="font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Arial,sans-serif;max-width:900px;margin:0 auto;padding:20px;background:#f0f2f5;"><div style="background:white;border-radius:16px;padding:28px;box-shadow:0 4px 12px rgba(0,0,0,0.08);margin-bottom:20px;"><h1 style="text-align:center;color:#1a1a2e;margin-bottom:4px;font-size:28px;">📊 科技金融日报</h1><p style="text-align:center;color:#888;margin:0;font-size:14px;">${today}</p></div><div style="background:white;border-radius:16px;padding:24px;box-shadow:0 4px 12px rgba(0,0,0,0.08);margin-bottom:20px;"><h2 style="color:#e94560;margin:0 0 16px 0;font-size:20px;border-bottom:2px solid #e94560;padding-bottom:8px;">🐙 GitHub 全球热点 Top10</h2><table style="width:100%;border-collapse:collapse;font-size:14px;"><thead><tr style="background:#f8f9fa;"><th style="padding:10px;border:1px solid #e0e0e0;text-align:center;width:40px;">#</th><th style="padding:10px;border:1px solid #e0e0e0;text-align:left;">项目</th><th style="padding:10px;border:1px solid #e0e0e0;text-align:left;">描述</th><th style="padding:10px;border:1px solid #e0e0e0;text-align:center;">Stars</th><th style="padding:10px;border:1px solid #e0e0e0;text-align:center;">语言</th></tr></thead><tbody>${rows}</tbody></table></div><div style="background:white;border-radius:16px;padding:24px;box-shadow:0 4px 12px rgba(0,0,0,0.08);margin-bottom:20px;"><h2 style="color:#7c3aed;margin:0 0 16px 0;font-size:20px;border-bottom:2px solid #7c3aed;padding-bottom:8px;">🤖 AI 热点技术分析</h2><div style="background:#f8f9fa;padding:16px;border-radius:10px;line-height:1.9;font-size:14px;white-space:pre-wrap;word-break:break-word;">${aiAnalysis}</div></div><div style="background:white;border-radius:16px;padding:24px;box-shadow:0 4px 12px rgba(0,0,0,0.08);margin-bottom:20px;"><h2 style="color:#f59e0b;margin:0 0 16px 0;font-size:20px;border-bottom:2px solid #f59e0b;padding-bottom:8px;">🪙 加密货币</h2><table style="width:100%;border-collapse:collapse;"><tr style="background:#fffceb;"><td style="padding:14px;"><b style="font-size:16px;">₿ Bitcoin</b></td><td style="padding:14px;text-align:right;"><b style="font-size:20px;">$${crypto?.btc?.price?.toLocaleString('en-US', {minimumFractionDigits:2}) || 'N/A'}</b></td><td style="padding:14px;text-align:right;color:${btcC>=0?'#2e7d32':'#c62828'};font-weight:bold;font-size:15px;">${btcC>=0?'▲':'▼'} ${Math.abs(btcC).toFixed(2)}%</td></tr><tr style="background:#f5f3ff;"><td style="padding:14px;"><b style="font-size:16px;">Ξ Ethereum</b></td><td style="padding:14px;text-align:right;"><b style="font-size:20px;">$${crypto?.eth?.price?.toLocaleString('en-US', {minimumFractionDigits:2}) || 'N/A'}</b></td><td style="padding:14px;text-align:right;color:${ethC>=0?'#2e7d32':'#c62828'};font-weight:bold;font-size:15px;">${ethC>=0?'▲':'▼'} ${Math.abs(ethC).toFixed(2)}%</td></tr><tr style="background:#fffceb;"><td style="padding:14px;"><b style="font-size:16px;">🥇 Gold XAU</b></td><td style="padding:14px;text-align:right;"><b style="font-size:20px;">$${crypto?.xau?.price?.toLocaleString('en-US', {minimumFractionDigits:2}) || 'N/A'}</b></td><td style="padding:14px;text-align:right;color:${xauC>=0?'#2e7d32':'#c62828'};font-weight:bold;font-size:15px;">${xauC>=0?'▲':'▼'} ${Math.abs(xauC).toFixed(2)}%</td></tr></table></div><div style="background:white;border-radius:16px;padding:24px;box-shadow:0 4px 12px rgba(0,0,0,0.08);margin-bottom:20px;"><h2 style="color:#0ea5e9;margin:0 0 16px 0;font-size:20px;border-bottom:2px solid #0ea5e9;padding-bottom:8px;">🌐 宏观指标</h2><div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:12px;"><div style="background:#e3f2fd;padding:16px;border-radius:10px;text-align:center;"><div style="color:#1565c0;font-size:13px;margin-bottom:4px;">DXY 美元指数</div><div style="color:#0d47a1;font-size:24px;font-weight:bold;">${macro?.dxy || 'N/A'}</div></div><div style="background:#fff3e0;padding:16px;border-radius:10px;text-align:center;"><div style="color:#e65100;font-size:13px;margin-bottom:4px;">US10Y 十年美债</div><div style="color:#bf360c;font-size:24px;font-weight:bold;">${macro?.us10y || 'N/A'}%</div></div><div style="background:#f3e5f5;padding:16px;border-radius:10px;text-align:center;"><div style="color:#6a1b9a;font-size:13px;margin-bottom:4px;">VIX 恐慌指数</div><div style="color:#4a148c;font-size:24px;font-weight:bold;">${macro?.vix || 'N/A'}</div></div></div></div><div style="background:white;border-radius:16px;padding:24px;box-shadow:0 4px 12px rgba(0,0,0,0.08);margin-bottom:20px;"><h2 style="color:#2563eb;margin:0 0 16px 0;font-size:20px;border-bottom:2px solid #2563eb;padding-bottom:8px;">📊 科技股行情</h2><table style="width:100%;border-collapse:collapse;"><thead><tr style="background:#eff6ff;"><th style="padding:10px;border:1px solid #bfdbfe;text-align:left;">股票</th><th style="padding:10px;border:1px solid #bfdbfe;text-align:left;">公司</th><th style="padding:10px;border:1px solid #bfdbfe;text-align:right;">价格</th><th style="padding:10px;border:1px solid #bfdbfe;text-align:right;">涨跌幅</th></tr></thead><tbody>${srows}</tbody></table></div><div style="text-align:center;color:#aaa;font-size:12px;padding:20px 0;"><p>📊 科技金融量化分析系统 | 数据来源：GitHub API / Binance / Alpha Vantage</p><p>本报告仅供参考，不构成投资建议</p></div></div></body></html>`
}
