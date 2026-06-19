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
import { GroupCategoryModule } from './modules/group-category/group-category.module';
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
import { LoggerModule } from './common/logger/logger.module';
import { CorrelationIdMiddleware } from './common/middlewares/correlation-id.middleware';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { GraphQLModule } from '@nestjs/graphql';
import { ApolloDriver, ApolloDriverConfig } from '@nestjs/apollo';
import { join } from 'path';
import { StartupSeedService } from './infrastructure/bootstrap/startup-seed.service';
import { MailModule } from './modules/mail/mail.module';
import { BugReportModule } from './modules/bug-report/bug-report.module';

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
      formatError: (error: any) => {
        const originalError = error.extensions?.originalError as any;
        let code = 'INTERNAL_SERVER_ERROR';
        let message = error.message;
        let details: any = null;
        let statusCode = 500;
        if (originalError) {
          statusCode = originalError.statusCode || 400;
          if (statusCode === 400) {
            code = 'VALIDATION_FAILED';
            details = originalError.message;
          } else if (statusCode === 401) {
            code = 'UNAUTHORIZED';
          } else if (statusCode === 403) {
            code = 'FORBIDDEN';
          } else if (statusCode === 404) {
            code = 'NOT_FOUND';
          } else if (statusCode === 409) {
            code = 'CONFLICT';
          } else {
            code = originalError.error || 'BAD_REQUEST';
          }
          message = Array.isArray(originalError.message)
            ? originalError.message[0]
            : originalError.message || error.message;
          if (!details) {
            details =
              typeof originalError.message === 'object'
                ? originalError.message
                : { message: originalError.message || message };
          }
        } else {
          const extensions = error.extensions ? { ...error.extensions } : {};
          code = extensions.code || 'INTERNAL_SERVER_ERROR';
        }
        return {
          message,
          code,
          path: error.path,
          locations: error.locations,
          extensions: {
            code,
            statusCode,
            details,
          },
        };
      },
    }),
    ScheduleModule.forRoot(),
    EventEmitterModule.forRoot(),
    LoggerModule,
    DatabaseModule,
    RedisModule,
    AuthModule,
    UserModule,
    UserSessionModule,
    MentorProfileModule,
    MentorAvailabilityModule,
    CategoryModule,
    GroupCategoryModule,
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
    MailModule,
    BugReportModule,
  ],
  controllers: [AppController],
  providers: [AppService, StartupSeedService],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(CorrelationIdMiddleware).forRoutes('*');
  }
}
