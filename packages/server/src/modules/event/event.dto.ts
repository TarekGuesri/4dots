import type { IRoomInfo } from '@4dots/shared';
import type { Server, Socket } from 'socket.io';

export class CreateRoomDTO {
  server: Server;
  room: IRoomInfo;
  socket: Socket;
}
export class JoinLeaveRoomDTO {
  server: Server;
  roomId: string;
  socket: Socket;
}

export class ClearUserFromRoomDTO {
  server: Server;
  socket: Socket;
}
