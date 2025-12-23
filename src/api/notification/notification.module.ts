import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { NotificationService } from './notification.service';
import { NotificationController } from './notification.controller';
import { Notification } from '../../core/entity/notification.entity';
import { EmailModule } from 'src/infrastructure/email/email.module';
import { ScheduleModule } from '@nestjs/schedule';
import { Lesson } from 'src/core/entity/lesson.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Notification, Lesson]),
    ScheduleModule.forRoot(),
    EmailModule,
  ],
  controllers: [NotificationController],
  providers: [NotificationService],
  exports: [NotificationService],
})
export class NotificationModule {}
