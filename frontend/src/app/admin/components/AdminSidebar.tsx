"use client";

import React from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { Sidebar, SidebarItem, SidebarGroup } from "@/shared/components/Sidebar";
import { Button, Icon } from "@/core/ui";
import { useTranslations } from "next-intl";
import { cn } from "@/core/utils/cn";

export const AdminSidebar = ({ isCollapsed, onToggle }: { isCollapsed: boolean; onToggle: () => void }) => {
  const pathname = usePathname();
  const t = useTranslations("Admin.sidebar");

  const menuItems = [
    { label: t("dashboard"), href: "/admin/dashboard", icon: "LayoutDashboard" },
    { label: t("mentors"), href: "/admin/mentors", icon: "ClipboardList" },
    { label: t("users"), href: "/admin/users", icon: "ShieldCheck" },
    { label: t("courses"), href: "/admin/courses", icon: "BookOpen" },
    { label: t("penaltyTickets"), href: "/admin/penalty-tickets", icon: "AlertTriangle" },
    { label: t("bugReports"), href: "/admin/bug-reports", icon: "Bug" },
    { label: t("posts"), href: "/admin/posts", icon: "FileText" },
    { label: t("categories"), href: "/admin/categories", icon: "Layout" },
    { label: t("media"), href: "/admin/media", icon: "Image" },
    { label: t("settings"), href: "/admin/settings", icon: "Settings" },
  ];

  return (
    <Sidebar
      header={
        <div className={cn(
          "px-7 pt-2 flex flex-col transition-all duration-300",
          isCollapsed ? "opacity-0 invisible" : "opacity-100 visible"
        )}>
          <h1 className="text-xl font-bold text-[#2D89FF] tracking-tight">Admin Console</h1>
          <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-widest mt-0.5">
            Mentorship Governance
          </p>
        </div>
      }
      footer={
        <div className={cn(
          "p-4 transition-all duration-300",
          isCollapsed ? "opacity-0 invisible" : "opacity-100 visible"
        )}>
          <Button 
            label="Review Queue" 
            variant="primary" 
            className="w-full justify-center !rounded-xl !py-3 shadow-lg shadow-primary/20" 
          />
        </div>
      }
      className={cn(
        "hidden lg:flex transition-all duration-300",
        isCollapsed ? "!w-0 !border-none" : "w-[280px]"
      )}
    >
      <div className={cn(
        "flex flex-col gap-1 pt-6 transition-all duration-300",
        isCollapsed ? "opacity-0 invisible" : "opacity-100 visible"
      )}>
        {menuItems.map((item) => (
          <Link key={item.href} href={item.href} className="no-underline block">
            <SidebarItem
              icon={<Icon name={item.icon as any} size={20} />}
              label={item.label}
              isActive={pathname === item.href}
            />
          </Link>
        ))}
      </div>
    </Sidebar>
  );
};
