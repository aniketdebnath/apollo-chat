import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as cookieParser from 'cookie-parser';
import { Logger } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, { bufferLogs: true });
  const logger = new Logger('Bootstrap');

  // Get config service
  const configService = app.get(ConfigService);

  // Set up CORS
  const frontendUrl =
    configService.get<string>('FRONTEND_URL') || 'http://localhost:3000';
  logger.log(`Setting up CORS for frontend URL: ${frontendUrl}`);

  app.enableCors({
    origin: frontendUrl,
    credentials: true,
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    allowedHeaders: 'Origin,X-Requested-With,Content-Type,Accept,Authorization',
  });

  app.useGlobalPipes(new ValidationPipe());
  app.use(cookieParser());
  app.setGlobalPrefix('/api');

  // Elastic Beanstalk sets PORT env variable by default
  const port = process.env.PORT || configService.get<string>('PORT') || 8080;
  logger.log(`Starting application on port: ${port}`);
  await app.listen(port);
}
bootstrap().catch((err) => {
  console.error('Failed to start application:', err);
  process.exit(1);
});
