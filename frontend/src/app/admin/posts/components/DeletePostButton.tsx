"use client";

import React, { useState } from "react";
import { Button, Icon } from "@/core/ui";
import { deletePostAction } from "../actions/posts";
import { useRouter } from "next/navigation";

interface DeletePostButtonProps {
  postId: string;
}

export function DeletePostButton({ postId }: DeletePostButtonProps) {
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleDelete = async () => {
    if (!confirm("Are you sure you want to delete this post?")) return;

    setIsLoading(true);
    try {
      await deletePostAction(postId);
      router.refresh(); // Làm mới trang server component để cập nhật danh sách
    } catch (error) {
      console.error("Failed to delete post:", error);
      alert("Error deleting post");
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
