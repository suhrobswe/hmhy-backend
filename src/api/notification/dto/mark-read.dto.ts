import { ApiProperty } from '@nestjs/swagger';
import { IsArray, IsUUID } from 'class-validator';

export class MarkReadDto {
  @ApiProperty({ 
    description: 'Notification IDs to mark as read', 
    type: [String],
    example: ['uuid1', 'uuid2'] 
  })
  @IsArray()
  @IsUUID('4', { each: true })
  notificationIds: string[];
}