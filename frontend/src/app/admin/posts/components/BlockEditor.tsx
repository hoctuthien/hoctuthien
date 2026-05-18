"use client";

import React from "react";
import { BlockNoteEditor, PartialBlock } from "@blocknote/core";
import "@blocknote/core/fonts/inter.css";
import { useCreateBlockNote } from "@blocknote/react";
import { BlockNoteView } from "@blocknote/mantine";
import "@blocknote/mantine/style.css";
import { uploadFileAction } from "../actions/upload";

interface BlockEditorProps {
  initialContent?: any;
  onChange?: (blocks: any[]) => void;
  folder?: string;
  editable?: boolean;
}

export default function BlockEditor({ initialContent, onChange, folder = "HTT", editable = true }: BlockEditorProps) {
  // Parsing initial content if provided (it could be a string or a JSON object)
  const initialBlocks: PartialBlock[] | undefined = React.useMemo(() => {
    if (!initialContent) return undefined;
    if (typeof initialContent === 'string') {
      try {
        return JSON.parse(initialContent);
      } catch (e) {
        console.error("Failed to parse initialContent", e);
        return undefined;
      }
    }
    // Nếu là mảng rỗng {} (default từ DB jsonb), bỏ qua
    if (Array.isArray(initialContent) && initialContent.length === 0) return undefined;
    if (typeof initialContent === 'object' && !Array.isArray(initialContent)) return undefined;
    return initialContent as PartialBlock[];
  }, [initialContent]);

  const editor: BlockNoteEditor = useCreateBlockNote({
    initialContent: initialBlocks,
    uploadFile: async (file: File) => {
      const formData = new FormData();
      formData.append("file", file);

      const url = await uploadFileAction(formData, folder);
      return url;
    },
  });

  return (
    <div className="min-h-[500px]">
      <BlockNoteView 
        editor={editor} 
        onChange={() => {
          if (onChange) {
            onChange(editor.document);
          }
        }}
        editable={editable}
        theme="light"
      />
    </div>
  );
}
