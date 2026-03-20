import type { CollectionConfig } from 'payload'

export const Comments: CollectionConfig = {
  slug: 'comments',
  admin: {
    defaultColumns: ['post', 'user', 'content', 'createdAt'],
  },
  access: {
    // 誰でも読める
    read: () => true,
    // 認証済みユーザーのみ作成可能
    create: ({ req }) => !!req.user,
    // 自分のコメントのみ更新・削除可能（または管理者）
    update: ({ req }) => !!req.user,
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
    {
      name: 'content',
      type: 'textarea',
      required: true,
      label: 'コメント内容',
    },
  ],
  hooks: {
    beforeChange: [
      async ({ req, data }) => {
        // user を自動的にログインユーザーに設定
        data.user = req.user?.id
        return data
      },
    ],
  },
}