import Link from 'next/link'

export default function Home() {
  return (
    <div className="py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <div className="card text-center mb-8">
          <h2 className="text-3xl font-bold mb-4">🚀 科技金融量化分析系统</h2>
          <p className="text-gray-600 mb-6">
            每日 23:00 自动执行 GitHub 趋势、股票预测、加密货币分析
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/dashboard"
              className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition"
            >
              📊 查看仪表板
            </Link>
            <Link
              href="/api/execute-task"
              className="bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 transition"
            >
              ▶️ 立即执行任务
            </Link>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <div className="card text-center">
            <h3 className="text-lg font-semibold mb-2">📈 GitHub 趋势</h3>
            <p className="text-gray-600 text-sm">获取全球 Top10 热门项目</p>
          </div>
          <div className="card text-center">
            <h3 className="text-lg font-semibold mb-2">📊 股票分析</h3>
            <p className="text-gray-600 text-sm">追踪技术对股价的影响</p>
          </div>
          <div className="card text-center">
            <h3 className="text-lg font-semibold mb-2">🪙 加密货币</h3>
            <p className="text-gray-600 text-sm">BTC/ETH 实时分析与预测</p>
          </div>
          <div className="card text-center">
            <h3 className="text-lg font-semibold mb-2">✉️ 邮件通知</h3>
            <p className="text-gray-600 text-sm">HTML 格式化结果推送</p>
          </div>
        </div>

        <div className="card">
          <h3 className="text-xl font-bold mb-4">⚙️ 工作流程</h3>
          <ol className="space-y-3 text-gray-700">
            <li>1️⃣ <strong>GitHub API</strong> - 获取昨日全球热门项目 Top10</li>
            <li>2️⃣ <strong>技术分析</strong> - 提取关键词、通俗解释、应用场景</li>
            <li>3️⃣ <strong>产业链</strong> - 上游/中游/下游资金流向分析</li>
            <li>4️⃣ <strong>股票追踪</strong> - 映射到相关公司股票，获取涨跌幅</li>
            <li>5️⃣ <strong>价格预测</strong> - 基于热度和技术趋势预测次日股价</li>
            <li>6️⃣ <strong>T+1 验证</strong> - 对比预测与实际结果，优化模型</li>
            <li>7️⃣ <strong>加密分析</strong> - BTC/ETH 驱动因素分析</li>
            <li>8️⃣ <strong>黄金分析</strong> - 美元指数、利率、地缘政治风险</li>
            <li>9️⃣ <strong>邮件发送</strong> - HTML 格式化结果推送（支持重试）</li>
            <li>🔟 <strong>Web展示</strong> - 响应式网页展示所有数据</li>
          </ol>
        </div>

        <div className="mt-8 p-4 bg-yellow-50 border border-yellow-200 rounded">
          <h4 className="font-bold text-yellow-800 mb-2">⚠️ 重要提示</h4>
          <ul className="text-yellow-700 text-sm space-y-1">
            <li>• 所有数据基于 API 返回结果，禁止编造</li>
            <li>• 敏感信息存储在 .env.local（不提交到版本控制）</li>
            <li>• 如 API 失败，标记&ldquo;数据缺失&rdquo;，禁止预测</li>
            <li>• 结论必须基于数据，禁止模糊词如&ldquo;可能&rdquo;、&ldquo;大概率&rdquo;</li>
          </ul>
        </div>
      </div>
    </div>
  )
}
