"use client";

import React, { useState } from "react";
import { Button, Icon, Badge, Input } from "@/core/ui";
import { cn } from "@/core/utils/cn";

const mockImages = [
  { id: "1", url: "https://images.unsplash.com/photo-1558655146-d09347e92766?w=800&auto=format&fit=crop&q=60", name: "ui-trends.jpg", size: "1.2 MB", type: "image/jpeg", date: "2026-05-14" },
  { id: "2", url: "https://images.unsplash.com/photo-1587620962725-abab7fe55159?w=800&auto=format&fit=crop&q=60", name: "backend-dev.jpg", size: "850 KB", type: "image/jpeg", date: "2026-05-12" },
  { id: "3", url: "https://images.unsplash.com/photo-1522071823991-b99c223a7097?w=800&auto=format&fit=crop&q=60", name: "mentorship.jpg", size: "2.1 MB", type: "image/jpeg", date: "2026-05-10" },
  { id: "4", url: "https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?w=800&auto=format&fit=crop&q=60", name: "coding-workshop.jpg", size: "1.5 MB", type: "image/jpeg", date: "2026-05-08" },
  { id: "5", url: "https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=800&auto=format&fit=crop&q=60", name: "setup.jpg", size: "3.4 MB", type: "image/jpeg", date: "2026-05-05" },
  { id: "6", url: "https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=800&auto=format&fit=crop&q=60", name: "code-review.jpg", size: "1.1 MB", type: "image/jpeg", date: "2026-05-01" },
];

export default function AdminMediaPage() {
  const [selectedId, setSelectedId] = useState<string | null>("1");
  const selectedImage = mockImages.find(img => img.id === selectedId);

  return (
    <div className="h-full flex flex-col gap-6 animate-in fade-in duration-500">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Media Library</h1>
          <p className="text-slate-500 mt-1">Manage your images and assets.</p>
        </div>
        <Button 
          label="Upload New" 
          variant="primary" 
          icon={<Icon name="Upload" size={18} />}
          className="!rounded-xl shadow-lg shadow-primary/20"
        />
      </div>

      <div className="flex-1 flex gap-8 min-h-0">
        {/* Main Grid Area */}
        <div className="flex-1 space-y-6 min-w-0 overflow-y-auto pr-2 custom-scrollbar">
          <div className="flex items-center gap-4 bg-white p-3 rounded-2xl border border-slate-200 shadow-sm">
            <div className="relative flex-1 max-w-md">
              <Icon name="Search" size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input 
                type="text" 
                placeholder="Search media..." 
                className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/10 focus:border-primary transition-all"
              />
            </div>
            <select className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none">
              <option>All Dates</option>
              <option>May 2026</option>
              <option>April 2026</option>
            </select>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-4 pb-8">
            {mockImages.map((img) => (
              <div 
                key={img.id}
                onClick={() => setSelectedId(img.id)}
                className={cn(
                  "aspect-square rounded-2xl overflow-hidden cursor-pointer border-4 transition-all duration-200 group relative",
                  selectedId === img.id ? "border-primary ring-4 ring-primary/10" : "border-white hover:border-slate-100 shadow-sm"
                )}
              >
                <img src={img.url} alt={img.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-3">
                  <p className="text-white text-[10px] truncate font-medium">{img.name}</p>
                </div>
                {selectedId === img.id && (
                  <div className="absolute top-2 right-2 bg-primary text-white p-1 rounded-full shadow-lg scale-in-center">
                    <Icon name="Check" size={12} strokeWidth={4} />
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Details Sidebar */}
        <div className="w-[350px] shrink-0">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden h-fit sticky top-0">
            {selectedImage ? (
              <div className="animate-in slide-in-from-right duration-300">
                <div className="p-1">
                  <div className="aspect-[4/3] rounded-t-xl overflow-hidden bg-slate-100">
                    <img src={selectedImage.url} alt={selectedImage.name} className="w-full h-full object-contain" />
                  </div>
                </div>
                <div className="p-6 space-y-6">
                  <div>
                    <h4 className="text-sm font-bold text-slate-900 uppercase tracking-widest mb-1 text-[10px]">File Details</h4>
                    <div className="space-y-2 mt-4">
                      <div className="flex justify-between text-xs">
                        <span className="text-slate-500 font-medium">Filename:</span>
                        <span className="text-slate-900 font-bold truncate ml-4">{selectedImage.name}</span>
                      </div>
                      <div className="flex justify-between text-xs">
                        <span className="text-slate-500 font-medium">Size:</span>
                        <span className="text-slate-900 font-bold">{selectedImage.size}</span>
                      </div>
                      <div className="flex justify-between text-xs">
                        <span className="text-slate-500 font-medium">Dimensions:</span>
                        <span className="text-slate-900 font-bold">1920 x 1080</span>
                      </div>
                      <div className="flex justify-between text-xs">
                        <span className="text-slate-500 font-medium">Uploaded on:</span>
                        <span className="text-slate-900 font-bold">{selectedImage.date}</span>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Alt Text</label>
                      <input 
                        type="text" 
                        defaultValue={selectedImage.name.split('.')[0]}
                        className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-primary/10"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Caption</label>
                      <textarea 
                        rows={2}
                        className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-primary/10 resize-none"
                      />
                    </div>
                  </div>

                  <div className="pt-4 flex gap-2 border-t border-slate-100">
                    <Button 
                      label="Copy Link" 
                      variant="secondary" 
                      icon={<Icon name="Copy" size={14} />}
                      className="flex-1 !py-2.5 !text-xs !rounded-xl"
                    />
                    <Button 
                      label="Delete" 
                      variant="ghost" 
                      icon={<Icon name="Trash2" size={14} />}
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
                <p className="text-sm text-slate-500">Select an image to view details</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
