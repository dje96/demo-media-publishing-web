import { allArticles } from './data'
import { Article } from './config'

export function getRecommendations(count: number = 4): Article[] {
  return allArticles.slice(0, count)
} 