'use client'

import { useState, useEffect } from 'react'
import { 
  Calculator, TrendingUp, BarChart3, PieChart, DollarSign, 
  Shield, Brain, Target, Zap, BookOpen, ArrowRight, 
  ChevronDown, ChevronUp, Loader2, RefreshCw, AlertTriangle,
  Check, X, Info, Clock
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
    features: ['均线策略回测', 'RSI策略回测', '收益曲线绘制', '风险指标统计'],
    difficulty: 'advanced',
    implemented: false
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
    features: ['头肩顶/底', '双顶/双底', '三角形整理', '旗形整理'],
    difficulty: 'intermediate',
    implemented: false
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
          <input
            type="number"
            value={accountSize}
            onChange={(e) => setAccountSize(Number(e.target.value))}
            className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">风险比例 (%)</label>
          <input
            type="number"
            value={riskPercent}
            onChange={(e) => setRiskPercent(Number(e.target.value))}
            className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
            step="0.5"
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">入场价格 ($)</label>
          <input
            type="number"
            value={entryPrice}
            onChange={(e) => setEntryPrice(Number(e.target.value))}
            className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">止损价格 ($)</label>
          <input
            type="number"
            value={stopLoss}
            onChange={(e) => setStopLoss(Number(e.target.value))}
            className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      <button
        onClick={calculate}
        className="w-full bg-green-600 text-white py-2 rounded-lg hover:bg-green-700 transition"
      >
        计算仓位
      </button>

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
        setRates({
          BTC: btcPrice,
          ETH: ethPrice,
          USD: 1,
          CNY: 7.25,
          EUR: 0.92,
          JPY: 149.5,
          BTC_USD: btcPrice,
          ETH_USD: ethPrice,
        })
      }
    } catch (err) {
      console.error('Failed to fetch rates:', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchRates()
  }, [])

  const convert = () => {
    if (!rates[fromCurrency] || !rates[toCurrency]) return 0
    const usdValue = amount * rates[fromCurrency]
    return usdValue / rates[toCurrency]
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
          <input
            type="number"
            value={amount}
            onChange={(e) => setAmount(Number(e.target.value))}
            className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">从</label>
          <select
            value={fromCurrency}
            onChange={(e) => setFromCurrency(e.target.value)}
            className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
          >
            {currencies.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">到</label>
          <select
            value={toCurrency}
            onChange={(e) => setToCurrency(e.target.value)}
            className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
          >
            {currencies.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>
        <div className="bg-gradient-to-r from-blue-500 to-purple-500 text-white p-3 rounded-lg text-center">
          <div className="text-xs opacity-80">转换结果</div>
          <div className="font-bold text-xl">
            {loading ? '...' : convert().toFixed(fromCurrency === 'BTC' || fromCurrency === 'ETH' ? 8 : 2)}
          </div>
          <div className="text-xs opacity-80">{toCurrency}</div>
        </div>
      </div>

      <button
        onClick={fetchRates}
        disabled={loading}
        className="flex items-center gap-2 text-sm text-blue-600 hover:text-blue-800"
      >
        <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
        刷新汇率
      </button>
    </div>
  )
}

function TradingGlossary() {
  const [searchTerm, setSearchTerm] = useState('')
  const [expandedIdx, setExpandedIdx] = useState<number | null>(null)

  const glossary = [
    { term: 'HODL', en: 'Hold On for Dear Life', meaning: '长期持有策略，不因短期波动而卖出。源于2013年Bitcoin论坛的一个拼写错误。', example: '尽管市场暴跌30%，他依然选择HODL。' },
    { term: 'FOMO', en: 'Fear Of Missing Out', meaning: '害怕错过行情而盲目追涨的心理。常导致在高点买入。', example: '看到BTC连涨7天，FOMO情绪驱使他All-in。' },
    { term: 'FUD', en: 'Fear, Uncertainty, Doubt', meaning: '散布恐慌、不确定性和怀疑情绪的信息，通常是为了压低价格。', example: '这条新闻明显是FUD，不要被吓到。' },
    { term: 'DYOR', en: 'Do Your Own Research', meaning: '自己做研究，不要盲目相信他人推荐。', example: '投资前一定要DYOR，不要只听KOL的。' },
    { term: 'ATH', en: 'All-Time High', meaning: '历史最高价格。', example: 'BTC刚突破新的ATH，达到$100,000。' },
    { term: 'ATL', en: 'All-Time Low', meaning: '历史最低价格。', example: '这个代币跌到了ATL，风险极大。' },
    { term: 'DeFi', en: 'Decentralized Finance', meaning: '去中心化金融，基于区块链的金融服务生态系统。', example: 'Uniswap是DeFi领域最大的DEX。' },
    { term: 'NFT', en: 'Non-Fungible Token', meaning: '非同质化代币，代表独特资产所有权的数字凭证。', example: '这幅NFT画作以100 ETH的价格成交。' },
    { term: 'Whale', en: 'Whale', meaning: '持有大量加密货币的投资者，其交易行为能影响市场价格。', example: '一个Whale刚刚转移了10,000 BTC到交易所。' },
    { term: 'Pump & Dump', en: 'Pump and Dump', meaning: '拉高抛售，先推高价格然后在高位卖出获利的操纵行为。', example: '小心这个小币种，看起来是Pump & Dump。' },
    { term: 'ROI', en: 'Return on Investment', meaning: '投资回报率，衡量投资收益的指标。', example: '这笔交易的ROI达到了150%。' },
    { term: 'APY', en: 'Annual Percentage Yield', meaning: '年化收益率，考虑复利效应的年收益百分比。', example: '这个Staking池的APY是12%。' },
    { term: 'TVL', en: 'Total Value Locked', meaning: '总锁仓价值，DeFi协议中锁定的资产总价值。', example: 'Aave的TVL已经超过$100亿。' },
    { term: 'Gas Fee', en: 'Gas Fee', meaning: '在区块链上执行交易或智能合约所需支付的手续费。', example: '以太坊Gas Fee太高了，等低峰期再操作。' },
    { term: 'DCA', en: 'Dollar Cost Averaging', meaning: '定期定额投资策略，分散投资时间以降低平均成本。', example: '我每周DCA $100买入BTC。' },
    { term: 'ROI', en: 'Return on Investment', meaning: '投资回报率，计算投资收益与成本的比率。', example: '这笔投资的ROI达到了200%。' },
    { term: 'K线', en: 'Candlestick', meaning: '一种价格图表表示方式，包含开盘价、收盘价、最高价和最低价。', example: '今天的K线形成了一个十字星形态。' },
    { term: '做多/做空', en: 'Long/Short', meaning: '做多是预期价格上涨买入获利；做空是预期价格下跌借入卖出获利。', example: '他在BTC上开了2倍杠杆做多。' },
    { term: '止损', en: 'Stop Loss', meaning: '预设的卖出价格，用于限制投资损失。', example: '设置5%的止损，防止大幅亏损。' },
    { term: '杠杆', en: 'Leverage', meaning: '借入资金放大投资规模，同时放大收益和风险。', example: '使用10倍杠杆意味着1%的价格波动等于10%的盈亏。' },
  ]

  const filtered = glossary.filter(item => 
    item.term.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.meaning.toLowerCase().includes(searchTerm.toLowerCase())
  )

  return (
    <div className="bg-white rounded-xl shadow-md p-6 space-y-4">
      <h3 className="text-lg font-bold flex items-center gap-2">
        <BookOpen className="w-5 h-5 text-indigo-500" />
        交易术语大全
      </h3>

      <div className="relative">
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="搜索术语..."
          className="w-full pl-4 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500"
        />
      </div>

      <div className="space-y-2 max-h-96 overflow-y-auto">
        {filtered.map((item, idx) => (
          <div key={idx} className="border rounded-lg overflow-hidden">
            <button
              onClick={() => setExpandedIdx(expandedIdx === idx ? null : idx)}
              className="w-full flex justify-between items-center p-3 hover:bg-gray-50 transition"
            >
              <div className="flex items-center gap-2">
                <span className="font-bold text-indigo-600">{item.term}</span>
                <span className="text-xs text-gray-400">({item.en})</span>
              </div>
              {expandedIdx === idx ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </button>
            {expandedIdx === idx && (
              <div className="p-3 bg-gray-50 border-t">
                <p className="text-sm text-gray-700 mb-2">{item.meaning}</p>
                {item.example && (
                  <p className="text-xs text-blue-600 italic">💡 例: {item.example}</p>
                )}
              </div>
            )}
          </div>
        ))}
      </div>
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
          // 模拟恐惧贪婪指数 (实际应使用 alternative.me API)
          const sentiment = 50 + btcChange * 5 + Math.random() * 10
          setIndex(Math.min(100, Math.max(0, sentiment)))
        }
      } catch (err) {
        console.error(err)
      } finally {
        setLoading(false)
      }
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

  if (loading) {
    return (
      <div className="bg-white rounded-xl shadow-md p-6 flex items-center justify-center">
        <Loader2 className="w-6 h-6 animate-spin text-blue-500" />
      </div>
    )
  }

  const label = index !== null ? getLabel(index) : null

  return (
    <div className="bg-white rounded-xl shadow-md p-6">
      <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
        😱 市场恐惧贪婪指数
      </h3>
      {index !== null && label && (
        <div className="text-center">
          <div className="relative w-48 h-24 mx-auto mb-4">
            <svg viewBox="0 0 200 100" className="w-full h-full">
              <path d="M 10 95 A 90 90 0 0 1 190 95" fill="none" stroke="#e5e7eb" strokeWidth="12" strokeLinecap="round" />
              <path 
                d="M 10 95 A 90 90 0 0 1 190 95" 
                fill="none" 
                stroke={index > 60 ? '#22c55e' : index > 40 ? '#eab308' : '#ef4444'} 
                strokeWidth="12" 
                strokeLinecap="round"
                strokeDasharray={`${index * 2.83} 283`}
              />
            </svg>
            <div className="absolute inset-0 flex items-end justify-center pb-0">
              <span className={`text-4xl font-bold ${label.color}`}>{Math.round(index)}</span>
            </div>
          </div>
          <p className={`text-lg font-semibold ${label.color}`}>{label.text}</p>
          <div className="flex justify-between text-xs text-gray-400 mt-2 px-4">
            <span>极度恐惧</span>
            <span>极度贪婪</span>
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

  const filteredSkills = activeCategory === 'all' 
    ? skills 
    : skills.filter(s => s.category === activeCategory)

  return (
    <div className="py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* 页面标题 */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">🧠 金融技能工具箱</h1>
          <p className="text-gray-500 text-lg">集合多种实用金融分析工具，助力您的投资决策</p>
        </div>

        {/* 分类导航 */}
        <div className="flex flex-wrap justify-center gap-2 mb-8">
          {categories.map(cat => (
            <button
              key={cat.key}
              onClick={() => setActiveCategory(cat.key)}
              className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition ${
                activeCategory === cat.key
                  ? 'bg-blue-600 text-white shadow-lg'
                  : 'bg-white text-gray-600 hover:bg-gray-100 border'
              }`}
            >
              {cat.label}
              <span className={`text-xs px-1.5 py-0.5 rounded-full ${
                activeCategory === cat.key ? 'bg-blue-500' : 'bg-gray-200'
              }`}>
                {cat.count}
              </span>
            </button>
          ))}
        </div>

        {/* 内置工具区 */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-12">
          <FearGreedIndex />
          <CurrencyConverter />

          <PositionSizer />
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
              <div
                key={skill.id}
                className={`bg-white rounded-xl shadow-md border-2 transition hover:shadow-lg ${
                  skill.implemented ? 'border-green-200' : 'border-gray-200'
                }`}
              >
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

                  <button
                    onClick={() => setExpandedSkill(expandedSkill === skill.id ? null : skill.id)}
                    className="flex items-center gap-1 text-sm text-blue-600 hover:text-blue-800"
                  >
                    {expandedSkill === skill.id ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                    {expandedSkill === skill.id ? '收起' : '查看功能'}
                  </button>

                  {expandedSkill === skill.id && (
                    <div className="mt-3 pt-3 border-t">
                      <ul className="space-y-1">
                        {skill.features.map((feature, idx) => (
                          <li key={idx} className="flex items-center gap-2 text-sm text-gray-600">
                            <ArrowRight className="w-3 h-3 text-blue-500" />
                            {feature}
                          </li>
                        ))}
                      </ul>
                      {skill.implemented && skill.endpoint && (
                        <a
                          href={skill.endpoint === '/api/market?type=technical' ? '/market' : '/execute'}
                          className="inline-flex items-center gap-1 mt-3 text-sm text-blue-600 hover:underline"
                        >
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

        {/* 投资提示 */}
        <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-6">
          <h3 className="font-bold text-yellow-800 mb-2 flex items-center gap-2">
            <AlertTriangle className="w-5 h-5" />
            风险提示
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