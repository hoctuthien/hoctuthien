'use client';

import { useTranslations } from 'next-intl';
import React, { useState, useEffect } from 'react';
import { authGateway, mentorGateway } from '@/core/gateway';
import { useRouter } from 'next/navigation';
import { signOut } from 'next-auth/react';
import {
  LuUser,
  LuPhone,
  LuImage,
  LuCalendar,
  LuGlobe,
  LuCheck,
  LuLinkedin,
  LuBriefcase,
  LuBookOpen,
  LuLogOut,
  LuTriangleAlert,
  LuRefreshCw
} from 'react-icons/lu';

export function ProfileClient({ user }: { user: any }) {
  const tExtracted = useTranslations('Extracted.appDashboardProfileProfileClient');
  const router = useRouter();

  // Navigation tabs for Mentor
  const [activeTab, setActiveTab] = useState<'personal' | 'teaching'>('personal');

  // Personal Info Form States
  const [name, setName] = useState(user.name || '');
  const [phone, setPhone] = useState(user.phone || '');
  const [avatarUrl, setAvatarUrl] = useState(user.avatarUrl || '');
  const [dayOfBirth, setDayOfBirth] = useState(user.dayOfBirth ? user.dayOfBirth.substring(0, 10) : '');
  const [gender, setGender] = useState(user.gender || 'other');
  const [timezone, setTimezone] = useState(user.timezone || 'Asia/Ho_Chi_Minh');
  const [accountVerified, setAccountVerified] = useState(Boolean(user.isVerified));

  // Mentor Info Form States
  const [mentorProfile, setMentorProfile] = useState<any>(null);
  const [loadingMentor, setLoadingMentor] = useState(false);
  const [jobTitle, setJobTitle] = useState('');
  const [company, setCompany] = useState('');
  const [bio, setBio] = useState('');
  const [linkedinUrl, setLinkedinUrl] = useState('');
  const [yearsOfExperience, setYearsOfExperience] = useState<number | ''>('');
  const [skills, setSkills] = useState('');

  // Status & UI States
  const [submittingUser, setSubmittingUser] = useState(false);
  const [submittingMentor, setSubmittingMentor] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Badges
  const [badges, setBadges] = useState<any[]>([]);
  useEffect(() => {
    import('@/core/api/client').then(({ httpClient }) => {
      httpClient.get('/v1/badges/my')
        .then((res: any) => setBadges(Array.isArray(res) ? res : []))
        .catch(() => setBadges([]));
    });
  }, []);

  useEffect(() => {
    authGateway
      .getMe()
      .then((res) => {
        setAccountVerified(Boolean((res.user as any)?.isVerified));
      })
      .catch(() => {
        setAccountVerified(Boolean(user.isVerified));
      });
  }, [user.isVerified]);

  // Fetch Mentor Profile if role is mentor
  useEffect(() => {
    if (user.role === 'mentor') {
      const fetchMentor = async () => {
        try {
          setLoadingMentor(true);
          const res = await mentorGateway.getMentorProfileByUserId(user.id);
          if (res) {
            setMentorProfile(res);
            setJobTitle(res.jobTitle || '');
            setCompany(res.company || '');
            setBio(res.bio || '');
            setLinkedinUrl(res.linkedinUrl || '');
            setYearsOfExperience(res.yearsOfExperience != null ? res.yearsOfExperience : '');
            setSkills(Array.isArray(res.skills) ? res.skills.join(', ') : '');
          }
        } catch (error) {
          console.error('Không thể tải thông tin hồ sơ cố vấn:', error);
        } finally {
          setLoadingMentor(false);
        }
      };
      fetchMentor();
    }
  }, [user]);

  // Flash Message display helper
  const showMessage = (type: 'success' | 'error', text: string) => {
    setMessage({ type, text });
    setTimeout(() => {
      setMessage(null);
    }, 4000);
  };

  const handleUpdateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setSubmittingUser(true);
      setMessage(null);

      const payload = {
        name: name.trim(),
        phone: phone.trim() || null,
        avatarUrl: avatarUrl.trim() || null,
        dayOfBirth: dayOfBirth ? new Date(dayOfBirth).toISOString() : null,
        gender,
        timezone,
      };

      await authGateway.updateMe(payload);
      showMessage("success", tExtracted('capNhatThongTinCaNhanThanhCong'));
      router.refresh();
    } catch (error: any) {
      console.error('Update personal info failed:', error);
      showMessage("error", error?.message || tExtracted('capNhatThongTinCaNhanThatBai'));
    } finally {
      setSubmittingUser(false);
    }
  };

  const handleUpdateMentor = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setSubmittingMentor(true);
      setMessage(null);

      const skillsArray = skills
        .split(',')
        .map((s) => s.trim())
        .filter((s) => s.length > 0);

      const payload = {
        jobTitle: jobTitle.trim() || null,
        company: company.trim() || null,
        bio: bio.trim() || null,
        linkedinUrl: linkedinUrl.trim() || null,
        yearsOfExperience: yearsOfExperience !== '' ? Number(yearsOfExperience) : null,
        skills: skillsArray,
      };

      await mentorGateway.updateMentorProfileMe(payload);
      showMessage("success", tExtracted('capNhatHoSoGiangDayMentorThanh'));
    } catch (error: any) {
      console.error('Update mentor profile failed:', error);
      showMessage("error", error?.message || tExtracted('capNhatHoSoGiangDayThatBai'));
    } finally {
      setSubmittingMentor(false);
    }
  };

  const handleLogout = async () => {
    try {
      await authGateway.logout();
      await signOut({ callbackUrl: '/login' });
    } catch (error) {
      console.error('Logout failed:', error);
      await signOut({ callbackUrl: '/login' });
    }
  };

  const isMentor = user.role === 'mentor';
  const initials = (name || user.email || '?')
    .split(/\s+/)
    .filter(Boolean)
    .map((part: string) => part[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

  return (
    <div className="w-full font-sans">
      {/* Header section with User Profile Card */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-3xl p-6 md:p-8 text-white shadow-xl mb-8 relative overflow-hidden">
        {/* Subtle background decoration */}
        <div className="absolute right-0 top-0 w-64 h-64 bg-white/5 rounded-full -mr-20 -mt-20 blur-xl"></div>
        <div className="absolute left-1/3 bottom-0 w-48 h-48 bg-indigo-500/10 rounded-full -ml-20 -mb-20 blur-2xl"></div>

        <div className="flex flex-col md:flex-row items-center gap-6 relative z-10">
          <div className="w-24 h-24 rounded-2xl border-4 border-blue-100/90 overflow-hidden bg-white flex items-center justify-center text-4xl font-black text-blue-600 flex-shrink-0 shadow-lg shadow-blue-950/10">
            {avatarUrl ? (
              <img src={avatarUrl} alt={name} className="w-full h-full object-cover" />
            ) : (
              initials
            )}
          </div>
          <div className="flex-1 text-center md:text-left">
            <h1 className="text-2xl md:text-3xl font-black font-[Montserrat] tracking-tight">{name || tExtracted('nguoiDung')}</h1>
            <p className="text-white/80 text-sm mt-1">{user.email}</p>
            <div className="flex flex-wrap items-center justify-center md:justify-start gap-2 mt-3">
              <span className="bg-white/20 text-white font-extrabold text-[10px] uppercase tracking-wider px-3 py-1 rounded-full backdrop-blur-md">
                {tExtracted('vaiTro')}{user.role === 'mentor' ? tExtracted('coVanMentor') : user.role === 'admin' ? tExtracted('quanTriVien') : tExtracted('hocVienMentee')}
              </span>
              <span className={`flex items-center gap-1.5 font-extrabold text-[10px] uppercase tracking-wider px-3 py-1 rounded-full backdrop-blur-md border ${
                accountVerified
                  ? "bg-emerald-500/20 text-emerald-100 border-emerald-300/30"
                  : "bg-amber-500/25 text-amber-100 border-amber-300/30"
              }`}>
                {accountVerified ? <LuCheck size={12} /> : <LuTriangleAlert size={12} />}
                <span>{accountVerified ? tExtracted('taiKhoanDaKichHoat') : tExtracted('taiKhoanChuaKichHoat')}</span>
              </span>
              {isMentor && mentorProfile && (
                <span className={`text-[10px] font-extrabold px-3 py-1 rounded-full uppercase tracking-wider backdrop-blur-md ${
                  mentorProfile.status === 'approved'
                    ? "bg-emerald-500/30 text-emerald-200 border border-emerald-500/20"
                    : "bg-amber-500/30 text-amber-200 border border-amber-500/20"
                }`}>
                  {tExtracted('trangThaiHoSo')}{mentorProfile.status === 'approved' ? tExtracted('daDuyet') : tExtracted('choDuyet')}
                </span>
              )}
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 bg-white/10 hover:bg-white/20 text-white font-black text-xs px-5 py-3 rounded-2xl border border-white/10 transition-all cursor-pointer backdrop-blur-md active:scale-95"
          >
            <LuLogOut size={14} />
            <span>{tExtracted('dangXuat')}</span>
          </button>
        </div>
      </div>

      {/* Toast Flash Message */}
      {message && (
        <div className={`fixed bottom-6 right-6 z-50 p-4 rounded-2xl border shadow-lg flex items-start gap-3 max-w-md animate-in slide-in-from-bottom duration-300 ${
          message.type === 'success'
            ? "bg-emerald-50 border-emerald-200 text-emerald-800"
            : "bg-rose-50 border-rose-200 text-rose-800"
        }`}>
          <div className="mt-0.5">
            {message.type === 'success' ? (
              <LuCheck size={18} className="text-emerald-600" />
            ) : (
              <LuTriangleAlert size={18} className="text-rose-600" />
            )}
          </div>
          <div className="flex-1">
            <h4 className="text-xs font-black uppercase tracking-wider mb-0.5">
              {message.type === 'success' ? tExtracted('thanhCong') : tExtracted('loiHeThong')}
            </h4>
            <p className="text-xs font-semibold leading-relaxed">{message.text}</p>
          </div>
        </div>
      )}

      {/* Tabs Navigation for Mentors */}
      {isMentor && (
        <div className="flex border-b border-[#E2E8F0] mb-8 bg-[#F8FAFC] p-1.5 rounded-2xl gap-1">
          <button
            type="button"
            onClick={() => setActiveTab('personal')}
            className={`flex-1 py-3 px-6 text-xs font-black tracking-wide rounded-xl flex items-center justify-center gap-2 transition-all cursor-pointer border-0 ${
              activeTab === 'personal'
                ? "bg-white text-blue-600 shadow-sm"
                : "text-slate-500 hover:text-slate-700 hover:bg-slate-100/50"
            }`}
          >
            <LuUser size={16} />
            <span>{tExtracted('thongTinCaNhan')}</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('teaching')}
            className={`flex-1 py-3 px-6 text-xs font-black tracking-wide rounded-xl flex items-center justify-center gap-2 transition-all cursor-pointer border-0 ${
              activeTab === 'teaching'
                ? "bg-white text-blue-600 shadow-sm"
                : "text-slate-500 hover:text-slate-700 hover:bg-slate-100/50"
            }`}
          >
            <LuBriefcase size={16} />
            <span>{tExtracted('hoSoGiangDayMentor')}</span>
          </button>
        </div>
      )}

      {/* Form Content container */}
      <div className="bg-white border border-[#E2E8F0] rounded-[32px] p-6 md:p-8 shadow-[0_8px_30px_rgba(0,0,0,0.005)]">
        {activeTab === 'personal' ? (
          <form onSubmit={handleUpdateUser} className="space-y-6">
            <h3 className="text-lg font-black text-[#0F172A] font-[Montserrat] mb-2 tracking-tight">
              {tExtracted('capNhatThongTinCaNhan')}</h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Full Name */}
              <div className="flex flex-col gap-2">
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
                  <LuUser size={14} className="text-slate-400" />
                  <span>{tExtracted('hoVaTen')}</span>
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder={tExtracted('viDuNguyenVanA')}
                  className="w-full border border-slate-200 focus:border-blue-500 rounded-xl p-3 outline-none text-xs font-semibold bg-[#FAFBFD] focus:bg-white transition-colors"
                />
              </div>

              {/* Phone number */}
              <div className="flex flex-col gap-2">
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
                  <LuPhone size={14} className="text-slate-400" />
                  <span>{tExtracted('soDienThoai')}</span>
                </label>
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder={tExtracted('viDu0987654321')}
                  className="w-full border border-slate-200 focus:border-blue-500 rounded-xl p-3 outline-none text-xs font-semibold bg-[#FAFBFD] focus:bg-white transition-colors"
                />
              </div>

              {/* Day of birth */}
              <div className="flex flex-col gap-2">
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
                  <LuCalendar size={14} className="text-slate-400" />
                  <span>{tExtracted('ngaySinh')}</span>
                </label>
                <input
                  type="date"
                  value={dayOfBirth}
                  onChange={(e) => setDayOfBirth(e.target.value)}
                  className="w-full border border-slate-200 focus:border-blue-500 rounded-xl p-3 outline-none text-xs font-semibold bg-[#FAFBFD] focus:bg-white transition-colors"
                />
              </div>

              {/* Gender selector */}
              <div className="flex flex-col gap-2">
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
                  <LuUser size={14} className="text-slate-400" />
                  <span>{tExtracted('gioiTinh')}</span>
                </label>
                <select
                  value={gender}
                  onChange={(e) => setGender(e.target.value)}
                  className="w-full border border-slate-200 focus:border-blue-500 rounded-xl p-3 outline-none text-xs font-semibold bg-[#FAFBFD] focus:bg-white transition-colors cursor-pointer"
                >
                  <option value="male">{tExtracted('nam')}</option>
                  <option value="female">{tExtracted('nu')}</option>
                  <option value="other">{tExtracted('khac')}</option>
                </select>
              </div>

              {/* Timezone */}
              <div className="flex flex-col gap-2">
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
                  <LuGlobe size={14} className="text-slate-400" />
                  <span>{tExtracted('muiGio')}</span>
                </label>
                <input
                  type="text"
                  value={timezone}
                  onChange={(e) => setTimezone(e.target.value)}
                  placeholder={tExtracted('viDuAsiaHoChiMinh')}
                  className="w-full border border-slate-200 focus:border-blue-500 rounded-xl p-3 outline-none text-xs font-semibold bg-[#FAFBFD] focus:bg-white transition-colors"
                />
              </div>

              {/* Avatar URL */}
              <div className="flex flex-col gap-2">
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
                  <LuImage size={14} className="text-slate-400" />
                  <span>{tExtracted('duongDanAnhDaiDienUrl')}</span>
                </label>
                <input
                  type="url"
                  value={avatarUrl}
                  onChange={(e) => setAvatarUrl(e.target.value)}
                  placeholder="https://example.com/avatar.jpg"
                  className="w-full border border-slate-200 focus:border-blue-500 rounded-xl p-3 outline-none text-xs font-semibold bg-[#FAFBFD] focus:bg-white transition-colors"
                />
              </div>
            </div>

            <div className="flex items-center justify-end mt-4 pt-4 border-t border-[#E2E8F0]">
              <button
                type="submit"
                disabled={submittingUser}
                className="bg-blue-600 hover:bg-blue-700 text-white font-extrabold text-xs py-3 px-8 rounded-xl flex items-center justify-center gap-1.5 shadow-md shadow-blue-500/10 active:scale-95 transition-all cursor-pointer disabled:opacity-50 disabled:pointer-events-none"
              >
                {submittingUser ? (
                  <LuRefreshCw className="w-4 h-4 animate-spin" />
                ) : (
                  <>
                    <LuCheck size={14} />
                    <span>{tExtracted('luuThayDoi')}</span>
                  </>
                )}
              </button>
            </div>
          </form>
        ) : (
          <form onSubmit={handleUpdateMentor} className="space-y-6">
            <h3 className="text-lg font-black text-[#0F172A] font-[Montserrat] mb-2 tracking-tight">
              {tExtracted('capNhatHoSoCoVanMentorProfile')}</h3>

            {loadingMentor ? (
              <div className="py-8 flex flex-col items-center justify-center text-slate-400 gap-2">
                <LuRefreshCw size={32} className="animate-spin text-blue-500" />
                <span className="text-xs font-semibold">{tExtracted('dangTaiHoSoGiangDay')}</span>
              </div>
            ) : (
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Job Title */}
                  <div className="flex flex-col gap-2">
                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
                      <LuBriefcase size={14} className="text-slate-400" />
                      <span>{tExtracted('chucDanhCongViecViTri')}</span>
                    </label>
                    <input
                      type="text"
                      value={jobTitle}
                      onChange={(e) => setJobTitle(e.target.value)}
                      placeholder={tExtracted('viDuSeniorSoftwareEngineer')}
                      className="w-full border border-slate-200 focus:border-blue-500 rounded-xl p-3 outline-none text-xs font-semibold bg-[#FAFBFD] focus:bg-white transition-colors"
                    />
                  </div>

                  {/* Company */}
                  <div className="flex flex-col gap-2">
                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
                      <LuBriefcase size={14} className="text-slate-400" />
                      <span>{tExtracted('congTyToChuc')}</span>
                    </label>
                    <input
                      type="text"
                      value={company}
                      onChange={(e) => setCompany(e.target.value)}
                      placeholder={tExtracted('viDuGoogleVietnam')}
                      className="w-full border border-slate-200 focus:border-blue-500 rounded-xl p-3 outline-none text-xs font-semibold bg-[#FAFBFD] focus:bg-white transition-colors"
                    />
                  </div>

                  {/* Years of Experience */}
                  <div className="flex flex-col gap-2">
                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
                      <LuCalendar size={14} className="text-slate-400" />
                      <span>{tExtracted('soNamKinhNghiem')}</span>
                    </label>
                    <input
                      type="number"
                      min={0}
                      value={yearsOfExperience}
                      onChange={(e) => setYearsOfExperience(e.target.value === '' ? '' : Number(e.target.value))}
                      placeholder={tExtracted('viDu5')}
                      className="w-full border border-slate-200 focus:border-blue-500 rounded-xl p-3 outline-none text-xs font-semibold bg-[#FAFBFD] focus:bg-white transition-colors"
                    />
                  </div>

                  {/* LinkedIn URL */}
                  <div className="flex flex-col gap-2">
                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
                      <LuLinkedin size={14} className="text-slate-400" />
                      <span>{tExtracted('duongDanLinkedinUrl')}</span>
                    </label>
                    <input
                      type="url"
                      value={linkedinUrl}
                      onChange={(e) => setLinkedinUrl(e.target.value)}
                      placeholder="https://linkedin.com/in/username"
                      className="w-full border border-slate-200 focus:border-blue-500 rounded-xl p-3 outline-none text-xs font-semibold bg-[#FAFBFD] focus:bg-white transition-colors"
                    />
                  </div>
                </div>

                {/* Skills array as text input */}
                <div className="flex flex-col gap-2">
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
                    <LuBookOpen size={14} className="text-slate-400" />
                    <span>{tExtracted('kyNangGiangDayPhanCachBangDau')}</span>
                  </label>
                  <input
                    type="text"
                    value={skills}
                    onChange={(e) => setSkills(e.target.value)}
                    placeholder={tExtracted('viDuNestjsReactTypescriptDocker')}
                    className="w-full border border-slate-200 focus:border-blue-500 rounded-xl p-3 outline-none text-xs font-semibold bg-[#FAFBFD] focus:bg-white transition-colors"
                  />
                  <span className="text-[10px] text-slate-400 font-semibold italic mt-0.5">
                    {tExtracted('cacKyNangSeDuocHienThiTren')}</span>
                </div>

                {/* Bio text */}
                <div className="flex flex-col gap-2">
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
                    <LuUser size={14} className="text-slate-400" />
                    <span>{tExtracted('gioiThieuBanThanBio')}</span>
                  </label>
                  <textarea
                    value={bio}
                    onChange={(e) => setBio(e.target.value)}
                    placeholder={tExtracted('moTaKinhNghiemPhuongPhapGiangDay')}
                    className="w-full border border-slate-200 focus:border-blue-500 rounded-xl p-3 outline-none text-xs font-semibold bg-[#FAFBFD] focus:bg-white transition-colors min-h-[120px] resize-none leading-relaxed"
                  />
                </div>

                <div className="flex items-center justify-end mt-4 pt-4 border-t border-[#E2E8F0]">
                  <button
                    type="submit"
                    disabled={submittingMentor}
                    className="bg-blue-600 hover:bg-blue-700 text-white font-extrabold text-xs py-3 px-8 rounded-xl flex items-center justify-center gap-1.5 shadow-md shadow-blue-500/10 active:scale-95 transition-all cursor-pointer disabled:opacity-50 disabled:pointer-events-none"
                  >
                    {submittingMentor ? (
                      <LuRefreshCw className="w-4 h-4 animate-spin" />
                    ) : (
                      <>
                        <LuCheck size={14} />
                        <span>{tExtracted('capNhatHoSo')}</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            )}
          </form>
        )}

        {/* Badges Section */}
        {badges.length > 0 && (
          <div className="mt-6 bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
            <h2 className="text-sm font-black text-slate-500 uppercase tracking-wider mb-4">{tExtracted('huyHieuCuaBan')}</h2>
            <div className="flex flex-wrap gap-3">
              {badges.map((ub: any) => (
                <div
                  key={ub.id}
                  className="flex items-center gap-2 bg-amber-50 border border-amber-100 px-3 py-2 rounded-xl"
                  title={ub.badge?.description || ''}
                >
                  <span className="text-lg">🏅</span>
                  <span className="text-xs font-bold text-amber-800">{ub.badge?.name || tExtracted('huyHieu')}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
