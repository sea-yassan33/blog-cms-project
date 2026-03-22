"use client";

import { useLivePreview } from "@/hooks/useLivePreview";
import { useEffect, useState } from "react";
import type { Page } from "@/payload-types";
import Header from '@/components/home/Header'
type Props = {
  initialData: Page;
  serverURL: string;
};

export function PageClient({ initialData, serverURL }: Props) {
  const { data } = useLivePreview<Page>({ initialData, serverURL });
  const [sanitizedContent, setSanitizedContent] = useState("");

  useEffect(() => {
    // クライアント側でのみ DOMPurify を動かす
    const loadAndSanitize = async () => {
      const DOMPurify = (await import("dompurify")).default;
      setSanitizedContent(DOMPurify.sanitize(data.content ?? ""));
    };
    loadAndSanitize();
  }, [data.content]);

  return (
    <>
      <Header />
      <main className="max-w-3xl mx-auto px-4 py-12">
        <h1 className="text-4xl font-bold mb-6">{data.title}</h1>
        {sanitizedContent && (
          <div
            className="prose prose-neutral max-w-none"
            dangerouslySetInnerHTML={{ __html: sanitizedContent }}
          />
        )}
      </main>
    </>
  );
}