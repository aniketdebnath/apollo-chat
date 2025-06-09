import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { Logger } from 'nestjs-pino';
import { ConfigService } from '@nestjs/config';
import * as cookieParser from 'cookie-parser';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, { bufferLogs: true });
  app.useGlobalPipes(new ValidationPipe());
  app.useLogger(app.get(Logger));
  app.use(cookieParser());
  app.setGlobalPrefix('/api');
  const configService = app.get(ConfigService);
  // Elastic Beanstalk sets PORT env variable by default
  const port = process.env.PORT || configService.get<string>('PORT') || 8080;
  console.log(`Starting application on port: ${port}`);
  await app.listen(port);
}
bootstrap().catch((err) => {
  console.error('Failed to start application:', err);
  process.exit(1);
});
