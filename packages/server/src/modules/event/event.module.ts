import { Module } from '@nestjs/common';
import { GameStatsModule } from '../game-stats/game-stats.module';
import { EventGateway } from './event.gateway';
import { EventService } from './event.service';

@Module({
  imports: [GameStatsModule],
  providers: [EventGateway, EventService],
})
export class EventModule {}
