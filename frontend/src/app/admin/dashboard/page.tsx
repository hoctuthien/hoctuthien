import {Icon } from "@/core/ui";
import { Card } from "@/core/ui/Card";
import { getTranslations } from "next-intl/server";

export default async function AdminDashboard() {
  const t = await getTranslations("Admin.dashboard");
    
  const stats = [
    { label: t("totalUsers"), value: "2,543", icon: "Users", color: "text-blue-600", bg: "bg-blue-50" },
    { label: t("pendingMentors"), value: "12", icon: "Clock", color: "text-amber-600", bg: "bg-amber-50" },
    { label: t("activeCourses"), value: "48", icon: "BookOpen", color: "text-green-600", bg: "bg-green-50" },
    { label: t("totalDonations"), value: "12,450,000đ", icon: "Heart", color: "text-rose-600", bg: "bg-rose-50" },
  ];

  return (
    <div className="space-y-10">
      <div>
        <h1 className="text-3xl font-bold text-[#181C20] mb-2">{t("title")}</h1>
        <p className="text-text-muted">{t("subtitle")}</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat) => (
          <Card key={stat.label} padding="lg" className="border-none shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center gap-3">
              <div className={`${stat.bg} ${stat.color} p-2.5 rounded-xl flex-shrink-0`}>
                <Icon name={stat.icon as any} size={20} />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-semibold text-text-muted mb-1 truncate">{stat.label}</p>
                <p className="text-xl lg:text-2xl font-bold text-text-heading truncate" title={stat.value}>
                  {stat.value}
                </p>
              </div>
            </div>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <Card className="lg:col-span-2 border-none shadow-sm h-[400px] flex items-center justify-center text-text-muted">
          {t("analytics")}
        </Card>
        <Card className="lg:col-span-1 border-none shadow-sm h-[400px] flex items-center justify-center text-text-muted">
          {t("recentActivities")}
        </Card>
      </div>
    </div>
  );
}
