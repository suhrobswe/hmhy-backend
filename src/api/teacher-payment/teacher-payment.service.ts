import { Injectable } from '@nestjs/common';
import { CreateTeacherPaymentDto } from './dto/create-teacher-payment.dto';
import { UpdateTeacherPaymentDto } from './dto/update-teacher-payment.dto';

@Injectable()
export class TeacherPaymentService {
  create(createTeacherPaymentDto: CreateTeacherPaymentDto) {
    return 'This action adds a new teacherPayment';
  }

  findAll() {
    return `This action returns all teacherPayment`;
  }

  findOne(id: number) {
    return `This action returns a #${id} teacherPayment`;
  }

  update(id: number, updateTeacherPaymentDto: UpdateTeacherPaymentDto) {
    return `This action updates a #${id} teacherPayment`;
  }

  remove(id: number) {
    return `This action removes a #${id} teacherPayment`;
  }
}
