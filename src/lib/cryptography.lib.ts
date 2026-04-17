import { HttpStatus, Injectable, Module } from '@nestjs/common';
import { createCipheriv, createDecipheriv, randomBytes } from 'crypto';

import { AppException } from '../exception/appException.exception.js';

type TokenFormat = 'hex' | 'numeric' | 'alphanumeric';

@Injectable()
export class CryptographyLibService {
  private readonly algorithm = 'aes-256-cbc';
  private readonly ivLength = 16;

  private generateToken(format: TokenFormat, length: number): string {
    switch (format) {
      case 'hex':
        return randomBytes(Math.ceil(length / 2))
          .toString('hex')
          .slice(0, length);
      case 'numeric':
        return Array.from(randomBytes(length))
          .map((b) => b % 10)
          .join('');
      case 'alphanumeric': {
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

  public generateVerifyToken(userId: string, secret: string): string {
    const token = this.generateToken('hex', 32);
    return this.encryptToken(`${token}.${userId}`, secret);
  }

  public decodeVerifyToken(encryptedToken: string, secret: string): { token: string; userId: string } {
    const decrypted = this.decryptToken(encryptedToken, secret);
    const [token, userId] = decrypted.split('.');
    return { token, userId };
  }

  public generateForgetPasswordToken(userId: string, secret: string): string {
    const token = this.generateToken('hex', 32);
    return this.encryptToken(`${token}.${userId}`, secret);
  }

  public decodeForgetPasswordToken(encryptedToken: string, secret: string): { token: string; userId: string } {
    const decrypted = this.decryptToken(encryptedToken, secret);
    const [token, userId] = decrypted.split('.');
    return { token, userId };
  }

  public generateTwoFAToken(): string {
    return this.generateToken('numeric', 6);
  }
}

@Module({
  imports: [],
  controllers: [],
  providers: [CryptographyLibService],
  exports: [CryptographyLibService],
})
export class CryptographyLibModule {}
