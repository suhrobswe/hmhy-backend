import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { config } from '../config';
import { AdminModule } from './admin/admin.module';
import { AuthModule } from './auth/auth.module';
import { TeacherModule } from './teacher/teacher.module';
import { JwtModule } from '@nestjs/jwt';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),

    TypeOrmModule.forRootAsync({
      useFactory: async () => ({
        type: 'postgres',
        url: config.DB_URL,
        synchronize: true,
        entities: ['dist/core/entity/*.entity{.ts,.js}'],
        autoLoadEntities: true,
        ssl:
          config.NODE_ENV === 'production'
            ? { rejectUnauthorized: false }
            : false,
      }),
    }),

    JwtModule.register({
      global: true,
      secret: config.TOKEN.JWT_SECRET_KEY,
      signOptions: { expiresIn: config.TOKEN.ACCESS_TOKEN_TIME },
    }),

    AdminModule,
    AuthModule,
    TeacherModule,
  ],
})
export class AppModule {}
