import React from "react";
import { Button, Icon, Badge } from "@/core/ui";
import Link from "next/link";
import { getPostsAction } from "./actions/posts";
import { DeletePostButton } from "./components/DeletePostButton";

export default async function AdminPostsPage() {
  let posts: any[] = [];
  try {
    const response = await getPostsAction();
    posts = response;
  } catch (error) {
    console.error("Error fetching posts:", error);
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-8 rounded-3xl border border-slate-100 shadow-sm">
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">Post Management</h1>
          <p className="text-slate-500 text-sm mt-1">Create, edit and manage your blog content.</p>
        </div>
        <Link href="/admin/posts/new">
          <Button 
            label="Create New Post" 
            variant="primary" 
            iconLeft={<Icon name="Plus" size={18} />}
            className="!rounded-xl shadow-lg shadow-primary/20"
          />
        </Link>
      </div>

      {/* Filters & Search */}
      <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm flex flex-col md:flex-row gap-4 items-center">
        <div className="relative flex-1 group">
          <Icon name="Search" className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-primary transition-colors" size={18} />
          <input 
            type="text" 
            placeholder="Search posts by title..." 
            className="w-full pl-12 pr-4 py-3 bg-slate-50 border-transparent focus:bg-white focus:border-primary/20 focus:ring-4 focus:ring-primary/5 rounded-xl transition-all outline-none text-sm"
          />
        </div>
        <div className="flex items-center gap-2">
          <Button label="Filter" variant="secondary" iconLeft={<Icon name="Filter" size={16} />} className="!py-2 !px-4 !rounded-lg text-xs" />
          <Button label="Export" variant="secondary" iconLeft={<Icon name="Download" size={16} />} className="!py-2 !px-4 !rounded-lg text-xs" />
        </div>
      </div>

      {/* Posts Table */}
      <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-slate-50/50 border-b border-slate-100">
                <th className="px-6 py-4 text-xs font-black text-slate-400 uppercase tracking-wider">Post Details</th>
                <th className="px-6 py-4 text-xs font-black text-slate-400 uppercase tracking-wider">Category</th>
                <th className="px-6 py-4 text-xs font-black text-slate-400 uppercase tracking-wider">Status</th>
                <th className="px-6 py-4 text-xs font-black text-slate-400 uppercase tracking-wider">Created At</th>
                <th className="px-6 py-4 text-xs font-black text-slate-400 uppercase tracking-wider text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {posts.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-20 text-center text-slate-400 italic">
                    No posts found. Start by creating one!
                  </td>
                </tr>
              ) : (
                posts.map((post) => (
                  <tr key={post.id} className="group hover:bg-slate-50/50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-xl bg-slate-100 flex-shrink-0 overflow-hidden border border-slate-200">
                          {post.coverImage ? (
                            <img src={post.coverImage.url} alt="" className="w-full h-full object-cover" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-slate-300">
                              <Icon name="Image" size={20} />
                            </div>
                          )}
                        </div>
                        <div>
                          <h3 className="text-sm font-bold text-slate-900 group-hover:text-primary transition-colors line-clamp-1">{post.title}</h3>
                          <div className="flex items-center gap-2 mt-0.5">
                            <span className="text-[10px] text-slate-400 font-medium">By Admin</span>
                            <div className="w-1 h-1 rounded-full bg-slate-200" />
                            <span className="text-[10px] text-slate-400 font-medium">12k views</span>
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-xs font-medium text-slate-600 bg-slate-100 px-2 py-1 rounded-md">
                        {post.category?.name || "Uncategorized"}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <Badge 
                        variant={post.status === 'published' ? 'success' : 'warning'} 
                        className="!rounded-lg !px-3 !py-1 text-[10px]"
                      >
                        {post.status?.toUpperCase() || "DRAFT"}
                      </Badge>
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-500 font-medium">
                      {new Date(post.createdAt).toLocaleDateString()}
                    </td>
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
          <p className="text-xs text-slate-500">Showing {posts.length} entries</p>
          <div className="flex items-center gap-1">
            <Button variant="secondary" label={<Icon name="ChevronLeft" size={14} />} className="!p-2 !rounded-lg" disabled />
            <button className="w-8 h-8 rounded-lg bg-primary text-white text-xs font-bold shadow-md shadow-primary/20">1</button>
            <Button variant="secondary" label={<Icon name="ChevronRight" size={14} />} className="!p-2 !rounded-lg" disabled />
          </div>
        </div>
      </div>
    </div>
  );
}
