import { z } from "zod";

export const mentorRegisterSchema = z.object({
  jobTitle: z.string().min(2, "Job title must be at least 2 characters"),
  company: z.string().min(2, "Company must be at least 2 characters"),
  yearsOfExperience: z.coerce.number().min(0, "Years of experience cannot be negative"),
  linkedinUrl: z.string().url("Please enter a valid LinkedIn URL"),
  bio: z.string().min(50, "Bio must be at least 50 characters to describe your experience"),
  skills: z.array(z.string()).min(1, "Please select at least one expertise"),
  note: z.string().optional(),
  metadata: z.object({
    certificates: z.array(z.object({
      name: z.string().min(1, "Certificate name is required"),
      issuedBy: z.string().optional(),
      imageUrl: z.string().url("Certificate image is required"),
    })).default([]),
    degrees: z.array(z.object({
      name: z.string().min(1, "Degree name is required"),
      university: z.string().optional(),
      imageUrl: z.string().url("Degree image is required"),
    })).default([]),
  }),
});

export type MentorRegisterValues = z.infer<typeof mentorRegisterSchema>;
