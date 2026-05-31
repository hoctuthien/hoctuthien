"use client";

import React from "react";
import { Modal } from "@shared";
import { useRouter } from "next/navigation";

interface VerificationModalClientProps {
  url?: string;
  title: string;
}

export function VerificationModalClient({ url, title }: VerificationModalClientProps) {
  const router = useRouter();

  return (
    <Modal
      isOpen={true}
      onClose={() => router.back()}
      title={title}
      containerClassName="max-w-2xl"
    >
      <div className="flex flex-col items-center justify-center p-6 bg-slate-50 rounded-b-[32px] overflow-hidden">
        {url ? (
          <img
            src={url}
            alt={title}
            className="max-h-[70vh] w-auto object-contain rounded-2xl shadow-lg border border-slate-100 bg-white"
          />
        ) : (
          <p className="text-sm text-slate-400 font-semibold py-8">Không tìm thấy ảnh minh chứng.</p>
        )}
      </div>
    </Modal>
  );
}
