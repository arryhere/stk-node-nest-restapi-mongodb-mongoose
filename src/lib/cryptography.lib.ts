import { HttpStatus, Injectable, Module } from '@nestjs/common';
import { createCipheriv, createDecipheriv, randomBytes } from 'crypto';

import { AppException } from '../exception/appException.exception.js';

enum TokenFormat {
  HEX = 'hex',
  NUMERIC = 'numeric',
  ALPHANUMERIC = 'alphanumeric',
}

@Injectable()
export class CryptographyLibService {
  private readonly algorithm = 'aes-256-cbc';
  private readonly ivLength = 16;

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
        return Array.from(randomBytes(length))
          .map((b) => chars[b % chars.length])
          .join('');
      }
    }
  }

  private encryptToken(payload: string, secret: string): string {
    try {
      const iv = randomBytes(this.ivLength);
      const cipher = createCipheriv(this.algorithm, Buffer.from(secret, 'hex'), iv);

      const encrypted = Buffer.concat([cipher.update(payload, 'utf8'), cipher.final()]);

      // Prepend IV to encrypted data so we can use it during decryption
      return `${iv.toString('hex')}.${encrypted.toString('hex')}`;
    } catch (error) {
      throw new AppException({ message: 'Token encryption failed', error: {} }, HttpStatus.INTERNAL_SERVER_ERROR, {
        cause: error,
        description: 'encryptToken',
      });
    }
  }

  private decryptToken(encryptedToken: string, secret: string): string {
    try {
      const [ivHex, encryptedHex] = encryptedToken.split('.');

      const iv = Buffer.from(ivHex, 'hex');
      const encrypted = Buffer.from(encryptedHex, 'hex');

      const decipher = createDecipheriv(this.algorithm, Buffer.from(secret, 'hex'), iv);

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
    console.log({ token });
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
}

@Module({
  imports: [],
  controllers: [],
  providers: [CryptographyLibService],
  exports: [CryptographyLibService],
})
export class CryptographyLibModule {}
