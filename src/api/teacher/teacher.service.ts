import {
  BadRequestException,
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
import { CryptoService } from 'src/infrastructure/crypto/crypto.service';
import Redis from 'ioredis';
import { ISuccess } from 'src/infrastructure/pagination/successResponse';
import { successRes } from 'src/infrastructure/response/success.response';
import { ChangePasswordDto } from './dto/change-password.dto';
import { InjectRedis } from '@nestjs-modules/ioredis';

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

  async createIncompleteGoogleTeacher(data: any) {
    let teacher = await this.teacherRepo.findOne({
      where: { email: data.email },
    });

    if (!teacher) {
      // Yangi teacher yaratishda nomlarni qo'lda moslaymiz
      teacher = this.teacherRepo.create({
        email: data.email,
        fullName: data.fullName,
        googleId: data.googleId,
        imageUrl: data.imageUrl,
        googleAccessToken: data.accessToken, // <--- To'g'ri mapping
        googleRefreshToken: data.refreshToken, // <--- To'g'ri mapping
        isComplete: false,
        isActive: false,
      });
    } else {
      // Mavjud teacher uchun yangilash qismi sizda deyarli to'g'ri edi
      teacher.googleAccessToken = data.accessToken;
      if (data.refreshToken) {
        teacher.googleRefreshToken = data.refreshToken;
      }
      // Agar rasm yoki ism o'zgargan bo'lsa ularni ham yangilab qo'yish mumkin
      teacher.imageUrl = data.imageUrl;
      teacher.fullName = data.fullName;
    }

    return await this.teacherRepo.save(teacher);
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
    // Bazadan barcha ma'lumotlarni, shu jumladan tokenlarni ham olib kelamiz
    const teacher = await this.teacherRepo.findOne({ where: { email } });

    if (!teacher) throw new NotFoundException('Foydalanuvchi topilmadi');

    const hashedPassword = await this.crypto.encrypt(password);

    // Faqat kerakli maydonlarni yangilaymiz
    teacher.phoneNumber = phoneNumber;
    teacher.password = hashedPassword;
    teacher.isComplete = true;
    teacher.isActive = false;

    // teacher obyekti ichida tokenlar borligi sababli, save() ularni o'chirib yubormaydi
    return await this.teacherRepo.save(teacher);
  }

  async updateTeacher(id: string, dto: UpdateTeacherDto): Promise<ISuccess> {
    const { phoneNumber, cardNumber } = dto;

    const teacher = await this.teacherRepo.findOne({ where: { id } });
    if (!teacher) throw new NotFoundException('Teacher not found');

    if (phoneNumber) {
      const existsPhoneNumber = await this.teacherRepo.findOne({
        where: { phoneNumber },
      });
      if (existsPhoneNumber && existsPhoneNumber.id !== id)
        throw new ConflictException('Phone number aready exists');
    }

    if (cardNumber) {
      const existsCardNumber = await this.teacherRepo.findOne({
        where: { phoneNumber },
      });
      if (existsCardNumber && existsCardNumber.id !== id)
        throw new ConflictException('Phone number aready exists');
    }

    const updatedTeacher = await this.teacherRepo.update(id, dto);

    return successRes(updatedTeacher);
  }

  async changePassword(id: string, dto: ChangePasswordDto): Promise<ISuccess> {
    const { currentPassword, newPassword } = dto;
    const teacher = await this.teacherRepo.findOne({ where: { id } });
    if (!teacher) throw new NotFoundException('Teacher not found');

    const isMatchPassword = await this.crypto.decrypt(
      currentPassword,
      teacher.password,
    );
    if (!isMatchPassword)
      throw new BadRequestException('Current password incorrect');

    const hashedPassword = await this.crypto.encrypt(newPassword);

    teacher.password = hashedPassword;

    await this.teacherRepo.update(id, { password: hashedPassword });

    return successRes({ message: 'Password successfully changed!' });
  }
}
