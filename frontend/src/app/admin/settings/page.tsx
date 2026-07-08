"use client";

import React, { useEffect, useMemo, useState } from "react";
import {
  MENTEE_POLICY_CONFIG_KEY,
  systemConfigGateway,
  type PolicyConfigValue,
  type PolicySection,
  type SystemConfigRecord,
} from "@/core/gateway";
import {
  LuCheck,
  LuFileText,
  LuPlus,
  LuRefreshCw,
  LuSave,
  LuTrash2,
} from "react-icons/lu";

const EMPTY_POLICY: PolicyConfigValue = {
  type: "mentee_policy",
  title: "Chính sách dành cho Mentee",
  version: "1.0",
  effectiveDate: "2026-07-31",
  subtitle: "Nền tảng học trực tuyến vì cộng đồng",
  acknowledgement:
    "Bằng việc đăng ký và sử dụng nền tảng Học Từ Thiện, Mentee xác nhận đã đọc, hiểu và đồng ý tuân thủ chính sách này.",
  supportEmail: "support@hoctuthien.com",
  websiteUrl: "https://hoctuthien.com",
  sections: [],
};

function normalizePolicy(value: any): PolicyConfigValue {
  return {
    ...EMPTY_POLICY,
    ...(value || {}),
    sections: Array.isArray(value?.sections) ? value.sections : [],
  };
}

function splitItems(value: string) {
  return value
    .split("\n")
    .map((item) => item.trim())
    .filter(Boolean);
}

export default function AdminSettingsPage() {
  const [config, setConfig] = useState<SystemConfigRecord<PolicyConfigValue> | null>(null);
  const [policy, setPolicy] = useState<PolicyConfigValue>(EMPTY_POLICY);
  const [description, setDescription] = useState(
    "Chính sách Mentee hiển thị tại footer và màn hình đăng ký",
  );
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const previewSections = useMemo(
    () => policy.sections.filter((section) => section.title.trim()),
    [policy.sections],
  );

  const fetchConfig = async () => {
    try {
      setLoading(true);
      setError(null);
      const configs = await systemConfigGateway.getAll();
      const found = configs.find((item) => item.configKey === MENTEE_POLICY_CONFIG_KEY);
      if (found) {
        setConfig(found as SystemConfigRecord<PolicyConfigValue>);
        setPolicy(normalizePolicy(found.configValue));
        setDescription(found.description || "");
      } else {
        setConfig(null);
        setPolicy(EMPTY_POLICY);
      }
    } catch (err: any) {
      setError(err?.message || "Không thể tải cấu hình chính sách.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchConfig();
  }, []);

  const updatePolicy = (patch: Partial<PolicyConfigValue>) => {
    setPolicy((current) => ({ ...current, ...patch }));
  };

  const updateSection = (index: number, patch: Partial<PolicySection>) => {
    setPolicy((current) => ({
      ...current,
      sections: current.sections.map((section, sectionIndex) =>
        sectionIndex === index ? { ...section, ...patch } : section,
      ),
    }));
  };

  const addSection = () => {
    setPolicy((current) => ({
      ...current,
      sections: [...current.sections, { title: "Điều mới", items: ["Nội dung chính sách"] }],
    }));
  };

  const removeSection = (index: number) => {
    setPolicy((current) => ({
      ...current,
      sections: current.sections.filter((_, sectionIndex) => sectionIndex !== index),
    }));
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      setMessage(null);
      setError(null);
      const payload = {
        configValue: {
          ...policy,
          type: "mentee_policy",
          sections: policy.sections.map((section) => ({
            title: section.title.trim(),
            items: section.items.map((item) => item.trim()).filter(Boolean),
          })),
        },
        description,
        status: "active",
      };

      const saved = config
        ? await systemConfigGateway.update(config.id, payload)
        : await systemConfigGateway.create({
            configKey: MENTEE_POLICY_CONFIG_KEY,
            ...payload,
          });

      setConfig(saved as SystemConfigRecord<PolicyConfigValue>);
      setMessage("Đã lưu chính sách Mentee.");
    } catch (err: any) {
      setError(err?.message || "Lưu cấu hình thất bại.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 rounded-2xl border border-slate-100 bg-white p-6 shadow-sm lg:flex-row lg:items-center lg:justify-between">
        <div className="flex items-start gap-4">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
            <LuFileText size={22} />
          </div>
          <div>
            <h1 className="text-2xl font-black text-slate-900">Cấu hình chính sách</h1>
            <p className="mt-1 text-sm text-slate-500">
              Chính sách này hiển thị ở footer, trang điều khoản và lúc đăng ký tài khoản.
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={fetchConfig}
            className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-bold text-slate-600 transition-colors hover:border-blue-300 hover:text-blue-600"
          >
            <LuRefreshCw size={15} className={loading ? "animate-spin" : ""} />
            Tải lại
          </button>
          <button
            type="button"
            onClick={handleSave}
            disabled={saving || loading}
            className="flex items-center gap-2 rounded-xl border-0 bg-blue-600 px-4 py-2.5 text-sm font-black text-white shadow-sm transition-colors hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {saving ? <LuRefreshCw size={15} className="animate-spin" /> : <LuSave size={15} />}
            Lưu chính sách
          </button>
        </div>
      </div>

      {message && (
        <div className="flex items-center gap-2 rounded-xl border border-emerald-100 bg-emerald-50 px-4 py-3 text-sm font-semibold text-emerald-700">
          <LuCheck size={15} />
          {message}
        </div>
      )}
      {error && (
        <div className="rounded-xl border border-rose-100 bg-rose-50 px-4 py-3 text-sm font-semibold text-rose-700">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-[minmax(0,1fr)_420px]">
        <div className="space-y-5">
          <div className="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm">
            <h2 className="text-sm font-black uppercase tracking-wide text-slate-500">
              Thông tin chung
            </h2>
            <div className="mt-5 grid grid-cols-1 gap-4 md:grid-cols-2">
              {[
                ["Tiêu đề", "title"],
                ["Phiên bản", "version"],
                ["Ngày hiệu lực", "effectiveDate"],
                ["Dòng mô tả", "subtitle"],
                ["Email hỗ trợ", "supportEmail"],
                ["Website", "websiteUrl"],
              ].map(([label, key]) => (
                <label key={key} className="flex flex-col gap-1.5">
                  <span className="text-xs font-black uppercase tracking-wide text-slate-500">
                    {label}
                  </span>
                  <input
                    type={key === "effectiveDate" ? "date" : "text"}
                    value={(policy as any)[key] || ""}
                    onChange={(event) => updatePolicy({ [key]: event.target.value } as any)}
                    className="rounded-xl border border-slate-200 px-3 py-2.5 text-sm font-semibold text-slate-700 outline-none transition-colors focus:border-blue-500"
                  />
                </label>
              ))}
            </div>
            <label className="mt-4 flex flex-col gap-1.5">
              <span className="text-xs font-black uppercase tracking-wide text-slate-500">
                Lời xác nhận khi đăng ký
              </span>
              <textarea
                value={policy.acknowledgement || ""}
                onChange={(event) => updatePolicy({ acknowledgement: event.target.value })}
                className="min-h-[96px] rounded-xl border border-slate-200 px-3 py-2.5 text-sm font-semibold leading-relaxed text-slate-700 outline-none transition-colors focus:border-blue-500"
              />
            </label>
            <label className="mt-4 flex flex-col gap-1.5">
              <span className="text-xs font-black uppercase tracking-wide text-slate-500">
                Ghi chú nội bộ
              </span>
              <input
                value={description}
                onChange={(event) => setDescription(event.target.value)}
                className="rounded-xl border border-slate-200 px-3 py-2.5 text-sm font-semibold text-slate-700 outline-none transition-colors focus:border-blue-500"
              />
            </label>
          </div>

          <div className="space-y-4">
            {policy.sections.map((section, index) => (
              <div key={`${section.title}-${index}`} className="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm">
                <div className="mb-4 flex items-center justify-between gap-3">
                  <h3 className="text-sm font-black uppercase tracking-wide text-slate-500">
                    Mục chính sách {index + 1}
                  </h3>
                  <button
                    type="button"
                    onClick={() => removeSection(index)}
                    className="flex items-center gap-1 rounded-lg border border-rose-100 bg-rose-50 px-3 py-1.5 text-xs font-bold text-rose-600 hover:bg-rose-100"
                  >
                    <LuTrash2 size={13} />
                    Xóa
                  </button>
                </div>
                <label className="flex flex-col gap-1.5">
                  <span className="text-xs font-black uppercase tracking-wide text-slate-500">
                    Tiêu đề mục
                  </span>
                  <input
                    value={section.title}
                    onChange={(event) => updateSection(index, { title: event.target.value })}
                    className="rounded-xl border border-slate-200 px-3 py-2.5 text-sm font-semibold text-slate-700 outline-none transition-colors focus:border-blue-500"
                  />
                </label>
                <label className="mt-4 flex flex-col gap-1.5">
                  <span className="text-xs font-black uppercase tracking-wide text-slate-500">
                    Nội dung - mỗi dòng là một ý
                  </span>
                  <textarea
                    value={section.items.join("\n")}
                    onChange={(event) =>
                      updateSection(index, { items: splitItems(event.target.value) })
                    }
                    className="min-h-[160px] rounded-xl border border-slate-200 px-3 py-2.5 text-sm font-semibold leading-relaxed text-slate-700 outline-none transition-colors focus:border-blue-500"
                  />
                </label>
              </div>
            ))}
          </div>

          <button
            type="button"
            onClick={addSection}
            className="flex w-full items-center justify-center gap-2 rounded-2xl border border-dashed border-blue-200 bg-blue-50 px-4 py-4 text-sm font-black text-blue-700 transition-colors hover:bg-blue-100"
          >
            <LuPlus size={16} />
            Thêm mục chính sách
          </button>
        </div>

        <aside className="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm xl:sticky xl:top-6 xl:self-start">
          <p className="text-xs font-black uppercase tracking-[0.16em] text-blue-600">
            Xem trước
          </p>
          <h2 className="mt-3 text-2xl font-black text-slate-900">{policy.title}</h2>
          <p className="mt-2 text-xs font-semibold text-slate-500">
            Phiên bản {policy.version} - Áp dụng từ {policy.effectiveDate}
          </p>
          {policy.acknowledgement && (
            <p className="mt-4 rounded-xl bg-blue-50 p-3 text-xs font-semibold leading-relaxed text-blue-900">
              {policy.acknowledgement}
            </p>
          )}
          <div className="mt-5 max-h-[520px] space-y-4 overflow-auto pr-1">
            {previewSections.map((section) => (
              <div key={section.title} className="border-t border-slate-100 pt-4">
                <h3 className="text-sm font-black text-slate-800">{section.title}</h3>
                <ul className="mt-2 space-y-1.5 text-xs leading-relaxed text-slate-500">
                  {section.items.slice(0, 5).map((item) => (
                    <li key={item}>- {item}</li>
                  ))}
                  {section.items.length > 5 && <li>...</li>}
                </ul>
              </div>
            ))}
          </div>
        </aside>
      </div>
    </div>
  );
}
