"use client";

import { useTranslations } from 'next-intl';
import React, { useState, useRef } from "react";
import { Icon } from "../Icon";
import { cn } from "@/core/utils/cn";

export interface ImageUploaderProps {
  value?: string | string[];
  onChange: (value: any) => void;
  onUpload: (file: File) => Promise<string>;
  multiple?: boolean;
  error?: string;
  label?: string;
  placeholder?: string;
  subPlaceholder?: string;
  uploadingLabel?: string;
  viewOriginalLabel?: string;
  deleteLabel?: string;
  onlyImagesError?: string;
  uploadFailedError?: string;
  className?: string;
}

export function ImageUploader({
  value,
  onChange,
  onUpload,
  multiple = false,
  error,
  label: labelProp,
  placeholder: placeholderProp,
  subPlaceholder: subPlaceholderProp,
  uploadingLabel: uploadingLabelProp,
  viewOriginalLabel: viewOriginalLabelProp,
  deleteLabel: deleteLabelProp,
  onlyImagesError: onlyImagesErrorProp,
  uploadFailedError: uploadFailedErrorProp,
  className,
}: ImageUploaderProps) {
  const tExtracted = useTranslations('Extracted.coreUiImageUploaderImageUploader');
  const t = useTranslations('ImageUploader');
  const label = labelProp ?? t('label');
  const placeholder = placeholderProp ?? t('placeholder');
  const subPlaceholder = subPlaceholderProp ?? t('subPlaceholder');
  const uploadingLabel = uploadingLabelProp ?? t('uploading');
  const viewOriginalLabel = viewOriginalLabelProp ?? t('viewOriginal');
  const deleteLabel = deleteLabelProp ?? t('delete');
  const onlyImagesError = onlyImagesErrorProp ?? t('onlyImagesError');
  const uploadFailedError = uploadFailedErrorProp ?? t('uploadFailedError');
  const [uploadingCount, setUploadingCount] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Normalize value to an array of URLs
  const valueArray = Array.isArray(value) ? value : value ? [value] : [];

  const handleUploadSingle = async (file: File) => {
    if (!file) return;

    setUploadingCount(1);
    try {
      const url = await onUpload(file);
      onChange(url);
    } catch (err: any) {
      console.error("Uploader failed to process file:", err);
      alert(err.message || uploadFailedError);
    } finally {
      setUploadingCount(0);
    }
  };

  const handleUploadMultiple = async (files: File[]) => {
    if (files.length === 0) return;

    setUploadingCount(files.length);
    try {
      const uploadPromises = files.map(file => onUpload(file));
      const results = await Promise.allSettled(uploadPromises);

      const successfulUrls = results
        .filter((r): r is PromiseFulfilledResult<string> => r.status === "fulfilled")
        .map(r => r.value);

      const failedCount = results.filter(r => r.status === "rejected").length;
      if (failedCount > 0) {
        alert(t('filesUploadFailed', { count: failedCount }));
      }

      if (successfulUrls.length > 0) {
        const newValue = [...valueArray, ...successfulUrls];
        onChange(newValue);
      }
    } catch (err: any) {
      console.error("Multiple uploader failed:", err);
    } finally {
      setUploadingCount(0);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);

    const files = Array.from(e.dataTransfer.files || []);
    if (files.length === 0) return;

    if (multiple) {
      const imageFiles = files.filter(f => f.type.startsWith("image/"));
      if (imageFiles.length > 0) {
        handleUploadMultiple(imageFiles);
      } else {
        alert(onlyImagesError);
      }
    } else {
      const file = files[0];
      if (file && file.type.startsWith("image/")) {
        handleUploadSingle(file);
      } else {
        alert(onlyImagesError);
      }
    }
  };

  const handleRemoveImage = (indexToRemove: number) => {
    const updated = valueArray.filter((_, i) => i !== indexToRemove);
    if (multiple) {
      onChange(updated);
    } else {
      onChange("");
    }
  };

  const isUploading = uploadingCount > 0;
  const hasImages = valueArray.length > 0;

  return (
    <div className={cn("flex flex-col w-full", className)}>
      {label && (
        <span className="text-xs font-bold text-slate-700 mb-2 flex items-center gap-1.5 select-none">
          <Icon name="Image" size={14} className="text-slate-400" />
          {label}
        </span>
      )}

      {/* Hidden file input */}
      <input
        type="file"
        accept="image/*"
        className="hidden"
        ref={fileInputRef}
        multiple={multiple}
        onChange={(e) => {
          const files = Array.from(e.target.files || []);
          if (multiple) {
            const imageFiles = files.filter(f => f.type.startsWith("image/"));
            if (imageFiles.length > 0) {
              handleUploadMultiple(imageFiles);
            } else if (files.length > 0) {
              alert(onlyImagesError);
            }
          } else {
            const file = files[0];
            if (file) {
              if (file.type.startsWith("image/")) {
                handleUploadSingle(file);
              } else {
                alert(onlyImagesError);
              }
            }
          }
          // Reset file input value to allow uploading the same file again
          e.target.value = "";
        }}
      />

      {!multiple ? (
        /* Single Upload View */
        valueArray[0] ? (
          /* Single Image Preview Frame */
          <div className="relative border border-slate-200/60 rounded-2xl overflow-hidden bg-slate-100 aspect-video w-full max-w-sm mx-auto group/preview shadow-sm hover:shadow-md transition-all">
            <img
              src={valueArray[0]}
              alt={tExtracted('uploadedPreview')}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-black/60 opacity-0 group-hover/preview:opacity-100 transition-opacity flex flex-col items-center justify-center gap-2">
              <a
                href={valueArray[0]}
                target="_blank"
                rel="noopener noreferrer"
                className="px-4 py-2 bg-white text-slate-800 rounded-xl text-xs font-extrabold flex items-center gap-1.5 hover:bg-slate-50 transition-all active:scale-95"
              >
                <Icon name="Eye" size={14} /> {viewOriginalLabel}
              </a>
              <button
                type="button"
                onClick={() => handleRemoveImage(0)}
                className="px-4 py-2 bg-rose-600 text-white rounded-xl text-xs font-extrabold flex items-center gap-1.5 hover:bg-rose-700 transition-all active:scale-95 shadow-md shadow-rose-600/20"
              >
                <Icon name="Trash2" size={14} /> {deleteLabel}
              </button>
            </div>
          </div>
        ) : (
          /* Drag and Drop Container Zone */
          <div className="space-y-1">
            <div
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              className={cn(
                "border-2 border-dashed rounded-2xl p-6 flex flex-col items-center justify-center gap-3 cursor-pointer transition-all duration-200 min-h-[140px]",
                isDragging
                  ? "border-primary bg-primary/5 scale-[1.01]"
                  : "border-slate-300 hover:border-primary/50 hover:bg-slate-50 bg-white",
                error && "border-red-500 bg-red-50/20"
              )}
            >
              {isUploading ? (
                <div className="flex flex-col items-center gap-2 py-2">
                  <div className="w-6 h-6 border-3 border-primary border-t-transparent rounded-full animate-spin"></div>
                  <span className="text-[11px] font-bold text-slate-500">{uploadingLabel}</span>
                </div>
              ) : (
                <div className="flex flex-col items-center gap-2 text-center">
                  <div className="p-2.5 rounded-full bg-slate-100 text-slate-400 hover:text-primary transition-colors">
                    <Icon name="Upload" size={20} />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-slate-700">{placeholder}</p>
                    <p className="text-[10px] text-slate-400 mt-1">{subPlaceholder}</p>
                  </div>
                </div>
              )}
            </div>

            {error && (
              <p className="text-[11px] text-red-500 font-bold mt-1">
                {error}
              </p>
            )}
          </div>
        )
      ) : (
        /* Multiple Upload View */
        <div className="space-y-3 w-full">
          {!hasImages && !isUploading ? (
            /* Large Drag & Drop Box when empty */
            <div
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              className={cn(
                "border-2 border-dashed rounded-2xl p-8 flex flex-col items-center justify-center gap-3 cursor-pointer transition-all duration-200 min-h-[160px]",
                isDragging
                  ? "border-primary bg-primary/5 scale-[1.01]"
                  : "border-slate-300 hover:border-primary/50 hover:bg-slate-50 bg-white",
                error && "border-red-500 bg-red-50/20"
              )}
            >
              <div className="flex flex-col items-center gap-2 text-center">
                <div className="p-3 rounded-full bg-slate-100 text-slate-400 hover:text-primary transition-colors">
                  <Icon name="Upload" size={24} />
                </div>
                <div>
                  <p className="text-xs font-bold text-slate-700">{placeholder}</p>
                  <p className="text-[10px] text-slate-400 mt-1">{subPlaceholder}</p>
                </div>
              </div>
            </div>
          ) : (
            /* Grid View when there are images or active uploading */
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 w-full animate-in fade-in duration-300">
              {/* Render Existing Uploaded Images */}
              {valueArray.map((url, idx) => (
                <div
                  key={`${url}-${idx}`}
                  className="relative border border-slate-200/60 rounded-2xl overflow-hidden bg-slate-100 aspect-video group/preview shadow-sm hover:shadow-md transition-all animate-in zoom-in-95 duration-200"
                >
                  <img
                    src={url}
                    alt={`Preview ${idx + 1}`}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-black/60 opacity-0 group-hover/preview:opacity-100 transition-opacity flex flex-col items-center justify-center gap-1.5">
                    <a
                      href={url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-2.5 py-1.5 bg-white text-slate-800 rounded-lg text-[10px] font-extrabold flex items-center gap-1 hover:bg-slate-50 transition-all active:scale-95"
                    >
                      <Icon name="Eye" size={12} /> {viewOriginalLabel}
                    </a>
                    <button
                      type="button"
                      onClick={() => handleRemoveImage(idx)}
                      className="px-2.5 py-1.5 bg-rose-600 text-white rounded-lg text-[10px] font-extrabold flex items-center gap-1 hover:bg-rose-700 transition-all active:scale-95 shadow-md shadow-rose-600/20"
                    >
                      <Icon name="Trash2" size={12} /> {deleteLabel}
                    </button>
                  </div>
                </div>
              ))}

              {/* Render Uploading Placeholders */}
              {Array.from({ length: uploadingCount }).map((_, idx) => (
                <div
                  key={`uploading-${idx}`}
                  className="relative border border-dashed border-primary/40 rounded-2xl overflow-hidden bg-primary/5 aspect-video flex flex-col items-center justify-center gap-2 text-primary animate-pulse"
                >
                  <div className="w-5 h-5 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
                  <span className="text-[10px] font-bold text-primary/70">{uploadingLabel}</span>
                </div>
              ))}

              {/* "Add More" card slot */}
              <div
                onClick={() => fileInputRef.current?.click()}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                className={cn(
                  "border-2 border-dashed rounded-2xl flex flex-col items-center justify-center gap-1.5 cursor-pointer transition-all duration-200 aspect-video",
                  isDragging
                    ? "border-primary bg-primary/5 scale-[1.01]"
                    : "border-slate-300 hover:border-primary/50 hover:bg-slate-50 bg-white"
                )}
              >
                <div className="p-2 rounded-full bg-slate-100 text-slate-400 group-hover:text-primary transition-colors">
                  <Icon name="Plus" size={16} />
                </div>
                <span className="text-[10px] font-bold text-slate-500">{tExtracted('themAnh')}</span>
              </div>
            </div>
          )}

          {error && (
            <p className="text-[11px] text-red-500 font-bold mt-1">
              {error}
            </p>
          )}
        </div>
      )}
    </div>
  );
}
