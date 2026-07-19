import { apiService } from '@/core/api/base';
import { getTranslations } from 'next-intl/server';

type PolicySection = {
  title: string;
  items: string[];
};

type PolicyConfigValue = {
  title: string;
  version: string;
  effectiveDate: string;
  subtitle?: string;
  acknowledgement?: string;
  supportEmail?: string;
  websiteUrl?: string;
  sections: PolicySection[];
};

const FALLBACK_POLICY: PolicyConfigValue = {
  title: 'Chính sách dành cho Mentee',
  version: '1.0',
  effectiveDate: '2026-07-31',
  subtitle: 'Nền tảng học trực tuyến vì cộng đồng',
  acknowledgement:
    'Bằng việc đăng ký và sử dụng nền tảng Học Từ Thiện, Mentee xác nhận đã đọc, hiểu và đồng ý tuân thủ chính sách này.',
  supportEmail: 'support@hoctuthien.com',
  websiteUrl: 'https://hoctuthien.com',
  sections: [],
};

export const dynamic = 'force-dynamic';

async function getMenteePolicy(): Promise<PolicyConfigValue> {
  try {
    const res = await apiService.get<any>('/system-configs/public/mentee_policy');
    return res.data?.data?.[0]?.configValue || FALLBACK_POLICY;
  } catch {
    return FALLBACK_POLICY;
  }
}

function formatDate(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleDateString('vi-VN', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });
}

export default async function PoliciesPage() {
  const policy = await getMenteePolicy();
  const t = await getTranslations('Extracted.appPublicPoliciesPage');

  return (
    <main className="bg-[#F8FAFC] py-12 md:py-16">
      <div className="container-custom max-w-4xl">
        <div className="mb-8">
          <p className="text-xs font-black uppercase tracking-[0.18em] text-[#005BBF]">
            {t('hocTuThien')}
          </p>
          <h1 className="mt-3 text-3xl md:text-4xl font-black text-[#0F172A] tracking-tight">
            {policy.title}
          </h1>
          <p className="mt-3 text-sm font-semibold text-[#64748B]">
            {t('version')} {policy.version} {t('effectiveFrom')} {formatDate(policy.effectiveDate)}
            {policy.subtitle ? ` - ${policy.subtitle}` : ''}
          </p>
          {policy.acknowledgement && (
            <p className="mt-5 rounded-2xl border border-blue-100 bg-blue-50 p-4 text-sm font-semibold leading-relaxed text-blue-900">
              {policy.acknowledgement}
            </p>
          )}
        </div>

        <div className="space-y-5">
          {policy.sections.map((section) => (
            <section
              key={section.title}
              className="bg-white border border-slate-100 rounded-2xl p-6 shadow-sm"
            >
              <h2 className="text-lg font-black text-[#0F172A]">{section.title}</h2>
              <ul className="mt-4 space-y-2.5 text-sm leading-relaxed text-[#475569]">
                {section.items.map((item) => (
                  <li key={item} className="flex gap-2">
                    <span className="mt-2 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-[#005BBF]" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </section>
          ))}
        </div>

        <div className="mt-8 rounded-2xl border border-slate-200 bg-white p-5 text-sm text-[#475569]">
          <p className="font-bold text-[#0F172A]">{t('supportContact')}</p>
          <p className="mt-1">
            {t('email')}: {policy.supportEmail || 'support@hoctuthien.com'} | {t('website')}:{' '}
            {policy.websiteUrl || 'https://hoctuthien.com'}
          </p>
        </div>
      </div>
    </main>
  );
}
