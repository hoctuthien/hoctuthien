"use client";

import { useTranslations } from 'next-intl';
import React, { useState, useEffect, useRef } from "react";
import { Button, Icon } from "@/core/ui";
import { cn } from "@/core/utils/cn";
import { getMediaAction, deleteMediaAction } from "./actions/media";
import { uploadFileAction } from "../posts/actions/upload";

function formatBytes(bytes: number, decimals = 2) {
  if (!bytes) return "0 Bytes";
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ["Bytes", "KB", "MB", "GB", "TB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + " " + sizes[i];
}

export default function AdminMediaPage() {
  const tExtracted = useTranslations('Extracted.appAdminMediaPage');
  const [mediaList, setMediaList] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isUploading, setIsUploading] = useState(false);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedMonth, setSelectedMonth] = useState("all");

  const fileInputRef = useRef<HTMLInputElement>(null);

  const fetchMedia = async () => {
    try {
      setIsLoading(true);
      const data = await getMediaAction("HTT");
      setMediaList(data || []);
      if (data && data.length > 0) {
        setSelectedId(data[0].id);
      } else {
        setSelectedId(null);
      }
    } catch (error) {
      console.error("Failed to load media list:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchMedia();
  }, []);

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const file = files[0];
    const formData = new FormData();
    formData.append("file", file);

    try {
      setIsUploading(true);
      await uploadFileAction(formData, "HTT");
      alert(tExtracted('taiLenAnhThanhCong'));
      await fetchMedia();
    } catch (error: any) {
      alert(error.message || tExtracted('taiLenAnhThatBai'));
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const handleDeleteClick = async (id: string, filename: string) => {
    if (!confirm(`Bạn có chắc chắn muốn xóa ảnh "${filename}" khỏi thư viện?`)) return;

    try {
      await deleteMediaAction(id);
      alert(tExtracted('xoaAnhThanhCong'));
      await fetchMedia();
    } catch (error: any) {
      alert(error.message || tExtracted('xoaAnhThatBai'));
    }
  };

  const selectedImage = mediaList.find((img) => img.id === selectedId);

  // Filters
  const filteredMedia = mediaList.filter((img) => {
    const matchesSearch = img.filename?.toLowerCase().includes(searchQuery.toLowerCase());
    if (selectedMonth === "all") return matchesSearch;

    // Simple filter by month (e.g. "2026-05")
    const uploadDate = img.createdAt ? new Date(img.createdAt).toISOString() : "";
    return matchesSearch && uploadDate.includes(selectedMonth);
  });

  // Extract months for filter dropdown
  const uniqueMonths = Array.from(
    new Set(
      mediaList
        .filter((img) => img.createdAt)
        .map((img) => {
          const date = new Date(img.createdAt);
          const year = date.getFullYear();
          const month = String(date.getMonth() + 1).padStart(2, "0");
          return `${year}-${month}`;
        })
    )
  ).sort().reverse();

  const handleCopyLink = (url: string) => {
    navigator.clipboard.writeText(url);
    alert(tExtracted('daSaoChepLienKetVaoBoNho'));
  };

  return (
    <div className="h-full flex flex-col gap-6 animate-in fade-in duration-500">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 tracking-tight">{tExtracted('mediaLibrary')}</h1>
          <p className="text-slate-500 mt-1">{tExtracted('manageYourImagesAndAssets')}</p>
        </div>
        <div className="flex gap-2">
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            className="hidden"
            accept="image/*"
          />
          <Button
            onClick={handleUploadClick}
            disabled={isUploading}
            label={isUploading ? tExtracted('uploading') : tExtracted('uploadNew')}
            variant="primary"
            iconLeft={<Icon name="Upload" size={18} />}
            className="!rounded-xl shadow-lg shadow-primary/20"
          />
        </div>
      </div>

      <div className="flex-1 flex gap-8 min-h-0">
        {/* Main Grid Area */}
        <div className="flex-1 space-y-6 min-w-0 overflow-y-auto pr-2 custom-scrollbar">
          <div className="flex items-center gap-4 bg-white p-3 rounded-2xl border border-slate-200 shadow-sm">
            <div className="relative flex-1 max-w-md">
              <Icon name="Search" size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={tExtracted('searchMedia')}
                className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/10 focus:border-primary transition-all"
              />
            </div>
            <select
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(e.target.value)}
              className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/10"
            >
              <option value="all">{tExtracted('allDates')}</option>
              {uniqueMonths.map((m: any) => {
                const [year, month] = m.split("-");
                return (
                  <option key={m} value={m}>
                    {tExtracted('thang')}{month}/{year}
                  </option>
                );
              })}
            </select>
          </div>

          {isLoading ? (
            <div className="py-24 text-center text-slate-400">
              <Icon name="Loader2" size={32} className="animate-spin mx-auto mb-2 text-slate-300" />
              {tExtracted('loadingMediaLibrary')}</div>
          ) : filteredMedia.length === 0 ? (
            <div className="py-24 text-center text-slate-400 border-2 border-dashed border-slate-200 rounded-2xl">
              <Icon name="Image" size={48} className="mx-auto mb-2 text-slate-300" />
              {tExtracted('thuVienTrongHayBatDauTaiLen')}</div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-4 pb-8">
              {filteredMedia.map((img) => (
                <div
                  key={img.id}
                  onClick={() => setSelectedId(img.id)}
                  className={cn(
                    "aspect-square rounded-2xl overflow-hidden cursor-pointer border-4 transition-all duration-200 group relative",
                    selectedId === img.id ? "border-primary ring-4 ring-primary/10" : "border-white hover:border-slate-100 shadow-sm"
                  )}
                >
                  <img src={img.url} alt={img.filename} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-3">
                    <p className="text-white text-[10px] truncate font-medium">{img.filename}</p>
                  </div>
                  {selectedId === img.id && (
                    <div className="absolute top-2 right-2 bg-primary text-white p-1 rounded-full shadow-lg scale-in-center">
                      <Icon name="Check" size={12} strokeWidth={4} />
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Details Sidebar */}
        <div className="w-[350px] shrink-0">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden h-fit sticky top-0">
            {selectedImage ? (
              <div className="animate-in slide-in-from-right duration-300">
                <div className="p-1">
                  <div className="aspect-[4/3] rounded-t-xl overflow-hidden bg-slate-100 relative group flex items-center justify-center">
                    <img src={selectedImage.url} alt={selectedImage.filename} className="w-full h-full object-contain" />
                  </div>
                </div>
                <div className="p-6 space-y-6">
                  <div>
                    <h4 className="text-sm font-bold text-slate-900 uppercase tracking-widest mb-1 text-[10px]">{tExtracted('fileDetails')}</h4>
                    <div className="space-y-2 mt-4">
                      <div className="flex justify-between text-xs">
                        <span className="text-slate-500 font-medium">{tExtracted('filename')}</span>
                        <span className="text-slate-900 font-bold truncate ml-4" title={selectedImage.filename}>{selectedImage.filename}</span>
                      </div>
                      <div className="flex justify-between text-xs">
                        <span className="text-slate-500 font-medium">{tExtracted('size')}</span>
                        <span className="text-slate-900 font-bold">{formatBytes(selectedImage.size)}</span>
                      </div>
                      <div className="flex justify-between text-xs">
                        <span className="text-slate-500 font-medium">{tExtracted('mimeType')}</span>
                        <span className="text-slate-900 font-bold">{selectedImage.mimeType || tExtracted('imageJpeg')}</span>
                      </div>
                      <div className="flex justify-between text-xs">
                        <span className="text-slate-500 font-medium">{tExtracted('uploadedOn')}</span>
                        <span className="text-slate-900 font-bold">
                          {selectedImage.createdAt ? new Date(selectedImage.createdAt).toLocaleDateString("vi-VN") : "-"}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="pt-4 flex gap-2 border-t border-slate-100">
                    <Button
                      onClick={() => handleCopyLink(selectedImage.url)}
                      label={tExtracted('copyLink')}
                      variant="secondary"
                      iconLeft={<Icon name="Copy" size={14} />}
                      className="flex-1 !py-2.5 !text-xs !rounded-xl"
                    />
                    <Button
                      onClick={() => handleDeleteClick(selectedImage.id, selectedImage.filename)}
                      label={<Icon name="Trash2" size={14} />}
                      variant="text"
                      className="!p-2.5 !text-red-500 hover:bg-red-50 !rounded-xl"
                    />
                  </div>
                </div>
              </div>
            ) : (
              <div className="p-12 text-center space-y-4">
                <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto text-slate-300">
                  <Icon name="Image" size={32} />
                </div>
                <p className="text-sm text-slate-500">{tExtracted('selectAnImageToViewDetails')}</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
