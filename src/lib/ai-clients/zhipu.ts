export class ZhipuClient {
  private apiKey: string
  private baseUrl = 'https://open.bigmodel.cn/api/paas/v4'

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
      const response = await fetch(`${this.baseUrl}/chat/completions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiKey}`,
        },
        body: JSON.stringify({
          model: 'glm-4-flash',
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
        console.error('Zhipu API error:', response.status, errorText)
        throw new Error(`Zhipu API 错误: ${response.status} - ${errorText.substring(0, 200)}`)
      }

      const result = await response.json()
      
      if (!result.choices || !result.choices[0]?.message?.content) {
        console.error('Zhipu API 返回格式错误:', result)
        throw new Error('AI 返回格式异常')
      }
      
      return result.choices[0].message.content
    } catch (error) {
      console.error('Zhipu API error:', error)
      throw error
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
}
