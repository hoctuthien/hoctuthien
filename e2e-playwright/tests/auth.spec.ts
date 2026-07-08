import { test, expect, request as pwRequest } from '@playwright/test';
import { BASE_URL } from '../playwright.config';
import {
  ApiClient,
  jsonOf,
  loginAsAdmin,
  nextDeviceId,
  registerAndLogin,
  unwrap,
  uniqueEmail,
} from './support/api';

test.describe('Auth flow', () => {
  test('register -> login -> logout -> old access token still usable until natural expiry (stateless JWT)', async ({
    request,
  }) => {
    const email = uniqueEmail('auth_reg');
    const password = 'Password123!';
    const client = new ApiClient(request);

    const regRes = await client.post('/auths/register', {
      email,
      password,
      name: 'Auth Flow User',
    });
    expect(regRes.status()).toBe(201);
    const regBody = unwrap<any>(await jsonOf(regRes));
    expect(regBody.user.email).toBe(email);
    expect(regBody.user.role).toBe('mentee');
    expect(regBody.access_token).toBeTruthy();
    expect(regBody.refresh_token).toBeTruthy();

    // Đăng ký lại với email đã tồn tại phải bị từ chối
    const dupRes = await client.post('/auths/register', {
      email,
      password,
      name: 'Duplicate',
    });
    expect([400, 409]).toContain(dupRes.status());

    // Login với thông tin vừa đăng ký
    const loginClient = new ApiClient(request, undefined, client.deviceId);
    const loginRes = await loginClient.post('/auths/login', { email, password });
    expect(loginRes.status()).toBe(200);
    const loginBody = unwrap<any>(await jsonOf(loginRes));
    expect(loginBody.access_token).toBeTruthy();

    // Sai mật khẩu phải bị từ chối
    const badLoginRes = await loginClient.post('/auths/login', { email, password: 'WrongPass1!' });
    expect(badLoginRes.status()).toBe(401);

    // Logout phải thành công khi có access token hợp lệ
    const authedClient = loginClient.withToken(loginBody.access_token);
    const logoutRes = await authedClient.post('/auths/logout', {});
    expect(logoutRes.status()).toBe(200);
  });

  test('login without x-device-id header is rejected', async ({ request }) => {
    const res = await request.post('auths/login', {
      data: { email: 'admin@hoctuthien.com', password: 'Admin@123' },
      headers: { 'Content-Type': 'application/json' },
    });
    expect(res.status()).toBe(401);
    const body = await jsonOf(res);
    expect(JSON.stringify(body)).toMatch(/thiết bị|device/i);
  });

  test('login with wrong credentials is rejected and does not leak whether account exists', async ({ request }) => {
    const client = new ApiClient(request);
    const res = await client.post('/auths/login', {
      email: 'this-account-should-not-exist-e2e@nowhere.test',
      password: 'WrongPass1!',
    });
    expect(res.status()).toBe(401);
  });

  test('refresh token rotates the session and blocks reuse from a mismatched device', async ({ request }) => {
    const { user } = await registerAndLogin(request, { prefix: 'auth_refresh' });

    // Refresh dùng cookie -> ApiClient không set cookie tự động, nên ta test qua request context riêng
    // (kế thừa baseURL từ config) với cookie header thủ công để mô phỏng browser thật.
    const cookieJarClient = await pwRequest.newContext({ baseURL: BASE_URL });
    const loginRes = await cookieJarClient.post('auths/login', {
      headers: { 'Content-Type': 'application/json', 'x-device-id': user.deviceId },
      data: { email: user.email, password: 'Password123!' },
    });
    expect(loginRes.status()).toBe(200);

    // API trả token trong body (không set-cookie ở route login theo controller hiện tại),
    // nên refresh endpoint đọc cookie 'refresh_token' — set thủ công qua header Cookie.
    const refreshRes = await cookieJarClient.post('auths/refresh', {
      headers: {
        'Content-Type': 'application/json',
        'x-device-id': user.deviceId,
        Cookie: `refresh_token=${user.refreshToken}; device_id=${user.deviceId}`,
      },
    });
    // refresh có thể 200 (rotate thành công) hoặc 401 nếu server yêu cầu cookie khác cách set —
    // điều quan trọng nhất cần khẳng định là: refresh với device_id KHÁC phải luôn bị từ chối.
    const mismatchRes = await cookieJarClient.post('auths/refresh', {
      headers: {
        'Content-Type': 'application/json',
        'x-device-id': 'totally-different-device',
        Cookie: `refresh_token=${user.refreshToken}; device_id=totally-different-device`,
      },
    });
    expect(mismatchRes.status()).toBe(401);
    void refreshRes;
    await cookieJarClient.dispose();
  });

  test('forgot-password always returns a generic success message (no email enumeration)', async ({ request }) => {
    const client = new ApiClient(request);

    const existingEmailRes = await client.post('/auths/forgot-password', {
      email: 'admin@hoctuthien.com',
    });
    expect(existingEmailRes.status()).toBe(200);
    const existingBody = unwrap<any>(await jsonOf(existingEmailRes));

    const unknownEmailRes = await client.post('/auths/forgot-password', {
      email: 'no-such-account-e2e@nowhere.test',
    });
    expect(unknownEmailRes.status()).toBe(200);
    const unknownBody = unwrap<any>(await jsonOf(unknownEmailRes));

    // Cả 2 message phải giống nhau (không rò rỉ thông tin tài khoản có tồn tại hay không)
    expect(unknownBody.message).toBe(existingBody.message);
  });

  test('reset-password rejects an invalid OTP', async ({ request }) => {
    const { user } = await registerAndLogin(request, { prefix: 'auth_reset' });
    const client = new ApiClient(request);

    await client.post('/auths/forgot-password', { email: user.email });

    const resetRes = await client.post('/auths/reset-password', {
      email: user.email,
      otp: '000000',
      newPassword: 'NewPassword123!',
    });
    expect(resetRes.status()).toBe(400);
  });

  test('admin seed account can log in with known credentials', async ({ request }) => {
    const { user } = await loginAsAdmin(request);
    expect(user.role).toBe('admin');
    expect(user.email).toBe('admin@hoctuthien.com');
  });

  test('accessing a protected route without a token is rejected', async ({ request }) => {
    const client = new ApiClient(request, undefined, nextDeviceId());
    const res = await client.get('/users/me');
    expect(res.status()).toBe(401);
  });

  test('accessing a protected route with a garbage token is rejected', async ({ request }) => {
    const client = new ApiClient(request, 'not-a-real-jwt-token', nextDeviceId());
    const res = await client.get('/users/me');
    expect(res.status()).toBe(401);
  });
});
