import { IRoomInfo } from '@4dots/shared';
import type { SocketEventType } from '@4dots/shared';
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
  private rooms: Array<IRoomInfo> = [];

  @SubscribeMessage('identity')
  async identity(@MessageBody() data: number): Promise<number> {
    console.log('identity');
    console.log({ data });
    console.log('-----------');

    return data;
  }

  @SubscribeMessage<SocketEventType>('createRoom')
  async createRoom(@MessageBody() data: IRoomInfo): Promise<void> {
    this.rooms.push(data);
    console.log('Room Created:', data);
    this.server.emit<SocketEventType>('createRoom', data);
    this.eventService.createRoom(this.server, data);
  }

  @SubscribeMessage<SocketEventType>('joinRoom')
  async joinRoom(
    @MessageBody() roomId: string,
    @ConnectedSocket() socket: Socket,
  ): Promise<void> {
    console.log('Join Room Requested:', roomId);
    console.log({ rooms: this.rooms });

    const room = this.rooms.find((room) => room.id === roomId);

    if (!room) {
      console.error('Room not found');
      socket.emit<SocketEventType>('error', {
        message: "Room doesn't exist or cannot be joined",
      });
      return;
    }

    // Check if room is not full
    if (
      room.hostId !== socket.id &&
      room.visitorId !== null &&
      room.visitorId !== socket.id
    ) {
      socket.emit<SocketEventType>('error', { message: 'Room is full' });
      return;
    }

    // If the room is available, set the visitorId
    room.visitorId = socket.id;

    this.server.emit<SocketEventType>('joinRoom', room);
    console.log('Joined Room:', room);
  }

  @SubscribeMessage('leaveRoom')
  async leaveRoom(
    @MessageBody() roomId: string,
    @ConnectedSocket() socket: Socket,
  ): Promise<void> {
    console.log('Leave Room Requested:', roomId);

    const room = this.rooms.find((room) => room.id === roomId);

    if (!room) {
      console.error('Room not found');
      socket.emit<SocketEventType>('error', { message: "Room doesn't exist" });
      return;
    }

    // Remove the user from the room
    if (room.hostId === socket.id) {
      // Host is leaving, reset room
      room.visitorId = null;
      this.server.emit<SocketEventType>('roomDeleted', room);
    } else if (room.visitorId === socket.id) {
      // Visitor is leaving, reset visitor
      room.visitorId = null;
      this.server.emit<SocketEventType>('roomUpdated', room);
    }

    console.log('User has left the room');
    socket.emit<SocketEventType>('roomLeft');
  }

  @SubscribeMessage('disconnected')
  async dc(@MessageBody() data: unknown): Promise<unknown> {
    console.log({ data });

    return data;
  }

  handleDisconnect(_client: Socket) {
    console.log('disconnected');
    console.log({ socketId: _client.id });
    console.log('--------');
  }
}
