import { TrendAnalysis, IndustryChain, Prediction } from '@/types'

export class AnalysisEngine {
  analyzeGitHubTech(
    repoName: string,
    description: string | null,
    tags: string[]
  ): TrendAnalysis {
    const keywords = this.extractKeywords(repoName, description, tags)
    
    return {
      keywords,
      explanation: this.generateExplanation(keywords),
      businessValue: this.generateBusinessValue(keywords),
    }
  }

  private extractKeywords(
    name: string,
    description: string | null,
    tags: string[]
  ): string[] {
    const keywords = new Set<string>()

    // 从标签中提取
    tags.forEach((tag) => keywords.add(tag))

    // 从项目名称中提取
    const nameKeywords = name.toLowerCase().split(/[-_]/).slice(0, 3)
    nameKeywords.forEach((k) => keywords.add(k))

    // 从描述中提取核心词
    if (description) {
      const descLower = description.toLowerCase()
      const coreTerms = [
        'AI',
        'LLM',
        'Machine Learning',
        'Deep Learning',
        'Blockchain',
        'Web3',
        'NFT',
        'Smart Contract',
        'Framework',
        'Library',
        'Database',
        'Cloud',
        'API',
      ]

      coreTerms.forEach((term) => {
        if (descLower.includes(term.toLowerCase())) {
          keywords.add(term)
        }
      })
    }

    return Array.from(keywords).slice(0, 3)
  }

  private generateExplanation(keywords: string[]): string {
    const explanations: Record<string, string> = {
      AI: '人工智能 - 让计算机学会自动分析和做决策，无需人工编程每一步',
      'Machine Learning': '机器学习 - AI的一种方法，通过大数据训练模型识别规律',
      'Deep Learning': '深度学习 - 模拟人脑神经网络的高级AI技术',
      'Web3': '去中心化网络 - 用区块链技术取代中介机构，用户拥有数据和资产所有权',
      Blockchain: '区块链 - 分布式账本技术，用密码学保证数据安全和不可篡改',
      LLM: '大语言模型 - 像 ChatGPT 这样的AI，能理解和生成人类语言',
      Framework: '开发框架 - 开发者工具，加速软件开发的速度和质量',
      Library: '代码库 - 可复用的代码集合，提供通用功能',
      Database: '数据库 - 存储和管理大规模数据的系统',
      Cloud: '云计算 - 通过网络使用远程计算资源，省去本地硬件成本',
      API: '数据接口 - 让不同软件系统之间互相通信和数据交换',
    }

    return keywords
      .map((kw) => explanations[kw] || `${kw} - 新兴技术方向`)
      .join(' | ')
  }

  private generateBusinessValue(keywords: string[]): string {
    const values: Record<string, string> = {
      AI: '💰 应用场景：自动化客服、推荐系统、数据分析 | 受益方：科技巨头、企业级SaaS',
      'Machine Learning': '💰 应用场景：风险评估、欺诈检测、个性化服务 | 受益方：金融机构、互联网平台',
      'Deep Learning': '💰 应用场景：图像识别、语音识别、自动驾驶 | 受益方：芯片厂商、汽车制造商',
      'Web3':
        '💰 应用场景：去中心化金融、数字资产、游戏经济 | 受益方：区块链基础设施、加密交易所',
      Blockchain:
        '💰 应用场景：支付清算、供应链追溯、身份验证 | 受益方：金融科技、企业ERP厂商',
      LLM: '💰 应用场景：内容生成、编程助手、客户服务 | 受益方：云计算平台、企业级AI工具',
      Framework: '💰 应用场景：加速项目交付、降低开发成本 | 受益方：企业开发部门、初创公司',
      Library: '💰 应用场景：提高代码复用率、标准化开发 | 受益方：开发工具供应商',
      Database: '💰 应用场景：数据存储、实时分析 | 受益方：数据库公司、云服务商',
      Cloud: '💰 应用场景：降低基础设施成本、支持远程工作 | 受益方：云服务商、企业用户',
    }

    return keywords.map((kw) => values[kw] || `💰 ${kw} 正在塑造新的商业机会`).join(' | ')
  }

  analyzeIndustryChain(keyword: string): IndustryChain {
    const chains: Record<string, IndustryChain> = {
      AI: {
        upstream: {
          sectors: ['NVIDIA', 'AMD', 'GPU芯片', '云计算基础设施'],
          fundFlow: '💲 GPU芯片需求爆增 → 芯片厂商营收创新高',
        },
        midstream: {
          sectors: ['TensorFlow', 'PyTorch', 'AI模型平台'],
          fundFlow: '💲 开源框架商业化 → 企业级AI工具获融资',
        },
        downstream: {
          sectors: ['ChatGPT', '企业AI应用', '垂直行业方案'],
          fundFlow: '💲 AI应用创造价值 → 互联网平台广告转化率提升',
        },
      },
      'Web3': {
        upstream: {
          sectors: ['区块链基础设施', '节点服务', '钱包技术'],
          fundFlow: '💲 交易需求 → 基础设施提供商收费增加',
        },
        midstream: {
          sectors: ['DeFi协议', 'NFT平台', '智能合约'],
          fundFlow: '💲 用户交易 → 协议产生手续费和治理代币价值',
        },
        downstream: {
          sectors: ['加密交易所', '投资基金', '企业采用'],
          fundFlow: '💲 资产转移到链上 → 交易所和托管服务收入增加',
        },
      },
      LLM: {
        upstream: {
          sectors: ['GPU供应', '云计算', '数据标注服务'],
          fundFlow: '💲 训练需求 → 云厂商利用率提升，数据服务增值',
        },
        midstream: {
          sectors: ['OpenAI', 'Anthropic', '国内大模型厂商'],
          fundFlow: '💲 API调用 → 模型厂商订阅收入和云费用分成',
        },
        downstream: {
          sectors: ['企业应用', '文化创意', '金融服务'],
          fundFlow: '💲 业务效率提升 → 企业增支或降本变现',
        },
      },
    }

    return (
      chains[keyword] || {
        upstream: {
          sectors: ['底层基础设施'],
          fundFlow: '💲 资金流向上游基础设施提供商',
        },
        midstream: {
          sectors: ['技术平台和框架'],
          fundFlow: '💲 中层技术方案获得融资和收入',
        },
        downstream: {
          sectors: ['行业应用和落地'],
          fundFlow: '💲 下游应用创造实际商业价值',
        },
      }
    )
  }

  predictNextDay(
    currentTrend: number,
    momentum: number,
    sentiment: string
  ): Prediction {
    let direction: 'up' | 'down' | 'stable' = 'stable'
    const reasons: string[] = []

    // 基于当前趋势
    if (currentTrend > 2) {
      direction = 'up'
      reasons.push('技术热度持续上升，市场关注度高')
    } else if (currentTrend < -2) {
      direction = 'down'
      reasons.push('技术热度下滑，市场关注转向其他方向')
    }

    // 基于动量（涨幅）
    if (momentum > 5) {
      reasons.push('短期涨幅明显，机构入场驱动')
      if (direction === 'stable') direction = 'up'
    } else if (momentum < -5) {
      reasons.push('短期跌幅明显，获利出货压力大')
      if (direction === 'stable') direction = 'down'
    }

    // 基于市场情绪
    if (sentiment === 'greed') {
      reasons.push('市场贪婪指数偏高，存在回调风险')
    } else if (sentiment === 'fear') {
      reasons.push('市场恐慌指数高，但技术基本面未变')
    }

    return {
      direction,
      reasons: reasons.length > 0 ? reasons : ['市场处于整固阶段，无明确方向'],
      confidence: Math.min(Math.max(Math.abs(currentTrend) + Math.abs(momentum) / 10, 0), 1),
    }
  }
}

export default AnalysisEngine
