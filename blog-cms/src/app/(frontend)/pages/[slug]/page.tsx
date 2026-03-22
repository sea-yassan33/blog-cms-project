import { notFound } from "next/navigation";
import { getPayload } from "payload";
import configPromise from "@payload-config";
import { PageClient } from "./page.client";

type Props = {
  params: Promise<{
    slug: string;
  }>;
  searchParams: Promise<{
    preview?: string;
  }>;
};

export default async function Page({ params, searchParams }: Props) {
  const { slug } = await params;
  const { preview } = await searchParams;

  const payload = await getPayload({ config: configPromise });

  const result = await payload.find({
    collection: "pages",
    where: {
      slug: {
        equals: slug,
      },
    },
    draft: preview === "true",
    limit: 1,
  });

  const page = result.docs?.[0];

  if (!page) {
    return notFound();
  }

  return (
    <PageClient
      initialData={page}
      serverURL={process.env.NEXT_PUBLIC_SERVER_URL || ""}
    />
  );
}