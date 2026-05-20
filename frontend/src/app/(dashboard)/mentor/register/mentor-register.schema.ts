import { z } from "zod";

export const getMentorRegisterSchema = (t: any) => z.object({
  jobTitle: z.string().min(2, t("validation.jobTitleMin")),
  company: z.string().min(2, t("validation.companyMin")),
  yearsOfExperience: z.coerce.number().min(0, t("validation.yearsMin")),
  linkedinUrl: z.string().url(t("validation.linkedinUrl")),
  bio: z.string().min(50, t("validation.bioMin")),
  skills: z.array(z.string()).min(1, t("validation.skillsMin")),
  note: z.string().optional(),
  metadata: z.object({
    certificates: z.array(z.object({
      name: z.string().min(1, t("validation.certNameRequired")),
      issuedBy: z.string().optional(),
      imageUrl: z.string().url(t("validation.certImageRequired")),
    })).default([]),
    degrees: z.array(z.object({
      name: z.string().min(1, t("validation.degreeNameRequired")),
      university: z.string().optional(),
      imageUrl: z.string().url(t("validation.degreeImageRequired")),
    })).default([]),
  }),
});

export type MentorRegisterValues = z.infer<ReturnType<typeof getMentorRegisterSchema>>;
