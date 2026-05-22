"use client";

import React, { useState } from "react";
import { DataTable, Column } from "@/shared/components/DataTable/DataTable";
import { Badge, Avatar, Icon, Dropdown, DropdownTrigger, DropdownMenu, DropdownItem, Button } from "@/core/ui";

import { AdminMentorApplication } from "../mock-data/mentor-management.types";
import { useTranslations } from "next-intl";

export const MentorApplicationTable = ({ initialData }: { initialData: AdminMentorApplication[] }) => {
  const [data, setData] = useState(initialData);
  const t = useTranslations("Admin.mentors");

  const columns: Column<AdminMentorApplication>[] = [
    {
      key: "name",
      header: t("applicant"),
      render: (item) => (
        <div className="flex items-center gap-3">
          <Avatar name={item.user.name} src={item.user.avatarUrl || undefined} size="sm" className="w-8 h-8" />
          <div>
            <p className="font-bold text-[#1e293b]">{item.user.name}</p>
            <p className="text-[12px] text-slate-400 font-normal">{item.user.email}</p>
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
          <p className="text-[12px] text-slate-400">{item.yearsOfExperience} năm kn.</p>
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
        } as const;
        return <Badge variant={variants[item.status]}>{item.status}</Badge>;
      },
    },
  ];

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-bold text-slate-800">{t("tableTitle")}</h2>
        <div className="flex gap-3">
          <Button label={t("filter")} variant="outline" size="sm" iconLeft={<Icon name="Filter" size={16} />} />
          <Button label={t("export")} variant="outline" size="sm" iconLeft={<Icon name="Download" size={16} />} />
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
    </div>
  );
};
