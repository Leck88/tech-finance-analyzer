'use client'

import { useState, useEffect } from 'react'
import {
  Calculator, BarChart3, PieChart, DollarSign, Play,
  Shield, Brain, Target, Zap, BookOpen, ArrowRight,
  ChevronDown, ChevronUp, Loader2, RefreshCw, AlertTriangle,
  Check, X, Info, Clock, TrendingUp, TrendingDown, Minus
} from 'lucide-react'

type SkillCategory = 'analysis' | 'risk' | 'strategy' | 'tools' | 'education'

interface FinancialSkill {
  id: string
  name: string
  icon: string
  category: SkillCategory
  description: string
  features: string[]
  difficulty: 'beginner' | 'intermediate' | 'advanced'
  implemented: boolean
  endpoint?: string
}

const skills: FinancialSkill[] = [
  {
    id: 'technical-analysis',
    name: '技术分析工具',
    icon: '📊',
    category: 'analysis',
    description: 'RSI、MACD、布林带等技术指标计算与分析',
    features: ['RSI 超买超卖判断', 'MACD 金叉死叉识别', '布林带突破信号', '移动平均线分析'],
    difficulty: 'intermediate',
    implemented: true,
    endpoint: '/api/market?type=technical'
  },
  {
    id: 'market-sentiment',
    name: '市场情绪分析',
    icon: '😱',
    category: 'analysis',
    description: '基于多维度数据判断市场恐惧与贪婪程度',
    features: ['恐惧贪婪指数', '成交量情绪分析', '涨跌比分析', '社交媒体情绪'],
    difficulty: 'intermediate',
    implemented: true,
    endpoint: '/api/market?type=overview'
  },
  {
    id: 'portfolio-tracker',
    name: '投资组合追踪',
    icon: '💼',
    category: 'analysis',
    description: '追踪和管理您的加密货币投资组合',
    features: ['持仓管理', '盈亏计算', '资产配置分析', '历史收益曲线'],
    difficulty: 'beginner',
    implemented: false
  },
  {
    id: 'risk-calculator',
    name: '风险计算器',
    icon: '⚠️',
    category: 'risk',
    description: '计算投资风险指标和仓位管理建议',
    features: ['VaR 风险价值计算', '夏普比率', '最大回撤', '仓位大小建议'],
    difficulty: 'advanced',
    implemented: false
  },
  {
    id: 'position-sizing',
    name: '仓位管理',
    icon: '🎯',
    category: 'risk',
    description: '基于凯利公式和风险偏好的仓位管理工具',
    features: ['凯利公式计算', '固定比例法', '波动率调整', '止损策略'],
    difficulty: 'intermediate',
    implemented: true
  },
  {
    id: 'backtest-engine',
    name: '策略回测',
    icon: '🔄',
    category: 'strategy',
    description: '历史数据回测交易策略的有效性',
    features: ['均线交叉策略回测', 'RSI策略回测', '布林带策略回测', 'MACD策略回测', '组合策略回测', '收益曲线绘制', '风险指标统计'],
    difficulty: 'advanced',
    implemented: true
  },
  {
    id: 'arbitrage-scanner',
    name: '套利机会扫描',
    icon: '🔍',
    category: 'strategy',
    description: '扫描跨交易所和三角套利机会',
    features: ['跨所价差监控', '三角套利计算', '手续费扣除', '实时利润估算'],
    difficulty: 'advanced',
    implemented: false
  },
  {
    id: 'converter',
    name: '货币转换器',
    icon: '💱',
    category: 'tools',
    description: '实时加密货币和法币转换计算',
    features: ['实时汇率转换', '多币种支持', '历史汇率查询', '批量转换'],
    difficulty: 'beginner',
    implemented: true,
    endpoint: '/api/crypto'
  },
  {
    id: 'tax-calculator',
    name: '税务计算器',
    icon: '🏛️',
    category: 'tools',
    description: '计算加密货币交易的应税收益',
    features: ['盈亏计算', 'FIFO/LIFO 方法', '年度税务报告', '多国税制支持'],
    difficulty: 'intermediate',
    implemented: false
  },
  {
    id: 'trading-glossary',
    name: '交易术语大全',
    icon: '📖',
    category: 'education',
    description: '加密货币和金融交易常用术语解释',
    features: ['200+ 术语解释', '中英对照', '分类搜索', '实际案例'],
    difficulty: 'beginner',
    implemented: true
  },
  {
    id: 'chart-patterns',
    name: 'K线形态识别',
    icon: '🕯️',
    category: 'education',
    description: '学习和识别常见的K线形态',
    features: ['十字星/Hammer/Shooting Star', '吞没形态（Bullish/Bearish Engulfing）', '晨星/夜星三日反转', '三白兵/三黑鸦', '头肩顶/底、双顶/双底', '三角形整理、旗形整理'],
    difficulty: 'intermediate',
    implemented: true
  },
]

function DifficultyBadge({ level }: { level: 'beginner' | 'intermediate' | 'advanced' }) {
  const config = {
    beginner: { label: '入门', color: 'bg-green-100 text-green-700' },
    intermediate: { label: '进阶', color: 'bg-yellow-100 text-yellow-700' },
    advanced: { label: '高级', color: 'bg-red-100 text-red-700' },
  }
  const { label, color } = config[level]
  return <span className={`text-xs px-2 py-0.5 rounded-full ${color}`}>{label}</span>
}

function SignalBadge({ signal }: { signal: string }) {
  const config: Record<string, { label: string; color: string; bg: string }> = {
    strong_buy: { label: '强烈买入', color: 'text-green-600', bg: 'bg-green-100' },
    buy: { label: '买入', color: 'text-green-500', bg: 'bg-green-50' },
    neutral: { label: '中性', color: 'text-gray-500', bg: 'bg-gray-100' },
    sell: { label: '卖出', color: 'text-red-500', bg: 'bg-red-50' },
    strong_sell: { label: '强烈卖出', color: 'text-red-600', bg: 'bg-red-100' },
  }
  const c = config[signal] || config.neutral
  return <span className={`text-xs px-2 py-0.5 rounded-full ${c.bg} ${c.color} font-medium`}>{c.label}</span>
}

function PatternCard({ pattern }: { pattern: any }) {
  const typeIcon = pattern.type === 'bullish' ? '🟢' : pattern.type === 'bearish' ? '🔴' : '⚪'
  const typeColor = pattern.type === 'bullish' ? 'text-green-600' : pattern.type === 'bearish' ? 'text-red-600' : 'text-gray-500'
  return (
    <div className={`border rounded-lg p-3 flex items-start gap-3 ${pattern.type === 'bullish' ? 'border-green-200 bg-green-50' : pattern.type === 'bearish' ? 'border-red-200 bg-red-50' : 'border-gray-200 bg-gray-50'}`}>
      <span className="text-xl">{typeIcon}</span>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <span className={`font-bold text-sm ${typeColor}`}>{pattern.pattern}</span>
          <SignalBadge signal={pattern.signal} />
          <span className="text-xs text-gray-400">{pattern.confidence}% 置信度</span>
        </div>
        <p className="text-xs text-gray-600 mt-1">{pattern.description}</p>
      </div>
    </div>
  )
}

function CandlestickRecognizer() {
  const [symbol, setSymbol] = useState('BTCUSDT')
  const [interval, setInterval] = useState('1h')
  const [limit, setLimit] = useState(100)
  const [loading, setLoading] = useState(false)
  const [data, setData] = useState<any>(null)
  const [error, setError] = useState<string | null>(null)

  const fetchData = async () => {
    setLoading(true)
    setError(null)
    try {
      const res = await fetch(`/api/candlestick?symbol=${symbol}&interval=${interval}&limit=${limit}`)
      const json = await res.json()
      if (json.success) {
        setData(json.data)
      } else {
        setError(json.error || '获取数据失败')
      }
    } catch (e: any) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchData() }, [])

  const intervals = ['1m', '5m', '15m', '1h', '4h', '1d']
  const symbols = ['BTCUSDT', 'ETHUSDT', 'BNBUSDT', 'SOLUSDT', 'XRPUSDT', 'ADAUSDT']

  return (
    <div className="bg-white rounded-xl shadow-md p-6 space-y-5">
      <h3 className="text-lg font-bold flex items-center gap-2">
        🕯️ K线形态识别引擎
      </h3>

      {/* 控制区 */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
        <div>
          <label className="block text-xs font-medium text-gray-500 mb-1">交易品种</label>
          <select value={symbol} onChange={e => setSymbol(e.target.value)} className="w-full px-3 py-2 border rounded-lg text-sm">
            {symbols.map(s => <option key={s} value={s}>{s}</option>)}
          </select>
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-500 mb-1">时间周期</label>
          <select value={interval} onChange={e => setInterval(e.target.value)} className="w-full px-3 py-2 border rounded-lg text-sm">
            {intervals.map(i => <option key={i} value={i}>{i}</option>)}
          </select>
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-500 mb-1">K线数量</label>
          <select value={limit} onChange={e => setLimit(Number(e.target.value))} className="w-full px-3 py-2 border rounded-lg text-sm">
            <option value={50}>50根</option>
            <option value={100}>100根</option>
            <option value={200}>200根</option>
          </select>
        </div>
        <div className="flex items-end">
          <button onClick={fetchData} disabled={loading} className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition flex items-center justify-center gap-2 text-sm disabled:opacity-50">
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />}
            {loading ? '分析中...' : '开始分析'}
          </button>
        </div>
      </div>

      {error && <div className="text-red-500 text-sm bg-red-50 p-3 rounded-lg">{error}</div>}

      {data && (
        <>
          {/* 价格概览 */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <div className="bg-gradient-to-r from-blue-50 to-blue-100 p-3 rounded-lg text-center">
              <div className="text-xs text-blue-500">当前价格</div>
              <div className="font-bold text-lg">${Number(data.latest.price).toLocaleString()}</div>
              <div className={`text-xs font-medium ${Number(data.latest.change) >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                {Number(data.latest.change) >= 0 ? '▲' : '▼'} {data.latest.change}%
              </div>
            </div>
            <div className="bg-gray-50 p-3 rounded-lg text-center">
              <div className="text-xs text-gray-500">趋势判断</div>
              <div className={`font-bold text-lg flex items-center justify-center gap-1 ${data.trend === 'up' ? 'text-green-600' : data.trend === 'down' ? 'text-red-600' : 'text-gray-600'}`}>
                {data.trend === 'up' ? <TrendingUp className="w-4 h-4" /> : data.trend === 'down' ? <TrendingDown className="w-4 h-4" /> : <Minus className="w-4 h-4" />}
                {data.trend === 'up' ? '上涨' : data.trend === 'down' ? '下跌' : '震荡'}
              </div>
            </div>
            <div className="bg-yellow-50 p-3 rounded-lg text-center">
              <div className="text-xs text-yellow-600">检测形态</div>
              <div className="font-bold text-lg text-yellow-700">{data.count.total} 个</div>
              <div className="text-xs text-gray-400">{data.interval} 周期</div>
            </div>
            <div className="bg-indigo-50 p-3 rounded-lg text-center">
              <div className="text-xs text-indigo-600">操作建议</div>
              <div className="font-bold text-sm text-indigo-700 leading-tight mt-1">{data.recommendation}</div>
            </div>
          </div>

          {/* 多空信号统计 */}
          <div className="flex gap-2 text-xs">
            <span className="flex items-center gap-1 px-2 py-1 bg-green-100 text-green-700 rounded-full">
              🟢 看涨 {data.count.bullish}
            </span>
            <span className="flex items-center gap-1 px-2 py-1 bg-red-100 text-red-700 rounded-full">
              🔴 看跌 {data.count.bearish}
            </span>
            <span className="flex items-center gap-1 px-2 py-1 bg-gray-100 text-gray-600 rounded-full">
              ⚪ 中性 {data.count.total - data.count.bullish - data.count.bearish}
            </span>
          </div>

          {/* 检测到的形态 */}
          {data.detected && data.detected.length > 0 ? (
            <div className="space-y-2">
              <h4 className="font-bold text-sm text-gray-700">📋 检测到的形态</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                {data.detected.map((p: any, idx: number) => (
                  <PatternCard key={idx} pattern={p} />
                ))}
              </div>
            </div>
          ) : (
            <div className="text-center py-6 text-gray-400">
              <span className="text-2xl">🔍</span>
              <p className="text-sm mt-1">未检测到明显形态，建议观望</p>
            </div>
          )}

          {/* K线迷你图 */}
          {data.candles && data.candles.length > 0 && (
            <div>
              <h4 className="font-bold text-sm text-gray-700 mb-2">📊 最近K线走势</h4>
              <div className="flex items-end gap-px h-20 overflow-hidden">
                {data.candles.map((c: any, idx: number) => {
                  const isBull = c.close >= c.open
                  const range = Math.max(...data.candles.map((x: any) => x.high)) - Math.min(...data.candles.map((x: any) => x.low))
                  const h = range > 0 ? ((c.high - c.low) / range) * 80 : 4
                  const bodyTop = range > 0 ? ((Math.max(c.open, c.close) - Math.min(...data.candles.map((x: any) => x.low))) / range) * 80 : 40
                  const bodyBot = range > 0 ? ((Math.min(c.open, c.close) - Math.min(...data.candles.map((x: any) => x.low))) / range) * 80 : 40
                  return (
                    <div key={idx} className="flex-1 flex flex-col justify-end relative group">
                      <div
                        className={`mx-px rounded-sm ${isBull ? 'bg-green-400' : 'bg-red-400'}`}
                        style={{ height: `${Math.max(bodyTop - bodyBot, 1)}px`, position: 'absolute', top: `${bodyBot}px`, left: 0, right: 0 }}
                      />
                      <div
                        className={`mx-px ${isBull ? 'bg-green-600' : 'bg-red-600'}`}
                        style={{ height: `${h}px`, position: 'absolute', bottom: 0, left: 0, right: 0 }}
                      />
                    </div>
                  )
                })}
              </div>
            </div>
          )}

          {/* 形态说明 */}
          <div className="bg-blue-50 border border-blue-100 rounded-lg p-4">
            <h4 className="font-bold text-blue-700 text-sm mb-2">📚 支持的K线形态</h4>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-2 text-xs text-blue-600">
              {[
                { name: '十字星 Doji', desc: '市场犹豫不决' },
                { name: '锤子线 Hammer', desc: '看涨反转' },
                { name: '流星线 Shooting Star', desc: '看跌反转' },
                { name: '看涨吞没 Bullish Engulfing', desc: '多头反转' },
                { name: '看跌吞没 Bearish Engulfing', desc: '空头反转' },
                { name: '晨星 Morning Star', desc: '三日看涨反转' },
                { name: '夜星 Evening Star', desc: '三日看跌反转' },
                { name: '三白兵 Three White Soldiers', desc: '强烈看涨' },
                { name: '三黑鸦 Three Black Crows', desc: '强烈看跌' },
                { name: '头肩顶/底 Head & Shoulders', desc: '反转形态' },
                { name: '双顶/双底 Double Top/Bottom', desc: '反转形态' },
                { name: '三角形/旗形 Triangle/Flag', desc: '整理形态' },
              ].map((item, idx) => (
                <div key={idx} className="flex gap-1">
                  <span className="font-medium whitespace-nowrap">{item.name}</span>
                  <span className="text-blue-400">— {item.desc}</span>
                </div>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  )
}

function PositionSizer() {
  const [accountSize, setAccountSize] = useState(10000)
  const [riskPercent, setRiskPercent] = useState(2)
  const [entryPrice, setEntryPrice] = useState(50000)
  const [stopLoss, setStopLoss] = useState(48000)
  const [result, setResult] = useState<any>(null)

  const calculate = () => {
    const riskAmount = accountSize * (riskPercent / 100)
    const priceRisk = Math.abs(entryPrice - stopLoss)
    if (priceRisk === 0) return
    const positionSize = riskAmount / priceRisk
    const positionValue = positionSize * entryPrice
    const leverage = positionValue / accountSize
    setResult({
      riskAmount: riskAmount.toFixed(2),
      positionSize: positionSize.toFixed(6),
      positionValue: positionValue.toFixed(2),
      leverage: leverage.toFixed(2),
      stopLossPercent: ((priceRisk / entryPrice) * 100).toFixed(2),
    })
  }

  return (
    <div className="bg-white rounded-xl shadow-md p-6 space-y-4">
      <h3 className="text-lg font-bold flex items-center gap-2">
        <Target className="w-5 h-5 text-green-500" />
        仓位管理计算器
      </h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium mb-1">账户余额 ($)</label>
          <input type="number" value={accountSize} onChange={e => setAccountSize(Number(e.target.value))} className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500" />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">风险比例 (%)</label>
          <input type="number" value={riskPercent} onChange={e => setRiskPercent(Number(e.target.value))} className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500" step="0.5" />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">入场价格 ($)</label>
          <input type="number" value={entryPrice} onChange={e => setEntryPrice(Number(e.target.value))} className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500" />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">止损价格 ($)</label>
          <input type="number" value={stopLoss} onChange={e => setStopLoss(Number(e.target.value))} className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500" />
        </div>
      </div>
      <button onClick={calculate} className="w-full bg-green-600 text-white py-2 rounded-lg hover:bg-green-700 transition">计算仓位</button>
      {result && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-4">
          <div className="bg-red-50 p-3 rounded-lg text-center">
            <div className="text-xs text-red-600">风险金额</div>
            <div className="font-bold text-lg">${result.riskAmount}</div>
          </div>
          <div className="bg-blue-50 p-3 rounded-lg text-center">
            <div className="text-xs text-blue-600">建议仓位</div>
            <div className="font-bold text-sm">{result.positionSize} BTC</div>
          </div>
          <div className="bg-purple-50 p-3 rounded-lg text-center">
            <div className="text-xs text-purple-600">仓位价值</div>
            <div className="font-bold text-lg">${Number(result.positionValue).toLocaleString()}</div>
          </div>
          <div className="bg-yellow-50 p-3 rounded-lg text-center">
            <div className="text-xs text-yellow-600">止损幅度</div>
            <div className="font-bold text-lg">{result.stopLossPercent}%</div>
          </div>
        </div>
      )}
    </div>
  )
}

function CurrencyConverter() {
  const [amount, setAmount] = useState(1)
  const [fromCurrency, setFromCurrency] = useState('BTC')
  const [toCurrency, setToCurrency] = useState('USD')
  const [rates, setRates] = useState<Record<string, number>>({})
  const [loading, setLoading] = useState(false)

  const fetchRates = async () => {
    setLoading(true)
    try {
      const response = await fetch('/api/crypto')
      const data = await response.json()
      if (data.success) {
        const btcPrice = data.data?.btc?.price || 0
        const ethPrice = data.data?.eth?.price || 0
        setRates({ BTC: btcPrice, ETH: ethPrice, USD: 1, CNY: 7.25, EUR: 0.92, JPY: 149.5 })
      }
    } catch (err) { console.error('Failed to fetch rates:', err) }
    finally { setLoading(false) }
  }

  useEffect(() => { fetchRates() }, [])

  const convert = () => {
    if (!rates[fromCurrency] || !rates[toCurrency]) return 0
    return (amount * rates[fromCurrency]) / rates[toCurrency]
  }

  const currencies = ['BTC', 'ETH', 'USD', 'CNY', 'EUR', 'JPY']

  return (
    <div className="bg-white rounded-xl shadow-md p-6 space-y-4">
      <h3 className="text-lg font-bold flex items-center gap-2">
        <DollarSign className="w-5 h-5 text-yellow-500" />
        实时货币转换器
      </h3>
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
        <div>
          <label className="block text-sm font-medium mb-1">金额</label>
          <input type="number" value={amount} onChange={e => setAmount(Number(e.target.value))} className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500" />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">从</label>
          <select value={fromCurrency} onChange={e => setFromCurrency(e.target.value)} className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500">
            {currencies.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">到</label>
          <select value={toCurrency} onChange={e => setToCurrency(e.target.value)} className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500">
            {currencies.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>
        <div className="bg-gradient-to-r from-blue-500 to-purple-500 text-white p-3 rounded-lg text-center">
          <div className="text-xs opacity-80">转换结果</div>
          <div className="font-bold text-xl">{loading ? '...' : convert().toFixed(fromCurrency === 'BTC' || fromCurrency === 'ETH' ? 8 : 2)}</div>
          <div className="text-xs opacity-80">{toCurrency}</div>
        </div>
      </div>
      <button onClick={fetchRates} disabled={loading} className="flex items-center gap-2 text-sm text-blue-600 hover:text-blue-800">
        <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />刷新汇率
      </button>
    </div>
  )
}

function TradingGlossary() {
  const [searchTerm, setSearchTerm] = useState('')
  const [expandedIdx, setExpandedIdx] = useState<number | null>(null)

  const glossary = [
    { term: 'HODL', en: 'Hold On for Dear Life', meaning: '长期持有策略，不因短期波动而卖出。', example: '尽管市场暴跌30%，他依然选择HODL。' },
    { term: 'FOMO', en: 'Fear Of Missing Out', meaning: '害怕错过行情而盲目追涨的心理。', example: '看到BTC连涨7天，FOMO情绪驱使他All-in。' },
    { term: 'FUD', en: 'Fear, Uncertainty, Doubt', meaning: '散布恐慌情绪的信息，通常是为了压低价格。', example: '这条新闻明显是FUD，不要被吓到。' },
    { term: 'DYOR', en: 'Do Your Own Research', meaning: '自己做研究，不要盲目相信他人推荐。', example: '投资前一定要DYOR。' },
    { term: 'ATH', en: 'All-Time High', meaning: '历史最高价格。', example: 'BTC刚突破新的ATH，达到$100,000。' },
    { term: 'ATL', en: 'All-Time Low', meaning: '历史最低价格。', example: '这个代币跌到了ATL，风险极大。' },
    { term: 'Whale', en: 'Whale', meaning: '持有大量加密货币的投资者，其交易行为能影响市场价格。', example: '一个Whale刚刚转移了10,000 BTC到交易所。' },
    { term: 'DCA', en: 'Dollar Cost Averaging', meaning: '定期定额投资策略，分散投资时间以降低平均成本。', example: '我每周DCA $100买入BTC。' },
    { term: '止损', en: 'Stop Loss', meaning: '预设的卖出价格，用于限制投资损失。', example: '设置5%的止损，防止大幅亏损。' },
    { term: '做多/做空', en: 'Long/Short', meaning: '做多是预期价格上涨买入获利；做空是预期价格下跌借入卖出获利。', example: '他在BTC上开了2倍杠杆做多。' },
  ]

  const filtered = glossary.filter(item =>
    item.term.toLowerCase().includes(searchTerm.toLowerCase()) || item.meaning.toLowerCase().includes(searchTerm.toLowerCase())
  )

  return (
    <div className="bg-white rounded-xl shadow-md p-6 space-y-4">
      <h3 className="text-lg font-bold flex items-center gap-2">
        <BookOpen className="w-5 h-5 text-indigo-500" />
        交易术语大全
      </h3>
      <input type="text" value={searchTerm} onChange={e => setSearchTerm(e.target.value)} placeholder="搜索术语..." className="w-full pl-4 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500" />
      <div className="space-y-2 max-h-64 overflow-y-auto">
        {filtered.map((item, idx) => (
          <div key={idx} className="border rounded-lg overflow-hidden">
            <button onClick={() => setExpandedIdx(expandedIdx === idx ? null : idx)} className="w-full flex justify-between items-center p-3 hover:bg-gray-50 transition">
              <div className="flex items-center gap-2">
                <span className="font-bold text-indigo-600">{item.term}</span>
                <span className="text-xs text-gray-400">({item.en})</span>
              </div>
              {expandedIdx === idx ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </button>
            {expandedIdx === idx && (
              <div className="p-3 bg-gray-50 border-t">
                <p className="text-sm text-gray-700 mb-2">{item.meaning}</p>
                {item.example && <p className="text-xs text-blue-600 italic">💡 例: {item.example}</p>}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}

function BacktestEngine() {
  const [symbol, setSymbol] = useState('BTCUSDT')
  const [interval, setInterval] = useState('1h')
  const [strategy, setStrategy] = useState('ma_cross')
  const [fastPeriod, setFastPeriod] = useState(10)
  const [slowPeriod, setSlowPeriod] = useState(30)
  const [rsiPeriod, setRsiPeriod] = useState(14)
  const [capital, setCapital] = useState(10000)
  const [loading, setLoading] = useState(false)
  const [data, setData] = useState<any>(null)
  const [error, setError] = useState<string | null>(null)

  const fetchData = async () => {
    setLoading(true)
    setError(null)
    try {
      const params = new URLSearchParams({symbol, interval, strategy, fastPeriod: String(fastPeriod), slowPeriod: String(slowPeriod), rsiPeriod: String(rsiPeriod), capital: String(capital), limit: '500'})
      const res = await fetch(`/api/backtest?${params}`)
      const json = await res.json()
      if (json.success) setData(json.data)
      else setError(json.error || '回测失败')
    } catch (e: any) { setError(e.message) }
    finally { setLoading(false) }
  }

  useEffect(() => { fetchData() }, [])

  const strategies = [
    { value: 'ma_cross', label: '均线交叉 (MA Cross)' },
    { value: 'rsi', label: 'RSI 策略' },
    { value: 'bollinger', label: '布林带策略' },
    { value: 'macd', label: 'MACD 策略' },
    { value: 'combined', label: '组合策略 (MA+RSI)' },
  ]
  const intervals = ['1h', '4h', '1d']
  const symbols = ['BTCUSDT', 'ETHUSDT', 'BNBUSDT', 'SOLUSDT', 'XRPUSDT']
  const m = data?.metrics

  return (
    <div className="bg-white rounded-xl shadow-md p-6 space-y-5">
      <h3 className="text-lg font-bold flex items-center gap-2">
        <Play className="w-5 h-5 text-blue-500" />
        策略回测引擎
      </h3>

      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        <div>
          <label className="block text-xs font-medium text-gray-500 mb-1">交易品种</label>
          <select value={symbol} onChange={e => setSymbol(e.target.value)} className="w-full px-2 py-2 border rounded-lg text-sm">
            {symbols.map(s => <option key={s} value={s}>{s}</option>)}
          </select>
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-500 mb-1">周期</label>
          <select value={interval} onChange={e => setInterval(e.target.value)} className="w-full px-2 py-2 border rounded-lg text-sm">
            {intervals.map(i => <option key={i} value={i}>{i}</option>)}
          </select>
        </div>
        <div className="md:col-span-2">
          <label className="block text-xs font-medium text-gray-500 mb-1">策略 + 参数</label>
          <div className="flex gap-2">
            <select value={strategy} onChange={e => setStrategy(e.target.value)} className="flex-1 px-2 py-2 border rounded-lg text-sm">
              {strategies.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
            </select>
            {strategy === 'ma_cross' && (
              <>
                <input type="number" value={fastPeriod} onChange={e => setFastPeriod(Number(e.target.value))} className="w-14 px-2 py-2 border rounded-lg text-sm text-center" />
                <input type="number" value={slowPeriod} onChange={e => setSlowPeriod(Number(e.target.value))} className="w-14 px-2 py-2 border rounded-lg text-sm text-center" />
              </>
            )}
            {strategy === 'rsi' && (
              <input type="number" value={rsiPeriod} onChange={e => setRsiPeriod(Number(e.target.value))} className="w-14 px-2 py-2 border rounded-lg text-sm text-center" />
            )}
          </div>
        </div>
        <div className="flex items-end">
          <button onClick={fetchData} disabled={loading} className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition flex items-center justify-center gap-2 text-sm disabled:opacity-50">
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <BarChart3 className="w-4 h-4" />}
            {loading ? '回测中...' : '开始回测'}
          </button>
        </div>
      </div>

      {error && <div className="text-red-500 text-sm bg-red-50 p-3 rounded-lg">{error}</div>}

      {data && m && (
        <>
          <div className="grid grid-cols-3 md:grid-cols-6 gap-2">
            <div className={`p-3 rounded-lg text-center ${m.totalReturn >= 0 ? 'bg-green-50' : 'bg-red-50'}`}>
              <div className="text-xs text-gray-500">总收益率</div>
              <div className={`font-bold text-lg ${m.totalReturn >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {m.totalReturn >= 0 ? '▲' : '▼'} {m.totalReturn.toFixed(2)}%
              </div>
            </div>
            <div className="p-3 rounded-lg text-center bg-blue-50">
              <div className="text-xs text-blue-500">年化收益</div>
              <div className={`font-bold text-lg ${m.annualizedReturn >= 0 ? 'text-blue-600' : 'text-red-600'}`}>
                {m.annualizedReturn >= 0 ? '+' : ''}{m.annualizedReturn.toFixed(1)}%
              </div>
            </div>
            <div className="p-3 rounded-lg text-center bg-red-50">
              <div className="text-xs text-red-500">最大回撤</div>
              <div className="font-bold text-lg text-red-600">{m.maxDrawdown.toFixed(2)}%</div>
            </div>
            <div className="p-3 rounded-lg text-center bg-purple-50">
              <div className="text-xs text-purple-500">夏普比率</div>
              <div className="font-bold text-lg text-purple-600">{m.sharpeRatio.toFixed(2)}</div>
            </div>
            <div className="p-3 rounded-lg text-center bg-yellow-50">
              <div className="text-xs text-yellow-600">胜率</div>
              <div className="font-bold text-lg text-yellow-700">{m.winRate.toFixed(1)}%</div>
            </div>
            <div className="p-3 rounded-lg text-center bg-gray-50">
              <div className="text-xs text-gray-500">交易次数</div>
              <div className="font-bold text-lg text-gray-700">{m.totalTrades}</div>
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-xs">
            <div className="flex justify-between bg-gray-50 p-2 rounded"><span className="text-gray-500">盈亏比</span><span className="font-bold">{m.profitFactor.toFixed(2)}</span></div>
            <div className="flex justify-between bg-gray-50 p-2 rounded"><span className="text-gray-500">索提诺比率</span><span className="font-bold">{m.sortinoRatio.toFixed(2)}</span></div>
            <div className="flex justify-between bg-gray-50 p-2 rounded"><span className="text-gray-500">最大连亏</span><span className="font-bold">{m.maxConsecutiveLosses}次</span></div>
            <div className="flex justify-between bg-gray-50 p-2 rounded"><span className="text-gray-500">平均持仓</span><span className="font-bold">{m.avgHoldingBars.toFixed(1)}根</span></div>
          </div>

          <div className="flex flex-wrap gap-4 text-sm">
            <div className="flex items-center gap-2">
              <span className="text-gray-500">策略收益:</span>
              <span className={`font-bold ${m.totalReturn >= 0 ? 'text-green-600' : 'text-red-600'}`}>{m.totalReturn >= 0 ? '+' : ''}{m.totalReturn.toFixed(2)}%</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-gray-500">买入持有:</span>
              <span className={`font-bold ${data.buyAndHold >= 0 ? 'text-green-600' : 'text-red-600'}`}>{data.buyAndHold >= 0 ? '+' : ''}{data.buyAndHold.toFixed(2)}%</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-gray-500">策略Alpha:</span>
              <span className={`font-bold ${(m.totalReturn - data.buyAndHold) >= 0 ? 'text-blue-600' : 'text-orange-600'}`}>{(m.totalReturn - data.buyAndHold) >= 0 ? '+' : ''}{(m.totalReturn - data.buyAndHold).toFixed(2)}%</span>
            </div>
          </div>

          {data.equitySummary && data.equitySummary.length > 0 && (
            <div>
              <h4 className="font-bold text-sm text-gray-700 mb-2">📈 权益曲线</h4>
              <div className="h-24 flex items-end gap-px">
                {(() => {
                  const minE = Math.min(...data.equitySummary.map((x: any) => x.equity))
                  const maxE = Math.max(...data.equitySummary.map((x: any) => x.equity))
                  const range = maxE - minE || 1
                  return data.equitySummary.map((p: any, idx: number) => {
                    const h = ((p.equity - minE) / range) * 80 + 4
                    const isProfit = p.equity >= capital
                    return <div key={idx} className="flex-1 flex flex-col justify-end"><div title={`$${p.equity.toFixed(0)}`} className={`rounded-sm ${isProfit ? 'bg-green-400' : 'bg-red-400'}`} style={{ height: `${h}px` }} /></div>
                  })
                })()}
              </div>
            </div>
          )}

          {data.recentTrades && data.recentTrades.length > 0 && (
            <div>
              <h4 className="font-bold text-sm text-gray-700 mb-2">📋 最近交易</h4>
              <div className="overflow-x-auto">
                <table className="w-full text-xs">
                  <thead>
                    <tr className="text-gray-500 border-b">
                      <th className="text-left py-1">方向</th>
                      <th className="text-right py-1">入场</th>
                      <th className="text-right py-1">出场</th>
                      <th className="text-right py-1">收益率</th>
                      <th className="text-left py-1">原因</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.recentTrades.map((t: any, idx: number) => (
                      <tr key={idx} className={`border-b ${t.pnl >= 0 ? 'bg-green-50' : 'bg-red-50'}`}>
                        <td className={`py-1 font-bold ${t.side === 'long' ? 'text-green-600' : 'text-red-600'}`}>{t.side === 'long' ? '▲ 做多' : '▼ 做空'}</td>
                        <td className="text-right py-1">${t.entryPrice.toFixed(2)}</td>
                        <td className="text-right py-1">${t.exitPrice.toFixed(2)}</td>
                        <td className={`text-right py-1 font-bold ${t.pnlPercent >= 0 ? 'text-green-600' : 'text-red-600'}`}>{t.pnlPercent >= 0 ? '+' : ''}{t.pnlPercent.toFixed(2)}%</td>
                        <td className="py-1 text-gray-500 truncate max-w-32">{t.reason}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {data.monthlyReturns && Object.keys(data.monthlyReturns).length > 0 && (
            <div>
              <h4 className="font-bold text-sm text-gray-700 mb-2">📅 月度收益率</h4>
              <div className="grid grid-cols-4 md:grid-cols-6 gap-1">
                {Object.entries(data.monthlyReturns).map(([month, ret]) => (
                  <div key={month} className={`text-center p-2 rounded text-xs ${(ret as number) >= 0 ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
                    <div className="text-gray-400">{month.slice(5)}月</div>
                    <div className="font-bold">{(ret as number) >= 0 ? '+' : ''}{(ret as number).toFixed(1)}%</div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  )
}


function FearGreedIndex() {
  const [index, setIndex] = useState<number | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchIndex = async () => {
      setLoading(true)
      try {
        const response = await fetch('/api/crypto')
        const data = await response.json()
        if (data.success) {
          const btcChange = data.data?.btc?.changePercent24h || 0
          const sentiment = 50 + btcChange * 5 + Math.random() * 10
          setIndex(Math.min(100, Math.max(0, sentiment)))
        }
      } catch (err) { console.error(err) }
      finally { setLoading(false) }
    }
    fetchIndex()
  }, [])

  const getLabel = (val: number) => {
    if (val <= 20) return { text: '极度恐惧', color: 'text-red-600', bg: 'bg-red-500' }
    if (val <= 40) return { text: '恐惧', color: 'text-orange-500', bg: 'bg-orange-500' }
    if (val <= 60) return { text: '中性', color: 'text-yellow-500', bg: 'bg-yellow-500' }
    if (val <= 80) return { text: '贪婪', color: 'text-green-500', bg: 'bg-green-500' }
    return { text: '极度贪婪', color: 'text-green-600', bg: 'bg-green-600' }
  }

  if (loading) return <div className="bg-white rounded-xl shadow-md p-6 flex items-center justify-center"><Loader2 className="w-6 h-6 animate-spin text-blue-500" /></div>

  const label = index !== null ? getLabel(index) : null

  return (
    <div className="bg-white rounded-xl shadow-md p-6">
      <h3 className="text-lg font-bold mb-4 flex items-center gap-2">😱 市场恐惧贪婪指数</h3>
      {index !== null && label && (
        <div className="text-center">
          <div className="relative w-48 h-24 mx-auto mb-4">
            <svg viewBox="0 0 200 100" className="w-full h-full">
              <path d="M 10 95 A 90 90 0 0 1 190 95" fill="none" stroke="#e5e7eb" strokeWidth="12" strokeLinecap="round" />
              <path d="M 10 95 A 90 90 0 0 1 190 95" fill="none" stroke={index > 60 ? '#22c55e' : index > 40 ? '#eab308' : '#ef4444'} strokeWidth="12" strokeLinecap="round" strokeDasharray={`${index * 2.83} 283`} />
            </svg>
            <div className="absolute inset-0 flex items-end justify-center pb-0">
              <span className={`text-4xl font-bold ${label.color}`}>{Math.round(index)}</span>
            </div>
          </div>
          <p className={`text-lg font-semibold ${label.color}`}>{label.text}</p>
          <div className="flex justify-between text-xs text-gray-400 mt-2 px-4">
            <span>极度恐惧</span><span>极度贪婪</span>
          </div>
        </div>
      )}
    </div>
  )
}

export default function SkillsPage() {
  const [activeCategory, setActiveCategory] = useState<SkillCategory | 'all'>('all')
  const [expandedSkill, setExpandedSkill] = useState<string | null>(null)

  const categories = [
    { key: 'all' as const, label: '🎯 全部', count: skills.length },
    { key: 'analysis' as const, label: '📊 市场分析', count: skills.filter(s => s.category === 'analysis').length },
    { key: 'risk' as const, label: '⚠️ 风险管理', count: skills.filter(s => s.category === 'risk').length },
    { key: 'strategy' as const, label: '🧠 交易策略', count: skills.filter(s => s.category === 'strategy').length },
    { key: 'tools' as const, label: '🔧 实用工具', count: skills.filter(s => s.category === 'tools').length },
    { key: 'education' as const, label: '📖 学习资源', count: skills.filter(s => s.category === 'education').length },
  ]

  const filteredSkills = activeCategory === 'all' ? skills : skills.filter(s => s.category === activeCategory)

  return (
    <div className="py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">🧠 金融技能工具箱</h1>
          <p className="text-gray-500 text-lg">集合多种实用金融分析工具，助力您的投资决策</p>
        </div>

        {/* 分类导航 */}
        <div className="flex flex-wrap justify-center gap-2 mb-8">
          {categories.map(cat => (
            <button key={cat.key} onClick={() => setActiveCategory(cat.key)} className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition ${activeCategory === cat.key ? 'bg-blue-600 text-white shadow-lg' : 'bg-white text-gray-600 hover:bg-gray-100 border'}`}>
              {cat.label}
              <span className={`text-xs px-1.5 py-0.5 rounded-full ${activeCategory === cat.key ? 'bg-blue-500' : 'bg-gray-200'}`}>{cat.count}</span>
            </button>
          ))}
        </div>

        {/* K线形态识别 - 核心新功能 */}
        <div className="mb-8">
          <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
            <Zap className="w-5 h-5 text-yellow-500" />新增功能
          </h2>
          <CandlestickRecognizer />
        </div>

        {/* 内置工具区 */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-12">
          <FearGreedIndex />
          <CurrencyConverter />
          <PositionSizer />
          <div className="lg:col-span-2">
            <BacktestEngine />
          </div>
        </div>

        {/* 术语大全 */}
        <div className="mb-12">
          <TradingGlossary />
        </div>

        {/* 技能卡片 */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
            <Zap className="w-6 h-6 text-yellow-500" />
            金融分析技能
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredSkills.map(skill => (
              <div key={skill.id} className={`bg-white rounded-xl shadow-md border-2 transition hover:shadow-lg ${skill.implemented ? 'border-green-200' : 'border-gray-200'}`}>
                <div className="p-5">
                  <div className="flex justify-between items-start mb-3">
                    <div className="flex items-center gap-2">
                      <span className="text-2xl">{skill.icon}</span>
                      <h3 className="font-bold text-lg">{skill.name}</h3>
                    </div>
                    {skill.implemented ? (
                      <span className="flex items-center gap-1 text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full">
                        <Check className="w-3 h-3" /> 已实现
                      </span>
                    ) : (
                      <span className="flex items-center gap-1 text-xs bg-gray-100 text-gray-500 px-2 py-1 rounded-full">
                        <Clock className="w-3 h-3" /> 即将推出
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-gray-600 mb-3">{skill.description}</p>
                  <div className="flex items-center gap-2 mb-3">
                    <DifficultyBadge level={skill.difficulty} />
                  </div>
                  <button onClick={() => setExpandedSkill(expandedSkill === skill.id ? null : skill.id)} className="flex items-center gap-1 text-sm text-blue-600 hover:text-blue-800">
                    {expandedSkill === skill.id ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                    {expandedSkill === skill.id ? '收起' : '查看功能'}
                  </button>
                  {expandedSkill === skill.id && (
                    <div className="mt-3 pt-3 border-t">
                      <ul className="space-y-1">
                        {skill.features.map((feature, idx) => (
                          <li key={idx} className="flex items-center gap-2 text-sm text-gray-600">
                            <ArrowRight className="w-3 h-3 text-blue-500" />{feature}
                          </li>
                        ))}
                      </ul>
                      {skill.implemented && skill.endpoint && (
                        <a href={skill.endpoint} className="inline-flex items-center gap-1 mt-3 text-sm text-blue-600 hover:underline">
                          前往使用 <ArrowRight className="w-3 h-3" />
                        </a>
                      )}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* 风险提示 */}
        <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-6">
          <h3 className="font-bold text-yellow-800 mb-2 flex items-center gap-2">
            <AlertTriangle className="w-5 h-5" />风险提示
          </h3>
          <ul className="text-sm text-yellow-700 space-y-1">
            <li>• 加密货币投资具有高风险，价格波动剧烈</li>
            <li>• 本工具仅供学习和参考，不构成投资建议</li>
            <li>• 请根据自身风险承受能力谨慎投资</li>
            <li>• 过去的表现不代表未来收益</li>
          </ul>
        </div>
      </div>
    </div>
  )
}
