import { DataSource } from 'typeorm';
import * as dotenv from 'dotenv';

dotenv.config();

async function reseed() {
  const dataSource = new DataSource({
    type: 'postgres',
    url: process.env.DATABASE_URL,
    synchronize: false,
    logging: false,
  });

  try {
    await dataSource.initialize();
    console.log('🔌 Kết nối Database thành công.\n');

    // 1. Xóa toàn bộ dữ liệu trong bảng course_categories
    console.log('🧹 Đang xóa sạch dữ liệu cũ trong bảng "course_categories"...');
    await dataSource.query('TRUNCATE TABLE course_categories;');
    console.log('✅ Đã xóa sạch.\n');

    // 2. Lấy 6 khóa học từ bảng courses
    console.log('🔍 Đang lấy danh sách 6 khóa học hiện có...');
    const courses: any[] = await dataSource.query('SELECT id, title FROM courses LIMIT 6;');
    
    if (courses.length < 6) {
      console.log(`⚠️ Cảnh báo: Chỉ tìm thấy ${courses.length} khóa học trong database. Sẽ ánh xạ trên số lượng hiện có.`);
    }

    // 3. Định nghĩa các Category ID cố định từ cấu trúc của chúng ta
    // Nhóm 1: Công nghệ thông tin (a0100000-0000-0000-0000-000000000001)
    const itCategories = [
      { id: 'c0100000-0000-0000-0000-000000000001', name: 'Lập trình Web' },
      { id: 'c0100000-0000-0000-0000-000000000002', name: 'Lập trình Di động' },
      { id: 'c0100000-0000-0000-0000-000000000003', name: 'Trí tuệ nhân tạo (AI)' },
    ];

    // Nhóm 2: Ngoại ngữ (a0200000-0000-0000-0000-000000000002)
    const langCategories = [
      { id: 'c0200000-0000-0000-0000-000000000001', name: 'Tiếng Anh' },
      { id: 'c0200000-0000-0000-0000-000000000002', name: 'Tiếng Nhật' },
      { id: 'c0200000-0000-0000-0000-000000000003', name: 'Tiếng Hàn' },
    ];

    console.log('🔄 Bắt đầu gán liên kết mới cho các khóa học...');

    const insertValues: string[] = [];

    // Gán 3 khóa học đầu vào nhóm Công nghệ thông tin
    for (let i = 0; i < Math.min(courses.length, 3); i++) {
      const course = courses[i];
      const category = itCategories[i];
      insertValues.push(`(gen_random_uuid(), '${course.id}', '${category.id}', 'active')`);
      console.log(`🔗 Ghép cặp: "${course.title}" ➡️ Danh mục con: "${category.name}" (Thuộc nhóm: Công nghệ thông tin)`);
    }

    // Gán 3 khóa học tiếp theo vào nhóm Ngoại ngữ
    for (let i = 3; i < Math.min(courses.length, 6); i++) {
      const course = courses[i];
      const category = langCategories[i - 3];
      insertValues.push(`(gen_random_uuid(), '${course.id}', '${category.id}', 'active')`);
      console.log(`🔗 Ghép cặp: "${course.title}" ➡️ Danh mục con: "${category.name}" (Thuộc nhóm: Ngoại ngữ)`);
    }

    if (insertValues.length > 0) {
      await dataSource.query(`
        INSERT INTO course_categories (id, course_id, category_id, status)
        VALUES ${insertValues.join(',\n')};
      `);
      console.log('\n🚀 NẠP DỮ LIỆU THÀNH CÔNG! Đã tạo các liên kết mẫu hoàn hảo.');
    } else {
      console.log('\n❌ Không có khóa học nào trong database để nạp liên kết.');
    }

  } catch (error) {
    console.error('❌ Lỗi thực thi:', error);
  } finally {
    await dataSource.destroy();
  }
}

reseed();
