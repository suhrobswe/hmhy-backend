import { Module } from '@nestjs/common';
import { AdminService } from './admin.service';
import { AdminController } from './admin.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Admin } from 'src/core/entity/admin.entity';
import { CryptoService } from 'src/infrastructure/crypto/crypto.service';
import { Teacher } from 'src/core/entity/teacher.entity';
import { Student } from 'src/core/entity/student.entity';
import { Lesson } from 'src/core/entity/lesson.entity';
import { TeacherPayment } from 'src/core/entity/teacherPayment.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Admin, Teacher, Student, Lesson, TeacherPayment])],
  controllers: [AdminController],
  providers: [AdminService, CryptoService],
})
export class AdminModule {}
