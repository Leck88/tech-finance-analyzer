import { NextRequest, NextResponse } from 'next/server'
import CryptoClient from '@/lib/api-clients/crypto'
import { ApiResponse } from '@/types'

export async function GET(request: NextRequest) {
  try {
    const type = request.nextUrl.searchParams.get('type')
    
    const client = new CryptoClient(
      process.env.BINANCE_API_KEY || '',
      process.env.BINANCE_API_SECRET || ''
    )

    // 如果请求黄金数据
    if (type === 'gold') {
      const data = await client.getGoldData()
      return NextResponse.json({
        success: true,
        data: data || { price: 0, changePercent: 0 },
        timestamp: new Date().toISOString(),
      } as ApiResponse<any>)
    }

    // 默认返回 BTC、ETH 和 XAU 数据
    const [btc, eth, xau] = await Promise.all([
      client.getCryptoData('BTC'),
      client.getCryptoData('ETH'),
      client.getGoldData(),
    ])

    return NextResponse.json({
      success: true,
      data: {
        btc: btc || { price: 0, changePercent: 0, symbol: 'BTC' },
        eth: eth || { price: 0, changePercent: 0, symbol: 'ETH' },
        xau: xau ? { ...xau, symbol: 'XAU' } : null,
      },
      timestamp: new Date().toISOString(),
    } as ApiResponse<any>)
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : '未知错误',
        timestamp: new Date().toISOString(),
      } as ApiResponse<null>,
      { status: 500 }
    )
  }
}