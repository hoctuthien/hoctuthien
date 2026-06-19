import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import supertest from 'supertest';
import cookieParser from 'cookie-parser';
import { AppModule } from '../src/app.module';

describe('Bug Report Module (E2E)', () => {
  let app: INestApplication;
  const apiPrefix = '/api/v1';

  const timestamp = Date.now();
  const testUser = {
    email: `bug_tester_${timestamp}@example.com`,
    password: 'Password123!',
    name: 'Bug Tester',
  };

  const adminCredentials = {
    email: 'admin@hoctuthien.com',
    password: 'Admin@123',
  };

  let userAccessToken: string;
  let userId: string;
  let adminAccessToken: string;
  let bugReportId: string;

  jest.setTimeout(60000);

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.use(cookieParser());
    app.setGlobalPrefix('api/v1');
    await app.init();
  }, 60000);

  afterAll(async () => {
    await app.close();
  }, 60000);

  describe('Setup: Authentication', () => {
    it('should register and login as a regular user', async () => {
      const regRes = await supertest(app.getHttpServer())
        .post(`${apiPrefix}/auths/register`)
        .send(testUser);
      expect(regRes.status).toBe(201);

      const loginRes = await supertest(app.getHttpServer())
        .post(`${apiPrefix}/auths/login`)
        .send({ email: testUser.email, password: testUser.password });
      expect(loginRes.status).toBe(200);
      userAccessToken = loginRes.body.access_token || loginRes.body.accessToken;
      userId = loginRes.body.user.id;
      expect(userAccessToken).toBeDefined();
    });

    it('should login as an admin', async () => {
      const loginRes = await supertest(app.getHttpServer())
        .post(`${apiPrefix}/auths/login`)
        .send(adminCredentials);
      expect(loginRes.status).toBe(200);
      adminAccessToken = loginRes.body.access_token || loginRes.body.accessToken;
      expect(adminAccessToken).toBeDefined();
    });
  });

  describe('Bug Report CRUD Operations & Permissions', () => {
    it('should successfully submit a bug report when logged in', async () => {
      const payload = {
        title: 'Broken register button',
        description: 'Clicking the button throws a blank screen on Chrome.',
        severity: 'high',
        stepsToReproduce: '1. Go to homepage\n2. Click Register',
        deviceInfo: { browser: 'Chrome', os: 'Windows 11' },
      };

      const res = await supertest(app.getHttpServer())
        .post(`${apiPrefix}/bug-reports`)
        .set('Authorization', `Bearer ${userAccessToken}`)
        .send(payload);

      expect(res.status).toBe(201);
      expect(res.body.id).toBeDefined();
      expect(res.body.title).toBe(payload.title);
      expect(res.body.userId).toBe(userId);
      expect(res.body.status).toBe('open');
      expect(res.body.severity).toBe('high');

      bugReportId = res.body.id;
    });

    it('should fail to submit a bug report without authentication', async () => {
      const payload = {
        title: 'Unauthorized report',
        description: 'This should not succeed.',
      };

      const res = await supertest(app.getHttpServer())
        .post(`${apiPrefix}/bug-reports`)
        .send(payload);

      expect(res.status).toBe(401);
    });

    it('should allow user to fetch their own bug reports', async () => {
      const res = await supertest(app.getHttpServer())
        .get(`${apiPrefix}/bug-reports`)
        .set('Authorization', `Bearer ${userAccessToken}`);

      expect(res.status).toBe(200);
      expect(Array.isArray(res.body)).toBe(true);
      expect(res.body.length).toBe(1);
      expect(res.body[0].id).toBe(bugReportId);
    });

    it('should allow user to fetch their own bug report details', async () => {
      const res = await supertest(app.getHttpServer())
        .get(`${apiPrefix}/bug-reports/${bugReportId}`)
        .set('Authorization', `Bearer ${userAccessToken}`);

      expect(res.status).toBe(200);
      expect(res.body.id).toBe(bugReportId);
    });

    it('should allow admin to fetch all bug reports', async () => {
      const res = await supertest(app.getHttpServer())
        .get(`${apiPrefix}/bug-reports`)
        .set('Authorization', `Bearer ${adminAccessToken}`);

      expect(res.status).toBe(200);
      expect(Array.isArray(res.body)).toBe(true);
      const found = res.body.find((item: any) => item.id === bugReportId);
      expect(found).toBeDefined();
    });

    it('should fail to let a regular user update status or severity', async () => {
      const res = await supertest(app.getHttpServer())
        .patch(`${apiPrefix}/bug-reports/${bugReportId}`)
        .set('Authorization', `Bearer ${userAccessToken}`)
        .send({ status: 'resolved' });

      expect(res.status).toBe(403);
    });

    it('should allow admin to update status and severity', async () => {
      const res = await supertest(app.getHttpServer())
        .patch(`${apiPrefix}/bug-reports/${bugReportId}`)
        .set('Authorization', `Bearer ${adminAccessToken}`)
        .send({ status: 'in_progress', severity: 'critical' });

      expect(res.status).toBe(200);
      expect(res.body.status).toBe('in_progress');
      expect(res.body.severity).toBe('critical');
    });

    it('should fail to let a regular user delete a bug report', async () => {
      const res = await supertest(app.getHttpServer())
        .delete(`${apiPrefix}/bug-reports/${bugReportId}`)
        .set('Authorization', `Bearer ${userAccessToken}`);

      expect(res.status).toBe(403);
    });

    it('should allow admin to delete a bug report', async () => {
      const res = await supertest(app.getHttpServer())
        .delete(`${apiPrefix}/bug-reports/${bugReportId}`)
        .set('Authorization', `Bearer ${adminAccessToken}`);

      expect(res.status).toBe(200);

      // Verify it's gone
      const verifyRes = await supertest(app.getHttpServer())
        .get(`${apiPrefix}/bug-reports/${bugReportId}`)
        .set('Authorization', `Bearer ${adminAccessToken}`);
      expect(verifyRes.status).toBe(404);
    });
  });
});
