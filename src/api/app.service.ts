import {
  ClassSerializerInterceptor,
  HttpStatus,
  Injectable,
  ValidationPipe,
} from '@nestjs/common';
import { HttpAdapterHost, NestFactory, Reflector } from '@nestjs/core';
import { NestExpressApplication } from '@nestjs/platform-express';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import cookieParser from 'cookie-parser';
import { winstonConfig } from '.././infrastructure/winston/winston-config';
import { AppModule } from '.././api/app.module';
import { AllExceptionsFilter } from '.././infrastructure/exception/All-exception-filter';
import { config } from '../config';

@Injectable()
export class Application {
  private readonly API_PREFIX = 'api/v1';
  private readonly SWAGGER_PATH = 'api/docs';
  private readonly CORS_METHODS = 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS';
  private readonly LOG_LEVELS = [
    'log',
    'error',
    'warn',
    'debug',
    'verbose',
  ] as const;

  async start(): Promise<void> {
    const app = await NestFactory.create<NestExpressApplication>(AppModule, {
      logger: winstonConfig,
    });

    this.setupCors(app);
    this.setupGlobalPrefix(app);
    this.setupMiddlewares(app);
    this.setupInterceptors(app);
    this.setupFilters(app);
    this.setupPipes(app);
    this.setupSwagger(app);

    await this.startServer(app);
  }

  private setupCors(app: NestExpressApplication): void {
    app.enableCors({
      origin: true,
      methods: this.CORS_METHODS,
      credentials: true,
    });
  }

  private setupGlobalPrefix(app: NestExpressApplication): void {
    app.setGlobalPrefix(this.API_PREFIX);
  }

  private setupMiddlewares(app: NestExpressApplication): void {
    app.use(cookieParser());
  }

  private setupInterceptors(app: NestExpressApplication): void {
    app.useGlobalInterceptors(
      new ClassSerializerInterceptor(app.get(Reflector)),
    );
  }

  private setupFilters(app: NestExpressApplication): void {
    const httpAdapter = app.get(HttpAdapterHost);
    app.useGlobalFilters(new AllExceptionsFilter(httpAdapter));
  }

  private setupPipes(app: NestExpressApplication): void {
    app.useLogger([...this.LOG_LEVELS]);
    app.useGlobalPipes(this.createValidationPipe());
  }

  private createValidationPipe(): ValidationPipe {
    return new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      errorHttpStatusCode: HttpStatus.UNPROCESSABLE_ENTITY,
      transformOptions: {
        enableImplicitConversion: true,
      },
      validationError: {
        target: false,
      },
      stopAtFirstError: true,
      disableErrorMessages: config.NODE_ENV === 'production',
      exceptionFactory: this.validationExceptionFactory,
    });
  }

  private validationExceptionFactory(errors: any[]) {
    const messages = errors
      .map((err) => Object.values(err.constraints || {}))
      .flat();

    return {
      statusCode: HttpStatus.UNPROCESSABLE_ENTITY,
      message: messages,
      error: 'Unprocessable Entity',
    };
  }

  private setupSwagger(app: NestExpressApplication): void {
    const swaggerConfig = new DocumentBuilder()
      .setTitle('HMHY API')
      .setDescription('Help Me Help You')
      .setVersion('1.0')
      .addTag('HMHY API')
      .addBearerAuth({
        type: 'http',
        scheme: 'Bearer',
        in: 'Header',
      })
      .build();

    const document = SwaggerModule.createDocument(app, swaggerConfig);
    SwaggerModule.setup(this.SWAGGER_PATH, app, document);
  }

  private async startServer(app: NestExpressApplication): Promise<void> {
    await app.listen(config.PORT, () => {
      console.log(`Server running on: ${config.BACKEND_URL}`);
      console.log(`Swagger docs: ${config.SWAGGER_URL}`);
    });
  }
}
