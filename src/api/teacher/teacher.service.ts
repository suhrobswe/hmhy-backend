import {
  ConflictException,
  Injectable,
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

@Injectable()
export class TeacherService extends BaseService<
  CreateTeacherDto,
  UpdateTeacherDto,
  Teacher
> {
  constructor(
    @InjectRepository(Teacher) private readonly teacherRepo: TeacherRepository,
    private readonly crypto: CryptoService,
  ) {
    super(teacherRepo);
  }

  // Google'dan kelgan ma'lumotlarni temporary saqlash
  async createIncompleteGoogleTeacher(data: {
    email: string;
    fullName: string;
    imageUrl?: string;
    googleId: string;
  }) {
    // Agar email mavjud bo'lsa va complete bo'lsa
    const existingTeacher = await this.teacherRepo.findOne({
      where: { email: data.email },
    });

    if (existingTeacher && existingTeacher.isComplete) {
      throw new ConflictException('Teacher with this email already exists');
    }

    // Agar incomplete bo'lsa, uni yangilaymiz
    if (existingTeacher && !existingTeacher.isComplete) {
      existingTeacher.fullName = data.fullName;
      existingTeacher.imageUrl = data.imageUrl || '';
      existingTeacher.googleId = data.googleId;
      return await this.teacherRepo.save(existingTeacher);
    }

    // Yangi incomplete teacher yaratamiz
    const teacher = this.teacherRepo.create({
      email: data.email,
      fullName: data.fullName,
      imageUrl: data.imageUrl,
      googleId: data.googleId,
      isActive: false, // Hali aktivlashtirilmagan
      authProvider: AuthProvider.GOOGLE,
      isComplete: false, // Registration tugallanmagan
    });

    return await this.teacherRepo.save(teacher);
  }

  // Registration ni to'ldirish (telefon va parol qo'shish)
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

    // Telefon raqami unique ekanligini tekshirish
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
    teacher.isComplete = true; // Registration tugallandi
    teacher.isActive = true; // Aktivlashtirish

    return await this.teacherRepo.save(teacher);
  }

  // Google orqali login qilgan teacherni topish
  async findCompleteGoogleTeacher(email: string) {
    return await this.teacherRepo.findOne({
      where: {
        email,
        authProvider: AuthProvider.GOOGLE,
        isComplete: true,
      },
    });
  }
}
