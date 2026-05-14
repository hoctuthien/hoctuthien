"use client";

import { BlockNoteEditor, PartialBlock } from "@blocknote/core";
import "@blocknote/core/fonts/inter.css";
import { useCreateBlockNote } from "@blocknote/react";
import { BlockNoteView } from "@blocknote/mantine";
import "@blocknote/mantine/style.css";

interface BlockEditorProps {
  initialContent?: string;
  onChange?: (blocks: any[]) => void;
}

export default function BlockEditor({ initialContent, onChange }: BlockEditorProps) {
  // Parsing initial content if provided
  const initialBlocks: PartialBlock[] | undefined = initialContent 
    ? JSON.parse(initialContent) 
    : undefined;

  const editor: BlockNoteEditor = useCreateBlockNote({
    initialContent: initialBlocks,
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
