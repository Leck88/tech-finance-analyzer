import { NextRequest, NextResponse } from 'next/server'
import BinanceClient from '@/lib/api-clients/binance'
import { ApiResponse } from '@/types'

export async function GET(request: NextRequest) {
  try {
    const type = request.nextUrl.searchParams.get('type') || 'overview'
    const symbol = request.nextUrl.searchParams.get('symbol') || 'BTCUSDT'
    const limit = parseInt(request.nextUrl.searchParams.get('limit') || '20')

    const client = new BinanceClient(
      process.env.BINANCE_API_KEY || '',
      process.env.BINANCE_API_SECRET || ''
    )

    switch (type) {
      case 'overview': {
        const overview = await client.getMarketOverview()
        return NextResponse.json({
          success: true,
          data: overview,
          timestamp: new Date().toISOString(),
        } as ApiResponse<any>)
      }

      case 'gainers': {
        const gainers = await client.getGainers(limit)
        return NextResponse.json({
          success: true,
          data: gainers,
          timestamp: new Date().toISOString(),
        } as ApiResponse<any>)
      }

      case 'losers': {
        const losers = await client.getLosers(limit)
        return NextResponse.json({
          success: true,
          data: losers,
          timestamp: new Date().toISOString(),
        } as ApiResponse<any>)
      }

      case 'volume': {
        const volume = await client.getVolumeLeaders(limit)
        return NextResponse.json({
          success: true,
          data: volume,
          timestamp: new Date().toISOString(),
        } as ApiResponse<any>)
      }

      case 'ticker': {
        const ticker = await client.get24hrTicker(symbol)
        return NextResponse.json({
          success: true,
          data: ticker,
          timestamp: new Date().toISOString(),
        } as ApiResponse<any>)
      }

      case 'klines': {
        const interval = request.nextUrl.searchParams.get('interval') || '1d'
        const klines = await client.getKlines(symbol, interval, limit)
        return NextResponse.json({
          success: true,
          data: klines,
          timestamp: new Date().toISOString(),
        } as ApiResponse<any>)
      }

      case 'orderbook': {
        const orderbook = await client.getOrderBook(symbol, limit)
        return NextResponse.json({
          success: true,
          data: orderbook,
          timestamp: new Date().toISOString(),
        } as ApiResponse<any>)
      }

      case 'technical': {
        const indicators = await client.getTechnicalIndicators(symbol)
        return NextResponse.json({
          success: true,
          data: indicators,
          timestamp: new Date().toISOString(),
        } as ApiResponse<any>)
      }

      case 'movers': {
        const movers = await client.getTopMovers(limit)
        return NextResponse.json({
          success: true,
          data: movers,
          timestamp: new Date().toISOString(),
        } as ApiResponse<any>)
      }

      default:
        return NextResponse.json({
          success: false,
          error: `Unknown type: ${type}`,
          timestamp: new Date().toISOString(),
        } as ApiResponse<null>, { status: 400 })
    }
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