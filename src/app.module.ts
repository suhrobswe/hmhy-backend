import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { config } from './config';

@Module({
  imports: [ConfigModule.forRoot({
    isGlobal: true,
  }),

  TypeOrmModule.forRootAsync({
    useFactory: async() => {
     try {
console.log("Connecting to Postgres")
 return {
            type: 'postgres',
            url: config.DB_URL,
            synchronize: true,
            entities: ['dist/core/entity/*.entity{.ts,.js}'],
            autoLoadEntities: true,
            ssl:
              config.NODE_ENV === 'production'
                ? { rejectUnauthorized: false }
                : false,
          };
        } catch (err) {
          console.error(' PostgreSQL connection failed:', err.message);
          process.exit(1); 
        }
      },
    }),
  ],
  controllers: [],
  providers: [],
})
 

export class AppModule {}
