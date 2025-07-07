import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import config from '../../config';
import { EventModule } from '../event/event.module';
import { AppController } from './app.controller';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [config],
      cache: true,
    }),
    EventModule,
  ],
  controllers: [AppController],
})
export class AppModule {}
