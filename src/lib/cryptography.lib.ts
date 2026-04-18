/**
 * AES-256 requires exactly 32 bytes
 * secret length need to 32 bytes or 64 characters long
 *
 * SHA-256 hash is deterministic, same input - same hash, always!
 */

import { HttpStatus, Injectable, Module } from '@nestjs/common';
import { createCipheriv, createDecipheriv, createHash, randomBytes } from 'crypto';

import { AppException } from '../exception/appException.exception.js';

enum TokenFormat {
  HEX = 'hex',
  NUMERIC = 'numeric',
  ALPHANUMERIC = 'alphanumeric',
}

@Injectable()
export class CryptographyLibService {
  private readonly algorithm = 'aes-256-gcm';
  private readonly ivLength = 12;

  private generateHash(value: string): string {
    return createHash('sha256').update(value).digest('hex');
  }

  private generateToken(format: TokenFormat, length: number): string {
    switch (format) {
      case TokenFormat.HEX:
        return randomBytes(Math.ceil(length / 2))
          .toString('hex')
          .slice(0, length);
      case TokenFormat.NUMERIC:
        return Array.from(randomBytes(length))
          .map((b) => b % 10)
          .join('');
      case TokenFormat.ALPHANUMERIC: {
        const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
        const charsLength = chars.length; // 62
        const maxValidByte = Math.floor(256 / charsLength) * charsLength; // 248

        let token = '';

        while (token.length < length) {
          const bytes = randomBytes(length);

          for (const b of bytes) {
            if (b >= maxValidByte) continue;

            token += chars[b % charsLength];

            if (token.length === length) break;
          }
        }

        return token;
      }
    }
  }

  private encryptToken(payload: string, secret: string): string {
    try {
      const iv = randomBytes(this.ivLength);
      const cipher = createCipheriv(this.algorithm, Buffer.from(secret, 'hex'), iv);

      const encrypted = Buffer.concat([cipher.update(payload, 'utf8'), cipher.final()]);
      const authTag = cipher.getAuthTag();

      return `${iv.toString('hex')}.${encrypted.toString('hex')}.${authTag.toString('hex')}`;
    } catch (error) {
      throw new AppException({ message: 'Token encryption failed', error: {} }, HttpStatus.INTERNAL_SERVER_ERROR, {
        cause: error,
        description: 'encryptToken',
      });
    }
  }

  private decryptToken(encryptedToken: string, secret: string): string {
    try {
      const [ivHex, encryptedHex, authTagHex] = encryptedToken.split('.');

      const iv = Buffer.from(ivHex, 'hex');
      const encrypted = Buffer.from(encryptedHex, 'hex');
      const authTag = Buffer.from(authTagHex, 'hex');

      const decipher = createDecipheriv(this.algorithm, Buffer.from(secret, 'hex'), iv);
      decipher.setAuthTag(authTag);

      const decrypted = Buffer.concat([decipher.update(encrypted), decipher.final()]);
      return decrypted.toString('utf8');
    } catch (error) {
      throw new AppException({ message: 'Token decryption failed', error: {} }, HttpStatus.INTERNAL_SERVER_ERROR, {
        cause: error,
        description: 'decryptToken',
      });
    }
  }

  public generateEncryptedVerifyToken(userId: string, secret: string): string {
    const token = this.generateToken(TokenFormat.HEX, 32);
    return this.encryptToken(`${token}.${userId}`, secret);
  }

  public decodeEncryptedVerifyToken(encryptedToken: string, secret: string): { token: string; userId: string } {
    const decrypted = this.decryptToken(encryptedToken, secret);
    const [token, userId] = decrypted.split('.');
    return { token, userId };
  }

  public generateEncryptedForgetPasswordToken(userId: string, secret: string): string {
    const token = this.generateToken(TokenFormat.HEX, 32);
    return this.encryptToken(`${token}.${userId}`, secret);
  }

  public decodeEncryptedForgetPasswordToken(encryptedToken: string, secret: string): { token: string; userId: string } {
    const decrypted = this.decryptToken(encryptedToken, secret);
    const [token, userId] = decrypted.split('.');
    return { token, userId };
  }

  public generateTwoFAToken(): string {
    return this.generateToken(TokenFormat.NUMERIC, 6);
  }

  public generateRefreshTokenHash(token: string): string {
    return this.generateHash(token);
  }
}

@Module({
  imports: [],
  controllers: [],
  providers: [CryptographyLibService],
  exports: [CryptographyLibService],
})
export class CryptographyLibModule {}
