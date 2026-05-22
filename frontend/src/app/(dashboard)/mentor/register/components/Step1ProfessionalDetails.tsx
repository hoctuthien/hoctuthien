"use client";

import React from "react";
import { UseFormReturn } from "react-hook-form";
import { MentorRegisterValues } from "../mentor-register.schema";
import { Input, Icon } from "@/core/ui";
import { useTranslations } from "next-intl";

interface Props {
  form: UseFormReturn<MentorRegisterValues>;
}

export default function Step1ProfessionalDetails({ form }: Props) {
  const t = useTranslations("MentorRegister");
  const { register, formState: { errors } } = form;

  return (
    <div className="flex flex-col gap-8 animate-in fade-in slide-in-from-right-4 duration-500">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Input
          label={t("jobTitle")}
          placeholder={t("jobTitlePlaceholder")}
          {...register("jobTitle")}
          error={errors.jobTitle?.message}
        />
        <Input
          label={t("company")}
          placeholder={t("companyPlaceholder")}
          {...register("company")}
          error={errors.company?.message}
        />
        <Input
          label={t("yearsOfExperience")}
          type="number"
          placeholder={t("yearsOfExperiencePlaceholder")}
          {...register("yearsOfExperience", { valueAsNumber: true })}
          error={errors.yearsOfExperience?.message}
        />
        <div className="hidden md:block" />
      </div>
      <Input
        label={t("linkedinUrl")}
        placeholder={t("linkedinPlaceholder")}
        {...register("linkedinUrl")}
        error={errors.linkedinUrl?.message}
        iconLeft={<Icon name="ExternalLink" className="text-slate-400" size={18} />}
      />
    </div>
  );
}

