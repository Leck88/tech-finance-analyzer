import cron from 'node-cron'
import { execSync } from 'child_process'

const CRON_SCHEDULE = process.env.CRON_SCHEDULE || '0 23 * * *' // 默认每日23:00

export function initializeScheduler() {
  if (typeof window !== 'undefined') {
    // 客户端环境，不需要调度器
    return
  }

  cron.schedule(CRON_SCHEDULE, async () => {
    console.log('[Scheduler] 执行定时任务:', new Date().toISOString())
    try {
      // 调用API端点
      const apiUrl = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:3000'
      const response = await fetch(`${apiUrl}/api/execute-task`, {
        method: 'GET',
        headers: {
          'x-api-key': process.env.API_KEY || '',
        },
      })

      if (response.ok) {
        const data = await response.json()
        console.log('[Scheduler] 任务执行成功:', data)
      } else {
        console.error('[Scheduler] 任务执行失败:', response.status)
      }
    } catch (error) {
      console.error('[Scheduler] 任务执行错误:', error)
    }
  })

  console.log(`[Scheduler] 定时任务已初始化，计划: ${CRON_SCHEDULE}`)
}
