import { getMonthLabel } from '@/components/function/getMonthLabel'

export function groupByMonth(posts: any[]): Record<string, any[]> {
  const groups: Record<string, any[]> = {}
  for (const post of posts) {
    const label = getMonthLabel(post.createdAt)
    if (!groups[label]) groups[label] = []
    groups[label].push(post)
  }
  return groups
}