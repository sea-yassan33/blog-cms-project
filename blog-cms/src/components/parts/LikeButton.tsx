'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Heart } from 'lucide-react'

interface LikeButtonProps {
  postId: string
  initialCount: number
}

export function LikeButton({ postId, initialCount }: LikeButtonProps) {
  const [count, setCount] = useState(initialCount)
  const [liked, setLiked] = useState(false)
  const [loading, setLoading] = useState(false)

  const handleLike = async () => {
    if (loading) return
    setLoading(true)

    try {
      if (!liked) {
        const res = await fetch('/api/likes', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ postId }),
        })
        if (res.status === 401) {
          alert('イイねするにはログインが必要です。\n管理画面（/admin）からログインしてください。')
          return
        }
        if (res.ok) {
          setCount((c) => c + 1)
          setLiked(true)
        } else {
          const data = await res.json()
          alert(data.error || 'エラーが発生しました')
        }
      } else {
        const res = await fetch(`/api/likes?postId=${postId}`, {
          method: 'DELETE',
        })
        if (res.ok) {
          setCount((c) => c - 1)
          setLiked(false)
        }
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex items-center gap-2 my-6 p-4 border rounded-lg bg-white">
      <Button
        variant={liked ? 'default' : 'outline'}
        size="sm"
        onClick={handleLike}
        disabled={loading}
        className="flex items-center gap-1"
      >
        <Heart className={`w-4 h-4 ${liked ? 'fill-current' : ''}`} />
        イイね {count > 0 && <span className="ml-1 font-bold">{count}</span>}
      </Button>
      {liked && <span className="text-sm text-gray-500">イイねしました！</span>}
    </div>
  )
}