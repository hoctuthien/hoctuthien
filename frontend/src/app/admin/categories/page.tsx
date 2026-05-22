"use client";

import React, { useState, useEffect } from "react";
import { Button, Icon } from "@/core/ui";
import { cn } from "@/core/utils/cn";
import {
  getCategoriesPaginatedAction,
  createCategoryAction,
  updateCategoryAction,
  deleteCategoryAction,
} from "../posts/actions/posts";
import { useDebounce } from "@/shared/hooks/useDebounce";

function generateSlug(text: string): string {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/đ/g, "d")
    .replace(/Đ/g, "d")
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

export default function AdminCategoriesPage() {
  const [categories, setCategories] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const debouncedSearch = useDebounce(searchQuery, 500);

  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const [limit, setLimit] = useState(5); // Default to 5 items per page for clear pagination testing
  const [meta, setMeta] = useState({
    total: 0,
    page: 1,
    limit: 5,
    totalPages: 0,
  });

  // Form states
  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [description, setDescription] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [isSlugManuallyEdited, setIsSlugManuallyEdited] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchCategories = async () => {
    try {
      setIsLoading(true);
      const res = await getCategoriesPaginatedAction(currentPage, limit, debouncedSearch);
      setCategories(res.data || []);
      setMeta(res.meta || { total: 0, page: currentPage, limit, totalPages: 0 });
    } catch (error) {
      console.error("Failed to load categories:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // Trigger fetch when dependencies change
  useEffect(() => {
    fetchCategories();
  }, [currentPage, limit, debouncedSearch]);

  // Reset page to 1 when search query changes
  useEffect(() => {
    setCurrentPage(1);
  }, [debouncedSearch]);

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setName(val);
    if (!isSlugManuallyEdited && !editingId) {
      setSlug(generateSlug(val));
    }
  };

  const handleSlugChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSlug(e.target.value);
    setIsSlugManuallyEdited(true);
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setName("");
    setSlug("");
    setDescription("");
    setIsSlugManuallyEdited(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return alert("Please enter a category name");

    try {
      setIsSubmitting(true);
      if (editingId) {
        await updateCategoryAction(editingId, name, slug, description);
        alert("Category updated successfully!");
      } else {
        await createCategoryAction(name, slug, description);
        alert("Category created successfully!");
      }
      handleCancelEdit();
      await fetchCategories();
    } catch (error: any) {
      alert(error.message || "Failed to save category");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEditClick = (cat: any) => {
    setEditingId(cat.id);
    setName(cat.name);
    setSlug(cat.slug || "");
    setDescription(cat.metadata?.description || "");
    setIsSlugManuallyEdited(true);
  };

  const handleDeleteClick = async (id: string, name: string) => {
    if (!confirm(`Are you sure you want to delete category "${name}"?`)) return;

    try {
      await deleteCategoryAction(id);
      alert("Category deleted successfully!");
      
      // If we deleted the last item on the last page, go to previous page
      if (categories.length === 1 && currentPage > 1) {
        setCurrentPage(currentPage - 1);
      } else {
        await fetchCategories();
      }
    } catch (error: any) {
      alert(error.message || "Failed to delete category");
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div>
        <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Categories</h1>
        <p className="text-slate-500 mt-1">Organize your posts into logical sections.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column: Form */}
        <div className="lg:col-span-4 space-y-6">
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm sticky top-8">
            <h3 className="text-lg font-bold text-slate-900 mb-6 flex items-center gap-2">
              <Icon name={editingId ? "Pencil" : "PlusCircle"} size={20} className="text-primary" />
              {editingId ? "Edit Category" : "Add New Category"}
            </h3>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-sm font-semibold text-slate-700">Name</label>
                <input 
                  type="text" 
                  value={name}
                  onChange={handleNameChange}
                  placeholder="e.g. Graphic Design"
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                  required
                />
                <p className="text-[11px] text-slate-400">How it appears on your site.</p>
              </div>

              <div className="space-y-1.5">
                <label className="text-sm font-semibold text-slate-700">Slug</label>
                <input 
                  type="text" 
                  value={slug}
                  onChange={handleSlugChange}
                  placeholder="e.g. graphic-design"
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                />
                <p className="text-[11px] text-slate-400">The "slug" is the URL-friendly version of the name.</p>
              </div>

              <div className="space-y-1.5">
                <label className="text-sm font-semibold text-slate-700">Description</label>
                <textarea 
                  rows={4}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Tell us about this category..."
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all resize-none"
                />
              </div>

              <div className="flex gap-2 pt-2">
                {editingId && (
                  <Button 
                    type="button"
                    onClick={handleCancelEdit}
                    label="Cancel" 
                    variant="secondary" 
                    className="flex-1 !rounded-xl !py-3" 
                  />
                )}
                <Button 
                  type="submit"
                  disabled={isSubmitting}
                  label={isSubmitting ? "Saving..." : (editingId ? "Update" : "Add Category")} 
                  variant="primary" 
                  className="flex-1 !rounded-xl !py-3 shadow-lg shadow-primary/20" 
                />
              </div>
            </form>
          </div>
        </div>

        {/* Right Column: Table */}
        <div className="lg:col-span-8">
          <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm flex flex-col h-full">
            <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
              <div className="relative w-64">
                <Icon name="Search" size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input 
                  type="text" 
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search categories..." 
                  className="w-full pl-9 pr-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-primary/10 focus:border-primary transition-all"
                />
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs text-slate-500">Rows per page:</span>
                <select
                  value={limit}
                  onChange={(e) => {
                    setLimit(Number(e.target.value));
                    setCurrentPage(1);
                  }}
                  className="bg-white border border-slate-200 rounded-lg px-2 py-1 text-xs focus:outline-none focus:ring-2 focus:ring-primary/10"
                >
                  <option value={5}>5</option>
                  <option value={10}>10</option>
                  <option value={20}>20</option>
                  <option value={50}>50</option>
                </select>
              </div>
            </div>

            <div className="flex-1 overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50/50">
                    <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Name</th>
                    <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Slug</th>
                    <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Description</th>
                    <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {isLoading ? (
                    <tr>
                      <td colSpan={4} className="px-6 py-12 text-center text-slate-400">
                        <Icon name="Loader2" size={24} className="animate-spin mx-auto mb-2" />
                        Loading categories...
                      </td>
                    </tr>
                  ) : categories.length === 0 ? (
                    <tr>
                      <td colSpan={4} className="px-6 py-12 text-center text-slate-400">
                        No categories found.
                      </td>
                    </tr>
                  ) : (
                    categories.map((cat) => (
                      <tr key={cat.id} className="hover:bg-slate-50/50 transition-colors group">
                        <td className="px-6 py-4">
                          <span className="font-bold text-slate-900 group-hover:text-primary transition-colors">{cat.name}</span>
                        </td>
                        <td className="px-6 py-4 text-sm text-slate-500 font-mono">
                          {cat.slug || "-"}
                        </td>
                        <td className="px-6 py-4 text-sm text-slate-500 max-w-[200px] truncate">
                          {cat.metadata?.description || cat.description || "-"}
                        </td>
                        <td className="px-6 py-4 text-right">
                          <div className="flex justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                            <Button 
                              variant="text" 
                              onClick={() => handleEditClick(cat)}
                              label={<Icon name="Pencil" size={16} />} 
                              className="!p-2 text-slate-400 hover:text-primary" 
                            />
                            <Button 
                              variant="text" 
                              onClick={() => handleDeleteClick(cat.id, cat.name)}
                              label={<Icon name="Trash2" size={16} />} 
                              className="!p-2 text-slate-400 hover:text-red-500" 
                            />
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
            
            {/* Pagination Controls */}
            <div className="p-4 border-t border-slate-100 flex items-center justify-between bg-slate-50/30 text-xs text-slate-500">
              <p>
                Showing {categories.length > 0 ? (currentPage - 1) * limit + 1 : 0} to{" "}
                {Math.min(currentPage * limit, meta.total)} of {meta.total} categories
              </p>
              
              {meta.totalPages > 1 && (
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                    disabled={currentPage === 1 || isLoading}
                    className="p-1.5 rounded-lg border border-slate-200 bg-white text-slate-600 disabled:opacity-50 hover:bg-slate-50 transition-colors disabled:cursor-not-allowed"
                  >
                    <Icon name="ChevronLeft" size={16} />
                  </button>
                  
                  {(() => {
                    const pages: (number | string)[] = [];
                    const totalPages = meta.totalPages;
                    
                    if (totalPages <= 5) {
                      for (let i = 1; i <= totalPages; i++) pages.push(i);
                    } else {
                      pages.push(1);
                      if (currentPage > 3) pages.push("...");
                      
                      const start = Math.max(2, currentPage - 1);
                      const end = Math.min(totalPages - 1, currentPage + 1);
                      
                      for (let i = start; i <= end; i++) pages.push(i);
                      
                      if (currentPage < totalPages - 2) pages.push("...");
                      pages.push(totalPages);
                    }

                    return pages.map((pageVal, index) => {
                      if (pageVal === "...") {
                        return (
                          <span key={`dots-${index}`} className="px-2 text-slate-400 font-semibold select-none">
                            ...
                          </span>
                        );
                      }
                      
                      const pageNumber = pageVal as number;
                      return (
                        <button
                          key={pageNumber}
                          onClick={() => setCurrentPage(pageNumber)}
                          disabled={isLoading}
                          className={cn(
                            "w-8 h-8 rounded-lg border text-xs font-semibold transition-all",
                            currentPage === pageNumber
                              ? "bg-primary border-primary text-white shadow-md shadow-primary/10"
                              : "border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
                          )}
                        >
                          {pageNumber}
                        </button>
                      );
                    });
                  })()}
                  
                  <button
                    onClick={() => setCurrentPage((prev) => Math.min(prev + 1, meta.totalPages))}
                    disabled={currentPage === meta.totalPages || isLoading}
                    className="p-1.5 rounded-lg border border-slate-200 bg-white text-slate-600 disabled:opacity-50 hover:bg-slate-50 transition-colors disabled:cursor-not-allowed"
                  >
                    <Icon name="ChevronRight" size={16} />
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
