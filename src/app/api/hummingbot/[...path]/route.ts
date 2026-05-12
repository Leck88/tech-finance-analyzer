import { NextRequest, NextResponse } from 'next/server'

const GATEWAY_URL = 'http://127.0.0.1:15888'

export async function GET(
  request: NextRequest,
  { params }: { params: { path: string[] } }
) {
  try {
    const gatewayPath = '/' + params.path.join('/')
    const query = request.nextUrl.search
    const targetUrl = query
      ? `${GATEWAY_URL}${gatewayPath}${query}`
      : `${GATEWAY_URL}${gatewayPath}`
    
    const res = await fetch(targetUrl, {
      headers: { 'Content-Type': 'application/json' },
      next: { revalidate: 10 },
    })
    const data = await res.json()
    return NextResponse.json(data, { status: res.status })
  } catch (error) {
    return NextResponse.json(
      { error: 'Gateway unavailable', message: error instanceof Error ? error.message : 'Unknown error' },
      { status: 502 }
    )
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: { path: string[] } }
) {
  try {
    const gatewayPath = '/' + params.path.join('/')
    const body = await request.json()
    const res = await fetch(`${GATEWAY_URL}${gatewayPath}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    })
    const data = await res.json()
    return NextResponse.json(data, { status: res.status })
  } catch (error) {
    return NextResponse.json(
      { error: 'Gateway unavailable', message: error instanceof Error ? error.message : 'Unknown error' },
      { status: 502 }
    )
  }
}
