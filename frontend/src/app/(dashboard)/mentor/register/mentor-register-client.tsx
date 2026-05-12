"use client";

import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { getMentorRegisterSchema, MentorRegisterValues } from "./mentor-register.schema";
import { Button, Icon } from "@/core/ui";
import { cn } from "@/core/utils/cn";
import { useRouter } from "next/navigation";
import dynamic from "next/dynamic";
import { mentorGateway } from "@/core/gateway";
import { useTranslations } from "next-intl";

const Step1ProfessionalDetails = dynamic(() => import("./components").then(mod => mod.Step1ProfessionalDetails));
const Step2ExpertiseBio = dynamic(() => import("./components").then(mod => mod.Step2ExpertiseBio));
const Step3Credentials = dynamic(() => import("./components").then(mod => mod.Step3Credentials));

export default function MentorRegisterClient() {
  const t = useTranslations("MentorRegister");
  const [currentStep, setCurrentStep] = useState(0);
  const router = useRouter();

  const STEPS = [
    { title: t("stepTitle1"), icon: "Briefcase" },
    { title: t("stepTitle2"), icon: "Award" },
    { title: t("stepTitle3"), icon: "FileText" },
  ];

  const form = useForm<MentorRegisterValues>({
    resolver: zodResolver(getMentorRegisterSchema(t)),
    defaultValues: {
      jobTitle: "",
      company: "",
      yearsOfExperience: 0,
      linkedinUrl: "",
      bio: "",
      skills: [],
      note: "",
      metadata: {
        certificates: [],
        degrees: [],
      },
    },
    mode: "onChange",
  });

  const onSubmit = async (data: MentorRegisterValues) => {
    try {
      console.log("Submitting Mentor Application:", data);
      await mentorGateway.createMentorAvailability(data);
      alert(t("successMessage"));
      router.push("/");
    } catch (error: any) {
      console.error("Failed to submit application:", error);
      const errorMessage = error?.response?.data?.error?.message || t("errorMessage");
      alert(errorMessage);
    }
  };

  const nextStep = async () => {
    let fieldsToValidate: any[] = [];
    if (currentStep === 0) {
      fieldsToValidate = ["jobTitle", "company", "yearsOfExperience", "linkedinUrl"];
    } else if (currentStep === 1) {
      fieldsToValidate = ["skills", "bio", "note"];
    }

    const isValid = await form.trigger(fieldsToValidate);
    if (isValid) {
      setCurrentStep((prev) => Math.min(prev + 1, STEPS.length - 1));
    }
  };

  const prevStep = () => {
    setCurrentStep((prev) => Math.max(prev - 1, 0));
  };

  return (
    <div className="min-h-screen bg-[#F7F9FB] pt-10 pb-20 px-4">
      <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-12">
        
        {/* Left Side: Info & Progress */}
        <div className="lg:col-span-5 flex flex-col gap-8">
          <div className="flex flex-col gap-4">
            <span className="inline-flex items-center px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-bold uppercase tracking-wider w-fit">
              {t("step", { current: currentStep + 1, total: STEPS.length })}
            </span>
            <h1 className="text-4xl lg:text-5xl font-bold text-[#181C20] leading-tight font-[Plus Jakarta Sans]">
              {t("title")} <span className="text-primary">{t("titleHighlight")}</span>
            </h1>
            <p className="text-lg text-[#727785] font-[Plus Jakarta Sans]">
              {t("subtitle")}
            </p>
          </div>

          <div className="flex flex-col gap-6">
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-xl bg-white shadow-sm flex items-center justify-center flex-shrink-0 border border-slate-100">
                <Icon name="ShieldCheck" className="text-primary" size={20} />
              </div>
              <div>
                <h3 className="font-bold text-[#181C20]">{t("identityTitle")}</h3>
                <p className="text-sm text-[#727785]">{t("identityDesc")}</p>
              </div>
            </div>
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-xl bg-white shadow-sm flex items-center justify-center flex-shrink-0 border border-slate-100">
                <Icon name="Globe" className="text-primary" size={20} />
              </div>
              <div>
                <h3 className="font-bold text-[#181C20]">{t("networkTitle")}</h3>
                <p className="text-sm text-[#727785]">{t("networkDesc")}</p>
              </div>
            </div>
          </div>

          <div className="mt-auto hidden lg:block">
            <div className="relative rounded-3xl overflow-hidden aspect-video shadow-2xl">
              <img 
                src="https://images.unsplash.com/photo-1515187029135-18ee286d815b?auto=format&fit=crop&q=80&w=1000" 
                alt="Mentorship" 
                className="object-cover w-full h-full"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex items-end p-8">
                <p className="text-white font-medium italic">{t("quote")}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Right Side: Form */}
        <div className="lg:col-span-7">
          <div className="bg-white rounded-[32px] shadow-[0_20px_50px_rgba(0,0,0,0.05)] border border-slate-50 p-8 lg:p-12">
            
            {/* Horizontal Steps Header */}
            <div className="flex items-center gap-4 mb-10 pb-6 border-b border-slate-100">
              {STEPS.map((step, idx) => (
                <React.Fragment key={idx}>
                  <div className="flex items-center gap-3">
                    <div className={cn(
                      "w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold transition-all duration-300",
                      currentStep === idx ? "bg-primary text-white shadow-lg shadow-primary/20" : 
                      currentStep > idx ? "bg-green-500 text-white" : "bg-slate-100 text-slate-400"
                    )}>
                      {currentStep > idx ? <Icon name="Check" size={16} /> : idx + 1}
                    </div>
                    <span className={cn(
                      "text-sm font-semibold transition-colors",
                      currentStep === idx ? "text-primary" : "text-slate-400"
                    )}>
                      {step.title}
                    </span>
                  </div>
                  {idx < STEPS.length - 1 && (
                    <div className="h-[2px] w-8 bg-slate-100 mx-2" />
                  )}
                </React.Fragment>
              ))}
            </div>

            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
              {currentStep === 0 && (
                <Step1ProfessionalDetails form={form} />
              )}
              
              {currentStep === 1 && (
                <Step2ExpertiseBio form={form} />
              )}

              {currentStep === 2 && (
                <Step3Credentials form={form} />
              )}

              <div className="flex items-center justify-between pt-8 border-t border-slate-100">
                <button
                  type="button"
                  onClick={currentStep === 0 ? () => router.back() : prevStep}
                  className="flex items-center gap-2 text-slate-500 font-semibold hover:text-primary transition-colors px-4 py-2"
                >
                  <Icon name="ArrowLeft" size={20} />
                  {currentStep === 0 ? t("cancel") : t("goBack")}
                </button>

                {currentStep < STEPS.length - 1 ? (
                  <Button 
                    key="next-btn"
                    type="button" 
                    onClick={nextStep}
                    label={
                      <div className="flex items-center">
                        {t("nextStep")}
                        <Icon name="ArrowRight" className="ml-2" size={20} />
                      </div>
                    }
                    className="h-[54px] px-10 rounded-2xl shadow-xl shadow-primary/20"
                  />
                ) : (
                  <Button 
                    key="submit-btn"
                    type="submit"
                    label={
                      <div className="flex items-center">
                        {t("completeProfile")}
                        <Icon name="Check" className="ml-2" size={20} />
                      </div>
                    }
                    className="h-[54px] px-10 rounded-2xl shadow-xl shadow-primary/20"
                    loading={form.formState.isSubmitting}
                  />
                )}
              </div>
            </form>
          </div>
        </div>

      </div>
    </div>
  );
}

