import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import { AppModule } from '../src/app.module';
import { UserService } from '../src/modules/user/services/user.service';
import { UserRole } from '../src/modules/user/entities/user.entity';

jest.setTimeout(60000); // 60 seconds

describe('User Seed (E2E)', () => {
  let app: INestApplication;
  let userService: UserService;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();

    userService = moduleFixture.get<UserService>(UserService);
  });

  afterAll(async () => {
    await app.close();
  });

  const seedUsers = [
    {
      email: 'admin@example.com',
      name: 'System Admin',
      password: 'AdminPassword123!',
      role: UserRole.ADMIN,
    },
    {
      email: 'mentor1@example.com',
      name: 'Mentor One',
      password: 'MentorPassword123!',
      role: UserRole.MENTOR,
    },
    {
      email: 'mentor2@example.com',
      name: 'Mentor Two',
      password: 'MentorPassword123!',
      role: UserRole.MENTOR,
    },
    {
      email: 'mentee1@example.com',
      name: 'Mentee One',
      password: 'MenteePassword123!',
      role: UserRole.MENTEE,
    },
    {
      email: 'mentee2@example.com',
      name: 'Mentee Two',
      password: 'MenteePassword123!',
      role: UserRole.MENTEE,
    },
  ];

  it('should seed users with different roles', async () => {
    for (const userData of seedUsers) {
      const existingUser = await userService.findByEmail(userData.email);
      if (!existingUser) {
        console.log(`Seeding user: ${userData.email} (${userData.role})`);
        await userService.create(userData as any);
      } else {
        console.log(`User already exists: ${userData.email}`);
      }
    }
  });
});
