"use client";

import React, { useState } from "react";
import { Button, Icon, Badge } from "@/core/ui";
import { cn } from "@/core/utils/cn";
import Link from "next/link";

export default function AdminEditorPage() {
  const [title, setTitle] = useState("Modern UI Design Trends in 2026");
  const [status, setStatus] = useState("draft");

  return (
    <div className="h-full flex flex-col -m-6 lg:-m-10 bg-white">
      {/* Editor Header */}
      <div className="h-16 border-b border-slate-100 px-6 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-4">
          <Link href="/admin/posts">
            <Button variant="ghost" icon={<Icon name="ArrowLeft" size={18} />} className="!p-2 text-slate-400 hover:text-slate-900" />
          </Link>
          <div className="h-4 w-px bg-slate-200" />
          <div className="flex items-center gap-2 text-xs font-medium text-slate-400">
            <span>Posts</span>
            <Icon name="ChevronRight" size={12} />
            <span className="text-slate-900 truncate max-w-[200px]">{title || "Untitled Post"}</span>
          </div>
          <Badge label={status.toUpperCase()} variant="warning" className="!text-[9px] !px-2 !py-0.5 ml-2" />
        </div>

        <div className="flex items-center gap-2">
          <Button label="Preview" variant="secondary" icon={<Icon name="Eye" size={16} />} className="!px-4 !py-2 !rounded-xl !text-xs" />
          <Button label="Save Draft" variant="secondary" className="!px-4 !py-2 !rounded-xl !text-xs" />
          <Button label="Publish" variant="primary" className="!px-6 !py-2 !rounded-xl !text-xs shadow-lg shadow-primary/20" />
          <div className="h-4 w-px bg-slate-200 mx-2" />
          <Button variant="ghost" icon={<Icon name="Settings" size={18} />} className="!p-2 text-slate-400" />
        </div>
      </div>

      <div className="flex-1 flex overflow-hidden">
        {/* Editor Content Area */}
        <div className="flex-1 overflow-y-auto px-6 py-12 custom-scrollbar">
          <div className="max-w-3xl mx-auto space-y-8 animate-in slide-in-from-bottom-4 duration-700">
            {/* Title Section */}
            <textarea
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Post Title..."
              rows={1}
              className="w-full text-5xl font-black text-slate-900 placeholder:text-slate-200 focus:outline-none resize-none leading-tight tracking-tight"
              style={{ height: 'auto' }}
            />

            {/* Block Simulation */}
            <div className="space-y-6 text-xl text-slate-700 leading-relaxed font-serif">
              <p className="relative group">
                <span className="absolute -left-8 top-1 opacity-0 group-hover:opacity-100 transition-opacity cursor-grab text-slate-300">
                  <Icon name="GripVertical" size={20} />
                </span>
                The landscape of digital interface design is evolving at an unprecedented pace. As we move through 2026, we're seeing a shift from pure minimalism towards more expressive, multi-layered aesthetics that prioritize depth and tactile feedback.
              </p>

              <h2 className="text-3xl font-bold text-slate-900 pt-4 tracking-tight">1. The Rise of Dynamic Glassmorphism</h2>
              
              <div className="my-10 rounded-3xl overflow-hidden shadow-2xl shadow-black/10 border border-slate-100 group relative">
                <img 
                  src="https://images.unsplash.com/photo-1558655146-d09347e92766?w=1200&auto=format&fit=crop&q=80" 
                  className="w-full aspect-video object-cover" 
                />
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors flex items-center justify-center opacity-0 group-hover:opacity-100">
                  <Button label="Change Image" variant="primary" className="!rounded-xl" />
                </div>
              </div>

              <p>
                Glassmorphism is no longer just about blurred backgrounds. In 2026, it's about <span className="bg-primary/10 text-primary px-1 rounded">refraction and light play</span>. Surfaces now react dynamically to the underlying content, creating a sense of physical space that was previously impossible to achieve on flat screens.
              </p>

              <div className="p-6 bg-slate-50 border-l-4 border-primary rounded-r-2xl italic text-slate-600">
                "Design is not just what it looks like and feels like. Design is how it works." — A philosophy that remains the North Star for modern UX.
              </div>

              <p className="text-slate-300 italic text-lg pt-4 animate-pulse">
                Click here to add a new block...
              </p>
            </div>
          </div>
        </div>

        {/* Editor Sidebar */}
        <div className="w-80 border-l border-slate-100 bg-slate-50/50 overflow-y-auto hidden xl:block p-6 space-y-8">
          <div>
            <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] mb-6">Post Settings</h4>
            
            <div className="space-y-6">
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-700">Category</label>
                <select className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/10 focus:border-primary transition-all shadow-sm">
                  <option>Design</option>
                  <option>Technology</option>
                  <option>Mentorship</option>
                </select>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-700">Tags</label>
                <div className="flex flex-wrap gap-2 p-3 bg-white border border-slate-200 rounded-xl min-h-[100px] shadow-sm">
                  <Badge label="UI Design" variant="secondary" className="!rounded-lg" />
                  <Badge label="Trends 2026" variant="secondary" className="!rounded-lg" />
                  <button className="text-xs text-primary font-bold hover:underline ml-1">+ Add Tag</button>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-700">Featured Image</label>
                <div className="aspect-video rounded-xl bg-slate-200 border-2 border-dashed border-slate-300 flex flex-col items-center justify-center gap-2 group cursor-pointer hover:bg-slate-100 transition-colors shadow-sm">
                  <Icon name="Upload" size={24} className="text-slate-400 group-hover:text-primary transition-colors" />
                  <span className="text-[10px] font-bold text-slate-400 group-hover:text-primary uppercase tracking-wider">Set Image</span>
                </div>
              </div>

              <div className="space-y-2 pt-4">
                <label className="text-xs font-bold text-slate-700 flex items-center justify-between">
                  SEO Summary
                  <span className="text-[10px] font-normal text-slate-400">120/160</span>
                </label>
                <textarea 
                  rows={4}
                  className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2.5 text-xs focus:outline-none focus:ring-2 focus:ring-primary/10 focus:border-primary transition-all shadow-sm resize-none"
                  placeholder="Summarize this post for search engines..."
                />
              </div>

              <div className="pt-6 border-t border-slate-200">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-700">Allow Comments</span>
                  <div className="w-10 h-5 bg-primary rounded-full relative">
                    <div className="absolute right-1 top-1 w-3 h-3 bg-white rounded-full shadow-sm" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
