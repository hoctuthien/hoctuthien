"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Badge, Icon, Button } from "@/core/ui";
import { mentorApplicationsGateway } from "@/core/gateway";
import { TransactionalModal, ConfirmModal, Textarea } from "@shared";

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
  const [isApproveOpen, setIsApproveOpen] = useState(false);
  const [isRejectOpen, setIsRejectOpen] = useState(false);
  const [note, setNote] = useState("");
  const [successModal, setSuccessModal] = useState<{ isOpen: boolean; message: string }>({
    isOpen: false,
    message: "",
  });
  const [errorModal, setErrorModal] = useState<{ isOpen: boolean; message: string }>({
    isOpen: false,
    message: "",
  });

  const handleStartProcessing = async () => {
    setIsLoading(true);
    try {
      await mentorApplicationsGateway.updateToInProgress(id);
      setSuccessModal({
        isOpen: true,
        message: successMessage,
      });
    } catch (error: any) {
      console.error("Error starting process:", error);
      setErrorModal({
        isOpen: true,
        message: error?.message || errorMessage,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleApproveClick = () => {
    setNote("Hồ sơ chuyên môn xuất sắc, chứng chỉ đầy đủ.");
    setIsApproveOpen(true);
  };

  const handleRejectClick = () => {
    setNote("Chưa đáp ứng đủ số năm kinh nghiệm hoặc chứng chỉ không hợp lệ.");
    setIsRejectOpen(true);
  };

  const submitApprove = async () => {
    setIsLoading(true);
    try {
      await mentorApplicationsGateway.approveApplication(id, note);
      setIsApproveOpen(false);
      setSuccessModal({
        isOpen: true,
        message: successMessage,
      });
    } catch (error: any) {
      console.error("Error approving:", error);
      setErrorModal({
        isOpen: true,
        message: error?.message || errorMessage,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const submitReject = async () => {
    setIsLoading(true);
    try {
      await mentorApplicationsGateway.rejectApplication(id, note);
      setIsRejectOpen(false);
      setSuccessModal({
        isOpen: true,
        message: successMessage,
      });
    } catch (error: any) {
      console.error("Error rejecting:", error);
      setErrorModal({
        isOpen: true,
        message: error?.message || errorMessage,
      });
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
                onClick={handleRejectClick}
                iconLeft={<Icon name="X" size={14} />}
                className="!px-5 !py-2.5 !rounded-xl !text-xs text-rose-600 hover:bg-rose-50 border-rose-200 hover:border-rose-300 font-bold"
              />
              <Button
                label={approveLabel}
                variant="primary"
                loading={isLoading}
                onClick={handleApproveClick}
                iconLeft={<Icon name="Check" size={14} />}
                className="!px-6 !py-2.5 !rounded-xl !text-xs font-bold shadow-lg shadow-primary/20 animate-pulse"
              />
            </>
          )}
        </div>
      )}

      {/* Modals & Popups styled using Core UI and Shared components */}
      <TransactionalModal
        isOpen={isApproveOpen}
        onClose={() => setIsApproveOpen(false)}
        title="Phê duyệt đơn ứng tuyển"
        subtitle="Xác nhận phê duyệt cố vấn"
        primaryActionLabel="Phê duyệt"
        secondaryActionLabel="Hủy"
        onPrimaryAction={submitApprove}
        isPrimaryLoading={isLoading}
      >
        <div className="space-y-4">
          <p className="text-sm text-[#414754]">
            Bạn đang thực hiện phê duyệt đơn đăng ký của ứng viên <strong>{name}</strong> làm Cố vấn trên hệ thống.
            Vui lòng để lại ghi chú phản hồi cho ứng viên:
          </p>
          <Textarea
            label="Ghi chú phản hồi"
            placeholder="Nhập ghi chú phản hồi cho ứng viên..."
            value={note}
            onChange={(e) => setNote(e.target.value)}
            rows={4}
          />
        </div>
      </TransactionalModal>

      <TransactionalModal
        isOpen={isRejectOpen}
        onClose={() => setIsRejectOpen(false)}
        title="Từ chối đơn ứng tuyển"
        subtitle="Từ chối hồ sơ cố vấn"
        primaryActionLabel="Từ chối ứng viên"
        secondaryActionLabel="Hủy"
        onPrimaryAction={submitReject}
        isPrimaryLoading={isLoading}
      >
        <div className="space-y-4">
          <p className="text-sm text-[#414754]">
            Bạn đang thực hiện từ chối đơn đăng ký của ứng viên <strong>{name}</strong>.
            Vui lòng nhập lý do từ chối cụ thể để gửi phản hồi cho ứng viên:
          </p>
          <Textarea
            label="Lý do từ chối"
            placeholder="Nhập lý do từ chối..."
            value={note}
            onChange={(e) => setNote(e.target.value)}
            status="error"
            rows={4}
          />
        </div>
      </TransactionalModal>

      {/* Success alert replacement */}
      <ConfirmModal
        isOpen={successModal.isOpen}
        onClose={() => {
          setSuccessModal({ isOpen: false, message: "" });
          router.refresh();
        }}
        type="success"
        title="Thành công"
        description={successModal.message}
        primaryActionLabel="Xác nhận"
        secondaryActionLabel="Đóng"
        onPrimaryAction={() => {
          setSuccessModal({ isOpen: false, message: "" });
          router.refresh();
        }}
      />

      {/* Error alert replacement */}
      <ConfirmModal
        isOpen={errorModal.isOpen}
        onClose={() => setErrorModal({ isOpen: false, message: "" })}
        type="danger"
        title="Thất bại"
        description={errorModal.message}
        primaryActionLabel="Thử lại"
        secondaryActionLabel="Đóng"
        onPrimaryAction={() => setErrorModal({ isOpen: false, message: "" })}
      />
    </div>
  );
}
