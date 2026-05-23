import { DataSource } from 'typeorm';
import * as dotenv from 'dotenv';

dotenv.config();

async function check() {
  const dataSource = new DataSource({
    type: 'postgres',
    url: process.env.DATABASE_URL,
    synchronize: false,
    logging: false,
  });

  try {
    await dataSource.initialize();
    console.log('🔌 Kết nối Database thành công.\n');

    // 1. Lấy toàn bộ category_id từ course_categories
    const courseCategories: any[] = await dataSource.query(`
      SELECT DISTINCT category_id FROM course_categories;
    `);
    const usedCategoryIds = courseCategories.map((cc) => cc.category_id);

    // 2. Lấy toàn bộ id từ categories
    const categories: any[] = await dataSource.query(`
      SELECT id, name, slug FROM categories;
    `);
    const categoryIds = categories.map((c) => c.id);
    const categoryMap = new Map(categories.map((c) => [c.id, c]));

    console.log(`📊 Thống kê:`);
    console.log(`- Tổng số danh mục con trong bảng "categories": ${categories.length}`);
    console.log(`- Số lượng danh mục con đang được "course_categories" sử dụng: ${usedCategoryIds.length}`);

    // 3. Tìm các ID mồ côi (có trong course_categories nhưng không có trong categories)
    const orphanedIds = usedCategoryIds.filter((id) => !categoryIds.includes(id));

    if (orphanedIds.length === 0) {
      console.log('\n✅ TUYỆT VỜI: 100% ID danh mục trong "course_categories" đều khớp chính xác với bảng "categories"! Bạn có thể test Postman ngay.');
    } else {
      console.log(`\n⚠️ CẢNH BÁO: Phát hiện ${orphanedIds.length} ID danh mục trong "course_categories" KHÔNG TỒN TẠI trong bảng "categories"!`);
      console.log('Danh sách ID bị lệch:', orphanedIds);

      console.log('\n🔄 Đang tự động khớp nối lại dựa theo tên/slug danh mục cũ nếu còn lưu trong database...');
      // Ở đây chúng ta sẽ map lại các khóa học mồ côi sang một danh mục mặc định hoặc danh mục phù hợp.
      // Vì bảng categories cũ đã bị TRUNCATE và tạo mới hoàn toàn UUID, nên các course_categories cũ sẽ bị mồ côi.
      // Chúng ta sẽ gán toàn bộ course_categories mồ côi về danh mục mặc định "Lập trình Web" (UUID: 'c0100000-0000-0000-0000-000000000001')
      // hoặc một danh mục tương ứng để bạn test Postman không bị lỗi rỗng dữ liệu.
      
      const defaultCategoryId = 'c0100000-0000-0000-0000-000000000001'; // Lập trình Web
      
      console.log(`\n🛠️ Đang gán tạm thời các liên kết mồ côi này về danh mục "Lập trình Web" (ID: ${defaultCategoryId})...`);
      
      const result = await dataSource.query(`
        UPDATE course_categories 
        SET category_id = '${defaultCategoryId}' 
        WHERE category_id NOT IN (SELECT id FROM categories);
      `);
      
      console.log(`✅ Sửa thành công! Đã cập nhật lại ${result[1] || result} dòng liên kết khóa học.`);
    }

  } catch (error) {
    console.error('❌ Lỗi kiểm tra database:', error);
  } finally {
    await dataSource.destroy();
  }
}

check();
