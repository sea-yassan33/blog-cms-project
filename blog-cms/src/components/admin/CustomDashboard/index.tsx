'use client'

import React, { useEffect, useState } from 'react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'

// ─── 型定義 ──────────────────────────────────────────────
interface StatCard {
  label: string
  value: string | number
  sub: string
  subHighlight?: string
}

interface ActivityItem {
  id: string
  color: string
  text: string
  time: string
}

interface CollectionItem {
  name: string
  count: number
  href: string
}

// ─── 定数（必要に応じてAPIから取得に変更） ──────────────────
const ACTIVITY_ITEMS: ActivityItem[] = [
  { id: '1', color: '#6366f1', text: 'New post published: "Getting started"', time: '2 minutes ago' },
  { id: '2', color: '#22c55e', text: 'User tanaka@example.com registered', time: '1 hour ago' },
  { id: '3', color: '#f59e0b', text: 'Media upload: hero-image.webp', time: '3 hours ago' },
  { id: '4', color: '#ec4899', text: 'Draft saved: "Release notes v2.0"', time: 'Yesterday' },
]

const COLLECTIONS: CollectionItem[] = [
  { name: 'Posts', count: 128, href: '/admin/collections/posts' },
  { name: 'Users', count: 47, href: '/admin/collections/users' },
  { name: 'Media', count: 304, href: '/admin/collections/media' },
  { name: 'Comments', count: 52, href: '/admin/collections/comments' },
]

// ─── サブコンポーネント ───────────────────────────────────
function StatCardItem({ label, value, sub, subHighlight }: StatCard) {
  return (
    <Card className="bg-muted/40 border-border/60 shadow-none">
      <CardContent className="pt-5 pb-5 px-5">
        <p className="text-sm text-muted-foreground mb-1">{label}</p>
        <p className="text-4xl font-semibold tracking-tight text-foreground">{value}</p>
        <p className="text-sm text-muted-foreground mt-2">
          {subHighlight && (
            <span className="text-emerald-600 font-medium mr-1">{subHighlight}</span>
          )}
          {sub}
        </p>
      </CardContent>
    </Card>
  )
}

// ─── メインコンポーネント ─────────────────────────────────
export default function CustomDashboard() {
  const [stats, setStats] = useState({
    posts: 128,
    users: 47,
    media: 304,
    drafts: 6,
  })

  // 実際のAPIからデータを取得する場合はここを有効化
  // useEffect(() => {
  //   Promise.all([
  //     fetch('/api/posts?limit=0&where[_status][equals]=published').then(r => r.json()),
  //     fetch('/api/users?limit=0').then(r => r.json()),
  //     fetch('/api/media?limit=0').then(r => r.json()),
  //     fetch('/api/posts?limit=0&where[_status][equals]=draft').then(r => r.json()),
  //   ]).then(([p, u, m, d]) => {
  //     setStats({
  //       posts: p.totalDocs ?? 0,
  //       users: u.totalDocs ?? 0,
  //       media: m.totalDocs ?? 0,
  //       drafts: d.totalDocs ?? 0,
  //     })
  //   })
  // }, [])

  const statCards: StatCard[] = [
    { label: 'Total Posts', value: stats.posts, subHighlight: '+12', sub: 'this month' },
    { label: 'Users', value: stats.users, subHighlight: '+3', sub: 'this week' },
    { label: 'Media Files', value: stats.media, sub: '89 MB used' },
    { label: 'Drafts', value: stats.drafts, sub: 'awaiting review' },
  ]

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-5xl mx-auto px-8 py-8">

        {/* ヘッダー */}
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-4xl font-semibold tracking-tight text-foreground">
            Dashboard
          </h1>
          <div className="flex items-center gap-3">
            <Badge
              variant="secondary"
              className="px-4 py-1.5 text-sm font-normal rounded-full bg-violet-100 text-violet-700 border-violet-200"
            >
              Admin Panel
            </Badge>
            <Button
              variant="outline"
              className="rounded-xl px-5 font-normal border-border/80 shadow-none"
              onClick={() => window.location.href = '/admin/collections/posts/create'}
            >
              + New Post
            </Button>
          </div>
        </div>

        {/* スタッツカード */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          {statCards.map((card) => (
            <StatCardItem key={card.label} {...card} />
          ))}
        </div>

        {/* 下段：アクティビティ + コレクション */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">

          {/* Recent Activity */}
          <Card className="bg-muted/40 border-border/60 shadow-none">
            <CardHeader className="pb-3 pt-5 px-5">
              <CardTitle className="text-base font-medium text-foreground">
                Recent Activity
              </CardTitle>
            </CardHeader>
            <CardContent className="px-5 pb-5">
              <div className="space-y-0">
                {ACTIVITY_ITEMS.map((item, i) => (
                  <div key={item.id}>
                    <div className="flex items-start gap-3 py-3">
                      <span
                        className="mt-1.5 w-2.5 h-2.5 rounded-full flex-shrink-0"
                        style={{ backgroundColor: item.color }}
                      />
                      <div>
                        <p className="text-sm text-foreground leading-snug">{item.text}</p>
                        <p className="text-xs text-muted-foreground mt-1">{item.time}</p>
                      </div>
                    </div>
                    {i < ACTIVITY_ITEMS.length - 1 && (
                      <Separator className="opacity-60" />
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Collections */}
          <Card className="bg-muted/40 border-border/60 shadow-none">
            <CardHeader className="pb-3 pt-5 px-5">
              <CardTitle className="text-base font-medium text-foreground">
                Collections
              </CardTitle>
            </CardHeader>
            <CardContent className="px-5 pb-5">
              <div className="space-y-0">
                {COLLECTIONS.map((col, i) => (
                  <div key={col.name}>
                    <a
                      href={col.href}
                      className="flex items-center justify-between py-3 group"
                    >
                      <span className="text-sm font-medium text-foreground group-hover:text-primary transition-colors">
                        {col.name}
                      </span>
                      <div className="flex items-center gap-3">
                        <span className="text-sm text-muted-foreground">
                          {col.count} documents
                        </span>
                        <span className="text-muted-foreground/50 text-sm">›</span>
                      </div>
                    </a>
                    {i < COLLECTIONS.length - 1 && (
                      <Separator className="opacity-60" />
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

        </div>
      </div>
    </div>
  )
}
