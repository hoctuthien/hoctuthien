"use client";

import { useTranslations } from 'next-intl';
import React, { useState, useEffect, useRef, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { verifyPaymentAction, QrResponseData } from '@/app/(dashboard)/activation/actions';
import { authGateway } from '@/core/gateway/authGateway';

// Import Modular SOLID Subcomponents
import {
  ActivationSuccess,
  VietQrCard,
  TransferInfoCard,
  InstructionCard
} from '@/app/(dashboard)/activation/components';

interface ActivationClientProps {
  initialQrData: QrResponseData | null;
}

export default function ActivationClient({ initialQrData }: ActivationClientProps) {
  const tExtracted = useTranslations('Extracted.appDashboardActivationActivationClient');
  const router = useRouter();
  const { update: updateSession } = useSession();
  const [isPending, startTransition] = useTransition();

  // Timer states
  const [timeLeft, setTimeLeft] = useState<number>(0);
  const [expired, setExpired] = useState(false);

  // Verification action states
  const [verifying, setVerifying] = useState(false);
  const [verifyStatus, setVerifyStatus] = useState<'idle' | 'success' | 'manual_retry' | 'processing' | 'error'>('idle');
  const [verifyMessage, setVerifyMessage] = useState<string | null>(null);

  // Interactive UI states
  const [copySuccess, setCopySuccess] = useState(false);
  const [cooldown, setCooldown] = useState(0);

  // Interval reference
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const cooldownRef = useRef<NodeJS.Timeout | null>(null);
  const autoRetryRef = useRef<NodeJS.Timeout | null>(null);

  // Use the server-side prop directly
  const qrData = initialQrData;

  // Handle reload/regenerate QR code via server refresh transition
  const handleRegenerateQr = () => {
    setExpired(false);
    setVerifyStatus('idle');
    setVerifyMessage(null);
    startTransition(() => {
      router.refresh();
    });
  };

  // Synchronize timer with server prop updates
  useEffect(() => {
    if (!qrData) return;

    const expTime = new Date(qrData.expiredAt || '').getTime();
    const left = Math.max(0, Math.floor((expTime - Date.now()) / 1000));
    setTimeLeft(left);

    if (left <= 0) {
      setExpired(true);
      return;
    }

    setExpired(false);

    timerRef.current = setInterval(() => {
      const currentLeft = Math.max(0, Math.floor((expTime - Date.now()) / 1000));
      setTimeLeft(currentLeft);

      if (currentLeft <= 0) {
        setExpired(true);
        if (timerRef.current) clearInterval(timerRef.current);
      }
    }, 1000);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [qrData]);

  // Cooldown countdown hook
  useEffect(() => {
    if (cooldown <= 0) return;

    cooldownRef.current = setInterval(() => {
      setCooldown((prev) => {
        if (prev <= 1) {
          if (cooldownRef.current) clearInterval(cooldownRef.current);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      if (cooldownRef.current) clearInterval(cooldownRef.current);
    };
  }, [cooldown]);

  // Clean up auto retries on unmount
  useEffect(() => {
    return () => {
      if (autoRetryRef.current) clearTimeout(autoRetryRef.current);
    };
  }, []);

  // Helper to format remaining time
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Copy transaction code to clipboard
  const handleCopyCode = async () => {
    if (!qrData) return;
    try {
      await navigator.clipboard.writeText(qrData.transactionCode || '');
      setCopySuccess(true);
      setTimeout(() => setCopySuccess(false), 2000);
    } catch (err) {
      console.error('Failed to copy text: ', err);
    }
  };

  // Handle transaction verification using Server Actions
  const handleVerify = async () => {
    if (!qrData || verifying || cooldown > 0) return;

    try {
      setVerifying(true);
      setVerifyMessage(null);

      const result = await verifyPaymentAction(qrData.paymentId || '');

      if (result.activated) {
        setVerifyStatus('success');
        setVerifyMessage(result.message || tExtracted('taiKhoanCuaBanDaDuocKichHoat'));

        // Reload user session via NextAuth and redirect
        setTimeout(async () => {
          try {
            await authGateway.getMe(); // Fetch me to sync session cookies
            await updateSession();    // Force refresh next-auth session payload
          } catch (e) {
            console.error('Failed to sync session:', e);
          }
          router.replace('/dashboard');
          router.refresh();
        }, 2500);

      } else {
        const msg = (result.message || '').toLowerCase();

        if (msg.includes('đang xử lý') || msg.includes('cron')) {
          setVerifyStatus('processing');
          setVerifyMessage(result.message || null);
          setCooldown(3); // Wait 3s before auto retry

          autoRetryRef.current = setTimeout(() => {
            handleVerify();
          }, 3000);

        } else {
          setVerifyStatus('manual_retry');
          setVerifyMessage(result.message || tExtracted('chuaTimThayGiaoDichChuyenKhoanPhu'));
          setCooldown(5); // Prevent spamming with 5s cooldown
        }
      }
    } catch (error: any) {
      console.error('Verification error:', error);

      const status = error.status;
      if (status === 401) {
        router.push('/login');
      } else if (status === 422) {
        setVerifyStatus('error');
        setVerifyMessage(tExtracted('maQrThanhToanDaHetHanTren'));
        setTimeout(() => handleRegenerateQr(), 2000);
      } else if (status === 503) {
        setVerifyStatus('error');
        setVerifyMessage(tExtracted('heThongKiemTraGiaoDichDangBan'));
        setCooldown(8);
      } else {
        setVerifyStatus('error');
        setVerifyMessage(error.message || tExtracted('daCoLoiXayRaTrongQuaTrinh'));
        setCooldown(5);
      }
    } finally {
      setVerifying(false);
    }
  };

  // Showing loading skeleton during server refresh transition or when no prop exists
  if (isPending || !qrData) {
    return (
      <div className="w-full bg-[#FAFBFD] min-h-screen py-12 px-4 flex items-center justify-center font-sans">
        <div className="bg-white/80 backdrop-blur-md border border-[#E2E8F0] rounded-[32px] p-12 max-w-md w-full shadow-lg text-center flex flex-col items-center gap-6">
          <div className="w-16 h-16 border-4 border-blue-600/20 border-t-blue-600 rounded-full animate-spin" />
          <h2 className="text-lg font-black text-[#1E293B] font-[Montserrat]">{tExtracted('dangDongBoCongThanhToan')}</h2>
          <p className="text-xs text-slate-500 font-medium">{tExtracted('heThongDangTaiDuLieuThanhToan')}</p>
        </div>
      </div>
    );
  }

  // Celebratory success view
  if (verifyStatus === 'success') {
    return <ActivationSuccess message={verifyMessage || tExtracted('taiKhoanCuaBanDaDuocKichHoat')} />;
  }

  return (
    <div className="w-full flex flex-col gap-6 font-sans">

        {/* Page Header */}
        <div className="text-center md:text-left flex flex-col gap-1 mb-2">
          <span className="text-[10px] bg-blue-100 text-blue-600 font-black px-3 py-1 rounded-full uppercase tracking-wider w-max mx-auto md:mx-0 border border-blue-200/50">
            {tExtracted('kichHoatTaiKhoan')}</span>
          <h1 className="text-2xl md:text-3xl font-black text-slate-800 font-[Montserrat] tracking-tight mt-1">
            {tExtracted('congThanhToanKichHoatMentee')}</h1>
          <p className="text-xs text-slate-500 font-medium">
            {tExtracted('hayThanhToanMotKhoanPhiKichHoat')}</p>
        </div>

        {/* Dynamic Payment Card Segment */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-stretch">

          {/* Column Left: VietQR Image Container */}
          <div className="md:col-span-5 flex flex-col">
            <VietQrCard
              expired={expired}
              qrUrl={qrData.qrUrl}
              timeLeft={timeLeft}
              formatTime={formatTime}
              loadQr={handleRegenerateQr}
            />
          </div>

          {/* Column Right: Billing and Action instructions */}
          <div className="md:col-span-7 flex flex-col gap-6">
            <TransferInfoCard
              amount={qrData.amount}
              transactionCode={qrData.transactionCode}
              expired={expired}
              copySuccess={copySuccess}
              handleCopyCode={handleCopyCode}
              verifyMessage={verifyMessage}
              verifyStatus={verifyStatus}
              cooldown={cooldown}
              verifying={verifying}
              handleVerify={handleVerify}
              loadQr={handleRegenerateQr}
            />
          </div>
        </div>

        {/* Activation User Help instructions */}
        <InstructionCard
          amount={qrData.amount || 5000}
          transactionCode={qrData.transactionCode || 'KICHHOAT ...'}
        />

      </div>
  );
}
