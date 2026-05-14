'use client'

import Link from 'next/link'
import {} from 'lucide-react'

export default function Home() {

  return (

      <div className="max-w-5xl mx-auto">
        {/* Hero Section */}
        <div className="text-center mb-12">
          <div className="text-6xl mb-4">🚀</div>
          <h2 className="text-4xl font-bold mb-4 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            科技金融量化分析系统
          </h2>
          <p className="text-gray-600 text-lg mb-8 max-w-2xl mx-auto">
            集成 GitHub 趋势分析、加密货币实时行情、技术指标计算、金融技能工具于一体的智能量化分析平台
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/dashboard"
              className="bg-gradient-to-r from-blue-600 to-blue-700 text-white px-8 py-3 rounded-xl hover:from-blue-700 hover:to-blue-800 transition shadow-lg"
            >
              📊 查看仪表板
            </Link>
            <Link
              href="/market"
              className="bg-gradient-to-r from-purple-600 to-purple-700 text-white px-8 py-3 rounded-xl hover:from-purple-700 hover:to-purple-800 transition shadow-lg"
            >
              📈 市场分析
            </Link>
            <Link
              href="/skills"
              className="bg-gradient-to-r from-green-600 to-green-700 text-white px-8 py-3 rounded-xl hover:from-green-700 hover:to-green-800 transition shadow-lg"
            >
              🧠 金融技能
            </Link>
          </div>
        </div>

        {/* Feature Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
          <Link href="/dashboard" className="group">
            <div className="bg-white rounded-2xl shadow-md p-6 border-2 border-transparent group-hover:border-blue-300 transition-all group-hover:shadow-lg">
              <div className="text-3xl mb-3">🐙</div>
              <h3 className="text-lg font-bold mb-2 group-hover:text-blue-600 transition">GitHub 趋势追踪</h3>
              <p className="text-gray-600 text-sm">获取全球 Top10 热门项目，AI 智能分析技术趋势和投资机会</p>
            </div>
          </Link>

          <Link href="/market" className="group">
            <div className="bg-white rounded-2xl shadow-md p-6 border-2 border-transparent group-hover:border-purple-300 transition-all group-hover:shadow-lg">
              <div className="text-3xl mb-3">📈</div>
              <h3 className="text-lg font-bold mb-2 group-hover:text-purple-600 transition">加密货币市场分析</h3>
              <p className="text-gray-600 text-sm">实时行情、涨幅/跌幅排行、成交量分析、订单簿深度</p>
            </div>
          </Link>

          <Link href="/market" className="group">
            <div className="bg-white rounded-2xl shadow-md p-6 border-2 border-transparent group-hover:border-yellow-300 transition-all group-hover:shadow-lg">
              <div className="text-3xl mb-3">🔬</div>
              <h3 className="text-lg font-bold mb-2 group-hover:text-yellow-600 transition">技术指标分析</h3>
              <p className="text-gray-600 text-sm">RSI、MACD、布林带、移动平均线等专业技术指标计算</p>
            </div>
          </Link>

          <Link href="/skills" className="group">
            <div className="bg-white rounded-2xl shadow-md p-6 border-2 border-transparent group-hover:border-green-300 transition-all group-hover:shadow-lg">
              <div className="text-3xl mb-3">🎯</div>
              <h3 className="text-lg font-bold mb-2 group-hover:text-green-600 transition">仓位管理工具</h3>
              <p className="text-gray-600 text-sm">基于风险比例的仓位计算器，科学管理投资风险</p>
            </div>
          </Link>

          <Link href="/skills" className="group">
            <div className="bg-white rounded-2xl shadow-md p-6 border-2 border-transparent group-hover:border-orange-300 transition-all group-hover:shadow-lg">
              <div className="text-3xl mb-3">💱</div>
              <h3 className="text-lg font-bold mb-2 group-hover:text-orange-600 transition">货币转换 & 定投</h3>
              <p className="text-gray-600 text-sm">实时汇率转换、投资收益预估</p>
            </div>
          </Link>

          <Link href="/skills" className="group">
            <div className="bg-white rounded-2xl shadow-md p-6 border-2 border-transparent group-hover:border-indigo-300 transition-all group-hover:shadow-lg">
              <div className="text-3xl mb-3">📖</div>
              <h3 className="text-lg font-bold mb-2 group-hover:text-indigo-600 transition">交易术语 & 教育</h3>
              <p className="text-gray-600 text-sm">20+ 加密货币交易术语详解，从入门到进阶的学习资源</p>
            </div>
          </Link>
        </div>

        {/* Quick Stats */}
        <div className="bg-gradient-to-r from-gray-900 to-gray-800 text-white rounded-2xl p-8 mb-12">
          <h3 className="text-xl font-bold mb-6 text-center">🔥 核心功能一览</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
            <div>
              <div className="text-3xl font-bold text-blue-400">8+</div>
              <div className="text-sm text-gray-400 mt-1">API 数据源</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-purple-400">6</div>
              <div className="text-sm text-gray-400 mt-1">技术指标</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-green-400">5+</div>
              <div className="text-sm text-gray-400 mt-1">金融工具</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-yellow-400">20+</div>
              <div className="text-sm text-gray-400 mt-1">交易术语</div>
            </div>
          </div>
        </div>

        {/* Workflow */}
        <div className="bg-white rounded-2xl shadow-md p-8 mb-12">
          <h3 className="text-xl font-bold mb-6 text-center">⚙️ 工作流程</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[
              { icon: '1️⃣', title: 'GitHub API', desc: '获取昨日全球热门项目 Top10' },
              { icon: '2️⃣', title: '技术分析', desc: '提取关键词、通俗解释、应用场景' },
              { icon: '3️⃣', title: '加密货币', desc: 'BTC/ETH 实时行情与技术指标' },
              { icon: '4️⃣', title: '市场排行', desc: '涨幅/跌幅/成交量实时排行' },
              { icon: '5️⃣', title: '股票追踪', desc: '映射到相关公司股票，获取涨跌幅' },
              { icon: '6️⃣', title: 'AI 分析', desc: 'MiniMax AI 生成专业金融报告' },
              { icon: '7️⃣', title: '风险管理', desc: '仓位计算、止损策略、风险评估' },
              { icon: '8️⃣', title: '邮件推送', desc: 'HTML 格式化结果自动推送' },
            ].map((step, idx) => (
              <div key={idx} className="flex items-start gap-3 p-3 rounded-lg hover:bg-gray-50 transition">
                <span className="text-xl">{step.icon}</span>
                <div>
                  <div className="font-semibold">{step.title}</div>
                  <div className="text-sm text-gray-600">{step.desc}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="text-center mb-8">
          <Link
            href="/execute"
            className="inline-flex items-center gap-2 bg-gradient-to-r from-green-600 to-blue-600 text-white px-10 py-4 rounded-xl font-bold text-lg hover:opacity-90 transition shadow-lg"
          >
            ▶️ 立即执行全部任务
          </Link>
        </div>

        {/* Important Notice */}
        <div className="p-6 bg-yellow-50 border border-yellow-200 rounded-2xl">
          <h4 className="font-bold text-yellow-800 mb-3 flex items-center gap-2">⚠️ 重要提示</h4>
          <ul className="text-yellow-700 text-sm space-y-2">
            <li>• 所有数据基于 API 返回结果，禁止编造</li>
            <li>• 敏感信息存储在 .env.local（不提交到版本控制）</li>
            <li>• 如 API 失败，标记&ldquo;数据缺失&rdquo;，禁止预测</li>
            <li>• 结论必须基于数据，禁止模糊词如&ldquo;可能&rdquo;、&ldquo;大概率&rdquo;</li>
            <li>• 加密货币投资具有高风险，本工具仅供学习参考</li>
          </ul>
        </div>
      </div>
  )
}