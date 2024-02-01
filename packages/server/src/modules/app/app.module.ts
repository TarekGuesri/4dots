import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import config from '../../config';
import { AppController } from './app.controller';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [config],
      cache: true,
    }),
  ],
  controllers: [AppController],
})
export class AppModule {}
