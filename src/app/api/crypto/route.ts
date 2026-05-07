import { NextRequest, NextResponse } from 'next/server'
import CryptoClient from '@/lib/api-clients/crypto'
import { ApiResponse } from '@/types'

export async function GET(request: NextRequest) {
  try {
    const symbol = request.nextUrl.searchParams.get('symbol') || 'BTC'
    const client = new CryptoClient(
      process.env.BINANCE_API_KEY || '',
      process.env.BINANCE_API_SECRET || ''
    )

    if (symbol === 'GOLD') {
      const data = await client.getGoldData()
      return NextResponse.json({
        success: true,
        data,
        timestamp: new Date().toISOString(),
      } as ApiResponse<any>)
    }

    const data = await client.getCryptoData(symbol as 'BTC' | 'ETH')
    return NextResponse.json({
      success: true,
      data,
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
