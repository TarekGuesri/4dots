import type {
  BoardDisksType,
  CurrentPlayerType,
  GameResultType,
  IRoomInfo,
} from '@4dots/shared';
import type { Server, Socket } from 'socket.io';

// Rooms
export class CreateRoomDTO {
  server: Server;
  room: IRoomInfo;
  socket: Socket;
}
export class JoinLeaveStartRoomDTO {
  server: Server;
  roomId: string;
  socket: Socket;
}

export class ClearUserFromRoomDTO {
  server: Server;
  socket: Socket;
}

// Games
export class MakeMoveDTO {
  server: Server;
  roomId: string;
  newBoard: BoardDisksType;
  currentPlayer: CurrentPlayerType;
  winner: CurrentPlayerType | null;
}

export class AskForRematchDTO {
  server: Server;
  roomId: string;
  socket: Socket;
}

// Game stats
export class LoadGameStatsDTO {
  socket: Socket;
  token: string | null;
}

export class RecordGameResultDTO {
  socket: Socket;
  token: string | null;
  result: GameResultType;
}
