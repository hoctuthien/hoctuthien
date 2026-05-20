import { DataSource } from 'typeorm';
import { MentorAvailabilityEntity } from '../src/modules/mentor-availability/entities/mentor-availability.entity';
import { UserEntity, UserRole } from '../src/modules/user/entities/user.entity';
import { MentorProfileEntity } from '../src/modules/mentor-profile/entities/mentor-profile.entity';
import { MentorProfileStatus } from '../src/modules/mentor-profile/enums/mentor-profile-status.enum';
import * as dotenv from 'dotenv';

dotenv.config();

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
    console.log('Database connection established.');

    await dataSource.transaction(async (manager) => {
      // 1. Tìm đơn đang ở trạng thái IN_PROGRESS
      const application = await manager.findOne(MentorAvailabilityEntity, {
        where: { mentorId: menteeId, status: 'IN_PROGRESS' as any }
      });

      if (!application) {
        throw new Error('Không tìm thấy đơn ở trạng thái IN_PROGRESS. Hãy chạy Giai đoạn 2 trước.');
      }

      // 2. Cập nhật trạng thái đơn thành APPROVED
      application.status = 'APPROVED' as any;
      application.note = 'Đơn đăng ký của bạn đã được duyệt. Chào mừng bạn đến với đội ngũ mentor!';
      await manager.save(MentorAvailabilityEntity, application);
      console.log('Step 1: Mentor Availability status -> APPROVED');

      // 3. Cập nhật Role của User thành MENTOR
      const user = await manager.findOne(UserEntity, { where: { id: menteeId } });
      if (user) {
        user.role = UserRole.MENTOR;
        await manager.save(UserEntity, user);
        console.log('Step 2: User Role -> MENTOR');
      }

      // 4. Tạo hoặc Cập nhật Mentor Profile
      let profile = await manager.findOne(MentorProfileEntity, { where: { userId: menteeId } });
      if (!profile) {
        profile = manager.create(MentorProfileEntity, { 
          userId: menteeId,
          status: MentorProfileStatus.ACTIVE 
        });
        console.log('Step 3: Creating new Mentor Profile...');
      } else {
        console.log('Step 3: Updating existing Mentor Profile...');
      }

      profile.jobTitle = application.jobTitle;
      profile.company = application.company;
      profile.bio = application.bio;
      profile.linkedinUrl = application.linkedinUrl;
      profile.yearsOfExperience = application.yearsOfExperience;
      profile.skills = application.skills;
      profile.isApproved = true;
      profile.approvedBy = adminId;
      profile.status = MentorProfileStatus.ACTIVE;

      await manager.save(MentorProfileEntity, profile);
      console.log('Step 4: Mentor Profile synchronized and activated.');
    });

    console.log('\n✅ GIAI ĐOẠN 3 HOÀN TẤT: Quy trình phê duyệt đã thực hiện thành công!');
    console.log('\nBây giờ bạn hãy kiểm tra 3 bảng sau trong DB:');
    console.log('1. mentor_availabilities: status là APPROVED.');
    console.log('2. users: role là mentor.');
    console.log('3. mentor_profiles: thông tin đã được đồng bộ và status là ACTIVE.');

  } catch (error) {
    console.error('❌ Lỗi:', error.message);
  } finally {
    await dataSource.destroy();
  }
}

run();
