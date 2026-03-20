import { NextRequest, NextResponse } from 'next/server'
import { getPayload } from 'payload'
import config from '@payload-config'

// イイね追加
export async function POST(req: NextRequest) {
  const payload = await getPayload({ config })

  // JWT トークンの取得
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
    const { postId } = body

    // 修正：文字列 → 数値に変換
    const numericPostId = Number(postId)
    if (isNaN(numericPostId)) {
      return NextResponse.json({ error: '無効な記事IDです' }, { status: 400 })
    }

    // 既存のイイねを確認
    const existing = await payload.find({
      collection: 'likes',
      where: {
        and: [
          { post: { equals: numericPostId } },
          { user: { equals: user.id } },
        ],
      },
    })

    if (existing.totalDocs > 0) {
      return NextResponse.json({ error: 'すでにイイねしています' }, { status: 400 })
    }

    const like = await payload.create({
      collection: 'likes',
      data: { post: numericPostId, user: user.id },
      overrideAccess: false,
      user,
    })

    return NextResponse.json({ like }, { status: 201 })
  } catch (error) {
    console.error('likes POST error:', error) 
    return NextResponse.json({ error: 'エラーが発生しました' }, { status: 500 })
  }
}

// イイね削除
export async function DELETE(req: NextRequest) {
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

    const { searchParams } = new URL(req.url)
    const postId = searchParams.get('postId')

    // 修正：文字列 → 数値に変換
    const numericPostId = Number(postId)
    if (isNaN(numericPostId)) {
      return NextResponse.json({ error: '無効な記事IDです' }, { status: 400 })
    }

    const existing = await payload.find({
      collection: 'likes',
      where: {
        and: [
          { post: { equals: numericPostId } },
          { user: { equals: user.id } },
        ],
      },
    })

    if (existing.totalDocs === 0) {
      return NextResponse.json({ error: 'イイねが見つかりません' }, { status: 404 })
    }

    await payload.delete({
      collection: 'likes',
      id: existing.docs[0].id,
      overrideAccess: false,
      user,
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('likes POST error:', error) 
    return NextResponse.json({ error: 'エラーが発生しました' }, { status: 500 })
  }
}