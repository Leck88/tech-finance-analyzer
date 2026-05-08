import { NextRequest, NextResponse } from 'next/server'
import StockClient from '@/lib/api-clients/stock'
import { ApiResponse } from '@/types'

export async function GET(request: NextRequest) {
  try {
    const symbolParam = request.nextUrl.searchParams.get('symbol')
    
    // 如果没有提供 symbol，使用默认股票列表
    const symbols = symbolParam 
      ? symbolParam.split(',').filter(Boolean) 
      : ['NVDA', 'AMD', 'COIN', 'AAPL', 'GOOGL']
    
    if (symbols.length === 0) {
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
    
    // 获取所有股票的涨跌幅数据
    const stocks = []
    for (const symbol of symbols.slice(0, 10)) { // 限制最多10个
      try {
        const data = await client.getStockData(symbol.trim())
        if (data) {
          stocks.push(data)
        }
      } catch (error) {
        console.error(`Failed to get stock data for ${symbol}:`, error)
      }
    }

    return NextResponse.json({
      success: true,
      data: { stocks },
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