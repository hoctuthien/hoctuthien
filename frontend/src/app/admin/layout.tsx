"use client";

import React, { useState } from "react";
import { AdminSidebar } from "./components/AdminSidebar";
import { AdminHeader } from "./components/AdminHeader";
import { cn } from "@/core/utils/cn";

export default function AdminLayout({
  children,
  modal,
}: {
  children: React.ReactNode;
  modal?: React.ReactNode;
}) {
  const [isCollapsed, setIsCollapsed] = useState(false);

  return (
    <div className="flex min-h-screen bg-[#F7F9FB]">
      <AdminSidebar isCollapsed={isCollapsed} onToggle={() => setIsCollapsed(!isCollapsed)} />

      <div className={cn(
        "flex-1 flex flex-col min-w-0 transition-all duration-300",
        isCollapsed ? "ml-0 lg:ml-0" : ""
      )}>
        <AdminHeader onToggleSidebar={() => setIsCollapsed(!isCollapsed)} isSidebarCollapsed={isCollapsed} />

        <main className="flex-1 p-6 lg:p-10 overflow-y-auto">
          {children}
          {modal}
        </main>
      </div>
    </div>
  );
}
