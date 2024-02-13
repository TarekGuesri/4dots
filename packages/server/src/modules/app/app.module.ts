import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import config from '../../config';
import { AppController } from './app.controller';
import { EventsModule } from '../events/events.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [config],
      cache: true,
    }),
    EventsModule,
  ],
  controllers: [AppController],
})
export class AppModule {}
