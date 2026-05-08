import { DataSource } from 'typeorm';
import { MentorAvailabilityEntity } from '../src/modules/mentor-availability/entities/mentor-availability.entity';
import { UserEntity, UserRole } from '../src/modules/user/entities/user.entity';
import { MentorProfileEntity } from '../src/modules/mentor-profile/entities/mentor-profile.entity';
import { MentorProfileStatus } from '../src/modules/mentor-profile/enums/mentor-profile-status.enum';
import * as dotenv from 'dotenv';

dotenv.config();

const delay = (ms: number) => new Promise(res => setTimeout(res, ms));

async function run() {
  const dataSource = new DataSource({
    type: 'postgres',
    url: process.env.DATABASE_URL,
    entities: [MentorAvailabilityEntity, UserEntity, MentorProfileEntity],
    synchronize: false,
  });

  const adminId = 'fb00613c-14ef-4702-b797-6969fcbd5bfb';
  const menteeId = '6c99612d-25f0-49c3-813c-0e2e4877fb9f';

  try {
    await dataSource.initialize();
    console.log('\n🚀 BẮT ĐẦU QUY TRÌNH KIỂM TRA TOÀN BỘ (FULL FLOW TEST)');
    console.log('---------------------------------------------------');

    const appRepo = dataSource.getRepository(MentorAvailabilityEntity);
    const userRepo = dataSource.getRepository(UserEntity);

    // --- GIAI ĐOẠN 1 ---
    console.log('\n[GIAI ĐOẠN 1]: Mentee gửi đơn đăng ký làm Mentor...');
    await appRepo.delete({ mentorId: menteeId }); // Dọn dẹp data cũ
    
    const newApp = appRepo.create({
      mentorId: menteeId,
      jobTitle: 'Senior Software Engineer',
      company: 'Tech Solutions Inc.',
      bio: 'Tôi muốn chia sẻ kiến thức về NestJS.',
      skills: ['TypeScript', 'NestJS'],
      yearsOfExperience: 10,
      status: 'PENDING' as any,
    });
    await appRepo.save(newApp);
    console.log('✅ TRẠNG THÁI: Đã tạo đơn PENDING thành công.');
    
    await delay(2000);

    // --- GIAI ĐOẠN 2 ---
    console.log('\n[GIAI ĐOẠN 2]: Admin tiếp nhận đơn để xem xét...');
    const appToProcess = await appRepo.findOneBy({ mentorId: menteeId, status: 'PENDING' as any });
    if (appToProcess) {
      appToProcess.status = 'IN_PROGRESS' as any;
      appToProcess.approvedBy = adminId;
      await appRepo.save(appToProcess);
      console.log('✅ TRẠNG THÁI: Đơn đã chuyển sang IN_PROGRESS (Admin đang xử lý).');
    }

    await delay(2000);

    // --- GIAI ĐOẠN 3 ---
    console.log('\n[GIAI ĐOẠN 3]: Admin phê duyệt đơn và kích hoạt hệ thống...');
    await dataSource.transaction(async (manager) => {
      const appToApprove = await manager.findOne(MentorAvailabilityEntity, {
        where: { mentorId: menteeId, status: 'IN_PROGRESS' as any }
      });

      if (appToApprove) {
        // Phê duyệt đơn
        appToApprove.status = 'APPROVED' as any;
        await manager.save(MentorAvailabilityEntity, appToApprove);
        console.log('   -> 1. Đơn đăng ký: APPROVED');

        // Đổi Role
        const user = await manager.findOne(UserEntity, { where: { id: menteeId } });
        if (user) {
          user.role = UserRole.MENTOR;
          await manager.save(UserEntity, user);
          console.log('   -> 2. Quyền người dùng: MENTEE -> MENTOR');
        }

        // Tạo/Sync Profile
        let profile = await manager.findOne(MentorProfileEntity, { where: { userId: menteeId } });
        if (!profile) {
          profile = manager.create(MentorProfileEntity, { 
            userId: menteeId,
            status: MentorProfileStatus.ACTIVE 
          });
        }
        profile.jobTitle = appToApprove.jobTitle;
        profile.company = appToApprove.company;
        profile.bio = appToApprove.bio;
        profile.linkedinUrl = appToApprove.linkedinUrl;
        profile.yearsOfExperience = appToApprove.yearsOfExperience;
        profile.skills = appToApprove.skills;
        profile.isApproved = true;
        profile.approvedBy = adminId;
        profile.status = MentorProfileStatus.ACTIVE;
        await manager.save(MentorProfileEntity, profile);

        console.log('   -> 3. Mentor Profile: Đã tạo và ở trạng thái ACTIVE');
      }
    });

    console.log('\n---------------------------------------------------');
    console.log('🎉 TẤT CẢ GIAI ĐOẠN ĐÃ HOÀN TẤT THÀNH CÔNG!');
    console.log('Dữ liệu trong DB của bạn hiện đã được cập nhật hoàn chỉnh.\n');

  } catch (error) {
    console.error('\n❌ LỖI TRONG QUÁ TRÌNH CHẠY:', error);
  } finally {
    await dataSource.destroy();
  }
}

run();
