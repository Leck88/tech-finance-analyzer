import { NextResponse } from 'next/server'
import { getConfig } from '@/lib/db/config'

interface NewsItem {
  id: string
  title: string
  source: string
  url: string
  publishedAt: string
  sentiment?: 'positive' | 'negative' | 'neutral'
  summary?: string
  reason?: string
}

interface ApiResponse<T> {
  success: boolean
  data?: T
  error?: string
  timestamp: string
}

function decodeHtmlEntities(text: string): string {
  return text
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&nbsp;/g, ' ')
}

async function fetchGoogleNews(): Promise<NewsItem[]> {
  try {
    const res = await fetch('https://news.google.com/rss?topic=technology&hl=zh-CN&gl=CN&ceid=CN:zh-Hans', {
      next: { revalidate: 900 }
    })
    if (!res.ok) throw new Error('Google News error')
    const text = await res.text()
    
    const items: NewsItem[] = []
    const itemRegex = /<item(?:s[^>]*)?>([\s\S]*?)<\/item>/gi
    let match
    
    while ((match = itemRegex.exec(text)) !== null && items.length < 30) {
      const block = match[1]
      
      const titleMatch = block.match(/<title[^>]*>([\s\S]*?)<\/title>/i)
      const linkMatch = block.match(/<link[^>]*>([\s\S]*?)<\/link>/i)
      const pubMatch = block.match(/<pubDate[^>]*>([\s\S]*?)<\/pubDate>/i)
      const sourceMatch = block.match(/<source[^>]*>([\s\S]*?)<\/source>/i)
      
      if (titleMatch) {
        let title = titleMatch[1].replace(/<!\[CDATA\[|\]\]>/g, '').trim()
        title = decodeHtmlEntities(title)
        
        let url = linkMatch?.[1] || '#'
        url = decodeHtmlEntities(url).trim()
        
        let time = ''
        if (pubMatch) {
          try {
            time = new Date(pubMatch[1].trim()).toLocaleString('zh-CN')
          } catch { time = '' }
        }
        
        let source = sourceMatch?.[1]?.replace(/<!\[CDATA\[|\]\]>/g, '').trim() || '未知'
        source = decodeHtmlEntities(source)
        
        if (title && title !== '[Removed]') {
          items.push({ id: url, title, source, url, publishedAt: time })
        }
      }
    }
    
    return items
  } catch (error) {
    console.error('Google News fetch error:', error)
    return []
  }
}

async function summarizeWithAI(news: NewsItem[]): Promise<{
  marketSummary: string
  actionableSignals: string[]
}> {
  const apiKey = getConfig('MINIMAX_API_KEY')
  if (!apiKey) {
    return { marketSummary: '未配置AI API Key，无法生成总结', actionableSignals: [] }
  }

  const topNews = news.slice(0, 8).map((n, i) => `${i + 1}. [${n.source}] ${n.title}`).join('\n')
  const prompt = `你是一个专业的金融新闻分析师。请分析以下今日科技/财经新闻，对每条新闻给出简短的市场影响解读，最后用一段话总结今日市场情绪和关键信号。

新闻列表：
${topNews}

请用JSON格式回复，包含：
- marketSummary: 一段话总结今日市场情绪（50字以内）
- actionableSignals: 有参考价值的新闻及其影响（每条20字以内，用|分隔）

只返回JSON，不要其他内容。格式：
{"marketSummary":"...","actionableSignals":["新闻1→影响1","新闻2→影响2"]}`

  try {
    const res = await fetch('https://api.minimax.chat/v1/text/chatcompletion_v2', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: 'MiniMax-M2',
        messages: [{ role: 'user', content: prompt }],
        max_tokens: 500,
        reasoning_disabled: true
      })
    })
    
    const data = await res.json()
    let content = data?.choices?.[0]?.message?.content || ''
    // MiniMax returns content in reasoning_content when reasoning_disabled=true
    if (!content) {
      content = data?.choices?.[0]?.message?.reasoning_content || ''
    }
    
    // 提取JSON
    const jsonMatch = content.match(/\{[\s\S]*\}/)
    if (jsonMatch) {
      const parsed = JSON.parse(jsonMatch[0])
      return {
        marketSummary: parsed.marketSummary || '',
        actionableSignals: parsed.actionableSignals || []
      }
    }
  } catch (error) {
    console.error('AI summarization error:', error)
  }
  
  return { marketSummary: 'AI总结生成失败', actionableSignals: [] }
}

export async function GET() {
  try {
    const news = await fetchGoogleNews()
    
    const { marketSummary, actionableSignals } = await summarizeWithAI(news)
    
    const response: ApiResponse<{
      news: NewsItem[]
      marketSummary: string
      actionableSignals: string[]
    }> = {
      success: true,
      data: {
        news,
        marketSummary,
        actionableSignals
      },
      timestamp: new Date().toISOString()
    }
    
    return NextResponse.json(response)
  } catch (error) {
    console.error('News API error:', error)
    return NextResponse.json({
      success: false,
      error: String(error)
    }, { status: 500 })
  }
}
