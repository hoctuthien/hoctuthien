"use client";

import React, { useState, useTransition } from "react";
import { Icon, Select } from "@/core/ui";
import { useRouter, useSearchParams } from "next/navigation";

export const MentorshipFilters = () => {
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
    { label: "All Skills", value: "" },
    { label: "React", value: "React" },
    { label: "TypeScript", value: "TypeScript" },
    { label: "NestJS", value: "NestJS" },
    { label: "Node.js", value: "Node" },
    { label: "Python", value: "Python" },
    { label: "English", value: "English" },
    { label: "UI/UX", value: "UI/UX" },
  ];

  const experienceOptions = [
    { label: "Any Experience", value: "" },
    { label: "1+ Years", value: "1" },
    { label: "3+ Years", value: "3" },
    { label: "5+ Years", value: "5" },
    { label: "8+ Years", value: "8" },
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
          placeholder="Search mentors by name, company, bio... (Press Enter to search)" 
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
            placeholder="Skill Filter"
            className="!rounded-xl"
          />
        </div>

        <div className="w-full sm:w-48">
          <Select
            options={experienceOptions}
            value={minExperience}
            onChange={(val) => handleFilterChange("minExperience", val)}
            placeholder="Experience"
            className="!rounded-xl"
          />
        </div>
      </div>
    </div>
  );
};
