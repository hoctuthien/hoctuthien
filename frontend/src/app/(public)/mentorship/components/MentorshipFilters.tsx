"use client";

import { useTranslations } from 'next-intl';
import React, { useState, useTransition } from "react";
import { Icon, Select } from "@/core/ui";
import { useRouter, useSearchParams } from "next/navigation";

export const MentorshipFilters = () => {
  const tExtracted = useTranslations('Extracted.appPublicMentorshipComponentsMentorshipFilters');
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  const [search, setSearch] = useState(searchParams.get("search") || "");
  const skills = searchParams.get("skills") || "";
  const minExperience = searchParams.get("minExperience") || "";

  const handleFilterChange = (key: string, value: string) => {
    startTransition(() => {
      const params = new URLSearchParams(searchParams.toString());
      if (value) {
        params.set(key, value);
      } else {
        params.delete(key);
      }
      params.delete("page");
      router.push(`/mentorship?${params.toString()}`, { scroll: false });
    });
  };

  const handleSearchSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    startTransition(() => {
      const params = new URLSearchParams(searchParams.toString());
      if (search) {
        params.set("search", search);
      } else {
        params.delete("search");
      }
      params.delete("page");
      router.push(`/mentorship?${params.toString()}`, { scroll: false });
    });
  };

  const skillOptions = [
    { label: tExtracted('allSkills'), value: "" },
    { label: tExtracted('react'), value: "React" },
    { label: tExtracted('typescript'), value: "TypeScript" },
    { label: tExtracted('nestjs'), value: "NestJS" },
    { label: tExtracted('nodeJs'), value: "Node" },
    { label: tExtracted('python'), value: "Python" },
    { label: tExtracted('english'), value: "English" },
    { label: tExtracted('uiUx'), value: "UI/UX" },
  ];

  const experienceOptions = [
    { label: tExtracted('anyExperience'), value: "" },
    { label: tExtracted('text1Years'), value: "1" },
    { label: tExtracted('text3Years'), value: "3" },
    { label: tExtracted('text5Years'), value: "5" },
    { label: tExtracted('text8Years'), value: "8" },
  ];

  return (
    <div className={`bg-white p-6 rounded-3xl border border-slate-100 shadow-sm flex flex-col md:flex-row gap-4 items-center mb-10 transition-opacity duration-200 ${isPending ? "opacity-60" : "opacity-100"}`}>
      {/* Search Input inside Form */}
      <form onSubmit={handleSearchSubmit} className="relative flex-1 w-full group">
        <Icon
          name="Search"
          className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-primary transition-colors"
          size={18}
        />
        <input
          type="text"
          name="search"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder={tExtracted('searchMentorsByNameCompanyBioPressEnter')}
          className="w-full pl-12 pr-4 py-3 bg-slate-50 border-transparent focus:bg-white focus:border-primary/20 focus:ring-4 focus:ring-primary/5 rounded-xl transition-all outline-none text-sm"
        />
      </form>

      {/* Select Dropdowns */}
      <div className="flex flex-col sm:flex-row items-center gap-3 w-full md:w-auto">
        <div className="w-full sm:w-48">
          <Select
            options={skillOptions}
            value={skills}
            onChange={(val) => handleFilterChange("skills", val)}
            placeholder={tExtracted('skillFilter')}
            className="!rounded-xl"
          />
        </div>

        <div className="w-full sm:w-48">
          <Select
            options={experienceOptions}
            value={minExperience}
            onChange={(val) => handleFilterChange("minExperience", val)}
            placeholder={tExtracted('experience')}
            className="!rounded-xl"
          />
        </div>
      </div>
    </div>
  );
};
