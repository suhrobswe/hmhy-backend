import {
  ConflictException,
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
import { AuthProvider, TeacherSpecification } from 'src/common/enum/index.enum';
import { CompleteGoogleRegistrationDto } from './dto/google-oauth.dti';
import { CryptoService } from 'src/infrastructure/crypto/crypto.service';
import Redis from 'ioredis';
import { config } from 'src/config';
import { InjectRedis } from '@songkeys/nestjs-redis';
import { successRes } from 'src/infrastructure/response/success.response';

@Injectable()
export class TeacherService extends BaseService<
  CreateTeacherDto,
  UpdateTeacherDto,
  Teacher
> {
  // teacher.service.ts
  constructor(
    @InjectRepository(Teacher) private readonly teacherRepo: TeacherRepository,
    @InjectRedis() private readonly redis: Redis, // Shuning o'zi kifoya
    private readonly crypto: CryptoService,
  ) {
    super(teacherRepo);
  }

  // teacher.service.ts
  async createFinalTeacher(data: any) {
    const hashedPassword = await this.crypto.encrypt(data.password);

    const teacher = this.teacherRepo.create({
      email: data.email,
      fullName: data.fullName,
      googleId: data.googleId,
      imageUrl: data.imageUrl,
      password: hashedPassword,
      phoneNumber: data.phoneNumber,
      authProvider: AuthProvider.GOOGLE,
      isComplete: true, // Ma'lumotlari to'liq kiritildi (Phone/Pass)
      isActive: false, // Admin tasdiqlashi kutilmoqda
      // Agar DTO ichida boshqa ixtiyoriy maydonlar bo'lsa
      cardNumber: data.cardNumber || '',
      specification: data.specification || TeacherSpecification.ENGLISH,
      level: data.level || 'B1',
      description: data.description || '',
      hourPrice: data.hourPrice || 0,
      portfolioLink: data.portfolioLink || '',
      experience: data.experience || '',
    });

    return await this.teacherRepo.save(teacher);
  }

  // Telefon raqami bo'yicha ham qidirishni qo'shamiz
  async findTeacherByPhone(phoneNumber: string) {
    return await this.teacherRepo.findOne({ where: { phoneNumber } });
  }
  async createIncompleteGoogleTeacher(data: {
    email: string;
    fullName: string;
    imageUrl?: string;
    googleId: string;
  }) {
    const existingTeacher = await this.teacherRepo.findOne({
      where: { email: data.email },
    });

    if (existingTeacher && existingTeacher.isComplete) {
      throw new ConflictException('Teacher with this email already exists');
    }

    if (existingTeacher && !existingTeacher.isComplete) {
      existingTeacher.fullName = data.fullName;
      existingTeacher.imageUrl = data.imageUrl || '';
      existingTeacher.googleId = data.googleId;
      return await this.teacherRepo.save(existingTeacher);
    }

    const teacher = this.teacherRepo.create({
      email: data.email,
      fullName: data.fullName,
      imageUrl: data.imageUrl,
      googleId: data.googleId,
      isActive: false,
      authProvider: AuthProvider.GOOGLE,
      isComplete: false,
    });

    return await this.teacherRepo.save(teacher);
  }

  async completeGoogleRegistration(
    email: string,
    dto: CompleteGoogleRegistrationDto,
  ) {
    const teacher = await this.teacherRepo.findOne({
      where: { email, authProvider: AuthProvider.GOOGLE, isComplete: false },
    });

    if (!teacher) {
      throw new NotFoundException('Incomplete registration not found');
    }

    const phoneExists = await this.teacherRepo.findOne({
      where: { phoneNumber: dto.phoneNumber },
    });

    if (phoneExists) {
      throw new ConflictException('Phone number already in use');
    }

    // Parolni hash qilish
    const hashedPassword = await this.crypto.encrypt(dto.password);

    // Teacher ma'lumotlarini yangilash
    teacher.phoneNumber = dto.phoneNumber;
    teacher.password = hashedPassword;
    teacher.cardNumber = dto.cardNumber || '';
    teacher.specification = dto.specification || TeacherSpecification.ENGLISH;
    teacher.level = dto.level || 'B1';
    teacher.description = dto.description || '';
    teacher.hourPrice = dto.hourPrice || 0;
    teacher.portfolioLink = dto.portfolioLink || '';
    teacher.experience = dto.experience || '';
    teacher.isComplete = true;
    teacher.isActive = true;

    return await this.teacherRepo.save(teacher);
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
}
