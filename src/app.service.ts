import {
  ClassSerializerInterceptor,
  HttpStatus,
  Injectable,
  ValidationPipe,
} from '@nestjs/common';
import { HttpAdapterHost, NestFactory, Reflector } from '@nestjs/core';
import { winstonConfig } from './infrastructure/winston/winston-config';
import { AppModule } from './app.module';
import { NestExpressApplication } from '@nestjs/platform-express';
import cookieParser from 'cookie-parser';
import { AllExceptionsFilter } from './infrastructure/exception/All-exception-filter';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { config } from './config';
@Injectable()
class AppService {
  async main() {
    const app = await NestFactory.create<NestExpressApplication>(AppModule, {
      logger: winstonConfig,
    });
    app.enableCors({
      origin: true,
      methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
      credentials: true,
    });

    app.useGlobalInterceptors(
      new ClassSerializerInterceptor(app.get(Reflector)),
    );
    const globalPrefix = 'api/v1';
    app.setGlobalPrefix(globalPrefix);

    app.use(cookieParser());

    const httpAdapter = app.get(HttpAdapterHost);

    app.useGlobalFilters(new AllExceptionsFilter(httpAdapter));

    app.useLogger(['log', 'error', 'warn', 'debug', 'verbose']);

    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
        errorHttpStatusCode: HttpStatus.UNPROCESSABLE_ENTITY,
        transformOptions: { enableImplicitConversion: true },
        validationError: { target: false },
        stopAtFirstError: true,
        disableErrorMessages: config.NODE_ENV === 'production',
        exceptionFactory: (errors) => {
          const messages = errors
            .map((err) => Object.values(err.constraints || {}))
            .flat();
          return {
            statusCode: HttpStatus.UNPROCESSABLE_ENTITY,
            message: messages,
            error: 'Unprocessable Entity',
          };
        },
      }),
    );
    const swaggerConfig = new DocumentBuilder()
      .setTitle('CRM API')
      // .setDescription('The CRM API')
      .setVersion('1.0')
      .addTag('crm-api')
      .addBearerAuth({
        type: 'http',
        scheme: 'Bearer',
        in: 'Header',
      })
      .build();

    const documentFactory = () =>
      SwaggerModule.createDocument(app, swaggerConfig);
    SwaggerModule.setup('api', app, documentFactory());

    await app.listen(config.PORT, () => {
      console.log(`Server started on port ${config.PORT}`);
    });
  }
}

export default new AppService();
