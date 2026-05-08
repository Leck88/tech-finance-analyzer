export class MiniMaxClient {
  private apiKey: string
  private baseUrl = 'https://api.minimax.chat/v1'

  constructor(apiKey: string) {
    this.apiKey = apiKey
  }

  async generateExplanation(context: any): Promise<string> {
    const { name, description, tags, stars, url } = context
    
    // 构建更专业的提示词
    const systemPrompt = `你是一个专业的科技金融量化分析师，专注于分析 GitHub 热门开源项目的市场影响。请为用户提供以下维度的专业分析：

## 分析框架
1. **技术术语通俗化** - 用通俗易懂的语言解释核心技术概念
2. **产业链深度分析** - 区分上游基础设施、中游协议层、下游应用层的影响
3. **关联股票追踪** - 找出直接受益或受损的上市公司股票代码（如 NVDA、AMD、COIN 等）
4. **市场情绪与价格预测** - 基于项目热度预测对加密货币和贵金属市场的影响

## 输出格式要求
- 使用 Markdown 格式，结构清晰
- 使用 emoji 增强可读性
- 表格化展示产业链分析和股票数据
- 包含具体的数据支撑和逻辑推理
- 预测结论必须有明确的方向和置信度

请用简洁专业但易懂的语言回答。`

    const userPrompt = this.buildPrompt(name, description, tags, stars, url)

    try {
      const response = await fetch(`${this.baseUrl}/text/chatcompletion_v2`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiKey}`,
        },
        body: JSON.stringify({
          model: 'MiniMax-Text-01',
          messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: userPrompt },
          ],
          temperature: 0.7,
          max_tokens: 3000,
        }),
      })

      if (!response.ok) {
        const errorText = await response.text()
        console.error('MiniMax API error:', response.status, errorText)
        throw new Error(`MiniMax API 错误: ${response.status} - ${errorText.substring(0, 200)}`)
      }

      const result = await response.json()
      
      if (!result.choices || !result.choices[0]?.message?.content) {
        console.error('MiniMax API 返回格式错误:', result)
        throw new Error('AI 返回格式异常')
      }
      
      return result.choices[0].message.content
    } catch (error) {
      console.error('MiniMax API error:', error)
      return this.generateFallback(context)
    }
  }

  private buildPrompt(name: string, description: string, tags: string[], stars: number, url?: string): string {
    const hotnessLevel = stars > 50000 ? '爆火级' : 
                         stars > 10000 ? '极高热度' : 
                         stars > 1000 ? '高热度' : 
                         stars > 100 ? '中等热度' : '一般热度'
    
    return `## 待分析项目信息

**项目名称**: ${name || '未知'}
**项目描述**: ${description || '暂无描述'}
**技术标签**: ${tags?.length > 0 ? tags.join(', ') : '无'}
**Star 数量**: ⭐ ${(stars || 0).toLocaleString()} (${hotnessLevel})
${url ? `**项目链接**: ${url}` : ''}

---

## 请生成以下分析

### 1. 🔬 核心技术解析
用通俗易懂的语言解释项目的核心技术及其应用场景

### 2. 🔗 产业链影响分析
请用表格形式分析：
| 层级 | 影响方向 | 相关方 | 影响程度 |
|------|----------|--------|----------|
| 上游基础设施 | ... | ... | ... |
| 中游协议层 | ... | ... | ... |
| 下游应用层 | ... | ... | ... |

### 3. 📈 关联股票分析
找出直接受益的相关上市公司股票代码，分析其业务关联度

### 4. 💰 市场影响预测
基于项目热度，分析其对加密货币、贵金属等市场的潜在影响

### 5. 📊 投资建议
给出明确的投资方向建议和风险提示`
  }

  public generateFallback(context: any): string {
    const { name, description, tags, stars } = context
    
      // 扩展的术语解释库
      const tagExplanations = (tags || []).map((tag: string) => {
        const explanations: Record<string, string> = {
          // 加密货币与区块链
          'bitcoin': '比特币 - 去中心化加密货币，采用区块链技术，具有匿名性和去中心化特性',
          'ethereum': '以太坊 - 智能合约平台，支持 DeFi 和 NFT 生态系统的底层基础设施',
          'solana': 'Solana - 高性能区块链网络，主打快速低费的 DeFi 生态',
          'crypto': '加密货币 - 使用加密技术的数字货币',
          'blockchain': '区块链 - 分布式账本技术，确保数据不可篡改',
          'smart-contract': '智能合约 - 自动执行的数字化合约条款',
          'stablecoin': '稳定币 - 与美元等法币锚定的加密货币，如 USDT、USDC',
          'layer2': '二层网络 - 构建在主链之上的扩展解决方案',
          'zk-rollup': '零知识卷叠 - Layer 2 技术，使用零知识证明进行交易验证',
          // DeFi 与 Web3
          'defi': '去中心化金融 - 基于区块链的去中心化金融服务，如借贷、交易等',
          'yield-farming': '收益农场 - DeFi 中通过提供流动性获取收益的策略',
          'liquidity': '流动性 - 市场参与者买卖资产的便利程度',
          'dao': '去中心化自治组织 - 基于区块链的自治组织形式',
          'nft': '非同质化代币 - 基于区块链的数字资产，代表独特的所有权',
          'web3': 'Web3 - 基于区块链的去中心化互联网概念',
          'uniswap': 'Uniswap - 去中心化交易所协议',
          'aave': 'Aave - 去中心化借贷协议',
          'chainlink': 'Chainlink - 去中心化预言机网络',
          // AI 与机器学习
          'ai': '人工智能 - 机器学习、深度学习等技术的统称，正在重塑各行各业',
          'llm': '大语言模型 - 基于 Transformer 架构的 AI 模型，如 GPT、Claude 等',
          'machine-learning': '机器学习 - 让计算机从数据中学习并改进的算法学科',
          'deep-learning': '深度学习 - 使用多层神经网络的机器学习方法',
          'neural-network': '神经网络 - 模拟人脑神经元的计算模型',
          'transformer': 'Transformer 架构 - 深度学习模型架构，GPT、BERT 等大模型的基础',
          'nvidia': 'NVIDIA - AI 芯片领导者，GPU 渲染和深度学习核心供应商',
          'gpu': '图形处理器 - 最初用于图形渲染，现广泛用于 AI 计算和加密挖矿',
          // 交易相关
          'polymarket': '预测市场协议 - 基于区块链的预测平台，用户可以交易事件结果概率',
          'arbitrage': '套利策略 - 利用不同市场或交易所之间的价格差异获取无风险收益',
          'bot': '量化交易机器人 - 自动执行交易策略的程序，可 24/7 运行',
          'trading': '量化交易 - 基于数学模型和算法的自动化交易方式',
          // 编程语言
          'python': 'Python - 高级编程语言，AI/ML 领域最流行的语言',
          'javascript': 'JavaScript - Web 开发主流语言',
          'typescript': 'TypeScript - JavaScript 的超集，增加类型系统',
          'rust': 'Rust - 系统编程语言，以安全性和性能著称',
          'golang': 'Go/Golang - Google 开发的编译型语言，适合高并发服务',
          // 前端框架
          'react': 'React - Facebook 开发的 UI 框架，用于构建单页应用',
          'nextjs': 'Next.js - React 框架，用于全栈 Web 开发',
          'vue': 'Vue.js - 渐进式 JavaScript 框架，易于学习和集成',
          'nodejs': 'Node.js - 基于 Chrome V8 引擎的 JavaScript 运行时',
          'deno': 'Deno - Node.js 的替代品，由 Node.js 创始人开发',
          // 基础设施
          'docker': 'Docker - 容器化平台，用于应用打包和部署',
          'kubernetes': 'Kubernetes - 容器编排平台，用于自动化容器部署和管理',
          'aws': 'AWS - 亚马逊云服务，全球最大云服务商',
          'cloud': '云计算 - 基于互联网的计算资源共享',
          'serverless': '无服务器 - 云原生开发模式，按执行付费',
          // 数据库与 API
          'api': '应用程序接口 - 定义软件组件之间交互规范的协议',
          'graphql': 'GraphQL - API 查询语言，比 REST 更灵活',
          'rest-api': 'REST API - 基于 HTTP 的接口规范',
          'websocket': 'WebSocket - 双向实时通信协议',
          'mysql': 'MySQL - 关系型数据库管理系统',
          'postgresql': 'PostgreSQL - 高级开源关系型数据库',
          'mongodb': 'MongoDB - NoSQL 文档型数据库',
          'redis': 'Redis - 内存键值数据库，用于缓存',
          'elasticsearch': 'Elasticsearch - 搜索引擎和日志分析系统',
          // 其他
          'git': 'Git - 分布式版本控制系统',
          'github': 'GitHub - 全球最大开源代码托管平台',
          'open-source': '开源软件 - 源代码公开可自由使用和修改的软件',
          'cli': '命令行界面 - 通过文本命令与程序交互的方式',
          'gui': '图形用户界面 - 通过图形元素与程序交互的方式',
        }
        return `- **${tag}**: ${explanations[tag.toLowerCase()] || '新兴技术方向，可能对该领域产生创新性影响'}`
      }).join('\n')

    // 分析热度等级
    const hotnessLevel = stars > 1000 ? '🔥🔥🔥 极高热度' : 
                         stars > 500 ? '🔥🔥 高热度' : 
                         stars > 100 ? '🔥 中高热度' : 
                         stars > 50 ? '📊 中等热度' : '📉 热度一般'
    
    // 分析可能相关的股票
    const relatedStocks = this.analyzeRelatedStocks(tags || [])
    
    return `## 📋 ${name || '未知项目'} 专业分析

> ⚠️ AI 服务暂时不可用，以下为系统自动生成的分析

### 项目概述
${description || '暂无描述'}

### 核心技术术语解析
${tagExplanations || '暂无术语分析'}

---

### 🔗 产业链影响分析

| 层级 | 影响方向 | 预期程度 |
|------|----------|----------|
| **上游基础设施** | ${this.analyzeUpstreamImpact(tags || [])} | ${stars > 100 ? '积极' : '中性'} |
| **中游协议层** | ${this.analyzeMidstreamImpact(tags || [])} | ${stars > 100 ? '创新驱动' : '有限'} |
| **下游应用层** | ${this.analyzeDownstreamImpact(tags || [])} | ${stars > 50 ? '拓展机会' : '待观察'} |

### 📈 相关股票影响

${relatedStocks}

### 💰 市场热度与预测

${hotnessLevel} - 共 ${stars || 0} stars

**综合评估**: 该项目 ${stars > 100 ? '具有较高的行业影响力' : '对行业有一定参考价值'}，建议持续关注 ${stars > 500 ? '其生态系统发展' : '社区动态'}。`
  }
  
  private analyzeRelatedStocks(tags: string[]): string {
    const tagSet = new Set(tags.map(t => t.toLowerCase()))
    
    const stockMap: Record<string, { symbol: string; name: string; reason: string }[]> = {
      ai: [
        { symbol: 'NVDA', name: 'NVIDIA', reason: 'AI 芯片核心供应商' },
        { symbol: 'AMD', name: 'AMD', reason: 'AI 算力竞争者' },
        { symbol: 'MSFT', name: 'Microsoft', reason: 'AI 云服务和 Copilot' },
      ],
      crypto: [
        { symbol: 'COIN', name: 'Coinbase', reason: '美国最大加密交易所' },
        { symbol: 'MSTR', name: 'MicroStrategy', reason: '比特币持仓最大的上市公司' },
      ],
      defi: [
        { symbol: 'COIN', name: 'Coinbase', reason: 'DeFi 生态入口' },
        { symbol: 'HOOD', name: 'Robinhood', reason: '零售交易平台' },
      ],
      ethereum: [
        { symbol: 'COIN', name: 'Coinbase', reason: 'ETH 托管服务' },
        { symbol: 'ETHE', name: 'Ethereum Trust', reason: 'ETH 敞口' },
      ],
      bitcoin: [
        { symbol: 'MSTR', name: 'MicroStrategy', reason: '企业比特币持仓' },
        { symbol: 'MARA', name: 'Marathon', reason: '比特币挖矿' },
      ],
      solana: [
        { symbol: 'COIN', name: 'Coinbase', reason: 'SOL 交易和托管' },
      ],
    }
    
    let stocks: { symbol: string; name: string; reason: string }[] = []
    for (const tag of tagSet) {
      if (stockMap[tag]) {
        stocks = stocks.concat(stockMap[tag])
      }
    }
    
    // 去重
    const uniqueStocks = Array.from(new Map(stocks.map(s => [s.symbol, s])).values())
    
    if (uniqueStocks.length === 0) {
      return '暂无直接关联的上市公司股票数据'
    }
    
    return uniqueStocks.slice(0, 3).map(s => 
      `- **${s.symbol} (${s.name})**: ${s.reason}`
    ).join('\n')
  }
  
  private analyzeUpstreamImpact(tags: string[]): string {
    const tagSet = new Set(tags.map(t => t.toLowerCase()))
    if (tagSet.has('ai') || tagSet.has('llm')) return 'GPU 算力需求增加，芯片厂商受益'
    if (tagSet.has('crypto') || tagSet.has('defi')) return '区块链基础设施需求提升'
    if (tagSet.has('cloud')) return '云服务商计算资源需求增长'
    return '对底层技术产生间接影响'
  }
  
  private analyzeMidstreamImpact(tags: string[]): string {
    const tagSet = new Set(tags.map(t => t.toLowerCase()))
    if (tagSet.has('defi') || tagSet.has('smart-contract')) return '推动协议层创新和互操作性'
    if (tagSet.has('api')) return 'API 标准化和中间件发展'
    return '促进技术栈优化'
  }
  
  private analyzeDownstreamImpact(tags: string[]): string {
    const tagSet = new Set(tags.map(t => t.toLowerCase()))
    if (tagSet.has('ai') || tagSet.has('llm')) return '应用场景丰富，用户体验提升'
    if (tagSet.has('crypto') || tagSet.has('defi')) return '金融服务普及化'
    if (tagSet.has('nft')) return '数字资产确权和交易'
    return '推动行业应用落地'
  }
}