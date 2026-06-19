type MailLayoutInput = {
  title: string;
  intro: string;
  summary?: string;
  ctaLabel?: string;
  ctaUrl?: string;
  logoUrl?: string | null;
  footerText?: string;
};

type RegistrationEmailInput = {
  recipientName: string;
  frontendBaseUrl: string;
  logoUrl?: string | null;
};

type CourseBookingEmailInput = {
  recipientName: string;
  courseTitle: string;
  mentorName?: string | null;
  meetingTimeLabel: string;
  status: 'pending' | 'confirmed';
  frontendBaseUrl: string;
  logoUrl?: string | null;
};

const brandColor = '#005BBF';
const brandName = 'Học Từ Thiện';

function escapeHtml(value: string) {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function trimTrailingSlash(value: string) {
  return value.replace(/\/+$/, '');
}

function renderEmailLayout(input: MailLayoutInput) {
  const title = escapeHtml(input.title);
  const intro = escapeHtml(input.intro);
  const summary = input.summary ? escapeHtml(input.summary) : null;
  const ctaLabel = input.ctaLabel ? escapeHtml(input.ctaLabel) : null;
  const ctaUrl = input.ctaUrl ? escapeHtml(input.ctaUrl) : null;
  const footerText = escapeHtml(
    input.footerText || 'Bạn nhận được email này vì đã tương tác với hệ thống Học Từ Thiện.',
  );
  const logoHtml = input.logoUrl
    ? `<img src="${escapeHtml(input.logoUrl)}" alt="${brandName}" style="display:block;max-width:160px;width:160px;height:auto;margin:0 auto 16px;" />`
    : `<div style="font-size:28px;font-weight:800;color:${brandColor};margin-bottom:16px;">${brandName}</div>`;

  return `<!DOCTYPE html>
<html lang="vi">
  <body style="margin:0;padding:24px;background:#f3f7fb;font-family:Arial,Helvetica,sans-serif;color:#0f172a;">
    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width:640px;margin:0 auto;background:#ffffff;border-radius:20px;overflow:hidden;">
      <tr>
        <td style="padding:32px 32px 24px;background:linear-gradient(135deg,#eff6ff 0%,#ffffff 100%);text-align:center;">
          ${logoHtml}
          <div style="font-size:28px;font-weight:800;line-height:1.3;margin-bottom:12px;">${title}</div>
          <div style="font-size:15px;line-height:1.7;color:#334155;">${intro}</div>
        </td>
      </tr>
      <tr>
        <td style="padding:0 32px 32px;">
          ${summary ? `<div style="font-size:15px;line-height:1.7;color:#334155;margin-bottom:24px;">${summary}</div>` : ''}
          ${ctaLabel && ctaUrl ? `<div style="margin:0 0 28px;"><a href="${ctaUrl}" style="display:inline-block;background:${brandColor};color:#ffffff;text-decoration:none;font-size:14px;font-weight:700;padding:14px 22px;border-radius:12px;">${ctaLabel}</a></div>` : ''}
          <div style="font-size:13px;line-height:1.7;color:#64748b;border-top:1px solid #e2e8f0;padding-top:20px;">
            ${footerText}
          </div>
        </td>
      </tr>
    </table>
  </body>
</html>`;
}

export function buildRegistrationEmailTemplate(input: RegistrationEmailInput) {
  const dashboardUrl = `${trimTrailingSlash(input.frontendBaseUrl)}/`;
  const intro = `Xin chào ${input.recipientName}, tài khoản của bạn đã được tạo thành công trên ${brandName}.`;
  const summary =
    'Bạn có thể đăng nhập để cập nhật hồ sơ, khám phá khóa học thiện nguyện và bắt đầu kết nối với các cố vấn ngay hôm nay.';

  return {
    subject: 'Chào mừng bạn đến với Học Từ Thiện',
    text: `${intro}\n\n${summary}\n\nTruy cập: ${dashboardUrl}`,
    html: renderEmailLayout({
      title: 'Chào mừng bạn đến với Học Từ Thiện',
      intro,
      summary,
      ctaLabel: 'Truy cập Học Từ Thiện',
      ctaUrl: dashboardUrl,
      logoUrl: input.logoUrl,
    }),
  };
}

export function buildCourseBookingEmailTemplate(input: CourseBookingEmailInput) {
  const bookingUrl = `${trimTrailingSlash(input.frontendBaseUrl)}/my-courses`;
  const isPending = input.status === 'pending';
  const statusLabel = isPending ? 'đã được ghi nhận và đang chờ thanh toán' : 'đã được xác nhận thành công';
  const mentorLine = input.mentorName
    ? `Cố vấn phụ trách: ${input.mentorName}. `
    : '';
  const intro = `Xin chào ${input.recipientName}, đăng ký buổi học cho khóa “${input.courseTitle}” ${statusLabel}.`;
  const summary = `${mentorLine}Thời gian dự kiến: ${input.meetingTimeLabel}. ${isPending ? 'Vui lòng hoàn tất thanh toán để giữ chỗ buổi học này.' : 'Bạn có thể theo dõi lịch học và thông tin phòng học trong mục Khóa học của tôi.'}`;

  return {
    subject: isPending
      ? 'Đăng ký buổi học thành công - chờ thanh toán'
      : 'Đăng ký buổi học thành công',
    text: `${intro}\n\n${summary}\n\nXem chi tiết: ${bookingUrl}`,
    html: renderEmailLayout({
      title: isPending
        ? 'Đăng ký buổi học thành công - chờ thanh toán'
        : 'Đăng ký buổi học thành công',
      intro,
      summary,
      ctaLabel: 'Xem Khóa học của tôi',
      ctaUrl: bookingUrl,
      logoUrl: input.logoUrl,
    }),
  };
}

export type MentorBookingEmailInput = {
  recipientName: string;
  menteeName: string;
  courseTitle: string;
  meetingTimeLabel: string;
  status: 'pending' | 'confirmed';
  frontendBaseUrl: string;
  logoUrl?: string | null;
};

export function buildMentorBookingNotificationEmailTemplate(input: MentorBookingEmailInput) {
  const bookingsUrl = `${trimTrailingSlash(input.frontendBaseUrl)}/mentor/bookings`;
  const isPending = input.status === 'pending';
  const statusLabel = isPending ? 'đã được ghi nhận và đang chờ thanh toán' : 'đã được xác nhận thành công';
  const intro = `Xin chào Cố vấn ${input.recipientName}, học viên ${input.menteeName} đã đăng ký một buổi học mới cho khóa học “${input.courseTitle}” của bạn và ${statusLabel}.`;
  const summary = `Thời gian dự kiến: ${input.meetingTimeLabel}. ${
    isPending
      ? 'Hệ thống sẽ cập nhật trạng thái đã xác nhận khi học viên hoàn tất thanh toán.'
      : 'Vui lòng chuẩn bị và tham gia buổi học đúng giờ qua thông tin phòng học hiển thị trong mục Quản lý Lịch dạy.'
  }`;

  return {
    subject: isPending
      ? 'Có lịch đăng ký buổi học mới - Chờ thanh toán'
      : 'Có lịch đăng ký buổi học mới - Đã xác nhận',
    text: `${intro}\n\n${summary}\n\nXem chi tiết: ${bookingsUrl}`,
    html: renderEmailLayout({
      title: isPending
        ? 'Có lịch đăng ký buổi học mới'
        : 'Có lịch học mới đã xác nhận',
      intro,
      summary,
      ctaLabel: 'Quản lý Lịch dạy',
      ctaUrl: bookingsUrl,
      logoUrl: input.logoUrl,
    }),
  };
}

