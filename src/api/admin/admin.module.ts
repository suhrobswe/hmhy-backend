import { Module } from '@nestjs/common';
import { AdminService } from './admin.service';
import { AdminController } from './admin.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Admin } from 'src/core/entity/admin.entity';
import { CryptoService } from 'src/infrastructure/crypto/crypto.service';

@Module({
  imports: [TypeOrmModule.forFeature([Admin])],
  controllers: [AdminController],
  providers: [AdminService, CryptoService],
})
export class AdminModule {}
