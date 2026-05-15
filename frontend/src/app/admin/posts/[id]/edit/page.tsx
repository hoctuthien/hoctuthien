"use client";

import React, { useState, useEffect } from "react";
import { Button, Icon, Badge } from "@/core/ui";
import Link from "next/link";
import dynamic from "next/dynamic";
import { MantineProvider } from "@mantine/core";
import {
  getPostAction,
  updatePostAction,
  getCategoriesAction,
  getTagsAction,
  createCategoryAction,
  createTagAction,
} from "../../actions/posts";
import { useRouter, useParams } from "next/navigation";

const BlockEditor = dynamic(() => import("../../components/BlockEditor"), {
  ssr: false,
});

export default function AdminEditPostPage() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;

  const [title, setTitle] = useState("");
  const [status, setStatus] = useState("draft");
  const [content, setContent] = useState<any>(null);
  const [categoryId, setCategoryId] = useState("");
  const [summary, setSummary] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isFetching, setIsFetching] = useState(true);

  const [categories, setCategories] = useState<any[]>([]);
  const [tags, setTags] = useState<any[]>([]);
  const [selectedTagIds, setSelectedTagIds] = useState<string[]>([]);

  const [newCategoryName, setNewCategoryName] = useState("");
  const [newTagName, setNewTagName] = useState("");
  const [isCreatingCat, setIsCreatingCat] = useState(false);
  const [isCreatingTag, setIsCreatingTag] = useState(false);
  const [showNewCatInput, setShowNewCatInput] = useState(false);
  const [showNewTagInput, setShowNewTagInput] = useState(false);

  useEffect(() => {
    const fetchAll = async () => {
      try {
        const [post, cats, tgs] = await Promise.all([
          getPostAction(id),
          getCategoriesAction(),
          getTagsAction(),
        ]);

        setTitle(post.title || "");
        setStatus(post.status || "draft");
        setContent(post.content);
        setCategoryId(post.categoryId || "");
        setSummary(post.summary || "");

        if (post.postTags && Array.isArray(post.postTags)) {
          setSelectedTagIds(post.postTags.map((pt: any) => pt.tagId || pt.tag?.id));
        }

        setCategories(cats);
        setTags(tgs);
      } catch (error) {
        console.error("Failed to fetch data:", error);
      } finally {
        setIsFetching(false);
      }
    };
    fetchAll();
  }, [id]);

  const toggleTag = (tagId: string) => {
    setSelectedTagIds((prev) =>
      prev.includes(tagId) ? prev.filter((tid) => tid !== tagId) : [...prev, tagId]
    );
  };

  const handleCreateCategory = async () => {
    if (!newCategoryName.trim()) return;
    setIsCreatingCat(true);
    try {
      const newCat = await createCategoryAction(newCategoryName.trim());
      setCategories((prev) => [...prev, newCat]);
      setCategoryId(newCat.id);
      setNewCategoryName("");
      setShowNewCatInput(false);
    } catch (error) {
      alert("Failed to create category");
    } finally {
      setIsCreatingCat(false);
    }
  };

  const handleCreateTag = async () => {
    if (!newTagName.trim()) return;
    setIsCreatingTag(true);
    try {
      const newTag = await createTagAction(newTagName.trim());
      setTags((prev) => [...prev, newTag]);
      setSelectedTagIds((prev) => [...prev, newTag.id]);
      setNewTagName("");
      setShowNewTagInput(false);
    } catch (error) {
      alert("Failed to create tag");
    } finally {
      setIsCreatingTag(false);
    }
  };

  const handleSave = async (newStatus: string) => {
    if (!title) {
      alert("Please enter a title");
      return;
    }

    setIsLoading(true);
    try {
      const payload: any = {
        title,
        status: newStatus,
        content,
        summary: summary || null,
      };
      if (categoryId) payload.categoryId = categoryId;

      await updatePostAction(id, payload);
      router.push("/admin/posts");
    } catch (error) {
      console.error("Failed to update post:", error);
      alert("Error updating post");
    } finally {
      setIsLoading(false);
    }
  };

  if (isFetching) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
          <span className="text-sm text-slate-400">Loading post...</span>
        </div>
      </div>
    );
  }

  return (
    <MantineProvider>
      <div className="h-full flex flex-col -m-6 lg:-m-10 bg-white">
        {/* Header */}
        <div className="h-16 border-b border-slate-100 px-6 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-4">
            <Link href="/admin/posts">
              <Button variant="text" label={<Icon name="ArrowLeft" size={18} />} className="!p-2 text-slate-400 hover:text-slate-900" />
            </Link>
            <div className="h-4 w-px bg-slate-200" />
            <div className="flex items-center gap-2 text-xs font-medium text-slate-400">
              <span>Posts</span>
              <Icon name="ChevronRight" size={12} />
              <span className="text-slate-900 truncate max-w-[200px]">{title || "Untitled Post"}</span>
            </div>
            <Badge variant={status === 'published' ? 'success' : 'warning'} className="!text-[9px] !px-2 !py-0.5 ml-2">
              {status.toUpperCase()}
            </Badge>
          </div>
          <div className="flex items-center gap-2">
            <Button label="Save Draft" variant="secondary" className="!px-4 !py-2 !rounded-xl !text-xs" loading={isLoading} onClick={() => handleSave("draft")} />
            <Button label={status === 'published' ? 'Update' : 'Publish'} variant="primary" className="!px-6 !py-2 !rounded-xl !text-xs shadow-lg shadow-primary/20" loading={isLoading} onClick={() => handleSave("published")} />
          </div>
        </div>

        <div className="flex-1 flex overflow-hidden">
          {/* Editor */}
          <div className="flex-1 overflow-y-auto px-6 py-12 custom-scrollbar">
            <div className="max-w-3xl mx-auto space-y-8 animate-in slide-in-from-bottom-4 duration-700">
              <textarea
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Post Title..."
                rows={1}
                className="w-full text-5xl font-black text-slate-900 placeholder:text-slate-200 focus:outline-none resize-none leading-tight tracking-tight"
                style={{ height: 'auto' }}
              />
              <div className="min-h-[500px]">
                <BlockEditor
                  initialContent={content}
                  onChange={(blocks) => setContent(blocks)}
                />
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="w-80 border-l border-slate-100 bg-slate-50/50 overflow-y-auto hidden xl:block p-6 space-y-8">
            <div>
              <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] mb-6">Post Settings</h4>
              <div className="space-y-6">

                {/* Category */}
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-700 flex items-center justify-between">
                    Category
                    <button onClick={() => setShowNewCatInput(!showNewCatInput)} className="text-[10px] text-primary font-bold hover:underline">
                      {showNewCatInput ? "Cancel" : "+ New"}
                    </button>
                  </label>

                  {showNewCatInput && (
                    <div className="flex gap-2 mb-2">
                      <input
                        type="text"
                        value={newCategoryName}
                        onChange={(e) => setNewCategoryName(e.target.value)}
                        placeholder="Category name..."
                        className="flex-1 bg-white border border-slate-200 rounded-lg px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-primary/10 focus:border-primary"
                        onKeyDown={(e) => e.key === "Enter" && handleCreateCategory()}
                      />
                      <Button label="Add" variant="primary" className="!px-3 !py-1.5 !text-[10px] !rounded-lg" loading={isCreatingCat} onClick={handleCreateCategory} />
                    </div>
                  )}

                  <select
                    value={categoryId}
                    onChange={(e) => setCategoryId(e.target.value)}
                    className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/10 focus:border-primary transition-all shadow-sm"
                  >
                    <option value="">— Select Category —</option>
                    {categories.map((cat) => (
                      <option key={cat.id} value={cat.id}>{cat.name}</option>
                    ))}
                  </select>
                  {categories.length === 0 && !showNewCatInput && (
                    <p className="text-[10px] text-slate-400 italic">No categories yet. Click "+ New" to create one.</p>
                  )}
                </div>

                {/* Tags */}
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-700 flex items-center justify-between">
                    Tags
                    <button onClick={() => setShowNewTagInput(!showNewTagInput)} className="text-[10px] text-primary font-bold hover:underline">
                      {showNewTagInput ? "Cancel" : "+ New"}
                    </button>
                  </label>

                  {showNewTagInput && (
                    <div className="flex gap-2 mb-2">
                      <input
                        type="text"
                        value={newTagName}
                        onChange={(e) => setNewTagName(e.target.value)}
                        placeholder="Tag name..."
                        className="flex-1 bg-white border border-slate-200 rounded-lg px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-primary/10 focus:border-primary"
                        onKeyDown={(e) => e.key === "Enter" && handleCreateTag()}
                      />
                      <Button label="Add" variant="primary" className="!px-3 !py-1.5 !text-[10px] !rounded-lg" loading={isCreatingTag} onClick={handleCreateTag} />
                    </div>
                  )}

                  <div className="flex flex-wrap gap-2 p-3 bg-white border border-slate-200 rounded-xl min-h-[80px] shadow-sm">
                    {tags.map((tag) => (
                      <button
                        key={tag.id}
                        onClick={() => toggleTag(tag.id)}
                        className={`inline-flex items-center px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                          selectedTagIds.includes(tag.id)
                            ? "bg-primary/10 text-primary border border-primary/30"
                            : "bg-slate-100 text-slate-500 hover:bg-slate-200"
                        }`}
                      >
                        {tag.name}
                        {selectedTagIds.includes(tag.id) && <Icon name="X" size={12} className="ml-1" />}
                      </button>
                    ))}
                    {tags.length === 0 && !showNewTagInput && (
                      <span className="text-xs text-slate-400 italic">No tags yet. Click "+ New" to create one.</span>
                    )}
                  </div>
                </div>

                {/* Featured Image */}
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-700">Featured Image</label>
                  <div className="aspect-video rounded-xl bg-slate-200 border-2 border-dashed border-slate-300 flex flex-col items-center justify-center gap-2 group cursor-pointer hover:bg-slate-100 transition-colors shadow-sm">
                    <Icon name="Upload" size={24} className="text-slate-400 group-hover:text-primary transition-colors" />
                    <span className="text-[10px] font-bold text-slate-400 group-hover:text-primary uppercase tracking-wider">Set Image</span>
                  </div>
                </div>

                {/* SEO Summary */}
                <div className="space-y-2 pt-4">
                  <label className="text-xs font-bold text-slate-700 flex items-center justify-between">
                    SEO Summary
                    <span className="text-[10px] font-normal text-slate-400">{summary.length}/160</span>
                  </label>
                  <textarea
                    rows={4}
                    value={summary}
                    onChange={(e) => setSummary(e.target.value)}
                    maxLength={160}
                    className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2.5 text-xs focus:outline-none focus:ring-2 focus:ring-primary/10 focus:border-primary transition-all shadow-sm resize-none"
                    placeholder="Summarize this post for search engines..."
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </MantineProvider>
  );
}
