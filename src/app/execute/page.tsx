'use client'

import { useState } from 'react'
import { Loader2, CheckCircle, XCircle, Clock, ChevronDown, ChevronUp, ExternalLink, TrendingUp, TrendingDown, Minus, Settings, Sparkles, Brain } from 'lucide-react'

type TaskStatus = 'idle' | 'loading' | 'success' | 'error'

interface TaskResult {
  status: TaskStatus
  message: string
  data?: any
}

const taskInfo = {
  github: { name: '🐙 GitHub 趋势', description: '获取全球 Top10 热门项目', endpoint: '/api/github' },
  stock: { name: '📊 股票数据', description: '追踪技术对股价的影响', endpoint: '/api/stock?symbol=NVDA,AMD,COIN,NVDA,AMD,COIN' },
  crypto: { name: '🪙 加密货币', description: 'BTC/ETH 实时数据分析', endpoint: '/api/crypto' },
  gold: { name: '💛 黄金价格', description: '美元指数、利率、地缘政治', endpoint: '/api/crypto?type=gold' },
  email: { name: '📧 发送邮件', description: 'HTML 格式化结果推送', endpoint: '/api/email' },
}

function TrendIcon({ type }: { type: 'up' | 'down' | 'neutral' }) {
  if (type === 'up') return <TrendingUp className="w-5 h-5" />
  if (type === 'down') return <TrendingDown className="w-5 h-5" />
  return <Minus className="w-5 h-5" />
}

function GitHubDataView({ data }: { data: any }) {
  const [expanded, setExpanded] = useState<Record<number, boolean>>({})
  const [explaining, setExplaining] = useState<Record<number, boolean>>({})
  const [explanations, setExplanations] = useState<Record<number, string>>({})
  
  const repos = Array.isArray(data) ? data : data?.trending || data?.githubTrending || []
  
  if (!repos || repos.length === 0) {
    return (
      <div className="text-center py-6">
        <div className="text-4xl mb-2">🔍</div>
        <p className="font-semibold text-gray-600">暂无 GitHub 趋势数据</p>
      </div>
    )
  }

  const handleExplain = async (idx: number, repo: any) => {
    setExplaining({ ...explaining, [idx]: true })
    try {
      // 从 localStorage 获取 MiniMax API Key
      const storedConfig = localStorage.getItem('tech-finance-config')
      const config = storedConfig ? JSON.parse(storedConfig) : {}
      const miniMaxApiKey = config.minimaxApiKey || ''
      
      const response = await fetch('/api/explain', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ repo, apiKey: miniMaxApiKey }),
      })
      const result = await response.json()
      if (result.success) {
        setExplanations({ ...explanations, [idx]: result.data.explanation })
      }
    } catch (error) {
      console.error('解释生成失败:', error)
    }
    setExplaining({ ...explaining, [idx]: false })
  }
  
  return (
    <div className="space-y-3">
      {repos.map((repo: any, idx: number) => (
        <div key={idx} className="border rounded-lg p-4 bg-gradient-to-r from-white to-blue-50">
          <div className="flex justify-between items-start">
            <div className="flex-1">
              <h4 className="font-semibold text-blue-600 text-lg">{repo.name}</h4>
              {repo.description && (
                <p className="text-sm text-gray-600 mt-1 line-clamp-2">{repo.description}</p>
              )}
            </div>
            <a href={repo.url} target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:text-blue-700 ml-2">
              <ExternalLink className="w-5 h-5" />
            </a>
          </div>
          <div className="flex gap-4 mt-3 text-sm items-center">
            <span className="bg-yellow-100 text-yellow-700 px-3 py-1 rounded-full font-semibold">
              ⭐ {repo.stars}
            </span>
            <span className="bg-green-100 text-green-700 px-3 py-1 rounded-full">
              +{repo.starsIncrease} 今日
            </span>
            {repo.language && (
              <span className="text-gray-500">📁 {repo.language}</span>
            )}
          </div>
          {repo.tags && repo.tags.length > 0 && (
            <div className="flex gap-2 mt-3 flex-wrap">
              {repo.tags.map((tag: string, i: number) => (
                <span key={i} className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded-full">{tag}</span>
              ))}
            </div>
          )}
          
          {/* AI 解释按钮 */}
          <div className="mt-4 pt-3 border-t flex gap-2">
            <button
              onClick={() => handleExplain(idx, repo)}
              disabled={explaining[idx]}
              className="flex items-center gap-2 px-3 py-1.5 bg-purple-100 text-purple-700 rounded-lg text-sm hover:bg-purple-200 transition disabled:opacity-50"
            >
              {explaining[idx] ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  生成中...
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  AI 专业解释
                </>
              )}
            </button>
            <button
              onClick={() => setExpanded({ ...expanded, [idx]: !expanded[idx] })}
              className="flex items-center gap-1 px-3 py-1.5 bg-gray-100 text-gray-600 rounded-lg text-sm hover:bg-gray-200 transition"
            >
              {expanded[idx] ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
              {expanded[idx] ? '收起' : '详情'}
            </button>
          </div>
          
          {/* 展开的详情 */}
          {expanded[idx] && (
            <div className="mt-4 pt-3 border-t">
              {explanations[idx] ? (
                <div className="bg-white p-4 rounded-lg border prose prose-sm max-w-none">
                  <div className="text-xs text-gray-500 mb-2 flex items-center gap-1">
                    <Brain className="w-3 h-3" />
                    AI 自动生成的分析
                  </div>
                  <div className="whitespace-pre-wrap text-sm">{explanations[idx]}</div>
                </div>
              ) : (
                <p className="text-sm text-gray-500">点击"AI 专业解释"按钮生成分析内容</p>
              )}
            </div>
          )}
        </div>
      ))}
      <p className="text-center text-gray-400 text-sm mt-2">共 {repos.length} 个项目</p>
    </div>
  )
}

function StockDataView({ data }: { data: any }) {
  const stocks = data?.stocks || data || []
  
  if (!stocks || stocks.length === 0) {
    return (
      <div className="text-center py-6">
        <div className="text-4xl mb-2">📊</div>
        <p className="font-semibold text-gray-600">暂无股票数据</p>
        <div className="mt-3 p-3 bg-yellow-50 rounded-lg">
          <p className="text-sm text-yellow-700">⚠️ 需要配置 Alpha Vantage API Key</p>
          <a href="/settings" className="inline-flex items-center gap-1 text-sm text-blue-600 hover:text-blue-800 mt-2">
            <Settings className="w-4 h-4" />
            去设置页面配置
          </a>
        </div>
      </div>
    )
  }
  
  return (
    <div className="space-y-2">
      {stocks.map((stock: any, idx: number) => {
        const change = stock.changePercent || stock.change || 0
        const trendType = change > 0 ? 'up' : change < 0 ? 'down' : 'neutral'
        
        return (
          <div key={idx} className="flex justify-between items-center p-3 bg-white rounded-lg border">
            <div>
              <span className="font-bold text-lg">{stock.symbol}</span>
              <span className="text-sm text-gray-500 ml-2">{stock.name || stock.company || ''}</span>
            </div>
            <div className={`flex items-center gap-2 ${
              change > 0 ? 'text-green-500' : change < 0 ? 'text-red-500' : 'text-gray-500'
            }`}>
              <TrendIcon type={trendType} />
              <span className="font-bold text-lg">{change > 0 ? '+' : ''}{change.toFixed(2)}%</span>
            </div>
          </div>
        )
      })}
      <p className="text-center text-gray-400 text-sm mt-2">共 {stocks.length} 只股票</p>
    </div>
  )
}

function CryptoDataView({ data }: { data: any }) {
  const btcData = data?.btc || data?.BTC || data
  const ethData = data?.eth || data?.ETH
  
  if (!btcData && !ethData) {
    return (
      <div className="text-center py-6">
        <div className="text-4xl mb-2">🪙</div>
        <p className="font-semibold text-gray-600">暂无加密货币数据</p>
        <div className="mt-3 p-3 bg-yellow-50 rounded-lg">
          <p className="text-sm text-yellow-700">⚠️ 需要配置 Binance API</p>
          <a href="/settings" className="inline-flex items-center gap-1 text-sm text-blue-600 hover:text-blue-800 mt-2">
            <Settings className="w-4 h-4" />
            去设置页面配置
          </a>
        </div>
      </div>
    )
  }
  
  return (
    <div className="space-y-4">
      {btcData && (
        <div className="border-2 border-orange-200 rounded-xl p-4 bg-gradient-to-r from-orange-50 to-yellow-50">
          <div className="flex justify-between items-center">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-2xl">₿</span>
                <h4 className="font-bold text-xl">Bitcoin (BTC)</h4>
              </div>
              {btcData.price && (
                <p className="text-3xl font-bold text-orange-600 mt-1">${btcData.price.toLocaleString()}</p>
              )}
            </div>
            {btcData.changePercent !== undefined && (
              <div className={`flex items-center gap-2 ${btcData.changePercent >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                <TrendIcon type={btcData.changePercent >= 0 ? 'up' : 'down'} />
                <span className="font-bold text-xl">{btcData.changePercent >= 0 ? '+' : ''}{btcData.changePercent.toFixed(2)}%</span>
              </div>
            )}
          </div>
        </div>
      )}
      
      {ethData && (
        <div className="border-2 border-purple-200 rounded-xl p-4 bg-gradient-to-r from-purple-50 to-blue-50">
          <div className="flex justify-between items-center">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-2xl">Ξ</span>
                <h4 className="font-bold text-xl">Ethereum (ETH)</h4>
              </div>
              {ethData.price && (
                <p className="text-3xl font-bold text-purple-600 mt-1">${ethData.price.toLocaleString()}</p>
              )}
            </div>
            {ethData.changePercent !== undefined && (
              <div className={`flex items-center gap-2 ${ethData.changePercent >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                <TrendIcon type={ethData.changePercent >= 0 ? 'up' : 'down'} />
                <span className="font-bold text-xl">{ethData.changePercent >= 0 ? '+' : ''}{ethData.changePercent.toFixed(2)}%</span>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

function GoldDataView({ data }: { data: any }) {
  if (!data || (!data.price && !data.currentPrice)) {
    return (
      <div className="text-center py-6">
        <div className="text-4xl mb-2">🥇</div>
        <p className="font-semibold text-gray-600">暂无黄金数据</p>
        <div className="mt-3 p-3 bg-yellow-50 rounded-lg">
          <p className="text-sm text-yellow-700">⚠️ 需要配置相关 API</p>
          <a href="/settings" className="inline-flex items-center gap-1 text-sm text-blue-600 hover:text-blue-800 mt-2">
            <Settings className="w-4 h-4" />
            去设置页面配置
          </a>
        </div>
      </div>
    )
  }
  
  const price = data.price || data.currentPrice || 0
  const change = data.change || data.changePercent || 0
  
  return (
    <div className="text-center py-4">
      <div className="text-5xl mb-2">🥇</div>
      <h4 className="font-bold text-xl">黄金价格</h4>
      <p className="text-4xl font-bold text-yellow-600 mt-2">${price.toLocaleString()}</p>
      <div className={`flex items-center justify-center gap-2 mt-3 ${
        change >= 0 ? 'text-green-500' : 'text-red-500'
      }`}>
        <TrendIcon type={change >= 0 ? 'up' : 'down'} />
        <span className="font-bold text-lg">{change >= 0 ? '+' : ''}{change.toFixed(2)}%</span>
      </div>
    </div>
  )
}

function EmailDataView({ data }: { data: any }) {
  if (data === undefined || data === null) {
    return (
      <div className="text-center py-4">
        <div className="text-4xl mb-2">📧</div>
        <p className="text-gray-500">等待发送邮件</p>
      </div>
    )
  }
  
  const sent = data?.sent !== undefined ? data.sent : data?.success
  
  if (sent) {
    return (
      <div className="text-center py-4">
        <div className="text-5xl mb-2">✅</div>
        <p className="font-bold text-green-600 text-xl">邮件发送成功!</p>
        {data.recipients && <p className="text-sm text-gray-500 mt-1">收件人: {data.recipients}</p>}
        <p className="text-xs text-gray-400 mt-2">重试次数: {data.retries || 0}</p>
      </div>
    )
  }
  
  return (
    <div className="text-center py-4">
      <div className="text-5xl mb-2">❌</div>
      <p className="font-bold text-red-600 text-xl">邮件发送失败</p>
      {data.error && (
        <p className="text-sm text-gray-500 mt-1">原因: {data.error}</p>
      )}
      <div className="mt-3 p-3 bg-yellow-50 rounded-lg">
        <p className="text-sm text-yellow-700">⚠️ 请检查邮箱配置</p>
        <a href="/settings" className="inline-flex items-center gap-1 text-sm text-blue-600 hover:text-blue-800 mt-2">
          <Settings className="w-4 h-4" />
          去设置页面检查
        </a>
      </div>
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
              <div key={key} className={`card border-2 ${
                task.status === 'success' ? 'border-green-300 bg-green-50' :
                task.status === 'error' ? 'border-red-300 bg-red-50' :
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
                    <span className={`text-sm font-semibold ${
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
                  <div className="border-t border-gray-200 pt-4 mt-4">
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