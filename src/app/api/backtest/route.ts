import { NextRequest, NextResponse } from 'next/server'
import { runBacktest, BacktestConfig, OHLCV } from '@/lib/analysis/backtest'

export async function GET(request: NextRequest) {
  try {
    const symbol = request.nextUrl.searchParams.get('symbol') || 'BTCUSDT'
    const interval = request.nextUrl.searchParams.get('interval') || '1h'
    const limit = parseInt(request.nextUrl.searchParams.get('limit') || '500')
    const strategy = request.nextUrl.searchParams.get('strategy') || 'ma_cross'
    const fastPeriod = parseInt(request.nextUrl.searchParams.get('fastPeriod') || '10')
    const slowPeriod = parseInt(request.nextUrl.searchParams.get('slowPeriod') || '30')
    const rsiPeriod = parseInt(request.nextUrl.searchParams.get('rsiPeriod') || '14')
    const rsiOverbought = parseInt(request.nextUrl.searchParams.get('rsiOverbought') || '70')
    const rsiOversold = parseInt(request.nextUrl.searchParams.get('rsiOversold') || '30')
    const bbPeriod = parseInt(request.nextUrl.searchParams.get('bbPeriod') || '20')
    const initialCapital = parseFloat(request.nextUrl.searchParams.get('capital') || '10000')

    // 从 Binance 获取 K 线数据
    const url = `https://api.binance.com/api/v3/klines?symbol=${symbol}&interval=${interval}&limit=${limit}`
    const res = await fetch(url, { next: { revalidate: 300 } })
    if (!res.ok) throw new Error('Binance API failed')
    const raw = await res.json()

    const candles: OHLCV[] = raw.map((k: any) => ({
      time: k[0],
      open: parseFloat(k[1]),
      high: parseFloat(k[2]),
      low: parseFloat(k[3]),
      close: parseFloat(k[4]),
      volume: parseFloat(k[5]),
    }))

    const config: BacktestConfig = {
      symbol,
      interval,
      strategy: strategy as BacktestConfig['strategy'],
      fastPeriod,
      slowPeriod,
      rsiPeriod,
      rsiOverbought,
      rsiOversold,
      bbPeriod,
      initialCapital,
    }

    const result = runBacktest(candles, config)

    // 只返回关键数据（减少传输量）
    const equitySummary = result.equityCurve.filter((_, i) => i % Math.max(1, Math.floor(result.equityCurve.length / 100)) === 0)

    // 月度收益排序返回
    const sortedMonthly = Object.entries(result.monthlyReturns)
      .sort(([a], [b]) => a.localeCompare(b))
      .slice(-12) // 最近12个月

    return NextResponse.json({
      success: true,
      data: {
        symbol,
        interval,
        period: { start: candles[0]?.time, end: candles[candles.length - 1]?.time, days: Math.round((candles[candles.length - 1]?.time - candles[0]?.time) / 86400000) },
        config: { strategy, fastPeriod, slowPeriod, rsiPeriod, rsiOverbought, rsiOversold, bbPeriod, initialCapital },
        metrics: result.metrics,
        equitySummary,
        monthlyReturns: Object.fromEntries(sortedMonthly),
        recentTrades: result.trades.slice(-10).map(t => ({
          ...t,
          entryTime: new Date(t.entryTime).toISOString(),
          exitTime: new Date(t.exitTime).toISOString(),
        })),
        initialPrice: candles[0]?.close,
        finalPrice: candles[candles.length - 1]?.close,
        buyAndHold: ((candles[candles.length - 1].close - candles[0].close) / candles[0].close) * 100,
      },
      timestamp: new Date().toISOString(),
    })
  } catch (error) {
    return NextResponse.json({ success: false, error: error instanceof Error ? error.message : '回测失败' }, { status: 500 })
  }
}
