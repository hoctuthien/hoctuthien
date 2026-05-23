import { DataSource } from 'typeorm';
import * as dotenv from 'dotenv';

dotenv.config();

async function inspect() {
  const dataSource = new DataSource({
    type: 'postgres',
    url: process.env.DATABASE_URL,
    synchronize: false,
    logging: false,
  });

  try {
    await dataSource.initialize();
    console.log(' Kết nối Database thành công.\n');

    // 1. Kiểm tra số lượng bản ghi các bảng
    const countGroup = await dataSource.query('SELECT COUNT(*) FROM group_categories;');
    const countCat = await dataSource.query('SELECT COUNT(*) FROM categories;');
    const countCourse = await dataSource.query('SELECT COUNT(*) FROM courses;');
    const countCC = await dataSource.query('SELECT COUNT(*) FROM course_categories;');

    console.log('Số lượng dòng hiện có trong từng bảng:');
    console.log(`- group_categories: ${countGroup[0].count}`);
    console.log(`- categories: ${countCat[0].count}`);
    console.log(`- courses: ${countCourse[0].count}`);
    console.log(`- course_categories: ${countCC[0].count}`);

    // 2. Lấy thử dữ liệu của course_categories xem nó đang liên kết ID nào
    console.log('\n Lấy 5 dòng đầu tiên trong bảng "course_categories":');
    const ccRows = await dataSource.query('SELECT * FROM course_categories LIMIT 5;');
    console.log(ccRows);

    // 3. Kiểm tra xem các category_id trong ccRows có tồn tại trong categories không
    if (ccRows.length > 0) {
      console.log('\n Kiểm tra đối khớp khóa ngoại:');
      for (const row of ccRows) {
        const cat = await dataSource.query(`SELECT * FROM categories WHERE id = '${row.category_id}';`);
        console.log(`- Link: CourseId ${row.course_id} ↔️ CatId ${row.category_id}. Tồn tại trong categories? ${cat.length > 0 ? 'CÓ (' + cat[0].name + ')' : 'KHÔNG'}`);
      }
    }

  } catch (err) {
    console.error(err);
  } finally {
    await dataSource.destroy();
  }
}
inspect();
