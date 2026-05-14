import type { Metadata } from 'next'
import Link from 'next/link'
import './globals.css'

export const metadata: Metadata = {
  title: '科技金融量化分析系统',
  description: '每日自动化GitHub趋势、股票预测、加密货币分析',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="zh">
      <body className="bg-gray-50 text-gray-900">
        <nav className="bg-white shadow">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <div className="flex justify-between items-center">
              <h1 className="text-2xl font-bold text-blue-600">📊 TechFinance Analyzer</h1>
              <ul className="flex gap-6">
                <li><Link href="/" className="text-gray-600 hover:text-blue-600">首页</Link></li>
                <li><Link href="/dashboard" className="text-gray-600 hover:text-blue-600">仪表板</Link></li>
                <li><Link href="/market" className="text-gray-600 hover:text-blue-600">📈 市场</Link></li>
                <li><Link href="/skills" className="text-gray-600 hover:text-blue-600">🧠 技能</Link></li>
                <li><Link href="/execute" className="text-gray-600 hover:text-blue-600">▶️ 执行</Link></li>
                <li><Link href="/settings" className="text-gray-600 hover:text-blue-600">⚙️ 设置</Link></li>
              </ul>
            </div>
          </div>
        </nav>
        <main className="max-w-7xl mx-auto">
          {children}
        </main>
        <footer className="bg-gray-800 text-white text-center py-4 mt-12">
          <p>© 2026 科技金融量化分析系统 | 数据准确性优先</p>
        </footer>
      </body>
    </html>
  )
}
