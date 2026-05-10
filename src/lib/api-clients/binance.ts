import axios from 'axios'
import crypto from 'crypto'

const BINANCE_API_BASE = 'https://api.binance.com/api/v3'
const BINANCE_DATA_API = 'https://data-api.binance.vision/api/v3'

export interface TickerData {
  symbol: string
  price: string
  priceChange: string
  priceChangePercent: string
  volume: string
  quoteVolume: string
  highPrice: string
  lowPrice: string
  weightedAvgPrice: string
  count: number
}

export interface KlineData {
  openTime: number
  open: string
  high: string
  low: string
  close: string
  volume: string
  closeTime: number
  quoteVolume: string
  trades: number
}

export interface OrderBookEntry {
  price: string
  quantity: string
}

export interface MarketMover {
  symbol: string
  price: string
  priceChangePercent: string
  volume: string
  quoteVolume: string
  highPrice: string
  lowPrice: string
}

export interface TechnicalIndicators {
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

export class BinanceClient {
  private apiKey: string
  private apiSecret: string

  constructor(apiKey: string, apiSecret: string) {
    this.apiKey = apiKey
    this.apiSecret = apiSecret
  }

  // 获取24小时价格变动
  async get24hrTicker(symbol: string): Promise<TickerData | null> {
    try {
      const response = await axios.get(`${BINANCE_API_BASE}/ticker/24hr`, {
        params: { symbol }
      })
      return response.data
    } catch (error) {
      console.error(`Failed to fetch 24hr ticker for ${symbol}:`, error)
      return null
    }
  }

  // 获取多个交易对的价格
  async getPrices(): Promise<Record<string, string>> {
    try {
      const response = await axios.get(`${BINANCE_API_BASE}/ticker/price`)
      const prices: Record<string, string> = {}
      response.data.forEach((item: any) => {
        prices[item.symbol] = item.price
      })
      return prices
    } catch (error) {
      console.error('Failed to fetch prices:', error)
      return {}
    }
  }

  // 获取K线数据
  async getKlines(symbol: string, interval: string = '1d', limit: number = 100): Promise<KlineData[]> {
    try {
      const response = await axios.get(`${BINANCE_API_BASE}/klines`, {
        params: { symbol, interval, limit }
      })
      return response.data.map((k: any[]) => ({
        openTime: k[0],
        open: k[1],
        high: k[2],
        low: k[3],
        close: k[4],
        volume: k[5],
        closeTime: k[6],
        quoteVolume: k[7],
        trades: k[8],
      }))
    } catch (error) {
      console.error(`Failed to fetch klines for ${symbol}:`, error)
      return []
    }
  }

  // 获取订单簿深度
  async getOrderBook(symbol: string, limit: number = 20): Promise<{ bids: OrderBookEntry[], asks: OrderBookEntry[] } | null> {
    try {
      const response = await axios.get(`${BINANCE_API_BASE}/depth`, {
        params: { symbol, limit }
      })
      return {
        bids: response.data.bids.map((b: string[]) => ({ price: b[0], quantity: b[1] })),
        asks: response.data.asks.map((a: string[]) => ({ price: a[0], quantity: a[1] })),
      }
    } catch (error) {
      console.error(`Failed to fetch order book for ${symbol}:`, error)
      return null
    }
  }

  // 获取热门交易对（按成交量排序）
  async getTopMovers(limit: number = 20): Promise<MarketMover[]> {
    try {
      const response = await axios.get(`${BINANCE_API_BASE}/ticker/24hr`)
      const usdtPairs = response.data.filter((t: any) =>
        t.symbol.endsWith('USDT') && !t.symbol.includes('DOWN') && !t.symbol.includes('UP')
      )

      // 按价格变化百分比排序（涨跌幅）
      const sorted = usdtPairs.sort((a: any, b: any) =>
        Math.abs(parseFloat(b.priceChangePercent)) - Math.abs(parseFloat(a.priceChangePercent))
      )

      return sorted.slice(0, limit).map((t: any) => ({
        symbol: t.symbol.replace('USDT', ''),
        price: t.lastPrice,
        priceChangePercent: t.priceChangePercent,
        volume: t.volume,
        quoteVolume: t.quoteVolume,
        highPrice: t.highPrice,
        lowPrice: t.lowPrice,
      }))
    } catch (error) {
      console.error('Failed to fetch top movers:', error)
      return []
    }
  }

  // 获取成交量排行
  async getVolumeLeaders(limit: number = 20): Promise<MarketMover[]> {
    try {
      const response = await axios.get(`${BINANCE_API_BASE}/ticker/24hr`)
      const usdtPairs = response.data.filter((t: any) =>
        t.symbol.endsWith('USDT') && !t.symbol.includes('DOWN') && !t.symbol.includes('UP')
      )

      // 按USDT成交量排序
      const sorted = usdtPairs.sort((a: any, b: any) =>
        parseFloat(b.quoteVolume) - parseFloat(a.quoteVolume)
      )

      return sorted.slice(0, limit).map((t: any) => ({
        symbol: t.symbol.replace('USDT', ''),
        price: t.lastPrice,
        priceChangePercent: t.priceChangePercent,
        volume: t.volume,
        quoteVolume: t.quoteVolume,
        highPrice: t.highPrice,
        lowPrice: t.lowPrice,
      }))
    } catch (error) {
      console.error('Failed to fetch volume leaders:', error)
      return []
    }
  }

  // 获取涨幅排行
  async getGainers(limit: number = 20): Promise<MarketMover[]> {
    try {
      const response = await axios.get(`${BINANCE_API_BASE}/ticker/24hr`)
      const usdtPairs = response.data.filter((t: any) =>
        t.symbol.endsWith('USDT') &&
        !t.symbol.includes('DOWN') &&
        !t.symbol.includes('UP') &&
        parseFloat(t.priceChangePercent) > 0
      )

      const sorted = usdtPairs.sort((a: any, b: any) =>
        parseFloat(b.priceChangePercent) - parseFloat(a.priceChangePercent)
      )

      return sorted.slice(0, limit).map((t: any) => ({
        symbol: t.symbol.replace('USDT', ''),
        price: t.lastPrice,
        priceChangePercent: t.priceChangePercent,
        volume: t.volume,
        quoteVolume: t.quoteVolume,
        highPrice: t.highPrice,
        lowPrice: t.lowPrice,
      }))
    } catch (error) {
      console.error('Failed to fetch gainers:', error)
      return []
    }
  }

  // 获取跌幅排行
  async getLosers(limit: number = 20): Promise<MarketMover[]> {
    try {
      const response = await axios.get(`${BINANCE_API_BASE}/ticker/24hr`)
      const usdtPairs = response.data.filter((t: any) =>
        t.symbol.endsWith('USDT') &&
        !t.symbol.includes('DOWN') &&
        !t.symbol.includes('UP') &&
        parseFloat(t.priceChangePercent) < 0
      )

      const sorted = usdtPairs.sort((a: any, b: any) =>
        parseFloat(a.priceChangePercent) - parseFloat(b.priceChangePercent)
      )

      return sorted.slice(0, limit).map((t: any) => ({
        symbol: t.symbol.replace('USDT', ''),
        price: t.lastPrice,
        priceChangePercent: t.priceChangePercent,
        volume: t.volume,
        quoteVolume: t.quoteVolume,
        highPrice: t.highPrice,
        lowPrice: t.lowPrice,
      }))
    } catch (error) {
      console.error('Failed to fetch losers:', error)
      return []
    }
  }

  // 计算技术指标
  async getTechnicalIndicators(symbol: string): Promise<TechnicalIndicators | null> {
    try {
      const klines = await this.getKlines(symbol, '1d', 100)
      if (klines.length < 50) return null

      const closes = klines.map(k => parseFloat(k.close))
      const volumes = klines.map(k => parseFloat(k.volume))
      const highs = klines.map(k => parseFloat(k.high))
      const lows = klines.map(k => parseFloat(k.low))

      return {
        rsi: this.calculateRSI(closes),
        macd: this.calculateMACD(closes),
        sma20: this.calculateSMA(closes, 20),
        sma50: this.calculateSMA(closes, 50),
        ema12: this.calculateEMA(closes, 12),
        ema26: this.calculateEMA(closes, 26),
        bollingerBands: this.calculateBollingerBands(closes, 20),
        atr: this.calculateATR(highs, lows, closes, 14),
        volume: volumes[volumes.length - 1],
        obv: this.calculateOBV(closes, volumes),
      }
    } catch (error) {
      console.error(`Failed to calculate technical indicators for ${symbol}:`, error)
      return null
    }
  }

  // RSI 计算
  private calculateRSI(prices: number[], period: number = 14): number {
    const gains: number[] = []
    const losses: number[] = []

    for (let i = 1; i < prices.length; i++) {
      const change = prices[i] - prices[i - 1]
      gains.push(change > 0 ? change : 0)
      losses.push(change < 0 ? Math.abs(change) : 0)
    }

    let avgGain = gains.slice(0, period).reduce((a, b) => a + b, 0) / period
    let avgLoss = losses.slice(0, period).reduce((a, b) => a + b, 0) / period

    for (let i = period; i < gains.length; i++) {
      avgGain = (avgGain * (period - 1) + gains[i]) / period
      avgLoss = (avgLoss * (period - 1) + losses[i]) / period
    }

    if (avgLoss === 0) return 100
    const rs = avgGain / avgLoss
    return 100 - (100 / (1 + rs))
  }

  // MACD 计算
  private calculateMACD(prices: number[]): { macd: number; signal: number; histogram: number } {
    const ema12 = this.calculateEMA(prices, 12)
    const ema26 = this.calculateEMA(prices, 26)
    const macd = ema12 - ema26

    // 计算信号线（MACD的9日EMA）
    const macdLine: number[] = []
    for (let i = 26; i < prices.length; i++) {
      const slice = prices.slice(0, i + 1)
      const e12 = this.calculateEMA(slice, 12)
      const e26 = this.calculateEMA(slice, 26)
      macdLine.push(e12 - e26)
    }

    const signal = this.calculateEMA(macdLine, 9)
    const histogram = macd - signal

    return { macd, signal, histogram }
  }

  // SMA 计算
  private calculateSMA(prices: number[], period: number): number {
    if (prices.length < period) return 0
    const slice = prices.slice(-period)
    return slice.reduce((a, b) => a + b, 0) / period
  }

  // EMA 计算
  private calculateEMA(prices: number[], period: number): number {
    if (prices.length < period) return prices[prices.length - 1] || 0

    const multiplier = 2 / (period + 1)
    let ema = prices.slice(0, period).reduce((a, b) => a + b, 0) / period

    for (let i = period; i < prices.length; i++) {
      ema = (prices[i] - ema) * multiplier + ema
    }

    return ema
  }

  // 布林带计算
  private calculateBollingerBands(prices: number[], period: number): { upper: number; middle: number; lower: number } {
    const sma = this.calculateSMA(prices, period)
    const slice = prices.slice(-period)
    const variance = slice.reduce((sum, price) => sum + Math.pow(price - sma, 2), 0) / period
    const stdDev = Math.sqrt(variance)

    return {
      upper: sma + 2 * stdDev,
      middle: sma,
      lower: sma - 2 * stdDev,
    }
  }

  // ATR 计算
  private calculateATR(highs: number[], lows: number[], closes: number[], period: number): number {
    const trueRanges: number[] = []

    for (let i = 1; i < highs.length; i++) {
      const tr = Math.max(
        highs[i] - lows[i],
        Math.abs(highs[i] - closes[i - 1]),
        Math.abs(lows[i] - closes[i - 1])
      )
      trueRanges.push(tr)
    }

    const slice = trueRanges.slice(-period)
    return slice.reduce((a, b) => a + b, 0) / period
  }

  // OBV 计算
  private calculateOBV(closes: number[], volumes: number[]): number {
    let obv = 0

    for (let i = 1; i < closes.length; i++) {
      if (closes[i] > closes[i - 1]) {
        obv += volumes[i]
      } else if (closes[i] < closes[i - 1]) {
        obv -= volumes[i]
      }
    }

    return obv
  }

  // 查询账户余额
  async getAccountBalance(): Promise<{
    totalUSDValue: number
    balances: Array<{
      asset: string
      free: string
      locked: string
      usdValue: number
    }>
  }> {
    try {
      const timestamp = Date.now()
      const queryString = `timestamp=${timestamp}`
      const signature = crypto
        .createHmac('sha256', this.apiSecret)
        .update(queryString)
        .digest('hex')

      const response = await axios.get(`${BINANCE_API_BASE}/account`, {
        headers: {
          'X-MBX-APIKEY': this.apiKey
        },
        params: {
          timestamp,
          signature
        }
      })

      // 获取USDT价格用于计算USD价值
      const prices = await this.getPrices()
      const usdtPrice = parseFloat(prices['USDTUSDT'] || '1')

      // 过滤出有余额的资产
      const balances = response.data.balances
        .filter((b: any) => parseFloat(b.free) > 0 || parseFloat(b.locked) > 0)
        .map((b: any) => {
          let usdValue = 0
          if (b.asset === 'USDT' || b.asset === 'BUSD' || b.asset === 'USDC') {
            usdValue = parseFloat(b.free) + parseFloat(b.locked)
          } else {
            const symbol = `${b.asset}USDT`
            const price = parseFloat(prices[symbol] || '0')
            usdValue = (parseFloat(b.free) + parseFloat(b.locked)) * price
          }
          return {
            asset: b.asset,
            free: b.free,
            locked: b.locked,
            usdValue
          }
        })

      const totalUSDValue = balances.reduce((sum: number, b: any) => sum + b.usdValue, 0)

      return {
        totalUSDValue,
        balances
      }
    } catch (error) {
      console.error('Failed to fetch account balance:', error)
      return {
        totalUSDValue: 0,
        balances: []
      }
    }
  }

  // 获取市场总览数据
  async getMarketOverview(): Promise<{
    totalMarketCap: number
    totalVolume24h: number
    btcDominance: number
    top10: MarketMover[]
    gainers: MarketMover[]
    losers: MarketMover[]
  }> {
    try {
      const response = await axios.get(`${BINANCE_API_BASE}/ticker/24hr`)
      const usdtPairs = response.data.filter((t: any) =>
        t.symbol.endsWith('USDT') && !t.symbol.includes('DOWN') && !t.symbol.includes('UP')
      )

      const totalVolume = usdtPairs.reduce((sum: number, t: any) => sum + parseFloat(t.quoteVolume), 0)

      // BTC dominance approximation
      const btcTicker = response.data.find((t: any) => t.symbol === 'BTCUSDT')
      const btcVolume = btcTicker ? parseFloat(btcTicker.quoteVolume) : 0
      const btcDominance = totalVolume > 0 ? (btcVolume / totalVolume) * 100 : 0

      // Top 10 by volume
      const top10 = usdtPairs
        .sort((a: any, b: any) => parseFloat(b.quoteVolume) - parseFloat(a.quoteVolume))
        .slice(0, 10)
        .map((t: any) => ({
          symbol: t.symbol.replace('USDT', ''),
          price: t.lastPrice,
          priceChangePercent: t.priceChangePercent,
          volume: t.volume,
          quoteVolume: t.quoteVolume,
          highPrice: t.highPrice,
          lowPrice: t.lowPrice,
        }))

      // Gainers
      const gainers = usdtPairs
        .filter((t: any) => parseFloat(t.priceChangePercent) > 0)
        .sort((a: any, b: any) => parseFloat(b.priceChangePercent) - parseFloat(a.priceChangePercent))
        .slice(0, 10)
        .map((t: any) => ({
          symbol: t.symbol.replace('USDT', ''),
          price: t.lastPrice,
          priceChangePercent: t.priceChangePercent,
          volume: t.volume,
          quoteVolume: t.quoteVolume,
          highPrice: t.highPrice,
          lowPrice: t.lowPrice,
        }))

      // Losers
      const losers = usdtPairs
        .filter((t: any) => parseFloat(t.priceChangePercent) < 0)
        .sort((a: any, b: any) => parseFloat(a.priceChangePercent) - parseFloat(b.priceChangePercent))
        .slice(0, 10)
        .map((t: any) => ({
          symbol: t.symbol.replace('USDT', ''),
          price: t.lastPrice,
          priceChangePercent: t.priceChangePercent,
          volume: t.volume,
          quoteVolume: t.quoteVolume,
          highPrice: t.highPrice,
          lowPrice: t.lowPrice,
        }))

      return {
        totalMarketCap: 0, // Binance doesn't provide this directly
        totalVolume24h: totalVolume,
        btcDominance,
        top10,
        gainers,
        losers,
      }
    } catch (error) {
      console.error('Failed to fetch market overview:', error)
      return {
        totalMarketCap: 0,
        totalVolume24h: 0,
        btcDominance: 0,
        top10: [],
        gainers: [],
        losers: [],
      }
    }
  }
}

export default BinanceClient