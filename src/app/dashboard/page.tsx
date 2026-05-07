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
        const response = await fetch('/api/execute-task')
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
    // 每30分钟刷新一次
    const interval = setInterval(fetchReport, 30 * 60 * 1000)
    return () => clearInterval(interval)
  }, [])

  if (loading) {
    return (
      <div className="py-12 px-4 text-center">
        <div className="inline-block animate-spin">⏳</div>
        <p className="mt-4">数据加载中...</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="py-12 px-4 text-center">
        <div className="text-red-600">❌ 错误: {error}</div>
      </div>
    )
  }

  if (!report) {
    return (
      <div className="py-12 px-4 text-center">
        <div className="text-gray-600">📭 暂无数据</div>
      </div>
    )
  }

  return (
    <div className="py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        {/* 页面标题 */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">📊 仪表板</h1>
          <p className="text-gray-600 mt-2">报告日期: {report.date}</p>
        </div>

        {/* GitHub 趋势部分 */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <h2 className="text-2xl font-bold mb-4 text-blue-600">🚀 GitHub全球热门项目</h2>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-100 border-b">
                  <th className="px-4 py-2 text-left">项目名</th>
                  <th className="px-4 py-2 text-left">Star增长</th>
                  <th className="px-4 py-2 text-left">语言</th>
                  <th className="px-4 py-2 text-left">标签</th>
                </tr>
              </thead>
              <tbody>
                {report.githubTrending.map((repo) => (
                  <tr key={repo.name} className="border-b hover:bg-gray-50">
                    <td className="px-4 py-3">
                      <a href={repo.url} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                        {repo.name}
                      </a>
                    </td>
                    <td className="px-4 py-3 text-green-600 font-semibold">⬆️ {repo.starsIncrease}</td>
                    <td className="px-4 py-3">{repo.language || '-'}</td>
                    <td className="px-4 py-3">
                      {repo.tags.map((tag) => (
                        <span key={tag} className="inline-block bg-blue-100 text-blue-700 px-2 py-1 rounded-full text-xs mr-2">
                          {tag}
                        </span>
                      ))}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* 股票部分 */}
        {report.stocks.length > 0 && (
          <div className="bg-white rounded-lg shadow-md p-6 mb-8">
            <h2 className="text-2xl font-bold mb-4 text-blue-600">📈 股票影响追踪</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {report.stocks.map((stock) => (
                <div key={stock.symbol} className={`p-4 rounded-lg border-2 ${stock.changePercent > 0 ? 'border-green-200 bg-green-50' : 'border-red-200 bg-red-50'}`}>
                  <div className="font-bold text-lg">{stock.symbol}</div>
                  <div className="text-sm text-gray-600">{stock.company}</div>
                  <div className="mt-2 text-2xl font-bold">${stock.lastPrice.toFixed(2)}</div>
                  <div className={`text-lg font-semibold ${stock.changePercent > 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {stock.changePercent > 0 ? '⬆️' : '⬇️'} {Math.abs(stock.changePercent).toFixed(2)}%
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 加密货币部分 */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <h2 className="text-2xl font-bold mb-4 text-blue-600">🪙 加密货币分析</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {report.crypto.btc && report.crypto.btc.price && (
              <div className="p-4 border-2 border-orange-200 bg-orange-50 rounded-lg">
                <h3 className="font-bold text-lg">BTC</h3>
                <p className="text-3xl font-bold mt-2">${report.crypto.btc.price.toFixed(0)}</p>
                <p className={`text-lg font-semibold ${report.crypto.btc.changePercent24h > 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {report.crypto.btc.changePercent24h > 0 ? '⬆️' : '⬇️'} {Math.abs(report.crypto.btc.changePercent24h).toFixed(2)}%
                </p>
                <p className="text-sm text-gray-600 mt-2">情绪: {report.crypto.btc.sentiment === 'greed' ? '贪婪' : report.crypto.btc.sentiment === 'fear' ? '恐慌' : '中性'}</p>
              </div>
            )}
            {report.crypto.eth && report.crypto.eth.price && (
              <div className="p-4 border-2 border-purple-200 bg-purple-50 rounded-lg">
                <h3 className="font-bold text-lg">ETH</h3>
                <p className="text-3xl font-bold mt-2">${report.crypto.eth.price.toFixed(0)}</p>
                <p className={`text-lg font-semibold ${report.crypto.eth.changePercent24h > 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {report.crypto.eth.changePercent24h > 0 ? '⬆️' : '⬇️'} {Math.abs(report.crypto.eth.changePercent24h).toFixed(2)}%
                </p>
                <p className="text-sm text-gray-600 mt-2">情绪: {report.crypto.eth.sentiment === 'greed' ? '贪婪' : report.crypto.eth.sentiment === 'fear' ? '恐慌' : '中性'}</p>
              </div>
            )}
          </div>
        </div>

        {/* 黄金部分 */}
        {report.gold && report.gold.price && (
          <div className="bg-white rounded-lg shadow-md p-6 mb-8">
            <h2 className="text-2xl font-bold mb-4 text-blue-600">💛 黄金价格</h2>
            <div className="p-4 border-2 border-yellow-200 bg-yellow-50 rounded-lg">
              <p className="text-3xl font-bold">${report.gold.price.toFixed(2)}/oz</p>
              <p className={`text-lg font-semibold mt-2 ${report.gold.changePercent > 0 ? 'text-green-600' : 'text-red-600'}`}>
                {report.gold.changePercent > 0 ? '⬆️' : '⬇️'} {Math.abs(report.gold.changePercent).toFixed(2)}%
              </p>
              <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-2 text-sm">
                <div>💵 {report.gold.drivers.dollarIndex}</div>
                <div>📊 {report.gold.drivers.interestRate}</div>
                <div>🌍 {report.gold.drivers.geopoliticalRisk}</div>
              </div>
            </div>
          </div>
        )}

        {/* 邮件状态 */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-2xl font-bold mb-4 text-blue-600">✉️ 邮件发送状态</h2>
          <div className={`p-4 rounded-lg ${report.emailStatus.sent ? 'bg-green-50 border-2 border-green-200' : 'bg-red-50 border-2 border-red-200'}`}>
            {report.emailStatus.sent ? (
              <>
                <p className="text-green-700 font-semibold">✅ 邮件已成功发送</p>
                <p className="text-sm text-gray-600 mt-2">重试次数: {report.emailStatus.retries}</p>
              </>
            ) : (
              <>
                <p className="text-red-700 font-semibold">❌ 邮件发送失败</p>
                <p className="text-sm text-gray-600 mt-2">{report.emailStatus.error}</p>
                <p className="text-sm text-gray-600">重试次数: {report.emailStatus.retries}</p>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
