import { NextRequest, NextResponse } from 'next/server'

interface NewsItem {
  id: string
  title: string
  source: string
  url: string
  time: string
  sentiment: 'positive' | 'negative' | 'neutral'
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
    const res = await fetch('https://news.google.com/rss?topic=technology&hl=zh-CN&gl=CN&ceid=CN:zh-Hans')
    if (!res.ok) throw new Error('Google News error')
    const text = await res.text()
    
    const items: NewsItem[] = []
    
    // Match item blocks - find all <item>...</item>
    const itemRegex = /<item(?:s[^>]*)?>([\s\S]*?)<\/item>/gi
    let match
    
    while ((match = itemRegex.exec(text)) !== null && items.length < 30) {
      const block = match[1]
      
      // Extract title - handle CDATA
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
          } catch { time = pubMatch[1].trim() }
        }
        
        let source = 'Google News'
        if (sourceMatch) {
          source = decodeHtmlEntities(sourceMatch[1].replace(/<[^>]+>/g, '').trim())
        }
        
        items.push({
          id: url.substring(0, 50),
          title,
          source,
          url: url || '#',
          time,
          sentiment: 'neutral',
        })
      }
    }
    
    return items
  } catch (e) {
    console.error('Google News error:', e)
    return []
  }
}

async function fetchCryptoNews(): Promise<NewsItem[]> {
  try {
    const res = await fetch('https://min-api.cryptocompare.com/data/v2/news/?lang=EN')
    if (!res.ok) throw new Error('CryptoCompare API error')
    const data = await res.json()
    const newsData = data.Data || []
    return newsData.slice(0, 20).map((item: any) => ({
      id: String(item.id || Math.random()),
      title: item.title || '无标题',
      source: item.source_info?.name || item.source || '未知来源',
      url: item.url || '#',
      time: item.published_on ? new Date(item.published_on * 1000).toLocaleString('zh-CN') : '',
      sentiment: 'neutral',
    }))
  } catch (e) {
    console.error('CryptoCompare error:', e)
    return []
  }
}

export async function GET(request: NextRequest) {
  try {
    const type = request.nextUrl.searchParams.get('type') || 'all'
    
    let news: NewsItem[] = []
    
    if (type === 'all' || type === 'general') {
      const [googleNews, cryptoNews] = await Promise.all([
        fetchGoogleNews(),
        fetchCryptoNews(),
      ])
      news = [...googleNews, ...cryptoNews]
    } else if (type === 'crypto') {
      news = await fetchCryptoNews()
    }
    
    news.sort((a, b) => new Date(b.time).getTime() - new Date(a.time).getTime())
    
    const seen = new Set<string>()
    news = news.filter(item => {
      const key = item.title.substring(0, 50)
      if (seen.has(key)) return false
      seen.add(key)
      return true
    }).slice(0, 30)
    
    return NextResponse.json({
      success: true,
      data: news,
      timestamp: new Date().toISOString(),
    } as ApiResponse<NewsItem[]>)
  } catch (error) {
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : '未知错误',
      timestamp: new Date().toISOString(),
    } as ApiResponse<null>, { status: 500 })
  }
}
