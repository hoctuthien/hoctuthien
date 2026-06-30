import React from "react";
import Link from "next/link";
import { getTranslations } from "next-intl/server";
import { Icon, Button } from "@/core/ui";
import { mentorApplicationsGateway } from "@/core/gateway";

// Import modular presentational components
import { ApplicationHeader } from "./components/ApplicationHeader";
import { ApplicationBioAndNote } from "./components/ApplicationBioAndNote";
import { ApplicationQualifications } from "./components/ApplicationQualifications";
import { ApplicantSidebar } from "./components/ApplicantSidebar";

interface PageProps {
  params: Promise<{ id: string }> | { id: string };
}

export default async function MentorApplicationDetailPage(props: PageProps) {
  const tExtracted = await getTranslations('Extracted.appAdminMentorsIdPage');
  // Await params as required by Next.js 15+ App Router patterns
  const resolvedParams = await props.params;
  const id = resolvedParams.id;

  const tMentors = await getTranslations("Admin.mentors");
  const tRegister = await getTranslations("MentorRegister");

  let application: any = null;
  let fetchError = null;

  try {
    application = await mentorApplicationsGateway.getApplicationDetail(id);
  } catch (error: any) {
    console.error("Failed to fetch mentor application detail:", error);
    fetchError = error.message || tMentors("loadError");
  }

  // Handle error case
  if (fetchError || !application) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center p-8 space-y-6">
        <div className="p-4 bg-red-50 text-red-600 rounded-2xl">
          <Icon name="AlertTriangle" size={48} />
        </div>
        <div className="text-center space-y-2">
          <h3 className="text-xl font-bold text-slate-800">{tMentors("notFoundTitle")}</h3>
          <p className="text-sm text-slate-400 max-w-md">
            {fetchError || tMentors("notFoundDesc")}
          </p>
        </div>
        <Link href="/admin/mentors">
          <Button
            label={tMentors('backToList')}
            variant="outline"
            iconLeft={<Icon name="ArrowLeft" size={16} />}
            className="!px-6 !py-2.5 !rounded-xl"
          />
        </Link>
      </div>
    );
  }

  // Status mapping to types compatible with Badge
  const statusMapping: Record<
    string,
    { label: string; variant: "warning" | "primary" | "success" | "error" | "neutral" }
  > = {
    PENDING: { label: tMentors("statusPending"), variant: "warning" },
    IN_PROGRESS: { label: tMentors("statusInProgress"), variant: "primary" },
    APPROVED: { label: tMentors("statusApproved"), variant: "success" },
    REJECTED: { label: tMentors("statusRejected"), variant: "error" },
    CANCELLED: { label: tMentors("statusCancelled"), variant: "neutral" },
  };

  const currentStatus = statusMapping[application.status] || {
    label: application.status,
    variant: "neutral",
  };

  const formattedDate = new Date(application.createdAt).toLocaleDateString("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700 pb-16">
      {/* Component 1: Application Title & Status & Action Buttons Header */}
      <ApplicationHeader
        id={application.id}
        name={application.user?.name || "Không tên"}
        status={application.status}
        statusLabel={currentStatus.label}
        statusVariant={currentStatus.variant}
        titleTranslation={tMentors("title")}
        detailTranslation={tMentors("detailTitle")}
        approveLabel={tMentors("approve")}
        rejectLabel={tMentors("reject")}
        startProcessingLabel={tExtracted('tienHanhXuLy')}
      />

      {/* Main Two-Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Full Professional Details (Col span 2) */}
        <div className="lg:col-span-2 space-y-8">
          {/* Component 2: Biography & Private Notes */}
          <ApplicationBioAndNote
            bio={application.bio}
            note={application.note}
            bioLabel={tRegister("professionalBio")}
            noteLabel={tRegister("noteToAdmin")}
            noNoteMessage={tMentors("noNoteMessage")}
          />

          {/* Component 3: Academic Degrees & Professional Certificates */}
          <ApplicationQualifications
            metadata={application.metadata}
            degreesLabel={tRegister("degrees")}
            certificatesLabel={tRegister("certificates")}
            viewDegreeLabel={tMentors("viewVerificationDegree")}
            viewCertLabel={tMentors("viewVerificationCert")}
            noDegreesMessage={tMentors("noDegreesMessage")}
            noCertificatesMessage={tMentors("noCertificatesMessage")}
          />
        </div>

        {/* Right Column: Profile Summary & Sidebar Details (Col span 1) */}
        <div className="lg:col-span-1">
          {/* Component 4: Applicant Summary & Skills Sidebar Card */}
          <ApplicantSidebar
            user={application.user}
            linkedinUrl={application.linkedinUrl}
            jobTitle={application.jobTitle}
            company={application.company}
            yearsOfExperience={application.yearsOfExperience}
            skills={application.skills}
            formattedDate={formattedDate}
            viewLinkedinLabel={tMentors("viewLinkedin")}
            sendEmailLabel={tMentors("sendEmail")}
            appliedOnLabel={tMentors("appliedOn")}
            jobTitleLabel={tRegister("jobTitle")}
            companyLabel={tRegister("company")}
            experienceLabel={tRegister("yearsOfExperience")}
            experienceValue={tMentors("yearsCount", { count: application.yearsOfExperience })}
            expertiseLabel={tRegister("teachingExpertise")}
            noSkillsMessage={tMentors("noSkillsMessage")}
            sidebarTitle={tMentors("professional")}
          />
        </div>
      </div>
    </div>
  );
}
