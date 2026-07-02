"use client";

import React from "react";
import { UseFormReturn, useFieldArray } from "react-hook-form";
import { MentorRegisterValues } from "../mentor-register.schema";
import { Input, Icon, ImageUploader } from "@/core/ui";
import { useTranslations } from "next-intl";
import { uploadImageToCloud } from "@/core/utils/upload";

interface Props {
  form: UseFormReturn<MentorRegisterValues>;
}

export default function Step3Credentials({ form }: Props) {
  const tExtracted = useTranslations('Extracted.appDashboardMentorRegisterComponentsStep3Credentials');
  const t = useTranslations("MentorRegister");
  const tUploader = useTranslations("ImageUploader");
  const { register, formState: { errors }, control, watch } = form;

  // React hook form watchers to reactively check for uploaded images
  const certificatesWatch = watch("metadata.certificates") || [];
  const degreesWatch = watch("metadata.degrees") || [];

  const {
    fields: certificateFields,
    append: appendCertificate,
    remove: removeCertificate
  } = useFieldArray({
    control,
    name: "metadata.certificates",
  });

  const {
    fields: degreeFields,
    append: appendDegree,
    remove: removeDegree
  } = useFieldArray({
    control,
    name: "metadata.degrees",
  });

  return (
    <div className="flex flex-col gap-10 animate-in fade-in slide-in-from-right-4 duration-500">

      {/* Certificates Section */}
      <div className="flex flex-col gap-6">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-bold text-[#181C20]">{t("certificates")}</h3>
            <p className="text-sm text-[#727785]">{t("certificatesDesc")}</p>
          </div>
          <button
            type="button"
            onClick={() => appendCertificate({ name: "", issuedBy: "", imageUrl: "" })}
            className="flex items-center gap-2 text-primary font-bold text-sm hover:opacity-80 transition-opacity bg-primary/5 px-4 py-2 rounded-xl"
          >
            <Icon name="Plus" size={18} />
            {t("addCertificate")}
          </button>
        </div>

        <div className="grid grid-cols-1 gap-4">
          {certificateFields.map((field, index) => (
            <div
              key={field.id}
              className="p-6 bg-slate-50/50 border border-slate-100 rounded-2xl relative group animate-in zoom-in-95 duration-200"
            >
              {/* Remove entire certificate block */}
              <button
                type="button"
                onClick={() => removeCertificate(index)}
                className="absolute top-4 right-4 w-8 h-8 rounded-full bg-white shadow-sm flex items-center justify-center text-slate-400 hover:text-red-500 hover:shadow-md transition-all opacity-0 group-hover:opacity-100 z-20"
              >
                <Icon name="Trash2" size={16} />
              </button>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <Input
                    label={t('certificateName')}
                    placeholder={t('certificateNamePlaceholder')}
                    {...register(`metadata.certificates.${index}.name`)}
                    error={errors.metadata?.certificates?.[index]?.name?.message}
                  />
                  <Input
                    label={t('issuedBy')}
                    placeholder={t('issuedByPlaceholder')}
                    {...register(`metadata.certificates.${index}.issuedBy`)}
                    error={errors.metadata?.certificates?.[index]?.issuedBy?.message}
                  />
                </div>

                {/* Reusable, clean Cloud Drag & Drop Uploader Component */}
                <div className="flex flex-col justify-center">
                  <ImageUploader
                    value={certificatesWatch[index]?.imageUrl}
                    onChange={(url) => form.setValue(`metadata.certificates.${index}.imageUrl`, url, { shouldValidate: true })}
                    onUpload={uploadImageToCloud}
                    error={errors.metadata?.certificates?.[index]?.imageUrl?.message}
                    label={tExtracted('anhChupChungChiXacThuc')}
                    placeholder={tUploader('placeholder')}
                    subPlaceholder={tUploader("subPlaceholder")}
                    uploadingLabel={tUploader("uploading")}
                    viewOriginalLabel={tUploader("viewOriginal")}
                    deleteLabel={tUploader("delete")}
                    onlyImagesError={tUploader("onlyImagesError")}
                    uploadFailedError={tUploader("uploadFailedError")}
                  />
                </div>
              </div>
            </div>
          ))}

          {certificateFields.length === 0 && (
            <div className="py-10 border-2 border-dashed border-slate-200 rounded-3xl flex flex-col items-center justify-center gap-3 text-slate-400 bg-white">
              <Icon name="FileText" size={40} className="opacity-20" />
              <p className="text-sm font-medium">{t("noCertificates")}</p>
            </div>
          )}
        </div>
      </div>

      <div className="h-[1px] bg-slate-100" />

      {/* Degrees Section */}
      <div className="flex flex-col gap-6">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-bold text-[#181C20]">{t("degrees")}</h3>
            <p className="text-sm text-[#727785]">{t("degreesDesc")}</p>
          </div>
          <button
            type="button"
            onClick={() => appendDegree({ name: "", university: "", imageUrl: "" })}
            className="flex items-center gap-2 text-primary font-bold text-sm hover:opacity-80 transition-opacity bg-primary/5 px-4 py-2 rounded-xl"
          >
            <Icon name="Plus" size={18} />
            {t("addDegree")}
          </button>
        </div>

        <div className="grid grid-cols-1 gap-4">
          {degreeFields.map((field, index) => (
            <div
              key={field.id}
              className="p-6 bg-slate-50/50 border border-slate-100 rounded-2xl relative group animate-in zoom-in-95 duration-200"
            >
              {/* Remove entire degree block */}
              <button
                type="button"
                onClick={() => removeDegree(index)}
                className="absolute top-4 right-4 w-8 h-8 rounded-full bg-white shadow-sm flex items-center justify-center text-slate-400 hover:text-red-500 hover:shadow-md transition-all opacity-0 group-hover:opacity-100 z-20"
              >
                <Icon name="Trash2" size={16} />
              </button>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <Input
                    label={t('degreeName')}
                    placeholder={t('degreeNamePlaceholder')}
                    {...register(`metadata.degrees.${index}.name`)}
                    error={errors.metadata?.degrees?.[index]?.name?.message}
                  />
                  <Input
                    label={t('university')}
                    placeholder={t('universityPlaceholder')}
                    {...register(`metadata.degrees.${index}.university`)}
                    error={errors.metadata?.degrees?.[index]?.university?.message}
                  />
                </div>

                {/* Reusable, clean Cloud Drag & Drop Uploader Component */}
                <div className="flex flex-col justify-center">
                  <ImageUploader
                    value={degreesWatch[index]?.imageUrl}
                    onChange={(url) => form.setValue(`metadata.degrees.${index}.imageUrl`, url, { shouldValidate: true })}
                    onUpload={uploadImageToCloud}
                    error={errors.metadata?.degrees?.[index]?.imageUrl?.message}
                    label={tExtracted('anhChupBangCapXacThuc')}
                    placeholder={tUploader('placeholder')}
                    subPlaceholder={tUploader("subPlaceholder")}
                    uploadingLabel={tUploader("uploading")}
                    viewOriginalLabel={tUploader("viewOriginal")}
                    deleteLabel={tUploader("delete")}
                    onlyImagesError={tUploader("onlyImagesError")}
                    uploadFailedError={tUploader("uploadFailedError")}
                  />
                </div>
              </div>
            </div>
          ))}

          {degreeFields.length === 0 && (
            <div className="py-10 border-2 border-dashed border-slate-200 rounded-3xl flex flex-col items-center justify-center gap-3 text-slate-400 bg-white">
              <Icon name="GraduationCap" size={40} className="opacity-20" />
              <p className="text-sm font-medium">{t("noDegrees")}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
