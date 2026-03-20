import type { CollectionConfig } from 'payload'

export const Users: CollectionConfig = {
  slug: 'users',
  admin: {
    useAsTitle: 'email',
  },
  auth: true, // 認証機能を有効化
  fields: [
    {
      name: 'name',
      type: 'text',
      required: true,
      label: '表示名',
    },
  ],
}
