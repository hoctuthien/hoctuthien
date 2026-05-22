import { DataSource } from 'typeorm';
import * as dotenv from 'dotenv';
import * as path from 'path';

dotenv.config({ path: path.join(__dirname, '../.env') });

async function run() {
  const dataSource = new DataSource({
    type: 'postgres',
    url: process.env.DATABASE_URL,
    synchronize: false,
  });

  await dataSource.initialize();
  
  const courses = await dataSource.query(`SELECT id, title, price, status FROM courses`);
  console.log('\n--- ACTUAL COURSES IN DB ---');
  console.log(JSON.stringify(courses, null, 2));

  const users = await dataSource.query(`SELECT id, email, role, status FROM users LIMIT 10`);
  console.log('\n--- ACTUAL USERS IN DB ---');
  console.log(JSON.stringify(users, null, 2));
  
  await dataSource.destroy();
}

run().catch(console.error);
