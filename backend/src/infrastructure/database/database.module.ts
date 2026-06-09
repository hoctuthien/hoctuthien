import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigService } from '@nestjs/config';

@Module({
  imports: [
    TypeOrmModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        type: 'postgres',
        // Dùng URL bạn đã có trong .env
        url: configService.get<string>('DATABASE_URL'),
        // Hoặc cấu hình rời:
        // host: '103.161.16.77',
        // port: 5432,
        // username: 'admin',
        // password: 'dungthaydoimatkhau',
        // database: 'hoctuthien_v1',

        // Tự động tìm các file .entity.ts trong folder modules
        entities: [__dirname + '/../../modules/**/*.entity{.ts,.js}'],

        synchronize: configService.get<boolean>('database.synchronize'), // Đọc từ biến môi trường
        logging: configService.get<string>('logLevel') === 'debug', // Chỉ in câu lệnh SQL khi LOG_LEVEL=debug
        ssl: false, // Nếu DB server yêu cầu SSL thì mới để true
        extra: {
          max: 20, // Số lượng connection tối đa trong pool (mặc định là 10)
          idleTimeoutMillis: 30000, // Thời gian (ms) đóng connection rảnh rỗi (mặc định 30s)
          connectionTimeoutMillis: 2000, // Thời gian chờ (ms) tối đa để lấy connection từ pool (mặc định 0 - chờ vô hạn)
        },
      }),
    }),
  ],
})
export class DatabaseModule {}
