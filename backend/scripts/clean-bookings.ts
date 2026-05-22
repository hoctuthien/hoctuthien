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
  
  const courseId = '652872df-b186-4a57-a987-aee32bb36a09';
  console.log(`Dọn dẹp các booking cũ của course ${courseId} trong database...`);
  const result = await dataSource.query(`DELETE FROM course_bookings WHERE course_id = $1`, [courseId]);
  console.log('✅ Đã dọn dẹp xong. Toàn bộ slot của khóa học này đã được giải phóng!');
  
  await dataSource.destroy();
}

run().catch(console.error);
