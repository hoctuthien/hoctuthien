import { DataSource } from 'typeorm';
import * as dotenv from 'dotenv';

dotenv.config();

async function approve() {
  const dataSource = new DataSource({
    type: 'postgres',
    url: process.env.DATABASE_URL,
    synchronize: false,
    logging: false,
  });

  try {
    await dataSource.initialize();
    console.log('🔌 Kết nối Database thành công.\n');

    // 1. Tìm một User bất kỳ trong hệ thống để làm người duyệt (Tránh lỗi vi phạm khóa ngoại)
    const users: any[] = await dataSource.query("SELECT id FROM users LIMIT 1;");
    
    if (users.length === 0) {
      console.log('❌ Thất bại: Không tìm thấy bất kỳ User nào trong database để làm người duyệt!');
      return;
    }
    
    const approverId = users[0].id;
    console.log(`👤 Lấy ID người duyệt hợp lệ: "${approverId}"`);

    // 2. Cập nhật duyệt và đặt trạng thái ACTIVE cho toàn bộ các khóa học
    console.log('⚡ Đang cập nhật trạng thái duyệt (approved_by) và ACTIVE cho toàn bộ khóa học...');
    
    const result = await dataSource.query(`
      UPDATE courses 
      SET approved_by = '${approverId}', status = 'ACTIVE';
    `);

    console.log(`✅ THÀNH CÔNG! Đã cập nhật và duyệt thành công cho các khóa học.`);

  } catch (error) {
    console.error('❌ Lỗi thực thi:', error);
  } finally {
    await dataSource.destroy();
  }
}

approve();
