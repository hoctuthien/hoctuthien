"use client";

import React from "react";
import { usePathname } from "next/navigation";
import { useSession, signOut } from "next-auth/react";
import { Avatar, Icon, Dropdown, DropdownTrigger, DropdownMenu, DropdownItem, Skeleton } from "@/core/ui";
import { useTranslations } from "next-intl";

export const AdminHeader = ({ 
  onToggleSidebar, 
  isSidebarCollapsed 
}: { 
  onToggleSidebar: () => void; 
  isSidebarCollapsed: boolean; 
}) => {
  const { data: session, status } = useSession();
  const t = useTranslations("Admin.header");
  const commonT = useTranslations("Common");
  const pathname = usePathname();
  const isLoading = status === "loading";

  const getPageTitle = () => {
    if (pathname.includes("dashboard")) return "Dashboard Overview";
    if (pathname.includes("mentors")) return "Application Review";
    return "Admin Console";
  };

  return (
    <header className="h-24 bg-white/80 backdrop-blur-md sticky top-0 z-30 px-10 flex items-center justify-between">
      <div className="flex items-center gap-6">
        <button 
          onClick={onToggleSidebar}
          className="p-2.5 text-slate-500 hover:text-primary hover:bg-slate-50 rounded-xl transition-all"
        >
          <Icon name={isSidebarCollapsed ? "PanelLeftOpen" : "PanelLeftClose"} size={22} />
        </button>

        <div className="flex flex-col">
          <p className="text-[11px] font-bold text-[#2D89FF] uppercase tracking-[0.2em] mb-1">
            Administrative Panel
          </p>
          <h2 className="text-3xl font-extrabold text-[#181C20] tracking-tight">
            {getPageTitle()}
          </h2>
        </div>
      </div>

      <div className="flex items-center gap-8">
        <button className="relative p-2.5 text-slate-400 hover:text-primary hover:bg-slate-50 rounded-full transition-all">
          <Icon name="Bell" size={22} />
          <span className="absolute top-2 right-2 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-white" />
        </button>

        <div className="h-10 w-px bg-slate-100" />

        <Dropdown>
          <DropdownTrigger variant="text" hideIcon className="!p-0 hover:bg-transparent">
            <div className="flex items-center gap-4 cursor-pointer group">
              <div className="text-right hidden sm:block">
                {isLoading ? (
                  <div className="space-y-1">
                    <Skeleton className="h-4 w-24" />
                    <Skeleton className="h-3 w-32" />
                  </div>
                ) : (
                  <>
                    <p className="text-sm font-bold text-[#181C20] group-hover:text-[#2D89FF] transition-colors">
                      {session?.user?.name || "Anonymous User"}
                    </p>
                    <p className="text-[11px] text-slate-400 font-semibold uppercase tracking-wider">
                      {session?.user?.role || "Administrator"}
                    </p>
                  </>
                )}
              </div>
              
              {isLoading ? (
                <Skeleton className="h-12 w-12 rounded-full" />
              ) : (
                <Avatar 
                  src={session?.user?.image || undefined} 
                  name={session?.user?.name || "Admin"} 
                  size="md"
                  className="ring-4 ring-slate-50 group-hover:ring-[#DDEBFF] transition-all"
                />
              )}
            </div>
          </DropdownTrigger>
          <DropdownMenu className="min-w-[200px] mt-4">
            <DropdownItem icon={<Icon name="User" size={18} />}>{t("profile")}</DropdownItem>
            <DropdownItem icon={<Icon name="Settings" size={18} />}>{t("settings")}</DropdownItem>
            <div className="h-px bg-surface-variant my-1" />
            <DropdownItem 
              icon={<Icon name="LogOut" size={18} />} 
              isDanger 
              onClick={() => signOut({ callbackUrl: "/login" })}
            >
              {commonT("signOut")}
            </DropdownItem>
          </DropdownMenu>
        </Dropdown>
      </div>
    </header>
  );
};
