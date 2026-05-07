'use client'

import { useState } from 'react'
import { Loader2, CheckCircle, XCircle, Clock } from 'lucide-react'

type TaskStatus = 'idle' | 'loading' | 'success' | 'error'

interface TaskResult {
  status: TaskStatus
  message: string
  data?: any
}

export default function ExecutePage() {
  const [tasks, setTasks] = useState<Record<string, TaskResult>>({
    github: { status: 'idle', message: '等待执行' },
    stock: { status: 'idle', message: '等待执行' },
    crypto: { status: 'idle', message: '等待执行' },
    gold: { status: 'idle', message: '等待执行' },
    email: { status: 'idle', message: '等待执行' },
  })

  const runTask = async (taskName: string, endpoint: string) => {
    setTasks(prev => ({
      ...prev,
      [taskName]: { status: 'loading', message: '执行中...' }
    }))

    try {
      const response = await fetch(endpoint)
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
    // 执行所有任务
    await runTask('github', '/api/github')
    await runTask('stock', '/api/stock')
    await runTask('crypto', '/api/crypto')
    await runTask('gold', '/api/crypto?type=gold')
    await runTask('email', '/api/email')
  }

  const getStatusIcon = (status: TaskStatus) => {
    switch (status) {
      case 'loading': return <Loader2 className="w-5 h-5 animate-spin text-blue-500" />
      case 'success': return <CheckCircle className="w-5 h-5 text-green-500" />
      case 'error': return <XCircle className="w-5 h-5 text-red-500" />
      default: return <Clock className="w-5 h-5 text-gray-400" />
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

        {/* 单独执行 */}
        <div className="card mb-8">
          <h2 className="text-xl font-semibold mb-4">单独执行</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <button
              onClick={() => runTask('github', '/api/github')}
              disabled={tasks.github.status === 'loading'}
              className="flex items-center gap-3 p-4 border rounded-xl hover:bg-blue-50 transition disabled:opacity-50"
            >
              {getStatusIcon(tasks.github.status)}
              <div className="text-left">
                <div className="font-semibold">🐙 GitHub 趋势</div>
                <div className="text-sm text-gray-500">{tasks.github.message}</div>
              </div>
            </button>

            <button
              onClick={() => runTask('stock', '/api/stock')}
              disabled={tasks.stock.status === 'loading'}
              className="flex items-center gap-3 p-4 border rounded-xl hover:bg-green-50 transition disabled:opacity-50"
            >
              {getStatusIcon(tasks.stock.status)}
              <div className="text-left">
                <div className="font-semibold">📊 股票数据</div>
                <div className="text-sm text-gray-500">{tasks.stock.message}</div>
              </div>
            </button>

            <button
              onClick={() => runTask('crypto', '/api/crypto')}
              disabled={tasks.crypto.status === 'loading'}
              className="flex items-center gap-3 p-4 border rounded-xl hover:bg-yellow-50 transition disabled:opacity-50"
            >
              {getStatusIcon(tasks.crypto.status)}
              <div className="text-left">
                <div className="font-semibold">🪙 加密货币</div>
                <div className="text-sm text-gray-500">{tasks.crypto.message}</div>
              </div>
            </button>

            <button
              onClick={() => runTask('gold', '/api/crypto?type=gold')}
              disabled={tasks.gold.status === 'loading'}
              className="flex items-center gap-3 p-4 border rounded-xl hover:bg-amber-50 transition disabled:opacity-50"
            >
              {getStatusIcon(tasks.gold.status)}
              <div className="text-left">
                <div className="font-semibold">💛 黄金价格</div>
                <div className="text-sm text-gray-500">{tasks.gold.message}</div>
              </div>
            </button>

            <button
              onClick={() => runTask('email', '/api/email')}
              disabled={tasks.email.status === 'loading'}
              className="flex items-center gap-3 p-4 border rounded-xl hover:bg-purple-50 transition disabled:opacity-50"
            >
              {getStatusIcon(tasks.email.status)}
              <div className="text-left">
                <div className="font-semibold">📧 发送邮件</div>
                <div className="text-sm text-gray-500">{tasks.email.message}</div>
              </div>
            </button>
          </div>
        </div>

        {/* 结果展示 */}
        {Object.entries(tasks).some(([_, t]) => t.data) && (
          <div className="card">
            <h2 className="text-xl font-semibold mb-4">📋 执行结果</h2>
            <pre className="bg-gray-100 p-4 rounded-lg overflow-auto max-h-96 text-xs">
              {JSON.stringify(
                Object.fromEntries(
                  Object.entries(tasks).filter(([_, t]) => t.data)
                ),
                null,
                2
              )}
            </pre>
          </div>
        )}
      </div>
    </div>
  )
}