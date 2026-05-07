'use client'

import { useState, useEffect } from 'react'

interface Config {
  githubToken: string
  stockApiKey: string
  binanceApiKey: string
  binanceSecret: string
  emailHost: string
  emailPort: string
  emailUser: string
  emailPassword: string
  emailRecipients: string
}

const defaultConfig: Config = {
  githubToken: '',
  stockApiKey: '',
  binanceApiKey: '',
  binanceSecret: '',
  emailHost: 'smtp.gmail.com',
  emailPort: '587',
  emailUser: '',
  emailPassword: '',
  emailRecipients: '',
}

export default function Settings() {
  const [config, setConfig] = useState<Config>(defaultConfig)
  const [saved, setSaved] = useState(false)
  const [visible, setVisible] = useState<Record<keyof Config, boolean>>({} as Record<keyof Config, boolean>)

  useEffect(() => {
    const stored = localStorage.getItem('tech-finance-config')
    if (stored) {
      setConfig(JSON.parse(stored))
    }
  }, [])

  const handleChange = (key: keyof Config, value: string) => {
    setConfig({ ...config, [key]: value })
    setSaved(false)
  }

  const handleSave = () => {
    localStorage.setItem('tech-finance-config', JSON.stringify(config))
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  const handleReset = () => {
    if (confirm('确定要清除所有配置吗？')) {
      localStorage.removeItem('tech-finance-config')
      setConfig(defaultConfig)
      setSaved(false)
    }
  }

  const toggleVisible = (key: keyof Config) => {
    setVisible({ ...visible, [key]: !visible[key] })
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-2xl mx-auto">
        <div className="bg-white rounded-xl shadow-lg p-8">
          <h1 className="text-3xl font-bold mb-2">⚙️ 配置设置</h1>
          <p className="text-gray-600 mb-8">配置您的 API 密钥和环境变量</p>

          {saved && (
            <div className="mb-6 p-4 bg-green-100 text-green-800 rounded-lg">
              ✅ 配置已保存到浏览器本地存储
            </div>
          )}

          <div className="space-y-6">
            {/* GitHub 配置 */}
            <div className="border-b pb-4">
              <h2 className="text-xl font-semibold mb-4 text-blue-600">🐙 GitHub 配置</h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">GitHub Token</label>
                  <div className="flex gap-2">
                    <input
                      type={visible.githubToken ? 'text' : 'password'}
                      value={config.githubToken}
                      onChange={(e) => handleChange('githubToken', e.target.value)}
                      className="flex-1 px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="ghp_xxxxxxxxxxxx"
                    />
                    <button onClick={() => toggleVisible('githubToken')} className="px-4 py-2 border rounded-lg">
                      👁️
                    </button>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">用于获取 GitHub 趋势数据</p>
                </div>
              </div>
            </div>

            {/* Stock API 配置 */}
            <div className="border-b pb-4">
              <h2 className="text-xl font-semibold mb-4 text-green-600">📊 股票 API 配置</h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Alpha Vantage API Key</label>
                  <div className="flex gap-2">
                    <input
                      type={visible.stockApiKey ? 'text' : 'password'}
                      value={config.stockApiKey}
                      onChange={(e) => handleChange('stockApiKey', e.target.value)}
                      className="flex-1 px-4 py-2 border rounded-lg focus:ring-2 focus:ring-green-500"
                      placeholder="您的 Alpha Vantage API Key"
                    />
                    <button onClick={() => toggleVisible('stockApiKey')} className="px-4 py-2 border rounded-lg">
                      👁️
                    </button>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">免费注册: https://www.alphavantage.co</p>
                </div>
              </div>
            </div>

            {/* Binance 配置 */}
            <div className="border-b pb-4">
              <h2 className="text-xl font-semibold mb-4 text-yellow-600">🪙 Binance 配置</h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Binance API Key</label>
                  <div className="flex gap-2">
                    <input
                      type={visible.binanceApiKey ? 'text' : 'password'}
                      value={config.binanceApiKey}
                      onChange={(e) => handleChange('binanceApiKey', e.target.value)}
                      className="flex-1 px-4 py-2 border rounded-lg focus:ring-2 focus:ring-yellow-500"
                      placeholder="Binance API Key"
                    />
                    <button onClick={() => toggleVisible('binanceApiKey')} className="px-4 py-2 border rounded-lg">
                      👁️
                    </button>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Binance Secret</label>
                  <div className="flex gap-2">
                    <input
                      type={visible.binanceSecret ? 'text' : 'password'}
                      value={config.binanceSecret}
                      onChange={(e) => handleChange('binanceSecret', e.target.value)}
                      className="flex-1 px-4 py-2 border rounded-lg focus:ring-2 focus:ring-yellow-500"
                      placeholder="Binance API Secret"
                    />
                    <button onClick={() => toggleVisible('binanceSecret')} className="px-4 py-2 border rounded-lg">
                      👁️
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Email 配置 */}
            <div className="border-b pb-4">
              <h2 className="text-xl font-semibold mb-4 text-purple-600">📧 邮件配置</h2>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">SMTP Host</label>
                    <input
                      type="text"
                      value={config.emailHost}
                      onChange={(e) => handleChange('emailHost', e.target.value)}
                      className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500"
                      placeholder="smtp.gmail.com"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">SMTP Port</label>
                    <input
                      type="text"
                      value={config.emailPort}
                      onChange={(e) => handleChange('emailPort', e.target.value)}
                      className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500"
                      placeholder="587"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">邮箱地址</label>
                  <div className="flex gap-2">
                    <input
                      type="email"
                      value={config.emailUser}
                      onChange={(e) => handleChange('emailUser', e.target.value)}
                      className="flex-1 px-4 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500"
                      placeholder="your-email@gmail.com"
                    />
                    <button onClick={() => toggleVisible('emailUser')} className="px-4 py-2 border rounded-lg">
                      👁️
                    </button>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">邮箱密码（应用密码）</label>
                  <div className="flex gap-2">
                    <input
                      type={visible.emailPassword ? 'text' : 'password'}
                      value={config.emailPassword}
                      onChange={(e) => handleChange('emailPassword', e.target.value)}
                      className="flex-1 px-4 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500"
                      placeholder="16位应用密码（非登录密码）"
                    />
                    <button onClick={() => toggleVisible('emailPassword')} className="px-4 py-2 border rounded-lg">
                      👁️
                    </button>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">需要 Gmail 应用密码，非登录密码</p>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">收件人邮箱（逗号分隔）</label>
                  <textarea
                    value={config.emailRecipients}
                    onChange={(e) => handleChange('emailRecipients', e.target.value)}
                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500"
                    rows={2}
                    placeholder="recipient1@example.com, recipient2@example.com"
                  />
                </div>
              </div>
            </div>

            {/* 操作按钮 */}
            <div className="flex gap-4 pt-4">
              <button
                onClick={handleSave}
                className="flex-1 bg-blue-600 text-white py-3 px-6 rounded-lg font-medium hover:bg-blue-700 transition"
              >
                💾 保存配置
              </button>
              <button
                onClick={handleReset}
                className="px-6 py-3 border border-red-300 text-red-600 rounded-lg font-medium hover:bg-red-50 transition"
              >
                🗑️ 重置
              </button>
            </div>
          </div>

          {/* 提示信息 */}
          <div className="mt-8 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
            <h3 className="font-semibold text-yellow-800 mb-2">⚠️ 安全提示</h3>
            <ul className="text-sm text-yellow-700 space-y-1">
              <li>• 配置数据保存在浏览器本地存储中</li>
              <li>• 请勿在公共电脑上保存敏感信息</li>
              <li>• 定期清理浏览器缓存可清除保存的配置</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}