import { getTranslations } from 'next-intl/server';
import React from "react";
import { Button, Icon } from "@/core/ui";
import Link from "next/link";
import { getPostsAction, getCategoriesAction, getTagsAction } from "./actions/posts";
import { PostFilter } from "./components/PostFilter";
import { PostsTable } from "./components/PostsTable";

export default async function AdminPostsPage({
  searchParams
 }: {
  searchParams: Promise<{ categoryId?: string; tagId?: string; search?: string }>
}) {
  const tExtracted = await getTranslations('Extracted.appAdminPostsPage');
  const params = await searchParams;
  let posts: any[] = [];
  let categories: any[] = [];
  let tags: any[] = [];

  try {
    const [postsRes, catsRes, tagsRes] = await Promise.all([
      getPostsAction(params),
      getCategoriesAction(),
      getTagsAction()
    ]);
    posts = postsRes;
    categories = catsRes;
    tags = tagsRes;
  } catch (error) {
    console.error("Error fetching admin posts data:", error);
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-8 rounded-3xl border border-slate-100 shadow-sm">
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">{tExtracted('postManagement')}</h1>
          <p className="text-slate-500 text-sm mt-1">{tExtracted('createEditAndManageYourBlogContent')}</p>
        </div>
        <Link 
          href="/admin/posts/new"
          className="inline-flex items-center justify-center gap-2 font-[Montserrat] rounded-xl transition-all duration-300 outline-none select-none hover:cursor-pointer bg-primary text-white font-bold shadow-lg shadow-primary/20 hover:bg-[#004493] active:scale-95 text-base px-8 py-3 h-12 hover:no-underline"
        >
          <Icon name="Plus" size={18} />
          <span className="leading-tight">{tExtracted('createNewPost')}</span>
        </Link>
      </div>

      {/* Filters & Search */}
      <PostFilter categories={categories} tags={tags} />

      {/* Posts Table */}
      <PostsTable posts={posts} categories={categories} tags={tags} />
    </div>
  );
}
