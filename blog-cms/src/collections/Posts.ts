import type { CollectionConfig } from 'payload'

export const Posts: CollectionConfig = {
  slug: 'posts',
  admin: {
    useAsTitle: 'title',
    defaultColumns: ['title', 'status', 'publishedAt', 'updatedAt'],
  },
  access: {
    // 公開記事は誰でも読める
    read: ({ req }) => {
      if (req.user) return true
      return {
        status: {
          equals: 'published',
        },
      }
    },
    // 作成・更新・削除は認証済みユーザーのみ
    create: ({ req }) => !!req.user,
    update: ({ req }) => !!req.user,
    delete: ({ req }) => !!req.user,
  },
  fields: [
    {
      name: 'title',
      type: 'text',
      required: true,
      label: 'タイトル',
    },
    {
      name: 'slug',
      type: 'text',
      required: true,
      unique: true,
      label: 'スラッグ（URL）',
      admin: {
        description: '例: my-first-post',
      },
    },
    {
      name: 'excerpt',
      type: 'textarea',
      label: '概要',
    },
    {
      name: 'content',
      type: 'richText',
      label: '本文',
      required: true,
    },
    {
      name: 'thumbnail',
      type: 'upload',
      relationTo: 'media',
      label: 'サムネイル',
    },
    {
      name: 'status',
      type: 'select',
      options: [
        { label: '下書き', value: 'draft' },
        { label: '公開', value: 'published' },
      ],
      defaultValue: 'draft',
      required: true,
      label: 'ステータス',
    },
    {
      name: 'publishedAt',
      type: 'date',
      label: '公開日時',
      admin: {
        date: {
          pickerAppearance: 'dayAndTime',
        },
      },
    },
    {
      name: 'author',
      type: 'relationship',
      relationTo: 'users',
      label: '著者',
    },
  ],
}