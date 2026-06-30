"use client";

import { useTranslations } from 'next-intl';
import React, { useState } from "react";
import { Button, Icon } from "@/core/ui";
import { deletePostAction } from "../actions/posts";
import { useRouter } from "next/navigation";

interface DeletePostButtonProps {
  postId: string;
}

export function DeletePostButton({ postId }: DeletePostButtonProps) {
  const tExtracted = useTranslations('Extracted.appAdminPostsComponentsDeletePostButton');
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleDelete = async () => {
    if (!confirm(tExtracted('areYouSureYouWantToDeleteThis'))) return;

    setIsLoading(true);
    try {
      await deletePostAction(postId);
      router.refresh(); // Làm mới trang server component để cập nhật danh sách
    } catch (error) {
      console.error("Failed to delete post:", error);
      alert(tExtracted('errorDeletingPost'));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Button
      variant="text"
      label={<Icon name="Trash2" size={16} />}
      className="!p-2 text-slate-400 hover:text-red-500"
      loading={isLoading}
      onClick={handleDelete}
    />
  );
}
