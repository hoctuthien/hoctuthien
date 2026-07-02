import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import supertest from 'supertest';
import cookieParser from 'cookie-parser';
import { AppModule } from '../src/app.module';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UserSessionEntity } from '../src/modules/user-session/entities/user-session.entity';

describe('Auth Refresh & Rotation (E2E)', () => {
  let app: INestApplication;
  let sessionRepo: Repository<UserSessionEntity>;
  const apiPrefix = '/api/v1';

  jest.setTimeout(60000);

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.use(cookieParser());
    app.setGlobalPrefix('api/v1');
    await app.init();

    sessionRepo = app.get<Repository<UserSessionEntity>>(
      getRepositoryToken(UserSessionEntity),
    );
  }, 60000);

  afterAll(async () => {
    await app.close();
  });

  it('should login and create exactly one active session', async () => {
    const timestamp = Date.now();
    const email = `refresh_test_${timestamp}@example.com`;
    const password = 'Password123!';
    const name = 'Refresh Test User';

    // 1. Register
    const regRes = await supertest(app.getHttpServer())
      .post(`${apiPrefix}/auths/register`)
      .send({ email, password, name });
    expect(regRes.status).toBe(201);

    // 2. Login
    const loginRes = await supertest(app.getHttpServer())
      .post(`${apiPrefix}/auths/login`)
      .set('x-device-id', 'test-device-1')
      .send({ email, password });
    expect(loginRes.status).toBe(200);

    const refreshToken = loginRes.body.refresh_token;
    expect(refreshToken).toBeDefined();

    // 3. Query the DB to check sessions for this user
    const loginSessions = await sessionRepo.find({
      where: { refreshToken },
    });
    expect(loginSessions.length).toBe(1);
    expect(loginSessions[0].deviceName).toBe('test-device-1');
  });

  it('should refresh token and rotate without duplicating sessions', async () => {
    const timestamp = Date.now();
    const email = `refresh_rotate_${timestamp}@example.com`;
    const password = 'Password123!';
    const name = 'Refresh Rotate User';

    // 1. Register
    const regRes = await supertest(app.getHttpServer())
      .post(`${apiPrefix}/auths/register`)
      .send({ email, password, name });
    expect(regRes.status).toBe(201);

    // 2. Login
    const loginRes = await supertest(app.getHttpServer())
      .post(`${apiPrefix}/auths/login`)
      .set('x-device-id', 'test-device-1')
      .send({ email, password });
    expect(loginRes.status).toBe(200);

    const firstRefreshToken = loginRes.body.refresh_token;

    // 3. Refresh tokens
    const refreshRes = await supertest(app.getHttpServer())
      .post(`${apiPrefix}/auths/refresh`)
      .set('Cookie', [
        `refresh_token=${firstRefreshToken}`,
        'device_id=test-device-1',
      ])
      .send();

    expect(refreshRes.status).toBe(200);
    const secondRefreshToken = refreshRes.body.refresh_token;
    expect(secondRefreshToken).toBeDefined();
    expect(secondRefreshToken).not.toBe(firstRefreshToken);

    // 4. Verify DB state:
    // - The first session should be soft deleted (deletedAt is not null)
    // - The second session should have exactly 1 active row (deletedAt is null)
    const firstSessions = await sessionRepo.find({
      where: { refreshToken: firstRefreshToken },
      withDeleted: true,
    });
    expect(firstSessions.length).toBe(1);
    expect(firstSessions[0].deletedAt).not.toBeNull();

    const secondSessions = await sessionRepo.find({
      where: { refreshToken: secondRefreshToken },
      withDeleted: true,
    });
    expect(secondSessions.length).toBe(1);
    expect(secondSessions[0].deletedAt).toBeNull();
  });

  it('should allow concurrent refresh requests within grace period', async () => {
    const timestamp = Date.now();
    const email = `refresh_concurrent_${timestamp}@example.com`;
    const password = 'Password123!';
    const name = 'Refresh Concurrent User';

    // 1. Register
    const regRes = await supertest(app.getHttpServer())
      .post(`${apiPrefix}/auths/register`)
      .send({ email, password, name });
    expect(regRes.status).toBe(201);

    // 2. Login
    const loginRes = await supertest(app.getHttpServer())
      .post(`${apiPrefix}/auths/login`)
      .set('x-device-id', 'test-device-1')
      .send({ email, password });
    expect(loginRes.status).toBe(200);

    const initialRefreshToken = loginRes.body.refresh_token;

    // 3. Perform 2 refresh requests simultaneously
    const [res1, res2] = await Promise.all([
      supertest(app.getHttpServer())
        .post(`${apiPrefix}/auths/refresh`)
        .set('Cookie', [
          `refresh_token=${initialRefreshToken}`,
          'device_id=test-device-1',
        ])
        .send(),
      supertest(app.getHttpServer())
        .post(`${apiPrefix}/auths/refresh`)
        .set('Cookie', [
          `refresh_token=${initialRefreshToken}`,
          'device_id=test-device-1',
        ])
        .send(),
    ]);

    expect(res1.status).toBe(200);
    expect(res2.status).toBe(200);

    const token1 = res1.body.refresh_token;
    const token2 = res2.body.refresh_token;

    // Verify DB to ensure there are no duplicate active sessions.
    const sessions1 = await sessionRepo.find({
      where: { refreshToken: token1 },
      withDeleted: true,
    });
    expect(sessions1.length).toBe(1);

    const sessions2 = await sessionRepo.find({
      where: { refreshToken: token2 },
      withDeleted: true,
    });
    expect(sessions2.length).toBe(1);
  });

  it('should fail to refresh if there is a device ID mismatch', async () => {
    const timestamp = Date.now();
    const email = `refresh_device_fail_${timestamp}@example.com`;
    const password = 'Password123!';
    const name = 'Refresh Device Fail User';

    // 1. Register
    const regRes = await supertest(app.getHttpServer())
      .post(`${apiPrefix}/auths/register`)
      .send({ email, password, name });
    expect(regRes.status).toBe(201);

    // 2. Login with device-1
    const loginRes = await supertest(app.getHttpServer())
      .post(`${apiPrefix}/auths/login`)
      .set('x-device-id', 'test-device-1')
      .send({ email, password });
    expect(loginRes.status).toBe(200);

    const refreshToken = loginRes.body.refresh_token;

    // 3. Try to refresh with device-2
    const refreshRes = await supertest(app.getHttpServer())
      .post(`${apiPrefix}/auths/refresh`)
      .set('Cookie', [
        `refresh_token=${refreshToken}`,
        'device_id=test-device-2',
      ])
      .send();

    expect(refreshRes.status).toBe(401);
    expect(refreshRes.body.message).toBe('Thiết bị không hợp lệ cho phiên này.');
  });
});
