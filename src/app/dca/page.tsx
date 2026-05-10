'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Calculator, TrendingUp, TrendingDown, RefreshCw, DollarSign, Calendar, PieChart } from 'lucide-react'

interface DCAResult {
  totalInvested: number
  totalInvestments: number
  avgCostBasis: number
  currentPrice: number
  totalBTC: number
  totalETH: number
  currentValue: number
  profit: number
  roi: number
  yearlyProjection: number
  monthlyData: { month: number; invested: number; btcAmount: number; value: number }[]
}

export default function DCAPage() {
  const [investmentAmount, setInvestmentAmount] = useState(100)
  const [frequency, setFrequency] = useState<'daily' | 'weekly' | 'biweekly' | 'monthly'>('weekly')
  const [duration, setDuration] = useState(12)
  const [crypto, setCrypto] = useState<'BTC' | 'ETH' | 'both'>('BTC')
  const [avgCostBasis, setAvgCostBasis] = useState(65000)
  const [currentPrice, setCurrentPrice] = useState(85000)
  const [result, setResult] = useState<DCAResult | null>(null)
  const [loading, setLoading] = useState(false)

  const performCalculation = () => {
    // 计算投资次数
    let investmentsPerMonth = frequency === 'daily' ? 30 : 
                              frequency === 'weekly' ? 4.33 : 
                              frequency === 'biweekly' ? 2.17 : 1
    
    const totalInvestments = Math.floor(duration * investmentsPerMonth)
    const totalInvested = investmentAmount * totalInvestments
    
    // 计算购买数量（使用平均成本法）
    const totalCryptoAmount = totalInvested / avgCostBasis
    
    // 当前价值
    const currentValue = totalCryptoAmount * currentPrice
    const profit = currentValue - totalInvested
    const roi = totalInvested > 0 ? (profit / totalInvested) * 100 : 0
    
    // 每年收益预测（基于历史平均年化收益）
    const yearlyReturnRate = 0.5 // 假设年化50%
    const yearlyProjection = totalInvested * yearlyReturnRate
    
    // 生成每月数据
    const monthlyData = []
    let runningInvested = 0
    let runningCrypto = 0
    
    for (let i = 1; i <= duration; i++) {
      const monthlyInvestment = investmentAmount * investmentsPerMonth
      const monthlyCrypto = monthlyInvestment / avgCostBasis
      runningInvested += monthlyInvestment
      runningCrypto += monthlyCrypto
      
      monthlyData.push({
        month: i,
        invested: runningInvested,
        btcAmount: runningCrypto,
        value: runningCrypto * currentPrice
      })
    }
    
    return {
      totalInvested,
      totalInvestments,
      avgCostBasis,
      currentPrice,
      totalBTC: crypto === 'BTC' || crypto === 'both' ? totalCryptoAmount : 0,
      totalETH: crypto === 'ETH' || crypto === 'both' ? totalCryptoAmount * 15 : 0,
      currentValue,
      profit,
      roi,
      yearlyProjection,
      monthlyData
    }
  }
  
  const calculate = () => {
    setLoading(true)
    setTimeout(() => {
      const result = performCalculation()
      setResult(result)
      setLoading(false)
    }, 300)
  }

  // 初始化计算
  useEffect(() => {
    const result = performCalculation()
    setResult(result)
  }, [investmentAmount, frequency, duration, crypto, avgCostBasis, currentPrice])

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* 顶部导航 */}
      <nav className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-4">
              <Link href="/" className="text-2xl font-bold text-blue-600">📊 TechFinance</Link>
              <span className="text-gray-400">|</span>
              <span className="text-blue-600 font-medium">DCA 定投计算器</span>
            </div>
            <Link href="/skills" className="text-gray-600 hover:text-blue-600 flex items-center gap-2">
              ← 返回技能中心
            </Link>
          </div>
        </div>
      </nav>

      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* 标题区 */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            💰 DCA 定投计算器
          </h1>
          <p className="text-gray-600 text-lg">
            Dollar Cost Averaging - 定期定额投资策略分析
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* 左侧：输入区域 */}
          <div className="lg:col-span-1 space-y-6">
            {/* 参数设置 */}
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                <Calculator className="w-5 h-5 text-blue-500" />
                投资参数
              </h2>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    每次投入金额 (USD)
                  </label>
                  <div className="relative">
                    <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type="number"
                      value={investmentAmount}
                      onChange={(e) => setInvestmentAmount(Number(e.target.value))}
                      className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                  <div className="flex gap-2 mt-2">
                    {[10, 50, 100, 500].map(amount => (
                      <button
                        key={amount}
                        onClick={() => setInvestmentAmount(amount)}
                        className={`px-3 py-1 rounded-lg text-sm ${
                          investmentAmount === amount 
                            ? 'bg-blue-100 text-blue-700 border-2 border-blue-500' 
                            : 'bg-gray-100 text-gray-600 border-2 border-transparent hover:bg-gray-200'
                        }`}
                      >
                        ${amount}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <Calendar className="w-4 h-4 inline mr-1" />
                    定投频率
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    {[
                      { value: 'daily', label: '每天', icon: '📅' },
                      { value: 'weekly', label: '每周', icon: '📆' },
                      { value: 'biweekly', label: '每两周', icon: '🗓️' },
                      { value: 'monthly', label: '每月', icon: '🗃️' }
                    ].map(option => (
                      <button
                        key={option.value}
                        onClick={() => setFrequency(option.value as any)}
                        className={`p-3 rounded-xl text-sm font-medium transition ${
                          frequency === option.value
                            ? 'bg-blue-600 text-white shadow-lg'
                            : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                        }`}
                      >
                        {option.icon} {option.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    投资时长（月）
                  </label>
                  <input
                    type="range"
                    min="1"
                    max="60"
                    value={duration}
                    onChange={(e) => setDuration(Number(e.target.value))}
                    className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                  />
                  <div className="flex justify-between text-sm text-gray-500 mt-1">
                    <span>1个月</span>
                    <span className="text-2xl font-bold text-blue-600">{duration}个月</span>
                    <span>60个月</span>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    选择币种
                  </label>
                  <div className="flex gap-2">
                    {[
                      { value: 'BTC', label: '₿ Bitcoin', color: 'orange' },
                      { value: 'ETH', label: 'Ξ Ethereum', color: 'purple' },
                      { value: 'both', label: '📊 BTC+ETH', color: 'blue' }
                    ].map(option => (
                      <button
                        key={option.value}
                        onClick={() => setCrypto(option.value as any)}
                        className={`flex-1 p-3 rounded-xl text-sm font-medium transition ${
                          crypto === option.value
                            ? `bg-${option.color}-600 text-white`
                            : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                        }`}
                      >
                        {option.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      平均成本 ($)
                    </label>
                    <input
                      type="number"
                      value={avgCostBasis}
                      onChange={(e) => setAvgCostBasis(Number(e.target.value))}
                      className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      当前价格 ($)
                    </label>
                    <input
                      type="number"
                      value={currentPrice}
                      onChange={(e) => setCurrentPrice(Number(e.target.value))}
                      className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>

                <button
                  onClick={calculate}
                  disabled={loading}
                  className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-3 px-6 rounded-xl font-bold hover:from-blue-700 hover:to-indigo-700 transition flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {loading ? (
                    <>
                      <RefreshCw className="w-5 h-5 animate-spin" />
                      计算中...
                    </>
                  ) : (
                    <>
                      <Calculator className="w-5 h-5" />
                      开始计算
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* 策略说明 */}
            <div className="bg-gradient-to-r from-blue-500 to-indigo-600 rounded-2xl shadow-lg p-6 text-white">
              <h3 className="font-bold text-lg mb-3">📚 DCA 策略说明</h3>
              <ul className="space-y-2 text-sm opacity-90">
                <li>• <strong>定期</strong> - 固定时间间隔投资</li>
                <li>• <strong>定额</strong> - 投入固定金额</li>
                <li>• <strong>平均成本</strong> - 降低价格波动影响</li>
                <li>• <strong>长期坚持</strong> - 分散投资风险</li>
              </ul>
              <div className="mt-4 pt-4 border-t border-white/20">
                <p className="text-xs opacity-80">
                  💡 提示：DCA 策略适合长期投资者，可有效降低市场波动带来的影响。
                </p>
              </div>
            </div>
          </div>

          {/* 右侧：结果展示 */}
          <div className="lg:col-span-2 space-y-6">
            {result && (
              <>
                {/* 核心指标卡片 */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="bg-white rounded-2xl shadow-lg p-5 text-center">
                    <div className="text-sm text-gray-500 mb-1">总投入</div>
                    <div className="text-2xl font-bold text-gray-900">
                      ${result.totalInvested.toLocaleString()}
                    </div>
                    <div className="text-xs text-gray-400 mt-1">
                      共 {result.totalInvestments} 次投资
                    </div>
                  </div>
                  
                  <div className="bg-white rounded-2xl shadow-lg p-5 text-center">
                    <div className="text-sm text-gray-500 mb-1">购买数量</div>
                    <div className="text-2xl font-bold text-orange-600">
                      {result.totalBTC.toFixed(6)} BTC
                    </div>
                    <div className="text-xs text-gray-400 mt-1">
                      ≈ ${result.currentValue.toLocaleString()}
                    </div>
                  </div>

                  <div className={`rounded-2xl shadow-lg p-5 text-center ${
                    result.profit >= 0 ? 'bg-green-50' : 'bg-red-50'
                  }`}>
                    <div className={`text-sm mb-1 ${
                      result.profit >= 0 ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {result.profit >= 0 ? '📈 预估收益' : '📉 预估亏损'}
                    </div>
                    <div className={`text-2xl font-bold ${
                      result.profit >= 0 ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {result.profit >= 0 ? '+' : ''}${result.profit.toFixed(2)}
                    </div>
                    <div className={`text-xs mt-1 ${
                      result.profit >= 0 ? 'text-green-500' : 'text-red-500'
                    }`}>
                      收益率: {result.roi >= 0 ? '+' : ''}{result.roi.toFixed(2)}%
                    </div>
                  </div>

                  <div className="bg-white rounded-2xl shadow-lg p-5 text-center">
                    <div className="text-sm text-gray-500 mb-1">年均收益预测</div>
                    <div className="text-2xl font-bold text-blue-600">
                      ${result.yearlyProjection.toFixed(0)}
                    </div>
                    <div className="text-xs text-gray-400 mt-1">
                      基于 50% 年化
                    </div>
                  </div>
                </div>

                {/* 成本分析 */}
                <div className="bg-white rounded-2xl shadow-lg p-6">
                  <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                    <PieChart className="w-5 h-5 text-blue-500" />
                    成本分析
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="text-center p-4 bg-gray-50 rounded-xl">
                      <div className="text-sm text-gray-500 mb-1">平均买入成本</div>
                      <div className="text-3xl font-bold text-gray-900">
                        ${result.avgCostBasis.toLocaleString()}
                      </div>
                    </div>
                    <div className="text-center p-4 bg-blue-50 rounded-xl">
                      <div className="text-sm text-blue-600 mb-1">当前价格</div>
                      <div className="text-3xl font-bold text-blue-600">
                        ${result.currentPrice.toLocaleString()}
                      </div>
                    </div>
                    <div className={`text-center p-4 rounded-xl ${
                      currentPrice > avgCostBasis ? 'bg-green-100' : 'bg-red-100'
                    }`}>
                      <div className={`text-sm mb-1 ${
                        currentPrice > avgCostBasis ? 'text-green-600' : 'text-red-600'
                      }`}>
                        {currentPrice > avgCostBasis ? '📈 价格优势' : '📉 价格劣势'}
                      </div>
                      <div className={`text-3xl font-bold ${
                        currentPrice > avgCostBasis ? 'text-green-600' : 'text-red-600'
                      }`}>
                        {(currentPrice > avgCostBasis ? '+' : '') + 
                          (((currentPrice - avgCostBasis) / avgCostBasis) * 100).toFixed(2)}%
                      </div>
                    </div>
                  </div>
                </div>

                {/* 收益进度条 */}
                <div className="bg-white rounded-2xl shadow-lg p-6">
                  <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                    <TrendingUp className="w-5 h-5 text-green-500" />
                    收益进度
                  </h3>
                  <div className="mb-4">
                    <div className="flex justify-between text-sm mb-2">
                      <span className="text-gray-600">成本: ${result.totalInvested.toLocaleString()}</span>
                      <span className="text-gray-600">当前: ${result.currentValue.toLocaleString()}</span>
                    </div>
                    <div className="h-4 bg-gray-200 rounded-full overflow-hidden">
                      <div 
                        className={`h-full rounded-full transition-all duration-500 ${
                          result.roi >= 0 ? 'bg-gradient-to-r from-green-400 to-green-600' : 'bg-gradient-to-r from-red-400 to-red-600'
                        }`}
                        style={{ width: `${Math.min(Math.max((result.roi + 50) / 100 * 100, 5), 100)}%` }}
                      />
                    </div>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className={`font-bold ${result.roi >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                      {result.roi >= 0 ? '🎉 盈利中' : '😰 亏损中'}
                    </span>
                    <span className="text-gray-500">
                      收益率: {result.roi >= 0 ? '+' : ''}{result.roi.toFixed(2)}%
                    </span>
                  </div>
                </div>

                {/* 模拟图表 */}
                <div className="bg-white rounded-2xl shadow-lg p-6">
                  <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                    📊 投资模拟曲线
                  </h3>
                  <div className="space-y-2">
                    {result.monthlyData.filter((_, i) => i % Math.max(1, Math.floor(duration / 12)) === 0).map((data, i) => (
                      <div key={i} className="flex items-center gap-4">
                        <span className="text-sm text-gray-500 w-16">第{data.month}月</span>
                        <div className="flex-1 h-6 bg-blue-100 rounded">
                          <div 
                            className="h-full bg-gradient-to-r from-blue-500 to-blue-600 rounded flex items-center justify-end pr-2"
                            style={{ width: `${(data.value / result.currentValue) * 100}%` }}
                          >
                            <span className="text-xs text-white font-bold">
                              ${data.value.toFixed(0)}
                            </span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </>
            )}
          </div>
        </div>

        {/* 风险提示 */}
        <div className="mt-8 bg-yellow-50 border border-yellow-200 rounded-2xl p-6">
          <h3 className="font-bold text-yellow-800 mb-3 flex items-center gap-2">
            ⚠️ 重要风险提示
          </h3>
          <ul className="text-sm text-yellow-700 space-y-2">
            <li>• 加密货币投资具有高风险，价格波动剧烈</li>
            <li>• 本计算器仅供参考，不构成投资建议</li>
            <li>• 过去的表现不代表未来收益</li>
            <li>• 请根据自身风险承受能力谨慎投资</li>
            <li>• 建议分散投资，不要把所有资金投入单一标的</li>
          </ul>
        </div>
      </main>

      {/* 页脚 */}
      <footer className="bg-gray-800 text-white text-center py-6 mt-12">
        <p>© 2026 科技金融量化分析系统 | DCA 定投计算器</p>
      </footer>
    </div>
  )
}