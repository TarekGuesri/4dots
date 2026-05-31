import type { GameResultType, IGameStats } from '@4dots/shared';
import { Injectable, Logger } from '@nestjs/common';
import * as crypto from 'crypto';
import config from '../../config/config.constants';

const ALGORITHM = 'aes-256-gcm';
const IV_LENGTH = 12;
const AUTH_TAG_LENGTH = 16;

const INITIAL_STATS: IGameStats = {
  totalGames: 0,
  wins: 0,
  losses: 0,
  draws: 0,
  winStreak: 0,
  longestWinStreak: 0,
};

@Injectable()
export class GameStatsService {
  private readonly logger = new Logger(GameStatsService.name);

  // Derive a fixed-length 256-bit key from the configured secret so the secret
  // can be any length while the cipher still gets a valid key.
  private readonly key = crypto
    .createHash('sha256')
    .update(config.GAME_STATS_SECRET)
    .digest();

  /**
   * Encrypts the stats into a self-contained, tamper-evident base64 token.
   * Layout: [12B IV][16B auth tag][ciphertext].
   */
  encrypt(stats: IGameStats): string {
    const iv = crypto.randomBytes(IV_LENGTH);
    const cipher = crypto.createCipheriv(ALGORITHM, this.key, iv);

    const ciphertext = Buffer.concat([
      cipher.update(JSON.stringify(stats), 'utf8'),
      cipher.final(),
    ]);
    const authTag = cipher.getAuthTag();

    return Buffer.concat([iv, authTag, ciphertext]).toString('base64');
  }

  /**
   * Decrypts a token back into stats. Returns null when the token is missing,
   * malformed, or has been tampered with (auth tag mismatch).
   */
  decrypt(token: string | null): IGameStats | null {
    if (!token) return null;

    try {
      const raw = Buffer.from(token, 'base64');
      const iv = raw.subarray(0, IV_LENGTH);
      const authTag = raw.subarray(IV_LENGTH, IV_LENGTH + AUTH_TAG_LENGTH);
      const ciphertext = raw.subarray(IV_LENGTH + AUTH_TAG_LENGTH);

      const decipher = crypto.createDecipheriv(ALGORITHM, this.key, iv);
      decipher.setAuthTag(authTag);

      const decrypted = Buffer.concat([
        decipher.update(ciphertext),
        decipher.final(),
      ]).toString('utf8');

      return this.normalize(JSON.parse(decrypted));
    } catch {
      // Invalid/tampered token: treat it as no saved stats rather than crashing.
      this.logger.warn('Received an invalid game stats token; ignoring it.');
      return null;
    }
  }

  /** Resolves a token to stats, falling back to a fresh stats object. */
  load(token: string | null): IGameStats {
    return this.decrypt(token) ?? { ...INITIAL_STATS };
  }

  /** Applies a finished game's result to the stats authoritatively. */
  applyResult(stats: IGameStats, result: GameResultType): IGameStats {
    const next: IGameStats = { ...stats, totalGames: stats.totalGames + 1 };

    if (result === 'win') {
      next.wins += 1;
      next.winStreak += 1;
      next.longestWinStreak = Math.max(next.longestWinStreak, next.winStreak);
    } else if (result === 'loss') {
      next.losses += 1;
      next.winStreak = 0;
    } else {
      next.draws += 1;
      next.winStreak = 0;
    }

    return next;
  }

  /** Coerces decoded JSON into a safe, non-negative integer stats object. */
  private normalize(value: Partial<IGameStats>): IGameStats {
    const toCount = (input: unknown): number => {
      const num = Number(input);
      return Number.isFinite(num) && num > 0 ? Math.floor(num) : 0;
    };

    return {
      totalGames: toCount(value.totalGames),
      wins: toCount(value.wins),
      losses: toCount(value.losses),
      draws: toCount(value.draws),
      winStreak: toCount(value.winStreak),
      longestWinStreak: toCount(value.longestWinStreak),
    };
  }
}
