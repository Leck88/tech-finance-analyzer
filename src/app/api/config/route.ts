import { NextRequest, NextResponse } from 'next/server'
import { getConfig, setConfig, getAllConfigs, deleteConfig } from '@/lib/db/config'

export async function GET(request: NextRequest) {
  try {
    const key = request.nextUrl.searchParams.get('key')
    
    if (key) {
      const value = getConfig(key)
      return NextResponse.json({
        success: true,
        data: { key, value },
      })
    } else {
      const configs = getAllConfigs()
      return NextResponse.json({
        success: true,
        data: configs,
      })
    }
  } catch (error) {
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : '获取配置失败',
    }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { key, value, description } = body

    if (!key || value === undefined) {
      return NextResponse.json({
        success: false,
        error: '缺少 key 或 value 参数',
      }, { status: 400 })
    }

    const success = setConfig(key, value, description)
    
    return NextResponse.json({
      success,
      message: success ? '配置保存成功' : '配置保存失败',
    })
  } catch (error) {
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : '保存配置失败',
    }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const key = request.nextUrl.searchParams.get('key')
    
    if (!key) {
      return NextResponse.json({
        success: false,
        error: '缺少 key 参数',
      }, { status: 400 })
    }

    const success = deleteConfig(key)
    
    return NextResponse.json({
      success,
      message: success ? '配置删除成功' : '配置删除失败',
    })
  } catch (error) {
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : '删除配置失败',
    }, { status: 500 })
  }
}