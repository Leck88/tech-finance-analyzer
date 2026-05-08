export class MiniMaxClient {
  private apiKey: string
  private baseUrl = 'https://api.minimax.chat/v1'

  constructor(apiKey: string) {
    this.apiKey = apiKey
  }

  async generateExplanation(context: any): Promise<string> {
    const { name, description, tags, stars } = context
    
    // 构建提示词
    const systemPrompt = `你是一个专业的科技金融分析师，擅长分析 GitHub 热门项目。请为用户提供专业的项目分析，包括：
1. 专业术语解释
2. 产业链上下游影响分析
3. 相关股票影响
4. 价格影响预测

请用简洁专业的语言回答，使用 Markdown 格式。`

    const userPrompt = this.buildPrompt(name, description, tags, stars)

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
          max_tokens: 2000,
        }),
      })

      if (!response.ok) {
        throw new Error(`MiniMax API error: ${response.status}`)
      }

      const result = await response.json()
      return result.choices?.[0]?.message?.content || this.generateFallback(context)
    } catch (error) {
      console.error('MiniMax API error:', error)
      return this.generateFallback(context)
    }
  }

  private buildPrompt(name: string, description: string, tags: string[], stars: number): string {
    return `请分析以下 GitHub 项目：

项目名称：${name || '未知'}
项目描述：${description || '暂无描述'}
技术标签：${tags?.join(', ') || '无'}
Star 数量：${stars || 0}

请分析：
1. 核心技术术语的通俗解释
2. 对上游（基础设施）和下游（行业应用）的影响
3. 相关股票影响（如 NVIDIA、AMD、Coinbase 等）
4. 基于热度的价格影响预测`
  }

  private generateFallback(context: any): string {
    const { name, description, tags, stars } = context
    
    const tagExplanations = (tags || []).map((tag: string) => {
      const explanations: Record<string, string> = {
        'bitcoin': '比特币 - 去中心化加密货币',
        'ethereum': '以太坊 - 智能合约平台',
        'polymarket': '预测市场协议 - 区块链预测平台',
        'arbitrage': '套利 - 利用价差获利',
        'bot': '自动化机器人',
        'ai': '人工智能',
        'trading': '交易',
        'defi': '去中心化金融',
      }
      return `- **${tag}**: ${explanations[tag.toLowerCase()] || '新兴技术方向'}`
    }).join('\n')

    const hotness = stars > 100 ? '🔥 高热度' : stars > 50 ? '📊 中高热度' : '📉 热度一般'
    
    return `## 📋 ${name || '未知项目'} 专业分析

### 项目概述
${description || '暂无描述'}

### 核心技术术语
${tagExplanations || '暂无术语分析'}

---

### 🔗 产业链影响
- **上游影响**: 对底层基础设施产生积极影响
- **下游影响**: 推动行业应用创新

### 📈 相关股票
暂无直接关联股票数据

### 💰 价格预测
${hotness} - 预计对相关领域产生${stars > 50 ? '积极' : '有限'}影响`
  }
}