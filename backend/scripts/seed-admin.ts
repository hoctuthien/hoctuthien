import { DataSource } from 'typeorm';
import { UserEntity, UserRole } from '../src/modules/user/entities/user.entity';
import * as bcrypt from 'bcrypt';
import * as dotenv from 'dotenv';

dotenv.config();

async function seed() {
  const dataSource = new DataSource({
    type: 'postgres',
    url: process.env.DATABASE_URL,
    entities: [UserEntity],
    synchronize: false,
  });

  try {
    await dataSource.initialize();
    console.log('Database connection established.');

    const userRepository = dataSource.getRepository(UserEntity);

    const adminEmail = 'admin@hoctuthien.com';
    const adminPassword = 'Admin@123'; // Bạn nên đổi mật khẩu này sau khi đăng nhập

    const existingAdmin = await userRepository.findOneBy({ email: adminEmail });

    if (!existingAdmin) {
      const hashedPassword = await bcrypt.hash(adminPassword, 10);
      const admin = userRepository.create({
        name: 'System Admin',
        email: adminEmail,
        passwordHash: hashedPassword,
        role: UserRole.ADMIN,
        isVerified: true,
        status: 'active',
      });

      await userRepository.save(admin);
      console.log('✅ Admin account created successfully!');
      console.log(`📧 Email: ${adminEmail}`);
      console.log(`🔑 Password: ${adminPassword}`);
    } else {
      console.log('ℹ️ Admin account already exists.');
      
      // Đảm bảo role là ADMIN nếu đã tồn tại
      if (existingAdmin.role !== UserRole.ADMIN) {
        existingAdmin.role = UserRole.ADMIN;
        await userRepository.save(existingAdmin);
        console.log('✅ Updated existing user to ADMIN role.');
      }
    }
  } catch (error) {
    console.error('❌ Error during seeding admin:', error);
  } finally {
    await dataSource.destroy();
  }
}

seed();
