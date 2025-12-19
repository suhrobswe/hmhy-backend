import {
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { CreateTeacherDto } from './dto/create-teacher.dto';
import { UpdateTeacherDto } from './dto/update-teacher.dto';
import type { TeacherRepository } from 'src/core/repository/teacher.repository';
import { BaseService } from 'src/infrastructure/base/base-service';
import { Teacher } from 'src/core/entity/teacher.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { CryptoService } from 'src/infrastructure/crypto/crypto.service';
import Redis from 'ioredis';
import { InjectRedis } from '@songkeys/nestjs-redis';

@Injectable()
export class TeacherService extends BaseService<
  CreateTeacherDto,
  UpdateTeacherDto,
  Teacher
> {
  constructor(
    @InjectRepository(Teacher) private readonly teacherRepo: TeacherRepository,
    @InjectRedis() private readonly redis: Redis,
    private readonly crypto: CryptoService,
  ) {
    super(teacherRepo);
  }

  async findTeacherByPhone(phoneNumber: string) {
    return await this.teacherRepo.findOne({ where: { phoneNumber } });
  }

  async saveOtpToRedis(phoneNumber: string, data: any) {
    const key = `otp:google:${phoneNumber}`;
    try {
      await this.redis.set(key, JSON.stringify(data), 'EX', 120);
    } catch (error) {
      throw new InternalServerErrorException('Redis-ga saqlashda xatolik');
    }
  }

  async getOtpFromRedis(phoneNumber: string) {
    const key = `otp:google:${phoneNumber}`;
    const data = await this.redis.get(key);
    return data ? JSON.parse(data) : null;
  }

  async deleteOtpFromRedis(phoneNumber: string) {
    const key = `otp:google:${phoneNumber}`;
    await this.redis.del(key);
  }

  async findCompleteGoogleTeacher(email: string) {
    return await this.teacherRepo.findOne({ where: { email } });
  }

  async findByEmail(email: string) {
    return await this.teacherRepo.findOne({ where: { email } });
  }

  async activateTeacher(email: string, phoneNumber: string, password: string) {
    const teacher = await this.findByEmail(email);
    if (!teacher) throw new NotFoundException('Foydalanuvchi topilmadi');

    const hashedPassword = await this.crypto.encrypt(password);

    teacher.phoneNumber = phoneNumber;
    teacher.password = hashedPassword;
    teacher.isComplete = true;
    teacher.isActive = false;

    return await this.teacherRepo.save(teacher);
  }
}
