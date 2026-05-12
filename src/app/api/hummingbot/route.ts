import { NextResponse } from 'next/server'

const GATEWAY_URL = 'http://127.0.0.1:15888'

export async function GET() {
  try {
    const res = await fetch(GATEWAY_URL + '/')
    const data = await res.json()
    return NextResponse.json(data)
  } catch {
    return NextResponse.json({ status: 'offline' }, { status: 200 })
  }
}
