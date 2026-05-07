'use client'

import { useState } from 'react'
import { Loader2, CheckCircle, XCircle, Clock, ChevronDown, ChevronUp, ExternalLink, TrendingUp, TrendingDown, Minus } from 'lucide-react'

type TaskStatus = 'idle' | 'loading' | 'success' | 'error'

interface TaskResult {
  status: TaskStatus
  message: string
  data?: any
}

const taskInfo = {
  github: { name: '🐙 GitHub 趋势', description: '获取全球 Top10 热门项目', endpoint: '/api/github' },
  stock: { name: '📊 股票数据', description: '追踪技术对股价的影响', endpoint: '/api/stock' },
  crypto: { name: '🪙 加密货币', description: 'BTC/ETH 实时数据分析', endpoint: '/api/crypto' },
  gold: { name: '💛 黄金价格', description: '美元指数、利率、地缘政治', endpoint: '/api/crypto?type=gold' },
  email: { name: '📧 发送邮件', description: 'HTML 格式化结果推送', endpoint: '/api/email' },
}

function GitHubDataView({ data }: { data: any }) {
  if (!data || !data.trending) return <div className="text-gray-500">暂无数据</div>
  
  const repos = data.trending.slice(0, 5)
  
  return (
    <div className="space-y-3">
      {repos.map((repo: any, idx: number) => (
        <div key={idx} className="border rounded-lg p-3 bg-white">
          <div className="flex justify-between items-start">
            <div className="flex-1">
              <h4 className="font-semibold text-blue-600">{repo.name}</h4>
              {repo.description && (
                <p className="text-sm text-gray-600 mt-1 line-clamp-2">{repo.description}</p>
              )}
            </div>
            <a href={repo.url} target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-blue-500 ml-2">
              <ExternalLink className="w-4 h-4" />
            </a>
          </div>
          <div className="flex gap-4 mt-2 text-sm">
            <span className="text-yellow-500">⭐ {repo.stars}</span>
            <span className="text-green-500">+{repo.starsIncrease} 今日</span>
            {repo.language && <span className="text-gray-500">📁 {repo.language}</span>}
          </div>
          {repo.tags && repo.tags.length > 0 && (
            <div className="flex gap-2 mt-2 flex-wrap">
              {repo.tags.slice(0, 3).map((tag: string, i: number) => (
                <span key={i} className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded">{tag}</span>
              ))}
            </div>
          )}
        </div>
      ))}
    </div>
  )
}

function StockDataView({ data }: { data: any }) {
  if (!data || !data.stocks || data.stocks.length === 0) {
    return (
      <div className="text-center py-4 text-gray-500">
        <p>暂无股票数据</p>
        <p className="text-sm mt-1">请在设置页面配置 Alpha Vantage API Key</p>
      </div>
    )
  }
  
  const stocks = data.stocks.slice(0, 5)
  
  return (
    <div className="space-y-2">
      {stocks.map((stock: any, idx: number) => {
        const change = stock.changePercent || 0
        const TrendIcon = change > 0 ? TrendingUp : change < 0 ? TrendingDown : Minus
        const trendColor = change > 0 ? 'text-green-500' : change < 0 ? 'text-red-500' : 'text-gray-500'
        
        return (
          <div key={idx} className="flex justify-between items-center border-b pb-2">
            <div>
              <span className="font-semibold">{stock.symbol}</span>
              <span className="text-sm text-gray-500 ml-2">{stock.name || stock.symbol}</span>
            </div>
            <div className={`flex items-center gap-1 ${trendColor}`}>
              <TrendIcon className="w-4 h-4" />
              <span>{change > 0 ? '+' : ''}{change.toFixed(2)}%</span>
            </div>
          </div>
        )
      })}
    </div>
  )
}

function CryptoDataView({ data }: { data: any }) {
  if (!data) return <div className="text-gray-500">暂无数据</div>
  
  return (
    <div className="space-y-4">
      {data.btc && (
        <div className="border rounded-lg p-4 bg-white">
          <div className="flex justify-between items-center">
            <div>
              <h4 className="font-bold text-xl">₿ Bitcoin (BTC)</h4>
              {data.btc.price && <p className="text-2xl font-bold text-green-600">${data.btc.price.toLocaleString()}</p>}
            </div>
            {data.btc.change !== undefined && (
              <div className={`flex items-center gap-1 ${data.btc.change >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                <TrendIcon type={data.btc.change >= 0 ? 'up' : 'down'} />
                <span className="font-bold">{data.btc.change >= 0 ? '+' : ''}{data.btc.change.toFixed(2)}%</span>
              </div>
            )}
          </div>
        </div>
      )}
      {data.eth && (
        <div className="border rounded-lg p-4 bg-white">
          <div className="flex justify-between items-center">
            <div>
              <h4 className="font-bold text-xl">Ξ Ethereum (ETH)</h4>
              {data.eth.price && <p className="text-2xl font-bold text-green-600">${data.eth.price.toLocaleString()}</p>}
            </div>
            {data.eth.change !== undefined && (
              <div className={`flex items-center gap-1 ${data.eth.change >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                <TrendIcon type={data.eth.change >= 0 ? 'up' : 'down'} />
                <span className="font-bold">{data.eth.change >= 0 ? '+' : ''}{data.eth.change.toFixed(2)}%</span>
              </div>
            )}
          </div>
        </div>
      )}
      {!data.btc && !data.eth && (
        <div className="text-center py-4 text-gray-500">
          <p>暂无加密货币数据</p>
          <p className="text-sm mt-1">请在设置页面配置 Binance API</p>
        </div>
      )}
    </div>
  )
}

function TrendIcon({ type }: { type: 'up' | 'down' | 'neutral' }) {
  if (type === 'up') return <TrendingUp className="w-5 h-5" />
  if (type === 'down') return <TrendingDown className="w-5 h-5" />
  return <Minus className="w-5 h-5" />
}

function GoldDataView({ data }: { data: any }) {
  if (!data || !data.price) {
    return (
      <div className="text-center py-4 text-gray-500">
        <p>暂无黄金数据</p>
        <p className="text-sm mt-1">请在设置页面配置 API</p>
      </div>
    )
  }
  
  return (
    <div className="text-center py-4">
      <div className="text-4xl mb-2">🥇</div>
      <h4 className="font-bold text-xl">黄金价格</h4>
      <p className="text-3xl font-bold text-yellow-600 mt-2">${data.price.toLocaleString()}</p>
      {data.change !== undefined && (
        <div className={`flex items-center justify-center gap-1 mt-2 ${data.change >= 0 ? 'text-green-500' : 'text-red-500'}`}>
          <TrendIcon type={data.change >= 0 ? 'up' : 'down'} />
          <span>{data.change >= 0 ? '+' : ''}{data.change.toFixed(2)}%</span>
        </div>
      )}
    </div>
  )
}

function EmailDataView({ data }: { data: any }) {
  if (!data || data.sent === undefined) {
    return <div className="text-gray-500">等待发送邮件</div>
  }
  
  if (data.sent) {
    return (
      <div className="text-center py-4">
        <div className="text-4xl mb-2">✅</div>
        <p className="font-semibold text-green-600">邮件发送成功</p>
        <p className="text-sm text-gray-500 mt-1">重试次数: {data.retries || 0}</p>
      </div>
    )
  }
  
  return (
    <div className="text-center py-4">
      <div className="text-4xl mb-2">❌</div>
      <p className="font-semibold text-red-600">邮件发送失败</p>
      {data.error && <p className="text-sm text-gray-500 mt-1">{data.error}</p>}
    </div>
  )
}

const dataViews: Record<string, React.ComponentType<{ data: any }>> = {
  github: GitHubDataView,
  stock: StockDataView,
  crypto: CryptoDataView,
  gold: GoldDataView,
  email: EmailDataView,
}

export default function ExecutePage() {
  const [tasks, setTasks] = useState<Record<string, TaskResult>>({
    github: { status: 'idle', message: '等待执行' },
    stock: { status: 'idle', message: '等待执行' },
    crypto: { status: 'idle', message: '等待执行' },
    gold: { status: 'idle', message: '等待执行' },
    email: { status: 'idle', message: '等待执行' },
  })
  const [expanded, setExpanded] = useState<Record<string, boolean>>({})

  const runTask = async (taskName: string) => {
    const info = taskInfo[taskName as keyof typeof taskInfo]
    setTasks(prev => ({
      ...prev,
      [taskName]: { status: 'loading', message: '执行中...' }
    }))

    try {
      const response = await fetch(info.endpoint)
      const result = await response.json()

      if (result.success) {
        setTasks(prev => ({
          ...prev,
          [taskName]: { status: 'success', message: '执行成功', data: result.data || result }
        }))
      } else {
        setTasks(prev => ({
          ...prev,
          [taskName]: { status: 'error', message: result.error || '执行失败' }
        }))
      }
    } catch (error) {
      setTasks(prev => ({
        ...prev,
        [taskName]: { status: 'error', message: '网络错误' }
      }))
    }
  }

  const runAll = async () => {
    for (const taskName of Object.keys(taskInfo)) {
      await runTask(taskName)
    }
  }

  const getStatusIcon = (status: TaskStatus) => {
    switch (status) {
      case 'loading': return <Loader2 className="w-5 h-5 animate-spin text-blue-500" />
      case 'success': return <CheckCircle className="w-5 h-5 text-green-500" />
      case 'error': return <XCircle className="w-5 h-5 text-red-500" />
      default: return <Clock className="w-5 h-5 text-gray-400" />
    }
  }

  const toggleExpanded = (taskName: string) => {
    setExpanded(prev => ({ ...prev, [taskName]: !prev[taskName] }))
  }

  return (
    <div className="py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-8 text-center">🎯 执行任务</h1>

        {/* 一键执行所有 */}
        <div className="card text-center mb-8">
          <h2 className="text-xl font-semibold mb-4">一键执行</h2>
          <button
            onClick={runAll}
            disabled={Object.values(tasks).some(t => t.status === 'loading')}
            className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-8 py-4 rounded-xl font-bold text-lg hover:opacity-90 transition disabled:opacity-50"
          >
            {Object.values(tasks).some(t => t.status === 'loading') ? (
              <span className="flex items-center gap-2">
                <Loader2 className="w-5 h-5 animate-spin" />
                执行中...
              </span>
            ) : (
              '▶️ 执行全部任务'
            )}
          </button>
        </div>

        {/* 任务卡片展示 */}
        <div className="space-y-4 mb-8">
          {Object.entries(taskInfo).map(([key, info]) => {
            const task = tasks[key as keyof typeof tasks]
            const DataView = dataViews[key]
            
            return (
              <div key={key} className={`card ${
                task.status === 'success' ? 'border-green-300' :
                task.status === 'error' ? 'border-red-300' :
                'border-gray-200'
              }`}>
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    {getStatusIcon(task.status)}
                    <div>
                      <h3 className="text-lg font-semibold">{info.name}</h3>
                      <p className="text-sm text-gray-500">{info.description}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className={`text-sm ${
                      task.status === 'success' ? 'text-green-600' :
                      task.status === 'error' ? 'text-red-600' :
                      'text-gray-500'
                    }`}>
                      {task.message}
                    </span>
                    <button
                      onClick={() => runTask(key)}
                      disabled={task.status === 'loading'}
                      className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition disabled:opacity-50"
                    >
                      {task.status === 'loading' ? '执行中...' : '执行'}
                    </button>
                  </div>
                </div>
                
                {/* 数据展示区域 */}
                {task.data && (
                  <div className="border-t pt-4 mt-4">
                    <button
                      onClick={() => toggleExpanded(key)}
                      className="flex items-center gap-2 text-gray-600 hover:text-gray-800 mb-4"
                    >
                      {expanded[key] ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                      <span>{expanded[key] ? '收起详情' : '查看详情'}</span>
                    </button>
                    
                    {expanded[key] && DataView && (
                      <DataView data={task.data} />
                    )}
                  </div>
                )}
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}