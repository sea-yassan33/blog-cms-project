'use client'

import React, { useCallback } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { useAuth } from '@payloadcms/ui'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'

// ─── ナビリンク定義 ────────────────────────────────────────
// プロジェクトの collections/ に合わせて編集してください
const NAV_LINKS = [
  { label: 'Dashboard', href: '/admin', exact: true },
] as const

const COLLECTION_LINKS = [
  { label: 'Posts', href: '/admin/collections/posts' },
  { label: 'Comments', href: '/admin/collections/comments' },
  { label: 'Likes', href: '/admin/collections/likes' },
  { label: 'Media', href: '/admin/collections/media' },
  { label: 'Users', href: '/admin/collections/users' },
] as const

// ─── ドットカラーマップ ────────────────────────────────────
const DOT_COLORS: Record<string, string> = {
  posts: '#6366f1',
  comments: '#22c55e',
  likes: '#f59e0b',
  media: '#ec4899',
  users: '#14b8a6',
}

function getDotColor(href: string): string {
  const slug = href.split('/').pop() ?? ''
  return DOT_COLORS[slug] ?? '#94a3b8'
}

// ─── NavItem ─────────────────────────────────────────────
function NavItem({
  href,
  label,
  dot,
  exact = false,
}: {
  href: string
  label: string
  dot?: string
  exact?: boolean
}) {
  const pathname = usePathname()
  const isActive = exact ? pathname === href : pathname.startsWith(href)

  return (
    <Link
      href={href}
      className={cn(
        'flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm transition-colors',
        isActive
          ? 'bg-accent text-accent-foreground font-medium'
          : 'text-muted-foreground hover:text-foreground hover:bg-accent/50',
      )}
    >
      {dot && (
        <span
          className="w-2 h-2 rounded-full flex-shrink-0"
          style={{ backgroundColor: dot }}
        />
      )}
      {label}
    </Link>
  )
}

// ─── メインコンポーネント ─────────────────────────────────
export default function CustomNav() {
  const { user, logOut } = useAuth()
  const router = useRouter()

  const handleLogout = useCallback(async () => {
    try {
      await logOut()
      router.push('/admin/login')
    } catch {
      // logOut が内部でリダイレクトする場合もあるためエラーは無視
    }
  }, [logOut, router])

  // ユーザーのイニシャル生成
  const initials = user?.email
    ? user.email.slice(0, 2).toUpperCase()
    : 'AD'

  return (
    <nav className="flex flex-col h-full w-[220px] border-r border-border bg-background px-3 py-4 shrink-0">

      {/* プロジェクト名 */}
      <div className="px-3 mb-4">
        <p className="text-sm font-semibold text-foreground leading-tight">My Project</p>
        <p className="text-xs text-muted-foreground mt-0.5">Content Management</p>
      </div>

      <Separator className="mb-3" />

      {/* Main */}
      <p className="px-3 mb-1 text-[10px] font-semibold uppercase tracking-widest text-muted-foreground/70">
        Main
      </p>
      <div className="space-y-0.5 mb-4">
        {NAV_LINKS.map((link) => (
          <NavItem key={link.href} href={link.href} label={link.label} exact={link.exact} />
        ))}
      </div>

      {/* Collections */}
      <p className="px-3 mb-1 text-[10px] font-semibold uppercase tracking-widest text-muted-foreground/70">
        Collections
      </p>
      <div className="space-y-0.5 flex-1">
        {COLLECTION_LINKS.map((link) => (
          <NavItem
            key={link.href}
            href={link.href}
            label={link.label}
            dot={getDotColor(link.href)}
          />
        ))}
      </div>

      <Separator className="my-3" />

      {/* ユーザー情報 & ログアウト */}
      <div className="space-y-2">
        <div className="flex items-center gap-2.5 px-2 py-1.5">
          <div className="w-7 h-7 rounded-full bg-violet-500 flex items-center justify-center flex-shrink-0">
            <span className="text-[10px] font-semibold text-white">{initials}</span>
          </div>
          <div className="min-w-0">
            <p className="text-xs font-medium text-foreground truncate">
              {user?.email ?? 'Admin'}
            </p>
            <p className="text-[10px] text-muted-foreground">Administrator</p>
          </div>
        </div>

        <Button
          variant="ghost"
          size="sm"
          onClick={handleLogout}
          className="w-full justify-start text-muted-foreground hover:text-destructive hover:bg-destructive/10 px-3 text-xs"
        >
          {/* ログアウトアイコン (lucide不要のインラインSVG) */}
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="mr-2 flex-shrink-0"
          >
            <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
            <polyline points="16 17 21 12 16 7" />
            <line x1="21" y1="12" x2="9" y2="12" />
          </svg>
          ログアウト
        </Button>
      </div>
    </nav>
  )
}
