import type {
  GameStatsSyncPayload,
  IRoomInfo,
  SocketEventErrorPayload,
  SocketEventType,
} from '@4dots/shared';
import { Injectable } from '@nestjs/common';
import { GameStatsService } from '../game-stats/game-stats.service';
import type {
  AskForRematchDTO,
  ClearUserFromRoomDTO,
  CreateRoomDTO,
  JoinLeaveStartRoomDTO,
  LoadGameStatsDTO,
  MakeMoveDTO,
  RecordGameResultDTO,
} from './event.dto';

@Injectable()
export class EventService {
  constructor(private readonly gameStatsService: GameStatsService) {}

  private rooms: Array<IRoomInfo> = [];

  createRoom({ room, server: _server, socket }: CreateRoomDTO) {
    this.rooms.push(room);
    socket.emit<SocketEventType>('createRoom', room);
  }

  joinRoom({ roomId, server, socket }: JoinLeaveStartRoomDTO) {
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
      room.player2Id = socket.id;
    }

    server
      .to([room.hostId, room.visitorId])
      .emit<SocketEventType>('roomUpdated', room);
  }

  leaveRoom({ roomId, server, socket }: JoinLeaveStartRoomDTO) {
    const room = this.rooms.find((room) => room.id === roomId);

    if (!room) {
      return;
    }

    // If host leaves, delete the room and notify the visitor
    if (room.hostId === socket.id) {
      server
        .to([room.hostId, room.visitorId])
        .emit<SocketEventType>('roomDeleted', room);
      this.rooms = this.rooms.filter((_room) => _room.id !== room.id);
    } else if (room.visitorId === socket.id) {
      room.visitorId = null;
      server
        .to([room.hostId, room.visitorId])
        .emit<SocketEventType>('roomUpdated', room);
    }

    socket.emit<SocketEventType>('roomLeft');
  }

  clearUserFromRoom({ socket, server }: ClearUserFromRoomDTO) {
    const room = this.rooms.find(
      (room) => room.hostId === socket.id || room.visitorId === socket.id,
    );

    if (room) {
      console.log(`User ${socket.id} disconnected from room ${room.id}`);

      // If host disconnects, delete the room and notify both players
      if (room.hostId === socket.id) {
        console.log('Host disconnected, deleting room');
        server
          .to([room.hostId, room.visitorId])
          .emit<SocketEventType>('roomDeleted', room);
        this.rooms = this.rooms.filter((_room) => _room.id !== room.id);
      }
      // If visitor disconnects, clear visitor and notify both players
      else if (room.visitorId === socket.id) {
        console.log('Visitor disconnected, clearing visitor');
        room.visitorId = null;
        room.player2Id = null;
        server
          .to([room.hostId, room.visitorId])
          .emit<SocketEventType>('roomUpdated', room);
      }
    }
  }

  startGame({ roomId, server, socket }: JoinLeaveStartRoomDTO) {
    const roomIndex = this.rooms.findIndex((room) => room.id === roomId);

    if (roomIndex === -1) {
      socket.emit<SocketEventType>('error', {
        type: 'Error.RoomNotFound',
      } as SocketEventErrorPayload);
      return;
    }

    const updatedRoom = {
      ...this.rooms[roomIndex],
      hasGameStarted: true,
      isPlayer1Rematching: false,
      isPlayer2Rematching: false,
    };
    this.rooms[roomIndex] = updatedRoom;

    server
      .to(updatedRoom.visitorId)
      .emit<SocketEventType>('startGame', updatedRoom);
  }

  makeMove({ roomId, newBoard, currentPlayer, winner, server }: MakeMoveDTO) {
    const room = this.rooms.find((room) => room.id === roomId);

    if (!room) {
      return;
    }

    server
      .to([room.hostId, room.visitorId])
      .emit<SocketEventType>('boardUpdated', {
        newBoard,
        currentPlayer,
        winner,
      });
  }

  askForRematch({ roomId, socket, server }: AskForRematchDTO) {
    const roomIndex = this.rooms.findIndex((room) => room.id === roomId);

    if (roomIndex === -1) {
      return;
    }

    const room = this.rooms[roomIndex];
    let recipientId: string;

    if (room.player1Id === socket.id) {
      room.isPlayer1Rematching = true;
      recipientId = room.player2Id;
    } else {
      room.isPlayer2Rematching = true;
      recipientId = room.player1Id;
    }

    if (room.isPlayer1Rematching && room.isPlayer2Rematching) {
      // Both players want to rematch, start a new game
      const updatedRoom = {
        ...room,
        hasGameStarted: true,
        isPlayer1Rematching: false,
        isPlayer2Rematching: false,
      };

      // Update the room in the server's rooms array
      this.rooms[roomIndex] = updatedRoom;

      server
        .to([room.player1Id, room.player2Id])
        .emit<SocketEventType>('rematchAccepted', updatedRoom);
    } else {
      // Only one player wants to rematch, notify the other
      server.to(recipientId).emit<SocketEventType>('rematchRequested', room);
    }
  }

  // Decrypts the client's token (if any) and returns the stats together with a
  // freshly encrypted token to persist.
  loadGameStats({ socket, token }: LoadGameStatsDTO) {
    const stats = this.gameStatsService.load(token);
    socket.emit<SocketEventType>('gameStatsSynced', {
      stats,
      token: this.gameStatsService.encrypt(stats),
    } as GameStatsSyncPayload);
  }

  // Applies a finished game's result authoritatively, then returns the updated
  // stats and a new token. The client never mutates the persisted numbers.
  recordGameResult({ socket, token, result }: RecordGameResultDTO) {
    const current = this.gameStatsService.load(token);
    const stats = this.gameStatsService.applyResult(current, result);
    socket.emit<SocketEventType>('gameStatsSynced', {
      stats,
      token: this.gameStatsService.encrypt(stats),
    } as GameStatsSyncPayload);
  }
}
