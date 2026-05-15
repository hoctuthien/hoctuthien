"use client";

import { BlockNoteEditor, PartialBlock } from "@blocknote/core";
import "@blocknote/core/fonts/inter.css";
import { useCreateBlockNote } from "@blocknote/react";
import { BlockNoteView } from "@blocknote/mantine";
import "@blocknote/mantine/style.css";
import { uploadFileAction } from "../actions/upload";

interface BlockEditorProps {
  initialContent?: string;
  onChange?: (blocks: any[]) => void;
  folder?: string;
}

export default function BlockEditor({ initialContent, onChange, folder = "HTT" }: BlockEditorProps) {
  // Parsing initial content if provided
  const initialBlocks: PartialBlock[] | undefined = initialContent 
    ? JSON.parse(initialContent) 
    : undefined;

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
        theme="light"
      />
    </div>
  );
}
