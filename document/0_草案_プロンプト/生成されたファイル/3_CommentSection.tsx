'use client'

import { useState } from 'react'

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
        // 新しいコメントをリストの末尾に追加（古い順）
        setComments((prev) => [...prev, data.comment])
        setContent('')
      } else {
        const data = await res.json()
        setError(data.error || 'エラーが発生しました')
      }
    } finally {
      setLoading(false)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    // Ctrl+Enter または Cmd+Enter で送信
    if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
      handleSubmit()
    }
  }

  return (
    <div className="mt-2">
      {/* コメントセクションヘッダー */}
      <div className="bg-white rounded border border-[#dfe1e6] overflow-hidden">
        <div className="border-b border-[#dfe1e6] px-5 py-3 flex items-center gap-2">
          {/* コメントアイコン */}
          <svg className="w-4 h-4 text-[#5e6c84]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
          <h2 className="text-sm font-bold text-[#172b4d]">
            コメント
            <span className="ml-2 inline-flex items-center justify-center w-5 h-5 rounded-full bg-[#dfe1e6] text-[#5e6c84] text-[10px] font-bold">
              {comments.length}
            </span>
          </h2>
        </div>

        {/* コメント一覧 */}
        <div>
          {comments.length === 0 ? (
            <div className="px-5 py-8 text-center">
              <svg className="w-8 h-8 text-[#c1c7d0] mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
              <p className="text-sm text-[#97a0af]">まだコメントがありません。</p>
              <p className="text-xs text-[#c1c7d0] mt-1">最初のコメントを投稿してみましょう。</p>
            </div>
          ) : (
            <div>
              {comments.map((comment, index) => (
                <div
                  key={comment.id}
                  className={`flex gap-3 px-5 py-4 ${
                    index !== comments.length - 1 ? 'border-b border-[#f4f5f7]' : ''
                  } hover:bg-[#fafbfc] transition-colors`}
                >
                  {/* アバター */}
                  <div className="flex-shrink-0 mt-0.5">
                    <div className="w-8 h-8 rounded-full bg-[#0052cc] flex items-center justify-center text-white text-xs font-bold shadow-sm">
                      {comment.userName?.charAt(0)?.toUpperCase() || '?'}
                    </div>
                  </div>

                  {/* コメント本体 */}
                  <div className="flex-1 min-w-0">
                    {/* ヘッダー行 */}
                    <div className="flex items-baseline gap-2 mb-1.5 flex-wrap">
                      <span className="text-sm font-semibold text-[#172b4d]">{comment.userName}</span>
                      <span className="text-xs text-[#97a0af]">
                        {new Date(comment.createdAt).toLocaleDateString('ja-JP', {
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </span>
                      {/* 番号バッジ */}
                      <span className="ml-auto text-[10px] text-[#c1c7d0] font-mono">
                        #{index + 1}
                      </span>
                    </div>
                    {/* コメント内容 */}
                    <div className="bg-[#f4f5f7] rounded px-3 py-2.5 text-sm text-[#172b4d] leading-relaxed whitespace-pre-wrap">
                      {comment.content}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* コメント投稿フォーム */}
        <div className="border-t border-[#dfe1e6] bg-[#fafbfc] px-5 py-4">
          <div className="flex gap-3">
            {/* 自分のアバター（プレースホルダー） */}
            <div className="flex-shrink-0 mt-0.5">
              <div className="w-8 h-8 rounded-full bg-[#6b778c] flex items-center justify-center text-white text-xs font-bold">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <circle cx="12" cy="8" r="4" strokeWidth="2"/>
                  <path d="M4 20c0-4 3.6-7 8-7s8 3 8 7" strokeWidth="2" strokeLinecap="round"/>
                </svg>
              </div>
            </div>

            <div className="flex-1">
              <p className="text-xs text-[#97a0af] mb-2">
                ※ コメントは登録ユーザーのみ投稿できます（
                <a
                  href="/admin"
                  className="text-[#0052cc] hover:underline"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  管理画面でログイン
                </a>
                ）
              </p>
              <textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="コメントを追加... (Ctrl+Enter で送信)"
                rows={3}
                className="w-full text-sm text-[#172b4d] placeholder-[#c1c7d0] bg-white border border-[#dfe1e6] rounded px-3 py-2 resize-none
                  focus:outline-none focus:border-[#4c9aff] focus:ring-2 focus:ring-[#4c9aff]/20 transition-all"
              />
              {error && (
                <div className="mt-2 flex items-start gap-2 p-2.5 bg-[#ffebe6] border border-[#ff8f73] rounded text-xs text-[#bf2600]">
                  <svg className="w-3.5 h-3.5 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd"/>
                  </svg>
                  {error}
                </div>
              )}
              <div className="flex items-center justify-between mt-2">
                <p className="text-[10px] text-[#c1c7d0]">Ctrl+Enter で送信</p>
                <button
                  onClick={handleSubmit}
                  disabled={loading || !content.trim()}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded text-xs font-semibold transition-all
                    bg-[#0052cc] text-white hover:bg-[#0065ff] active:bg-[#0747a6]
                    disabled:bg-[#c1c7d0] disabled:cursor-not-allowed disabled:text-white
                    focus:outline-none focus:ring-2 focus:ring-[#4c9aff]/50"
                >
                  {loading ? (
                    <>
                      <svg className="w-3 h-3 animate-spin" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/>
                      </svg>
                      送信中...
                    </>
                  ) : (
                    <>
                      <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path d="M22 2L11 13M22 2L15 22l-4-9-9-4 20-7z" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                      コメントを追加
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
