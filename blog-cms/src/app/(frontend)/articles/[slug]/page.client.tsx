"use client";

import { useLivePreview } from "@/hooks/useLivePreview";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import type { Article } from "@/payload-types";
import type { SerializedEditorState } from 'lexical'
import { RichText } from '@/components/parts/richText'

type Props = {
  initialData: Article;
  serverURL: string;
};

export function PageClient({ initialData, serverURL }: Props) {
  const { data } = useLivePreview<Article>({
    initialData,
    serverURL,
  });

  return (
    <main className="max-w-3xl mx-auto px-4 py-12">
      <div className="mb-4 flex items-center gap-2">
        <Badge
          variant={data._status === "published" ? "default" : "secondary"}
        >
          {data._status === "published" ? "公開中" : "下書き"}
        </Badge>
        {data.publishedAt && (
          <span className="text-sm text-muted-foreground">
            {new Date(data.publishedAt).toLocaleDateString("ja-JP")}
          </span>
        )}
      </div>

      <h1 className="text-4xl font-bold mb-4 tracking-tight">{data.title}</h1>

      {data.description && (
        <p className="text-muted-foreground text-lg mb-6">{data.description}</p>
      )}

      <Separator className="mb-8" />

      <div className="prose prose-neutral max-w-none">
        {/* RichText の表示（Lexical エディタのレンダリング） */}
        {data.content && (
          <RichText data={data.content as SerializedEditorState} />
        )}
      </div>
    </main>
  );
}