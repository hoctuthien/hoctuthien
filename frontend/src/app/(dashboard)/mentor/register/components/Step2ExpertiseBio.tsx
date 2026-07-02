"use client";

import React, { useState } from "react";
import { UseFormReturn } from "react-hook-form";
import { MentorRegisterValues } from "../mentor-register.schema";
import { Icon, Input } from "@/core/ui";
import { Textarea } from "@/shared/components/Textarea";
import { cn } from "@/core/utils/cn";
import { useTranslations } from "next-intl";

interface Props {
  form: UseFormReturn<MentorRegisterValues>;
}

export default function Step2ExpertiseBio({ form }: Props) {
  const tExtracted = useTranslations('Extracted.appDashboardMentorRegisterComponentsStep2ExpertiseBio');  const t = useTranslations("MentorRegister");
  const { register, formState: { errors }, watch, setValue } = form;
  const selectedSkills = watch("skills") || [];
  const [customSkill, setCustomSkill] = useState("");

  const EXPERTISE_OPTIONS = [
    { label: t("expSoftware"), icon: "Code" },
    { label: t("expDataScience"), icon: "Database" },
    { label: t("expDesign"), icon: "Palette" },
    { label: t("expBusiness"), icon: "TrendingUp" },
    { label: t("expLanguage"), icon: "Languages" },
    { label: t("expScience"), icon: "Atom" },
  ];

  const toggleSkill = (skill: string) => {
    if (selectedSkills.includes(skill)) {
      setValue("skills", selectedSkills.filter(s => s !== skill), { shouldValidate: true });
    } else {
      setValue("skills", [...selectedSkills, skill], { shouldValidate: true });
    }
  };

  const addCustomSkill = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault();
      if (customSkill.trim() && !selectedSkills.includes(customSkill.trim())) {
        setValue("skills", [...selectedSkills, customSkill.trim()], { shouldValidate: true });
        setCustomSkill("");
      }
    }
  };

  const predefinedLabels = EXPERTISE_OPTIONS.map(opt => opt.label);
  const customSkills = selectedSkills.filter(skill => !predefinedLabels.includes(skill));

  return (
    <div className="flex flex-col gap-8 animate-in fade-in slide-in-from-right-4 duration-500">

      {/* Expertise Selection */}
      <div className="flex flex-col gap-4">
        <label className="text-sm font-semibold text-[#181C20] font-[Montserrat]">
          {t("teachingExpertise")}
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
                  "relative flex flex-col items-center justify-center p-6 rounded-2xl border-2 transition-all duration-300 gap-3 group",
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

        {/* Custom Skills Input */}
        <div className="mt-4 flex flex-col gap-3">
          <Input
            placeholder={t('addSkillPlaceholder')}
            value={customSkill}
            onChange={(e) => setCustomSkill(e.target.value)}
            onKeyDown={addCustomSkill}
            iconLeft={<Icon name="Plus" className="text-slate-400" size={18} />}
          />

          {customSkills.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {customSkills.map((skill) => (
                <div
                  key={skill}
                  className="flex items-center gap-2 px-3 py-1.5 bg-white border border-slate-200 rounded-full text-xs font-semibold text-slate-700 shadow-sm animate-in zoom-in-95 duration-200"
                >
                  {skill}
                  <button
                    type="button"
                    onClick={() => toggleSkill(skill)}
                    className="text-slate-400 hover:text-red-500 transition-colors"
                  >
                    <Icon name="X" size={14} />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {errors.skills && (
          <span className="text-[12px] font-medium text-red-500 font-[Montserrat]">
            {errors.skills.message}
          </span>
        )}
      </div>

      {/* Bio */}
      <Textarea
        label={t('professionalBio')}
        placeholder={t('bioPlaceholder')}
        {...register("bio")}
        error={errors.bio?.message}
        className="min-h-[150px]"
      />

      {/* Note to Admin */}
      <Textarea
        label={t('noteToAdmin')}
        placeholder={t('notePlaceholder')}
        {...register("note")}
        error={errors.note?.message}
        className="min-h-[100px]"
      />

      {/* Info Box */}
      <div className="bg-slate-50 border border-slate-200 rounded-2xl p-6 flex gap-4">
        <Icon name="Info" className="text-primary flex-shrink-0" size={24} />
        <p className="text-sm text-[#727785] leading-relaxed">
          {t("reviewInfo")}
        </p>
      </div>
    </div>
  );
}

