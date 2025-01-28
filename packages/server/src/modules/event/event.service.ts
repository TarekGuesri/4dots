import type {
  IRoomInfo,
  SocketEventErrorPayload,
  SocketEventType,
} from '@4dots/shared';
import { Injectable } from '@nestjs/common';
import type {
  ClearUserFromRoomDTO,
  CreateRoomDTO,
  JoinLeaveRoomDTO,
} from './event.dto';

@Injectable()
export class EventService {
  private rooms: Array<IRoomInfo> = [];

  async createRoom({ room, server, socket }: CreateRoomDTO) {
    // Leave any existing room the user is in
    this.clearUserFromRoom({ server, socket });

    this.rooms.push(room);
    server.emit<SocketEventType>('createRoom', room);
  }

  async joinRoom({ roomId, server, socket }: JoinLeaveRoomDTO) {
    // Leave any existing room the user is in
    this.clearUserFromRoom({ server, socket });

    const room = this.rooms.find((room) => room.id === roomId);

    if (!room) {
      socket.emit<SocketEventType>('error', {
        type: 'Error.RoomNotFound',
      } as SocketEventErrorPayload);
      return;
    }

    // Check if room is full
    if (
      room.hostId !== socket.id &&
      room.visitorId !== null &&
      room.visitorId !== socket.id
    ) {
      socket.emit<SocketEventType>('error', {
        type: 'Error.RoomFull',
      } as SocketEventErrorPayload);
      return;
    }

    // If the room is available, set the visitorId
    if (room.hostId !== socket.id) {
      room.visitorId = socket.id;
    }

    server.emit<SocketEventType>('roomUpdated', room);
  }

  async leaveRoom({ roomId, server, socket }: JoinLeaveRoomDTO) {
    const room = this.rooms.find((room) => room.id === roomId);

    if (!room) {
      return;
    }

    // If host leaves, delete the room and notify the visitor
    if (room.hostId === socket.id) {
      server.emit<SocketEventType>('roomDeleted', room);
      this.rooms = this.rooms.filter((_room) => _room.id !== room.id);
    } else if (room.visitorId === socket.id) {
      room.visitorId = null;
      server.emit<SocketEventType>('roomUpdated', room);
    }

    socket.emit<SocketEventType>('roomLeft');
  }

  async clearUserFromRoom({ socket, server }: ClearUserFromRoomDTO) {
    const room = this.rooms.find(
      (room) => room.hostId === socket.id || room.visitorId === socket.id,
    );
    if (room) {
      this.leaveRoom({ roomId: room.id, socket, server });
    }
  }
}
