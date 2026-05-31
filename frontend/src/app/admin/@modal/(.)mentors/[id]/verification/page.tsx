import React from "react";
import { VerificationModalClient } from "./VerificationModalClient";

interface PageProps {
  params: Promise<{ id: string }> | { id: string };
  searchParams: Promise<{ url?: string; title?: string }> | { url?: string; title?: string };
}

export default async function Page(props: PageProps) {
  const resolvedSearchParams = await props.searchParams;
  const url = resolvedSearchParams.url;
  const title = resolvedSearchParams.title || "Ảnh Minh Chứng";

  return <VerificationModalClient url={url} title={title} />;
}
