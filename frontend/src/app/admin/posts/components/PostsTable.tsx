"use client";

import { useTranslations } from 'next-intl';
import React, { useState } from "react";
import { Button, Icon, Badge } from "@/core/ui";
import Link from "next/link";
import dynamic from "next/dynamic";
import { DeletePostButton } from "./DeletePostButton";

const BlockEditor = dynamic(() => import("./BlockEditor"), {
  ssr: false,
});

interface PostsTableProps {
  posts: any[];
  categories: any[];
  tags: any[];
}

export function PostsTable({ posts, categories, tags }: PostsTableProps) {
  const tExtracted = useTranslations('Extracted.appAdminPostsComponentsPostsTable');
  const [previewPost, setPreviewPost] = useState<any>(null);

  return (
    <>
      <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-slate-50/50 border-b border-slate-100">
                <th className="px-6 py-4 text-xs font-black text-slate-400 uppercase tracking-wider">{tExtracted('postDetails')}</th>
                <th className="px-6 py-4 text-xs font-black text-slate-400 uppercase tracking-wider">{tExtracted('category')}</th>
                <th className="px-6 py-4 text-xs font-black text-slate-400 uppercase tracking-wider">{tExtracted('status')}</th>
                <th className="px-6 py-4 text-xs font-black text-slate-400 uppercase tracking-wider">{tExtracted('createdAt')}</th>
                <th className="px-6 py-4 text-xs font-black text-slate-400 uppercase tracking-wider text-right">{tExtracted('actions')}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {posts.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-20 text-center text-slate-400 italic">
                    {tExtracted('noPostsFoundStartByCreatingOne')}</td>
                </tr>
              ) : (
                posts.map((post) => (
                  <tr
                    key={post.id}
                    className="group hover:bg-slate-50/50 transition-colors"
                  >
                    {/* Clickable Area: Post Details */}
                    <td
                      onClick={() => setPreviewPost(post)}
                      className="px-6 py-4 cursor-pointer"
                    >
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-xl bg-slate-100 flex-shrink-0 overflow-hidden border border-slate-200 shadow-sm transition-transform group-hover:scale-[1.03]">
                          {(post.metadata?.thumbnail || post.coverImage?.url) ? (
                            <img src={post.metadata?.thumbnail || post.coverImage?.url} alt="" className="w-full h-full object-cover" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-slate-300">
                              <Icon name="Image" size={20} />
                            </div>
                          )}
                        </div>
                        <div>
                          <h3 className="text-sm font-bold text-slate-900 group-hover:text-primary transition-colors line-clamp-1">
                            {post.title}
                          </h3>
                          <div className="flex items-center gap-2 mt-0.5">
                            <span className="text-[10px] text-slate-400 font-medium">{tExtracted('byAdmin')}</span>
                            <div className="w-1 h-1 rounded-full bg-slate-200" />
                            <span className="text-[10px] text-slate-400 font-medium">{tExtracted('xemTruocKhiClick')}</span>
                          </div>
                        </div>
                      </div>
                    </td>

                    {/* Clickable Area: Category */}
                    <td
                      onClick={() => setPreviewPost(post)}
                      className="px-6 py-4 cursor-pointer"
                    >
                      <span className="text-xs font-medium text-slate-600 bg-slate-100 px-2 py-1 rounded-md">
                        {post.category?.name || tExtracted('uncategorized')}
                      </span>
                    </td>

                    {/* Clickable Area: Status */}
                    <td
                      onClick={() => setPreviewPost(post)}
                      className="px-6 py-4 cursor-pointer"
                    >
                      <Badge
                        variant={post.status === 'published' ? "success" : "warning"}
                        className="!rounded-lg !px-3 !py-1 text-[10px]"
                      >
                        {post.status?.toUpperCase() || tExtracted('draft')}
                      </Badge>
                    </td>

                    {/* Clickable Area: Created At */}
                    <td
                      onClick={() => setPreviewPost(post)}
                      className="px-6 py-4 text-sm text-slate-500 font-medium cursor-pointer"
                    >
                      {new Date(post.createdAt).toLocaleDateString()}
                    </td>

                    {/* Action buttons (Standard behavior) */}
                    <td className="px-6 py-4 text-right">
                      <div className="flex justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Link href={`/admin/posts/${post.id}/edit`}>
                          <Button variant="text" label={<Icon name="Pencil" size={16} />} className="!p-2 text-slate-400 hover:text-primary" />
                        </Link>
                        <DeletePostButton postId={post.id} />
                        <Button variant="text" label={<Icon name="MoreVertical" size={16} />} className="!p-2 text-slate-400" />
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <div className="p-4 border-t border-slate-100 flex items-center justify-between bg-slate-50/30">
          <p className="text-xs text-slate-500">{tExtracted('showing')}{posts.length} {tExtracted('entries')}</p>
          <div className="flex items-center gap-1">
            <Button variant="secondary" label={<Icon name="ChevronLeft" size={14} />} className="!p-2 !rounded-lg" disabled />
            <button className="w-8 h-8 rounded-lg bg-primary text-white text-xs font-bold shadow-md shadow-primary/20">1</button>
            <Button variant="secondary" label={<Icon name="ChevronRight" size={14} />} className="!p-2 !rounded-lg" disabled />
          </div>
        </div>
      </div>

      {/* Gorgeous High-Fidelity Preview Modal */}
      {previewPost && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl w-full max-w-4xl max-h-[90vh] flex flex-col shadow-2xl border border-slate-100 overflow-hidden animate-in zoom-in-95 duration-200">
            {/* Modal Header */}
            <div className="px-8 py-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/50 shrink-0">
              <div className="flex items-center gap-3">
                <Icon name="Eye" className="text-primary" size={20} />
                <div>
                  <h3 className="text-base font-extrabold text-slate-900">{tExtracted('xemTruocBaiViet')}</h3>
                  <p className="text-[11px] text-slate-500">{tExtracted('cheDoXemTruocNoiDungXuatBan')}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Link href={`/admin/posts/${previewPost.id}/edit`}>
                  <Button
                    label={tExtracted('chinhSuaBaiViet')}
                    variant="primary"
                    iconLeft={<Icon name="Pencil" size={14} />}
                    className="!px-4 !py-2 !rounded-xl !text-xs shadow-lg shadow-primary/20"
                  />
                </Link>
                <button
                  onClick={() => setPreviewPost(null)}
                  className="p-2 rounded-xl hover:bg-slate-200 text-slate-400 hover:text-slate-700 transition-colors"
                >
                  <Icon name="X" size={20} />
                </button>
              </div>
            </div>

            {/* Modal Body (Scrollable Article Container) */}
            <div className="flex-1 overflow-y-auto px-8 py-10 custom-scrollbar bg-white">
              <div className="max-w-3xl mx-auto space-y-8">
                {/* Category & Date */}
                <div className="flex items-center gap-3 text-xs">
                  <span className="px-3 py-1 bg-primary/10 text-primary font-extrabold rounded-full uppercase tracking-wider">
                    {previewPost.category?.name || tExtracted('uncategorized')}
                  </span>
                  <span className="text-slate-400 font-medium">•</span>
                  <span className="text-slate-400 font-medium">
                    {new Date(previewPost.createdAt).toLocaleDateString('vi-VN', {
                      day: "numeric",
                      month: "long",
                      year: "numeric"
                    })}
                  </span>
                  <span className="text-slate-400 font-medium">•</span>
                  <Badge
                    variant={previewPost.status === 'published' ? "success" : "warning"}
                    className="!rounded-lg !px-2 !py-0.5 text-[9px]"
                  >
                    {previewPost.status?.toUpperCase()}
                  </Badge>
                </div>

                {/* Title */}
                <h1 className="text-3xl md:text-4xl font-extrabold text-slate-900 tracking-tight leading-tight">
                  {previewPost.title}
                </h1>

                {/* Author Info */}
                <div className="flex items-center gap-3 py-4 border-y border-slate-100">
                  <div className="w-10 h-10 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-sm">
                    {tExtracted('ad')}</div>
                  <div>
                    <p className="text-xs font-bold text-slate-900">{tExtracted('administrator')}</p>
                    <p className="text-[10px] text-slate-400 font-medium">{tExtracted('tacGiaBaiViet')}</p>
                  </div>
                </div>

                {/* Featured Image */}
                {(previewPost.metadata?.thumbnail || previewPost.coverImage?.url) && (
                  <div className="aspect-video w-full rounded-2xl overflow-hidden border border-slate-100 shadow-md">
                    <img
                      src={previewPost.metadata?.thumbnail || previewPost.coverImage?.url}
                      alt={tExtracted('featuredCover')}
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}

                {/* Content Render */}
                <div className="prose prose-slate max-w-none">
                  <BlockEditor
                    initialContent={previewPost.content}
                    onChange={() => {}}
                    editable={false}
                  />
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="px-8 py-4 border-t border-slate-100 flex justify-end gap-2 bg-slate-50 shrink-0">
              <Button
                label={tExtracted('dong')}
                variant="secondary"
                className="!px-5 !py-2 !rounded-xl !text-xs !bg-white hover:!bg-slate-100 !text-slate-700 font-semibold border border-slate-200"
                onClick={() => setPreviewPost(null)}
              />
            </div>
          </div>
        </div>
      )}
    </>
  );
}
