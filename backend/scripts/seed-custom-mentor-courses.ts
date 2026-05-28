import { DataSource } from 'typeorm';
import { UserEntity, UserRole } from '../src/modules/user/entities/user.entity';
import { MentorProfileEntity } from '../src/modules/mentor-profile/entities/mentor-profile.entity';
import { CategoryEntity } from '../src/modules/category/entities/category.entity';
import { CourseEntity } from '../src/modules/course/entities/course.entity';
import { CourseCategoryEntity } from '../src/modules/course-category/entities/course-category.entity';
import { GroupCategoryEntity } from '../src/modules/group-category/entities/group-category.entity';
import { CourseStatus } from '../src/modules/course/enums/course-status.enum';
import { MentorProfileStatus } from '../src/modules/mentor-profile/enums/mentor-profile-status.enum';
import * as dotenv from 'dotenv';

dotenv.config();

const TARGET_MENTOR_ID = '9011ac57-83e9-4685-9436-04eafab08d64';

const mockCoursesData = [
  {
    title: 'Lập trình NestJS & TypeScript từ cơ bản đến nâng cao',
    description: 'Khóa học cung cấp nền tảng vững chắc về NestJS framework, kiến trúc Modules, Providers, Controllers, cách tích hợp TypeORM/Drizzle và làm chủ TypeScript chuyên sâu.',
    thumbnailUrl: 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?auto=format&fit=crop&w=600&q=80',
    price: 399000,
    durationMinutes: 480,
    status: CourseStatus.ACTIVE,
    prerequisites: ['Đã có kiến thức cơ bản về JavaScript và Node.js', 'Biết sơ bộ về lập trình hướng đối tượng (OOP)'],
    metadata: {
      level: 'Trung cấp',
      badge: 'Bán chạy',
      lectureCount: 32,
    }
  },
  {
    title: 'Lập trình Frontend hiện đại với React & Next.js App Router',
    description: 'Xây dựng website hiệu năng cao với Next.js App Router, Server Components, Client Components, quản lý State và tối ưu hóa SEO tối đa.',
    thumbnailUrl: 'https://images.unsplash.com/photo-1633356122544-f134324a6cee?auto=format&fit=crop&w=600&q=80',
    price: 499000,
    durationMinutes: 600,
    status: CourseStatus.ACTIVE,
    prerequisites: ['Thành thạo HTML, CSS và JavaScript cơ bản', 'Đã cài đặt sẵn Node.js trên máy tính'],
    metadata: {
      level: 'Nâng cao',
      badge: 'Nổi bật',
      lectureCount: 45,
    }
  },
  {
    title: 'Xây dựng ứng dụng Web Responsive với Tailwind CSS',
    description: 'Học cách thiết kế giao diện cực nhanh, đẹp mắt và tối ưu trên mọi màn hình sử dụng Utility-First CSS Framework - Tailwind CSS.',
    thumbnailUrl: 'https://images.unsplash.com/photo-1507238691740-187a5b1d37b8?auto=format&fit=crop&w=600&q=80',
    price: 0, // Free course
    durationMinutes: 180,
    status: CourseStatus.ACTIVE,
    prerequisites: ['Kiến thức cơ bản về HTML & CSS'],
    metadata: {
      level: 'Cơ bản',
      badge: 'Miễn phí',
      lectureCount: 15,
    }
  },
  {
    title: 'Làm chủ cơ sở dữ liệu PostgreSQL và TypeORM trong dự án thực tế',
    description: 'Thiết kế cơ sở dữ liệu chuẩn, tối ưu hóa câu lệnh query, sử dụng index hiệu quả và kết nối TypeORM bền bỉ trong NestJS.',
    thumbnailUrl: 'https://images.unsplash.com/photo-1544383835-bda2bc66a55d?auto=format&fit=crop&w=600&q=80',
    price: 299000,
    durationMinutes: 360,
    status: CourseStatus.ACTIVE,
    prerequisites: ['Biết sơ bộ về cơ sở dữ liệu quan hệ', 'Đã có tài khoản Postgres hoặc cài đặt Postgres local'],
    metadata: {
      level: 'Trung cấp',
      badge: 'Mới ra mắt',
      lectureCount: 24,
    }
  },
  {
    title: 'Docker & Microservices cho Web Developers',
    description: 'Học cách container hóa ứng dụng, viết docker-compose, quản lý các dịch vụ độc lập và triển khai hệ thống microservices hoàn chỉnh.',
    thumbnailUrl: 'https://images.unsplash.com/photo-1607799279861-4dd421887fb3?auto=format&fit=crop&w=600&q=80',
    price: 599000,
    durationMinutes: 420,
    status: CourseStatus.ACTIVE,
    prerequisites: ['Đã có kiến thức phát triển Web App nói chung', 'Biết sơ bộ về Git và Linux terminal'],
    metadata: {
      level: 'Nâng cao',
      badge: 'Khuyên dùng',
      lectureCount: 28,
    }
  },
  {
    title: 'Cấu trúc dữ liệu và giải thuật thực chiến với JavaScript',
    description: 'Rèn luyện tư duy thuật toán, cách phân tích độ phức tạp thời gian O(n) và giải quyết các bài toán phỏng vấn phổ biến tại các công ty công nghệ.',
    thumbnailUrl: 'https://images.unsplash.com/photo-1515879218367-8466d910aaa4?auto=format&fit=crop&w=600&q=80',
    price: 349000,
    durationMinutes: 540,
    status: CourseStatus.ACTIVE,
    prerequisites: ['Nắm vững cú pháp cơ bản của JavaScript'],
    metadata: {
      level: 'Cơ bản',
      badge: 'Tư duy thuật toán',
      lectureCount: 38,
    }
  },
  {
    title: 'Kỹ năng mềm và Lộ trình thăng tiến cho Lập trình viên',
    description: 'Cách viết CV thu hút nhà tuyển dụng, kỹ năng giao tiếp trong team, làm việc cùng Product Manager, cách deal lương và chuẩn bị cho kỳ Performance Review.',
    thumbnailUrl: 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&w=600&q=80',
    price: 0, // Free course
    durationMinutes: 120,
    status: CourseStatus.ACTIVE,
    prerequisites: ['Phù hợp với mọi lập trình viên từ Intern, Fresher đến Junior'],
    metadata: {
      level: 'Cơ bản',
      badge: 'Cộng đồng',
      lectureCount: 10,
    }
  },
  {
    title: 'Xây dựng hệ thống Chat Realtime với WebSockets & Redis',
    description: 'Thiết kế hệ thống giao tiếp thời gian thực đáng tin cậy, quản lý phòng chat, lưu trữ trạng thái người dùng online/offline với Redis Pub/Sub.',
    thumbnailUrl: 'https://images.unsplash.com/photo-1579202673506-ca3ce28943ef?auto=format&fit=crop&w=600&q=80',
    price: 450000,
    durationMinutes: 300,
    status: CourseStatus.ACTIVE,
    prerequisites: ['Đã có kiến thức lập trình backend với Node.js', 'Hiểu giao thức HTTP cơ bản'],
    metadata: {
      level: 'Nâng cao',
      badge: 'Chuyên sâu',
      lectureCount: 18,
    }
  },
  {
    title: 'Ứng dụng AI và LLM (Large Language Models) tối ưu năng suất coding',
    description: 'Cách tận dụng tối đa GitHub Copilot, ChatGPT, Claude và các AI assistants để viết code, test cases, giải quyết bugs cực nhanh.',
    thumbnailUrl: 'https://images.unsplash.com/photo-1677442136019-21780efad99a?auto=format&fit=crop&w=600&q=80',
    price: 199000,
    durationMinutes: 240,
    status: CourseStatus.ACTIVE,
    prerequisites: ['Đã biết viết code cơ bản ở một ngôn ngữ bất kỳ'],
    metadata: {
      level: 'Trung cấp',
      badge: 'Xu hướng',
      lectureCount: 12,
    }
  },
  {
    title: 'Lập trình ứng dụng di động đa nền tảng với React Native',
    description: 'Học cách xây dựng một ứng dụng iOS và Android từ một source code duy nhất, tối ưu native components và triển khai lên App Store/Google Play.',
    thumbnailUrl: 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?auto=format&fit=crop&w=600&q=80',
    price: 549000,
    durationMinutes: 480,
    status: CourseStatus.ACTIVE,
    prerequisites: ['Thành thạo lập trình JavaScript/React cơ bản'],
    metadata: {
      level: 'Nâng cao',
      badge: 'Di động',
      lectureCount: 30,
    }
  }
];

async function seed() {
  const dataSource = new DataSource({
    type: 'postgres',
    url: process.env.DATABASE_URL,
    entities: [
      UserEntity,
      MentorProfileEntity,
      CategoryEntity,
      CourseEntity,
      CourseCategoryEntity,
      GroupCategoryEntity,
    ],
    synchronize: false,
    logging: false,
  });

  try {
    await dataSource.initialize();
    console.log('🔌 Kết nối Database thành công.\n');

    const userRepository = dataSource.getRepository(UserEntity);
    const mentorProfileRepository = dataSource.getRepository(MentorProfileEntity);
    const categoryRepository = dataSource.getRepository(CategoryEntity);
    const courseRepository = dataSource.getRepository(CourseEntity);
    const courseCategoryRepository = dataSource.getRepository(CourseCategoryEntity);

    // 1. Kiểm tra hoặc tạo Mentor User
    let mentor = await userRepository.findOneBy({ id: TARGET_MENTOR_ID });

    if (!mentor) {
      console.log(`👤 Không tìm thấy User với ID "${TARGET_MENTOR_ID}". Đang tạo mới...`);
      mentor = userRepository.create({
        id: TARGET_MENTOR_ID,
        name: 'Mentor Thang (Custom)',
        email: 'ngocthang.mentor@hoctuthien.com',
        passwordHash: null,
        role: UserRole.MENTOR,
        isVerified: true,
        status: 'active',
      });
      mentor = await userRepository.save(mentor);
      console.log(`✅ Đã tạo mới Mentor User thành công.`);
    } else {
      console.log(`ℹ️ Mentor User đã tồn tại với tên: "${mentor.name}" (${mentor.email})`);
      if (mentor.role !== UserRole.MENTOR) {
        mentor.role = UserRole.MENTOR;
        mentor = await userRepository.save(mentor);
        console.log(`✅ Đã cập nhật role của User thành MENTOR.`);
      }
    }

    // 2. Kiểm tra hoặc tạo Mentor Profile
    let profile = await mentorProfileRepository.findOneBy({ userId: TARGET_MENTOR_ID });
    if (!profile) {
      console.log(`🛠️ Đang tạo Mentor Profile cho Mentor ID "${TARGET_MENTOR_ID}"...`);
      profile = mentorProfileRepository.create({
        userId: TARGET_MENTOR_ID,
        jobTitle: 'Senior Full Stack Developer',
        company: 'Học Tự Thiện',
        bio: 'Chào mọi người, mình là mentor của Học Tự Thiện. Rất vui được đồng hành cùng các bạn chia sẻ tri thức cộng đồng.',
        yearsOfExperience: 10,
        skills: ['React', 'Next.js', 'NestJS', 'PostgreSQL', 'TypeScript', 'Docker'],
        isApproved: true,
        status: MentorProfileStatus.ACTIVE,
      });
      await mentorProfileRepository.save(profile);
      console.log(`✅ Đã tạo Mentor Profile đã phê duyệt thành công.`);
    } else {
      console.log(`ℹ️ Mentor Profile đã tồn tại.`);
      if (!profile.isApproved || profile.status !== MentorProfileStatus.ACTIVE) {
        profile.isApproved = true;
        profile.status = MentorProfileStatus.ACTIVE;
        await mentorProfileRepository.save(profile);
        console.log(`✅ Đã cập nhật Mentor Profile thành trạng thái APPROVED & ACTIVE.`);
      }
    }

    // 3. Lấy tất cả các danh mục để liên kết (fallback về danh mục mặc định nếu không có)
    const categories = await categoryRepository.find();
    let defaultCategory = categories.find(c => c.slug === 'web-development');
    if (!defaultCategory && categories.length > 0) {
      defaultCategory = categories[0];
    }

    if (categories.length === 0) {
      console.log('⚠️ Cảnh báo: Không tìm thấy danh mục (category) nào trong database!');
      console.log('Vui lòng chạy "npm run seed:categories" trước để nạp danh mục mẫu.');
      console.log('Tạm thời sẽ bỏ qua phần liên kết danh mục.');
    } else {
      console.log(`📊 Đã tìm thấy ${categories.length} danh mục con trong database.`);
    }

    // 4. Tạo các khóa học
    let createdCount = 0;
    let existedCount = 0;
    let updatedCount = 0;

    for (let i = 0; i < mockCoursesData.length; i++) {
      const cData = mockCoursesData[i];
      let course = await courseRepository.findOneBy({ title: cData.title, mentorId: TARGET_MENTOR_ID });

      if (!course) {
        course = courseRepository.create({
          mentorId: TARGET_MENTOR_ID,
          title: cData.title,
          description: cData.description,
          thumbnailUrl: cData.thumbnailUrl,
          price: cData.price,
          durationMinutes: cData.durationMinutes,
          status: cData.status,
          metadata: cData.metadata,
          prerequisites: cData.prerequisites,
          approvedBy: mentor.id, // ĐẶT ADMIN PHÊ DUYỆT (BẮT BUỘC ĐỂ HIỂN THỊ CÔNG KHAI)
        });
        course = await courseRepository.save(course);
        createdCount++;
        console.log(`[${i + 1}/10] ✅ Đã tạo khóa học (Đã duyệt): "${cData.title}"`);
      } else {
        existedCount++;
        console.log(`[${i + 1}/10] ℹ️ Khóa học đã tồn tại: "${cData.title}"`);
        
        // Cập nhật approvedBy cho các khóa học đã tồn tại nhưng chưa có approvedBy
        if (!course.approvedBy || course.status !== CourseStatus.ACTIVE) {
          course.approvedBy = mentor.id;
          course.status = CourseStatus.ACTIVE;
          await courseRepository.save(course);
          updatedCount++;
          console.log(`     🛠️ Đã cập nhật trạng thái phê duyệt (approvedBy) cho khóa học.`);
        }
      }

      // Liên kết danh mục
      if (categories.length > 0 && course) {
        // Chọn danh mục theo title để cho hợp lý
        let matchedCategory = defaultCategory;
        if (cData.title.toLowerCase().includes('react') || cData.title.toLowerCase().includes('tailwind') || cData.title.toLowerCase().includes('frontend')) {
          matchedCategory = categories.find(c => c.slug === 'web-development') || categories.find(c => c.name.toLowerCase().includes('web')) || defaultCategory;
        } else if (cData.title.toLowerCase().includes('postgres') || cData.title.toLowerCase().includes('nestjs') || cData.title.toLowerCase().includes('websocket')) {
          matchedCategory = categories.find(c => c.slug === 'web-development') || categories.find(c => c.name.toLowerCase().includes('backend')) || defaultCategory;
        } else if (cData.title.toLowerCase().includes('native') || cData.title.toLowerCase().includes('di động')) {
          matchedCategory = categories.find(c => c.slug === 'mobile-apps') || categories.find(c => c.name.toLowerCase().includes('di động')) || defaultCategory;
        } else if (cData.title.toLowerCase().includes('ai') || cData.title.toLowerCase().includes('trí tuệ')) {
          matchedCategory = categories.find(c => c.slug === 'ai-data-science') || categories.find(c => c.name.toLowerCase().includes('ai')) || defaultCategory;
        }

        if (matchedCategory) {
          const existingMapping = await courseCategoryRepository.findOneBy({
            courseId: course.id,
            categoryId: matchedCategory.id,
          });

          if (!existingMapping) {
            const mapping = courseCategoryRepository.create({
              courseId: course.id,
              categoryId: matchedCategory.id,
              status: 'active',
            });
            await courseCategoryRepository.save(mapping);
            console.log(`    🔗 Đã liên kết khóa học vào danh mục: "${matchedCategory.name}"`);
          }
        }
      }
    }

    console.log('\n======================================');
    console.log(`🎉 HOÀN THÀNH SEED DỮ LIỆU KHÓA HỌC!`);
    console.log(`- Đã thêm mới: ${createdCount} khóa học`);
    console.log(`- Đã cập nhật duyệt: ${updatedCount} khóa học`);
    console.log(`- Đã bỏ qua (đã tồn tại & đã duyệt): ${existedCount - updatedCount} khóa học`);
    console.log(`- Toàn bộ đều thuộc về Mentor ID: "${TARGET_MENTOR_ID}"`);
    console.log('======================================\n');

  } catch (error) {
    console.error('❌ Lỗi trong quá trình seed dữ liệu:', error);
  } finally {
    if (dataSource.isInitialized) {
      await dataSource.destroy();
    }
  }
}

seed();
