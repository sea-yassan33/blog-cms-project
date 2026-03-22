import type { CollectionConfig } from "payload";

export const Pages: CollectionConfig = {
  slug: "pages",
  admin: {
    useAsTitle: "title",
    livePreview: {
      url: ({ data }) =>
        `${process.env.NEXT_PUBLIC_SERVER_URL}/pages/${data?.slug}`,
    },
  },
  fields: [
    {
      name: "title",
      type: "text",
      required: true,
      label: "タイトル",
    },
    {
      name: "slug",
      type: "text",
      required: true,
      unique: true,
      label: "スラッグ",
      admin: {
        description: "URLに使用されます（例: about, contact）",
      },
    },
    {
      name: "content",
      type: "textarea",
      label: "コンテンツ（JSX/HTML）",
      admin: {
        description: "HTMLタグやJSXに近い構造で入力してください",
        rows: 20,
      },
    },
    {
      name: "description",
      type: "textarea",
      label: "説明文",
    },
    {
      name: "publishedAt",
      type: "date",
      label: "公開日",
    },
    {
      name: "_status",
      type: "select",
      options: [
        { label: "下書き", value: "draft" },
        { label: "公開", value: "published" },
      ],
      defaultValue: "draft",
      label: "ステータス",
    },
  ],
};