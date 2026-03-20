import { NextRequest, NextResponse } from 'next/server'
import { getPayload } from 'payload'
import config from '@payload-config'

export async function POST(req: NextRequest) {
  const payload = await getPayload({ config })
  const token = req.cookies.get('payload-token')?.value

  if (!token) {
    return NextResponse.json({ error: 'ログインが必要です' }, { status: 401 })
  }

  try {
    const { user } = await payload.auth({
      collection: 'users',
      headers: new Headers({ Authorization: `JWT ${token}` }),
    } as any)

    if (!user) {
      return NextResponse.json({ error: '認証に失敗しました' }, { status: 401 })
    }

    const body = await req.json()
    const { postId, content } = body

    // 修正：文字列 → 数値に変換
    const numericPostId = Number(postId)
    if (isNaN(numericPostId)) {
      return NextResponse.json({ error: '無効な記事IDです' }, { status: 400 })
    }

    if (!content || content.trim().length === 0) {
      return NextResponse.json({ error: 'コメントを入力してください' }, { status: 400 })
    }

    const comment = await payload.create({
      collection: 'comments',
      data: {
        post: numericPostId,
        user: user.id,
        content: content.trim(),
      },
      overrideAccess: false,
      user,
    })

    return NextResponse.json({
      comment: {
        id: comment.id,
        content: comment.content,
        userName: (user as any).name,
        createdAt: comment.createdAt,
      },
    }, { status: 201 })
  } catch (error) {
    return NextResponse.json({ error: 'エラーが発生しました' }, { status: 500 })
  }
}