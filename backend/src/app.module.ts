import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ScheduleModule } from '@nestjs/schedule';
import { EventEmitterModule } from '@nestjs/event-emitter';
import envConfig from './config/env.config';
import { validateEnv } from './config/validation';
import { DatabaseModule } from './infrastructure/database/database.module';
import { UserModule } from './modules/user/user.module';
import { AuthModule } from './modules/auth/auth.module';
import { RedisModule } from './modules/redis/redis.module';
import { UserSessionModule } from './modules/user-session/user-session.module';
import { MentorProfileModule } from './modules/mentor-profile/mentor-profile.module';
import { MentorAvailabilityModule } from './modules/mentor-availability/mentor-availability.module';
import { CategoryModule } from './modules/category/category.module';
import { CourseModule } from './modules/course/course.module';
import { CourseCategoryModule } from './modules/course-category/course-category.module';
import { CourseBookingModule } from './modules/course-booking/course-booking.module';
import { CourseReviewModule } from './modules/course-review/course-review.module';
import { UserReviewModule } from './modules/user-review/user-review.module';
import { PaymentModule } from './modules/payment/payment.module';
import { PenaltyTicketModule } from './modules/penalty-ticket/penalty-ticket.module';
import { SystemConfigModule } from './modules/system-config/system-config.module';
import { ConversationModule } from './modules/conversation/conversation.module';
import { MessageModule } from './modules/message/message.module';
import { NotificationModule } from './modules/notification/notification.module';
import { MediaModule } from './modules/media/media.module';
import { PostModule } from './modules/post/post.module';
import { TagModule } from './modules/tag/tag.module';
import { TraceIdMiddleware } from './common/middlewares/trace-id.middleware';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { GraphQLModule } from '@nestjs/graphql';
import { ApolloDriver, ApolloDriverConfig } from '@nestjs/apollo';
import { join } from 'path';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [envConfig],
      validate: validateEnv,
    }),
    GraphQLModule.forRoot<ApolloDriverConfig>({
      driver: ApolloDriver,
      autoSchemaFile: join(process.cwd(), 'src/schema.gql'),
      sortSchema: true,
      playground: process.env.NODE_ENV !== 'production',
      context: ({ req, res }) => ({ req, res }),
    }),
    ScheduleModule.forRoot(),
    EventEmitterModule.forRoot(),
    DatabaseModule,
    RedisModule,
    AuthModule,
    UserModule,
    UserSessionModule,
    MentorProfileModule,
    MentorAvailabilityModule,
    CategoryModule,
    CourseModule,
    CourseCategoryModule,
    CourseBookingModule,
    CourseReviewModule,
    UserReviewModule,
    PaymentModule,
    PenaltyTicketModule,
    SystemConfigModule,
    ConversationModule,
    MessageModule,
    NotificationModule,
    MediaModule,
    PostModule,
    TagModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(TraceIdMiddleware).forRoutes('*');
  }
}
