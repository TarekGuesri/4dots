import { IRoomInfo, SocketEventType } from '@4dots/shared';
import type { WsResponse } from '@nestjs/websockets';
import {
  MessageBody,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { from, Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { Server } from 'socket.io';

@WebSocketGateway({
  cors: {
    origin: '*',
  },
})
export class EventsGateway {
  @WebSocketServer()
  server: Server;

  @SubscribeMessage('events')
  findAll(@MessageBody() data: any): Observable<WsResponse<number>> {
    console.log('events', { data });

    return from([1, 2, 3]).pipe(
      map((item) => ({ event: 'events', data: item })),
    );
  }

  @SubscribeMessage('identity')
  async identity(@MessageBody() data: number): Promise<number> {
    console.log('identity');
    console.log({ data });
    return data;
  }

  @SubscribeMessage(SocketEventType.JOINED_ROOM)
  async joinedRoom(@MessageBody() data: IRoomInfo): Promise<number> {
    console.log('joinedRoom');

    console.log({ data });

    this.server.emit(SocketEventType.JOINED_ROOM, data);
    return 0;
  }

  //   handleConnection(_client: Socket) {
  //     // Handle connection event
  //     console.log('connected');
  //   }

  //   handleDisconnect(_client: Socket) {
  //     // Handle disconnection event
  //     console.log('disconnected');
  //   }
}
