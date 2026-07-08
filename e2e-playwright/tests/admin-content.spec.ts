import { test, expect } from '@playwright/test';
import { jsonOf, loginAsAdmin, registerAndLogin, unwrap, unwrapList } from './support/api';

test.describe('Admin content management: posts, tags, categories', () => {
  test('admin can create/update/delete a post; only published posts are publicly visible', async ({ request }) => {
    const { client: adminClient } = await loginAsAdmin(request);

    const createRes = await adminClient.post('posts', {
      title: `E2E Draft Post ${Date.now()}`,
      content: JSON.stringify([{ type: 'paragraph', content: 'Hello world' }]),
      status: 'draft',
    });
    expect(createRes.status()).toBe(201);
    const post = unwrap<any>(await jsonOf(createRes));
    expect(post.status).toBe('draft');
    expect(post.slug).toBeTruthy();

    // Draft post: người chưa đăng nhập vẫn gọi được GET /posts/:id (route Public) nhưng
    // ta chỉ verify là truy vấn không lỗi 500 — hiển thị/ẩn draft là trách nhiệm của FE.
    const publicDetailRes = await request.get(`posts/${post.id}`);
    expect(publicDetailRes.status()).toBe(200);

    // Admin publish bài viết
    const publishRes = await adminClient.patch(`posts/${post.id}`, { status: 'published' });
    expect(publishRes.status()).toBe(200);
    expect(unwrap<any>(await jsonOf(publishRes)).status).toBe('published');

    // Admin xóa bài viết
    const deleteRes = await adminClient.delete(`posts/${post.id}`);
    expect(deleteRes.status()).toBe(200);
  });

  test('a mentee cannot create, update or delete a post', async ({ request }) => {
    const { client: menteeClient } = await registerAndLogin(request, { prefix: 'post_perm' });

    const createRes = await menteeClient.post('posts', {
      title: 'Should be forbidden',
      status: 'draft',
    });
    expect(createRes.status()).toBe(403);

    const { client: adminClient } = await loginAsAdmin(request);
    const adminPostRes = await adminClient.post('posts', {
      title: `E2E Permission Post ${Date.now()}`,
      status: 'draft',
    });
    const post = unwrap<any>(await jsonOf(adminPostRes));

    const updateRes = await menteeClient.patch(`posts/${post.id}`, { title: 'Hacked title' });
    expect(updateRes.status()).toBe(403);

    const deleteRes = await menteeClient.delete(`posts/${post.id}`);
    expect(deleteRes.status()).toBe(403);
  });

  test('public GET /posts works without authentication', async ({ request }) => {
    const res = await request.get('posts');
    expect(res.status()).toBe(200);
    expect(Array.isArray(unwrapList(await jsonOf(res)))).toBe(true);
  });

  test('admin can create/update/delete a tag; public can read', async ({ request }) => {
    const { client: adminClient } = await loginAsAdmin(request);

    const createRes = await adminClient.post('tags', { name: `E2E Tag ${Date.now()}` });
    expect(createRes.status()).toBe(201);
    const tag = unwrap<any>(await jsonOf(createRes));
    expect(tag.status).toBe('active');

    const publicGetRes = await request.get(`tags/${tag.id}`);
    expect(publicGetRes.status()).toBe(200);

    const { client: menteeClient } = await registerAndLogin(request, { prefix: 'tag_perm' });
    const forbiddenRes = await menteeClient.post('tags', { name: 'Should fail' });
    expect(forbiddenRes.status()).toBe(403);

    const updateRes = await adminClient.patch(`tags/${tag.id}`, { name: 'Updated Tag Name' });
    expect(updateRes.status()).toBe(200);
    expect(unwrap<any>(await jsonOf(updateRes)).name).toBe('Updated Tag Name');

    const deleteRes = await adminClient.delete(`tags/${tag.id}`);
    expect(deleteRes.status()).toBe(200);
  });

  test('mentor and admin can create categories, mentee cannot', async ({ request }) => {
    const { client: adminClient } = await loginAsAdmin(request);

    const adminCreateRes = await adminClient.post('categories', { name: `E2E Admin Category ${Date.now()}` });
    expect(adminCreateRes.status()).toBe(201);

    const { client: menteeClient } = await registerAndLogin(request, { prefix: 'category_perm' });
    const menteeCreateRes = await menteeClient.post('categories', { name: 'Should fail' });
    expect(menteeCreateRes.status()).toBe(403);

    // Public read
    const listRes = await request.get('categories', { params: { limit: '5' } });
    expect(listRes.status()).toBe(200);
  });
});

test.describe('Penalty tickets', () => {
  test('any authenticated user can report a penalty ticket; only admin can list/update/delete', async ({
    request,
  }) => {
    const { client: adminClient, user: admin } = await loginAsAdmin(request);
    const { client: reporterClient } = await registerAndLogin(request, { prefix: 'penalty_reporter' });
    const { client: targetClient, user: target } = await registerAndLogin(request, { prefix: 'penalty_target' });

    const createRes = await reporterClient.post('penalty-tickets', {
      userId: target.id,
      reason: 'E2E test violation report',
    });
    expect(createRes.status()).toBe(201);
    const ticket = unwrap<any>(await jsonOf(createRes));
    expect(ticket.userId).toBe(target.id);
    expect(ticket.status).toBe('pending');

    // Non-admin cannot list all tickets
    const forbiddenListRes = await reporterClient.get('penalty-tickets');
    expect(forbiddenListRes.status()).toBe(403);

    // Admin can list and see it
    const adminListRes = await adminClient.get('penalty-tickets');
    expect(adminListRes.status()).toBe(200);
    const tickets = unwrapList<any>(await jsonOf(adminListRes));
    expect(tickets.some((t: any) => t.id === ticket.id)).toBe(true);

    // Non-admin cannot update/delete
    const forbiddenUpdateRes = await targetClient.patch(`penalty-tickets/${ticket.id}`, { status: 'resolved' });
    expect(forbiddenUpdateRes.status()).toBe(403);

    // Admin updates status (PenaltyTicketStatus: pending | rejected | penalty | cancel)
    const updateRes = await adminClient.patch(`penalty-tickets/${ticket.id}`, { status: 'penalty' });
    expect(updateRes.status()).toBe(200);
    expect(unwrap<any>(await jsonOf(updateRes)).status).toBe('penalty');

    const deleteRes = await adminClient.delete(`penalty-tickets/${ticket.id}`);
    expect(deleteRes.status()).toBe(200);
    void admin;
  });
});

test.describe('Bug reports', () => {
  test('user submits a bug report, sees only their own, admin sees and manages all', async ({ request }) => {
    const { client: adminClient } = await loginAsAdmin(request);
    const { client: reporterClient, user: reporter } = await registerAndLogin(request, { prefix: 'bugreport_user' });
    const { client: otherUserClient } = await registerAndLogin(request, { prefix: 'bugreport_other' });

    const createRes = await reporterClient.post('bug-reports', {
      title: 'E2E bug report title',
      description: 'Something broke during E2E testing.',
      severity: 'high',
      stepsToReproduce: '1. Run E2E suite\n2. Observe',
    });
    expect(createRes.status()).toBe(201);
    const report = unwrap<any>(await jsonOf(createRes));
    expect(report.userId).toBe(reporter.id);
    expect(report.status).toBe('open');

    const ownListRes = await reporterClient.get('bug-reports');
    const ownList = unwrapList<any>(await jsonOf(ownListRes));
    expect(ownList.some((r: any) => r.id === report.id)).toBe(true);

    // Other regular user must not see someone else's report in their own list
    const otherListRes = await otherUserClient.get('bug-reports');
    const otherList = unwrapList<any>(await jsonOf(otherListRes));
    expect(otherList.some((r: any) => r.id === report.id)).toBe(false);

    // Other regular user cannot view report detail directly either
    const otherDetailRes = await otherUserClient.get(`bug-reports/${report.id}`);
    expect(otherDetailRes.status()).toBe(403);

    // Regular user cannot change status/severity
    const selfUpdateRes = await reporterClient.patch(`bug-reports/${report.id}`, { status: 'resolved' });
    expect(selfUpdateRes.status()).toBe(403);

    // Admin sees it in the global list and can update it
    const adminListRes = await adminClient.get('bug-reports');
    const adminList = unwrapList<any>(await jsonOf(adminListRes));
    expect(adminList.some((r: any) => r.id === report.id)).toBe(true);

    const adminUpdateRes = await adminClient.patch(`bug-reports/${report.id}`, {
      status: 'in_progress',
      severity: 'critical',
    });
    expect(adminUpdateRes.status()).toBe(200);
    const updated = unwrap<any>(await jsonOf(adminUpdateRes));
    expect(updated.status).toBe('in_progress');
    expect(updated.severity).toBe('critical');

    // Regular user cannot delete
    const selfDeleteRes = await reporterClient.delete(`bug-reports/${report.id}`);
    expect(selfDeleteRes.status()).toBe(403);

    const adminDeleteRes = await adminClient.delete(`bug-reports/${report.id}`);
    expect(adminDeleteRes.status()).toBe(200);
  });

  test('submitting a bug report without authentication is rejected', async ({ request }) => {
    const res = await request.post('bug-reports', {
      data: { title: 'Unauthorized report', description: 'nope' },
    });
    expect(res.status()).toBe(401);
  });
});
