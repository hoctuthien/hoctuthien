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
  
  const course = await dataSource.query(`SELECT id, title, metadata FROM courses WHERE id = '652872df-b186-4a57-a987-aee32bb36a09'`);
  console.log('\n--- COURSE METADATA ---');
  console.log(JSON.stringify(course, null, 2));
  
  await dataSource.destroy();
}

run().catch(console.error);
