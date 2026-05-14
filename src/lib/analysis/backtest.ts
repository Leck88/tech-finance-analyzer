import { Candlestick } from './candlestick'

export interface BacktestConfig {
  symbol: string
  interval: string
  strategy: 'ma_cross' | 'rsi' | 'bollinger' | 'macd' | 'combined'
  fastPeriod?: number
  slowPeriod?: number
  rsiPeriod?: number
  rsiOverbought?: number
  rsiOversold?: number
  bbPeriod?: number
  bbStdDev?: number
  initialCapital?: number
  commission?: number
}

export interface Trade {
  entryTime: number
  entryPrice: number
  exitTime: number
  exitPrice: number
  side: 'long' | 'short'
  pnl: number
  pnlPercent: number
  reason: string
}

export interface EquityPoint {
  time: number
  equity: number
  drawdown: number
}

export interface BacktestResult {
  config: BacktestConfig
  trades: Trade[]
  equityCurve: EquityPoint[]
  metrics: {
    totalReturn: number
    annualizedReturn: number
    maxDrawdown: number
    sharpeRatio: number
    sortinoRatio: number
    winRate: number
    profitFactor: number
    totalTrades: number
    avgTradeReturn: number
    maxConsecutiveLosses: number
    avgHoldingBars: number
  }
  monthlyReturns: Record<string, number>
}

export interface OHLCV {
  time: number
  open: number
  high: number
  low: number
  close: number
  volume: number
}

function sma(prices: number[], period: number): (number | null)[] {
  const result: (number | null)[] = []
  for (let i = 0; i < prices.length; i++) {
    if (i < period - 1) { result.push(null) }
    else { result.push(prices.slice(i - period + 1, i + 1).reduce((a, b) => a + b, 0) / period) }
  }
  return result
}

function ema(prices: number[], period: number): (number | null)[] {
  const result: (number | null)[] = []
  const k = 2 / (period + 1)
  for (let i = 0; i < prices.length; i++) {
    if (i === 0) { result.push(prices[0]) }
    else if (i < period) { result.push(prices.slice(0, i + 1).reduce((a, b) => a + b, 0) / (i + 1)) }
    else { const prev = result[i - 1] as number; result.push(prev + k * (prices[i] - prev)) }
  }
  return result
}

function computeRSI(prices: number[], period: number): (number | null)[] {
  const result: (number | null)[] = []
  if (prices.length < period + 1) return prices.map(() => null)
  let avgGain = 0, avgLoss = 0
  for (let i = 1; i <= period; i++) {
    const diff = prices[i] - prices[i - 1]
    if (diff > 0) avgGain += diff; else avgLoss += Math.abs(diff)
  }
  avgGain /= period; avgLoss /= period
  for (let i = 0; i < prices.length; i++) {
    if (i < period) { result.push(null) }
    else if (i === period) {
      const rs = avgGain / (avgLoss || 0.0001)
      result.push(100 - 100 / (1 + rs))
    } else {
      const diff = prices[i] - prices[i - 1]
      const gain = diff > 0 ? diff : 0
      const loss = diff < 0 ? Math.abs(diff) : 0
      avgGain = (avgGain * (period - 1) + gain) / period
      avgLoss = (avgLoss * (period - 1) + loss) / period
      const rs = avgGain / (avgLoss || 0.0001)
      result.push(100 - 100 / (1 + rs))
    }
  }
  return result
}

function computeBollingerBands(prices: number[], period: number, stdDev: number): { upper: (number | null)[]; middle: (number | null)[]; lower: (number | null)[] } {
  const middle = sma(prices, period)
  const upper: (number | null)[] = []
  const lower: (number | null)[] = []
  for (let i = 0; i < prices.length; i++) {
    if (i < period - 1) { upper.push(null); lower.push(null) }
    else {
      const slice = prices.slice(i - period + 1, i + 1)
      const mean = middle[i] as number
      const variance = slice.reduce((sum, p) => sum + (p - mean) ** 2, 0) / period
      const std = Math.sqrt(variance)
      upper.push(mean + stdDev * std)
      lower.push(mean - stdDev * std)
    }
  }
  return { upper, middle, lower }
}

function computeMACD(prices: number[], fast: number, slow: number, signal: number): { macd: (number | null)[]; signal: (number | null)[]; histogram: (number | null)[] } {
  const emaFast = ema(prices, fast)
  const emaSlow = ema(prices, slow)
  const macdLine: (number | null)[] = emaFast.map((f, i) => f !== null && emaSlow[i] !== null ? f - (emaSlow[i] as number) : null)
  const macdVals = macdLine.map(v => v ?? 0)
  const signalLine = ema(macdVals, signal)
  const histogram: (number | null)[] = macdLine.map((m, i) => m !== null && signalLine[i] !== null ? m - (signalLine[i] as number) : null)
  return { macd: macdLine, signal: signalLine as (number | null)[], histogram }
}

export function runBacktest(candles: OHLCV[], config: BacktestConfig): BacktestResult {
  const {
    strategy = 'ma_cross',
    fastPeriod = 10,
    slowPeriod = 30,
    rsiPeriod = 14,
    rsiOverbought = 70,
    rsiOversold = 30,
    bbPeriod = 20,
    bbStdDev = 2,
    initialCapital = 10000,
    commission = 0.001,
  } = config

  const closes = candles.map(c => c.close)
  const maFast = sma(closes, fastPeriod)
  const maSlow = sma(closes, slowPeriod)
  const rsi = computeRSI(closes, rsiPeriod)
  const bb = computeBollingerBands(closes, bbPeriod, bbStdDev)
  const macd = computeMACD(closes, 12, 26, 9)

  const trades: Trade[] = []
  let equity = initialCapital
  let position: { side: 'long' | 'short'; entryPrice: number; entryTime: number; size: number; entryIndex: number } | null = null
  const equityCurve: EquityPoint[] = []
  let peakEquity = initialCapital
  const monthlyReturns: Record<string, number> = {}
  let monthStartEquity = initialCapital
  let currentMonth = ''

  for (let i = 1; i < candles.length; i++) {
    const time = candles[i].time
    const price = closes[i]
    const monthKey = new Date(time).toISOString().slice(0, 7)
    if (!monthlyReturns[monthKey]) monthlyReturns[monthKey] = 0

    if (monthKey !== currentMonth) {
      if (currentMonth && equity > 0) {
        monthlyReturns[currentMonth] = ((equity - monthStartEquity) / monthStartEquity) * 100
      }
      currentMonth = monthKey
      monthStartEquity = equity
    }

    let signal: 'buy' | 'sell' | 'close_long' | 'close_short' | null = null
    let reason = ''

    if (strategy === 'ma_cross') {
      const prevFast = maFast[i - 1], currFast = maFast[i]
      const prevSlow = maSlow[i - 1], currSlow = maSlow[i]
      if (currFast !== null && currSlow !== null && prevFast !== null && prevSlow !== null) {
        if (prevFast <= prevSlow && currFast > currSlow) { signal = 'buy'; reason = `MA金叉(${fastPeriod}/${slowPeriod})` }
        else if (prevFast >= prevSlow && currFast < currSlow) { signal = 'sell'; reason = `MA死叉(${fastPeriod}/${slowPeriod})` }
      }
    } else if (strategy === 'rsi') {
      const prevRSI = rsi[i - 1], currRSI = rsi[i]
      if (currRSI !== null && prevRSI !== null) {
        if (prevRSI <= rsiOversold && currRSI > rsiOversold) { signal = 'buy'; reason = `RSI超卖反转(${currRSI.toFixed(1)})` }
        else if (prevRSI >= rsiOverbought && currRSI < rsiOverbought) { signal = 'sell'; reason = `RSI超买反转(${currRSI.toFixed(1)})` }
      }
    } else if (strategy === 'bollinger') {
      const prevClose = closes[i - 1], currClose = closes[i]
      const prevBBLower = bb.lower[i - 1], currBBLower = bb.lower[i]
      const prevBBUpper = bb.upper[i - 1], currBBUpper = bb.upper[i]
      if (currBBUpper && currBBLower && prevBBUpper && prevBBLower) {
        if (prevClose <= prevBBLower && currClose > currBBLower) { signal = 'buy'; reason = '布林带下轨反弹' }
        else if (prevClose >= prevBBUpper && currClose < currBBUpper) { signal = 'sell'; reason = '布林带上轨回落' }
      }
    } else if (strategy === 'macd') {
      const prevHist = macd.histogram[i - 1], currHist = macd.histogram[i]
      if (currHist !== null && prevHist !== null) {
        if (prevHist <= 0 && currHist > 0) { signal = 'buy'; reason = 'MACD金叉' }
        else if (prevHist >= 0 && currHist < 0) { signal = 'sell'; reason = 'MACD死叉' }
      }
    } else if (strategy === 'combined') {
      const prevFast = maFast[i - 1], currFast = maFast[i]
      const prevSlow = maSlow[i - 1], currSlow = maSlow[i]
      const prevRSI = rsi[i - 1], currRSI = rsi[i]
      if (currFast !== null && currSlow !== null && prevFast !== null && prevSlow !== null && currRSI !== null && prevRSI !== null) {
        const maCross = prevFast <= prevSlow && currFast > currSlow
        const rsiConfirm = currRSI > 50 && currRSI < rsiOverbought
        if (maCross && rsiConfirm) { signal = 'buy'; reason = 'MA金叉+RSI确认' }
        else {
          const maDeath = prevFast >= prevSlow && currFast < currSlow
          const rsiConfirmBear = currRSI < 50 && currRSI > rsiOversold
          if (maDeath && rsiConfirmBear) { signal = 'sell'; reason = 'MA死叉+RSI确认' }
        }
      }
    }

    // 止盈止损
    if (position) {
      const unrealized = position.side === 'long'
        ? (price - position.entryPrice) / position.entryPrice
        : (position.entryPrice - price) / position.entryPrice
      if (unrealized <= -0.02) { signal = 'close_long'; reason = '止损(-2%)' }
      else if (unrealized >= 0.05) { signal = 'close_long'; reason = '止盈(+5%)' }
      if (position.side === 'short') {
        if (unrealized <= -0.02) { signal = 'close_short'; reason = '止损(-2%)' }
        else if (unrealized >= 0.05) { signal = 'close_short'; reason = '止盈(+5%)' }
      }
    }

    // 开仓
    let side: 'long' | 'short' | null = null
    if (!position && (signal === 'buy' || signal === 'sell')) {
      side = signal === 'buy' ? 'long' : 'short'
    }

    if (!position && side) {
      const cost = equity * commission
      const size = (equity - cost) / price
      position = { side, entryPrice: price, entryTime: time, size, entryIndex: i }
    } else if (position && (signal === 'close_long' || signal === 'close_short' || signal === 'sell' || signal === 'buy')) {
      const pnl = position.side === 'long'
        ? position.size * (price - position.entryPrice)
        : position.size * (position.entryPrice - price)
      const pnlPercent = (pnl / equity) * 100
      const exitCost = equity * commission
      trades.push({
        entryTime: position.entryTime, entryPrice: position.entryPrice,
        exitTime: time, exitPrice: price, side: position.side,
        pnl: pnl - exitCost, pnlPercent, reason,
      })
      equity += pnl - exitCost
      position = null
    }

    const currentValue = position
      ? (position.side === 'long' ? equity + position.size * (price - position.entryPrice) : equity + position.size * (position.entryPrice - price))
      : equity
    if (currentValue > peakEquity) peakEquity = currentValue
    const drawdown = ((peakEquity - currentValue) / peakEquity) * 100
    equityCurve.push({ time, equity: currentValue, drawdown })
  }

  // 平仓
  if (position && candles.length > 0) {
    const lastPrice = closes[candles.length - 1]
    const pnl = position.side === 'long'
      ? position.size * (lastPrice - position.entryPrice)
      : position.size * (position.entryPrice - lastPrice)
    const exitCost = equity * commission
    trades.push({
      entryTime: position.entryTime, entryPrice: position.entryPrice,
      exitTime: candles[candles.length - 1].time, exitPrice: lastPrice, side: position.side,
      pnl: pnl - exitCost, pnlPercent: (pnl / equity) * 100, reason: '回测结束平仓',
    })
    equity += pnl - exitCost
  }

  const totalReturn = ((equity - initialCapital) / initialCapital) * 100
  const winningTrades = trades.filter(t => t.pnl > 0)
  const losingTrades = trades.filter(t => t.pnl <= 0)
  const winRate = trades.length > 0 ? (winningTrades.length / trades.length) * 100 : 0
  const avgWin = winningTrades.length > 0 ? winningTrades.reduce((s, t) => s + t.pnlPercent, 0) / winningTrades.length : 0
  const avgLoss = losingTrades.length > 0 ? Math.abs(losingTrades.reduce((s, t) => s + t.pnlPercent, 0) / losingTrades.length) : 0
  const profitFactor = avgLoss > 0 ? avgWin / avgLoss : avgWin > 0 ? 999 : 0
  const maxDrawdown = equityCurve.length > 0 ? Math.max(...equityCurve.map(e => e.drawdown)) : 0

  const returns = trades.map(t => t.pnlPercent / 100)
  const avgReturn = returns.length > 0 ? returns.reduce((a, b) => a + b, 0) / returns.length : 0
  const stdReturn = returns.length > 1 ? Math.sqrt(returns.reduce((s, r) => s + (r - avgReturn) ** 2, 0) / (returns.length - 1)) : 0
  const sharpeRatio = stdReturn > 0 ? (avgReturn / stdReturn) * Math.sqrt(252) : 0
  const negativeReturns = returns.filter(r => r < 0)
  const downStd = negativeReturns.length > 1 ? Math.sqrt(negativeReturns.reduce((s, r) => s + r ** 2, 0) / (negativeReturns.length - 1)) : 0
  const sortinoRatio = downStd > 0 ? (avgReturn / downStd) * Math.sqrt(252) : 0

  let maxConsecutiveLosses = 0, currentLosses = 0
  for (const t of trades) {
    if (t.pnl < 0) { currentLosses++; maxConsecutiveLosses = Math.max(maxConsecutiveLosses, currentLosses) }
    else currentLosses = 0
  }

  const avgHoldingBars = trades.length > 0
    ? trades.reduce((s, t) => {
        const entryIdx = candles.findIndex(c => c.time === t.entryTime)
        const exitIdx = candles.findIndex(c => c.time === t.exitTime)
        return s + (exitIdx - entryIdx)
      }, 0) / trades.length : 0

  const days = candles.length > 1 ? (candles[candles.length - 1].time - candles[0].time) / (1000 * 60 * 60 * 24) : 1
  const annualizedReturn = days > 0 ? totalReturn * (365 / days) : 0

  if (currentMonth) {
    monthlyReturns[currentMonth] = ((equity - monthStartEquity) / monthStartEquity) * 100
  }

  return {
    config, trades, equityCurve,
    metrics: { totalReturn, annualizedReturn, maxDrawdown, sharpeRatio, sortinoRatio, winRate, profitFactor, totalTrades: trades.length, avgTradeReturn: trades.length > 0 ? totalReturn / trades.length : 0, maxConsecutiveLosses, avgHoldingBars },
    monthlyReturns,
  }
}
