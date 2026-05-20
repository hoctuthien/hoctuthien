import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import supertest from 'supertest';
import cookieParser from 'cookie-parser';
import { AppModule } from '../src/app.module';

describe('Auth Registration (E2E)', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    const config = app.get(ConfigService);
    console.log('DEBUG: DATABASE_URL in test:', config.get('DATABASE_URL'));
    console.log(
      'DEBUG: DB_SYNCHRONIZE in test:',
      config.get('database.synchronize'),
    );

    app.use(cookieParser()); // Apply cookie-parser
    app.setGlobalPrefix('api/v1'); // Manually apply prefix in E2E
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  const generateTestAccounts = (count: number) => {
    return Array.from({ length: count }, (_, i) => ({
      email: `batch_user_${i + 1}@example.com`,
      password: 'password123',
      name: `Batch User ${i + 1}`,
    }));
  };

  it('should register 10 test accounts', async () => {
    const accounts = generateTestAccounts(10);
    const apiPrefix = '/api/v1';

    for (const account of accounts) {
      console.log(`Registering account: ${account.email}`);
      const response = await supertest(app.getHttpServer())
        .post(`${apiPrefix}/auths/register`)
        .send(account);

      // We expect 201 Created or 409 Conflict (if already exists)
      if (response.status === 201) {
        expect(response.body.user).toBeDefined();
        expect(response.body.user.email).toBe(account.email);
        console.log(`Successfully registered: ${account.email}`);
      } else if (response.status === 409) {
        console.log(`Account already exists: ${account.email}`);
      } else {
        console.error(
          `Failed to register ${account.email}. Status: ${response.status}`,
        );
        console.error('Response Body:', JSON.stringify(response.body, null, 2));
        throw new Error(`Registration failed with status ${response.status}`);
      }
    }
  }, 30000); // Increase timeout for 10 registrations
});
