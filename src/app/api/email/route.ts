import { NextRequest, NextResponse } from 'next/server'
import nodemailer from 'nodemailer'
import { getConfig } from '@/lib/db/config'

export async function POST(request: NextRequest) {
  try {
    const { recipients } = await request.json() as { recipients?: string }
    const recipientList = recipients
      ? recipients.split(',').map((e: string) => e.trim()).filter(Boolean)
      : ['leck@foxmail.com']

    // 获取最新报告
    const reportRes = await fetch(new URL('http://localhost:' + (process.env.PORT || 3000) + '/api/report'), {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
      cache: 'no-store'
    })
    const reportData = await reportRes.json()

    if (!reportData.success || !reportData.data) {
      return NextResponse.json({ success: false, error: reportData.error || 'No report data' }, { status: 404 })
    }

    const data = reportData.data
    const date = data.aiReport ? data.aiReport.match(/\d{4}[-/]\d{2}[-/]\d{2}/)?.[0] || new Date().toLocaleDateString('zh-CN') : new Date().toLocaleDateString('zh-CN')

    // 生成 HTML 邮件
    const html = `<!DOCTYPE html>
<html lang="zh-CN">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; line-height: 1.6; color: #333; background: #f5f5f5; }
    .container { max-width: 900px; margin: 20px auto; background: white; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 8px rgba(0,0,0,0.1); }
    .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px 20px; text-align: center; }
    .header h1 { margin: 0; font-size: 28px; }
    .section { padding: 20px; border-bottom: 1px solid #eee; }
    .section h2 { color: #667eea; margin-top: 0; font-size: 18px; }
    .repo { background: #f8f9fa; padding: 12px; margin: 8px 0; border-radius: 6px; border-left: 4px solid #667eea; }
    .repo-name { font-weight: bold; color: #333; }
    .repo-desc { color: #666; font-size: 14px; margin: 4px 0; }
    .repo-stats { font-size: 13px; color: #888; }
    .stock-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(200px, 1fr)); gap: 10px; }
    .stock-card { background: #f8f9fa; padding: 12px; border-radius: 6px; text-align: center; }
    .stock-name { font-weight: bold; }
    .stock-price { font-size: 20px; color: #333; }
    .up { color: #e74c3c; }
    .down { color: #27ae60; }
    .crypto-item { display: flex; justify-content: space-between; padding: 10px 0; border-bottom: 1px solid #eee; }
    .footer { padding: 15px; text-align: center; color: #888; font-size: 12px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>📊 科技金融日报</h1>
      <p>${date}</p>
    </div>

    <div class="section">
      <h2>🔥 GitHub Trending AI</h2>
      ${(data.github || []).slice(0, 5).map((r: any) => `
        <div class="repo">
          <div class="repo-name"><a href="${r.url}">${r.name}</a> ${r.language ? `· ${r.language}` : ''}</div>
          <div class="repo-desc">${r.description || ''}</div>
          <div class="repo-stats">⭐ ${r.stars} | ⑂ ${r.forks} | +${r.starsIncrease} today</div>
        </div>
      `).join('')}
    </div>

    <div class="section">
      <h2>📈 美股科技</h2>
      <div class="stock-grid">
        ${(data.stocks || []).map((s: any) => {
          const up = s.changePercent >= 0
          return `<div class="stock-card">
            <div class="stock-name">${s.symbol}</div>
            <div class="stock-price">\$${s.price}</div>
            <div class="${up ? 'up' : 'down'}">${up ? '▲' : '▼'} ${s.changePercent}%</div>
          </div>`
        }).join('')}
      </div>
    </div>

    <div class="section">
      <h2>₿ 加密货币</h2>
      ${data.crypto ? `
        <div class="crypto-item"><span>BTC</span><span>\$${data.crypto.btc?.price?.toLocaleString() || '-'}</span><span class="${(data.crypto.btc?.changePercent24h || 0) >= 0 ? 'up' : 'down'}">${(data.crypto.btc?.changePercent24h || 0) >= 0 ? '▲' : '▼'} ${data.crypto.btc?.changePercent24h || 0}%</span></div>
        <div class="crypto-item"><span>ETH</span><span>\$${data.crypto.eth?.price?.toLocaleString() || '-'}</span><span class="${(data.crypto.eth?.changePercent24h || 0) >= 0 ? 'up' : 'down'}">${(data.crypto.eth?.changePercent24h || 0) >= 0 ? '▲' : '▼'} ${data.crypto.eth?.changePercent24h || 0}%</span></div>
      ` : '<p>无数据</p>'}
    </div>

    ${data.aiReport ? `
    <div class="section">
      <h2>🤖 AI 行业分析</h2>
      <p>${data.aiReport.replace(/[#*]/g, '').substring(0, 500)}...</p>
    </div>` : ''}

    <div class="footer">由 Tech Finance Analyzer 自动生成</div>
  </div>
</body>
</html>`

    const host = getConfig('EMAIL_HOST') || 'smtp.qq.com'
    const port = parseInt(getConfig('EMAIL_PORT') || '465')
    const user = getConfig('EMAIL_USER') || ''
    const password = getConfig('EMAIL_PASSWORD') || ''

    if (!user || !password) {
      return NextResponse.json({ success: false, error: 'Email credentials not configured' }, { status: 500 })
    }

    const transporter = nodemailer.createTransport({
      host,
      port,
      secure: port === 465,
      auth: { user, pass: password }
    })

    await transporter.sendMail({
      from: user,
      to: recipientList.join(','),
      subject: `📊 科技金融日报 - ${date}`,
      html,
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Email error:', error)
    return NextResponse.json({ success: false, error: String(error) }, { status: 500 })
  }
}
