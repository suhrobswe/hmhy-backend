// src/api/teacher/teacher.module.ts

import { Module } from '@nestjs/common';
import { TeacherService } from './teacher.service';
import { TeacherController } from './teacher.controller';
import { CryptoService } from 'src/infrastructure/crypto/crypto.service';
import { TokenService } from 'src/infrastructure/token/Token';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Teacher } from 'src/core/entity/teacher.entity';
import { JwtModule } from '@nestjs/jwt';
import { GoogleStrategy } from './strategy/google.strategy';
import { EmailModule } from 'src/infrastructure/email/email.module';

@Module({
  imports: [TypeOrmModule.forFeature([Teacher]), JwtModule, EmailModule],
  controllers: [TeacherController],
  providers: [TeacherService, CryptoService, TokenService, GoogleStrategy],
})
export class TeacherModule {}
