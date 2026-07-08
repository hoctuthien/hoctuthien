import { test, expect } from '@playwright/test';
import {
  createActiveCourse,
  ensureCategoryId,
  jsonOf,
  loginAsAdmin,
  onboardMentor,
  registerAndLogin,
  unwrap,
  unwrapList,
} from './support/api';

test.describe('Course catalog & CRUD flow', () => {
  test('mentor creates, updates, toggles status and deletes their own course', async ({ request }) => {
    const { client: adminClient } = await loginAsAdmin(request);
    const { client: mentorClient } = await onboardMentor(request, adminClient, { prefix: 'course_owner' });
    const categoryId = await ensureCategoryId(adminClient);

    const course = await createActiveCourse(mentorClient, {
      price: 0,
      categoryIds: [categoryId],
      title: `E2E CRUD Course ${Date.now()}`,
    });
    expect(course.id).toBeTruthy();
    expect(course.status).toBe('ACTIVE');
    // Course được tự động approve khi chính mentor tạo (approvedBy === mentorId)
    expect(course.approvedBy).toBe(course.mentorId);

    // Khóa học phải xuất hiện trong danh sách công khai không cần đăng nhập
    const publicListRes = await request.get(`courses?limit=100`);
    const publicItems = unwrapList<any>(await jsonOf(publicListRes));
    expect(publicItems.some((c: any) => c.id === course.id)).toBe(true);

    // Mentor cập nhật thông tin khóa học của mình
    const updateRes = await mentorClient.patch(`courses/${course.id}`, {
      title: 'Updated E2E Course Title',
      price: 10000,
    });
    expect(updateRes.status()).toBe(200);
    const updated = unwrap<any>(await jsonOf(updateRes));
    expect(updated.title).toBe('Updated E2E Course Title');
    expect(Number(updated.price)).toBe(10000);

    // Mentor chuyển trạng thái sang INACTIVE
    const statusRes = await mentorClient.patch(`courses/${course.id}/status`, { status: 'INACTIVE' });
    expect(statusRes.status()).toBe(200);
    expect(unwrap<any>(await jsonOf(statusRes)).status).toBe('INACTIVE');

    // Khóa học INACTIVE không còn xuất hiện trong danh sách công khai
    const afterListRes = await request.get(`courses?limit=100`);
    const afterItems = unwrapList<any>(await jsonOf(afterListRes));
    expect(afterItems.some((c: any) => c.id === course.id)).toBe(false);

    // Mentor xóa (soft-delete) khóa học của mình
    const deleteRes = await mentorClient.delete(`courses/${course.id}`);
    expect(deleteRes.status()).toBe(200);
  });

  test('a mentor cannot update or delete another mentor\'s course', async ({ request }) => {
    const { client: adminClient } = await loginAsAdmin(request);
    const { client: ownerClient } = await onboardMentor(request, adminClient, { prefix: 'course_a' });
    const { client: intruderClient } = await onboardMentor(request, adminClient, { prefix: 'course_b' });

    const course = await createActiveCourse(ownerClient, { price: 0 });

    const attackUpdateRes = await intruderClient.patch(`courses/${course.id}`, { title: 'Hacked' });
    expect(attackUpdateRes.status()).toBe(403);

    const attackDeleteRes = await intruderClient.delete(`courses/${course.id}`);
    expect(attackDeleteRes.status()).toBe(403);

    const attackStatusRes = await intruderClient.patch(`courses/${course.id}/status`, { status: 'INACTIVE' });
    expect(attackStatusRes.status()).toBe(403);
  });

  test('a mentee cannot create a course', async ({ request }) => {
    const { client: menteeClient } = await registerAndLogin(request, { prefix: 'course_mentee' });
    const res = await menteeClient.post('courses', {
      title: 'Should not be created',
      price: 0,
    });
    expect(res.status()).toBe(403);
  });

  test('admin can approve/override a course status via the approve endpoint', async ({ request }) => {
    const { client: adminClient, user: admin } = await loginAsAdmin(request);
    const { client: mentorClient } = await onboardMentor(request, adminClient, { prefix: 'course_approve' });

    const course = await createActiveCourse(mentorClient, { price: 0 });

    const approveRes = await adminClient.patch(`courses/${course.id}/approve`, {
      approvedBy: admin.id,
      status: 'INACTIVE',
    });
    expect(approveRes.status()).toBe(200);
    const approved = unwrap<any>(await jsonOf(approveRes));
    expect(approved.status).toBe('INACTIVE');
    expect(approved.approvedBy).toBe(admin.id);
  });

  test('GET /courses/:id returns full detail for an existing course, 404 for unknown id', async ({ request }) => {
    const { client: adminClient } = await loginAsAdmin(request);
    const { client: mentorClient } = await onboardMentor(request, adminClient, { prefix: 'course_detail' });
    const course = await createActiveCourse(mentorClient, { price: 0 });

    const detailRes = await request.get(`courses/${course.id}`);
    expect(detailRes.status()).toBe(200);
    expect(unwrap<any>(await jsonOf(detailRes)).id).toBe(course.id);

    const notFoundRes = await request.get('courses/00000000-0000-0000-0000-000000000000');
    expect(notFoundRes.status()).toBe(404);
  });
});
