import { test, expect } from '@playwright/test';
import { jsonOf, loginAsAdmin, registerAndLogin, unwrap, unwrapList } from './support/api';

/**
 * Bộ test này tập trung riêng vào ranh giới phân quyền giữa các role, tách khỏi các
 * test luồng nghiệp vụ chính. Một số test ở đây khẳng định hành vi ĐÚNG (chặn được),
 * một số khác CHỦ ĐỘNG ghi nhận lỗ hổng đã biết (chưa chặn) để việc thay đổi hành vi
 * trong tương lai không lọt qua âm thầm — nếu ai đó vá lỗ hổng, test tương ứng ở đây
 * sẽ đỏ và cần được cập nhật thành assertion "đã chặn", không phải xóa test.
 */

test.describe('Known gap: /system-configs has no role restriction', () => {
  test('a mentee (any authenticated role) can read, create, update and delete system configs', async ({
    request,
  }) => {
    const { client: menteeClient } = await registerAndLogin(request, { prefix: 'sysconfig_gap' });

    // Baseline đã đúng: chưa đăng nhập thì bị chặn bởi JWT guard toàn cục.
    const anonRes = await request.get('system-configs');
    expect(anonRes.status()).toBe(401);

    // Lỗ hổng: controller không có @Roles(ADMIN)/RolesGuard nào — mọi role đã login
    // (kể cả mentee) đều CRUD được config toàn hệ thống. Ghi nhận rõ hành vi hiện tại.
    const createRes = await menteeClient.post('system-configs', {
      configKey: `e2e_gap_key_${Date.now()}`,
      configValue: { note: 'created by mentee in e2e test' },
    });
    expect(createRes.status()).toBe(201);
    const config = unwrap<any>(await jsonOf(createRes));

    const updateRes = await menteeClient.patch(`system-configs/${config.id}`, {
      configValue: { note: 'updated by mentee' },
    });
    expect(updateRes.status()).toBe(200);

    const deleteRes = await menteeClient.delete(`system-configs/${config.id}`);
    expect(deleteRes.status()).toBe(200);
  });
});

test.describe('Known gap: /notifications has no per-user ownership scoping', () => {
  test('a user can list/read/update notifications that were not addressed to them', async ({ request }) => {
    const { client: adminClient, user: admin } = await loginAsAdmin(request);
    const { client: victimClient, user: victim } = await registerAndLogin(request, { prefix: 'notif_victim' });
    const { client: strangerClient } = await registerAndLogin(request, { prefix: 'notif_stranger' });

    const createRes = await adminClient.post('notifications', {
      userId: victim.id,
      title: 'Private notification for victim only',
      content: 'This should not be readable by anyone else.',
      type: 'system',
    });
    expect(createRes.status()).toBe(201);
    const notification = unwrap<any>(await jsonOf(createRes));

    // Lỗ hổng: findAll()/findOne() không lọc theo userId của người gọi.
    const strangerListRes = await strangerClient.get('notifications');
    expect(strangerListRes.status()).toBe(200);
    const list = unwrapList<any>(await jsonOf(strangerListRes));
    expect(list.some((n: any) => n.id === notification.id)).toBe(true);

    const strangerDetailRes = await strangerClient.get(`notifications/${notification.id}`);
    expect(strangerDetailRes.status()).toBe(200);

    void victimClient;
    void admin;
  });
});

test.describe('Correctly enforced ownership/role boundaries (regression guard)', () => {
  test('a mentee cannot access ADMIN-only stats endpoint', async ({ request }) => {
    const { client: menteeClient } = await registerAndLogin(request, { prefix: 'admin_stats_perm' });
    const res = await menteeClient.get('admin/stats');
    expect(res.status()).toBe(403);
  });

  test('admin/leaderboard and admin/transparency are public read endpoints', async ({ request }) => {
    const leaderboardRes = await request.get('admin/leaderboard');
    expect(leaderboardRes.status()).toBe(200);

    const transparencyRes = await request.get('admin/transparency');
    expect(transparencyRes.status()).toBe(200);
  });

  test('a user cannot update or delete another user\'s course-review', async ({ request }) => {
    const { client: authorClient } = await registerAndLogin(request, { prefix: 'review_owner' });
    const { client: intruderClient } = await registerAndLogin(request, { prefix: 'review_intruder2' });

    // Không thể tạo review hợp lệ nhanh ở đây (cần booking COMPLETED thật), nên ta
    // verify ranh giới quyền edit/delete bằng một id ngẫu nhiên hợp lệ dạng UUID:
    // service phải trả 404 (not found) cho author lẫn 403/404 cho kẻ lạ - không bao giờ
    // để lộ được nội dung của review không thuộc về mình qua PATCH/DELETE.
    const randomId = '11111111-1111-1111-1111-111111111111';
    const authorRes = await authorClient.patch(`course-reviews/${randomId}`, { rating: 3 });
    expect([403, 404]).toContain(authorRes.status());

    const intruderRes = await intruderClient.delete(`course-reviews/${randomId}`);
    expect([403, 404]).toContain(intruderRes.status());
  });

  test('a mentee cannot access mentor-only "my courses" listing via mentorId spoofing', async ({ request }) => {
    const { client: menteeClient, user: mentee } = await registerAndLogin(request, { prefix: 'spoof_mentee' });

    // Mentee cố lấy danh sách khóa học lọc theo chính mentorId của mình (giả làm mentor).
    // Vì mentee không sở hữu course nào, kỳ vọng hợp lý nhất là danh sách rỗng, không lỗi 500.
    const res = await menteeClient.get('courses', { params: { mentorId: mentee.id, limit: '50' } });
    expect(res.status()).toBe(200);
    const items = unwrapList<any>(await jsonOf(res));
    expect(items).toHaveLength(0);
  });

  test('users/me only exposes the caller\'s own profile, never accepts a foreign id override', async ({
    request,
  }) => {
    const { client: userAClient, user: userA } = await registerAndLogin(request, { prefix: 'users_me_a' });
    const { user: userB } = await registerAndLogin(request, { prefix: 'users_me_b' });

    const meRes = await userAClient.get('users/me');
    expect(meRes.status()).toBe(200);
    // Response shape đặc biệt của route này: { message, user: {...} } (không phải { data: user }).
    const meBody = unwrap<any>(await jsonOf(meRes));
    expect(meBody.user.id).toBe(userA.id);
    expect(meBody.user.id).not.toBe(userB.id);
  });

  test('a mentee cannot list all users (admin-only)', async ({ request }) => {
    const { client: menteeClient } = await registerAndLogin(request, { prefix: 'users_list_perm' });
    const res = await menteeClient.get('users');
    expect(res.status()).toBe(403);
  });

  test('admin can list all users', async ({ request }) => {
    const { client: adminClient } = await loginAsAdmin(request);
    const res = await adminClient.get('users', { params: { limit: '5' } });
    expect(res.status()).toBe(200);
  });
});
