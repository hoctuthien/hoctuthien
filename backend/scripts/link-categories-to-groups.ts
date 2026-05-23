import { DataSource } from 'typeorm';
import * as dotenv from 'dotenv';

dotenv.config();

async function link() {
  const dataSource = new DataSource({
    type: 'postgres',
    url: process.env.DATABASE_URL,
    synchronize: false,
    logging: false,
  });

  try {
    await dataSource.initialize();
    console.log('🔌 Kết nối Database thành công.\n');

    console.log('⚡ Đang cập nhật group_category_id cho các danh mục con (categories)...');

    // 1. Nhóm Công nghệ thông tin (a0100000-0000-0000-0000-000000000001)
    const itSlugs = [
      'web-development',
      'mobile-apps',
      'artificial-intelligence',
      'cyber-security'
    ];
    await dataSource.query(`
      UPDATE categories 
      SET group_category_id = 'a0100000-0000-0000-0000-000000000001' 
      WHERE slug IN (${itSlugs.map(s => `'${s}'`).join(',')});
    `);

    // 2. Nhóm Ngoại ngữ (a0200000-0000-0000-0000-000000000002)
    const langSlugs = [
      'english-language',
      'tieng-nhat',
      'tieng-han',
      'tieng-trung'
    ];
    await dataSource.query(`
      UPDATE categories 
      SET group_category_id = 'a0200000-0000-0000-0000-000000000002' 
      WHERE slug IN (${langSlugs.map(s => `'${s}'`).join(',')});
    `);

    // 3. Các nhóm còn lại nếu cần
    // Nhóm 3: Kinh doanh
    await dataSource.query(`
      UPDATE categories 
      SET group_category_id = 'a0300000-0000-0000-0000-000000000003' 
      WHERE slug IN ('business-management', 'accounting', 'startup', 'project-management');
    `);

    // Nhóm 4: Thiết kế
    await dataSource.query(`
      UPDATE categories 
      SET group_category_id = 'a0400000-0000-0000-0000-000000000004' 
      WHERE slug IN ('graphic-design', 'ui-ux-design', 'photography-video', 'fine-arts');
    `);

    // Nhóm 5: Marketing
    await dataSource.query(`
      UPDATE categories 
      SET group_category_id = 'a0500000-0000-0000-0000-000000000005' 
      WHERE slug IN ('digital-marketing', 'branding', 'content-creation', 'public-relations');
    `);

    // Nhóm 6: Phát triển bản thân
    await dataSource.query(`
      UPDATE categories 
      SET group_category_id = 'a0600000-0000-0000-0000-000000000006' 
      WHERE slug IN ('communication-skills', 'time-management', 'critical-thinking', 'career-planning');
    `);

    // Nhóm 7: Khoa học tự nhiên
    await dataSource.query(`
      UPDATE categories 
      SET group_category_id = 'a0700000-0000-0000-0000-000000000007' 
      WHERE slug IN ('mathematics', 'physics', 'chemistry', 'biology-environment');
    `);

    // Nhóm 8: Khoa học xã hội
    await dataSource.query(`
      UPDATE categories 
      SET group_category_id = 'a0800000-0000-0000-0000-000000000008' 
      WHERE slug IN ('psychology', 'philosophy', 'history-culture', 'sociology');
    `);

    // Nhóm 9: Kỹ năng mềm
    await dataSource.query(`
      UPDATE categories 
      SET group_category_id = 'a0900000-0000-0000-0000-000000000009' 
      WHERE slug IN ('public-speaking', 'cooking-culinary', 'music-instruments', 'health-yoga');
    `);

    // Nhóm 10: Tài chính
    await dataSource.query(`
      UPDATE categories 
      SET group_category_id = 'a1000000-0000-0000-0000-000000000010' 
      WHERE slug IN ('personal-finance', 'stock-investment', 'financial-analysis', 'risk-management');
    `);

    console.log('✅ Đã cập nhật xong tất cả các mối quan hệ cha-con trong bảng "categories"!');

  } catch (error) {
    console.error('❌ Lỗi thực thi:', error);
  } finally {
    await dataSource.destroy();
  }
}

link();
