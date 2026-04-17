import { Global, Module, Provider } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Redis from 'ioredis';

export const REDIS_CLIENT = 'REDIS_CLIENT';

const redisProvider: Provider = {
  provide: REDIS_CLIENT,
  useFactory: (configService: ConfigService) => {
    // Thêm giá trị mặc định hoặc ép kiểu để hết lỗi đỏ ở REDIS_URL
    const redisUrl = configService.get<string>('REDIS_URL');
    if (!redisUrl) {
      throw new Error('[Redis] REDIS_URL không tồn tại trong file .env');
    }
    return new Redis(redisUrl);
  },
  inject: [ConfigService],
};

@Global()
@Module({
  providers: [redisProvider],
  exports: [REDIS_CLIENT],
})
export class RedisModule {}
