import React from "react";
import Link from "next/link";
import { Icon, Button } from "@/core/ui";

interface PageProps {
  params: Promise<{ id: string }> | { id: string };
  searchParams: Promise<{ url?: string; title?: string }> | { url?: string; title?: string };
}

export default async function VerificationPage(props: PageProps) {
  const resolvedParams = await props.params;
  const resolvedSearchParams = await props.searchParams;
  const id = resolvedParams.id;
  const url = resolvedSearchParams.url;
  const title = resolvedSearchParams.title || "Ảnh Minh Chứng";

  return (
    <div className="min-h-[80vh] flex flex-col items-center justify-center p-8 space-y-6">
      <div className="max-w-2xl w-full bg-white rounded-[32px] border border-slate-100 p-8 shadow-sm text-center space-y-6">
        <h3 className="text-xl font-bold text-slate-800">{title}</h3>
        <div className="bg-slate-50 p-6 rounded-2xl flex items-center justify-center border border-slate-100">
          {url ? (
            <img
              src={url}
              alt={title}
              className="max-h-[60vh] w-auto object-contain rounded-xl shadow-md bg-white"
            />
          ) : (
            <p className="text-sm text-slate-400 font-semibold py-8">Không tìm thấy ảnh minh chứng.</p>
          )}
        </div>
        <Link href={`/admin/mentors/${id}`}>
          <Button
            label="Quay lại chi tiết ứng tuyển"
            variant="outline"
            iconLeft={<Icon name="ArrowLeft" size={16} />}
            className="!px-6 !py-2.5 !rounded-xl w-full"
          />
        </Link>
      </div>
    </div>
  );
}
