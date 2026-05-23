"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Badge, Icon, Button } from "@/core/ui";
import { mentorApplicationsGateway } from "@/core/gateway";

interface ApplicationHeaderProps {
  id: string;
  name: string;
  status: string;
  statusLabel: string;
  statusVariant: "warning" | "primary" | "success" | "error" | "neutral";
  titleTranslation: string;
  detailTranslation: string;
  approveLabel: string;
  rejectLabel: string;
  startProcessingLabel?: string;
  successMessage?: string;
  errorMessage?: string;
  enterNoteMessage?: string;
}

export function ApplicationHeader({
  id,
  name,
  status,
  statusLabel,
  statusVariant,
  titleTranslation,
  detailTranslation,
  approveLabel,
  rejectLabel,
  startProcessingLabel = "Tiến hành xử lý",
  successMessage = "Cập nhật trạng thái đơn ứng tuyển thành công!",
  errorMessage = "Có lỗi xảy ra khi cập nhật trạng thái.",
  enterNoteMessage = "Nhập ghi chú phản hồi:",
}: ApplicationHeaderProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  const handleStartProcessing = async () => {
    setIsLoading(true);
    try {
      await mentorApplicationsGateway.updateToInProgress(id);
      alert(successMessage);
      router.refresh();
    } catch (error: any) {
      console.error("Error starting process:", error);
      alert(error?.message || errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const handleApprove = async () => {
    const note = window.prompt(enterNoteMessage, "Hồ sơ chuyên môn xuất sắc, chứng chỉ đầy đủ.");
    if (note === null) return; // User cancelled

    setIsLoading(true);
    try {
      await mentorApplicationsGateway.approveApplication(id, note);
      alert(successMessage);
      router.refresh();
    } catch (error: any) {
      console.error("Error approving:", error);
      alert(error?.message || errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const handleReject = async () => {
    const note = window.prompt(enterNoteMessage, "Chưa đáp ứng đủ số năm kinh nghiệm hoặc chứng chỉ không hợp lệ.");
    if (note === null) return; // User cancelled

    setIsLoading(true);
    try {
      await mentorApplicationsGateway.rejectApplication(id, note);
      alert(successMessage);
      router.refresh();
    } catch (error: any) {
      console.error("Error rejecting:", error);
      alert(error?.message || errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const isPending = status === "PENDING";
  const isInProgress = status === "IN_PROGRESS";
  const isTerminalState = ["APPROVED", "REJECTED", "CANCELLED"].includes(status);

  return (
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-100 pb-6">
      <div className="flex items-center gap-4">
        <Link href="/admin/mentors">
          <Button
            variant="outline"
            label={<Icon name="ArrowLeft" size={18} />}
            className="!p-2.5 !rounded-xl text-slate-400 hover:text-slate-900 border-slate-200"
          />
        </Link>
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-slate-400 uppercase tracking-wider">
            <span>{titleTranslation}</span>
            <Icon name="ChevronRight" size={12} />
            <span className="text-slate-600">{detailTranslation}</span>
          </div>
          <h1 className="text-2xl font-extrabold text-slate-950 mt-1 flex items-center gap-3">
            {name}
            <Badge variant={statusVariant} className="!px-3 !py-1 !text-xs !rounded-full">
              {statusLabel}
            </Badge>
          </h1>
        </div>
      </div>

      {/* Action Buttons for Processing */}
      {!isTerminalState && (
        <div className="flex items-center gap-3 shrink-0">
          {isPending && (
            <Button
              label={startProcessingLabel}
              variant="primary"
              loading={isLoading}
              onClick={handleStartProcessing}
              iconLeft={<Icon name="Play" size={14} />}
              className="!px-6 !py-2.5 !rounded-xl !text-xs font-bold shadow-lg shadow-primary/20"
            />
          )}

          {isInProgress && (
            <>
              <Button
                label={rejectLabel}
                variant="outline"
                loading={isLoading}
                onClick={handleReject}
                iconLeft={<Icon name="X" size={14} />}
                className="!px-5 !py-2.5 !rounded-xl !text-xs text-rose-600 hover:bg-rose-50 border-rose-200 hover:border-rose-300 font-bold"
              />
              <Button
                label={approveLabel}
                variant="primary"
                loading={isLoading}
                onClick={handleApprove}
                iconLeft={<Icon name="Check" size={14} />}
                className="!px-6 !py-2.5 !rounded-xl !text-xs font-bold shadow-lg shadow-primary/20 animate-pulse"
              />
            </>
          )}
        </div>
      )}
    </div>
  );
}
