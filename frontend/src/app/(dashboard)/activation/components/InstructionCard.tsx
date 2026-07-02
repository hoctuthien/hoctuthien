import { useTranslations } from 'next-intl';
import React from 'react';
import { LuInfo } from 'react-icons/lu';

interface InstructionCardProps {
  amount: number;
  transactionCode: string;
}

export const InstructionCard: React.FC<InstructionCardProps> = ({ amount, transactionCode }) => {
  const tExtracted = useTranslations('Extracted.appDashboardActivationComponentsInstructionCard');
  const formatVND = (value: number) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(value);
  };

  return (
    <div className="bg-slate-50 border border-slate-200/60 rounded-[32px] p-6 flex flex-col gap-3">
      <h4 className="text-xs font-black text-slate-700 uppercase tracking-wider font-[Montserrat] flex items-center gap-1.5">
        <LuInfo size={16} className="text-blue-600" />
        <span>{tExtracted('huongDanQuyTrinhKichHoat')}</span>
      </h4>
      <ol className="text-[11px] text-slate-500 font-medium space-y-2 pl-4 list-decimal leading-relaxed">
        <li>
          {tExtracted('moAppNganHangVietcombankTechcombankMbMomo')}</li>
        <li>
          {tExtracted('quetMaQrHienThiOManHinh')}</li>
        <li>
          {tExtracted('neuBanChuyenKhoanThuCongHayNhap')}{formatVND(amount)}{tExtracted('vaNoiDung')}{transactionCode}**.
        </li>
        <li>
          {tExtracted('sauKhiHoanTatChuyenKhoanThanhCong')}</li>
      </ol>
    </div>
  );
};
