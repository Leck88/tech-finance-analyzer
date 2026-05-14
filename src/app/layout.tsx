import type { Metadata } from 'next'
import Link from 'next/link'
import { ThemeToggle } from '@/components/ThemeToggle'
import './globals.css'

export const metadata: Metadata = {
  title: '科技金融量化分析系统',
  description: '每日自动化GitHub趋势、股票预测、加密货币分析',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="zh" suppressHydrationWarning>
      <body className="bg-gray-50 text-gray-900 dark:bg-gray-900 dark:text-gray-100 transition-colors">
        <nav className="bg-white dark:bg-gray-800 shadow">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <div className="flex justify-between items-center">
              <h1 className="text-2xl font-bold text-blue-600 dark:text-blue-400">📊 TechFinance Analyzer</h1>
              <div className="flex items-center gap-4">
                <ul className="flex gap-6">
                  <li><Link href="/" className="text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400">首页</Link></li>
                  <li><Link href="/dashboard" className="text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400">仪表板</Link></li>
                  <li><Link href="/market" className="text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400">📈 市场</Link></li>
                  <li><Link href="/skills" className="text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400">🧠 技能</Link></li>
                  <li><Link href="/execute" className="text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400">▶️ 执行</Link></li>
                  <li><Link href="/settings" className="text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400">⚙️ 设置</Link></li>
                </ul>
                <ThemeToggle />
              </div>
            </div>
          </div>
        </nav>
        <main className="max-w-7xl mx-auto">
          {children}
        </main>
        <footer className="bg-gray-800 dark:bg-gray-950 text-white text-center py-4 mt-12">
          <p>© 2026 科技金融量化分析系统 | 数据准确性优先</p>
        </footer>
      </body>
    </html>
  )
}
