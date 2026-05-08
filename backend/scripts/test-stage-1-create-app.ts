import { DataSource } from 'typeorm';
import { MentorAvailabilityEntity } from '../src/modules/mentor-availability/entities/mentor-availability.entity';
import { MentorAvailabilityStatus } from '../src/common/enums/mentor-availability-status.enum';
import { UserEntity } from '../src/modules/user/entities/user.entity';
import * as dotenv from 'dotenv';

dotenv.config();

async function run() {
  const dataSource = new DataSource({
    type: 'postgres',
    url: process.env.DATABASE_URL,
    entities: [MentorAvailabilityEntity, UserEntity],
    synchronize: false,
  });

  const menteeId = '6c99612d-25f0-49c3-813c-0e2e4877fb9f';

  try {
    await dataSource.initialize();
    console.log('Database connection established.');

    const userRepo = dataSource.getRepository(UserEntity);
    const mentee = await userRepo.findOneBy({ id: menteeId });

    if (!mentee) {
      console.error(`❌ Mentee with ID ${menteeId} not found. Please create the user first.`);
      return;
    }

    const appRepo = dataSource.getRepository(MentorAvailabilityEntity);
    
    // Xóa các đơn cũ nếu có để test sạch
    await appRepo.delete({ mentorId: menteeId });

    const newApp = appRepo.create({
      mentorId: menteeId,
      jobTitle: 'Senior Software Engineer',
      company: 'Tech Solutions Inc.',
      bio: 'Tôi có 10 năm kinh nghiệm trong ngành và muốn chia sẻ kiến thức với cộng đồng.',
      skills: ['TypeScript', 'NestJS', 'PostgreSQL', 'System Design'],
      yearsOfExperience: 10,
      linkedinUrl: 'https://linkedin.com/in/test-mentor',
      status: 'PENDING' as any, // Dùng string vì enum có thể khác tùy version
    });

    await appRepo.save(newApp);
    console.log('✅ GIAI ĐOẠN 1 HOÀN TẤT: Đã tạo đơn đăng ký MENTOR ở trạng thái PENDING.');
    console.log(`🆔 Application ID: ${newApp.id}`);
    console.log(`👤 Mentor (User) ID: ${newApp.mentorId}`);
    console.log('\nBây giờ bạn có thể check bảng mentor_availabilities trong DB.');

  } catch (error) {
    console.error('❌ Lỗi:', error);
  } finally {
    await dataSource.destroy();
  }
}

run();
