import axios from 'axios'
import crypto from 'crypto'

const HTX_API_BASE = 'https://api.huobi.pro'

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
  private createSignature(method: string, host: string, path: string, params: Record<string, string>): string {
    const sortedParams = Object.keys(params)
      .sort()
      .map(key => `${key}=${encodeURIComponent(params[key])}`)
      .join('&')
    
    const message = `${method}\n${host}\n${path}\n${sortedParams}`
    
    return crypto
      .createHmac('sha256', this.apiSecret)
      .update(message)
      .digest('base64')
  }

  // 获取账户列表
  async getAccounts(): Promise<any[]> {
    try {
      const timestamp = new Date().toISOString().replace('.000Z', 'Z')
      const params: Record<string, string> = {
        AccessKeyId: this.apiKey,
        SignatureMethod: 'HmacSHA256',
        SignatureVersion: 2,
        Timestamp: timestamp,
      }

      const signature = this.createSignature('GET', 'api.huobi.pro', '/v1/account/accounts', params)
      params.Signature = signature

      const queryString = Object.keys(params)
        .sort()
        .map(key => `${key}=${encodeURIComponent(params[key])}`)
        .join('&')

      const response = await axios.get(`${HTX_API_BASE}/v1/account/accounts?${queryString}`)
      
      if (response.data.status === 'ok') {
        return response.data.data || []
      }
      return []
    } catch (error) {
      console.error('Failed to get HTX accounts:', error)
      return []
    }
  }

  // 获取账户余额
  async getAccountBalance(): Promise<AccountBalance> {
    try {
      // 先获取账户列表
      const accounts = await this.getAccounts()
      
      if (accounts.length === 0) {
        return { totalUSDValue: 0, balances: [] }
      }

      // 找到现货账户
      const spotAccount = accounts.find((a: any) => a.type === 'spot')
      const accountId = spotAccount?.id || accounts[0]?.id

      if (!accountId) {
        return { totalUSDValue: 0, balances: [] }
      }

      // 获取余额详情
      const timestamp = new Date().toISOString().replace('.000Z', 'Z')
      const params: Record<string, string> = {
        AccessKeyId: this.apiKey,
        SignatureMethod: 'HmacSHA256',
        SignatureVersion: 2,
        Timestamp: timestamp,
      }

      const signature = this.createSignature('GET', 'api.huobi.pro', `/v1/account/accounts/${accountId}/balance`, params)
      params.Signature = signature

      const queryString = Object.keys(params)
        .sort()
        .map(key => `${key}=${encodeURIComponent(params[key])}`)
        .join('&')

      const response = await axios.get(`${HTX_API_BASE}/v1/account/accounts/${accountId}/balance?${queryString}`)

      if (response.data.status === 'ok' && response.data.data?.list) {
        const list = response.data.data.list
        
        // 获取价格用于计算 USD 价值
        const prices = await this.getPrices()
        
        // 过滤并处理余额
        const balanceMap = new Map<string, { free: number; locked: number }>()
        
        for (const item of list) {
          if (parseFloat(item.balance) > 0) {
            const existing = balanceMap.get(item.currency) || { free: 0, locked: 0 }
            if (item.type === 'trade') {
              existing.free += parseFloat(item.balance)
            } else if (item.type === 'frozen') {
              existing.locked += parseFloat(item.balance)
            }
            balanceMap.set(item.currency, existing)
          }
        }

        const balances: AccountBalance['balances'] = []
        let totalUSDValue = 0

        balanceMap.forEach((value, currency) => {
          const total = value.free + value.locked
          let usdValue = 0
          
          // USDT, USDC, BUSD 直接等于 USD
          if (['usdt', 'usd', 'usdc', 'busd', 'husd'].includes(currency.toLowerCase())) {
            usdValue = total
          } else {
            // 其他资产需要乘以价格
            const priceKey = `${currency}usdt`
            const price = parseFloat(prices[priceKey] || '0')
            usdValue = total * price
          }

          balances.push({
            asset: currency.toUpperCase(),
            free: value.free.toString(),
            locked: value.locked.toString(),
            usdValue
          })
          totalUSDValue += usdValue
        })

        return { totalUSDValue, balances }
      }

      return { totalUSDValue: 0, balances: [] }
    } catch (error) {
      console.error('Failed to fetch HTX account balance:', error)
      return { totalUSDValue: 0, balances: [] }
    }
  }

  // 获取多个交易对的价格
  async getPrices(): Promise<Record<string, string>> {
    try {
      const response = await axios.get(`${HTX_API_BASE}/market/tickers`)
      const prices: Record<string, string> = {}
      
      if (response.data.status === 'ok' && response.data.data) {
        for (const item of response.data.data) {
          prices[item.symbol] = item.close.toString()
        }
      }
      
      return prices
    } catch (error) {
      console.error('Failed to fetch HTX prices:', error)
      return {}
    }
  }
}

export default HTXClient