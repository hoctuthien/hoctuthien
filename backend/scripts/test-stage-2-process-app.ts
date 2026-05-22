import { DataSource } from 'typeorm';
import { MentorAvailabilityEntity } from '../src/modules/mentor-availability/entities/mentor-availability.entity';
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

  const adminId = 'fb00613c-14ef-4702-b797-6969fcbd5bfb';
  const menteeId = '6c99612d-25f0-49c3-813c-0e2e4877fb9f';

  try {
    await dataSource.initialize();
    console.log('Database connection established.');

    const appRepo = dataSource.getRepository(MentorAvailabilityEntity);
    const application = await appRepo.findOneBy({ mentorId: menteeId, status: 'PENDING' as any });

    if (!application) {
      console.error('❌ Không tìm thấy đơn nào ở trạng thái PENDING cho user này. Hãy chạy Giai đoạn 1 trước.');
      return;
    }

    application.status = 'IN_PROGRESS' as any;
    application.approvedBy = adminId;

    await appRepo.save(application);
    console.log('✅ GIAI ĐOẠN 2 HOÀN TẤT: Admin đã tiếp nhận đơn và chuyển sang IN_PROGRESS.');
    console.log(`🆔 Application ID: ${application.id}`);
    console.log(`👨‍💼 Admin phụ trách: ${adminId}`);
    console.log('\nBây giờ bạn có thể check lại status và approved_by trong DB.');

  } catch (error) {
    console.error('❌ Lỗi:', error);
  } finally {
    await dataSource.destroy();
  }
}

run();
