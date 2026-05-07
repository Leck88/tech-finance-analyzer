import axios from 'axios'
import { StockData } from '@/types'

const STOCK_API_BASE = 'https://www.alphavantage.co/query'

export class StockClient {
  private apiKey: string

  constructor(apiKey: string) {
    this.apiKey = apiKey
  }

  // 映射技术到公司的关系
  private getTechToCompanyMapping(): Record<string, string[]> {
    return {
      'AI': ['NVDA', 'GOOGL', 'MSFT', 'META'],
      'Machine Learning': ['NVDA', 'GOOGL', 'MSFT', 'IBM'],
      'Deep Learning': ['NVDA', 'TSLA', 'AMD'],
      'Web3': ['MSTR', 'COIN', 'RIOT', 'MARA'],
      'Blockchain': ['IBM', 'MSTR', 'COIN'],
      'LLM': ['GOOGL', 'MSFT', 'META', 'NVDA'],
      'Cloud': ['GOOGL', 'MSFT', 'AMZN', 'ORCL'],
      'Infrastructure': ['NVDA', 'AMD', 'INTEL', 'QCOM'],
      'Framework': ['MSFT', 'GOOGL', 'META'],
    }
  }

  async getStockData(symbol: string): Promise<StockData | null> {
    try {
      const response = await axios.get(STOCK_API_BASE, {
        params: {
          function: 'GLOBAL_QUOTE',
          symbol,
          apikey: this.apiKey,
        },
      })

      const quote = response.data['Global Quote']
      if (!quote || !quote.c) {
        return null
      }

      return {
        symbol,
        company: this.getCompanyName(symbol),
        lastPrice: parseFloat(quote.c),
        changePercent: parseFloat(quote.pc),
        change: parseFloat(quote.d),
        impactedBy: [],
        timestamp: new Date().toISOString(),
      }
    } catch (error) {
      console.error(`Failed to fetch stock data for ${symbol}:`, error)
      return null
    }
  }

  async getStocksImpactedByTechs(technologies: string[]): Promise<StockData[]> {
    const mapping = this.getTechToCompanyMapping()
    const affectedCompanies = new Set<string>()

    for (const tech of technologies) {
      const companies = mapping[tech] || []
      companies.forEach((c) => affectedCompanies.add(c))
    }

    const stocks: StockData[] = []
    for (const symbol of Array.from(affectedCompanies).slice(0, 5)) {
      const stock = await this.getStockData(symbol)
      if (stock) {
        stocks.push(stock)
      }
    }

    return stocks
  }

  private getCompanyName(symbol: string): string {
    const mapping: Record<string, string> = {
      NVDA: 'NVIDIA',
      GOOGL: 'Google',
      MSFT: 'Microsoft',
      META: 'Meta',
      TSLA: 'Tesla',
      AMD: 'AMD',
      COIN: 'Coinbase',
      MSTR: 'MicroStrategy',
      AMZN: 'Amazon',
      IBM: 'IBM',
      ORCL: 'Oracle',
      QCOM: 'Qualcomm',
      INTEL: 'Intel',
      RIOT: 'Riot Platforms',
      MARA: 'Marathon Digital',
    }
    return mapping[symbol] || symbol
  }
}

export default StockClient
