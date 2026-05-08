"use client";

import React from "react";
import { UseFormReturn } from "react-hook-form";
import { MentorRegisterValues } from "../mentor-register.schema";
import { Input, InputNumber, Icon } from "@/core/ui";

interface Props {
  form: UseFormReturn<MentorRegisterValues>;
}

export default function Step1ProfessionalDetails({ form }: Props) {
  const { register, formState: { errors }, control } = form;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-in fade-in slide-in-from-right-4 duration-500">
      <div className="md:col-span-1">
        <Input
          label="Job Title"
          placeholder="e.g. Senior Software Engineer"
          {...register("jobTitle")}
          error={errors.jobTitle?.message}
        />
      </div>
      <div className="md:col-span-1">
        <Input
          label="Company"
          placeholder="e.g. Google, Meta"
          {...register("company")}
          error={errors.company?.message}
        />
      </div>
      <div className="md:col-span-1">
        <Input
          label="Years of Experience"
          type="number"
          placeholder="e.g. 5"
          {...register("yearsOfExperience", { valueAsNumber: true })}
          error={errors.yearsOfExperience?.message}
        />
      </div>
      <div className="md:col-span-2">
        <Input
          label="LinkedIn Profile URL"
          placeholder="https://linkedin.com/in/your-profile"
          {...register("linkedinUrl")}
          error={errors.linkedinUrl?.message}
          iconLeft={<Icon name="ExternalLink" className="text-slate-400" size={18} />}
        />
      </div>
    </div>
  );
}
