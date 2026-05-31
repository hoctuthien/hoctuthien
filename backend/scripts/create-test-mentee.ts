import { DataSource } from 'typeorm';
import { UserEntity, UserRole } from '../src/modules/user/entities/user.entity';
import * as bcrypt from 'bcrypt';
import * as dotenv from 'dotenv';
import * as path from 'path';

dotenv.config({ path: path.join(__dirname, '../.env') });

async function run() {
  const dataSource = new DataSource({
    type: 'postgres',
    url: process.env.DATABASE_URL,
    entities: [UserEntity],
    synchronize: false,
  });

  await dataSource.initialize();
  console.log('Connected to database.');

  const userRepo = dataSource.getRepository(UserEntity);
  const email = 'mentee_test@hoctuthien.com';
  const password = 'password123';

  // Xóa tài khoản cũ nếu đã tồn tại để tránh xung đột
  const existingUser = await userRepo.findOneBy({ email });
  if (existingUser) {
    await userRepo.remove(existingUser);
    console.log('Removed existing test mentee.');
  }

  const hashedPassword = await bcrypt.hash(password, 10);
  const newMentee = userRepo.create({
    name: 'Mentee Test Account',
    email,
    passwordHash: hashedPassword,
    role: UserRole.MENTEE,
    status: 'active',
    isVerified: true,
  });

  const saved = await userRepo.save(newMentee);
  console.log('\n✅ CREATE TEST MENTEE SUCCESSFUL!');
  console.log(`📧 Email: ${saved.email}`);
  console.log(`🔑 Password: ${password}`);
  console.log(`👤 Role: ${saved.role}`);
  console.log(`🆔 ID: ${saved.id}`);

  await dataSource.destroy();
}

run().catch(console.error);
