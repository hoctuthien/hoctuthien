import { useTranslations } from 'next-intl';
import React from 'react';
import { LuClock, LuRefreshCw } from 'react-icons/lu';

interface VietQrCardProps {
  expired: boolean;
  qrUrl?: string;
  timeLeft: number;
  formatTime: (seconds: number) => string;
  loadQr: () => void;
}

export const VietQrCard: React.FC<VietQrCardProps> = ({
  expired,
  qrUrl,
  timeLeft,
  formatTime,
  loadQr,
}) => {
  const tExtracted = useTranslations('Extracted.appDashboardActivationComponentsVietQrCard');
  return (
    <div className="bg-white border border-[#E2E8F0] rounded-[32px] p-6 shadow-[0_8px_30px_rgba(0,0,0,0.005)] flex flex-col items-center justify-center gap-4 flex-1 relative overflow-hidden">

      {/* Blur Overlay if Expired */}
      {expired && (
        <div className="absolute inset-0 bg-white/90 backdrop-blur-sm z-10 flex flex-col items-center justify-center p-6 text-center gap-4 animate-fade-in">
          <div className="w-12 h-12 bg-rose-50 text-rose-500 rounded-full flex items-center justify-center border border-rose-100">
            <LuClock size={24} />
          </div>
          <h3 className="text-sm font-black text-slate-800 font-[Montserrat]">{tExtracted('maQrDaHetHan')}</h3>
          <p className="text-[11px] text-slate-500 leading-relaxed font-medium max-w-[200px]">
            {tExtracted('viLyDoAnToanCongGiaoDich')}</p>
          <button
            onClick={loadQr}
            className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white text-xs font-black px-6 py-3 rounded-xl uppercase tracking-wider shadow-md transition-all active:scale-95 cursor-pointer border-0 flex items-center gap-1.5"
          >
            <LuRefreshCw size={14} />
            <span>{tExtracted('taoQrMoi')}</span>
          </button>
        </div>
      )}

      <div className="text-center flex flex-col gap-1 w-full border-b border-[#F1F5F9] pb-4">
        <span className="text-[11px] text-slate-400 font-bold uppercase tracking-widest">{tExtracted('quetMaVietqr')}</span>
        <span className="text-xs text-blue-600 font-black tracking-tight font-[Montserrat]">{tExtracted('hoTroMoiAppNganHangViDien')}</span>
      </div>

      {/* QR Image Display */}
      <div className="w-full aspect-square max-w-[240px] bg-slate-50 rounded-2xl border border-slate-100 p-3 flex items-center justify-center overflow-hidden">
        {qrUrl && (
          <img
            src={qrUrl}
            alt={tExtracted('vietqrCode')}
            className="w-full h-full object-contain mix-blend-multiply"
          />
        )}
      </div>

      {/* Live Time countdown box */}
      {!expired && qrUrl && (
        <div className="flex items-center gap-2 px-4 py-2 bg-rose-50 border border-rose-100 text-rose-600 rounded-2xl w-full justify-center">
          <LuClock size={16} className="animate-pulse" />
          <span className="text-xs font-black tracking-wider font-[Montserrat]">{formatTime(timeLeft)}</span>
          <span className="text-[10px] text-rose-500/80 font-bold uppercase">{tExtracted('hieuLucConLai')}</span>
        </div>
      )}
    </div>
  );
};
