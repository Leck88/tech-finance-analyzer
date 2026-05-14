import { NextRequest, NextResponse } from 'next/server'
import { detectAllPatterns, getTrend, getRecommendation, Candlestick } from '@/lib/analysis/candlestick'

export async function GET(request: NextRequest) {
  try {
    const symbol = request.nextUrl.searchParams.get('symbol') || 'BTCUSDT'
    const interval = request.nextUrl.searchParams.get('interval') || '1h'
    const limit = parseInt(request.nextUrl.searchParams.get('limit') || '100')

    // 从 Binance 获取 K 线数据
    const url = `https://api.binance.com/api/v3/klines?symbol=${symbol}&interval=${interval}&limit=${limit}`
    const res = await fetch(url, { next: { revalidate: 60 } })
    if (!res.ok) throw new Error('Binance API failed')
    const raw = await res.json()

    const candles: Candlestick[] = raw.map((k: any) => ({
      openTime: k[0],
      open: parseFloat(k[1]),
      high: parseFloat(k[2]),
      low: parseFloat(k[3]),
      close: parseFloat(k[4]),
      volume: parseFloat(k[5]),
    }))

    const allPatterns = detectAllPatterns(candles)
    // 只返回最近检测到的形态（去重，保留最后出现的每个类型）
    const seen = new Set<string>()
    const detected = [...allPatterns].reverse().filter(p => {
      if (seen.has(p.pattern)) return false
      seen.add(p.pattern)
      return true
    }).reverse()

    const trend = getTrend(candles)
    const recommendation = getRecommendation(detected)

    // 最新价格
    const latest = candles[candles.length - 1]
    const prev = candles[candles.length - 2]

    return NextResponse.json({
      success: true,
      data: {
        symbol,
        interval,
        latest: {
          price: latest.close,
          change: ((latest.close - prev.close) / prev.close * 100).toFixed(2),
          high: latest.high,
          low: latest.low,
          volume: latest.volume,
        },
        candles: candles.slice(-20), // 返回最近20根
        detected,
        allPatterns: allPatterns.slice(-10), // 最近10个信号
        trend,
        recommendation,
        count: { total: allPatterns.length, bullish: allPatterns.filter(p => p.type === 'bullish').length, bearish: allPatterns.filter(p => p.type === 'bearish').length }
      },
      timestamp: new Date().toISOString(),
    })
  } catch (error) {
    return NextResponse.json({ success: false, error: error instanceof Error ? error.message : 'K线分析失败' }, { status: 500 })
  }
}
