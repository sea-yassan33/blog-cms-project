import { notFound } from "next/navigation";
import { getPayload } from "payload";
import configPromise from "@payload-config";
import Header from '@/components/home/Header'
import { PageClient } from "./page.client";

type Props = {
  params: Promise<{
    slug: string;
  }>;
  searchParams: Promise<{
    preview?: string;
  }>;
};

export default async function Article({ params, searchParams }: Props) {
  const { slug } = await params;
  const { preview } = await searchParams;

  const payload = await getPayload({ config: configPromise });

  const result = await payload.find({
    collection: "articles",
    where: {
      slug: {
        equals: slug,
      },
    },
    draft: preview === "true",
    limit: 1,
  });

  const article = result.docs?.[0];

  if (!article) {
    return notFound();
  }

  return (
    <>
    <Header />
    <PageClient
      initialData={article}
      serverURL={process.env.NEXT_PUBLIC_SERVER_URL || ""}
      />
    </>
  );
}