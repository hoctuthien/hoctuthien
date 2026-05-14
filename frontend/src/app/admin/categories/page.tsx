"use client";

import React from "react";
import { Button, Icon, Badge, Input } from "@/core/ui";
import { cn } from "@/core/utils/cn";

const mockCategories = [
  { id: "1", name: "Design", slug: "design", count: 12, status: "active" },
  { id: "2", name: "Technology", slug: "technology", count: 8, status: "active" },
  { id: "3", name: "Mentorship", slug: "mentorship", count: 5, status: "active" },
  { id: "4", name: "Marketing", slug: "marketing", count: 3, status: "active" },
  { id: "5", name: "Business", slug: "business", count: 7, status: "active" },
];

export default function AdminCategoriesPage() {
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
              <Icon name="PlusCircle" size={20} className="text-primary" />
              Add New Category
            </h3>
            
            <div className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-sm font-semibold text-slate-700">Name</label>
                <input 
                  type="text" 
                  placeholder="e.g. Graphic Design"
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                />
                <p className="text-[11px] text-slate-400">How it appears on your site.</p>
              </div>

              <div className="space-y-1.5">
                <label className="text-sm font-semibold text-slate-700">Slug</label>
                <input 
                  type="text" 
                  placeholder="e.g. graphic-design"
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                />
                <p className="text-[11px] text-slate-400">The "slug" is the URL-friendly version of the name.</p>
              </div>

              <div className="space-y-1.5">
                <label className="text-sm font-semibold text-slate-700">Description</label>
                <textarea 
                  rows={4}
                  placeholder="Tell us about this category..."
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all resize-none"
                />
              </div>

              <Button 
                label="Add Category" 
                variant="primary" 
                className="w-full !rounded-xl !py-3 shadow-lg shadow-primary/20 mt-4" 
              />
            </div>
          </div>
        </div>

        {/* Right Column: Table */}
        <div className="lg:col-span-8">
          <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
            <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
              <div className="relative w-64">
                <Icon name="Search" size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input 
                  type="text" 
                  placeholder="Search categories..." 
                  className="w-full pl-9 pr-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-primary/10 focus:border-primary transition-all"
                />
              </div>
              <div className="flex items-center gap-2">
                <Button label="Bulk Actions" variant="secondary" className="!py-1.5 !px-3 !rounded-lg text-xs" />
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50/50">
                    <th className="w-12 px-6 py-4">
                      <input type="checkbox" className="rounded border-slate-300 text-primary focus:ring-primary/20" />
                    </th>
                    <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Name</th>
                    <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Slug</th>
                    <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider text-center">Count</th>
                    <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {mockCategories.map((cat) => (
                    <tr key={cat.id} className="hover:bg-slate-50/50 transition-colors group">
                      <td className="px-6 py-4 text-center">
                        <input type="checkbox" className="rounded border-slate-300 text-primary focus:ring-primary/20" />
                      </td>
                      <td className="px-6 py-4">
                        <span className="font-bold text-slate-900 group-hover:text-primary transition-colors">{cat.name}</span>
                      </td>
                      <td className="px-6 py-4 text-sm text-slate-500 font-mono">
                        {cat.slug}
                      </td>
                      <td className="px-6 py-4 text-center">
                        <span className="inline-flex items-center px-2 py-0.5 rounded-md text-xs font-bold bg-slate-100 text-slate-600 border border-slate-200">
                          {cat.count}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <Button variant="text" label={<Icon name="Pencil" size={16} />} className="!p-2 text-slate-400 hover:text-primary" />
                          <Button variant="text" label={<Icon name="Trash2" size={16} />} className="!p-2 text-slate-400 hover:text-red-500" />
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            
            <div className="p-4 border-t border-slate-100 flex items-center justify-between bg-slate-50/30 text-xs text-slate-500">
              <p>5 categories in total</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
