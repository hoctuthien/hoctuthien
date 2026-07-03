type InfoRow = {
  label: string;
  value: string;
  emphasis?: boolean;
};

type StatusBadge = {
  label: string;
  tone: 'success' | 'pending' | 'danger' | 'info';
};

type MailLayoutInput = {
  preheader?: string;
  eyebrow?: string;
  title: string;
  intro: string;
  badge?: StatusBadge;
  summary?: string;
  infoRows?: InfoRow[];
  highlight?: { label: string; value: string; caption?: string };
  ctaLabel?: string;
  ctaUrl?: string;
  secondaryNote?: string;
  logoUrl?: string | null;
  footerText?: string;
};

type RegistrationEmailInput = {
  recipientName: string;
  frontendBaseUrl: string;
  logoUrl?: string | null;
};

type PasswordResetOtpEmailInput = {
  recipientName: string;
  otp: string;
  expiresInMinutes: number;
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

const brandName = 'Học Từ Thiện';
const brandTagline = 'Nền tảng học tập thiện nguyện';

// Bảng màu "premium": navy đậm làm nền header, xanh dương làm accent chính,
// vàng ánh kim làm điểm nhấn nhỏ để tạo cảm giác sang trọng mà vẫn nhất quán với brand.
const palette = {
  navyDark: '#0B1220',
  navyMid: '#0F1E3D',
  accent: '#2563EB',
  accentDark: '#1D4ED8',
  gold: '#D4AF37',
  ink: '#0F172A',
  slate: '#334155',
  muted: '#64748B',
  border: '#E7ECF3',
  surface: '#F5F8FC',
  success: '#0F9D58',
  successBg: '#E9F7EF',
  pending: '#B45309',
  pendingBg: '#FEF3E2',
  danger: '#B91C1C',
  dangerBg: '#FDECEC',
  info: '#1D4ED8',
  infoBg: '#EAF1FF',
};

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

function badgeColors(tone: StatusBadge['tone']) {
  switch (tone) {
    case 'success':
      return { fg: palette.success, bg: palette.successBg };
    case 'pending':
      return { fg: palette.pending, bg: palette.pendingBg };
    case 'danger':
      return { fg: palette.danger, bg: palette.dangerBg };
    default:
      return { fg: palette.info, bg: palette.infoBg };
  }
}

function renderBadge(badge?: StatusBadge) {
  if (!badge) return '';
  const { fg, bg } = badgeColors(badge.tone);
  return `<span style="display:inline-block;background:${bg};color:${fg};font-size:11px;font-weight:700;letter-spacing:0.06em;text-transform:uppercase;padding:6px 14px;border-radius:999px;margin-bottom:18px;">${escapeHtml(badge.label)}</span>`;
}

function renderInfoRows(rows?: InfoRow[]) {
  if (!rows || rows.length === 0) return '';
  const rowsHtml = rows
    .map((row, index) => {
      const borderTop = index === 0 ? '' : `border-top:1px solid ${palette.border};`;
      const valueColor = row.emphasis ? palette.accentDark : palette.ink;
      const valueWeight = row.emphasis ? 800 : 700;
      return `
        <tr>
          <td style="padding:13px 0;${borderTop}font-size:13px;color:${palette.muted};font-weight:600;vertical-align:top;width:38%;">${escapeHtml(row.label)}</td>
          <td style="padding:13px 0;${borderTop}font-size:13px;color:${valueColor};font-weight:${valueWeight};text-align:right;vertical-align:top;">${escapeHtml(row.value)}</td>
        </tr>`;
    })
    .join('');

  return `
    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background:${palette.surface};border:1px solid ${palette.border};border-radius:16px;padding:6px 20px;margin:0 0 28px;">
      ${rowsHtml}
    </table>`;
}

function renderHighlight(highlight?: MailLayoutInput['highlight']) {
  if (!highlight) return '';
  return `
    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="margin:0 0 28px;">
      <tr>
        <td style="background:linear-gradient(135deg,${palette.navyMid} 0%,${palette.navyDark} 100%);border-radius:16px;padding:26px 24px;text-align:center;">
          <div style="font-size:11px;font-weight:700;letter-spacing:0.18em;text-transform:uppercase;color:rgba(255,255,255,0.6);margin-bottom:10px;">${escapeHtml(highlight.label)}</div>
          <div style="font-size:34px;font-weight:800;letter-spacing:0.12em;color:#ffffff;font-family:'Courier New',monospace;">${escapeHtml(highlight.value)}</div>
          ${highlight.caption ? `<div style="font-size:12px;color:rgba(255,255,255,0.55);margin-top:10px;">${escapeHtml(highlight.caption)}</div>` : ''}
        </td>
      </tr>
    </table>`;
}

function renderEmailLayout(input: MailLayoutInput) {
  // intro/summary được các hàm build*Template dựng sẵn dưới dạng HTML tin cậy
  // (chỉ phần dữ liệu người dùng bên trong đã được escapeHtml trước khi nội suy),
  // nên không escape lại ở đây để giữ được các tag <strong> nhấn mạnh.
  const title = escapeHtml(input.title);
  const intro = input.intro;
  const eyebrow = input.eyebrow ? escapeHtml(input.eyebrow) : null;
  const summary = input.summary || null;
  const ctaLabel = input.ctaLabel ? escapeHtml(input.ctaLabel) : null;
  const ctaUrl = input.ctaUrl ? escapeHtml(input.ctaUrl) : null;
  const secondaryNote = input.secondaryNote ? escapeHtml(input.secondaryNote) : null;
  const preheader = escapeHtml(
    (input.preheader || input.intro).replace(/<[^>]*>/g, ''),
  );
  const footerText = escapeHtml(
    input.footerText ||
      'Bạn nhận được email này vì đã tương tác với hệ thống Học Từ Thiện.',
  );
  const year = new Date().getFullYear();

  const logoHtml = input.logoUrl
    ? `<img src="${escapeHtml(input.logoUrl)}" alt="${brandName}" style="display:block;max-width:52px;width:52px;height:52px;border-radius:12px;margin:0 auto 14px;" />`
    : `<div style="display:inline-flex;align-items:center;justify-content:center;width:52px;height:52px;border-radius:12px;background:linear-gradient(135deg,${palette.accent},${palette.accentDark});color:#ffffff;font-size:20px;font-weight:800;margin:0 auto 14px;line-height:52px;">HT</div>`;

  return `<!DOCTYPE html>
<html lang="vi">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <link href="https://fonts.googleapis.com/css2?family=Montserrat:wght@400;500;600;700;800&display=swap" rel="stylesheet" />
    <style>
      body, table, td, div, a, span { font-family: 'Montserrat', Arial, Helvetica, sans-serif !important; }
      a.cta-button:hover { opacity: 0.92; }
      @media (max-width: 480px) {
        .email-card { border-radius: 0 !important; }
        .email-padding { padding-left: 20px !important; padding-right: 20px !important; }
      }
    </style>
  </head>
  <body style="margin:0;padding:0;background:${palette.navyDark};font-family:'Montserrat',Arial,Helvetica,sans-serif;color:${palette.ink};">
    <div style="display:none;max-height:0;overflow:hidden;opacity:0;">${preheader}</div>
    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background:${palette.navyDark};padding:40px 16px;">
      <tr>
        <td align="center">
          <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width:600px;">

            <!-- Header / Brand mark -->
            <tr>
              <td align="center" style="padding:0 12px 24px;">
                ${logoHtml}
                <div style="font-size:17px;font-weight:800;color:#ffffff;letter-spacing:0.01em;">${brandName}</div>
                <div style="font-size:11px;font-weight:600;color:rgba(255,255,255,0.45);letter-spacing:0.08em;text-transform:uppercase;margin-top:2px;">${brandTagline}</div>
              </td>
            </tr>

            <!-- Main Card -->
            <tr>
              <td class="email-card" style="background:#ffffff;border-radius:24px;overflow:hidden;box-shadow:0 24px 48px -12px rgba(0,0,0,0.35);">
                <table role="presentation" width="100%" cellspacing="0" cellpadding="0">
                  <tr>
                    <td style="height:6px;background:linear-gradient(90deg,${palette.gold},${palette.accent} 45%,${palette.accentDark});line-height:6px;font-size:0;">&nbsp;</td>
                  </tr>
                  <tr>
                    <td class="email-padding" style="padding:40px 44px 12px;">
                      ${eyebrow ? `<div style="font-size:11px;font-weight:800;letter-spacing:0.16em;text-transform:uppercase;color:${palette.accent};margin-bottom:10px;">${eyebrow}</div>` : ''}
                      ${renderBadge(input.badge)}
                      <div style="font-size:24px;font-weight:800;line-height:1.35;color:${palette.ink};margin-bottom:14px;">${title}</div>
                      <div style="font-size:14.5px;line-height:1.75;color:${palette.slate};margin-bottom:24px;">${intro}</div>
                    </td>
                  </tr>
                  <tr>
                    <td class="email-padding" style="padding:0 44px;">
                      ${renderHighlight(input.highlight)}
                      ${renderInfoRows(input.infoRows)}
                      ${summary ? `<div style="font-size:13.5px;line-height:1.75;color:${palette.slate};margin-bottom:26px;">${summary}</div>` : ''}
                      ${
                        ctaLabel && ctaUrl
                          ? `<table role="presentation" cellspacing="0" cellpadding="0" style="margin:0 0 8px;">
                              <tr>
                                <td style="border-radius:14px;background:linear-gradient(135deg,${palette.accent},${palette.accentDark});box-shadow:0 10px 24px -6px rgba(37,99,235,0.55);">
                                  <a class="cta-button" href="${ctaUrl}" style="display:inline-block;color:#ffffff;text-decoration:none;font-size:14px;font-weight:700;padding:15px 28px;border-radius:14px;">${ctaLabel} &rarr;</a>
                                </td>
                              </tr>
                            </table>`
                          : ''
                      }
                      ${secondaryNote ? `<div style="font-size:12.5px;line-height:1.7;color:${palette.muted};margin:18px 0 8px;">${secondaryNote}</div>` : ''}
                    </td>
                  </tr>
                  <tr>
                    <td class="email-padding" style="padding:28px 44px 36px;">
                      <div style="height:1px;background:${palette.border};margin-bottom:20px;"></div>
                      <div style="font-size:12px;line-height:1.7;color:${palette.muted};">${footerText}</div>
                    </td>
                  </tr>
                </table>
              </td>
            </tr>

            <!-- Footer -->
            <tr>
              <td align="center" style="padding:28px 20px 0;">
                <div style="font-size:11.5px;color:rgba(255,255,255,0.4);line-height:1.8;">
                  © ${year} ${brandName}. Kết nối tri thức, lan toả yêu thương.<br />
                  Email này được gửi tự động, vui lòng không trả lời trực tiếp.
                </div>
              </td>
            </tr>

          </table>
        </td>
      </tr>
    </table>
  </body>
</html>`;
}

export function buildRegistrationEmailTemplate(input: RegistrationEmailInput) {
  const dashboardUrl = `${trimTrailingSlash(input.frontendBaseUrl)}/`;
  const intro = `Xin chào <strong>${escapeHtml(input.recipientName)}</strong>, tài khoản của bạn đã được tạo thành công trên ${brandName}. Chúng tôi rất vui khi được đồng hành cùng bạn trên hành trình học tập và lan toả tri thức.`;
  const summary =
    'Bạn có thể đăng nhập để cập nhật hồ sơ, khám phá các khoá học thiện nguyện chất lượng cao và bắt đầu kết nối với những Cố vấn giàu kinh nghiệm ngay hôm nay.';

  return {
    subject: 'Chào mừng bạn đến với Học Từ Thiện',
    text: `Xin chào ${input.recipientName}, tài khoản của bạn đã được tạo thành công trên ${brandName}.\n\n${summary}\n\nTruy cập: ${dashboardUrl}`,
    html: renderEmailLayout({
      eyebrow: 'Chào mừng thành viên mới',
      title: 'Tài khoản của bạn đã sẵn sàng',
      intro,
      summary,
      ctaLabel: 'Khám phá ngay',
      ctaUrl: dashboardUrl,
      logoUrl: input.logoUrl,
      preheader: `Tài khoản ${brandName} của ${input.recipientName} đã được tạo thành công.`,
    }),
  };
}

export function buildPasswordResetOtpEmailTemplate(
  input: PasswordResetOtpEmailInput,
) {
  const resetUrl = `${trimTrailingSlash(input.frontendBaseUrl)}/forgot-password`;
  const intro = `Xin chào <strong>${escapeHtml(input.recipientName)}</strong>, chúng tôi đã nhận được yêu cầu đặt lại mật khẩu cho tài khoản ${brandName} của bạn. Sử dụng mã xác thực dưới đây để tiếp tục.`;
  const summary = `Nếu bạn không thực hiện yêu cầu này, vui lòng bỏ qua email và mật khẩu hiện tại của bạn sẽ không bị thay đổi.`;

  return {
    subject: 'Mã OTP đặt lại mật khẩu Học Từ Thiện',
    text: `Xin chào ${input.recipientName}, mã OTP đặt lại mật khẩu của bạn là: ${input.otp}. Mã có hiệu lực trong ${input.expiresInMinutes} phút.\n\n${summary}\n\nTrang đặt lại mật khẩu: ${resetUrl}`,
    html: renderEmailLayout({
      eyebrow: 'Bảo mật tài khoản',
      title: 'Mã xác thực đặt lại mật khẩu',
      intro,
      highlight: {
        label: 'Mã OTP của bạn',
        value: input.otp,
        caption: `Có hiệu lực trong ${input.expiresInMinutes} phút`,
      },
      summary,
      ctaLabel: 'Mở trang đặt lại mật khẩu',
      ctaUrl: resetUrl,
      logoUrl: input.logoUrl,
      preheader: `Mã OTP đặt lại mật khẩu của bạn là ${input.otp}, hiệu lực ${input.expiresInMinutes} phút.`,
      footerText:
        'Vì lý do bảo mật, mã OTP chỉ dùng được một lần và mã mới sẽ luôn thay thế mã cũ.',
    }),
  };
}

export function buildCourseBookingEmailTemplate(
  input: CourseBookingEmailInput,
) {
  const bookingUrl = `${trimTrailingSlash(input.frontendBaseUrl)}/my-courses`;
  const isPending = input.status === 'pending';
  const intro = `Xin chào <strong>${escapeHtml(input.recipientName)}</strong>, đăng ký buổi học của bạn đã được ghi nhận thành công. Chi tiết buổi học được tóm tắt bên dưới.`;
  const summary = isPending
    ? 'Vui lòng hoàn tất thanh toán trong thời gian sớm nhất để giữ chỗ cho buổi học này.'
    : 'Bạn có thể theo dõi lịch học và thông tin phòng học trực tuyến trong mục "Khóa học của tôi".';

  const infoRows = [
    { label: 'Khoá học', value: input.courseTitle, emphasis: true },
    ...(input.mentorName ? [{ label: 'Cố vấn phụ trách', value: input.mentorName }] : []),
    { label: 'Thời gian dự kiến', value: input.meetingTimeLabel },
  ];

  return {
    subject: isPending
      ? 'Đăng ký buổi học thành công - chờ thanh toán'
      : 'Đăng ký buổi học thành công',
    text: `Xin chào ${input.recipientName}, đăng ký buổi học cho khóa "${input.courseTitle}" ${isPending ? 'đã được ghi nhận, đang chờ thanh toán' : 'đã được xác nhận thành công'}.\n\nCố vấn: ${input.mentorName || '—'}\nThời gian: ${input.meetingTimeLabel}\n\n${summary}\n\nXem chi tiết: ${bookingUrl}`,
    html: renderEmailLayout({
      eyebrow: 'Lịch học',
      badge: isPending
        ? { label: 'Chờ thanh toán', tone: 'pending' }
        : { label: 'Đã xác nhận', tone: 'success' },
      title: isPending ? 'Đăng ký buổi học thành công' : 'Buổi học đã được xác nhận',
      intro,
      infoRows,
      summary,
      ctaLabel: 'Xem Khóa học của tôi',
      ctaUrl: bookingUrl,
      logoUrl: input.logoUrl,
      preheader: `Khoá học "${input.courseTitle}" ${isPending ? 'đang chờ thanh toán' : 'đã được xác nhận'} — ${input.meetingTimeLabel}.`,
    }),
  };
}

export type MentorApprovalEmailInput = {
  recipientName: string;
  approved: boolean;
  rejectReason?: string | null;
  frontendBaseUrl: string;
  logoUrl?: string | null;
};

export function buildMentorApprovalEmailTemplate(
  input: MentorApprovalEmailInput,
) {
  const dashboardUrl = `${trimTrailingSlash(input.frontendBaseUrl)}/dashboard`;
  const intro = input.approved
    ? `Xin chúc mừng <strong>${escapeHtml(input.recipientName)}</strong>! Hồ sơ Cố vấn (Mentor) của bạn đã được Ban quản trị xét duyệt và phê duyệt thành công.`
    : `Xin chào <strong>${escapeHtml(input.recipientName)}</strong>, hồ sơ đăng ký Cố vấn (Mentor) của bạn chưa được phê duyệt trong lần xét duyệt này.`;
  const summary = input.approved
    ? 'Bạn đã có thể tạo khoá học và bắt đầu nhận đăng ký buổi học từ các học viên. Hãy truy cập bảng điều khiển để bắt đầu hành trình cố vấn của mình.'
    : 'Bạn có thể bổ sung, hoàn thiện thông tin hồ sơ và gửi lại đơn đăng ký Cố vấn để Ban quản trị xem xét lần tiếp theo.';

  return {
    subject: input.approved
      ? 'Hồ sơ Cố vấn đã được phê duyệt'
      : 'Thông báo kết quả xét duyệt hồ sơ Cố vấn',
    text: `${input.approved ? `Xin chúc mừng ${input.recipientName}! Hồ sơ Cố vấn của bạn đã được phê duyệt.` : `Hồ sơ Cố vấn của ${input.recipientName} chưa được phê duyệt lần này.`}${input.rejectReason ? `\nLý do: ${input.rejectReason}` : ''}\n\n${summary}\n\nTruy cập: ${dashboardUrl}`,
    html: renderEmailLayout({
      eyebrow: 'Chương trình Cố vấn',
      badge: input.approved
        ? { label: 'Đã phê duyệt', tone: 'success' }
        : { label: 'Cần bổ sung', tone: 'danger' },
      title: input.approved
        ? 'Hồ sơ Cố vấn đã được phê duyệt'
        : 'Kết quả xét duyệt hồ sơ Cố vấn',
      intro,
      infoRows: !input.approved && input.rejectReason
        ? [{ label: 'Lý do', value: input.rejectReason }]
        : undefined,
      summary,
      ctaLabel: input.approved ? 'Vào bảng điều khiển' : 'Cập nhật hồ sơ',
      ctaUrl: dashboardUrl,
      logoUrl: input.logoUrl,
      preheader: input.approved
        ? 'Hồ sơ Cố vấn của bạn đã được phê duyệt thành công.'
        : 'Hồ sơ Cố vấn của bạn cần được bổ sung thêm thông tin.',
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

export function buildMentorBookingNotificationEmailTemplate(
  input: MentorBookingEmailInput,
) {
  const bookingsUrl = `${trimTrailingSlash(input.frontendBaseUrl)}/mentor/bookings`;
  const isPending = input.status === 'pending';
  const intro = `Xin chào Cố vấn <strong>${escapeHtml(input.recipientName)}</strong>, học viên <strong>${escapeHtml(input.menteeName)}</strong> vừa đăng ký một buổi học mới cho khoá học của bạn.`;
  const summary = isPending
    ? 'Hệ thống sẽ tự động cập nhật trạng thái đã xác nhận ngay khi học viên hoàn tất thanh toán.'
    : 'Vui lòng chuẩn bị và tham gia buổi học đúng giờ theo thông tin phòng học hiển thị trong mục "Quản lý Lịch dạy".';

  const infoRows = [
    { label: 'Khoá học', value: input.courseTitle, emphasis: true },
    { label: 'Học viên', value: input.menteeName },
    { label: 'Thời gian dự kiến', value: input.meetingTimeLabel },
  ];

  return {
    subject: isPending
      ? 'Có lịch đăng ký buổi học mới - Chờ thanh toán'
      : 'Có lịch đăng ký buổi học mới - Đã xác nhận',
    text: `Xin chào Cố vấn ${input.recipientName}, học viên ${input.menteeName} đã đăng ký buổi học cho khóa "${input.courseTitle}".\n\nThời gian: ${input.meetingTimeLabel}\n\n${summary}\n\nXem chi tiết: ${bookingsUrl}`,
    html: renderEmailLayout({
      eyebrow: 'Lịch dạy',
      badge: isPending
        ? { label: 'Chờ thanh toán', tone: 'pending' }
        : { label: 'Đã xác nhận', tone: 'success' },
      title: isPending
        ? 'Có lịch đăng ký buổi học mới'
        : 'Buổi học mới đã được xác nhận',
      intro,
      infoRows,
      summary,
      ctaLabel: 'Quản lý Lịch dạy',
      ctaUrl: bookingsUrl,
      logoUrl: input.logoUrl,
      preheader: `Học viên ${input.menteeName} đã đăng ký "${input.courseTitle}" — ${input.meetingTimeLabel}.`,
    }),
  };
}

export type PaymentTransactionEmailInput = {
  paymentType: string;
  amount: number;
  transactionCode: string;
  qrUrl: string;
  frontendBaseUrl: string;
  logoUrl?: string | null;
};

export function buildPaymentTransactionEmailTemplate(
  input: PaymentTransactionEmailInput,
) {
  const intro = `Hệ thống vừa phát sinh một yêu cầu thanh toán mới cần theo dõi.`;
  const summary = `Vui lòng đối soát với sao kê ngân hàng khi nhận được thông báo chuyển khoản có nội dung tương ứng.`;

  const infoRows = [
    { label: 'Loại giao dịch', value: input.paymentType.toUpperCase(), emphasis: true },
    { label: 'Nội dung chuyển khoản', value: input.transactionCode },
    { label: 'Số tiền', value: `${input.amount.toLocaleString('vi-VN')} VND`, emphasis: true },
  ];

  return {
    subject: `Giao dịch phát sinh: ${input.paymentType.toUpperCase()} - ${input.transactionCode}`,
    text: `${intro}\n\nLoại giao dịch: ${input.paymentType}\nMã chuyển khoản: ${input.transactionCode}\nSố tiền: ${input.amount} VND\nQR URL: ${input.qrUrl}`,
    html: renderEmailLayout({
      eyebrow: 'Thông báo hệ thống',
      badge: { label: 'Chờ xử lý', tone: 'pending' },
      title: 'Giao dịch thanh toán mới',
      intro,
      infoRows,
      summary,
      ctaLabel: 'Xem mã QR giao dịch',
      ctaUrl: input.qrUrl,
      logoUrl: input.logoUrl,
      preheader: `Giao dịch ${input.paymentType.toUpperCase()} - ${input.transactionCode} - ${input.amount.toLocaleString('vi-VN')}đ`,
      footerText: 'Email này được gửi cho Ban quản trị để theo dõi giao dịch thanh toán VietQR.',
    }),
  };
}
