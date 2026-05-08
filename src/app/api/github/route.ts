import { NextRequest, NextResponse } from 'next/server'
import GitHubClient from '@/lib/api-clients/github'
import { ApiResponse } from '@/types'
import { getConfig } from '@/lib/db/config'

export async function GET(request: NextRequest) {
  try {
    // 从数据库获取 GitHub Token
    const githubToken = getConfig('githubToken') || process.env.GITHUB_API_TOKEN || ''
    
    const client = new GitHubClient(githubToken)
    const data = await client.getTrendingRepositories()

    return NextResponse.json({
      success: true,
      data,
      timestamp: new Date().toISOString(),
    } as ApiResponse<any>)
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : '未知错误',
        timestamp: new Date().toISOString(),
      } as ApiResponse<null>,
      { status: 500 }
    )
  }
}