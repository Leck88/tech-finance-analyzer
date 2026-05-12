'use client'

import { useState, useEffect, useCallback } from 'react'

interface Chain { chain: string; networks: string[] }
interface Connector { name: string; trading_types: string[]; chain: string; networks: string[] }
interface Quote { estimatedOutput: string; priceImpact: string; route: string[]; gasEstimate?: string }

export default function HummingbotPage() {
  const [status, setStatus] = useState<'loading' | 'online' | 'offline'>('loading')
  const [chains, setChains] = useState<Chain[]>([])
  const [connectors, setConnectors] = useState<Connector[]>([])
  const [activeTab, setActiveTab] = useState<'swap' | 'wallet' | 'chains' | 'status'>('swap')

  // Swap form
  const [chainNet, setChainNet] = useState('ethereum-mainnet')
  const [connector, setConnector] = useState('uniswap')
  const [baseToken, setBaseToken] = useState('ETH')
  const [quoteToken, setQuoteToken] = useState('USDC')
  const [amount, setAmount] = useState('0.1')
  const [side, setSide] = useState<'BUY' | 'SELL'>('BUY')
  const [quote, setQuote] = useState<Quote | null>(null)
  const [quoteError, setQuoteError] = useState('')
  const [loadingQuote, setLoadingQuote] = useState(false)

  // Wallet
  const [walletAddress, setWalletAddress] = useState('')
  const [balances, setBalances] = useState<any[]>([])
  const [loadingBalances, setLoadingBalances] = useState(false)

  const fetchGateway = useCallback(async (path: string, method = 'GET', body?: object) => {
    const res = await fetch(`/api/hummingbot${path}`, {
      method,
      headers: body ? { 'Content-Type': 'application/json' } : {},
      body: body ? JSON.stringify(body) : undefined,
    })
    return res.json()
  }, [])

  useEffect(() => {
    async function init() {
      try {
        const [chainsData, connData, gatewayStatus] = await Promise.all([
          fetchGateway('/config/chains'),
          fetchGateway('/config/connectors'),
          fetch('http://127.0.0.1:15888/').then(r => r.json()).catch(() => null),
        ])
        setChains(chainsData.chains || [])
        setConnectors(connData.connectors || [])
        setStatus(gatewayStatus?.status === 'ok' ? 'online' : 'offline')
      } catch {
        setStatus('offline')
      }
    }
    init()
  }, [fetchGateway])

  const getQuote = useCallback(async () => {
    setLoadingQuote(true)
    setQuoteError('')
    setQuote(null)
    try {
      const data = await fetchGateway(
        `/connectors/${connector}/router/quote-swap?chainNetwork=${chainNet}&baseToken=${baseToken}&quoteToken=${quoteToken}&amount=${amount}&side=${side}&slippagePct=0.5`
      )
      if (data.error) {
        setQuoteError(data.message || data.error)
      } else {
        setQuote(data)
      }
    } catch (e: any) {
      setQuoteError(e.message)
    } finally {
      setLoadingQuote(false)
    }
  }, [fetchGateway, chainNet, connector, baseToken, quoteToken, amount, side])

  const getBalances = useCallback(async () => {
    if (!walletAddress) return
    setLoadingBalances(true)
    try {
      const chain = chainNet.split('-')[0]
      const data = await fetchGateway(
        `/chains/${chain}/balances`,
        'POST',
        { address: walletAddress, tokenSymbols: [baseToken, quoteToken] }
      )
      setBalances(data.balances || [])
    } catch {
      setBalances([])
    } finally {
      setLoadingBalances(false)
    }
  }, [fetchGateway, chainNet, walletAddress, baseToken, quoteToken])

  const chainDisplayName: Record<string, string> = {
    'ethereum-mainnet': 'Ethereum',
    'ethereum-base': 'Base',
    'ethereum-arbitrum': 'Arbitrum',
    'ethereum-polygon': 'Polygon',
    'ethereum-bsc': 'BSC (BNB Chain)',
    'ethereum-avalanche': 'Avalanche',
    'solana-mainnet-beta': 'Solana',
  }

  const chainOptions = chains.flatMap((c: Chain) =>
    c.networks.map((n: string) => ({ value: `${c.chain}-${n}`, label: chainDisplayName[`${c.chain}-${n}`] || `${c.chain} (${n})` }))
  )

  const availableConnectors = connectors.filter((c: Connector) => {
    const chainKey = chainNet.split('-')[0]
    if (c.chain === chainKey) return true
    if (c.chain === 'ethereum' && chainNet.startsWith('ethereum')) return true
    return false
  })

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-700 to-indigo-700 text-white">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center text-xl">🤖</div>
              <div>
                <h1 className="text-2xl font-bold">Hummingbot Gateway</h1>
                <p className="text-blue-200 text-sm">DEX 交易网关 · v2.14.0</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <div className={`w-3 h-3 rounded-full ${status === 'online' ? 'bg-emerald-400 animate-pulse' : status === 'loading' ? 'bg-yellow-400' : 'bg-red-400'}`} />
              <span className="text-sm">{status === 'online' ? 'Gateway 在线' : status === 'loading' ? '连接中...' : 'Gateway 离线'}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="bg-white border-b sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex gap-1">
            {[
              { key: 'swap', label: '🔀 交易兑换' },
              { key: 'wallet', label: '👛 钱包余额' },
              { key: 'chains', label: '⛓️ 链&连接器' },
              { key: 'status', label: '📋 状态信息' },
            ].map(tab => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key as any)}
                className={`px-5 py-4 text-sm font-medium border-b-2 transition ${
                  activeTab === tab.key
                    ? 'border-blue-600 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* SWAP TAB */}
        {activeTab === 'swap' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
              <div className="bg-white rounded-2xl shadow-md border border-gray-100 overflow-hidden">
                <div className="p-6 border-b bg-gradient-to-r from-blue-50 to-indigo-50">
                  <h2 className="text-lg font-bold text-gray-800">代币兑换</h2>
                  <p className="text-sm text-gray-500 mt-1">实时 DEX 报价，支持 Uniswap · PancakeSwap · Jupiter · Raydium</p>
                </div>
                <div className="p-6 space-y-5">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">链网络</label>
                      <select
                        value={chainNet}
                        onChange={e => { setChainNet(e.target.value); setQuote(null) }}
                        className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                      >
                        {chainOptions.map((opt: any) => (
                          <option key={opt.value} value={opt.value}>{opt.label}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">DEX 连接器</label>
                      <select
                        value={connector}
                        onChange={e => { setConnector(e.target.value); setQuote(null) }}
                        className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                      >
                        {availableConnectors.map((c: Connector) => (
                          <option key={c.name} value={c.name}>{c.name} ({c.trading_types.join(', ')})</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {/* From */}
                  <div className="bg-gray-50 rounded-xl p-4 border border-gray-200">
                    <div className="flex justify-between mb-2">
                      <label className="text-sm text-gray-500">从</label>
                    </div>
                    <input
                      type="number"
                      value={amount}
                      onChange={e => setAmount(e.target.value)}
                      placeholder="0.0"
                      className="w-full text-2xl font-bold bg-transparent outline-none text-gray-800 placeholder-gray-300"
                    />
                    <div className="flex items-center gap-2 mt-2">
                      <input
                        type="text"
                        value={baseToken}
                        onChange={e => setBaseToken(e.target.value.toUpperCase())}
                        className="text-sm font-mono bg-white px-3 py-1 rounded-lg border border-gray-200 outline-none focus:border-blue-400 w-28"
                      />
                      <span className="text-sm text-gray-400">{baseToken}</span>
                    </div>
                  </div>

                  {/* Swap direction */}
                  <div className="flex justify-center">
                    <button
                      className="bg-white border-2 border-blue-200 rounded-full p-2 cursor-pointer hover:bg-blue-50 transition"
                      onClick={() => {
                        const t = baseToken; setBaseToken(quoteToken); setQuoteToken(t)
                        setSide(side === 'BUY' ? 'SELL' : 'BUY')
                        setQuote(null)
                      }}
                    >
                      <span className="text-xl">⇅</span>
                    </button>
                  </div>

                  {/* To */}
                  <div className="bg-blue-50 rounded-xl p-4 border border-blue-100">
                    <label className="text-sm text-blue-400 mb-2 block">获得</label>
                    <div className="flex items-center gap-2">
                      <div className="flex-1 text-2xl font-bold text-blue-700">
                        {quote ? Number(quote.estimatedOutput).toFixed(6) : '—'}
                      </div>
                      <input
                        type="text"
                        value={quoteToken}
                        onChange={e => setQuoteToken(e.target.value.toUpperCase())}
                        className="text-sm font-mono bg-white px-3 py-1 rounded-lg border border-blue-200 outline-none focus:border-blue-400 w-28"
                      />
                    </div>
                  </div>

                  {/* Side */}
                  <div className="flex gap-2">
                    {(['BUY', 'SELL'] as const).map(s => (
                      <button
                        key={s}
                        onClick={() => setSide(s)}
                        className={`flex-1 py-2 rounded-lg text-sm font-medium transition ${
                          side === s ? (s === 'BUY' ? 'bg-emerald-500 text-white' : 'bg-red-500 text-white') : 'bg-gray-100 text-gray-500'
                        }`}
                      >
                        {s === 'BUY' ? '买入 (BUY)' : '卖出 (SELL)'}
                      </button>
                    ))}
                  </div>

                  <button
                    onClick={getQuote}
                    disabled={loadingQuote || !amount || Number(amount) <= 0}
                    className="w-full py-4 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl font-bold text-lg hover:from-blue-700 hover:to-indigo-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {loadingQuote ? '⏳ 获取报价中...' : '🔍 获取报价'}
                  </button>

                  {quoteError && (
                    <div className="p-4 bg-red-50 border border-red-200 rounded-xl">
                      <p className="text-sm text-red-600">⚠️ {quoteError}</p>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Quote Details */}
            <div>
              <div className="bg-white rounded-2xl shadow-md border border-gray-100 overflow-hidden sticky top-24">
                <div className="p-4 bg-gradient-to-r from-indigo-50 to-purple-50 border-b">
                  <h3 className="font-bold text-gray-700">📋 报价详情</h3>
                </div>
                <div className="p-5 space-y-4">
                  {quote ? (
                    <>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-500">预估输出</span>
                        <span className="font-bold text-indigo-600">{Number(quote.estimatedOutput).toFixed(6)} {quoteToken}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-500">价格影响</span>
                        <span className={`text-sm font-medium ${Number(quote.priceImpact) > 1 ? 'text-red-500' : 'text-emerald-500'}`}>
                          {quote.priceImpact}%
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-500">滑点容忍</span>
                        <span className="text-sm font-medium">0.5%</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-500">Gas 估算</span>
                        <span className="text-sm font-medium">{quote.gasEstimate || '—'}</span>
                      </div>
                      <div className="pt-3 border-t">
                        <span className="text-xs text-gray-400">路由路径</span>
                        <div className="mt-2 flex flex-wrap gap-1">
                          {quote.route?.map((r, i) => (
                            <span key={i} className="inline-block bg-blue-100 text-blue-700 text-xs px-2 py-1 rounded-full">{r}</span>
                          ))}
                          {!quote.route?.length && <span className="text-xs text-gray-400">自动路由</span>}
                        </div>
                      </div>
                      <div className="pt-3 border-t">
                        <div className="text-xs text-gray-400 mb-2">兑换预览</div>
                        <div className="flex items-center gap-2 text-sm">
                          <span className="font-mono font-bold">{amount} {baseToken}</span>
                          <span className="text-gray-400">→</span>
                          <span className="font-mono font-bold text-indigo-600">{Number(quote.estimatedOutput).toFixed(4)} {quoteToken}</span>
                        </div>
                        <div className="text-xs text-gray-400 mt-1">
                          汇率: 1 {baseToken} ≈ {quote.estimatedOutput ? (Number(quote.estimatedOutput) / Number(amount)).toFixed(4) : '—'} {quoteToken}
                        </div>
                      </div>
                    </>
                  ) : (
                    <div className="text-center py-8 text-gray-400">
                      <div className="text-4xl mb-3">📊</div>
                      <p className="text-sm">点击「获取报价」查看详情</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* WALLET TAB */}
        {activeTab === 'wallet' && (
          <div className="max-w-3xl mx-auto">
            <div className="bg-white rounded-2xl shadow-md border border-gray-100 overflow-hidden">
              <div className="p-6 bg-gradient-to-r from-yellow-50 to-orange-50 border-b">
                <h2 className="text-lg font-bold text-gray-800">钱包余额查询</h2>
                <p className="text-sm text-gray-500 mt-1">查询任意地址在指定链上的代币余额</p>
              </div>
              <div className="p-6 space-y-5">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">链网络</label>
                    <select
                      value={chainNet}
                      onChange={e => setChainNet(e.target.value)}
                      className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 focus:ring-2 focus:ring-blue-500 text-sm"
                    >
                      {chainOptions.filter((o: any) => !o.value.includes('devnet')).map((opt: any) => (
                        <option key={opt.value} value={opt.value}>{opt.label}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">代币符号</label>
                    <input
                      type="text"
                      value={baseToken}
                      onChange={e => setBaseToken(e.target.value.toUpperCase())}
                      className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 focus:ring-2 focus:ring-blue-500 text-sm font-mono"
                      placeholder="ETH, USDC, USDT..."
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">钱包地址</label>
                  <input
                    type="text"
                    value={walletAddress}
                    onChange={e => setWalletAddress(e.target.value)}
                    placeholder="0x... 或 Solana 地址"
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 focus:ring-2 focus:ring-blue-500 text-sm font-mono"
                  />
                </div>
                <button
                  onClick={getBalances}
                  disabled={loadingBalances || !walletAddress}
                  className="w-full py-3 bg-gradient-to-r from-yellow-500 to-orange-500 text-white rounded-xl font-bold hover:from-yellow-600 hover:to-orange-600 transition disabled:opacity-50"
                >
                  {loadingBalances ? '⏳ 查询中...' : '🔍 查询余额'}
                </button>

                {balances.length > 0 && (
                  <div className="mt-4 space-y-2">
                    {balances.map((b: any, i: number) => (
                      <div key={i} className="flex justify-between items-center p-4 bg-gray-50 rounded-xl border">
                        <span className="font-bold text-gray-800">{b.symbol}</span>
                        <div className="text-right">
                          <div className="font-bold text-gray-800">{Number(b.amount).toFixed(6)}</div>
                          {b.usdValue && <div className="text-xs text-gray-400">≈ ${b.usdValue}</div>}
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                <div className="p-4 bg-blue-50 rounded-xl border border-blue-100">
                  <h4 className="font-bold text-blue-700 text-sm mb-2">💡 说明</h4>
                  <ul className="text-xs text-blue-600 space-y-1">
                    <li>• 支持 Ethereum, Solana, BSC, Polygon 等主流链</li>
                    <li>• 余额查询读取链上实时数据</li>
                    <li>• 执行交易需要配置钱包私钥</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* CHAINS TAB */}
        {activeTab === 'chains' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white rounded-2xl shadow-md border border-gray-100 overflow-hidden">
              <div className="p-5 bg-gradient-to-r from-purple-50 to-pink-50 border-b">
                <h3 className="font-bold text-gray-700">⛓️ 支持的链</h3>
              </div>
              <div className="p-5 space-y-3">
                {chains.map((c: Chain) => (
                  <div key={c.chain} className="p-4 bg-gray-50 rounded-xl">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="font-bold text-gray-800 capitalize">{c.chain}</span>
                      <span className="text-xs bg-purple-100 text-purple-700 px-2 py-0.5 rounded-full">{c.networks.length} 网络</span>
                    </div>
                    <div className="flex flex-wrap gap-1">
                      {c.networks.map((n: string) => (
                        <span key={n} className="text-xs bg-white border border-gray-200 px-2 py-1 rounded-lg text-gray-600">{n}</span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-white rounded-2xl shadow-md border border-gray-100 overflow-hidden">
              <div className="p-5 bg-gradient-to-r from-emerald-50 to-teal-50 border-b">
                <h3 className="font-bold text-gray-700">🔗 DEX 连接器</h3>
              </div>
              <div className="p-5 space-y-3">
                {connectors.map((c: Connector) => (
                  <div key={c.name} className="p-4 bg-gray-50 rounded-xl">
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-bold text-gray-800">{c.name}</span>
                      <span className="text-xs bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded-full capitalize">{c.chain}</span>
                    </div>
                    <div className="flex flex-wrap gap-1">
                      {c.trading_types.map((t: string) => (
                        <span key={t} className="text-xs bg-white border border-gray-200 px-2 py-1 rounded-lg text-gray-500">{t}</span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* STATUS TAB */}
        {activeTab === 'status' && (
          <div className="max-w-3xl mx-auto">
            <div className="bg-white rounded-2xl shadow-md border border-gray-100 overflow-hidden">
              <div className="p-5 bg-gradient-to-r from-gray-50 to-slate-50 border-b">
                <h3 className="font-bold text-gray-700">📋 Gateway 状态</h3>
              </div>
              <div className="p-6 space-y-4">
                <div className="flex justify-between items-center p-4 bg-emerald-50 rounded-xl">
                  <span className="text-gray-700 font-medium">Gateway 状态</span>
                  <span className={`px-3 py-1 rounded-full text-sm font-bold ${status === 'online' ? 'bg-emerald-500 text-white' : 'bg-red-500 text-white'}`}>
                    {status === 'online' ? '在线运行中' : '离线'}
                  </span>
                </div>
                {[
                  ['Gateway 版本', 'v2.14.0'],
                  ['本地端口', '15888'],
                  ['支持链数量', `${chains.length} 条链`],
                  ['DEX 连接器', `${connectors.length} 个`],
                ].map(([label, value]) => (
                  <div key={label} className="flex justify-between items-center p-4 bg-gray-50 rounded-xl">
                    <span className="text-gray-700">{label}</span>
                    <span className="font-mono text-sm font-medium">{value}</span>
                  </div>
                ))}
                <div className="p-4 bg-blue-50 rounded-xl border border-blue-100">
                  <h4 className="font-bold text-blue-700 text-sm mb-2">🔑 API 路由</h4>
                  <div className="space-y-1 text-xs font-mono text-blue-600">
                    <div>GET /config/chains — 获取支持的链</div>
                    <div>GET /config/connectors — 获取 DEX 连接器</div>
                    <div>GET /wallet/ — 列出钱包</div>
                    <div>POST /chains/:chain/balances — 查询余额</div>
                    <div>GET /connectors/:name/router/quote-swap — 兑换报价</div>
                    <div>POST /trading/swap/execute — 执行兑换</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
