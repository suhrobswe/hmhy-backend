import { ApiProperty } from '@nestjs/swagger';
import {
  IsDateString,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID,
  MaxLength,
} from 'class-validator';
import {
  NotificationChannel,
  NotificationType,
} from 'src/common/enum/index.enum';

export class CreateNotificationDto {
  @ApiProperty({ description: 'Student ID' })
  @IsUUID()
  @IsNotEmpty()
  studentId: string;

  @ApiProperty({
    enum: NotificationType,
    description: 'Notification type',
    example: NotificationType.LESSON_REMINDER,
  })
  @IsEnum(NotificationType)
  @IsNotEmpty()
  type: NotificationType;

  @ApiProperty({
    description: 'Notification title',
    example: 'Lesson Reminder',
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(200)
  title: string;

  @ApiProperty({
    description: 'Notification message',
    example: 'Your lesson starts in 30 minutes',
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(1000)
  message: string;

  @ApiProperty({
    enum: NotificationChannel,
    description: 'Notification channel',
    example: NotificationChannel.TELEGRAM,
    default: NotificationChannel.IN_APP,
  })
  @IsEnum(NotificationChannel)
  @IsOptional()
  channel?: NotificationChannel;

  @ApiProperty({
    description: 'Scheduled send time (optional)',
    required: false,
    example: '2024-12-20T10:00:00Z',
  })
  @IsDateString()
  @IsOptional()
  sendAt?: string;

  @ApiProperty({
    description: 'Extra metadata (lessonId, transactionId, etc.)',
    required: false,
    example: { lessonId: 'uuid', transactionId: 'uuid' },
  })
  @IsOptional()
  metadata?: any;
}
