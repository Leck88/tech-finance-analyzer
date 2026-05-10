import axios from 'axios'
import crypto from 'crypto'

const HTX_API_BASE = 'https://api.huobi.pro'

export interface BalanceData {
  id: number
  type: string
  state: string
  assets: Array<{
    currency: string
    type: number
    balance: string
  }>
}

export interface AccountBalance {
  totalUSDValue: number
  balances: Array<{
    asset: string
    free: string
    locked: string
    usdValue: number
  }>
}

export class HTXClient {
  private apiKey: string
  private apiSecret: string

  constructor(apiKey: string, apiSecret: string) {
    this.apiKey = apiKey
    this.apiSecret = apiSecret
  }

  // 生成签名
  private sign(params: Record<string, string | number>): string {
    const sortedParams = Object.keys(params)
      .sort()
      .map(key => `${key}=${params[key]}`)
      .join('&')
    
    return crypto
      .createHmac('sha256', this.apiSecret)
      .update(sortedParams)
      .digest('hex')
  }

  // 获取账户余额
  async getAccountBalance(): Promise<AccountBalance> {
    try {
      const timestamp = new Date().toISOString()
      const params: Record<string, string | number> = {
        AccessKeyId: this.apiKey,
        SignatureMethod: 'HmacSHA256',
        SignatureVersion: 2,
        Timestamp: timestamp,
      }

      const signature = this.sign({
        ...params,
        SignatureVersion: 2,
        Timestamp: timestamp.replace('T', '%20').replace('Z', ''),
      })

      const response = await axios.get(`${HTX_API_BASE}/v1/account/accounts`, {
        headers: {
          'AccessKey': this.apiKey,
          'Timestamp': timestamp.replace('T', '%20').replace('Z', ''),
          'Signature': signature,
        }
      })

      if (response.data.status === 'ok' && response.data.data) {
        const accounts = response.data.data
        
        // 获取主账户（现货账户，account-id 为 1 或类似）
        const mainAccount = accounts.find((a: any) => a.type === 'spot') || accounts[0]
        
        if (mainAccount) {
          // 获取该账户的余额详情
          const balanceResponse = await axios.get(
            `${HTX_API_BASE}/v1/account/accounts/${mainAccount.id}/balance`,
            {
              headers: {
                'AccessKey': this.apiKey,
                'Timestamp': timestamp.replace('T', '%20').replace('Z', ''),
                'Signature': signature,
              }
            }
          )

          if (balanceResponse.data.status === 'ok') {
            const list = balanceResponse.data.data.list
            
            // 获取 USDT 价格用于计算价值
            const prices = await this.getPrices()
            
            // 过滤有余额的资产
            const balances = list
              .filter((b: any) => parseFloat(b.balance) > 0)
              .map((b: any) => {
                let usdValue = 0
                if (b.currency === 'usdt' || b.currency === 'usd' || b.currency === 'husd') {
                  usdValue = parseFloat(b.balance)
                } else {
                  const priceKey = `${b.currency}usdt`
                  const price = parseFloat(prices[priceKey] || '0')
                  usdValue = parseFloat(b.balance) * price
                }
                
                return {
                  asset: b.currency.toUpperCase(),
                  free: b.type === 'trade' ? b.balance : '0',
                  locked: b.type === 'frozen' ? b.balance : '0',
                  usdValue
                }
              })

            // 合并同一资产的余额
            const mergedBalances: AccountBalance['balances'] = []
            const assetMap = new Map<string, AccountBalance['balances'][0]>()
            
            for (const b of balances) {
              if (assetMap.has(b.asset)) {
                const existing = assetMap.get(b.asset)!
                existing.free = (parseFloat(existing.free) + parseFloat(b.free)).toString()
                existing.locked = (parseFloat(existing.locked) + parseFloat(b.locked)).toString()
                existing.usdValue += b.usdValue
              } else {
                assetMap.set(b.asset, { ...b })
              }
            }
            
            assetMap.forEach(v => mergedBalances.push(v))
            
            const totalUSDValue = mergedBalances.reduce((sum, b) => sum + b.usdValue, 0)

            return {
              totalUSDValue,
              balances: mergedBalances
            }
          }
        }
      }

      return {
        totalUSDValue: 0,
        balances: []
      }
    } catch (error) {
      console.error('Failed to fetch HTX account balance:', error)
      return {
        totalUSDValue: 0,
        balances: []
      }
    }
  }

  // 获取多个交易对的价格
  async getPrices(): Promise<Record<string, string>> {
    try {
      const response = await axios.get(`${HTX_API_BASE}/market/tickers`)
      const prices: Record<string, string> = {}
      
      if (response.data.status === 'ok' && response.data.data) {
        response.data.data.forEach((item: any) => {
          const symbol = item.symbol
          prices[symbol] = item.close.toString()
        })
      }
      
      return prices
    } catch (error) {
      console.error('Failed to fetch HTX prices:', error)
      return {}
    }
  }

  // 获取单个交易对行情
  async getTicker(symbol: string): Promise<{ price: number; changePercent: number } | null> {
    try {
      const response = await axios.get(`${HTX_API_BASE}/market/detail/merged`, {
        params: { symbol }
      })

      if (response.data.status === 'ok' && response.data.tick) {
        const close = response.data.tick.close
        const open = response.data.tick.open
        const changePercent = open > 0 ? ((close - open) / open) * 100 : 0

        return {
          price: close,
          changePercent
        }
      }

      return null
    } catch (error) {
      console.error(`Failed to fetch HTX ticker for ${symbol}:`, error)
      return null
    }
  }
}

export default HTXClient