import React from "react";
import { MentorApplicationTable } from "./components/MentorApplicationTable";
import { MOCK_MENTOR_APPLICATIONS } from "./mock-data/mentor-management.mock";
import { getTranslations } from "next-intl/server";
import {  Icon } from "@/core/ui";
import { cn } from "@/core/utils/cn";
import { Card } from "@/core/ui/Card";



import { mentorGateway } from "@/core/gateway/mentorGateway";

export default async function MentorManagementPage() {
  const t = await getTranslations("Admin.mentors");

  let applications = [];
  try {
    applications = await mentorGateway.getAllApplications();
  } catch (error) {
    console.error("Failed to fetch mentor applications:", error);
  }

  const pendingCount = applications.filter((app: any) => app.status === "PENDING").length;
  const approvedCount = applications.filter((app: any) => app.status === "APPROVED").length;
  const totalCount = applications.length;
  const approvalRate = totalCount > 0 ? Math.round((approvedCount / totalCount) * 100) : 100;

  const stats = [
    { 
      label: "PENDING APPLICATIONS", 
      value: pendingCount.toString(), 
      trend: `+${pendingCount} pending`, 
      icon: "ClipboardList", 
      color: "text-blue-600", 
      bg: "bg-blue-50" 
    },
    { 
      label: "TOTAL APPLICATIONS", 
      value: totalCount.toString(), 
      trend: "All-time submissions", 
      icon: "ShieldCheck", 
      color: "text-emerald-600", 
      bg: "bg-emerald-50" 
    },
    { 
      label: "APPROVAL RATE", 
      value: `${approvalRate}%`, 
      trend: `${approvedCount} approved`, 
      icon: "PieChart", 
      color: "text-amber-600", 
      bg: "bg-amber-50" 
    },
  ];

  return (
    <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-700">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {stats.map((stat) => (
          <Card key={stat.label} className="p-8 border-none shadow-sm hover:shadow-md transition-all">
            <div className="flex items-start justify-between">
              <div className="space-y-4">
                <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">
                  {stat.label}
                </p>
                <div className="flex items-baseline gap-3">
                  <h3 className="text-4xl font-extrabold text-[#181C20]">{stat.value}</h3>
                  <span className={cn(
                    "text-xs font-bold px-2 py-0.5 rounded-full",
                    stat.color,
                    stat.bg
                  )}>
                    {stat.trend}
                  </span>
                </div>
              </div>
              <div className={cn("p-3 rounded-2xl", stat.bg, stat.color)}>
                <Icon name={stat.icon as any} size={28} />
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* Table Section */}
      <Card className="p-8 border-none shadow-sm">
        <MentorApplicationTable initialData={applications} />
      </Card>
    </div>
  );
}

