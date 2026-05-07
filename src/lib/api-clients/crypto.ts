import axios from 'axios'
import { CryptoData, GoldData } from '@/types'

const BINANCE_API_BASE = 'https://api.binance.com/api/v3'
const GOLD_API_BASE = 'https://api.metals.live/v1/spot'

export class CryptoClient {
  private apiKey: string
  private apiSecret: string

  constructor(apiKey: string, apiSecret: string) {
    this.apiKey = apiKey
    this.apiSecret = apiSecret
  }

  async getCryptoData(symbol: 'BTC' | 'ETH'): Promise<CryptoData | null> {
    try {
      const pair = symbol === 'BTC' ? 'BTCUSDT' : 'ETHUSDT'
      const [ticker, klines] = await Promise.all([
        this.getBinanceTicker(pair),
        this.getBinanceKlines(pair),
      ])

      if (!ticker) return null

      const change24h = parseFloat(ticker.priceChange)
      const changePercent24h = parseFloat(ticker.priceChangePercent)

      return {
        symbol,
        price: parseFloat(ticker.lastPrice),
        change24h,
        changePercent24h,
        trend: changePercent24h > 0 ? 'up' : changePercent24h < 0 ? 'down' : 'stable',
        drivers: this.analyzeCryptoDrivers(symbol, changePercent24h),
        sentiment: this.analyzeSentiment(changePercent24h),
        timestamp: new Date().toISOString(),
      }
    } catch (error) {
      console.error(`Failed to fetch crypto data for ${symbol}:`, error)
      return null
    }
  }

  private async getBinanceTicker(pair: string) {
    try {
      const response = await axios.get(`${BINANCE_API_BASE}/ticker/24hr?symbol=${pair}`)
      return response.data
    } catch (error) {
      console.error(`Failed to fetch ticker for ${pair}:`, error)
      return null
    }
  }

  private async getBinanceKlines(pair: string) {
    try {
      const response = await axios.get(`${BINANCE_API_BASE}/klines`, {
        params: {
          symbol: pair,
          interval: '4h',
          limit: 6, // 最近24小时的数据
        },
      })
      return response.data
    } catch (error) {
      console.error(`Failed to fetch klines for ${pair}:`, error)
      return null
    }
  }

  private analyzeCryptoDrivers(symbol: 'BTC' | 'ETH', changePercent: number): string[] {
    const drivers: string[] = []

    // 基础驱动因素分析
    if (Math.abs(changePercent) > 5) {
      drivers.push('资金流向变化明显')
    }

    // 特定于BTC的驱动因素
    if (symbol === 'BTC') {
      if (changePercent > 0) {
        drivers.push('机构入场')
        drivers.push('美联储降息预期')
      } else {
        drivers.push('风险资产抛售')
        drivers.push('美元走强')
      }
    }

    // 特定于ETH的驱动因素
    if (symbol === 'ETH') {
      if (changePercent > 0) {
        drivers.push('DeFi活动增加')
        drivers.push('NFT市场热度')
      } else {
        drivers.push('智能合约风险')
        drivers.push('竞争公链冲击')
      }
    }

    return drivers
  }

  private analyzeSentiment(changePercent: number): 'greed' | 'fear' | 'neutral' {
    if (changePercent > 2) return 'greed'
    if (changePercent < -2) return 'fear'
    return 'neutral'
  }

  async getGoldData(): Promise<GoldData | null> {
    try {
      const response = await axios.get(`${GOLD_API_BASE}/gold`)
      const price = response.data.price

      // 获取历史数据来计算变化
      const historicalResponse = await axios.get(
        `${GOLD_API_BASE}/gold?date=${this.getYesterdayDate()}`
      )
      const previousPrice = historicalResponse.data.price

      const change = price - previousPrice
      const changePercent = (change / previousPrice) * 100

      return {
        price,
        changePercent,
        change,
        drivers: {
          dollarIndex: this.getDollarImpact(changePercent),
          interestRate: this.getInterestRateImpact(changePercent),
          geopoliticalRisk: this.getGeopoliticalImpact(changePercent),
        },
        trend: changePercent > 0.5 ? 'up' : changePercent < -0.5 ? 'down' : 'stable',
        timestamp: new Date().toISOString(),
      }
    } catch (error) {
      console.error('Failed to fetch gold data:', error)
      return null
    }
  }

  private getDollarImpact(changePercent: number): string {
    // 美元指数上升，黄金下降（负相关）
    return changePercent < 0 ? '美元走强' : '美元走弱'
  }

  private getInterestRateImpact(changePercent: number): string {
    // 利率上升，黄金下降（持有成本增加）
    return changePercent < 0 ? '利率上升压力' : '降息预期支撑'
  }

  private getGeopoliticalImpact(changePercent: number): string {
    // 风险上升，黄金上升（避险资产）
    return changePercent > 0 ? '避险需求增加' : '地缘政治风险缓解'
  }

  private getYesterdayDate(): string {
    const yesterday = new Date()
    yesterday.setDate(yesterday.getDate() - 1)
    return yesterday.toISOString().split('T')[0]
  }
}

export default CryptoClient
