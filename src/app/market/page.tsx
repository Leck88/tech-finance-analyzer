'use client'

import { useState, useEffect } from 'react'
import { 
  TrendingUp, TrendingDown, Minus, Loader2, RefreshCw, BarChart3, 
  Activity, Zap, ArrowUpDown, Eye, Search, ChevronDown, ChevronUp,
  AlertTriangle, CheckCircle, XCircle, Clock
} from 'lucide-react'

interface MarketMover {
  symbol: string
  price: string
  priceChangePercent: string
  volume: string
  quoteVolume: string
  highPrice: string
  lowPrice: string
}

interface TechnicalIndicators {
  rsi: number
  macd: { macd: number; signal: number; histogram: number }
  sma20: number
  sma50: number
  ema12: number
  ema26: number
  bollingerBands: { upper: number; middle: number; lower: number }
  atr: number
  volume: number
  obv: number
}

interface MarketOverview {
  totalVolume24h: number
  btcDominance: number
  top10: MarketMover[]
  gainers: MarketMover[]
  losers: MarketMover[]
}

type TabType = 'overview' | 'gainers' | 'losers' | 'volume' | 'technical'

function TrendIcon({ type }: { type: 'up' | 'down' | 'neutral' }) {
  if (type === 'up') return <TrendingUp className="w-4 h-4" />
  if (type === 'down') return <TrendingDown className="w-4 h-4" />
  return <Minus className="w-4 h-4" />
}

function formatNumber(num: number | string): string {
  const n = typeof num === 'string' ? parseFloat(num) : num
  if (n >= 1e9) return (n / 1e9).toFixed(2) + 'B'
  if (n >= 1e6) return (n / 1e6).toFixed(2) + 'M'
  if (n >= 1e3) return (n / 1e3).toFixed(2) + 'K'
  return n.toFixed(2)
}

function formatPrice(price: string | number): string {
  const p = typeof price === 'string' ? parseFloat(price) : price
  if (p >= 1000) return '$' + p.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
  if (p >= 1) return '$' + p.toFixed(2)
  if (p >= 0.01) return '$' + p.toFixed(4)
  return '$' + p.toFixed(6)
}

function MoverCard({ mover, rank }: { mover: MarketMover; rank: number }) {
  const change = parseFloat(mover.priceChangePercent)
  const isPositive = change >= 0

  return (
    <div className={`flex items-center justify-between p-3 rounded-lg border transition hover:shadow-md ${
      isPositive ? 'bg-green-50 border-green-200 hover:bg-green-100' : 'bg-red-50 border-red-200 hover:bg-red-100'
    }`}>
      <div className="flex items-center gap-3">
        <span className="w-8 h-8 flex items-center justify-center rounded-full bg-gray-200 text-sm font-bold text-gray-600">
          {rank}
        </span>
        <div>
          <div className="font-bold text-gray-900">{mover.symbol}</div>
          <div className="text-xs text-gray-500">Vol: {formatNumber(mover.quoteVolume)}</div>
        </div>
      </div>
      <div className="text-right">
        <div className="font-mono font-bold">{formatPrice(mover.price)}</div>
        <div className={`flex items-center gap-1 text-sm font-semibold ${isPositive ? 'text-green-600' : 'text-red-600'}`}>
          <TrendIcon type={isPositive ? 'up' : 'down'} />
          {isPositive ? '+' : ''}{change.toFixed(2)}%
        </div>
      </div>
    </div>
  )
}

function TechnicalAnalysis({ symbol }: { symbol: string }) {
  const [data, setData] = useState<TechnicalIndicators | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchTechnical = async () => {
    setLoading(true)
    setError(null)
    try {
      const response = await fetch(`/api/market?type=technical&symbol=${symbol}`)
      const result = await response.json()
      if (result.success) {
        setData(result.data)
      } else {
        setError(result.error)
      }
    } catch (err) {
      setError('加载失败')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchTechnical()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [symbol])

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="w-6 h-6 animate-spin text-blue-500" />
        <span className="ml-2">加载技术指标...</span>
      </div>
    )
  }

  if (error) {
    return (
      <div className="text-center py-8 text-red-500">
        <AlertTriangle className="w-8 h-8 mx-auto mb-2" />
        <p>{error}</p>
        <button onClick={fetchTechnical} className="mt-2 text-blue-500 hover:underline">重试</button>
      </div>
    )
  }

  if (!data) return null

  const rsiStatus = data.rsi > 70 ? '超买' : data.rsi < 30 ? '超卖' : '中性'
  const rsiColor = data.rsi > 70 ? 'text-red-500' : data.rsi < 30 ? 'text-green-500' : 'text-gray-500'
  const macdStatus = data.macd.histogram > 0 ? '看涨' : '看跌'
  const macdColor = data.macd.histogram > 0 ? 'text-green-500' : 'text-red-500'
  const bbPosition = data.bollingerBands ? 
    ((data.bollingerBands.upper - data.bollingerBands.lower) > 0 ? 
      ((data.bollingerBands.upper - data.bollingerBands.lower) / data.bollingerBands.middle * 100).toFixed(1) : '0') : '0'

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-4 rounded-xl border border-blue-200">
          <div className="text-xs text-blue-600 font-medium">RSI (14)</div>
          <div className={`text-2xl font-bold mt-1 ${rsiColor}`}>{data.rsi.toFixed(1)}</div>
          <div className={`text-xs mt-1 ${rsiColor}`}>{rsiStatus}</div>
          <div className="w-full bg-gray-200 rounded-full h-1.5 mt-2">
            <div 
              className={`h-1.5 rounded-full ${data.rsi > 70 ? 'bg-red-500' : data.rsi < 30 ? 'bg-green-500' : 'bg-blue-500'}`}
              style={{ width: `${Math.min(100, data.rsi)}%` }}
            />
          </div>
        </div>

        <div className="bg-gradient-to-br from-purple-50 to-purple-100 p-4 rounded-xl border border-purple-200">
          <div className="text-xs text-purple-600 font-medium">MACD</div>
          <div className={`text-2xl font-bold mt-1 ${macdColor}`}>{data.macd.histogram.toFixed(2)}</div>
          <div className={`text-xs mt-1 ${macdColor}`}>{macdStatus}</div>
          <div className="text-[10px] text-gray-500 mt-1">
            MACD: {data.macd.macd.toFixed(2)} | Signal: {data.macd.signal.toFixed(2)}
          </div>
        </div>

        <div className="bg-gradient-to-br from-orange-50 to-orange-100 p-4 rounded-xl border border-orange-200">
          <div className="text-xs text-orange-600 font-medium">SMA 20/50</div>
          <div className="text-lg font-bold mt-1">${formatNumber(data.sma20)}</div>
          <div className="text-xs text-gray-500 mt-1">SMA50: ${formatNumber(data.sma50)}</div>
          <div className={`text-xs mt-1 ${data.sma20 > data.sma50 ? 'text-green-500' : 'text-red-500'}`}>
            {data.sma20 > data.sma50 ? '金叉 ✅' : '死叉 ❌'}
          </div>
        </div>

        <div className="bg-gradient-to-br from-yellow-50 to-yellow-100 p-4 rounded-xl border border-yellow-200">
          <div className="text-xs text-yellow-600 font-medium">布林带宽度</div>
          <div className="text-2xl font-bold mt-1">{bbPosition}%</div>
          <div className="text-xs text-gray-500 mt-1">
            上: ${formatNumber(data.bollingerBands.upper)}
          </div>
          <div className="text-xs text-gray-500">
            下: ${formatNumber(data.bollingerBands.lower)}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
        <div className="bg-white p-3 rounded-lg border">
          <div className="text-xs text-gray-500">EMA 12</div>
          <div className="font-bold">${formatNumber(data.ema12)}</div>
        </div>
        <div className="bg-white p-3 rounded-lg border">
          <div className="text-xs text-gray-500">EMA 26</div>
          <div className="font-bold">${formatNumber(data.ema26)}</div>
        </div>
        <div className="bg-white p-3 rounded-lg border">
          <div className="text-xs text-gray-500">ATR (14)</div>
          <div className="font-bold">${formatNumber(data.atr)}</div>
        </div>
        <div className="bg-white p-3 rounded-lg border">
          <div className="text-xs text-gray-500">成交量</div>
          <div className="font-bold">{formatNumber(data.volume)}</div>
        </div>
        <div className="bg-white p-3 rounded-lg border">
          <div className="text-xs text-gray-500">OBV</div>
          <div className="font-bold">{formatNumber(data.obv)}</div>
        </div>
        <div className="bg-white p-3 rounded-lg border">
          <div className="text-xs text-gray-500">综合信号</div>
          <div className={`font-bold ${
            (data.rsi < 70 && data.macd.histogram > 0 && data.sma20 > data.sma50) ? 'text-green-500' :
            (data.rsi > 70 && data.macd.histogram < 0 && data.sma20 < data.sma50) ? 'text-red-500' : 'text-yellow-500'
          }`}>
            {(data.rsi < 70 && data.macd.histogram > 0 && data.sma20 > data.sma50) ? '🟢 看涨' :
             (data.rsi > 70 && data.macd.histogram < 0 && data.sma20 < data.sma50) ? '🔴 看跌' : '🟡 震荡'}
          </div>
        </div>
      </div>
    </div>
  )
}

function OrderBookView({ symbol }: { symbol: string }) {
  const [data, setData] = useState<{ bids: { price: string; quantity: string }[], asks: { price: string; quantity: string }[] } | null>(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    const fetchOrderBook = async () => {
      setLoading(true)
      try {
        const response = await fetch(`/api/market?type=orderbook&symbol=${symbol}&limit=10`)
        const result = await response.json()
        if (result.success) setData(result.data)
      } catch (err) {
        console.error('Failed to fetch order book:', err)
      } finally {
        setLoading(false)
      }
    }
    fetchOrderBook()
  }, [symbol])

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="w-6 h-6 animate-spin text-blue-500" />
      </div>
    )
  }

  if (!data) return null

  const maxBidQty = Math.max(...data.bids.map(b => parseFloat(b.quantity)))
  const maxAskQty = Math.max(...data.asks.map(a => parseFloat(a.quantity)))
  const maxQty = Math.max(maxBidQty, maxAskQty)

  return (
    <div className="grid grid-cols-2 gap-4">
      {/* 买单 */}
      <div>
        <h4 className="text-sm font-semibold text-green-600 mb-2">📗 买单 (Bids)</h4>
        <div className="space-y-1">
          {data.bids.map((bid, idx) => (
            <div key={idx} className="relative flex justify-between items-center text-xs py-1">
              <div 
                className="absolute inset-0 bg-green-100 opacity-30 rounded"
                style={{ width: `${(parseFloat(bid.quantity) / maxQty) * 100}%` }}
              />
              <span className="relative font-mono text-green-600">{formatPrice(bid.price)}</span>
              <span className="relative font-mono text-gray-600">{parseFloat(bid.quantity).toFixed(4)}</span>
            </div>
          ))}
        </div>
      </div>

      {/* 卖单 */}
      <div>
        <h4 className="text-sm font-semibold text-red-600 mb-2">📕 卖单 (Asks)</h4>
        <div className="space-y-1">
          {data.asks.map((ask, idx) => (
            <div key={idx} className="relative flex justify-between items-center text-xs py-1">
              <div 
                className="absolute inset-0 bg-red-100 opacity-30 rounded"
                style={{ width: `${(parseFloat(ask.quantity) / maxQty) * 100}%` }}
              />
              <span className="relative font-mono text-red-600">{formatPrice(ask.price)}</span>
              <span className="relative font-mono text-gray-600">{parseFloat(ask.quantity).toFixed(4)}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export default function MarketPage() {
  const [activeTab, setActiveTab] = useState<TabType>('overview')
  const [overview, setOverview] = useState<MarketOverview | null>(null)
  const [gainers, setGainers] = useState<MarketMover[]>([])
  const [losers, setLosers] = useState<MarketMover[]>([])
  const [volumeLeaders, setVolumeLeaders] = useState<MarketMover[]>([])
  const [loading, setLoading] = useState(true)
  const [lastUpdate, setLastUpdate] = useState<string>('')
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedSymbol, setSelectedSymbol] = useState('BTCUSDT')
  const [showOrderBook, setShowOrderBook] = useState(false)

  const fetchAllData = async () => {
    setLoading(true)
    try {
      const [overviewRes, gainersRes, losersRes, volumeRes] = await Promise.all([
        fetch('/api/market?type=overview'),
        fetch('/api/market?type=gainers&limit=20'),
        fetch('/api/market?type=losers&limit=20'),
        fetch('/api/market?type=volume&limit=20'),
      ])

      const [overviewData, gainersData, losersData, volumeData] = await Promise.all([
        overviewRes.json(),
        gainersRes.json(),
        losersRes.json(),
        volumeRes.json(),
      ])

      if (overviewData.success) setOverview(overviewData.data)
      if (gainersData.success) setGainers(gainersData.data)
      if (losersData.success) setLosers(losersData.data)
      if (volumeData.success) setVolumeLeaders(volumeData.data)

      setLastUpdate(new Date().toLocaleTimeString('zh-CN'))
    } catch (error) {
      console.error('Failed to fetch market data:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchAllData()
    const interval = setInterval(fetchAllData, 60000) // 每分钟刷新
    return () => clearInterval(interval)
  }, [])

  const tabs = [
    { key: 'overview' as TabType, label: '📊 市场总览', icon: BarChart3 },
    { key: 'gainers' as TabType, label: '🚀 涨幅榜', icon: TrendingUp },
    { key: 'losers' as TabType, label: '📉 跌幅榜', icon: TrendingDown },
    { key: 'volume' as TabType, label: '💪 成交量榜', icon: Activity },
    { key: 'technical' as TabType, label: '🔬 技术分析', icon: Zap },
  ]

  const filterMovers = (movers: MarketMover[]) => {
    if (!searchTerm) return movers
    return movers.filter(m => m.symbol.toLowerCase().includes(searchTerm.toLowerCase()))
  }

  return (
    <div className="py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* 页面标题 */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">📈 加密货币市场分析</h1>
            <p className="text-gray-500 mt-1">实时数据 · 技术指标 · 市场排行</p>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-xs text-gray-400 flex items-center gap-1">
              <Clock className="w-3 h-3" />
              {lastUpdate ? `更新于 ${lastUpdate}` : '加载中...'}
            </span>
            <button
              onClick={fetchAllData}
              disabled={loading}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition disabled:opacity-50"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
              刷新
            </button>
          </div>
        </div>

        {/* 快速概览卡片 */}
        {overview && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            <div className="bg-gradient-to-br from-blue-500 to-blue-600 text-white rounded-xl p-4">
              <div className="text-sm opacity-80">24H 总成交量</div>
              <div className="text-2xl font-bold mt-1">${formatNumber(overview.totalVolume24h)}</div>
            </div>
            <div className="bg-gradient-to-br from-orange-500 to-orange-600 text-white rounded-xl p-4">
              <div className="text-sm opacity-80">BTC 成交占比</div>
              <div className="text-2xl font-bold mt-1">{overview.btcDominance.toFixed(1)}%</div>
            </div>
            <div className="bg-gradient-to-br from-green-500 to-green-600 text-white rounded-xl p-4">
              <div className="text-sm opacity-80">涨幅榜数量</div>
              <div className="text-2xl font-bold mt-1">{gainers.length}</div>
            </div>
            <div className="bg-gradient-to-br from-red-500 to-red-600 text-white rounded-xl p-4">
              <div className="text-sm opacity-80">跌幅榜数量</div>
              <div className="text-2xl font-bold mt-1">{losers.length}</div>
            </div>
          </div>
        )}

        {/* 标签页导航 */}
        <div className="flex flex-wrap gap-2 mb-6 border-b pb-4">
          {tabs.map(tab => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition ${
                activeTab === tab.key
                  ? 'bg-blue-600 text-white shadow-lg'
                  : 'bg-white text-gray-600 hover:bg-gray-100 border'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* 搜索栏 */}
        {(activeTab === 'gainers' || activeTab === 'losers' || activeTab === 'volume') && (
          <div className="mb-6">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="搜索币种..."
                className="w-full pl-10 pr-4 py-3 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>
        )}

        {/* 内容区域 */}
        {loading && !overview ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
            <span className="ml-3 text-lg">加载市场数据...</span>
          </div>
        ) : (
          <div>
            {/* 市场总览 */}
            {activeTab === 'overview' && overview && (
              <div className="space-y-8">
                {/* Top 10 */}
                <div>
                  <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                    <BarChart3 className="w-5 h-5 text-blue-500" />
                    成交量 Top 10
                  </h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {overview.top10.map((mover, idx) => (
                      <MoverCard key={mover.symbol} mover={mover} rank={idx + 1} />
                    ))}
                  </div>
                </div>

                {/* 涨幅前三 */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  <div>
                    <h2 className="text-xl font-bold mb-4 flex items-center gap-2 text-green-600">
                      <TrendingUp className="w-5 h-5" />
                      涨幅 Top 5
                    </h2>
                    <div className="space-y-3">
                      {overview.gainers.slice(0, 5).map((mover, idx) => (
                        <MoverCard key={mover.symbol} mover={mover} rank={idx + 1} />
                      ))}
                    </div>
                  </div>

                  <div>
                    <h2 className="text-xl font-bold mb-4 flex items-center gap-2 text-red-600">
                      <TrendingDown className="w-5 h-5" />
                      跌幅 Top 5
                    </h2>
                    <div className="space-y-3">
                      {overview.losers.slice(0, 5).map((mover, idx) => (
                        <MoverCard key={mover.symbol} mover={mover} rank={idx + 1} />
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* 涨幅榜 */}
            {activeTab === 'gainers' && (
              <div>
                <h2 className="text-xl font-bold mb-4 flex items-center gap-2 text-green-600">
                  <TrendingUp className="w-5 h-5" />
                  24H 涨幅排行
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {filterMovers(gainers).map((mover, idx) => (
                    <MoverCard key={mover.symbol} mover={mover} rank={idx + 1} />
                  ))}
                </div>
              </div>
            )}

            {/* 跌幅榜 */}
            {activeTab === 'losers' && (
              <div>
                <h2 className="text-xl font-bold mb-4 flex items-center gap-2 text-red-600">
                  <TrendingDown className="w-5 h-5" />
                  24H 跌幅排行
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {filterMovers(losers).map((mover, idx) => (
                    <MoverCard key={mover.symbol} mover={mover} rank={idx + 1} />
                  ))}
                </div>
              </div>
            )}

            {/* 成交量榜 */}
            {activeTab === 'volume' && (
              <div>
                <h2 className="text-xl font-bold mb-4 flex items-center gap-2 text-blue-600">
                  <Activity className="w-5 h-5" />
                  24H 成交量排行
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {filterMovers(volumeLeaders).map((mover, idx) => (
                    <MoverCard key={mover.symbol} mover={mover} rank={idx + 1} />
                  ))}
                </div>
              </div>
            )}

            {/* 技术分析 */}
            {activeTab === 'technical' && (
              <div className="space-y-6">
                <div className="flex flex-wrap gap-2">
                  {['BTCUSDT', 'ETHUSDT', 'BNBUSDT', 'SOLUSDT', 'XRPUSDT', 'ADAUSDT', 'DOGEUSDT', 'DOTUSDT', 'XAUTUSDT'].map(sym => (
                    <button
                      key={sym}
                      onClick={() => setSelectedSymbol(sym)}
                      className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
                        selectedSymbol === sym
                          ? 'bg-blue-600 text-white'
                          : 'bg-white text-gray-600 hover:bg-gray-100 border'
                      }`}
                    >
                      {sym.replace('USDT', '')}
                    </button>
                  ))}
                </div>

                <div className="bg-white rounded-xl shadow-md p-6">
                  <div className="flex justify-between items-center mb-4">
                    <h2 className="text-xl font-bold flex items-center gap-2">
                      <Zap className="w-5 h-5 text-yellow-500" />
                      {selectedSymbol.replace('USDT', '')} 技术指标分析
                    </h2>
                    <button
                      onClick={() => setShowOrderBook(!showOrderBook)}
                      className="flex items-center gap-2 px-3 py-1.5 text-sm bg-gray-100 rounded-lg hover:bg-gray-200 transition"
                    >
                      <Eye className="w-4 h-4" />
                      {showOrderBook ? '隐藏' : '查看'}订单簿
                      {showOrderBook ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                    </button>
                  </div>

                  <TechnicalAnalysis symbol={selectedSymbol} />

                  {showOrderBook && (
                    <div className="mt-6 pt-6 border-t">
                      <h3 className="text-lg font-semibold mb-4">📊 订单簿深度</h3>
                      <OrderBookView symbol={selectedSymbol} />
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}