"use client";

import React, { useState, useEffect } from "react";
import { Icon, Select } from "@/core/ui";
import { useRouter, useSearchParams } from "next/navigation";
import { useDebounce } from "@/shared/hooks/useDebounce";

interface PostFilterProps {
  categories: any[];
  tags: any[];
}

export function PostFilter({ categories, tags }: PostFilterProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  const [search, setSearch] = useState(searchParams.get("search") || "");
  const [categoryId, setCategoryId] = useState(searchParams.get("categoryId") || "");
  const [tagId, setTagId] = useState(searchParams.get("tagId") || "");
  
  const debouncedSearch = useDebounce(search, 500);

  useEffect(() => {
    const currentSearch = searchParams.get("search") || "";
    const currentCategoryId = searchParams.get("categoryId") || "";
    const currentTagId = searchParams.get("tagId") || "";

    // Nếu giá trị nhập vào trùng khớp với giá trị hiện tại trên URL, KHÔNG được gọi router.push để tránh lặp vô hạn
    if (
      debouncedSearch === currentSearch &&
      categoryId === currentCategoryId &&
      tagId === currentTagId
    ) {
      return;
    }

    const params = new URLSearchParams(searchParams.toString());
    
    if (debouncedSearch) {
      params.set("search", debouncedSearch);
    } else {
      params.delete("search");
    }
    
    if (categoryId) {
      params.set("categoryId", categoryId);
    } else {
      params.delete("categoryId");
    }
    
    if (tagId) {
      params.set("tagId", tagId);
    } else {
      params.delete("tagId");
    }
    
    // Luôn reset về trang 1 khi lọc
    params.delete("page");
    
    router.push(`/admin/posts?${params.toString()}`);
  }, [debouncedSearch, categoryId, tagId, router, searchParams]);

  const categoryOptions = [
    { label: "All Categories", value: "" },
    ...categories.map(c => ({ label: c.name, value: c.id }))
  ];

  const tagOptions = [
    { label: "All Tags", value: "" },
    ...tags.map(t => ({ label: t.name, value: t.id }))
  ];

  return (
    <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm flex flex-col md:flex-row gap-4 items-center">
      <div className="relative flex-1 group">
        <Icon 
          name="Search" 
          className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-primary transition-colors" 
          size={18} 
        />
        <input 
          type="text" 
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search posts by title..." 
          className="w-full pl-12 pr-4 py-3 bg-slate-50 border-transparent focus:bg-white focus:border-primary/20 focus:ring-4 focus:ring-primary/5 rounded-xl transition-all outline-none text-sm"
        />
      </div>
      
      <div className="flex flex-col sm:flex-row items-center gap-3 w-full md:w-auto">
        <div className="w-full sm:w-48">
          <Select
            options={categoryOptions}
            value={categoryId}
            onChange={(val) => setCategoryId(val)}
            placeholder="Category"
            className="!rounded-xl"
          />
        </div>
        
        <div className="w-full sm:w-48">
          <Select
            options={tagOptions}
            value={tagId}
            onChange={(val) => setTagId(val)}
            placeholder="Tag"
            className="!rounded-xl"
          />
        </div>
      </div>
    </div>
  );
}
