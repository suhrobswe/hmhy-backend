import { Module } from '@nestjs/common';
import { TeacherPaymentService } from './teacher-payment.service';
import { TeacherPaymentController } from './teacher-payment.controller';

@Module({
  controllers: [TeacherPaymentController],
  providers: [TeacherPaymentService],
})
export class TeacherPaymentModule {}
