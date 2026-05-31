import React from "react";
import { Card } from "@/core/ui/Card";
import { Avatar, Icon, Badge } from "@/core/ui";

interface User {
  name: string;
  email: string;
  avatarUrl?: string | null;
}

interface ApplicantSidebarProps {
  user: User;
  linkedinUrl?: string;
  jobTitle: string;
  company: string;
  yearsOfExperience: string | number;
  skills?: string[];
  formattedDate: string;
  viewLinkedinLabel: string;
  sendEmailLabel: string;
  appliedOnLabel: string;
  jobTitleLabel: string;
  companyLabel: string;
  experienceLabel: string;
  experienceValue: string;
  expertiseLabel: string;
  noSkillsMessage: string;
  sidebarTitle: string;
}

export function ApplicantSidebar({
  user,
  linkedinUrl,
  jobTitle,
  company,
  yearsOfExperience,
  skills = [],
  formattedDate,
  viewLinkedinLabel,
  sendEmailLabel,
  appliedOnLabel,
  jobTitleLabel,
  companyLabel,
  experienceLabel,
  experienceValue,
  expertiseLabel,
  noSkillsMessage,
  sidebarTitle,
}: ApplicantSidebarProps) {
  return (
    <div className="space-y-8">
      {/* Candidate Card */}
      <Card className="p-8 border-none shadow-sm hover:shadow-md transition-all flex flex-col items-center text-center space-y-6 relative overflow-hidden">
        <div className="absolute top-0 inset-x-0 h-2 bg-gradient-to-r from-violet-500 to-indigo-500" />

        <div className="relative">
          <Avatar
            name={user?.name}
            src={user?.avatarUrl || undefined}
            size="lg"
            className="w-24 h-24 rounded-full border-4 border-white shadow-lg relative z-10"
          />
          <div className="absolute inset-0 rounded-full bg-indigo-500/10 blur-md scale-110" />
        </div>

        <div className="space-y-2">
          <h2 className="text-xl font-extrabold text-slate-900">{user?.name}</h2>
          <p className="text-xs font-semibold text-slate-400">{user?.email}</p>
        </div>

        <div className="w-full h-px bg-slate-100" />

        {/* Action Buttons */}
        <div className="w-full space-y-3">
          {linkedinUrl && (
            <a
              href={linkedinUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full py-3 px-4 bg-[#0a66c2] hover:bg-[#004182] text-white rounded-xl text-xs font-extrabold flex items-center justify-center gap-2 shadow-md shadow-blue-500/10 hover:shadow-lg transition-all active:scale-[0.98]"
            >
              <Icon name={"Linkedin" as any} size={16} />
              <span>{viewLinkedinLabel}</span>
            </a>
          )}

          <a
            href={`mailto:${user?.email}`}
            className="w-full py-3 px-4 bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200 hover:border-slate-300 rounded-xl text-xs font-extrabold flex items-center justify-center gap-2 transition-all active:scale-[0.98]"
          >
            <Icon name="Mail" size={16} className="text-slate-400" />
            <span>{sendEmailLabel}</span>
          </a>
        </div>

        <div className="text-[11px] text-slate-400 font-medium">
          {appliedOnLabel}: <span className="font-bold text-slate-600">{formattedDate}</span>
        </div>
      </Card>

      {/* Professional Metadata Card */}
      <Card className="p-8 border-none shadow-sm hover:shadow-md transition-all space-y-6">
        <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest">
          {sidebarTitle}
        </h3>

        <div className="space-y-5">
          {/* Job Title */}
          <div className="flex items-start gap-4">
            <div className="p-2.5 bg-slate-100 text-slate-600 rounded-xl shrink-0">
              <Icon name="Briefcase" size={16} />
            </div>
            <div>
              <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">{jobTitleLabel}</p>
              <p className="text-sm font-extrabold text-slate-800 mt-0.5">{jobTitle}</p>
            </div>
          </div>

          {/* Company */}
          <div className="flex items-start gap-4">
            <div className="p-2.5 bg-slate-100 text-slate-600 rounded-xl shrink-0">
              <Icon name="Building" size={16} />
            </div>
            <div>
              <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">{companyLabel}</p>
              <p className="text-sm font-extrabold text-slate-800 mt-0.5">{company}</p>
            </div>
          </div>

          {/* Years of Experience */}
          <div className="flex items-start gap-4">
            <div className="p-2.5 bg-slate-100 text-slate-600 rounded-xl shrink-0">
              <Icon name="Clock" size={16} />
            </div>
            <div>
              <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">{experienceLabel}</p>
              <p className="text-sm font-extrabold text-slate-800 mt-0.5">{experienceValue}</p>
            </div>
          </div>
        </div>

        <div className="h-px bg-slate-100" />

        {/* Skills List */}
        <div className="space-y-4">
          <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">{expertiseLabel}</p>

          {skills.length > 0 ? (
            <div className="flex flex-wrap gap-2">
              {skills.map((skill, idx) => (
                <Badge
                  key={idx}
                  variant="primary"
                  className="!px-3 !py-1 !text-xs !bg-primary/5 !text-primary !border-primary/10 !rounded-lg"
                >
                  {skill}
                </Badge>
              ))}
            </div>
          ) : (
            <p className="text-xs text-slate-400 italic">{noSkillsMessage}</p>
          )}
        </div>
      </Card>
    </div>
  );
}
