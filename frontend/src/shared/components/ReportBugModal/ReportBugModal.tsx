'use client';

import React, { useState } from 'react';
import { LuBug } from 'react-icons/lu';
import { useTranslations } from 'next-intl';
import { Modal } from '@/shared/components/Modal';
import { Textarea } from '@/shared/components/Textarea';
import { Input, Select, Button } from '@/core/ui';
import { bugReportGateway, type BugReportSeverity } from '@/core/gateway/bugReportGateway';

interface ReportBugModalProps {
  isOpen: boolean;
  onClose: () => void;
}

type FormState = 'idle' | 'loading' | 'success' | 'error';

export function ReportBugModal({ isOpen, onClose }: ReportBugModalProps) {
  const t = useTranslations('ReportBugModal');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [steps, setSteps] = useState('');
  const [severity, setSeverity] = useState<BugReportSeverity>('medium');
  const [formState, setFormState] = useState<FormState>('idle');
  const [errorMsg, setErrorMsg] = useState('');

  const SEVERITY_OPTIONS = [
    { value: 'low', label: `🔵 ${t('severityLow')}` },
    { value: 'medium', label: `🟡 ${t('severityMedium')}` },
    { value: 'high', label: `🟠 ${t('severityHigh')}` },
    { value: 'critical', label: `🔴 ${t('severityCritical')}` },
  ];

  const handleClose = () => {
    if (formState === 'loading') return;
    onClose();
    // Reset after animation
    setTimeout(() => {
      setTitle('');
      setDescription('');
      setSteps('');
      setSeverity('medium');
      setFormState('idle');
      setErrorMsg('');
    }, 300);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !description.trim()) return;

    try {
      setFormState('loading');
      setErrorMsg('');

      // Collect basic device info automatically
      const deviceInfo = typeof window !== 'undefined'
        ? {
            userAgent: navigator.userAgent,
            url: window.location.href,
            screenSize: `${window.screen.width}x${window.screen.height}`,
            language: navigator.language,
          }
        : undefined;

      await bugReportGateway.create({
        title: title.trim(),
        description: description.trim(),
        stepsToReproduce: steps.trim() || undefined,
        severity,
        deviceInfo: deviceInfo as any,
      });

      setFormState('success');
      setTimeout(() => {
        handleClose();
      }, 2500);
    } catch (err: any) {
      setFormState('error');
      setErrorMsg(err?.response?.data?.message || err?.message || t('submitError'));
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      showCloseButton={formState !== 'loading'}
      containerClassName="max-w-lg overflow-hidden !rounded-[24px]"
    >
      {/* Custom Header banner to look premium and aligned */}
      <div className="relative bg-gradient-to-br from-[#0D1A33] to-[#1e3a5f] px-6 pt-6 pb-5">
        <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/2 pointer-events-none" />
        <div className="relative flex items-center gap-3">
          <div className="w-10 h-10 bg-white/10 rounded-2xl flex items-center justify-center border border-white/20 flex-shrink-0">
            <LuBug size={20} className="text-white" />
          </div>
          <div>
            <h2 className="text-white font-black text-lg leading-tight">
              {t('title')}
            </h2>
            <p className="text-white/60 text-xs mt-0.5">
              {t('subtitle')}
            </p>
          </div>
        </div>
      </div>

      {/* Content area */}
      <div className="p-6">
        {formState === 'success' ? (
          <div className="flex flex-col items-center py-6 gap-4 text-center">
            <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center animate-in zoom-in duration-300">
              <span className="text-emerald-600 text-2xl font-bold">✓</span>
            </div>
            <div>
              <h3 className="text-xl font-black text-slate-800">{t('successTitle')}</h3>
              <p className="text-slate-500 text-sm mt-1 leading-relaxed">
                {t('successDesc')}
              </p>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              id="bug-title"
              label={t('titleLabel')}
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder={t('titlePlaceholder')}
              required
              disabled={formState === 'loading'}
            />

            <Select
              label={t('severityLabel')}
              options={SEVERITY_OPTIONS}
              value={severity}
              onChange={(val) => setSeverity(val as BugReportSeverity)}
            />

            <Textarea
              id="bug-description"
              label={t('descriptionLabel')}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder={t('descriptionPlaceholder')}
              required
              rows={3}
              disabled={formState === 'loading'}
            />

            <Textarea
              id="bug-steps"
              label={t('stepsLabel')}
              value={steps}
              onChange={(e) => setSteps(e.target.value)}
              placeholder={t('stepsPlaceholder')}
              rows={3}
              disabled={formState === 'loading'}
              className="font-mono text-sm"
            />

            {formState === 'error' && (
              <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-3 text-sm text-red-700 font-medium">
                {errorMsg}
              </div>
            )}

            <div className="flex gap-3 pt-2">
              <Button
                variant="outline"
                label={t('cancel')}
                onClick={handleClose}
                disabled={formState === 'loading'}
                className="flex-1"
              />
              <Button
                variant="primary"
                type="submit"
                label={formState === 'loading' ? t('submitting') : t('submit')}
                loading={formState === 'loading'}
                disabled={!title.trim() || !description.trim()}
                className="flex-1"
              />
            </div>
          </form>
        )}
      </div>
    </Modal>
  );
}
