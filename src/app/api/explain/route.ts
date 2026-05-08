import { NextRequest, NextResponse } from 'next/server'
import { MiniMaxClient } from '@/lib/ai-clients/minimax'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { repo, apiKey } = body

    if (!repo) {
      return NextResponse.json({
        success: false,
        error: '缺少必要参数',
      }, { status: 400 })
    }

    // 使用用户提供的 API Key 或环境变量
    const miniMaxApiKey = apiKey || process.env.MINIMAX_API_KEY || ''
    
    if (!miniMaxApiKey) {
      return NextResponse.json({
        success: false,
        error: '请先在设置页面配置 MiniMax API Key',
        needConfig: true,
      }, { status: 400 })
    }

    const client = new MiniMaxClient(miniMaxApiKey)
    const explanation = await client.generateExplanation(repo)

    return NextResponse.json({
      success: true,
      data: {
        explanation,
        timestamp: new Date().toISOString(),
      },
    })
  } catch (error) {
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'AI 解释生成失败',
    }, { status: 500 })
  }
}