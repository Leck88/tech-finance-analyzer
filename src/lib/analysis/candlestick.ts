export interface Candlestick {
  openTime: number
  open: number
  high: number
  low: number
  close: number
  volume: number
}

export interface PatternResult {
  pattern: string
  type: 'bullish' | 'bearish' | 'neutral'
  confidence: number
  description: string
  signal: 'strong_buy' | 'buy' | 'neutral' | 'sell' | 'strong_sell'
  candles: number[]
}

function isBullish(c: Candlestick): boolean { return c.close > c.open }
function isBearish(c: Candlestick): boolean { return c.close < c.open }
function bodySize(c: Candlestick): number { return Math.abs(c.close - c.open) }
function upperShadow(c: Candlestick): number { return c.high - Math.max(c.open, c.close) }
function lowerShadow(c: Candlestick): number { return Math.min(c.open, c.close) - c.low }
function range(c: Candlestick): number { return c.high - c.low }

function isDoji(c: Candlestick, threshold = 0.1): boolean {
  return bodySize(c) <= threshold * range(c)
}

function isHammer(c: Candlestick): boolean {
  if (!isBullish(c)) return false
  const body = bodySize(c)
  if (body < 0.001 * c.close) return false
  return lowerShadow(c) > 2 * body && upperShadow(c) < body * 0.5
}

function isShootingStar(c: Candlestick): boolean {
  if (!isBearish(c)) return false
  const body = bodySize(c)
  if (body < 0.001 * c.close) return false
  return upperShadow(c) > 2 * body && lowerShadow(c) < body * 0.5
}

function isInvertedHammer(c: Candlestick): boolean {
  if (!isBearish(c)) return false
  const body = bodySize(c)
  if (body < 0.001 * c.close) return false
  return upperShadow(c) > 2 * body && lowerShadow(c) < body * 0.5
}

function detectBullishEngulfing(candles: Candlestick[], i: number): boolean {
  if (i < 1) return false
  const curr = candles[i], prev = candles[i - 1]
  return isBearish(prev) && isBullish(curr) && curr.open < prev.close && curr.close > prev.open && bodySize(curr) > bodySize(prev)
}

function detectBearishEngulfing(candles: Candlestick[], i: number): boolean {
  if (i < 1) return false
  const curr = candles[i], prev = candles[i - 1]
  return isBullish(prev) && isBearish(curr) && curr.open > prev.close && curr.close < prev.open && bodySize(curr) > bodySize(prev)
}

function detectMorningStar(candles: Candlestick[], i: number): boolean {
  if (i < 2) return false
  const [c1, c2, c3] = [candles[i-2], candles[i-1], candles[i]]
  return isBearish(c1) && isDoji(c2, 0.3) && isBullish(c3) && c3.close > (c1.open + c1.close) / 2
}

function detectEveningStar(candles: Candlestick[], i: number): boolean {
  if (i < 2) return false
  const [c1, c2, c3] = [candles[i-2], candles[i-1], candles[i]]
  return isBullish(c1) && isDoji(c2, 0.3) && isBearish(c3) && c3.close < (c1.open + c1.close) / 2
}

function detectThreeWhiteSoldiers(candles: Candlestick[], i: number): boolean {
  if (i < 2) return false
  const [c1, c2, c3] = [candles[i-2], candles[i-1], candles[i]]
  return isBullish(c1) && isBullish(c2) && isBullish(c3)
    && c2.close > c1.close && c3.close > c2.close
    && c1.open < c2.open && c2.open < c3.open
}

function detectThreeBlackCrows(candles: Candlestick[], i: number): boolean {
  if (i < 2) return false
  const [c1, c2, c3] = [candles[i-2], candles[i-1], candles[i]]
  return isBearish(c1) && isBearish(c2) && isBearish(c3)
    && c2.close < c1.close && c3.close < c2.close
    && c1.open > c2.open && c2.open > c3.open
}

function findPeaks(prices: number[]): number[] {
  const peaks: number[] = []
  for (let i = 1; i < prices.length - 1; i++) {
    if (prices[i] > prices[i-1] && prices[i] > prices[i+1]) peaks.push(i)
  }
  return peaks
}

function findTroughs(prices: number[]): number[] {
  const troughs: number[] = []
  for (let i = 1; i < prices.length - 1; i++) {
    if (prices[i] < prices[i-1] && prices[i] < prices[i+1]) troughs.push(i)
  }
  return troughs
}

function linearSlope(values: number[]): number {
  const n = values.length
  const xMean = (n - 1) / 2
  const yMean = values.reduce((a, b) => a + b, 0) / n
  let num = 0, den = 0
  for (let i = 0; i < n; i++) { num += (i - xMean) * (values[i] - yMean); den += (i - xMean) ** 2 }
  return den !== 0 ? num / den : 0
}

function detectDoubleTop(candles: Candlestick[], i: number): boolean {
  if (i < 10) return false
  const prices = candles.slice(i - 10, i + 1).map(c => c.close)
  const peaks = findPeaks(prices)
  if (peaks.length < 2) return false
  const [p1, p2] = [peaks[peaks.length - 2], peaks[peaks.length - 1]]
  return Math.abs(prices[p1] - prices[p2]) / prices[p1] < 0.02
}

function detectDoubleBottom(candles: Candlestick[], i: number): boolean {
  if (i < 10) return false
  const prices = candles.slice(i - 10, i + 1).map(c => c.close)
  const troughs = findTroughs(prices)
  if (troughs.length < 2) return false
  const [t1, t2] = [troughs[troughs.length - 2], troughs[troughs.length - 1]]
  return Math.abs(prices[t1] - prices[t2]) / prices[t1] < 0.02
}

function detectTriangle(candles: Candlestick[], i: number): 'ascending' | 'descending' | 'symmetrical' | null {
  if (i < 12) return null
  const recent = candles.slice(i - 12, i + 1)
  const highs = recent.map(c => c.high)
  const lows = recent.map(c => c.low)
  const highSlope = linearSlope(highs)
  const lowSlope = linearSlope(lows)
  if (highSlope < -0.5 && lowSlope > 0.5) return 'symmetrical'
  if (lowSlope > 1 && Math.abs(highSlope) < Math.abs(lowSlope) * 0.3) return 'ascending'
  if (highSlope < -1 && Math.abs(lowSlope) < Math.abs(highSlope) * 0.3) return 'descending'
  return null
}

function detectFlag(candles: Candlestick[], i: number): 'bullish' | 'bearish' | null {
  if (i < 8) return null
  const recent = candles.slice(i - 8, i + 1)
  const firstHalf = recent.slice(0, 4)
  const secondHalf = recent.slice(4)
  const poleMove = (firstHalf[3].close - firstHalf[0].open) / firstHalf[0].open
  const consolidationRange = Math.max(...secondHalf.map(c => c.high)) - Math.min(...secondHalf.map(c => c.low))
  if (poleMove > 0.03 && consolidationRange < Math.abs(poleMove) * 0.5) return 'bullish'
  if (poleMove < -0.03 && consolidationRange < Math.abs(poleMove) * 0.5) return 'bearish'
  return null
}

export function detectAllPatterns(candles: Candlestick[]): PatternResult[] {
  const results: PatternResult[] = []
  if (candles.length < 3) return results

  for (let i = 2; i < candles.length; i++) {
    const c = candles[i]

    if (isDoji(c, 0.1)) results.push({ pattern: 'Doji', type: 'neutral', confidence: 60, description: '十字星形态，市场犹豫不决', signal: 'neutral', candles: [i] })

    if (isHammer(c)) {
      const conf = Math.min(95, 60 + lowerShadow(c) / (bodySize(c) + 0.001) * 20)
      results.push({ pattern: 'Hammer', type: 'bullish', confidence: conf, description: '锤子线，看涨反转信号', signal: 'buy', candles: [i] })
    }

    if (isShootingStar(c)) {
      const conf = Math.min(95, 60 + upperShadow(c) / (bodySize(c) + 0.001) * 20)
      results.push({ pattern: 'Shooting Star', type: 'bearish', confidence: conf, description: '流星线，看跌反转信号', signal: 'sell', candles: [i] })
    }

    if (isInvertedHammer(c)) results.push({ pattern: 'Inverted Hammer', type: 'bullish', confidence: 65, description: '倒锤线，看涨反转信号', signal: 'buy', candles: [i] })

    if (detectBullishEngulfing(candles, i)) results.push({ pattern: 'Bullish Engulfing', type: 'bullish', confidence: 75, description: '看涨吞没形态，多头反转信号', signal: 'buy', candles: [i-1, i] })

    if (detectBearishEngulfing(candles, i)) results.push({ pattern: 'Bearish Engulfing', type: 'bearish', confidence: 75, description: '看跌吞没形态，空头反转信号', signal: 'sell', candles: [i-1, i] })

    if (detectMorningStar(candles, i)) results.push({ pattern: 'Morning Star', type: 'bullish', confidence: 80, description: '晨星形态，三日看涨反转', signal: 'buy', candles: [i-2, i-1, i] })

    if (detectEveningStar(candles, i)) results.push({ pattern: 'Evening Star', type: 'bearish', confidence: 80, description: '夜星形态，三日看跌反转', signal: 'sell', candles: [i-2, i-1, i] })

    if (detectThreeWhiteSoldiers(candles, i)) results.push({ pattern: 'Three White Soldiers', type: 'bullish', confidence: 90, description: '三白兵形态，强烈看涨信号', signal: 'strong_buy', candles: [i-2, i-1, i] })

    if (detectThreeBlackCrows(candles, i)) results.push({ pattern: 'Three Black Crows', type: 'bearish', confidence: 90, description: '三黑鸦形态，强烈看跌信号', signal: 'strong_sell', candles: [i-2, i-1, i] })

    if (i >= 6) {
      if (detectDoubleTop(candles, i)) results.push({ pattern: 'Double Top', type: 'bearish', confidence: 80, description: '双顶形态，看跌反转信号', signal: 'sell', candles: [i-10, i] })
      if (detectDoubleBottom(candles, i)) results.push({ pattern: 'Double Bottom', type: 'bullish', confidence: 80, description: '双底形态，看涨反转信号', signal: 'buy', candles: [i-10, i] })
    }

    const triangle = detectTriangle(candles, i)
    if (triangle) {
      const names: Record<string, string> = { ascending: '上升三角形', descending: '下降三角形', symmetrical: '对称三角形' }
      results.push({ pattern: names[triangle], type: 'neutral', confidence: 70, description: `${names[triangle]}，等待突破方向`, signal: 'neutral', candles: [i-12, i] })
    }

    const flag = detectFlag(candles, i)
    if (flag) {
      results.push({ pattern: `${flag === 'bullish' ? 'Bullish' : 'Bearish'} Flag`, type: flag === 'bullish' ? 'bullish' : 'bearish', confidence: 75, description: `旗形整理，${flag === 'bullish' ? '上涨中继' : '下跌中继'}`, signal: flag === 'bullish' ? 'buy' : 'sell', candles: [i-8, i] })
    }
  }

  return results
}

export function getTrend(candles: Candlestick[]): 'up' | 'down' | 'sideways' {
  if (candles.length < 10) return 'sideways'
  const recent = candles.slice(-10)
  const change = (recent[recent.length-1].close - recent[0].close) / recent[0].close
  if (change > 0.02) return 'up'
  if (change < -0.02) return 'down'
  return 'sideways'
}

export function getRecommendation(detected: PatternResult[]): string {
  if (detected.length === 0) return '未检测到明显形态，建议观望'
  const bullish = detected.filter(p => p.type === 'bullish')
  const bearish = detected.filter(p => p.type === 'bearish')
  const bullishScore = bullish.reduce((s, p) => s + p.confidence, 0)
  const bearishScore = bearish.reduce((s, p) => s + p.confidence, 0)
  const ratio = bullishScore / (bearishScore || 1)
  if (ratio > 2.5) return '强烈买入信号'
  if (ratio > 1.5) return '多头信号占优，看涨为主'
  if (ratio < 0.4) return '强烈卖出信号'
  if (ratio < 0.67) return '空头信号占优，谨慎做空'
  return '多空信号均衡，建议观望'
}
