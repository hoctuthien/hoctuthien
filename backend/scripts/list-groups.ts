import { DataSource } from 'typeorm';
import * as dotenv from 'dotenv';

dotenv.config();

async function list() {
  const dataSource = new DataSource({
    type: 'postgres',
    url: process.env.DATABASE_URL,
    synchronize: false,
    logging: false,
  });

  try {
    await dataSource.initialize();
    console.log('🔌 Kết nối Database thành công.\n');

    const groups = await dataSource.query('SELECT id, name, slug FROM group_categories;');
    console.log('📁 Danh sách nhóm cha (group_categories) trong DB:');
    console.log(groups);

    const categories = await dataSource.query('SELECT id, name, slug, group_category_id FROM categories LIMIT 5;');
    console.log('\n🏷️ Một số danh mục con (categories) trong DB:');
    console.log(categories);

    // Kiểm tra xem các courses có bị soft deleted không
    const courses = await dataSource.query('SELECT id, title, deleted_at, status, approved_by FROM courses LIMIT 6;');
    console.log('\n📚 Thông tin 6 khóa học đầu tiên (Kiểm tra soft delete):');
    console.log(courses);

  } catch (err) {
    console.error(err);
  } finally {
    await dataSource.destroy();
  }
}
list();
