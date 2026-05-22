import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import supertest from 'supertest';
import cookieParser from 'cookie-parser';
import { AppModule } from '../src/app.module';
import { MentorAvailabilityStatus } from '../src/common/enums/mentor-availability-status.enum';
import { UserRole } from '../src/modules/user/entities/user.entity';

describe('Mentor Onboarding Flow (E2E)', () => {
  let app: INestApplication;
  const apiPrefix = '/api/v1';

  // Test data - using dynamic email to avoid conflicts in repeated runs
  const timestamp = Date.now();
  const testUser = {
    email: `test_mentor_${timestamp}@example.com`,
    password: 'Password123!',
    name: 'Test Mentor Candidate',
  };

  // WARNING: Ensure this admin exists in your database or seed it before running
  // Official admin credentials from seed script
  const adminCredentials = {
    email: 'admin@hoctuthien.com',
    password: 'Admin@123',
  };

  let userAccessToken: string;
  let adminAccessToken: string;
  let applicationId: string;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.use(cookieParser());
    app.setGlobalPrefix('api/v1');
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  describe('Step 1: User Registration & Login', () => {
    it('should register a new candidate (mentee role by default)', async () => {
      const response = await supertest(app.getHttpServer())
        .post(`${apiPrefix}/auths/register`)
        .send(testUser);

      expect(response.status).toBe(201);
      expect(response.body.user).toBeDefined();
      expect(response.body.user.email).toBe(testUser.email);
      console.log(`Registered user: ${testUser.email}`);
    });

    it('should login as the new candidate', async () => {
      const response = await supertest(app.getHttpServer())
        .post(`${apiPrefix}/auths/login`)
        .send({
          email: testUser.email,
          password: testUser.password,
        });

      expect(response.status).toBe(201);
      userAccessToken = response.body.access_token || response.body.accessToken;
      expect(userAccessToken).toBeDefined();
    });
  });

  describe('Step 2: Mentor Application', () => {
    it('should apply for mentor availability', async () => {
      const applicationData = {
        jobTitle: 'Senior Software Engineer',
        company: 'Tech Solutions Inc',
        bio: 'I have 10 years of experience in full-stack development and love teaching.',
        yearsOfExperience: 10,
        skills: ['TypeScript', 'NestJS', 'React', 'Node.js'],
        linkedinUrl: 'https://linkedin.com/in/test-mentor',
        metadata: {
          certificates: [
            {
              name: 'AWS Certified Solutions Architect',
              issuedBy: 'Amazon Web Services',
              imageUrl: 'https://example.com/aws-cert.jpg',
            },
          ],
          degrees: [
            {
              name: 'Bachelor of Computer Science',
              university: 'University of Technology',
              imageUrl: 'https://example.com/degree.jpg',
            },
          ],
        },
      };

      const response = await supertest(app.getHttpServer())
        .post(`${apiPrefix}/mentor-availabilities`)
        .set('Authorization', `Bearer ${userAccessToken}`)
        .send(applicationData);

      expect(response.status).toBe(201);
      expect(response.body.data).toBeDefined();
      expect(response.body.data.status).toBe(MentorAvailabilityStatus.PENDING);
      applicationId = response.body.data.id;
      console.log(`Created application ID: ${applicationId}`);
    });
  });

  describe('Step 3: Admin Approval Flow', () => {
    it('should login as admin', async () => {
      const response = await supertest(app.getHttpServer())
        .post(`${apiPrefix}/auths/login`)
        .send(adminCredentials);

      if (response.status !== 201) {
        console.error('Admin login failed. Make sure admin account exists.');
        console.error('Response:', JSON.stringify(response.body, null, 2));
      }
      expect(response.status).toBe(201);
      adminAccessToken = response.body.access_token || response.body.accessToken;
      expect(adminAccessToken).toBeDefined();
    });

    it('should move application to in-progress', async () => {
      const response = await supertest(app.getHttpServer())
        .patch(`${apiPrefix}/mentor-availabilities/${applicationId}/in-progress`)
        .set('Authorization', `Bearer ${adminAccessToken}`)
        .send({});

      expect(response.status).toBe(200);
      expect(response.body.status).toBe(MentorAvailabilityStatus.IN_PROGRESS);
    });

    it('should approve the application', async () => {
      const response = await supertest(app.getHttpServer())
        .patch(`${apiPrefix}/mentor-availabilities/${applicationId}/approved`)
        .set('Authorization', `Bearer ${adminAccessToken}`)
        .send({ note: 'Excellent background and certificates. Approved.' });

      expect(response.status).toBe(200);
      expect(response.body.status).toBe(MentorAvailabilityStatus.APPROVED);
    });
  });

  describe('Step 4: Verification', () => {
    it('should verify the user now has MENTOR role and profile is created', async () => {
      // Re-login to get updated role in token/user object
      const response = await supertest(app.getHttpServer())
        .post(`${apiPrefix}/auths/login`)
        .send({
          email: testUser.email,
          password: testUser.password,
        });

      if (response.status !== 201 || response.body.user.role !== UserRole.MENTOR) {
        console.log('--- DEBUG INFO ---');
        console.log('Login Response Status:', response.status);
        console.log('Login Response Body:', JSON.stringify(response.body, null, 2));
        
        // Also check application status directly as admin
        const adminLogin = await supertest(app.getHttpServer())
          .post(`${apiPrefix}/auths/login`)
          .send(adminCredentials);
        
        const appDetail = await supertest(app.getHttpServer())
          .get(`${apiPrefix}/mentor-availabilities/${applicationId}`)
          .set('Authorization', `Bearer ${adminLogin.body.access_token || adminLogin.body.accessToken}`);
          
        console.log('Application Detail:', JSON.stringify(appDetail.body, null, 2));
        console.log('--- END DEBUG INFO ---');
      }

      expect(response.status).toBe(201);
      expect(response.body.user.role).toBe(UserRole.MENTOR);
      console.log(`User ${testUser.email} role verified as: ${response.body.user.role}`);
    });
  });
});
