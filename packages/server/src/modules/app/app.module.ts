import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import config from '../../config';
import { AppController } from './app.controller';
import { EventModule } from '../event/event.module';

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
