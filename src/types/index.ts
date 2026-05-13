// GitHub 相关类型
export interface GitHubTrendingRepo {
  name: string
  url: string
  description: string | null
  language: string | null
  stars: number
  starsIncrease: number
  forks: number
  tags: string[]
}

// 股票相关类型
export interface StockData {
  symbol: string
  company: string
  lastPrice: number
  changePercent: number
  change: number
  impactedBy: string[]
  timestamp: string
}

// 加密货币相关类型
export interface CryptoData {
  symbol: 'BTC' | 'ETH'
  price: number
  change24h: number
  changePercent24h: number
  trend: 'up' | 'down' | 'stable'
  drivers: string[]
  sentiment: 'greed' | 'fear' | 'neutral'
  timestamp: string
}

// 经济数据事件
export interface EconEvent {
  name: string
  nameEn: string
  nextDate: string
  countdown: string
  impact: '利多' | '利空' | '中性'
  note: string
}

// 黄金价格相关类型
export interface GoldData {
  price: number
  changePercent: number
  change: number
  drivers: {
    dollarIndex: string
    interestRate: string
    geopoliticalRisk: string
  }
  trend: 'up' | 'down' | 'stable'
  timestamp: string
  econEvents?: EconEvent[]
}

// 分析结果类型
export interface TrendAnalysis {
  keywords: string[]
  explanation: string
  businessValue: string
}

export interface IndustryChain {
  upstream: {
    sectors: string[]
    fundFlow: string
  }
  midstream: {
    sectors: string[]
    fundFlow: string
  }
  downstream: {
    sectors: string[]
    fundFlow: string
  }
}

// 预测结果类型
export interface Prediction {
  direction: 'up' | 'down' | 'stable'
  reasons: string[]
  confidence: number
}

// 完整的日报类型
export interface DailyReport {
  date: string
  githubTrending: GitHubTrendingRepo[]
  analysis: Record<string, TrendAnalysis>
  industryChain: Record<string, IndustryChain>
  stocks: StockData[]
  predictions: Record<string, Prediction>
  verification: Record<string, boolean>
  crypto: {
    btc: CryptoData
    eth: CryptoData
  }
  gold: GoldData
  emailStatus: {
    sent: boolean
    error?: string
    retries: number
  }
}

// API 响应类型
export interface ApiResponse<T> {
  success: boolean
  data?: T
  error?: string
  timestamp: string
}
