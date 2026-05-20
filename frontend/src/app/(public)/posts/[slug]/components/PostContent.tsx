"use client";

import React from "react";
import dynamic from "next/dynamic";

// Dynamically import the BlockNote editor/viewer with SSR disabled on the client side
const BlockEditor = dynamic(() => import("@/app/admin/posts/components/BlockEditor"), {
  ssr: false,
});

interface PostContentProps {
  content: any;
}

export function PostContent({ content }: PostContentProps) {
  return (
    <BlockEditor
      initialContent={content}
      onChange={() => {}}
      editable={false}
    />
  );
}
