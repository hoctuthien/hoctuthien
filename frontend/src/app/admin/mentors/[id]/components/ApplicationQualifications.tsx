import React from "react";
import { Card } from "@/core/ui/Card";
import { Icon } from "@/core/ui";

interface Degree {
  name: string;
  university: string;
  imageUrl?: string;
}

interface Certificate {
  name: string;
  issuedBy: string;
  imageUrl?: string;
}

interface ApplicationQualificationsProps {
  metadata?: {
    degrees?: Degree[];
    certificates?: Certificate[];
  };
  degreesLabel: string;
  certificatesLabel: string;
  viewDegreeLabel: string;
  viewCertLabel: string;
  noDegreesMessage: string;
  noCertificatesMessage: string;
}

export function ApplicationQualifications({
  metadata,
  degreesLabel,
  certificatesLabel,
  viewDegreeLabel,
  viewCertLabel,
  noDegreesMessage,
  noCertificatesMessage,
}: ApplicationQualificationsProps) {
  const degrees = metadata?.degrees || [];
  const certificates = metadata?.certificates || [];

  return (
    <Card className="p-8 border-none shadow-sm hover:shadow-md transition-all space-y-8">
      {/* Academic Degrees */}
      <div className="space-y-6">
        <h3 className="text-lg font-bold text-slate-900 flex items-center gap-3">
          <span className="p-2 rounded-xl bg-violet-50 text-violet-600">
            <Icon name="GraduationCap" size={18} />
          </span>
          {degreesLabel}
        </h3>

        {degrees.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {degrees.map((degree, idx) => (
              <div
                key={idx}
                className="p-5 rounded-2xl border border-slate-100 hover:border-violet-100 bg-slate-50/30 transition-all flex flex-col justify-between space-y-4"
              >
                <div className="space-y-2">
                  <h4 className="font-bold text-slate-800 text-sm">{degree.name}</h4>
                  <p className="text-xs text-slate-500 flex items-center gap-1.5">
                    <Icon name="School" size={12} />
                    {degree.university}
                  </p>
                </div>

                {degree.imageUrl && (
                  <a
                    href={degree.imageUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-2 inline-flex items-center gap-2 text-xs font-bold text-violet-600 hover:text-violet-800 group"
                  >
                    <Icon name="FileText" size={14} className="group-hover:scale-105 transition-transform" />
                    <span>{viewDegreeLabel}</span>
                    <Icon name="ExternalLink" size={12} className="opacity-60" />
                  </a>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="p-6 rounded-2xl border border-dashed border-slate-200 text-center text-slate-400 text-xs italic">
            {noDegreesMessage}
          </div>
        )}
      </div>

      {/* Divider line */}
      <div className="h-px bg-slate-100" />

      {/* Professional Certificates */}
      <div className="space-y-6">
        <h3 className="text-lg font-bold text-slate-900 flex items-center gap-3">
          <span className="p-2 rounded-xl bg-emerald-50 text-emerald-600">
            <Icon name="Award" size={18} />
          </span>
          {certificatesLabel}
        </h3>

        {certificates.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {certificates.map((cert, idx) => (
              <div
                key={idx}
                className="p-5 rounded-2xl border border-slate-100 hover:border-emerald-100 bg-slate-50/30 transition-all flex flex-col justify-between space-y-4"
              >
                <div className="space-y-2">
                  <h4 className="font-bold text-slate-800 text-sm">{cert.name}</h4>
                  <p className="text-xs text-slate-500 flex items-center gap-1.5">
                    <Icon name="Building" size={12} />
                    {cert.issuedBy}
                  </p>
                </div>

                {cert.imageUrl && (
                  <a
                    href={cert.imageUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-2 inline-flex items-center gap-2 text-xs font-bold text-emerald-600 hover:text-emerald-800 group"
                  >
                    <Icon name="Image" size={14} className="group-hover:scale-105 transition-transform" />
                    <span>{viewCertLabel}</span>
                    <Icon name="ExternalLink" size={12} className="opacity-60" />
                  </a>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="p-6 rounded-2xl border border-dashed border-slate-200 text-center text-slate-400 text-xs italic">
            {noCertificatesMessage}
          </div>
        )}
      </div>
    </Card>
  );
}
