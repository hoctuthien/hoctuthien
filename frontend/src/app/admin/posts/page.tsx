"use client";

import React from "react";
import { Button, Icon, Badge, Input } from "@/core/ui";
import { cn } from "@/core/utils/cn";
import Link from "next/link";

const mockPosts = [
  {
    id: "1",
    title: "Modern UI Design Trends in 2026",
    slug: "modern-ui-design-trends-2026",
    author: "Admin Thang",
    category: "Design",
    status: "published",
    createdAt: "2026-05-14",
    image: "https://images.unsplash.com/photo-1558655146-d09347e92766?w=800&auto=format&fit=crop&q=60",
  },
  {
    id: "2",
    title: "Building Scalable Backend with NestJS",
    slug: "building-scalable-backend-nestjs",
    author: "Admin Thang",
    category: "Technology",
    status: "draft",
    createdAt: "2026-05-12",
    image: "https://images.unsplash.com/photo-1587620962725-abab7fe55159?w=800&auto=format&fit=crop&q=60",
  },
  {
    id: "3",
    title: "The Importance of Mentorship in Tech",
    slug: "importance-of-mentorship-tech",
    author: "Mentor Hoang",
    category: "Mentorship",
    status: "published",
    createdAt: "2026-05-10",
    image: "https://images.unsplash.com/photo-1522071823991-b99c223a7097?w=800&auto=format&fit=crop&q=60",
  },
];

export default function AdminPostsPage() {
  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Posts</h1>
          <p className="text-slate-500 mt-1">Manage your blog articles and content.</p>
        </div>
        <Link href="/admin/posts/new">
          <Button 
            label="Create New Post" 
            variant="primary" 
            icon={<Icon name="Plus" size={18} />}
            className="!rounded-xl shadow-lg shadow-primary/20"
          />
        </Link>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
        <div className="p-4 border-b border-slate-100 flex flex-col md:flex-row md:items-center gap-4 justify-between bg-slate-50/50">
          <div className="relative w-full md:w-96">
            <Icon name="Search" size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input 
              type="text" 
              placeholder="Search posts..." 
              className="w-full pl-10 pr-4 py-2 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
            />
          </div>
          <div className="flex items-center gap-2">
            <Button label="Filter" variant="secondary" icon={<Icon name="Filter" size={16} />} className="!py-2 !px-4 !rounded-lg text-xs" />
            <Button label="Export" variant="secondary" icon={<Icon name="Download" size={16} />} className="!py-2 !px-4 !rounded-lg text-xs" />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/50">
                <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Post</th>
                <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Author</th>
                <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Category</th>
                <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Date</th>
                <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {mockPosts.map((post) => (
                <tr key={post.id} className="hover:bg-slate-50/50 transition-colors group">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-lg bg-slate-100 overflow-hidden flex-shrink-0 border border-slate-200">
                        <img src={post.image} alt={post.title} className="w-full h-full object-cover" />
                      </div>
                      <div className="min-w-0">
                        <p className="font-semibold text-slate-900 truncate group-hover:text-primary transition-colors">{post.title}</p>
                        <p className="text-xs text-slate-500 truncate mt-0.5">/{post.slug}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center text-[10px] font-bold text-primary">
                        {post.author.charAt(0)}
                      </div>
                      <span className="text-sm text-slate-600">{post.author}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-800 border border-slate-200">
                      {post.category}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <Badge 
                      label={post.status.toUpperCase()} 
                      variant={post.status === 'published' ? 'success' : 'warning'} 
                      className="!rounded-lg !px-3 !py-1 text-[10px]"
                    />
                  </td>
                  <td className="px-6 py-4 text-sm text-slate-500">
                    {post.createdAt}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Button variant="ghost" icon={<Icon name="Pencil" size={16} />} className="!p-2 text-slate-400 hover:text-primary" />
                      <Button variant="ghost" icon={<Icon name="Trash2" size={16} />} className="!p-2 text-slate-400 hover:text-red-500" />
                      <Button variant="ghost" icon={<Icon name="MoreVertical" size={16} />} className="!p-2 text-slate-400" />
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="p-4 border-t border-slate-100 flex items-center justify-between bg-slate-50/30">
          <p className="text-xs text-slate-500">Showing 1 to 3 of 3 entries</p>
          <div className="flex items-center gap-1">
            <Button variant="secondary" icon={<Icon name="ChevronLeft" size={14} />} className="!p-2 !rounded-lg" disabled />
            <button className="w-8 h-8 rounded-lg bg-primary text-white text-xs font-bold shadow-md shadow-primary/20">1</button>
            <Button variant="secondary" icon={<Icon name="ChevronRight" size={14} />} className="!p-2 !rounded-lg" disabled />
          </div>
        </div>
      </div>
    </div>
  );
}
