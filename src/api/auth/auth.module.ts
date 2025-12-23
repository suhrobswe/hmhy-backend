import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Admin } from 'src/core/entity/admin.entity';
import { Teacher } from 'src/core/entity/teacher.entity';
import { CryptoService } from 'src/infrastructure/crypto/crypto.service';
import { TokenService } from 'src/infrastructure/token/Token';
import { JwtModule } from '@nestjs/jwt';
import { Student } from 'src/core/entity/student.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Admin, Teacher, Student]),
    JwtModule.register({}),
  ],
  controllers: [AuthController],
  providers: [AuthService, CryptoService, TokenService],
})
export class AuthModule {}
