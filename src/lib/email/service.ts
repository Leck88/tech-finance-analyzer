import nodemailer, { Transporter } from 'nodemailer'
import { DailyReport } from '@/types'

export class EmailService {
  private transporter: Transporter
  private sender: string

  constructor(
    host: string,
    port: number,
    user: string,
    password: string
  ) {
    this.sender = user
    this.transporter = nodemailer.createTransport({
      host,
      port,
      secure: port === 465,
      auth: {
        user,
        pass: password,
      },
    })
  }

  async sendDailyReport(
    report: DailyReport,
    recipients: string[]
  ): Promise<{ success: boolean; error?: string; retries: number }> {
    let retries = 0
    const maxRetries = 3

    while (retries <= maxRetries) {
      try {
        const html = this.generateHTML(report)
        await this.transporter.sendMail({
          from: this.sender,
          to: recipients.join(','),
          subject: `📊 科技金融日报 - ${report.date}`,
          html,
        })

        return {
          success: true,
          retries,
        }
      } catch (error) {
        retries++
        if (retries > maxRetries) {
          return {
            success: false,
            error: `邮件发送失败 (${error instanceof Error ? error.message : '未知错误'})，已重试 ${maxRetries} 次`,
            retries,
          }
        }
        // 等待后重试
        await new Promise((resolve) => setTimeout(resolve, 5000 * retries))
      }
    }

    return {
      success: false,
      error: '邮件发送失败',
      retries,
    }
  }

  private generateHTML(report: DailyReport): string {
    return `
    <!DOCTYPE html>
    <html lang="zh-CN">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <style>
        body {
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', sans-serif;
          line-height: 1.6;
          color: #333;
          background: #f5f5f5;
        }
        .container {
          max-width: 900px;
          margin: 20px auto;
          background: white;
          border-radius: 8px;
          overflow: hidden;
          box-shadow: 0 2px 8px rgba(0,0,0,0.1);
        }
        .header {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
          padding: 30px 20px;
          text-align: center;
        }
        .header h1 {
          margin: 0;
          font-size: 28px;
        }
        .header p {
          margin: 5px 0 0 0;
          opacity: 0.9;
        }
        .section {
          padding: 20px;
          border-bottom: 1px solid #eee;
        }
        .section h2 {
          color: #667eea;
          border-bottom: 2px solid #667eea;
          padding-bottom: 10px;
          margin-bottom: 15px;
        }
        table {
          width: 100%;
          border-collapse: collapse;
          margin: 15px 0;
        }
        th {
          background: #f8f9fa;
          padding: 12px;
          text-align: left;
          font-weight: 600;
          border-bottom: 2px solid #ddd;
        }
        td {
          padding: 12px;
          border-bottom: 1px solid #eee;
        }
        .up {
          color: #10b981;
          font-weight: bold;
        }
        .down {
          color: #ef4444;
          font-weight: bold;
        }
        .card {
          background: #f8f9fa;
          padding: 15px;
          border-radius: 6px;
          margin: 10px 0;
          border-left: 4px solid #667eea;
        }
        .badge {
          display: inline-block;
          padding: 4px 12px;
          border-radius: 20px;
          font-size: 12px;
          font-weight: 600;
          margin-right: 5px;
          margin-bottom: 5px;
        }
        .badge-ai {
          background: #ede9fe;
          color: #7c3aed;
        }
        .badge-web3 {
          background: #fef3c7;
          color: #d97706;
        }
        .badge-infra {
          background: #dbeafe;
          color: #0284c7;
        }
        .footer {
          background: #f8f9fa;
          padding: 20px;
          text-align: center;
          font-size: 12px;
          color: #666;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>📊 科技金融量化分析日报</h1>
          <p>${report.date} 数据报告</p>
        </div>

        ${this.generateGitHubSection(report)}
        ${this.generateStockSection(report)}
        ${this.generateCryptoSection(report)}
        ${this.generateGoldSection(report)}
        ${this.generateEmailStatus(report)}

        <div class="footer">
          <p>⚠️ 本报告数据基于 API 返回结果，禁止虚构或估算。所有结论基于数据分析，不构成投资建议。</p>
          <p>© 2026 科技金融量化分析系统</p>
        </div>
      </div>
    </body>
    </html>
    `
  }

  private generateGitHubSection(report: DailyReport): string {
    const repos = report.githubTrending
    const analysisMap = report.analysis

    return `
    <div class="section">
      <h2>🚀 GitHub 全球热门项目 Top10</h2>
      <table>
        <tr>
          <th>项目名</th>
          <th>Star增长</th>
          <th>标签</th>
          <th>技术关键词</th>
        </tr>
        ${repos
          .map(
            (repo, idx) => `
          <tr>
            <td><strong><a href="${repo.url}" style="color: #667eea; text-decoration: none;">${repo.name}</a></strong></td>
            <td><span class="up">⬆️ ${repo.starsIncrease}⭐</span></td>
            <td>${repo.tags.map((t) => `<span class="badge badge-ai">${t}</span>`).join('')}</td>
            <td>${analysisMap[repo.name]?.keywords?.join(' / ') || '-'}</td>
          </tr>
        `
          )
          .join('')}
      </table>
      
      <h3>💡 技术解释与商业价值</h3>
      ${repos
        .map((repo) => {
          const analysis = analysisMap[repo.name]
          return `
        <div class="card">
          <strong>${repo.name}</strong><br/>
          📝 ${analysis?.explanation || '分析中...'}<br/>
          💰 ${analysis?.businessValue || '评估中...'}
        </div>
      `
        })
        .join('')}
    </div>
    `
  }

  private generateStockSection(report: DailyReport): string {
    return `
    <div class="section">
      <h2>📈 股票影响追踪</h2>
      <table>
        <tr>
          <th>公司代码</th>
          <th>收盘价</th>
          <th>涨跌幅</th>
          <th>受影响原因</th>
        </tr>
        ${report.stocks
          .map(
            (stock) => `
          <tr>
            <td><strong>${stock.symbol}</strong></td>
            <td>$${stock.lastPrice.toFixed(2)}</td>
            <td><span class="${stock.changePercent > 0 ? 'up' : 'down'}">
              ${stock.changePercent > 0 ? '⬆️' : '⬇️'} ${Math.abs(stock.changePercent).toFixed(2)}%
            </span></td>
            <td>${stock.impactedBy.join(', ') || '-'}</td>
          </tr>
        `
          )
          .join('')}
      </table>
    </div>
    `
  }

  private generateCryptoSection(report: DailyReport): string {
    const { btc, eth } = report.crypto
    return `
    <div class="section">
      <h2>🪙 加密货币分析</h2>
      <table>
        <tr>
          <th>币种</th>
          <th>现价</th>
          <th>24h涨跌</th>
          <th>情绪</th>
          <th>核心驱动</th>
        </tr>
        ${[btc, eth]
          .map(
            (crypto) => `
          <tr>
            <td><strong>${crypto.symbol}</strong></td>
            <td>$${crypto.price.toFixed(2)}</td>
            <td><span class="${crypto.changePercent24h > 0 ? 'up' : 'down'}">
              ${crypto.changePercent24h > 0 ? '⬆️' : '⬇️'} ${Math.abs(crypto.changePercent24h).toFixed(2)}%
            </span></td>
            <td>${crypto.sentiment === 'greed' ? '贪婪' : crypto.sentiment === 'fear' ? '恐慌' : '中性'}</td>
            <td>${crypto.drivers.join('; ')}</td>
          </tr>
        `
          )
          .join('')}
      </table>
    </div>
    `
  }

  private generateGoldSection(report: DailyReport): string {
    const { gold } = report
    return `
    <div class="section">
      <h2>💛 黄金价格分析</h2>
      <table>
        <tr>
          <th>现价</th>
          <th>变化</th>
          <th>美元指数</th>
          <th>利率影响</th>
          <th>地缘政治</th>
        </tr>
        <tr>
          <td>$${gold.price.toFixed(2)}/oz</td>
          <td><span class="${gold.changePercent > 0 ? 'up' : 'down'}">
            ${gold.changePercent > 0 ? '⬆️' : '⬇️'} ${Math.abs(gold.changePercent).toFixed(2)}%
          </span></td>
          <td>${gold.drivers.dollarIndex}</td>
          <td>${gold.drivers.interestRate}</td>
          <td>${gold.drivers.geopoliticalRisk}</td>
        </tr>
      </table>
    </div>
    `
  }

  private generateEmailStatus(report: DailyReport): string {
    const status = report.emailStatus
    return `
    <div class="section">
      <h2>✉️ 邮件发送状态</h2>
      <div class="card">
        ${
          status.sent
            ? `✅ 邮件已成功发送 | 重试次数: ${status.retries}`
            : `❌ 邮件发送失败 | 错误: ${status.error} | 重试次数: ${status.retries}`
        }
      </div>
    </div>
    `
  }
}

export default EmailService
