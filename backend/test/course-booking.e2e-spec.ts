import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import supertest from 'supertest';
import cookieParser from 'cookie-parser';
import { AppModule } from '../src/app.module';
import { MentorAvailabilityStatus } from '../src/common/enums/mentor-availability-status.enum';
import { UserRole } from '../src/modules/user/entities/user.entity';

describe('Course Booking and Schedule Validation (E2E)', () => {
  let app: INestApplication;
  const apiPrefix = '/api/v1';

  const timestamp = Date.now();
  const testMentee = {
    email: `test_booking_mentee_${timestamp}@example.com`,
    password: 'Password123!',
    name: 'Test Mentee Student',
  };

  const testMentor = {
    email: `test_booking_mentor_${timestamp}@example.com`,
    password: 'Password123!',
    name: 'Test Booking Mentor',
  };

  const adminCredentials = {
    email: 'admin@hoctuthien.com',
    password: 'Admin@123',
  };

  let menteeAccessToken: string;
  let mentorAccessToken: string;
  let adminAccessToken: string;
  let mentorApplicationId: string;
  let categoryId: string;
  let courseId: string;

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

  describe('Setup: Users and Roles Onboarding', () => {
    it('should register and login as a Mentee', async () => {
      // 1. Register
      const regRes = await supertest(app.getHttpServer())
        .post(`${apiPrefix}/auths/register`)
        .send(testMentee);
      expect(regRes.status).toBe(201);

      // 2. Login
      const loginRes = await supertest(app.getHttpServer())
        .post(`${apiPrefix}/auths/login`)
        .send({ email: testMentee.email, password: testMentee.password });
      expect(loginRes.status).toBe(201);
      menteeAccessToken = loginRes.body.access_token || loginRes.body.accessToken;
      expect(menteeAccessToken).toBeDefined();
    });

    it('should register and onboard a Mentor', async () => {
      // 1. Register candidate
      const regRes = await supertest(app.getHttpServer())
        .post(`${apiPrefix}/auths/register`)
        .send(testMentor);
      expect(regRes.status).toBe(201);

      // 2. Login candidate
      const loginRes = await supertest(app.getHttpServer())
        .post(`${apiPrefix}/auths/login`)
        .send({ email: testMentor.email, password: testMentor.password });
      expect(loginRes.status).toBe(201);
      const tempAccessToken = loginRes.body.access_token || loginRes.body.accessToken;

      // 3. Create mentor application
      const appData = {
        jobTitle: 'Senior Instructor',
        company: 'Online Academy',
        bio: 'Onboarding mentor for course booking testing.',
        yearsOfExperience: 8,
        skills: ['TypeScript', 'Testing'],
        linkedinUrl: 'https://linkedin.com/in/test-booking-mentor',
        metadata: { certificates: [], degrees: [] }
      };

      const mentorAppRes = await supertest(app.getHttpServer())
        .post(`${apiPrefix}/mentor-availabilities`)
        .set('Authorization', `Bearer ${tempAccessToken}`)
        .send(appData);
      expect(mentorAppRes.status).toBe(201);
      mentorApplicationId = mentorAppRes.body.data.id;

      // 4. Admin Login
      const adminLoginRes = await supertest(app.getHttpServer())
        .post(`${apiPrefix}/auths/login`)
        .send(adminCredentials);
      expect(adminLoginRes.status).toBe(201);
      adminAccessToken = adminLoginRes.body.access_token || adminLoginRes.body.accessToken;

      // 5. Admin Approve
      await supertest(app.getHttpServer())
        .patch(`${apiPrefix}/mentor-availabilities/${mentorApplicationId}/in-progress`)
        .set('Authorization', `Bearer ${adminAccessToken}`)
        .send({});

      await supertest(app.getHttpServer())
        .patch(`${apiPrefix}/mentor-availabilities/${mentorApplicationId}/approved`)
        .set('Authorization', `Bearer ${adminAccessToken}`)
        .send({ note: 'Approved' });

      // 6. Login as Mentor (now promoted)
      const mentorLoginRes = await supertest(app.getHttpServer())
        .post(`${apiPrefix}/auths/login`)
        .send({ email: testMentor.email, password: testMentor.password });
      expect(mentorLoginRes.status).toBe(201);
      expect(mentorLoginRes.body.user.role).toBe(UserRole.MENTOR);
      mentorAccessToken = mentorLoginRes.body.access_token || mentorLoginRes.body.accessToken;
    });

    it('should fetch or create a category', async () => {
      // Get categories
      const catRes = await supertest(app.getHttpServer())
        .get(`${apiPrefix}/categories?limit=1`)
        .set('Authorization', `Bearer ${adminAccessToken}`);
      
      const cats = catRes.body?.data || [];
      if (cats.length > 0) {
        categoryId = cats[0].id;
      } else {
        // Create one if database is empty
        const newCatRes = await supertest(app.getHttpServer())
          .post(`${apiPrefix}/categories`)
          .set('Authorization', `Bearer ${adminAccessToken}`)
          .send({ name: 'Testing Category' });
        expect(newCatRes.status).toBe(201);
        categoryId = newCatRes.body.id;
      }
      expect(categoryId).toBeDefined();
    });
  });

  describe('Setup: Course Creation with Schedule Slots', () => {
    it('should create an active course with a specific weekly schedule', async () => {
      const coursePayload = {
        title: 'Advanced Testing E2E Course',
        description: 'Learn how to write clean E2E tests in NestJS and React.',
        category: 'Software Engineering',
        categoryIds: [categoryId],
        price: 0,
        status: 'ACTIVE',
        thumbnailUrl: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?q=80&w=600&auto=format&fit=crop',
        durationMinutes: 60,
        prerequisites: [],
        metadata: {
          level: 'advanced',
          totalHours: 10,
          format: 'online',
          time: {
            monday: ['09:00-10:30', '15:30-17:00'], // Available slots on Monday
            friday: ['14:00-15:30']                 // Available slot on Friday
          }
        }
      };

      const courseRes = await supertest(app.getHttpServer())
        .post(`${apiPrefix}/courses`)
        .set('Authorization', `Bearer ${mentorAccessToken}`)
        .send(coursePayload);

      expect(courseRes.status).toBe(201);
      courseId = courseRes.body.id;
      expect(courseId).toBeDefined();
    });
  });

  describe('Course Booking and Schedule Validations', () => {
    it('should succeed to book a slot that is within the available schedule', async () => {
      // Next Monday at 09:30 (e.g. 2026-06-08T09:30:00+07:00)
      // Monday 09:30 is inside 09:00-10:30
      const meetingTime = new Date('2026-06-08T09:30:00+07:00');

      const bookingPayload = {
        courseId,
        meetingTime: meetingTime.toISOString(),
        notesForMentor: 'I want to study test validations.'
      };

      const bookingRes = await supertest(app.getHttpServer())
        .post(`${apiPrefix}/course-bookings`)
        .set('Authorization', `Bearer ${menteeAccessToken}`)
        .send(bookingPayload);

      expect(bookingRes.status).toBe(201);
      expect(bookingRes.body.id).toBeDefined();
      expect(bookingRes.body.status).toBe('pending'); // PENDING awaiting payment verification
    });

    it('should fail to book if the slot falls on a day when mentor is not available', async () => {
      // Next Tuesday at 09:30 (e.g. 2026-06-09T09:30:00+07:00)
      // Tuesday is not in the course metadata time mapping
      const meetingTime = new Date('2026-06-09T09:30:00+07:00');

      const bookingPayload = {
        courseId,
        meetingTime: meetingTime.toISOString(),
        notesForMentor: 'This should fail'
      };

      const bookingRes = await supertest(app.getHttpServer())
        .post(`${apiPrefix}/course-bookings`)
        .set('Authorization', `Bearer ${menteeAccessToken}`)
        .send(bookingPayload);

      expect(bookingRes.status).toBe(400);
      expect(bookingRes.body.message).toContain('Mentor không rảnh vào thứ tuesday');
    });

    it('should fail to book if the time is outside of the free schedule slots', async () => {
      // Next Monday at 12:00 (e.g. 2026-06-08T12:00:00+07:00)
      // Monday is configured, but 12:00 is not within '09:00-10:30' or '15:30-17:00'
      const meetingTime = new Date('2026-06-08T12:00:00+07:00');

      const bookingPayload = {
        courseId,
        meetingTime: meetingTime.toISOString(),
        notesForMentor: 'This should fail'
      };

      const bookingRes = await supertest(app.getHttpServer())
        .post(`${apiPrefix}/course-bookings`)
        .set('Authorization', `Bearer ${menteeAccessToken}`)
        .send(bookingPayload);

      expect(bookingRes.status).toBe(400);
      expect(bookingRes.body.message).toContain('không nằm trong khung giờ rảnh của Mentor');
    });

    it('should fail if another active booking already exists for this course', async () => {
      // Booking again for the same course (which has an active pending booking)
      const meetingTime = new Date('2026-06-08T16:00:00+07:00'); // Valid slot, but course is occupied

      const bookingPayload = {
        courseId,
        meetingTime: meetingTime.toISOString(),
        notesForMentor: 'Double booking test'
      };

      const bookingRes = await supertest(app.getHttpServer())
        .post(`${apiPrefix}/course-bookings`)
        .set('Authorization', `Bearer ${menteeAccessToken}`)
        .send(bookingPayload);

      expect(bookingRes.status).toBe(400);
      expect(bookingRes.body.message).toContain('đã có học viên đăng ký và đang hoạt động');
    });
  });
});
