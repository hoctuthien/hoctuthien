import { useTranslations } from 'next-intl';
import React from 'react';
import { LuCopy, LuCheck, LuRefreshCw, LuInfo } from 'react-icons/lu';
import { CurrencyDisplay } from '@/shared/components';

interface TransferInfoCardProps {
  amount?: number;
  transactionCode?: string;
  expired: boolean;
  copySuccess: boolean;
  handleCopyCode: () => void;
  verifyMessage: string | null;
  verifyStatus: 'idle' | 'success' | 'manual_retry' | 'processing' | 'error';
  cooldown: number;
  verifying: boolean;
  handleVerify: () => void;
  loadQr: () => void;
}

export const TransferInfoCard: React.FC<TransferInfoCardProps> = ({
  amount,
  transactionCode,
  expired,
  copySuccess,
  handleCopyCode,
  verifyMessage,
  verifyStatus,
  cooldown,
  verifying,
  handleVerify,
  loadQr,
}) => {
  const tExtracted = useTranslations('Extracted.appDashboardActivationComponentsTransferInfoCard');
  return (
    <div className="bg-white border border-[#E2E8F0] rounded-[32px] p-6 shadow-[0_8px_30px_rgba(0,0,0,0.005)] flex flex-col gap-5 flex-1">
      <h3 className="text-sm font-black text-slate-800 uppercase tracking-wider font-[Montserrat] border-b border-[#F1F5F9] pb-3">
        {tExtracted('thongTinThanhToan')}</h3>

      {/* Payment Info rows */}
      <div className="flex flex-col gap-4">

        {/* 1. VND Amount Row */}
        <div className="flex justify-between items-center gap-4 bg-slate-50 p-4 rounded-2xl border border-slate-100">
          <div className="flex flex-col gap-0.5">
            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">{tExtracted('soTienCanChuyen')}</span>
            <span className="text-[10px] text-slate-400 font-medium leading-none">{tExtracted('phiKichHoatTaiKhoanDuyNhat')}</span>
          </div>
          <CurrencyDisplay
            value={amount}
            className="text-xl font-black text-blue-600 font-[Montserrat]"
          />
        </div>

        {/* 2. Copyable Transaction Code Row */}
        <div className="flex flex-col gap-1.5">
          <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">{tExtracted('noiDungChuyenKhoanBatBuoc')}</span>
          <div className="flex items-center gap-2">
            <div className="flex-1 bg-slate-50 border border-slate-200 px-4 py-3.5 rounded-2xl font-mono text-xs font-black text-slate-700 tracking-wider break-all select-all">
              {transactionCode || '---'}
            </div>
            <button
              onClick={handleCopyCode}
              disabled={!transactionCode || expired}
              className={`p-3.5 rounded-2xl border transition-all cursor-pointer flex-shrink-0 flex items-center justify-center ${
                copySuccess
                  ? "bg-emerald-50 border-emerald-200 text-emerald-600"
                  : "bg-white border-slate-200 text-slate-600 hover:text-blue-600 hover:bg-[#F0F7FF] hover:border-blue-200"
              } disabled:opacity-50`}
              title={tExtracted('saoChepNoiDung')}
            >
              {copySuccess ? <LuCheck size={18} /> : <LuCopy size={18} />}
            </button>
          </div>
          <p className="text-[10px] text-amber-600 font-semibold leading-tight flex items-start gap-1 mt-0.5">
            <LuInfo size={12} className="flex-shrink-0 mt-0.5" />
            <span>{tExtracted('noiDungChuyenKhoan')}<strong>{tExtracted('phaiKhopHoanToan')}</strong> {tExtracted('maTrenDeHeThongTuDongDoi')}</span>
          </p>
        </div>
      </div>

      {/* Status feedback & alert box */}
      {verifyMessage && (
        <div className={`p-4 rounded-2xl border flex items-start gap-3 text-xs leading-relaxed font-medium animate-fade-in ${
          verifyStatus === 'processing'
            ? "bg-blue-50 border-blue-100 text-blue-700"
            : verifyStatus === 'manual_retry'
            ? "bg-amber-50 border-amber-100 text-amber-700"
            : verifyStatus === 'error'
            ? "bg-rose-50 border-rose-100 text-rose-700"
            : "bg-slate-50 border-slate-100 text-slate-700"
        }`}>
          <div className="flex-shrink-0 mt-0.5">
            {verifyStatus === 'processing' && <LuRefreshCw size={16} className="animate-spin text-blue-600" />}
            {verifyStatus === 'manual_retry' && <LuInfo size={16} className="text-amber-600" />}
            {verifyStatus === 'error' && <LuInfo size={16} className="text-rose-600" />}
            {verifyStatus !== 'processing' && verifyStatus !== 'manual_retry' && verifyStatus !== 'error' && <LuInfo size={16} />}
          </div>
          <div className="flex-1">
            {verifyMessage}
          </div>
        </div>
      )}

      {/* Verify / Action Buttons Container */}
      <div className="flex flex-col sm:flex-row gap-3 mt-auto pt-2 border-t border-[#F1F5F9]">
        <button
          onClick={handleVerify}
          disabled={expired || verifying || cooldown > 0}
          className="flex-1 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 disabled:from-slate-200 disabled:to-slate-200 text-white disabled:text-slate-400 text-xs font-black py-4 px-6 rounded-2xl uppercase tracking-wider transition-all active:scale-[0.98] shadow-lg shadow-blue-500/10 cursor-pointer disabled:cursor-not-allowed border-0 flex items-center justify-center gap-2"
        >
          {verifying ? (
            <>
              <LuRefreshCw size={16} className="animate-spin" />
              <span>{tExtracted('dangXacMinhGiaoDich')}</span>
            </>
          ) : verifyStatus === 'processing' ? (
            <>
              <LuRefreshCw size={16} className="animate-spin" />
              <span>{tExtracted('dangTuDongKiemTra')}{cooldown}{tExtracted('s')}</span>
            </>
          ) : cooldown > 0 ? (
            <span>{tExtracted('thuLaiSau')}{cooldown}{tExtracted('s2')}</span>
          ) : (
            <span>{tExtracted('toiDaChuyenKhoan')}</span>
          )}
        </button>

        {/* Regenerate button as fallback */}
        {expired && (
          <button
            onClick={loadQr}
            className="sm:w-max bg-white hover:bg-slate-50 text-slate-700 text-xs font-black py-4 px-6 rounded-2xl uppercase tracking-wider transition-all border border-slate-200 cursor-pointer flex items-center justify-center gap-1.5"
          >
            <LuRefreshCw size={16} />
            <span>{tExtracted('lamMoiQr')}</span>
          </button>
        )}
      </div>
    </div>
  );
};
