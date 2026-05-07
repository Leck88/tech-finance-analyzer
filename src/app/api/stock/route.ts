import { NextRequest, NextResponse } from 'next/server'
import StockClient from '@/lib/api-clients/stock'
import { ApiResponse } from '@/types'

export async function GET(request: NextRequest) {
  try {
    const symbol = request.nextUrl.searchParams.get('symbol')
    if (!symbol) {
      return NextResponse.json(
        {
          success: false,
          error: '缺少symbol参数',
          timestamp: new Date().toISOString(),
        } as ApiResponse<null>,
        { status: 400 }
      )
    }

    const client = new StockClient(process.env.STOCK_API_KEY || '')
    const data = await client.getStockData(symbol)

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
