import { test, expect } from '@playwright/test';
import {
  ApiClient,
  jsonOf,
  loginAsAdmin,
  login,
  registerAndLogin,
  unwrap,
  unwrapList,
} from './support/api';

test.describe('Mentor onboarding flow', () => {
  test('mentee applies -> admin moves to in-progress -> admin approves -> role flips to MENTOR and profile is created', async ({
    request,
  }) => {
    const { client: adminClient } = await loginAsAdmin(request);
    const { client: candidateClient, user: candidate } = await registerAndLogin(request, {
      prefix: 'onboard_ok',
    });

    // Trước khi có đơn nào, GET /mentor-availabilities/me phải trả về danh sách rỗng
    const emptyMineRes = await candidateClient.get('mentor-availabilities/me');
    expect(emptyMineRes.status()).toBe(200);
    expect(unwrapList(await jsonOf(emptyMineRes))).toHaveLength(0);

    const appRes = await candidateClient.post('mentor-availabilities', {
      jobTitle: 'Senior Instructor',
      company: 'HocTuThien Academy',
      bio: 'E2E onboarding mentor bio.',
      yearsOfExperience: 6,
      skills: ['TypeScript', 'NestJS'],
      linkedinUrl: 'https://linkedin.com/in/e2e-onboarding',
      metadata: { certificates: [], degrees: [] },
    });
    expect(appRes.status()).toBe(201);
    const appBody = unwrap<any>(await jsonOf(appRes));
    const applicationId = appBody.id;
    expect(appBody.status).toBe('PENDING');

    // Mentee không phải admin không được list toàn bộ đơn
    const forbiddenListRes = await candidateClient.get('mentor-availabilities');
    expect(forbiddenListRes.status()).toBe(403);

    // Nộp đơn thứ 2 khi đơn đầu còn PENDING phải bị từ chối
    const dupAppRes = await candidateClient.post('mentor-availabilities', {
      jobTitle: 'Second Application Attempt',
      metadata: { certificates: [], degrees: [] },
    });
    expect(dupAppRes.status()).toBe(400);

    // Admin xem chi tiết đơn
    const adminViewRes = await adminClient.get(`mentor-availabilities/${applicationId}`);
    expect(adminViewRes.status()).toBe(200);
    expect(unwrap<any>(await jsonOf(adminViewRes)).status).toBe('PENDING');

    // Admin chuyển sang in-progress
    const inProgressRes = await adminClient.patch(`mentor-availabilities/${applicationId}/in-progress`, {});
    expect(inProgressRes.status()).toBe(200);
    expect(unwrap<any>(await jsonOf(inProgressRes)).status).toBe('IN_PROGRESS');

    // Admin duyệt
    const approveRes = await adminClient.patch(`mentor-availabilities/${applicationId}/approved`, {
      note: 'Looks good',
    });
    expect(approveRes.status()).toBe(200);
    const approveBody = unwrap<any>(await jsonOf(approveRes));
    expect(approveBody.status).toBe('APPROVED');

    // Đăng nhập lại để lấy JWT phản ánh role mới
    const { user: mentorUser } = await login(request, candidate.email, 'Password123!');
    expect(mentorUser.role).toBe('mentor');

    // Hồ sơ Mentor Profile phải được tự động tạo với thông tin từ đơn đăng ký
    const profileRes = await adminClient.get(`mentor-profiles/user/${candidate.id}`);
    expect(profileRes.status()).toBe(200);
    const profile = unwrap<any>(await jsonOf(profileRes));
    expect(profile.isApproved).toBe(true);
    expect(profile.jobTitle).toBe('Senior Instructor');
    expect(profile.company).toBe('HocTuThien Academy');
  });

  test('admin rejects an application with a reason', async ({ request }) => {
    const { client: adminClient } = await loginAsAdmin(request);
    const { client: candidateClient } = await registerAndLogin(request, { prefix: 'onboard_reject' });

    const appRes = await candidateClient.post('mentor-availabilities', {
      jobTitle: 'Junior Dev',
      metadata: { certificates: [], degrees: [] },
    });
    const applicationId = unwrap<any>(await jsonOf(appRes)).id;

    await adminClient.patch(`mentor-availabilities/${applicationId}/in-progress`, {});
    const rejectRes = await adminClient.patch(`mentor-availabilities/${applicationId}/rejected`, {
      note: 'Chưa đủ kinh nghiệm',
    });
    expect(rejectRes.status()).toBe(200);
    expect(unwrap<any>(await jsonOf(rejectRes)).status).toBe('REJECTED');

    // Không được approve một đơn đã REJECTED
    const approveAfterRejectRes = await adminClient.patch(`mentor-availabilities/${applicationId}/approved`, {
      note: 'retry',
    });
    expect(approveAfterRejectRes.status()).toBe(400);
  });

  test('mentee can cancel their own pending application', async ({ request }) => {
    const { client: candidateClient } = await registerAndLogin(request, { prefix: 'onboard_cancel' });

    const appRes = await candidateClient.post('mentor-availabilities', {
      jobTitle: 'Freelancer',
      metadata: { certificates: [], degrees: [] },
    });
    const applicationId = unwrap<any>(await jsonOf(appRes)).id;

    const cancelRes = await candidateClient.patch(`mentor-availabilities/${applicationId}/cancel`, {});
    expect(cancelRes.status()).toBe(200);
    expect(unwrap<any>(await jsonOf(cancelRes)).status).toBe('CANCEL');
  });

  test('a mentee cannot modify another mentee application by id (ownership boundary)', async ({ request }) => {
    const { client: victimClient } = await registerAndLogin(request, { prefix: 'onboard_victim' });
    const { client: attackerClient } = await registerAndLogin(request, { prefix: 'onboard_attacker' });

    const appRes = await victimClient.post('mentor-availabilities', {
      jobTitle: 'Victim Dev',
      metadata: { certificates: [], degrees: [] },
    });
    const applicationId = unwrap<any>(await jsonOf(appRes)).id;

    // Kẻ tấn công thử cancel đơn của người khác
    const attackCancelRes = await attackerClient.patch(`mentor-availabilities/${applicationId}/cancel`, {});
    expect(attackCancelRes.status()).toBe(400);

    // Kẻ tấn công thử update trực tiếp đơn của người khác qua PATCH chung
    const attackUpdateRes = await attackerClient.patch(`mentor-availabilities/${applicationId}`, {
      jobTitle: 'Hacked Title',
    });
    expect([400, 403]).toContain(attackUpdateRes.status());

    // Xác nhận đơn gốc không bị thay đổi
    const { client: adminClient } = await loginAsAdmin(request);
    const verifyRes = await adminClient.get(`mentor-availabilities/${applicationId}`);
    expect(unwrap<any>(await jsonOf(verifyRes)).jobTitle).toBe('Victim Dev');
  });

  test('non-admin cannot move an application to in-progress or approve it', async ({ request }) => {
    const { client: candidateClient } = await registerAndLogin(request, { prefix: 'onboard_perm' });
    const appRes = await candidateClient.post('mentor-availabilities', {
      jobTitle: 'Dev',
      metadata: { certificates: [], degrees: [] },
    });
    const applicationId = unwrap<any>(await jsonOf(appRes)).id;

    const selfInProgressRes = await candidateClient.patch(`mentor-availabilities/${applicationId}/in-progress`, {});
    expect(selfInProgressRes.status()).toBe(403);

    const selfApproveRes = await candidateClient.patch(`mentor-availabilities/${applicationId}/approved`, {
      note: 'self approve attempt',
    });
    expect(selfApproveRes.status()).toBe(403);
  });
});
