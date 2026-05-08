import { NextRequest, NextResponse } from 'next/server'

function generateSimpleFallback(repo: any): string {
  const name = repo?.name || 'Unknown Project'
  const description = repo?.description || 'No description'
  const tags = repo?.tags || []
  const stars = repo?.stars || 0

  const tagList = tags.length > 0
    ? tags.map((tag: string) => `- **${tag}**: Related tech tag`).join('\n')
    : 'No tags available'

  const hotnessLevel = stars > 1000 ? 'High popularity' : stars > 100 ? 'Medium popularity' : 'Low popularity'

  return '## ' + name + ' Analysis\n\n' +
    '### Project Overview\n' +
    description + '\n\n' +
    '### Tech Tags\n' +
    tagList + '\n\n' +
    '### Industry Impact\n' +
    '- **Upstream**: Indirect impact on underlying technology\n' +
    '- **Midstream**: Promote technology stack optimization\n' +
    '- **Downstream**: Drive industry application\n\n' +
    '### Stock Impact\n' +
    'No direct related stock data available\n\n' +
    '### Market Sentiment\n' +
    hotnessLevel + ' - ' + stars + ' stars\n\n' +
    '**Assessment**: This project has reference value for the industry.'
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { repo, apiKey } = body

    if (!repo) {
      return NextResponse.json({
        success: false,
        error: 'Missing required parameter: repo',
      }, { status: 400 })
    }

    // 使用 Zhipu API Key 或环境变量
    const zhipuApiKey = apiKey || process.env.ZHIPU_API_KEY || ''
    
    // 如果没有 Zhipu API Key，回退到 MiniMax
    const miniMaxApiKey = process.env.MINIMAX_API_KEY || ''
    const effectiveApiKey = zhipuApiKey || miniMaxApiKey

    if (!effectiveApiKey) {
      return NextResponse.json({
        success: false,
        error: 'Please configure AI API Key (ZHIPU_API_KEY or MINIMAX_API_KEY)',
        needConfig: true,
      }, { status: 400 })
    }

    try {
      let explanation: string
      
      if (zhipuApiKey) {
        // 使用智谱 AI
        const { ZhipuClient } = await import('@/lib/ai-clients/zhipu')
        const client = new ZhipuClient(zhipuApiKey)
        explanation = await client.generateExplanation(repo)
      } else if (miniMaxApiKey) {
        // 使用 MiniMax
        const { MiniMaxClient } = await import('@/lib/ai-clients/minimax')
        const client = new MiniMaxClient(miniMaxApiKey)
        explanation = await client.generateExplanation(repo)
      } else {
        throw new Error('No valid API key')
      }

      // 检查是否返回了 fallback 内容
      if (explanation.includes('AI 服务暂时不可用') || explanation.includes('系统自动生成')) {
        return NextResponse.json({
          success: true,
          data: {
            explanation,
            isFallback: true,
            timestamp: new Date().toISOString(),
          },
        })
      }

      return NextResponse.json({
        success: true,
        data: {
          explanation,
          timestamp: new Date().toISOString(),
        },
      })
    } catch (apiError) {
      console.error('AI API call failed:', apiError)
      const fallbackExplanation = generateSimpleFallback(repo)
      return NextResponse.json({
        success: true,
        data: {
          explanation: fallbackExplanation,
          isFallback: true,
          timestamp: new Date().toISOString(),
        },
      })
    }
  } catch (error) {
    console.error('AI explain error:', error)
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'AI explanation generation failed',
    }, { status: 500 })
  }
}
