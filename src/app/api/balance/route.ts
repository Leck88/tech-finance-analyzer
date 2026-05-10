import { NextResponse } from 'next/server'
import HTXClient from '@/lib/api-clients/htx'

export async function GET() {
  try {
    const apiKey = process.env.HTX_API_KEY
    const apiSecret = process.env.HTX_API_SECRET

    if (!apiKey || !apiSecret) {
      return NextResponse.json({
        success: false,
        error: '未配置 HTX API 密钥'
      }, { status: 500 })
    }

    const client = new HTXClient(apiKey, apiSecret)
    const balance = await client.getAccountBalance()

    return NextResponse.json({
      success: true,
      data: balance,
      timestamp: new Date().toISOString()
    })
  } catch (error) {
    console.error('Balance API error:', error)
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : '查询余额失败'
    }, { status: 500 })
  }
}
