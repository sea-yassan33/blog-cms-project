import type { CollectionConfig } from 'payload'

export const Likes: CollectionConfig = {
  slug: 'likes',
  access: {
    // 誰でも読める（件数取得のため）
    read: () => true,
    // 認証済みユーザーのみ作成可能
    create: ({ req }) => !!req.user,
    // 自分のイイねのみ削除可能
    delete: ({ req }) => !!req.user,
  },
  fields: [
    {
      name: 'post',
      type: 'relationship',
      relationTo: 'posts',
      required: true,
      label: '記事',
    },
    {
      name: 'user',
      type: 'relationship',
      relationTo: 'users',
      required: true,
      label: 'ユーザー',
    },
  ],
  // 同じユーザーが同じ記事に複数イイねできないように hooks で制御
  hooks: {
    beforeChange: [
      async ({ req, data, operation }) => {
        if (operation === 'create') {
          const existing = await req.payload.find({
            collection: 'likes',
            where: {
              and: [
                { post: { equals: data.post } },
                { user: { equals: req.user?.id } },
              ],
            },
          })
          if (existing.totalDocs > 0) {
            throw new Error('すでにイイねしています')
          }
          // user を自動的にログインユーザーに設定
          data.user = req.user?.id
        }
        return data
      },
    ],
  },
}