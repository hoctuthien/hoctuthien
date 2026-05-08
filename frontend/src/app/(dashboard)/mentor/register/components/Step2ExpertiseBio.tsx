"use client";

import React from "react";
import { UseFormReturn, useFieldArray } from "react-hook-form";
import { MentorRegisterValues } from "../mentor-register.schema";
import { Icon } from "@/core/ui";
import { Textarea } from "@/shared/components/Textarea";
import { cn } from "@/core/utils/cn";

interface Props {
  form: UseFormReturn<MentorRegisterValues>;
}

const EXPERTISE_OPTIONS = [
  { label: "Software Development", icon: "Code" },
  { label: "Data Science", icon: "Database" },
  { label: "Design & Creative", icon: "Palette" },
  { label: "Business & Marketing", icon: "TrendingUp" },
  { label: "Language & Literature", icon: "Languages" },
  { label: "Science & Engineering", icon: "Atom" },
];

export default function Step2ExpertiseBio({ form }: Props) {
  const { register, formState: { errors }, watch, setValue } = form;
  const selectedSkills = watch("skills") || [];

  const toggleSkill = (skill: string) => {
    if (selectedSkills.includes(skill)) {
      setValue("skills", selectedSkills.filter(s => s !== skill), { shouldValidate: true });
    } else {
      setValue("skills", [...selectedSkills, skill], { shouldValidate: true });
    }
  };

  return (
    <div className="flex flex-col gap-8 animate-in fade-in slide-in-from-right-4 duration-500">
      
      {/* Expertise Selection */}
      <div className="flex flex-col gap-4">
        <label className="text-sm font-semibold text-[#181C20] font-[Montserrat]">
          Teaching Expertise
        </label>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {EXPERTISE_OPTIONS.map((opt) => {
            const isSelected = selectedSkills.includes(opt.label);
            return (
              <button
                key={opt.label}
                type="button"
                onClick={() => toggleSkill(opt.label)}
                className={cn(
                  "flex flex-col items-center justify-center p-6 rounded-2xl border-2 transition-all duration-300 gap-3 group",
                  isSelected 
                    ? "border-primary bg-primary/5 text-primary shadow-lg shadow-primary/10" 
                    : "border-slate-100 bg-slate-50/50 text-slate-500 hover:border-slate-200 hover:bg-white"
                )}
              >
                <div className={cn(
                  "w-12 h-12 rounded-xl flex items-center justify-center transition-colors",
                  isSelected ? "bg-primary text-white" : "bg-white text-slate-400 group-hover:text-primary"
                )}>
                  <Icon name={opt.icon as any} size={24} />
                </div>
                <span className="text-sm font-bold text-center leading-tight">
                  {opt.label}
                </span>
                {isSelected && (
                  <div className="absolute top-2 right-2 w-5 h-5 bg-primary text-white rounded-full flex items-center justify-center">
                    <Icon name="Check" size={12} />
                  </div>
                )}
              </button>
            );
          })}
        </div>
        {errors.skills && (
          <span className="text-[12px] font-medium text-red-500 font-[Montserrat]">
            {errors.skills.message}
          </span>
        )}
      </div>

      {/* Bio */}
      <Textarea
        label="Professional Bio"
        placeholder="Briefly describe your career journey, mentorship philosophy, and what you hope to achieve..."
        {...register("bio")}
        error={errors.bio?.message}
        className="min-h-[150px]"
      />

      {/* Note to Admin */}
      <Textarea
        label="Note to Admin (Optional)"
        placeholder="Any additional information you'd like to share with the review team..."
        {...register("note")}
        error={errors.note?.message}
        className="min-h-[100px]"
      />

      {/* Info Box */}
      <div className="bg-slate-50 border border-slate-200 rounded-2xl p-6 flex gap-4">
        <Icon name="Info" className="text-primary flex-shrink-0" size={24} />
        <p className="text-sm text-[#727785] leading-relaxed">
          Your application will be reviewed by our team within 3-5 business days. Once approved, you will be able to create courses and start mentoring.
        </p>
      </div>
    </div>
  );
}
