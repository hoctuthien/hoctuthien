import { APIRequestContext, APIResponse, request as pwRequest } from '@playwright/test';

/**
 * Backend bọc mọi response REST (trừ GraphQL) qua ResponseTransformInterceptor:
 *   { data: T | T[], message: string, meta: object }
 * Hàm findOne trả về object đơn -> bị bọc thành data: [obj]. Hàm findAll đã có
 * items/data + meta -> giữ nguyên shape { data: T[], meta }.
 * unwrap() chuẩn hoá lại: nếu data là array 1 phần tử không có ý nghĩa danh sách
 * (không phải endpoint list), trả thẳng phần tử đầu.
 */
export function unwrap<T = any>(body: any): T {
  if (body && Array.isArray(body.data)) {
    return (body.data.length <= 1 ? body.data[0] : body.data) as T;
  }
  return body?.data ?? body;
}

export function unwrapList<T = any>(body: any): T[] {
  if (Array.isArray(body?.data)) return body.data as T[];
  return [];
}

export type Role = 'admin' | 'mentor' | 'mentee';

export interface AuthedUser {
  id: string;
  email: string;
  name: string;
  role: string;
  accessToken: string;
  refreshToken: string;
  deviceId: string;
}

let deviceCounter = 0;

/** Sinh device-id duy nhất cho mỗi user/luồng để tránh đụng session giữa các test chạy song song. */
export function nextDeviceId(prefix = 'pw'): string {
  deviceCounter += 1;
  return `${prefix}-device-${Date.now()}-${process.pid}-${deviceCounter}`;
}

export function uniqueEmail(prefix: string): string {
  return `${prefix}_${Date.now()}_${Math.random().toString(36).slice(2, 8)}@e2e.hoctuthien.test`;
}

export const ADMIN_CREDENTIALS = {
  email: 'admin@hoctuthien.com',
  password: 'Admin@123',
};

/** Helper request tiện dụng: tự set Authorization + x-device-id, tự parse JSON, ném lỗi rõ ràng khi cần. */
export class ApiClient {
  constructor(
    private readonly ctx: APIRequestContext,
    public accessToken?: string,
    public deviceId: string = nextDeviceId(),
  ) {}

  private headers(extra?: Record<string, string>) {
    const headers: Record<string, string> = {
      'x-device-id': this.deviceId,
      ...extra,
    };
    if (this.accessToken) headers['Authorization'] = `Bearer ${this.accessToken}`;
    return headers;
  }

  // Chuẩn hoá path: baseURL của Playwright APIRequestContext dùng WHATWG URL()
  // để nối path với baseURL — nếu path bắt đầu bằng "/", nó bị coi là path tuyệt
  // đối và sẽ XOÁ MẤT phần /api/v1 của baseURL. Luôn bỏ dấu "/" đầu ở đây để mọi
  // lời gọi (dù test viết '/foo' hay 'foo') đều ra đúng URL cuối cùng.
  private normalize(url: string) {
    return url.replace(/^\/+/, '');
  }

  get(url: string, options: { params?: Record<string, any>; headers?: Record<string, string> } = {}) {
    return this.ctx.get(this.normalize(url), { headers: this.headers(options.headers), params: options.params });
  }

  post(url: string, data?: any, options: { headers?: Record<string, string> } = {}) {
    return this.ctx.post(this.normalize(url), { headers: this.headers(options.headers), data });
  }

  patch(url: string, data?: any, options: { headers?: Record<string, string> } = {}) {
    return this.ctx.patch(this.normalize(url), { headers: this.headers(options.headers), data });
  }

  delete(url: string, options: { headers?: Record<string, string> } = {}) {
    return this.ctx.delete(this.normalize(url), { headers: this.headers(options.headers) });
  }

  withToken(accessToken: string): ApiClient {
    return new ApiClient(this.ctx, accessToken, this.deviceId);
  }
}

export async function jsonOf(res: APIResponse) {
  const text = await res.text();
  if (!text) return null;
  try {
    return JSON.parse(text);
  } catch {
    return text;
  }
}

/** Đăng ký + đăng nhập user mới (mặc định role mentee), trả về ApiClient đã gắn token. */
export async function registerAndLogin(
  ctx: APIRequestContext,
  opts: { email?: string; password?: string; name?: string; prefix?: string } = {},
): Promise<{ client: ApiClient; user: AuthedUser }> {
  const email = opts.email || uniqueEmail(opts.prefix || 'user');
  const password = opts.password || 'Password123!';
  const name = opts.name || 'E2E Test User';
  const client = new ApiClient(ctx);

  const regRes = await client.post('/auths/register', { email, password, name });
  if (!regRes.ok()) {
    throw new Error(`Register failed (${regRes.status()}): ${JSON.stringify(await jsonOf(regRes))}`);
  }
  const regBody = unwrap<any>(await jsonOf(regRes));

  return {
    client: client.withToken(regBody.access_token),
    user: {
      id: regBody.user.id,
      email: regBody.user.email,
      name: regBody.user.name,
      role: regBody.user.role,
      accessToken: regBody.access_token,
      refreshToken: regBody.refresh_token,
      deviceId: client.deviceId,
    },
  };
}

export async function login(
  ctx: APIRequestContext,
  email: string,
  password: string,
  deviceId: string = nextDeviceId(),
): Promise<{ client: ApiClient; user: AuthedUser }> {
  const client = new ApiClient(ctx, undefined, deviceId);
  const res = await client.post('/auths/login', { email, password });
  if (!res.ok()) {
    throw new Error(`Login failed (${res.status()}): ${JSON.stringify(await jsonOf(res))}`);
  }
  const body = unwrap<any>(await jsonOf(res));
  return {
    client: client.withToken(body.access_token),
    user: {
      id: body.user.id,
      email: body.user.email,
      name: body.user.name,
      role: body.user.role,
      accessToken: body.access_token,
      refreshToken: body.refresh_token,
      deviceId,
    },
  };
}

export async function loginAsAdmin(ctx: APIRequestContext) {
  return login(ctx, ADMIN_CREDENTIALS.email, ADMIN_CREDENTIALS.password);
}

/**
 * Đăng ký mentee mới -> nộp đơn mentor-availability -> admin chuyển in-progress -> admin approve
 * -> đăng nhập lại để lấy JWT có role MENTOR mới. Dùng chung cho mọi test cần 1 mentor active.
 */
export async function onboardMentor(
  ctx: APIRequestContext,
  adminClient: ApiClient,
  opts: { prefix?: string } = {},
): Promise<{ client: ApiClient; user: AuthedUser; applicationId: string }> {
  const { client: candidateClient, user: candidate } = await registerAndLogin(ctx, {
    prefix: opts.prefix || 'mentor',
  });

  const appRes = await candidateClient.post('/mentor-availabilities', {
    jobTitle: 'Senior Instructor',
    company: 'HocTuThien Academy',
    bio: 'E2E onboarding mentor.',
    yearsOfExperience: 5,
    skills: ['TypeScript', 'Testing'],
    linkedinUrl: 'https://linkedin.com/in/e2e-mentor',
    metadata: { certificates: [], degrees: [] },
  });
  if (!appRes.ok()) {
    throw new Error(`Mentor application failed (${appRes.status()}): ${JSON.stringify(await jsonOf(appRes))}`);
  }
  const application = unwrap<any>(await jsonOf(appRes));
  const applicationId = application.id;

  const inProgressRes = await adminClient.patch(`/mentor-availabilities/${applicationId}/in-progress`, {});
  if (!inProgressRes.ok()) {
    throw new Error(
      `Move to in-progress failed (${inProgressRes.status()}): ${JSON.stringify(await jsonOf(inProgressRes))}`,
    );
  }

  const approveRes = await adminClient.patch(`/mentor-availabilities/${applicationId}/approved`, {
    note: 'Approved by e2e test',
  });
  if (!approveRes.ok()) {
    throw new Error(`Approve failed (${approveRes.status()}): ${JSON.stringify(await jsonOf(approveRes))}`);
  }

  const { client: mentorClient, user: mentorUser } = await login(ctx, candidate.email, 'Password123!');

  return { client: mentorClient, user: mentorUser, applicationId };
}

/** Mentor (đã được duyệt) tạo 1 course ACTIVE với lịch dạy cấu hình sẵn. */
export async function createActiveCourse(
  mentorClient: ApiClient,
  opts: {
    price?: number;
    categoryIds?: string[];
    time?: Record<string, string[]>;
    title?: string;
  } = {},
) {
  const payload = {
    title: opts.title || `E2E Course ${Date.now()}`,
    description: 'Course created by Playwright E2E test.',
    price: opts.price ?? 0,
    status: 'ACTIVE',
    thumbnailUrl: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3',
    durationMinutes: 60,
    prerequisites: [],
    categoryIds: opts.categoryIds || [],
    metadata: {
      level: 'beginner',
      format: 'online',
      totalHours: 5,
      time: opts.time || {
        monday: ['09:00-10:30'],
        wednesday: ['14:00-15:30'],
      },
    },
  };

  const res = await mentorClient.post('/courses', payload);
  if (!res.ok()) {
    throw new Error(`Create course failed (${res.status()}): ${JSON.stringify(await jsonOf(res))}`);
  }
  return unwrap<any>(await jsonOf(res));
}

/** Lấy 1 categoryId có sẵn (hoặc tạo mới nếu DB rỗng) để gắn vào course. */
export async function ensureCategoryId(adminClient: ApiClient): Promise<string> {
  const listRes = await adminClient.get('/categories', { params: { limit: '1' } });
  const items = unwrapList<any>(await jsonOf(listRes));
  if (items.length > 0) return items[0].id;

  const createRes = await adminClient.post('/categories', { name: `E2E Category ${Date.now()}` });
  const created = unwrap<any>(await jsonOf(createRes));
  return created.id;
}

const WEEKDAY_INDEX: Record<string, number> = {
  sunday: 0,
  monday: 1,
  tuesday: 2,
  wednesday: 3,
  thursday: 4,
  friday: 5,
  saturday: 6,
};

/**
 * Trả về Date (thời điểm UTC tương ứng với giờ VN, UTC+7) của lần xuất hiện tiếp theo
 * của `weekday` (vd 'monday') tại giờ:phút chỉ định, luôn nằm trong tương lai
 * (ít nhất `minDaysAhead` ngày). Dùng để test lịch dạy theo tuần mà không phụ thuộc
 * vào ngày cố định trong quá khứ/tương lai (tránh test bị mục nát theo thời gian).
 *
 * Đã verify thủ công bằng Intl.DateTimeFormat('...', {timeZone:'Asia/Ho_Chi_Minh'})
 * để đảm bảo weekday/giờ hiển thị đúng ở VN time — validateMeetingTime() ở backend
 * cũng format theo đúng timezone này (course-booking.service.ts).
 */
export function nextWeekdayAt(weekday: keyof typeof WEEKDAY_INDEX, hh: number, mm: number, minDaysAhead = 1): Date {
  const targetDow = WEEKDAY_INDEX[weekday];
  const now = new Date();
  const vnNowStr = new Intl.DateTimeFormat('en-US', {
    timeZone: 'Asia/Ho_Chi_Minh',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(now);
  const [month, day, year] = vnNowStr.split('/').map(Number);
  // Ngày lịch VN hôm nay (chỉ Y/M/D thuần, không có giờ) dùng làm mốc tính weekday.
  const todayDow = new Date(Date.UTC(year, month - 1, day)).getUTCDay();

  let diff = (targetDow - todayDow + 7) % 7;
  if (diff < minDaysAhead) diff += 7;

  // hh:mm tại VN (UTC+7) của ngày (day+diff) => giờ UTC tương ứng = hh-7 cùng ngày đó.
  return new Date(Date.UTC(year, month - 1, day + diff, hh - 7, mm, 0));
}

/**
 * Giống nextWeekdayAt nhưng trả về lần xuất hiện GẦN NHẤT trong QUÁ KHỨ của
 * `weekday` tại giờ:phút chỉ định (cách hiện tại ít nhất `minHoursAgo` giờ).
 * Dùng để test luồng "mentor đánh dấu buổi học COMPLETED" — backend yêu cầu
 * meetingTime phải đã qua (course-booking.service.ts#update), nhưng
 * validateMeetingTime() chỉ so khớp day-of-week + time-of-day theo lịch tuần lặp
 * lại nên một ngày trong quá khứ khớp đúng weekday/giờ vẫn được chấp nhận khi tạo booking.
 */
export function pastWeekdayAt(weekday: keyof typeof WEEKDAY_INDEX, hh: number, mm: number, minHoursAgo = 2): Date {
  const targetDow = WEEKDAY_INDEX[weekday];
  const now = new Date();
  const vnNowStr = new Intl.DateTimeFormat('en-US', {
    timeZone: 'Asia/Ho_Chi_Minh',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(now);
  const [month, day, year] = vnNowStr.split('/').map(Number);
  const todayDow = new Date(Date.UTC(year, month - 1, day)).getUTCDay();

  const diff = (todayDow - targetDow + 7) % 7;
  let candidate = new Date(Date.UTC(year, month - 1, day - diff, hh - 7, mm, 0));

  if (candidate.getTime() > now.getTime() - minHoursAgo * 3600 * 1000) {
    candidate = new Date(candidate.getTime() - 7 * 24 * 3600 * 1000);
  }
  return candidate;
}

export { pwRequest };
