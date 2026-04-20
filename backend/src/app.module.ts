import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import envConfig from './config/env.config';
import { validateEnv } from './config/validation';
import { DatabaseModule } from './infrastructure/database/database.module';
import { UserModule } from './modules/user/user.module';
<<<<<<< HEAD
import { AuthModule } from './modules/auth/auth.module';
import { RedisModule } from './modules/redis/redis.module';
=======
import { UserSessionModule } from './modules/user-session/user-session.module';
import { TraceIdMiddleware } from './common/middlewares/trace-id.middleware';

>>>>>>> ce598f2d495d7208aed91c602bc63b5453fe71f4

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [envConfig],
      validate: validateEnv,
    }),
    DatabaseModule,
    UserModule,
<<<<<<< HEAD
    AuthModule,
    RedisModule,
=======
    UserSessionModule,
>>>>>>> ce598f2d495d7208aed91c602bc63b5453fe71f4
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(TraceIdMiddleware).forRoutes('*');
  }
}
