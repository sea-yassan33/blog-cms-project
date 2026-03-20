'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent } from '@/components/ui/card'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'

interface Comment {
  id: string
  content: string
  userName: string
  createdAt: string
}

interface CommentSectionProps {
  postId: string
  initialComments: Comment[]
}

export function CommentSection({ postId, initialComments }: CommentSectionProps) {
  const [comments, setComments] = useState<Comment[]>(initialComments)
  const [content, setContent] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async () => {
    if (!content.trim() || loading) return
    setLoading(true)
    setError('')

    try {
      const res = await fetch('/api/comments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ postId, content }),
      })

      if (res.status === 401) {
        setError('コメントするにはログインが必要です。管理画面（/admin）からログインしてください。')
        return
      }

      if (res.ok) {
        const data = await res.json()
        setComments((prev) => [data.comment, ...prev])
        setContent('')
      } else {
        const data = await res.json()
        setError(data.error || 'エラーが発生しました')
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <section className="mt-10">
      <h2 className="text-xl font-bold mb-4">コメント ({comments.length})</h2>

      {/* コメント投稿フォーム */}
      <div className="mb-6 p-4 border rounded-lg bg-white">
        <p className="text-sm text-gray-500 mb-2">
          ※ コメントは登録ユーザーのみ投稿できます（
          <a href="/admin" className="text-blue-600 underline" target="_blank">
            管理画面でログイン
          </a>
          ）
        </p>
        <Textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="コメントを書く..."
          className="mb-2"
          rows={3}
        />
        {error && <p className="text-red-500 text-sm mb-2">{error}</p>}
        <Button
          onClick={handleSubmit}
          disabled={loading || !content.trim()}
          size="sm"
        >
          {loading ? '送信中...' : 'コメントを投稿'}
        </Button>
      </div>

      {/* コメント一覧 */}
      {comments.length === 0 ? (
        <p className="text-gray-500 text-sm">まだコメントがありません。</p>
      ) : (
        <div className="space-y-4">
          {comments.map((comment) => (
            <Card key={comment.id}>
              <CardContent className="pt-4">
                <div className="flex items-start gap-3">
                  <Avatar className="w-8 h-8">
                    <AvatarFallback className="text-sm">
                      {comment.userName?.charAt(0)?.toUpperCase() || '?'}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-semibold text-sm">{comment.userName}</span>
                      <span className="text-xs text-gray-400">
                        {new Date(comment.createdAt).toLocaleDateString('ja-JP', {
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </span>
                    </div>
                    <p className="text-gray-700 text-sm whitespace-pre-wrap">{comment.content}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </section>
  )
}