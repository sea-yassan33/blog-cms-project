import type { CollectionConfig } from "payload";

export const Articles: CollectionConfig = {
  slug: "articles",
  admin: {
    useAsTitle: "title",
    livePreview: {
      url: ({ data }) =>
        `${process.env.NEXT_PUBLIC_SERVER_URL}/articles/${data?.slug}`,
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
      type: "richText",
      label: "コンテンツ",
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