import { ApiProperty } from '@nestjs/swagger';
import {
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsArray,
  IsUUID,
  MaxLength,
} from 'class-validator';
import { NotificationChannel, NotificationType } from 'src/common/enum/index.enum';

export class SendNotificationDto {
  @ApiProperty({ 
    description: 'Student IDs (array for bulk send)', 
    type: [String],
    example: ['uuid1', 'uuid2'] 
  })
  @IsArray()
  @IsUUID('4', { each: true })
  @IsNotEmpty()
  studentIds: string[];

  @ApiProperty({ 
    enum: NotificationType, 
    description: 'Notification type',
    example: NotificationType.ANNOUNCEMENT 
  })
  @IsEnum(NotificationType)
  @IsNotEmpty()
  type: NotificationType;

  @ApiProperty({ description: 'Notification title' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(200)
  title: string;

  @ApiProperty({ description: 'Notification message' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(1000)
  message: string;

  @ApiProperty({ 
    enum: NotificationChannel, 
    description: 'Notification channel',
    default: NotificationChannel.TELEGRAM 
  })
  @IsEnum(NotificationChannel)
  @IsOptional()
  channel?: NotificationChannel;

  @ApiProperty({ description: 'Extra metadata', required: false })
  @IsOptional()
  metadata?: any;
}