"use client";

import { useTranslations } from 'next-intl';
import React, { useState, useEffect } from "react";
import { Button, Icon, Badge } from "@/core/ui";
import Link from "next/link";
import dynamic from "next/dynamic";
import { MantineProvider } from "@mantine/core";
import {
  createPostAction,
  getCategoriesAction,
  getTagsAction,
  createCategoryAction,
  createTagAction,
} from "../actions/posts";
import { uploadFileAction } from "../actions/upload";
import { getMediaAction } from "../../media/actions/media";
import { useRouter } from "next/navigation";

const BlockEditor = dynamic(() => import("../components/BlockEditor"), {
  ssr: false,
});

export default function AdminEditorPage() {
  const tExtracted = useTranslations('Extracted.appAdminPostsNewPage');
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [status, setStatus] = useState("draft");
  const [content, setContent] = useState<any[]>([]);
  const [categoryId, setCategoryId] = useState("");
  const [summary, setSummary] = useState("");
  const [thumbnail, setThumbnail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [isPreviewMode, setIsPreviewMode] = useState(false);
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  // Media Selector Modal States
  const [isMediaModalOpen, setIsMediaModalOpen] = useState(false);
  const [modalMediaList, setModalMediaList] = useState<any[]>([]);
  const [isModalLoading, setIsModalLoading] = useState(false);
  const [modalSearchQuery, setModalSearchQuery] = useState("");

  const loadModalMedia = async () => {
    try {
      setIsModalLoading(true);
      const data = await getMediaAction("HTT");
      setModalMediaList(data || []);
    } catch (error) {
      console.error("Failed to load modal media:", error);
    } finally {
      setIsModalLoading(false);
    }
  };

  useEffect(() => {
    if (isMediaModalOpen) {
      loadModalMedia();
    }
  }, [isMediaModalOpen]);

  const filteredModalMedia = modalMediaList.filter((img) =>
    img.filename?.toLowerCase().includes(modalSearchQuery.toLowerCase())
  );

  // Data from Backend
  const [categories, setCategories] = useState<any[]>([]);
  const [tags, setTags] = useState<any[]>([]);
  const [selectedTagIds, setSelectedTagIds] = useState<string[]>([]);

  // Inline creation
  const [newCategoryName, setNewCategoryName] = useState("");
  const [newTagName, setNewTagName] = useState("");
  const [isCreatingCat, setIsCreatingCat] = useState(false);
  const [isCreatingTag, setIsCreatingTag] = useState(false);
  const [showNewCatInput, setShowNewCatInput] = useState(false);
  const [showNewTagInput, setShowNewTagInput] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      const [cats, tgs] = await Promise.all([
        getCategoriesAction(),
        getTagsAction(),
      ]);
      setCategories(cats);
      setTags(tgs);
    };
    fetchData();
  }, []);

  const toggleTag = (tagId: string) => {
    setSelectedTagIds((prev) =>
      prev.includes(tagId) ? prev.filter((id) => id !== tagId) : [...prev, tagId]
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
      alert(tExtracted('failedToCreateCategory'));
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
      alert(tExtracted('failedToCreateTag'));
    } finally {
      setIsCreatingTag(false);
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setIsUploadingImage(true);
      const formData = new FormData();
      formData.append("file", file);
      const url = await uploadFileAction(formData, "HTT");
      setThumbnail(url);
    } catch (error: any) {
      console.error("Failed to upload image:", error);
      alert(error.message || tExtracted('failedToUploadImagePleaseCheckFormatOr'));
    } finally {
      setIsUploadingImage(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const handleSave = async (newStatus: string) => {
    if (!title) {
      alert(tExtracted('pleaseEnterATitle'));
      return;
    }

    setIsLoading(true);
    try {
      const payload: any = {
        title,
        status: newStatus,
        content,
        summary: summary || null,
        metadata: {
          thumbnail: thumbnail || null,
          image: thumbnail || null,
          summary: summary || null,
        },
      };
      if (categoryId) payload.categoryId = categoryId;

      await createPostAction(payload);
      router.push("/admin/posts");
    } catch (error) {
      console.error("Failed to save post:", error);
      alert(tExtracted('errorSavingPost'));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <MantineProvider>
      <div className="h-full flex flex-col -m-6 lg:-m-10 bg-white">
        {/* Header */}
        <div className="h-16 border-b border-slate-100 px-6 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-4">
            <Link 
              href="/admin/posts"
              className="inline-flex items-center justify-center font-[Montserrat] rounded-full transition-all duration-300 outline-none select-none hover:cursor-pointer bg-transparent text-slate-400 hover:text-slate-900 active:scale-95 p-2 hover:no-underline"
            >
              <Icon name="ArrowLeft" size={18} />
            </Link>
            <div className="h-4 w-px bg-slate-200" />
            <div className="flex items-center gap-2 text-xs font-medium text-slate-400">
              <span>{tExtracted('posts')}</span>
              <Icon name="ChevronRight" size={12} />
              <span className="text-slate-900 truncate max-w-[200px]">{title || tExtracted('untitledPost')}</span>
            </div>
            <Badge variant="warning" className="!text-[9px] !px-2 !py-0.5 ml-2">
              {status.toUpperCase()}
            </Badge>
          </div>
          <div className="flex items-center gap-2">
            <Button
              label={isPreviewMode ? tExtracted('editPost') : tExtracted('preview')}
              variant="secondary"
              iconLeft={<Icon name={isPreviewMode ? "Pencil" : "Eye"} size={14} />}
              className="!px-4 !py-2 !rounded-xl !text-xs !bg-slate-50 hover:!bg-slate-100 !text-slate-700 font-bold border border-slate-200 shadow-sm"
              onClick={() => setIsPreviewMode(!isPreviewMode)}
            />
            <Button label={tExtracted('saveDraft')} variant="secondary" className="!px-4 !py-2 !rounded-xl !text-xs" loading={isLoading} onClick={() => handleSave("draft")} />
            <Button label={tExtracted('publish')} variant="primary" className="!px-6 !py-2 !rounded-xl !text-xs shadow-lg shadow-primary/20" loading={isLoading} onClick={() => handleSave("published")} />
          </div>
        </div>

        <div className="flex-1 flex overflow-hidden">
          {/* Editor / Preview */}
          <div className="flex-1 overflow-y-auto px-6 py-12 custom-scrollbar">
            {isPreviewMode ? (
              <div className="max-w-3xl mx-auto space-y-8 animate-in fade-in duration-500 pb-16">
                {/* Article Category & Date */}
                <div className="flex items-center gap-3 text-xs">
                  <span className="px-3 py-1 bg-primary/10 text-primary font-extrabold rounded-full uppercase tracking-wider">
                    {categories.find(c => c.id === categoryId)?.name || tExtracted('uncategorized')}
                  </span>
                  <span className="text-slate-400 font-medium">•</span>
                  <span className="text-slate-400 font-medium">
                    {new Date().toLocaleDateString('vi-VN', { day: "numeric", month: "long", year: "numeric" })}
                  </span>
                </div>

                {/* Title */}
                <h1 className="text-4xl md:text-5xl font-extrabold text-slate-900 tracking-tight leading-tight">
                  {title || tExtracted('untitledPost')}
                </h1>

                {/* Author Widget */}
                <div className="flex items-center gap-3 py-4 border-y border-slate-100">
                  <div className="w-10 h-10 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-sm">
                    {tExtracted('ad')}</div>
                  <div>
                    <p className="text-xs font-bold text-slate-900">{tExtracted('administrator')}</p>
                    <p className="text-[10px] text-slate-400 font-medium">{tExtracted('tacGiaBaiViet')}</p>
                  </div>
                </div>

                {/* Featured Cover Image */}
                {thumbnail && (
                  <div className="aspect-video w-full rounded-2xl overflow-hidden border border-slate-100 shadow-md">
                    <img src={thumbnail} alt={tExtracted('featuredCover')} className="w-full h-full object-cover" />
                  </div>
                )}

                {/* Body Content (Read-Only Editor) */}
                <div className="prose prose-slate max-w-none">
                  <BlockEditor
                    initialContent={content}
                    onChange={() => {}}
                    editable={false}
                  />
                </div>
              </div>
            ) : (
              <div className="max-w-3xl mx-auto space-y-8 animate-in slide-in-from-bottom-4 duration-700">
                <textarea
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder={tExtracted('postTitle')}
                  rows={1}
                  className="w-full text-5xl font-black text-slate-900 placeholder:text-slate-200 focus:outline-none resize-none leading-tight tracking-tight"
                  style={{ height: "auto" }}
                />
                <div className="min-h-[500px]">
                  <BlockEditor onChange={(blocks) => setContent(blocks)} />
                </div>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="w-80 border-l border-slate-100 bg-slate-50/50 overflow-y-auto hidden xl:block p-6 space-y-8">
            <div>
              <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] mb-6">{tExtracted('postSettings')}</h4>
              <div className="space-y-6">

                {/* Category */}
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-700 flex items-center justify-between">
                    {tExtracted('category')}<button onClick={() => setShowNewCatInput(!showNewCatInput)} className="text-[10px] text-primary font-bold hover:underline">
                      {showNewCatInput ? tExtracted('cancel') : tExtracted('new')}
                    </button>
                  </label>

                  {showNewCatInput && (
                    <div className="flex gap-2 mb-2">
                      <input
                        type="text"
                        value={newCategoryName}
                        onChange={(e) => setNewCategoryName(e.target.value)}
                        placeholder={tExtracted('categoryName')}
                        className="flex-1 bg-white border border-slate-200 rounded-lg px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-primary/10 focus:border-primary"
                        onKeyDown={(e) => e.key === "Enter" && handleCreateCategory()}
                      />
                      <Button label={tExtracted('add')} variant="primary" className="!px-3 !py-1.5 !text-[10px] !rounded-lg" loading={isCreatingCat} onClick={handleCreateCategory} />
                    </div>
                  )}

                  <select
                    value={categoryId}
                    onChange={(e) => setCategoryId(e.target.value)}
                    className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/10 focus:border-primary transition-all shadow-sm"
                  >
                    <option value="">{tExtracted('selectCategory')}</option>
                    {categories.map((cat) => (
                      <option key={cat.id} value={cat.id}>{cat.name}</option>
                    ))}
                  </select>
                  {categories.length === 0 && !showNewCatInput && (
                    <p className="text-[10px] text-slate-400 italic">{tExtracted('noCategoriesYetClickNewToCreateOne')}</p>
                  )}
                </div>

                {/* Tags */}
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-700 flex items-center justify-between">
                    {tExtracted('tags')}<button onClick={() => setShowNewTagInput(!showNewTagInput)} className="text-[10px] text-primary font-bold hover:underline">
                      {showNewTagInput ? tExtracted('cancel') : tExtracted('new')}
                    </button>
                  </label>

                  {showNewTagInput && (
                    <div className="flex gap-2 mb-2">
                      <input
                        type="text"
                        value={newTagName}
                        onChange={(e) => setNewTagName(e.target.value)}
                        placeholder={tExtracted('tagName')}
                        className="flex-1 bg-white border border-slate-200 rounded-lg px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-primary/10 focus:border-primary"
                        onKeyDown={(e) => e.key === "Enter" && handleCreateTag()}
                      />
                      <Button label={tExtracted('add')} variant="primary" className="!px-3 !py-1.5 !text-[10px] !rounded-lg" loading={isCreatingTag} onClick={handleCreateTag} />
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
                      <span className="text-xs text-slate-400 italic">{tExtracted('noTagsYetClickNewToCreateOne')}</span>
                    )}
                  </div>
                </div>

                {/* Featured Image */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-bold text-slate-700">{tExtracted('featuredImage')}</label>
                    {thumbnail && (
                      <button
                        onClick={() => setThumbnail("")}
                        className="text-[10px] text-red-500 hover:text-red-700 font-semibold"
                      >
                        {tExtracted('remove')}</button>
                    )}
                  </div>
                  <input
                    type="file"
                    accept="image/png, image/jpeg, image/webp, image/avif"
                    className="hidden"
                    ref={fileInputRef}
                    onChange={handleImageUpload}
                  />
                  <div
                    className={`aspect-video rounded-xl border-2 border-dashed flex flex-col items-center justify-center gap-2 group transition-all shadow-sm overflow-hidden relative ${
                      thumbnail
                        ? "border-primary/30 bg-slate-50"
                        : "border-slate-300 bg-slate-100"
                    }`}
                  >
                    {thumbnail ? (
                      <>
                        <img src={thumbnail} alt={tExtracted('featured')} className="w-full h-full object-cover" />
                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                          <button
                            onClick={() => fileInputRef.current?.click()}
                            className="px-3 py-1.5 bg-white text-slate-800 rounded-lg text-xs font-bold hover:bg-slate-50 shadow-md flex items-center gap-1.5"
                          >
                            <Icon name="Upload" size={14} /> {tExtracted('upload')}</button>
                          <button
                            onClick={() => setIsMediaModalOpen(true)}
                            className="px-3 py-1.5 bg-primary text-white rounded-lg text-xs font-bold hover:bg-primary/90 shadow-md flex items-center gap-1.5"
                          >
                            <Icon name="Image" size={14} /> {tExtracted('library')}</button>
                        </div>
                      </>
                    ) : isUploadingImage ? (
                      <span className="text-xs font-bold text-slate-500">{tExtracted('uploading')}</span>
                    ) : (
                      <div className="flex flex-col items-center gap-3 p-4">
                        <Icon name="Image" size={24} className="text-slate-400" />
                        <div className="flex gap-2">
                          <button
                            onClick={() => fileInputRef.current?.click()}
                            className="px-3 py-1.5 bg-white border border-slate-200 text-slate-700 rounded-lg text-xs font-bold hover:bg-slate-50 shadow-sm flex items-center gap-1.5"
                          >
                            <Icon name="Upload" size={14} /> {tExtracted('uploadNew')}</button>
                          <button
                            onClick={() => setIsMediaModalOpen(true)}
                            className="px-3 py-1.5 bg-primary text-white rounded-lg text-xs font-bold hover:bg-primary/90 shadow-md flex items-center gap-1.5"
                          >
                            <Icon name="Image" size={14} /> {tExtracted('fromLibrary')}</button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* SEO Summary */}
                <div className="space-y-2 pt-4">
                  <label className="text-xs font-bold text-slate-700 flex items-center justify-between">
                    {tExtracted('seoSummary')}<span className="text-[10px] font-normal text-slate-400">{summary.length}/160</span>
                  </label>
                  <textarea
                    rows={4}
                    value={summary}
                    onChange={(e) => setSummary(e.target.value)}
                    maxLength={160}
                    className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2.5 text-xs focus:outline-none focus:ring-2 focus:ring-primary/10 focus:border-primary transition-all shadow-sm resize-none"
                    placeholder={tExtracted('summarizeThisPostForSearchEngines')}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Media Library Selector Modal */}
      {isMediaModalOpen && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-slate-950/50 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl w-full max-w-3xl max-h-[85vh] flex flex-col shadow-2xl border border-slate-100 overflow-hidden animate-in zoom-in-95 duration-200">
            {/* Header */}
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
              <div>
                <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                  <Icon name="Image" className="text-primary" size={20} />
                  {tExtracted('thuVienMedia')}</h3>
                <p className="text-[11px] text-slate-500">{tExtracted('chonMotHinhAnhTuThuVienCua')}</p>
              </div>
              <button
                onClick={() => setIsMediaModalOpen(false)}
                className="p-1.5 rounded-lg hover:bg-slate-200 text-slate-400 hover:text-slate-700 transition-colors"
              >
                <Icon name="X" size={18} />
              </button>
            </div>

            {/* Search and Filters */}
            <div className="p-4 border-b border-slate-100 flex items-center gap-3">
              <div className="relative flex-1">
                <Icon name="Search" className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                <input
                  type="text"
                  placeholder={tExtracted('timKiemHinhAnhTheoTen')}
                  value={modalSearchQuery}
                  onChange={(e) => setModalSearchQuery(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-4 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-primary/10 focus:border-primary transition-all"
                />
              </div>
              <button
                onClick={loadModalMedia}
                className="p-2 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-600 transition-colors"
                title={tExtracted('taiLaiThuVien')}
              >
                <Icon name="RefreshCw" size={16} className={isModalLoading ? "animate-spin" : ""} />
              </button>
            </div>

            {/* Grid of Images */}
            <div className="flex-1 overflow-y-auto p-6 min-h-[300px]">
              {isModalLoading ? (
                <div className="h-full flex flex-col items-center justify-center gap-3 min-h-[300px]">
                  <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
                  <span className="text-xs text-slate-500 font-semibold">{tExtracted('dangTaiThuVienAnh')}</span>
                </div>
              ) : filteredModalMedia.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-center p-8 min-h-[300px] gap-3">
                  <Icon name="Image" size={48} className="text-slate-300" />
                  <div>
                    <p className="text-xs font-semibold text-slate-700">{tExtracted('thuVienTrongHoacKhongKhopTuKhoa')}</p>
                    <p className="text-[11px] text-slate-400 mt-1">{tExtracted('hayUploadAnhMoiTrongThuMucHtt')}</p>
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                  {filteredModalMedia.map((img) => (
                    <div
                      key={img.id}
                      onClick={() => {
                        setThumbnail(img.url);
                        setIsMediaModalOpen(false);
                      }}
                      className="group aspect-video rounded-xl border border-slate-200 bg-slate-50 overflow-hidden relative cursor-pointer hover:border-primary hover:shadow-md transition-all"
                    >
                      <img src={img.url} alt={img.filename} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200" />
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-2">
                        <span className="text-[9px] text-white font-semibold truncate w-full">{img.filename}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </MantineProvider>
  );
}
