'use client'

import { useState } from 'react'
import { Loader2, CheckCircle, XCircle, Clock, ChevronDown, ChevronUp, Copy, Check } from 'lucide-react'

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

export default function ExecutePage() {
  const [tasks, setTasks] = useState<Record<string, TaskResult>>({
    github: { status: 'idle', message: '等待执行' },
    stock: { status: 'idle', message: '等待执行' },
    crypto: { status: 'idle', message: '等待执行' },
    gold: { status: 'idle', message: '等待执行' },
    email: { status: 'idle', message: '等待执行' },
  })
  const [expanded, setExpanded] = useState<Record<string, boolean>>({})
  const [copied, setCopied] = useState<string | null>(null)

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
          [taskName]: { status: 'success', message: '执行成功', data: result.data }
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

  const copyToClipboard = (taskName: string) => {
    const data = tasks[taskName as keyof typeof tasks]?.data
    if (data) {
      navigator.clipboard.writeText(JSON.stringify(data, null, 2))
      setCopied(taskName)
      setTimeout(() => setCopied(null), 2000)
    }
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

        {/* 单独执行 - 卡片式展示 */}
        <div className="card mb-8">
          <h2 className="text-xl font-semibold mb-4">单独执行</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {Object.entries(taskInfo).map(([key, info]) => {
              const task = tasks[key as keyof typeof tasks]
              return (
                <div key={key} className="border rounded-xl overflow-hidden">
                  <button
                    onClick={() => runTask(key)}
                    disabled={task.status === 'loading'}
                    className="w-full flex items-center gap-3 p-4 hover:bg-gray-50 transition disabled:opacity-50"
                  >
                    {getStatusIcon(task.status)}
                    <div className="text-left flex-1">
                      <div className="font-semibold">{info.name}</div>
                      <div className="text-sm text-gray-500">{task.message}</div>
                    </div>
                  </button>
                  
                  {/* 结果展开区域 */}
                  {task.data && (
                    <div className="border-t bg-gray-50">
                      <button
                        onClick={() => toggleExpanded(key)}
                        className="w-full flex items-center justify-between px-4 py-2 text-sm text-gray-600 hover:bg-gray-100"
                      >
                        <span>查看结果</span>
                        {expanded[key] ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                      </button>
                      
                      {expanded[key] && (
                        <div className="p-4 border-t">
                          <div className="flex justify-between items-center mb-2">
                            <span className="text-xs text-gray-500">数据预览</span>
                            <button
                              onClick={() => copyToClipboard(key)}
                              className="flex items-center gap-1 text-xs text-blue-600 hover:text-blue-800"
                            >
                              {copied === key ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                              {copied === key ? '已复制' : '复制'}
                            </button>
                          </div>
                          <pre className="bg-white p-3 rounded text-xs overflow-auto max-h-48 whitespace-pre-wrap">
                            {JSON.stringify(task.data, null, 2)}
                          </pre>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        </div>

        {/* 快速数据预览 */}
        <div className="card">
          <h2 className="text-xl font-semibold mb-4">📊 快速预览</h2>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            {Object.entries(tasks).map(([key, task]) => {
              const info = taskInfo[key as keyof typeof taskInfo]
              return (
                <div key={key} className={`p-4 rounded-lg border ${
                  task.status === 'success' ? 'bg-green-50 border-green-200' :
                  task.status === 'error' ? 'bg-red-50 border-red-200' :
                  'bg-gray-50 border-gray-200'
                }`}>
                  <div className="font-semibold mb-1">{info.name}</div>
                  <div className="text-sm text-gray-600">{task.message}</div>
                  {task.data && (
                    <div className="mt-2 text-xs text-gray-500">
                      {Array.isArray(task.data) ? `${task.data.length} 条数据` : '已有数据'}
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        </div>
      </div>
    </div>
  )
}