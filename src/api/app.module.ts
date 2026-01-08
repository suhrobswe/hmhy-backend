import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { config } from '../config';
import { AdminModule } from './admin/admin.module';
import { AuthModule } from './auth/auth.module';
import { TeacherModule } from './teacher/teacher.module';
import { JwtModule } from '@nestjs/jwt';
import { RedisModule } from '@nestjs-modules/ioredis';
import { LessonModule } from './lesson/lesson.module';
import { StudentModule } from './student/student.module';
import { LessonHistoryModule } from './lesson-history/lesson-history.module';
import { NotificationModule } from './notification/notification.module';
import { TransactionModule } from './transaction/transaction.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),

    TypeOrmModule.forRootAsync({
      useFactory: async () => ({
        type: 'postgres',
        url: config.DB_URL,
        synchronize: true,
        entities: ['dist/core/entity/*.entity{.ts,.js}'],
        autoLoadEntities: true,
        ssl:
          config.NODE_ENV === 'production'
            ? { rejectUnauthorized: false }
            : false,
      }),
    }),

    JwtModule.register({
      global: true,
      secret: config.TOKEN.JWT_SECRET_KEY,
      signOptions: { expiresIn: config.TOKEN.ACCESS_TOKEN_TIME },
    }),

    RedisModule.forRoot({
      type: 'single',
      url: `redis://:${config.REDIS_PASSWORD}@${config.REDIS_HOST}:${config.REDIS_PORT}`,
    }),

    AdminModule,
    AuthModule,
    TeacherModule,
    StudentModule,
    LessonModule,
    LessonHistoryModule,
    NotificationModule,
    TransactionModule,
  ],
})
export class AppModule {}
