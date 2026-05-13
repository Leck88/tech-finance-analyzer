'use client'

import { useEffect, useState } from 'react'
import { DailyReport } from '@/types'

export default function Dashboard() {
  const [report, setReport] = useState<DailyReport | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchReport = async () => {
      try {
        let response = await fetch('/api/report')
        if (response.status === 404) {
          response = await fetch('/api/execute-task')
        }
        const result = await response.json()
        if (result.success) {
          setReport(result.data)
        } else {
          setError(result.error || '数据加载失败')
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : '网络错误')
      } finally {
        setLoading(false)
      }
    }
    fetchReport()
    const interval = setInterval(fetchReport, 5 * 60 * 1000)
    return () => clearInterval(interval)
  }, [])

  if (loading) return <div className="py-12 px-4 text-center"><div className="inline-block animate-spin">⏳</div><p className="mt-4">数据加载中...</p></div>
  if (error) return <div className="py-12 px-4 text-center"><div className="text-red-600">❌ 错误: {error}</div></div>
  if (!report) return <div className="py-12 px-4 text-center"><div className="text-gray-600">📭 暂无数据</div></div>

  const impactBadge = (impact: string) => {
    const map: Record<string, string> = { '利多': 'bg-green-100 text-green-700', '利空': 'bg-red-100 text-red-700', '中性': 'bg-gray-100 text-gray-700' }
    return <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${map[impact] || 'bg-gray-100 text-gray-600'}`}>{impact}</span>
  }

  return (
    <div className="py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">📊 仪表板</h1>
          <p className="text-gray-600 mt-2">报告日期: {report.date}</p>
        </div>

        {/* GitHub 趋势 */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <h2 className="text-2xl font-bold mb-4 text-blue-600">🚀 GitHub全球热门项目</h2>
          <table className="w-full">
            <thead><tr className="bg-gray-100 border-b"><th className="px-4 py-2 text-left">项目名</th><th className="px-4 py-2 text-left">Star增长</th><th className="px-4 py-2 text-left">语言</th><th className="px-4 py-2 text-left">标签</th></tr></thead>
            <tbody>
              {report.githubTrending.map(repo => (
                <tr key={repo.name} className="border-b hover:bg-gray-50">
                  <td className="px-4 py-3"><a href={repo.url} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">{repo.name}</a></td>
                  <td className="px-4 py-3 text-green-600 font-semibold">⬆️ {repo.starsIncrease}</td>
                  <td className="px-4 py-3">{repo.language || '-'}</td>
                  <td className="px-4 py-3">{repo.tags.map(tag => <span key={tag} className="inline-block bg-blue-100 text-blue-700 px-2 py-1 rounded-full text-xs mr-2">{tag}</span>)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* 股票部分 */}
        {report.stocks.length > 0 && (
          <div className="bg-white rounded-lg shadow-md p-6 mb-8">
            <h2 className="text-2xl font-bold mb-4 text-blue-600">📈 股票影响追踪</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {report.stocks.map(stock => (
                <div key={stock.symbol} className={`p-4 rounded-lg border-2 ${stock.changePercent > 0 ? 'border-green-200 bg-green-50' : 'border-red-200 bg-red-50'}`}>
                  <div className="font-bold text-lg">{stock.symbol}</div>
                  <div className="text-sm text-gray-600">{stock.company}</div>
                  <div className="mt-2 text-2xl font-bold">${stock.lastPrice.toFixed(2)}</div>
                  <div className={`text-lg font-semibold ${stock.changePercent > 0 ? 'text-green-600' : 'text-red-600'}`}>{stock.changePercent > 0 ? '⬆️' : '⬇️'} {Math.abs(stock.changePercent).toFixed(2)}%</div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 宏观与新闻 */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
          <div className="lg:col-span-1 bg-gray-900 text-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-bold mb-4 text-blue-400">🌐 宏观流动性</h2>
            <div className="space-y-4">
              <div className="flex justify-between items-center border-b border-gray-700 pb-2"><span className="text-gray-400">美元指数 (DXY)</span><span className="font-mono font-bold text-lg">104.22</span></div>
              <div className="flex justify-between items-center border-b border-gray-700 pb-2"><span className="text-gray-400">十年美债收益率</span><span className="font-mono font-bold text-lg text-red-400">4.18%</span></div>
            </div>
          </div>
          <div className="lg:col-span-2 bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-bold mb-4 text-blue-600">📰 实时市场情绪</h2>
            <div className="space-y-3">
              <div className="p-2 border-l-4 border-green-500 bg-gray-50 text-sm"><strong>[路透]</strong> 英伟达财报前夕，期权市场定价显示波动率将达到 10%。</div>
            </div>
          </div>
        </div>

        {/* 加密货币 */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <h2 className="text-2xl font-bold mb-4 text-blue-600">🪙 加密货币分析</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {report.crypto.btc && report.crypto.btc.price && (
              <div className="p-4 border-2 border-orange-200 bg-orange-50 rounded-lg">
                <h3 className="font-bold text-lg">BTC</h3>
                <p className="text-3xl font-bold mt-2">${report.crypto.btc.price.toFixed(0)}</p>
                <p className={`text-lg font-semibold ${report.crypto.btc.changePercent24h > 0 ? 'text-green-600' : 'text-red-600'}`}>{report.crypto.btc.changePercent24h > 0 ? '⬆️' : '⬇️'} {Math.abs(report.crypto.btc.changePercent24h).toFixed(2)}%</p>
                <p className="text-sm text-gray-600 mt-2">情绪: {report.crypto.btc.sentiment === 'greed' ? '贪婪' : report.crypto.btc.sentiment === 'fear' ? '恐慌' : '中性'}</p>
              </div>
            )}
            {report.crypto.eth && report.crypto.eth.price && (
              <div className="p-4 border-2 border-purple-200 bg-purple-50 rounded-lg">
                <h3 className="font-bold text-lg">ETH</h3>
                <p className="text-3xl font-bold mt-2">${report.crypto.eth.price.toFixed(0)}</p>
                <p className={`text-lg font-semibold ${report.crypto.eth.changePercent24h > 0 ? 'text-green-600' : 'text-red-600'}`}>{report.crypto.eth.changePercent24h > 0 ? '⬆️' : '⬇️'} {Math.abs(report.crypto.eth.changePercent24h).toFixed(2)}%</p>
                <p className="text-sm text-gray-600 mt-2">情绪: {report.crypto.eth.sentiment === 'greed' ? '贪婪' : report.crypto.eth.sentiment === 'fear' ? '恐慌' : '中性'}</p>
              </div>
            )}
          </div>
        </div>

        {/* 黄金部分 */}
        {report.gold && report.gold.price && (
          <div className="bg-white rounded-lg shadow-md p-6 mb-8">
            <h2 className="text-2xl font-bold mb-4 text-yellow-600">💛 黄金价格</h2>
            <div className="p-4 border-2 border-yellow-200 bg-yellow-50 rounded-lg mb-4">
              <p className="text-3xl font-bold">${report.gold.price.toFixed(2)}/oz</p>
              <p className={`text-lg font-semibold mt-2 ${report.gold.changePercent > 0 ? 'text-green-600' : 'text-red-600'}`}>{report.gold.changePercent > 0 ? '⬆️' : '⬇️'} {Math.abs(report.gold.changePercent).toFixed(2)}%</p>
              <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-2 text-sm">
                <div>💵 {report.gold.drivers.dollarIndex}</div>
                <div>📊 {report.gold.drivers.interestRate}</div>
                <div>🌍 {report.gold.drivers.geopoliticalRisk}</div>
              </div>
            </div>

            {/* 财经事件倒计时 */}
            {report.gold.econEvents && report.gold.econEvents.length > 0 && (
              <div className="mt-4">
                <h3 className="text-lg font-bold text-gray-800 mb-3">⏰ 重要财经数据倒计时</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                  {report.gold.econEvents.map((ev: any, i: number) => (
                    <div key={i} className={`p-3 rounded-lg border ${ev.nameEn === 'NFP' ? 'bg-red-50 border-red-300' : 'bg-blue-50 border-blue-200'}`}>
                      <div className="flex justify-between items-start mb-1">
                        <span className="font-bold text-sm">{ev.nameEn === 'NFP' ? '🔥 ' : ''}{ev.name}</span>
                        {impactBadge(ev.impact)}
                      </div>
                      <div className="text-xs text-gray-500">{ev.note}</div>
                      <div className="flex justify-between items-center mt-2">
                        <span className="text-xs text-gray-400">{ev.nextDate}</span>
                        <span className={`font-bold text-sm ${ev.nameEn === 'NFP' ? 'text-red-600' : 'text-blue-600'}`}>{ev.countdown}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* 邮件状态 */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-2xl font-bold mb-4 text-blue-600">✉️ 邮件发送状态</h2>
          <div className={`p-4 rounded-lg ${report.emailStatus.sent ? 'bg-green-50 border-2 border-green-200' : 'bg-red-50 border-2 border-red-200'}`}>
            {report.emailStatus.sent ? (
              <><p className="text-green-700 font-semibold">✅ 邮件已成功发送</p><p className="text-sm text-gray-600 mt-2">重试次数: {report.emailStatus.retries}</p></>
            ) : (
              <><p className="text-red-700 font-semibold">❌ 邮件发送失败</p><p className="text-sm text-gray-600 mt-2">{report.emailStatus.error}</p><p className="text-sm text-gray-600">重试次数: {report.emailStatus.retries}</p></>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}