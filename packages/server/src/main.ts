import { NestFactory } from '@nestjs/core';
import { ConfigService } from '@nestjs/config';
import { AppModule } from './modules/app/app.module';
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Config variables
  const configService: ConfigService = app.get(ConfigService);

  // Enable Validation
  app.useGlobalPipes(new ValidationPipe());

  const port = configService.get('PORT');
  await app.listen(port);

  console.log('4Dots :: Listening on port', port);
}
bootstrap();
