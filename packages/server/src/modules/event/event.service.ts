import type { IRoomInfo, SocketEventType } from '@4dots/shared';
import { Injectable } from '@nestjs/common';
import type { Server } from 'socket.io';

@Injectable()
export class EventService {
  static rooms: Array<IRoomInfo> = [];

  async createRoom(server: Server, data: IRoomInfo): Promise<number> {
    console.log('createRoom');

    console.log({ data });
    EventService.rooms.push(data);

    console.log({ rooms: EventService.rooms });

    server.emit<SocketEventType>('createRoom', data);
    return 0;
  }
}
