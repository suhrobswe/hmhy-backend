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
import { ChangePasswordDto } from './dto/change-password.dto';
import { InjectRedis } from '@nestjs-modules/ioredis';
import { VerifyOtpDto } from './dto/verify-otp.dto';
import { EmailService } from 'src/infrastructure/email/email.service';
import { SendOtpDto } from './dto/send-otp.dto';
import { generateOtp } from 'src/common/util/otp-generator';
import { Between, ILike } from 'typeorm';
import { TeacherFilterDto } from './dto/teacher-filter.dto';
import { IToken } from 'src/infrastructure/token/interface';
import { TokenService } from 'src/infrastructure/token/Token';
import { Response } from 'express';
import { successRes } from 'src/infrastructure/response/success.response';
import { Roles } from 'src/common/enum/index.enum';

@Injectable()
export class TeacherService extends BaseService<
  CreateTeacherDto,
  UpdateTeacherDto,
  Teacher
> {
  constructor(
    @InjectRepository(Teacher) private readonly teacherRepo: TeacherRepository,
    @InjectRedis() private readonly redis: Redis,
    private readonly mailService: EmailService,
    private readonly crypto: CryptoService,
    private readonly token: TokenService,
  ) {
    super(teacherRepo);
  }

  async createIncompleteGoogleTeacher(data: any) {
    let teacher = await this.teacherRepo.findOne({
      where: { email: data.email },
    });

    if (!teacher) {
      teacher = this.teacherRepo.create({
        email: data.email,
        fullName: data.fullName,
        googleId: data.googleId,
        imageUrl: data.imageUrl,
        googleAccessToken: data.accessToken,
        googleRefreshToken: data.refreshToken,
        isComplete: false,
        isActive: false,
      });
    } else {
      teacher.googleAccessToken = data.accessToken;
      if (data.refreshToken) {
        teacher.googleRefreshToken = data.refreshToken;
      }
      teacher.imageUrl = data.imageUrl;
      teacher.fullName = data.fullName;
    }

    return await this.teacherRepo.save(teacher);
  }

  async findTeacherByPhone(phoneNumber: string) {
    return await this.teacherRepo.findOne({ where: { phoneNumber } });
  }
  async initiateGoogleRegistration(dto: SendOtpDto) {
    const teacher = await this.findByEmail(dto.email);
    if (!teacher) throw new BadRequestException('Email not found');

    const phoneCheck = await this.findTeacherByPhone(dto.phoneNumber);
    if (phoneCheck) throw new ConflictException('Phone number already exists');

    const otp = generateOtp();
    const redisData = {
      otp,
      phoneNumber: dto.phoneNumber,
      password: dto.password,
    };

    await this.redis.set(
      `otp:google:${dto.email}`,
      JSON.stringify(redisData),
      'EX',
      300,
    );

    await this.mailService.sendEmail({
      to: dto.email,
      subject: 'Verify code',
      html: this.generateHtmlTemplate(otp),
    });

    return { message: 'OTP emailingizga yuborildi' };
  }

  async verifyAndActivate(dto: VerifyOtpDto, res: Response) {
    const data = await this.redis.get(`otp:google:${dto.email}`);
    if (!data) throw new BadRequestException('OTP muddati o‘tgan');

    const parsed = JSON.parse(data);
    if (parsed.otp !== dto.otp) throw new BadRequestException('OTP noto‘g‘ri');

    // 4. Ustozni faollashtirish
    const teacher = await this.activateTeacher(
      dto.email,
      parsed.phoneNumber,
      parsed.password,
    );

    await this.redis.del(`otp:google:${dto.email}`);

    const payload: IToken = {
      id: teacher.id,
      role: Roles.TEACHER,
      isActive: false,
    };
    const accessToken = await this.token.accessToken(payload);
    const refreshToken = await this.token.refreshToken(payload);
    await this.token.writeCookie(res, 'token', refreshToken, 30);

    return {
      message: "Ro'yxatdan o'tish yakunlandi",
      accessToken,
      role: Roles.TEACHER,
      status: 'Pending Admin Approval',
      teacherId: teacher.id,
    };
  }

  private generateHtmlTemplate(otp: string): string {
    return `
      <div style="font-family: Arial, sans-serif; padding: 20px; border: 1px solid #eee;">
        <h2>Tasdiqlash kodi</h2>
        <h1 style="color: #4CAF50;">${otp}</h1>
        <p>Ushbu kod 5 daqiqa davomida amal qiladi.</p>
      </div>
    `;
  }

  async findCompleteGoogleTeacher(email: string) {
    return await this.teacherRepo.findOne({ where: { email } });
  }

  async findByEmail(email: string) {
    return await this.teacherRepo.findOne({ where: { email } });
  }

  async activateTeacher(email: string, phoneNumber: string, password: string) {
    const teacher = await this.teacherRepo.findOne({ where: { email } });

    if (!teacher) throw new NotFoundException('Foydalanuvchi topilmadi');

    const hashedPassword = await this.crypto.encrypt(password);

    teacher.phoneNumber = phoneNumber;
    teacher.password = hashedPassword;
    teacher.isComplete = true;
    teacher.isActive = false;

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

  async updateTeacherForAdmin(
    id: string,
    dto: UpdateTeacherDto,
  ): Promise<ISuccess> {
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

  async findFilteredTeachers(query: TeacherFilterDto) {
    const {
      search,
      level,
      minRating,
      maxRating,
      sortBy,
      sortOrder,
      page,
      limit,
    } = query;

    const where: any = { isActive: true };

    if (search) {
      where.fullName = ILike(`%${search}%`);
    }

    if (level) {
      where.level = level;
    }

    if (minRating !== undefined && maxRating !== undefined) {
      where.rating = Between(minRating, maxRating);
    }

    const options: any = {
      where,
      take: limit,
      skip: page,
      order: {
        [sortBy || 'fullName']: sortOrder || 'ASC',
      },
      select: {
        id: true,
        cardNumber: true,
        description: true,
        email: true,
        fullName: true,
        phoneNumber: true,
        experience: true,
        hourPrice: true,
        imageUrl: true,
        level: true,
        portfolioLink: true,
        rating: true,
        specification: true,
      },
    };

    return this.findAllWithPagination(options);
  }
}
