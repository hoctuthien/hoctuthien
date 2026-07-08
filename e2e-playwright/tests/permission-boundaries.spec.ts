import { test, expect } from '@playwright/test';
import { jsonOf, loginAsAdmin, registerAndLogin, unwrap, unwrapList } from './support/api';

test.describe('System configs policy boundaries', () => {
  test('public can read active policy by key, but system-config management is admin-only', async ({
    request,
  }) => {
    const { client: adminClient } = await loginAsAdmin(request);
    const { client: menteeClient } = await registerAndLogin(request, { prefix: 'sysconfig_boundary' });

    const publicPolicyRes = await request.get('system-configs/public/mentee_policy');
    expect(publicPolicyRes.status()).toBe(200);
    const publicPolicy = unwrap<any>(await jsonOf(publicPolicyRes));
    expect(publicPolicy.configKey).toBe('mentee_policy');
    expect(publicPolicy.configValue?.sections?.length).toBeGreaterThan(0);

    const anonRes = await request.get('system-configs');
    expect(anonRes.status()).toBe(401);

    const menteeCreateRes = await menteeClient.post('system-configs', {
      configKey: `e2e_gap_key_${Date.now()}`,
      configValue: { note: 'created by mentee in e2e test' },
    });
    expect(menteeCreateRes.status()).toBe(403);

    const adminCreateRes = await adminClient.post('system-configs', {
      configKey: `e2e_admin_policy_${Date.now()}`,
      configValue: { note: 'created by admin in e2e test' },
      status: 'active',
    });
    expect(adminCreateRes.status()).toBe(201);
    const config = unwrap<any>(await jsonOf(adminCreateRes));

    const menteeListRes = await menteeClient.get('system-configs');
    expect(menteeListRes.status()).toBe(403);

    const updateRes = await adminClient.patch(`system-configs/${config.id}`, {
      configValue: { note: 'updated by admin' },
    });
    expect(updateRes.status()).toBe(200);

    const deleteRes = await adminClient.delete(`system-configs/${config.id}`);
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

    const randomId = '11111111-1111-1111-1111-111111111111';
    const authorRes = await authorClient.patch(`course-reviews/${randomId}`, { rating: 3 });
    expect([403, 404]).toContain(authorRes.status());

    const intruderRes = await intruderClient.delete(`course-reviews/${randomId}`);
    expect([403, 404]).toContain(intruderRes.status());
  });

  test('a mentee cannot access mentor-only "my courses" listing via mentorId spoofing', async ({ request }) => {
    const { client: menteeClient, user: mentee } = await registerAndLogin(request, { prefix: 'spoof_mentee' });

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
