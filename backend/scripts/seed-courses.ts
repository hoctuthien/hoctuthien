import { DataSource } from 'typeorm';
import { UserEntity, UserRole } from '../src/modules/user/entities/user.entity';
import { MentorProfileEntity } from '../src/modules/mentor-profile/entities/mentor-profile.entity';
import { CategoryEntity } from '../src/modules/category/entities/category.entity';
import { CourseEntity } from '../src/modules/course/entities/course.entity';
import { CourseCategoryEntity } from '../src/modules/course-category/entities/course-category.entity';
import { CourseStatus } from '../src/modules/course/enums/course-status.enum';
import { MentorProfileStatus } from '../src/modules/mentor-profile/enums/mentor-profile-status.enum';
import * as bcrypt from 'bcrypt';
import * as dotenv from 'dotenv';

dotenv.config();

const mockCoursesData = [
  {
    title: 'Lập trình Web Front-end nâng cao với React & Next.js',
    thumbnailUrl: 'https://images.unsplash.com/photo-1633356122544-f134324a6cee?auto=format&fit=crop&w=300&q=80',
    categorySlug: 'web-development',
    price: 499000,
    status: CourseStatus.ACTIVE,
    metadata: {
      categoryName: 'Lập trình Web',
      studentsCount: 245,
      rating: 4.8,
      reviewsCount: 84,
    },
  },
  {
    title: 'Thiết kế giao diện chuyên nghiệp với Figma cho người mới bắt đầu',
    thumbnailUrl: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=300&q=80',
    categorySlug: 'ui-ux-design',
    price: 0,
    status: CourseStatus.ACTIVE,
    metadata: {
      categoryName: 'UI/UX Design',
      studentsCount: 1540,
      rating: 4.9,
      reviewsCount: 312,
    },
  },
  {
    title: 'Cấu trúc dữ liệu và giải thuật trong Javascript',
    thumbnailUrl: 'https://images.unsplash.com/photo-1515879218367-8466d910aaa4?auto=format&fit=crop&w=300&q=80',
    categorySlug: 'programming-languages',
    price: 299000,
    status: CourseStatus.PENDING,
    metadata: {
      categoryName: 'Khoa học máy tính',
      studentsCount: 0,
      rating: 0,
      reviewsCount: 0,
    },
  },
  {
    title: 'TypeScript Cơ Bản Đến Nâng Cao cho Web Developers',
    thumbnailUrl: 'https://images.unsplash.com/photo-1516116211223-5c359a36298a?auto=format&fit=crop&w=300&q=80',
    categorySlug: 'web-development',
    price: 199000,
    status: CourseStatus.DRAFT,
    metadata: {
      categoryName: 'Lập trình Web',
      studentsCount: 45,
      rating: 4.5,
      reviewsCount: 12,
    },
  },
  {
    title: 'Xây dựng ứng dụng di động Hybrid với React Native',
    thumbnailUrl: 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?auto=format&fit=crop&w=300&q=80',
    categorySlug: 'mobile-apps',
    price: 599000,
    status: CourseStatus.INACTIVE,
    metadata: {
      categoryName: 'Lập trình di động',
      studentsCount: 0,
      rating: 0,
      reviewsCount: 0,
    },
  },
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
    ],
    synchronize: false,
  });

  try {
    await dataSource.initialize();
    console.log('Database connection established.');

    const userRepository = dataSource.getRepository(UserEntity);
    const mentorProfileRepository = dataSource.getRepository(MentorProfileEntity);
    const categoryRepository = dataSource.getRepository(CategoryEntity);
    const courseRepository = dataSource.getRepository(CourseEntity);
    const courseCategoryRepository = dataSource.getRepository(CourseCategoryEntity);

    // 1. Tạo hoặc lấy Mentor User
    const mentorEmail = 'mentor1@example.com';
    const mentorPassword = 'password123';
    let mentor = await userRepository.findOneBy({ email: mentorEmail });

    if (!mentor) {
      const passwordHash = await bcrypt.hash(mentorPassword, 10);
      mentor = userRepository.create({
        name: 'John Doe (Mentor)',
        email: mentorEmail,
        passwordHash,
        role: UserRole.MENTOR,
        isVerified: true,
        status: 'active',
      });
      mentor = await userRepository.save(mentor);
      console.log(`✅ Mentor user created: ${mentorEmail}`);
    } else {
      console.log(`ℹ️ Mentor user already exists: ${mentorEmail}`);
      if (mentor.role !== UserRole.MENTOR) {
        mentor.role = UserRole.MENTOR;
        mentor = await userRepository.save(mentor);
        console.log(`✅ Updated existing user role to MENTOR`);
      }
    }

    // 2. Tạo hoặc lấy Mentor Profile (Approved)
    let profile = await mentorProfileRepository.findOneBy({ userId: mentor.id });
    if (!profile) {
      profile = mentorProfileRepository.create({
        userId: mentor.id,
        jobTitle: 'Senior Full Stack Engineer',
        company: 'Học Tự Thiện Org',
        bio: 'Passionate developer and experienced mentor helping community.',
        yearsOfExperience: 8,
        skills: ['React', 'Next.js', 'NestJS', 'PostgreSQL', 'TypeScript'],
        isApproved: true,
        status: MentorProfileStatus.ACTIVE,
      });
      await mentorProfileRepository.save(profile);
      console.log(`✅ Approved Mentor Profile created for ${mentorEmail}`);
    } else {
      console.log(`ℹ️ Mentor Profile already exists for ${mentorEmail}`);
      if (!profile.isApproved || profile.status !== MentorProfileStatus.ACTIVE) {
        profile.isApproved = true;
        profile.status = MentorProfileStatus.ACTIVE;
        await mentorProfileRepository.save(profile);
        console.log(`✅ Mentor Profile approved & set to ACTIVE`);
      }
    }

    // 3. Nạp dữ liệu khóa học mẫu
    for (const cData of mockCoursesData) {
      // Tìm khóa học theo tiêu đề để tránh trùng lặp
      let course = await courseRepository.findOneBy({ title: cData.title, mentorId: mentor.id });

      if (!course) {
        course = courseRepository.create({
          mentorId: mentor.id,
          title: cData.title,
          description: `Khóa học chất lượng cao về ${cData.title}. Tự học dễ dàng, bài bản và hiệu quả cùng Mentor giàu kinh nghiệm.`,
          thumbnailUrl: cData.thumbnailUrl,
          price: cData.price,
          durationMinutes: 60,
          status: cData.status,
          metadata: cData.metadata,
          prerequisites: ['Có kiến thức cơ bản về lập trình', 'Có máy tính cá nhân kết nối Internet'],
        });
        course = await courseRepository.save(course);
        console.log(`✅ Course seeded: "${cData.title}"`);
      } else {
        console.log(`ℹ️ Course already exists: "${cData.title}"`);
      }

      // 4. Ánh xạ danh mục tương ứng
      const category = await categoryRepository.findOneBy({ slug: cData.categorySlug });
      if (category) {
        const existingMapping = await courseCategoryRepository.findOneBy({
          courseId: course.id,
          categoryId: category.id,
        });

        if (!existingMapping) {
          const mapping = courseCategoryRepository.create({
            courseId: course.id,
            categoryId: category.id,
            status: 'active',
          });
          await courseCategoryRepository.save(mapping);
          console.log(`   🔗 Linked course "${cData.title}" to category "${category.name}"`);
        }
      } else {
        console.warn(`   ⚠️ Category with slug "${cData.categorySlug}" not found. Please run seed:categories first.`);
      }
    }

    console.log('\n🚀 Seeding courses completed successfully.');
  } catch (error) {
    console.error('❌ Error during seeding courses:', error);
  } finally {
    await dataSource.destroy();
  }
}

seed();
