import axios from 'axios'
import { GitHubTrendingRepo } from '@/types'

const GITHUB_API_BASE = 'https://api.github.com'

export class GitHubClient {
  private token: string

  constructor(token: string) {
    this.token = token
  }

  async getTrendingRepositories(): Promise<GitHubTrendingRepo[]> {
    try {
      // 使用 GitHub API 获取过去24小时内创建的高星项目
      const response = await axios.get(
        `${GITHUB_API_BASE}/search/repositories?q=created:>${this.getYesterdayDate()}&sort=stars&order=desc&per_page=10`,
        {
          headers: {
            Authorization: `token ${this.token}`,
            Accept: 'application/vnd.github.v3+json',
          },
        }
      )

      return response.data.items.map((item: any) => ({
        name: item.name,
        url: item.html_url,
        description: item.description,
        language: item.language,
        stars: item.stargazers_count,
        starsIncrease: item.stargazers_count, // 实际需要追踪历史数据
        forks: item.forks_count,
        tags: this.extractTags(item),
      }))
    } catch (error) {
      console.error('Failed to fetch GitHub trending repositories:', error)
      throw new Error('GitHub API 请求失败')
    }
  }

  private getYesterdayDate(): string {
    const yesterday = new Date()
    yesterday.setDate(yesterday.getDate() - 1)
    return yesterday.toISOString().split('T')[0]
  }

  private extractTags(repo: any): string[] {
    const tags: string[] = []

    if (repo.topics?.length > 0) {
      tags.push(...repo.topics)
    }

    // 基于语言和描述推断标签
    if (
      repo.language === 'Python' ||
      repo.description?.toLowerCase().includes('ai') ||
      repo.description?.toLowerCase().includes('machine learning')
    ) {
      tags.push('AI')
    }

    if (
      repo.description?.toLowerCase().includes('web3') ||
      repo.description?.toLowerCase().includes('blockchain') ||
      repo.description?.toLowerCase().includes('crypto')
    ) {
      tags.push('Web3')
    }

    if (
      repo.description?.toLowerCase().includes('infrastructure') ||
      repo.description?.toLowerCase().includes('framework')
    ) {
      tags.push('Infra')
    }

    return [...new Set(tags)].slice(0, 5)
  }
}

export default GitHubClient
