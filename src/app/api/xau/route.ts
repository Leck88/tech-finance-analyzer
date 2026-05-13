import { NextResponse } from 'next/server'
import { getConfig } from '@/lib/db/config'

// 重要财经数据发布时间（UTC，转换为北京时间+8h）
const ECON_EVENTS = [
  { name: "美国非农就业", name_en: "NFP", day: 7, hour: 20, minute: 30, note: "每月第一个周五", impact: "利多" },
  { name: "美国CPI通胀", name_en: "CPI", day: 13, hour: 20, minute: 30, note: "每月13日左右", impact: "利空" },
  { name: "美联储利率决议", name_en: "FOMC", day: 20, hour: 2, minute: 0, note: "每6周一次", impact: "利多" },
  { name: "美国零售销售", name_en: "Retail Sales", day: 17, hour: 20, minute: 30, note: "每月17日左右", impact: "利空" },
  { name: "美国GDP初值", name_en: "GDP", day: 25, hour: 20, minute: 30, note: "每季度末", impact: "利空" },
  { name: "PCE物价指数", name_en: "PCE", day: 26, hour: 20, minute: 30, note: "每月26日左右", impact: "利空" },
]

function getNextEventDate(ev: typeof ECON_EVENTS[0], now: Date): Date | null {
  let year = now.getFullYear()
  let month = now.getMonth() + 1
  for (let i = 0; i < 24; i++) {
    try {
      const eventDt = new Date(Date.UTC(year, month - 1, ev.day, ev.hour, ev.minute))
      const eventBj = new Date(eventDt.getTime() + 8 * 60 * 60 * 1000)
      if (eventBj > now) return eventBj
    } catch (_) {}
    month++
    if (month > 12) { month = 1; year++ }
  }
  return null
}

function countdownToEvent(eventDt: Date, now: Date): string {
  const delta = eventDt.getTime() - now.getTime()
  const totalSecs = Math.floor(delta / 1000)
  if (totalSecs <= 0) return "⚡ 即将发布"
  const days = Math.floor(totalSecs / 86400)
  const hours = Math.floor((totalSecs % 86400) / 3600)
  const mins = Math.floor((totalSecs % 3600) / 60)
  if (days > 0) return `${days}天${hours}小时`
  if (hours > 0) return `${hours}小时${mins}分钟`
  return `${mins}分钟`
}

function getEconEvents() {
  const now = new Date()
  return ECON_EVENTS.map(ev => {
    const nextDate = getNextEventDate(ev, now)
    if (!nextDate) return null
    return {
      name: ev.name,
      nameEn: ev.name_en,
      nextDate: nextDate.toLocaleString('zh-CN', { timeZone: 'Asia/Shanghai', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' }),
      countdown: countdownToEvent(nextDate, now),
      impact: ev.impact as '利多' | '利空' | '中性',
      note: ev.note
    }
  }).filter(Boolean)
}

async function fetchXAUData() {
  try {
    const cryptoRes = await fetch('http://localhost:' + (process.env.PORT || 3000) + '/api/crypto', { cache: 'no-store' })
    const cryptoData = await cryptoRes.json()
    const xau = cryptoData?.data?.xau || {}
    const macroRes = await fetch('http://localhost:' + (process.env.PORT || 3000) + '/api/macro', { cache: 'no-store' })
    const macroData = await macroRes.json()
    const macro = macroData?.data || {}
    return { xau, macro }
  } catch (error) {
    console.error('XAU data fetch error:', error)
    return null
  }
}

async function analyzeWithAI(xau: any, macro: any) {
  const apiKey = getConfig('MINIMAX_API_KEY')
  const prompt = `你是一个国际黄金(XAU)分析师。当前数据如下：
【价格数据】
- 现价: ${xau.price || 'N/A'} USD
- 24h涨跌: ${xau.changePercent || 0}%
- 24h变化: ${xau.change || 0} USD
- 短期趋势: ${xau.trend || 'unknown'}
【宏观驱动因素】
- 美元指数: ${macro.dollarIndex?.value || 'N/A'} (${macro.dollarIndex?.change || ''})
- 美债10年: ${macro.us10yYield?.value || 'N/A'}
- 恐慌指数VIX: ${macro.fearGreed?.value || 'N/A'} (${macro.fearGreed?.label || ''})
请给出JSON格式分析：{"shortTerm":"短期(30字)","mediumTerm":"中期(30字)","keyDrivers":[{"factor":"因素","impact":"利好/利空/中性","status":"状态"}],"supportResistance":{"support":"支撑","resistance":"阻力"},"recommendation":"建议(20字)"}`

  try {
    const res = await fetch('https://api.minimax.chat/v1/text/chatcompletion_v2', {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ model: 'MiniMax-M2', messages: [{ role: 'user', content: prompt }], max_tokens: 600, reasoning_disabled: true })
    })
    const data = await res.json()
    let content = data?.choices?.[0]?.message?.content || data?.choices?.[0]?.message?.reasoning_content || ''
    const jsonMatch = content.match(/\{[\s\S]*\}/)
    if (jsonMatch) return JSON.parse(jsonMatch[0])
  } catch (error) {
    console.error('AI analysis error:', error)
  }
  return { shortTerm: 'AI分析生成失败', mediumTerm: '', keyDrivers: [], supportResistance: { support: '--', resistance: '--' }, recommendation: '请稍后刷新' }
}

export async function GET() {
  try {
    const raw = await fetchXAUData()
    if (!raw) return NextResponse.json({ success: false, error: 'Failed to fetch XAU data' }, { status: 500 })
    const { xau, macro } = raw
    const analysis = await analyzeWithAI(xau, macro)
    const econEvents = getEconEvents()
    return NextResponse.json({
      success: true,
      data: { price: xau.price, change: xau.change, changePercent: xau.changePercent, trend: xau.trend, drivers: xau.drivers, macro: { dollarIndex: macro.dollarIndex?.value, us10yYield: macro.us10yYield?.value, fearGreed: macro.fearGreed?.value }, analysis, econEvents },
      timestamp: new Date().toISOString()
    })
  } catch (error) {
    console.error('XAU API error:', error)
    return NextResponse.json({ success: false, error: String(error) }, { status: 500 })
  }
}