import { test, expect } from '@playwright/test';
import { jsonOf, loginAsAdmin, registerAndLogin, unwrap } from './support/api';

async function getOwnPoints(client: any) {
  const res = await client.get('users/me');
  expect(res.status()).toBe(200);
  const body = unwrap<any>(await jsonOf(res));
  return Number(body.user?.points ?? body.points);
}

test.describe('Penalty ticket lifecycle and security', () => {
  test('anonymous users cannot create or read a penalty ticket', async ({ request }) => {
    const createRes = await request.post('penalty-tickets', {
      data: { userId: '00000000-0000-0000-0000-000000000000', reason: 'Anonymous report' },
    });
    expect(createRes.status()).toBe(401);

    const detailRes = await request.get('penalty-tickets/00000000-0000-0000-0000-000000000000');
    expect(detailRes.status()).toBe(401);
  });

  test('reporter identity comes from JWT and a reporter cannot self-approve a penalty', async ({ request }) => {
    const { client: reporterClient, user: reporter } = await registerAndLogin(request, {
      prefix: 'penalty_spoof_reporter',
    });
    const { client: targetClient, user: target } = await registerAndLogin(request, {
      prefix: 'penalty_spoof_target',
    });
    const pointsBefore = await getOwnPoints(targetClient);

    const createRes = await reporterClient.post('penalty-tickets', {
      userId: target.id,
      reportedById: target.id,
      reason: 'Attempt to bypass admin review',
      status: 'penalty',
      pointsDeducted: 50,
    });
    expect(createRes.status()).toBe(201);
    const ticket = unwrap<any>(await jsonOf(createRes));

    expect(ticket.reportedById).toBe(reporter.id);
    expect(ticket.status).toBe('pending');
    expect(ticket.pointsDeducted).toBe(0);
    expect(await getOwnPoints(targetClient)).toBe(pointsBefore);
  });

  test('a user who is unrelated to a ticket cannot read its detail', async ({ request }) => {
    const { client: reporterClient } = await registerAndLogin(request, { prefix: 'penalty_owner' });
    const { user: target } = await registerAndLogin(request, { prefix: 'penalty_owner_target' });
    const { client: strangerClient } = await registerAndLogin(request, { prefix: 'penalty_stranger' });

    const createRes = await reporterClient.post('penalty-tickets', {
      userId: target.id,
      reason: 'Private report details',
    });
    const ticket = unwrap<any>(await jsonOf(createRes));

    const strangerRes = await strangerClient.get(`penalty-tickets/${ticket.id}`);
    expect(strangerRes.status()).toBe(403);
  });

  test('admin penalty transitions deduct, adjust, restore, and restore again on delete', async ({ request }) => {
    const { client: adminClient } = await loginAsAdmin(request);
    const { client: reporterClient } = await registerAndLogin(request, { prefix: 'penalty_lifecycle_reporter' });
    const { client: targetClient, user: target } = await registerAndLogin(request, {
      prefix: 'penalty_lifecycle_target',
    });

    const seedPointsRes = await adminClient.patch(`users/${target.id}`, { points: 100 });
    expect(seedPointsRes.status()).toBe(200);
    expect(await getOwnPoints(targetClient)).toBe(100);

    const createRes = await reporterClient.post('penalty-tickets', {
      userId: target.id,
      reason: 'Confirmed violation',
      pointsDeducted: 30,
      evidenceUrl: 'https://example.com/evidence',
      metadata: { source: 'e2e' },
    });
    const ticket = unwrap<any>(await jsonOf(createRes));
    expect(ticket.status).toBe('pending');

    const penalizeRes = await adminClient.patch(`penalty-tickets/${ticket.id}`, { status: 'penalty' });
    expect(penalizeRes.status()).toBe(200);
    expect(await getOwnPoints(targetClient)).toBe(70);

    const adjustRes = await adminClient.patch(`penalty-tickets/${ticket.id}`, { pointsDeducted: 10 });
    expect(adjustRes.status()).toBe(200);
    expect(await getOwnPoints(targetClient)).toBe(90);

    const rejectRes = await adminClient.patch(`penalty-tickets/${ticket.id}`, { status: 'rejected' });
    expect(rejectRes.status()).toBe(200);
    expect(await getOwnPoints(targetClient)).toBe(100);

    const penalizeAgainRes = await adminClient.patch(`penalty-tickets/${ticket.id}`, { status: 'penalty' });
    expect(penalizeAgainRes.status()).toBe(200);
    expect(await getOwnPoints(targetClient)).toBe(90);

    const deleteRes = await adminClient.delete(`penalty-tickets/${ticket.id}`);
    expect(deleteRes.status()).toBe(200);
    expect(await getOwnPoints(targetClient)).toBe(100);
  });

  test('invalid report payloads are rejected', async ({ request }) => {
    const { client: reporterClient, user: reporter } = await registerAndLogin(request, {
      prefix: 'penalty_validation',
    });

    const blankReasonRes = await reporterClient.post('penalty-tickets', {
      userId: reporter.id,
      reason: '',
    });
    expect(blankReasonRes.status()).toBe(400);

    const invalidStatusRes = await reporterClient.post('penalty-tickets', {
      userId: reporter.id,
      reason: 'Invalid status payload',
      status: 'resolved',
    });
    expect(invalidStatusRes.status()).toBe(400);

    const longEvidenceRes = await reporterClient.post('penalty-tickets', {
      userId: reporter.id,
      reason: 'Evidence URL too long',
      evidenceUrl: `https://example.com/${'x'.repeat(500)}`,
    });
    expect(longEvidenceRes.status()).toBe(400);
  });
});
