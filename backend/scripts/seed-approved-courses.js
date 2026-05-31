require('dotenv').config();
const { Client } = require('pg');
const crypto = require('crypto');

const client = new Client({
  connectionString: process.env.DATABASE_URL,
});

const adminId = 'f389003f-bef3-4d0b-8e89-a6a82992215d';
const mentorId = '9ab5e7fa-7f8d-4135-8f8e-66c21f27f2a8';

const approvedCourses = [
  {
    title: 'Lập trình Node.js & Express thực chiến',
    description: 'Khóa học chất lượng cao về xây dựng REST APIs chuyên nghiệp với Node.js, Express và TypeScript.',
    thumbnailUrl: 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?auto=format&fit=crop&w=300&q=80',
    price: 350000,
    categorySlug: 'web-development',
    categoryName: 'Lập trình Web',
    rating: 4.8,
    reviewsCount: 34,
    studentsCount: 150,
  },
  {
    title: 'Làm chủ Next.js 14 App Router từ số 0',
    description: 'Học cách xây dựng ứng dụng web hiện đại, tối ưu SEO, hỗ trợ Server Components với Next.js 14.',
    thumbnailUrl: 'https://images.unsplash.com/photo-1633356122544-f134324a6cee?auto=format&fit=crop&w=300&q=80',
    price: 499000,
    categorySlug: 'web-development',
    categoryName: 'Lập trình Web',
    rating: 4.9,
    reviewsCount: 56,
    studentsCount: 280,
  },
  {
    title: 'Thiết kế Hệ thống lớn & Microservices',
    description: 'Thiết kế hệ thống phân tán, xử lý tải cao, kiến trúc Microservices và các thông điệp bất đồng bộ.',
    thumbnailUrl: 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?auto=format&fit=crop&w=300&q=80',
    price: 899000,
    categorySlug: 'programming-languages',
    categoryName: 'Khoa học máy tính',
    rating: 5.0,
    reviewsCount: 12,
    studentsCount: 45,
  },
  {
    title: 'Docker & Kubernetes cho Lập trình viên',
    description: 'Tự động hóa triển khai ứng dụng của bạn bằng container hóa và quản trị orchestration mượt mà.',
    thumbnailUrl: 'https://images.unsplash.com/photo-1605379399642-870262d3d051?auto=format&fit=crop&w=300&q=80',
    price: 0, // Free course
    categorySlug: 'cloud-computing',
    categoryName: 'Cloud Computing',
    rating: 4.7,
    reviewsCount: 88,
    studentsCount: 1020,
  },
  {
    title: 'Luyện thuật toán phỏng vấn FAANG chuyên sâu',
    description: 'Luyện tập cấu trúc dữ liệu nâng cao, thuật toán tối ưu hóa, và các bài toán phỏng vấn hàng đầu.',
    thumbnailUrl: 'https://images.unsplash.com/photo-1515879218367-8466d910aaa4?auto=format&fit=crop&w=300&q=80',
    price: 150000,
    categorySlug: 'programming-languages',
    categoryName: 'Khoa học máy tính',
    rating: 4.8,
    reviewsCount: 22,
    studentsCount: 95,
  }
];

async function main() {
  try {
    await client.connect();
    console.log('Connected to database successfully.');

    // 1. Kiểm tra / tạo Admin user
    console.log(`Checking admin user ${adminId}...`);
    const checkAdmin = await client.query('SELECT id FROM "users" WHERE id = $1', [adminId]);
    if (checkAdmin.rows.length === 0) {
      console.log(`Admin ${adminId} not found. Creating...`);
      // Hashed password "Admin@123"
      const passwordHash = '$2b$10$l3nM95JnCsa7rZyxNYptguDqN0lXgA9g0QQveshuQ/OYAShOi8s8i';
      await client.query(
        `INSERT INTO "users" (id, name, email, role, status, is_verified, password_hash, created_at, updated_at) 
         VALUES ($1, $2, $3, $4, $5, $6, $7, NOW(), NOW())`,
        [adminId, 'Approve Admin', 'approve_admin@hoctuthien.com', 'admin', 'active', true, passwordHash]
      );
      console.log('✅ Admin user created successfully.');
    } else {
      console.log('ℹ️ Admin user already exists.');
    }

    // 2. Kiểm tra Mentor user
    console.log(`Checking mentor user ${mentorId}...`);
    const checkMentor = await client.query('SELECT id FROM "users" WHERE id = $1', [mentorId]);
    if (checkMentor.rows.length === 0) {
      console.log(`Mentor ${mentorId} not found. Creating...`);
      // Hashed password "password123"
      const passwordHash = '$2b$10$wE74/fN5mN40Rj8c3t9c0Obc8d4f4e7d1b3c9a6f8e7d2b5c0d2e1';
      await client.query(
        `INSERT INTO "users" (id, name, email, role, status, is_verified, password_hash, created_at, updated_at) 
         VALUES ($1, $2, $3, $4, $5, $6, $7, NOW(), NOW())`,
        [mentorId, 'John Doe (Mentor)', 'mentor_approved@hoctuthien.com', 'mentor', 'active', true, passwordHash]
      );
      console.log('✅ Mentor user created successfully.');
    } else {
      console.log('ℹ️ Mentor user already exists.');
    }

    // 2b. Kiểm tra Mentor Profile
    const checkProfile = await client.query('SELECT id FROM "mentor_profiles" WHERE user_id = $1', [mentorId]);
    if (checkProfile.rows.length === 0) {
      console.log(`Mentor Profile not found. Creating...`);
      await client.query(
        `INSERT INTO "mentor_profiles" (id, user_id, job_title, company, bio, years_of_experience, skills, is_approved, status, created_at, updated_at) 
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, NOW(), NOW())`,
        [
          crypto.randomUUID(),
          mentorId,
          'Senior Full Stack Engineer',
          'Học Tự Thiện Org',
          'Passionate developer and experienced mentor helping community.',
          8,
          JSON.stringify(['React', 'Next.js', 'NestJS', 'PostgreSQL', 'TypeScript']),
          true,
          'active'
        ]
      );
      console.log('✅ Mentor profile created successfully.');
    } else {
      console.log('ℹ️ Mentor profile already exists.');
    }

    // 3. Seed các khóa học được duyệt
    for (const c of approvedCourses) {
      console.log(`Seeding approved course: "${c.title}"...`);
      
      // Kiểm tra xem khóa học đã tồn tại chưa
      const checkCourse = await client.query(
        'SELECT id FROM "courses" WHERE title = $1 AND mentor_id = $2',
        [c.title, mentorId]
      );

      let courseId;
      if (checkCourse.rows.length === 0) {
        courseId = crypto.randomUUID();
        const metadata = {
          categoryName: c.categoryName,
          studentsCount: c.studentsCount,
          rating: c.rating,
          reviewsCount: c.reviewsCount
        };
        const prerequisites = ['Có kiến thức cơ bản về lập trình', 'Có máy tính cá nhân kết nối Internet'];

        await client.query(
          `INSERT INTO "courses" (id, mentor_id, approved_by, title, description, thumbnail_url, price, duration_minutes, prerequisites, metadata, status, created_at, updated_at)
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, NOW(), NOW())`,
          [
            courseId,
            mentorId,
            adminId,
            c.title,
            c.description,
            c.thumbnailUrl,
            c.price,
            60,
            JSON.stringify(prerequisites),
            JSON.stringify(metadata),
            'ACTIVE'
          ]
        );
        console.log(`✅ Seeded course "${c.title}" with ID: ${courseId}`);
      } else {
        courseId = checkCourse.rows[0].id;
        // Đảm bảo được approved bởi adminId và status ACTIVE
        await client.query(
          'UPDATE "courses" SET approved_by = $1, status = $2 WHERE id = $3',
          [adminId, 'ACTIVE', courseId]
        );
        console.log(`ℹ️ Course "${c.title}" already exists. Updated to ACTIVE & approvedBy: ${adminId}`);
      }

      // Link danh mục
      const checkCat = await client.query('SELECT id FROM "categories" WHERE slug = $1', [c.categorySlug]);
      if (checkCat.rows.length > 0) {
        const catId = checkCat.rows[0].id;
        const checkMapping = await client.query(
          'SELECT id FROM "course_categories" WHERE course_id = $1 AND category_id = $2',
          [courseId, catId]
        );
        if (checkMapping.rows.length === 0) {
          await client.query(
            'INSERT INTO "course_categories" (id, course_id, category_id, status, created_at, updated_at) VALUES ($1, $2, $3, $4, NOW(), NOW())',
            [crypto.randomUUID(), courseId, catId, 'active']
          );
          console.log(`   🔗 Linked course to category "${c.categoryName}"`);
        }
      }
    }

    console.log('\n🚀 Seeding approved courses completed successfully.');
  } catch (error) {
    console.error('Error during seed:', error);
  } finally {
    await client.end();
  }
}

main();
