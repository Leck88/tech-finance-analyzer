import axios from 'axios'
import { CryptoData, GoldData } from '@/types'

const BINANCE_API_BASE = 'https://api.binance.com/api/v3'

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
        this.getBinanceKlines(pair, '1d', 7),
      ])

      const price = parseFloat(ticker.lastPrice)
      const changePercent24h = parseFloat(ticker.priceChangePercent)
      const prevPrice = parseFloat(klines[klines.length - 2]?.[4] || ticker.lastPrice)
      const change24h = price - prevPrice

      return {
        symbol,
        price,
        change24h,
        changePercent24h,
        trend: changePercent24h > 0 ? 'up' : changePercent24h < 0 ? 'down' : 'stable',
        drivers: this.analyzeCryptoDrivers(symbol, changePercent24h),
        sentiment: this.analyzeSentiment(changePercent24h),
        timestamp: new Date().toISOString(),
      }
    } catch (error) {
      console.error('Failed to fetch crypto data:', error)
      return null
    }
  }

  private async getBinanceTicker(symbol: string) {
    const response = await axios.get(BINANCE_API_BASE + '/ticker/24hr?symbol=' + symbol)
    return response.data
  }

  private async getBinanceKlines(symbol: string, interval: string, limit: number) {
    const response = await axios.get(
      BINANCE_API_BASE + '/klines?symbol=' + symbol + '&interval=' + interval + '&limit=' + limit
    )
    return response.data
  }

  private analyzeCryptoDrivers(symbol: 'BTC' | 'ETH', changePercent: number): string[] {
    const drivers: string[] = []
    if (Math.abs(changePercent) > 5) drivers.push('资金流向变化明显')
    if (symbol === 'BTC') {
      if (changePercent > 0) { drivers.push('机构入场'); drivers.push('美联储降息预期') }
      else { drivers.push('风险资产抛售'); drivers.push('美元走强') }
    }
    if (symbol === 'ETH') {
      if (changePercent > 0) { drivers.push('DeFi活动增加'); drivers.push('NFT市场热度') }
      else { drivers.push('智能合约风险'); drivers.push('竞争公链冲击') }
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
      const [ticker, klines] = await Promise.all([
        axios.get(BINANCE_API_BASE + '/ticker/24hr?symbol=XAUTUSDT'),
        axios.get(BINANCE_API_BASE + '/klines?symbol=XAUTUSDT&interval=1d&limit=2'),
      ])
      const price = parseFloat(ticker.data.lastPrice)
      const changePercent = parseFloat(ticker.data.priceChangePercent)
      const prevPrice = parseFloat(klines.data[0][4])
      const change = price - prevPrice
      return {
        price,
        changePercent,
        change,
        drivers: {
          dollarIndex: changePercent < 0 ? '美元走强' : '美元走弱',
          interestRate: changePercent < 0 ? '利率上升压力' : '降息预期支撑',
          geopoliticalRisk: changePercent > 0 ? '避险需求增加' : '地缘政治风险缓解',
        },
        trend: changePercent > 0.5 ? 'up' : changePercent < -0.5 ? 'down' : 'stable',
        timestamp: new Date().toISOString(),
      }
    } catch (error) {
      console.error('Failed to fetch gold data:', error)
      return null
    }
  }
}

export default CryptoClient
