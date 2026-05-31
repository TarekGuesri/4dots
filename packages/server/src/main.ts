import { ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './modules/app/app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Config variables
  const configService: ConfigService = app.get(ConfigService);

  // Enable Validation
  app.useGlobalPipes(new ValidationPipe());

  const port = configService.get<number>('PORT');
  const environment = configService.get<string>('ENVIRONMENT');

  if (environment === 'production') {
    app.getHttpAdapter().getInstance().set('trust proxy', 1);
  }

  await app.listen(port, '0.0.0.0');

  console.log('4Dots :: Listening on port', port);
}
bootstrap();
