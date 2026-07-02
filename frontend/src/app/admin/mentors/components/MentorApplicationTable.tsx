"use client";

import React, { useState, useEffect } from "react";
import { DataTable, Column } from "@/shared/components/DataTable/DataTable";
import { Badge, Avatar, Icon, Button, Select } from "@/core/ui";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useDebounce } from "@/shared/hooks/useDebounce";

import { AdminMentorApplication } from "../mock-data/mentor-management.types";
import { useTranslations } from "next-intl";

interface MentorApplicationTableProps {
  initialData: AdminMentorApplication[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export const MentorApplicationTable = ({ initialData, meta }: MentorApplicationTableProps) => {
  const tExtracted = useTranslations('Extracted.appAdminMentorsComponentsMentorApplicationTable');
  const [data, setData] = useState(initialData);
  const t = useTranslations("Admin.mentors");
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    setData(initialData);
  }, [initialData]);

  const [search, setSearch] = useState(searchParams.get("search") || "");
  const [status, setStatus] = useState(searchParams.get("status") || "");

  const debouncedSearch = useDebounce(search, 500);

  useEffect(() => {
    const currentSearch = searchParams.get("search") || "";
    const currentStatus = searchParams.get("status") || "";

    if (debouncedSearch === currentSearch && status === currentStatus) {
      return;
    }

    const params = new URLSearchParams(searchParams.toString());

    if (debouncedSearch) {
      params.set("search", debouncedSearch);
    } else {
      params.delete("search");
    }

    if (status) {
      params.set("status", status);
    } else {
      params.delete("status");
    }

    params.delete("page");

    router.push(`/admin/mentors?${params.toString()}`);
  }, [debouncedSearch, status, router, searchParams]);

  const handlePageChange = (newPage: number) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("page", newPage.toString());
    router.push(`/admin/mentors?${params.toString()}`);
  };

  const statusOptions = [
    { label: tExtracted('allStatuses'), value: "" },
    { label: tExtracted('pending'), value: "PENDING" },
    { label: tExtracted('inProgress'), value: "IN_PROGRESS" },
    { label: tExtracted('approved'), value: "APPROVED" },
    { label: tExtracted('rejected'), value: "REJECTED" },
  ];

  const columns: Column<AdminMentorApplication>[] = [
    {
      key: "name",
      header: t("applicant"),
      render: (item) => (
        <div className="flex items-center gap-3">
          <Avatar name={item.user?.name || "N/A"} src={item.user?.avatarUrl || undefined} size="sm" className="w-8 h-8" />
          <div>
            <p className="font-bold text-[#1e293b]">{item.user?.name || tExtracted('nA')}</p>
            <p className="text-[12px] text-slate-400 font-normal">{item.user?.email || tExtracted('nA')}</p>
          </div>
        </div>
      ),
    },
    {
      key: "jobTitle",
      header: t("professional"),
      render: (item) => (
        <div>
          <p className="font-semibold text-slate-700">{item.jobTitle}</p>
          <p className="text-[12px] text-slate-400">{t("yearsCountAbbrev", { count: item.yearsOfExperience })}</p>
        </div>
      )
    },
    {
      key: "appliedAt",
      header: t("appliedDate"),
      render: (item) => (
        <span className="text-slate-500">{new Date(item.createdAt).toLocaleDateString("vi-VN")}</span>
      )
    },
    {
      key: "status",
      header: t("status"),
      render: (item) => {
        const variants = {
          PENDING: "warning",
          IN_PROGRESS: "primary",
          APPROVED: "success",
          REJECTED: "error",
          CANCELLED: "neutral",
          CANCEL: "neutral",
        } as const;
        return <Badge variant={variants[item.status] || "neutral"}>{item.status}</Badge>;
      },
    },
    {
      key: "actions",
      header: t("viewDetails"),
      render: (item) => (
        <Link href={`/admin/mentors/${item.id}`}>
          <Button
            label={t('viewDetails')}
            variant="outline"
            size="sm"
            iconLeft={<Icon name="Eye" size={14} />}
            className="!px-3 !py-1 text-xs hover:bg-slate-50 transition-colors"
          />
        </Link>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
        <h2 className="text-xl font-bold text-slate-800">{t("tableTitle")}</h2>

        <div className="flex flex-col sm:flex-row items-center gap-3 w-full md:w-auto">
          {/* Search Box */}
          <div className="relative w-full sm:w-64 group">
            <Icon
              name="Search"
              className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-primary transition-colors"
              size={16}
            />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder={tExtracted('searchApplications')}
              className="w-full pl-10 pr-4 py-2 bg-slate-50 border-transparent focus:bg-white focus:border-primary/20 focus:ring-4 focus:ring-primary/5 rounded-xl transition-all outline-none text-xs"
            />
          </div>

          {/* Status Dropdown */}
          <div className="w-full sm:w-44">
            <Select
              options={statusOptions}
              value={status}
              onChange={(val) => setStatus(val)}
              placeholder={tExtracted('status')}
              className="!rounded-xl"
            />
          </div>

          <Button label={t('export')} variant="outline" size="sm" iconLeft={<Icon name="Download" size={16} />} className="w-full sm:w-auto" />
        </div>
      </div>

      <DataTable
        data={data}
        columns={columns}
        onSelect={(id) => {
          setData(prev => prev.map(item =>
            item.id === id ? { ...item, selected: !item.selected } : item
          ));
        }}
        onSelectAll={() => {
          const allSelected = data.every(item => item.selected);
          setData(prev => prev.map(item => ({ ...item, selected: !allSelected })));
        }}
      />

      {/* Pagination Controls */}
      {meta && meta.totalPages > 1 && (
        <div className="p-4 border border-slate-100 flex items-center justify-between bg-slate-50/30 rounded-2xl mt-4">
          <p className="text-xs text-slate-500">
            {tExtracted('showing')}{data.length} {tExtracted('entriesOf')}{meta.total} {tExtracted('total')}</p>
          <div className="flex items-center gap-1">
            <Button
              variant="secondary"
              label={<Icon name="ChevronLeft" size={14} />}
              className="!p-2 !rounded-lg"
              onClick={() => handlePageChange(meta.page - 1)}
              disabled={meta.page <= 1}
            />

            {Array.from({ length: meta.totalPages }, (_, i) => i + 1).map((p) => (
              <button
                key={p}
                onClick={() => handlePageChange(p)}
                className={`w-8 h-8 rounded-lg text-xs font-bold transition-all ${
                  meta.page === p
                    ? "bg-primary text-white shadow-md shadow-primary/20"
                    : "hover:bg-slate-100 text-slate-600"
                }`}
              >
                {p}
              </button>
            ))}

            <Button
              variant="secondary"
              label={<Icon name="ChevronRight" size={14} />}
              className="!p-2 !rounded-lg"
              onClick={() => handlePageChange(meta.page + 1)}
              disabled={meta.page >= meta.totalPages}
            />
          </div>
        </div>
      )}
    </div>
  );
};
