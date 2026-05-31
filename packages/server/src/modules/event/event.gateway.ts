import type {
  BoardDisksType,
  CurrentPlayerType,
  GameResultType,
  SocketEventType,
} from '@4dots/shared';
import { IRoomInfo } from '@4dots/shared';
import {
  ConnectedSocket,
  MessageBody,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { EventService } from './event.service';

@WebSocketGateway({
  cors: {
    origin: '*',
  },
})
export class EventGateway {
  constructor(private eventService: EventService) {}
  @WebSocketServer()
  server: Server;

  @SubscribeMessage('identity')
  async identity(@MessageBody() data: number): Promise<number> {
    console.log('identity');
    console.log({ data });
    console.log('-----------');

    return data;
  }

  @SubscribeMessage<SocketEventType>('createRoom')
  async createRoom(
    @MessageBody() room: IRoomInfo,
    @ConnectedSocket() socket: Socket,
  ): Promise<void> {
    this.eventService.createRoom({ room, server: this.server, socket });
  }

  @SubscribeMessage<SocketEventType>('joinRoom')
  async joinRoom(
    @MessageBody() roomId: string,
    @ConnectedSocket() socket: Socket,
  ): Promise<void> {
    this.eventService.joinRoom({ roomId, socket, server: this.server });
  }

  @SubscribeMessage('leaveRoom')
  async leaveRoom(
    @MessageBody() roomId: string,
    @ConnectedSocket() socket: Socket,
  ): Promise<void> {
    this.eventService.leaveRoom({ roomId, socket, server: this.server });
  }

  @SubscribeMessage<SocketEventType>('startGame')
  async startGame(
    @MessageBody() roomId: string,
    @ConnectedSocket() socket: Socket,
  ): Promise<void> {
    this.eventService.startGame({ roomId, socket, server: this.server });
  }

  @SubscribeMessage<SocketEventType>('makeMove')
  async makeMove(
    @MessageBody()
    body: {
      newBoard: BoardDisksType;
      currentPlayer: CurrentPlayerType;
      roomId: string;
      winner: CurrentPlayerType | null;
    },
  ): Promise<void> {
    this.eventService.makeMove({ ...body, server: this.server });
  }

  @SubscribeMessage<SocketEventType>('askForRematch')
  async askForRematch(
    @MessageBody() roomId: string,
    @ConnectedSocket() socket: Socket,
  ): Promise<void> {
    this.eventService.askForRematch({ roomId, socket, server: this.server });
  }

  @SubscribeMessage<SocketEventType>('loadGameStats')
  async loadGameStats(
    @MessageBody() body: { token: string | null },
    @ConnectedSocket() socket: Socket,
  ): Promise<void> {
    this.eventService.loadGameStats({ socket, token: body?.token ?? null });
  }

  @SubscribeMessage<SocketEventType>('recordGameResult')
  async recordGameResult(
    @MessageBody() body: { token: string | null; result: GameResultType },
    @ConnectedSocket() socket: Socket,
  ): Promise<void> {
    this.eventService.recordGameResult({
      socket,
      token: body?.token ?? null,
      result: body.result,
    });
  }

  handleDisconnect(@ConnectedSocket() socket: Socket) {
    console.log('disconnected');
    console.log({ socketId: socket.id });
    console.log('--------');

    // If a user disconnects, clear them from the room they were in
    this.eventService.clearUserFromRoom({ server: this.server, socket });
  }
}
