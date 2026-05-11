import { NextResponse } from 'next/server'

export async function GET() {
  try {
    const response = await fetch('http://129.226.152.47:8003/api/plan', {
      next: { revalidate: 0 }
    })
    
    if (!response.ok) {
      const error = await response.text()
      return NextResponse.json({ success: false, error: 'API 请求失败: ' + error }, { status: 200 })
    }
    
    const data = await response.json()
    return NextResponse.json({ success: true, data })
  } catch (error: any) {
    return NextResponse.json({ 
      success: false, 
      error: error?.message || '获取 DCA 计划失败' 
    }, { status: 200 })
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { planId, exchange, symbol, side, type, amount, price } = body
    
    const apiUrl = 'http://129.226.152.47:8003/api/plan/execute'
    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ plan_id: planId, exchange, symbol, side, type, amount, price })
    })
    
    const result = await response.json()
    
    if (result.success || result.status === 'success') {
      return NextResponse.json({ success: true, data: result })
    } else {
      return NextResponse.json({ success: false, error: result.detail || '执行失败' }, { status: 200 })
    }
  } catch (error: any) {
    return NextResponse.json({ 
      success: false, 
      error: error?.message || '执行 DCA 计划失败' 
    }, { status: 200 })
  }
}
