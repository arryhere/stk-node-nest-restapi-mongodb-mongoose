import { HttpStatus, Injectable, Module } from '@nestjs/common';
import {
  createCipheriv,
  createDecipheriv,
  randomBytes,
  createHash,
} from 'crypto';

import { AppException } from '../exception/appException.exception.js';

type TokenFormat = 'hex' | 'numeric' | 'alphanumeric';

@Injectable()
export class CryptographyLibService {
  private readonly algorithm = 'aes-256-gcm';
  private readonly ivLength = 12; // recommended for GCM
  private readonly authTagLength = 16;

  // ✅ Derive 32-byte key from any string
  private getKey(secret: string): Buffer {
    return createHash('sha256').update(secret).digest();
  }

  generateToken(format: TokenFormat, length: number): string {
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
        const chars =
          'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
        return Array.from(randomBytes(length))
          .map((b) => chars[b % chars.length])
          .join('');
      }
    }
  }

  // 🔐 Encrypt with AES-256-GCM
  encryptToken(payload: string, secret: string): string {
    try {
      const iv = randomBytes(this.ivLength);
      const key = this.getKey(secret);

      const cipher = createCipheriv(this.algorithm, key, iv);

      const encrypted = Buffer.concat([
        cipher.update(payload, 'utf8'),
        cipher.final(),
      ]);

      const authTag = cipher.getAuthTag();

      // format: iv.encrypted.authTag
      return `${iv.toString('hex')}.${encrypted.toString('hex')}.${authTag.toString('hex')}`;
    } catch (error) {
      throw new AppException(
        { message: 'Token encryption failed', error: {} },
        HttpStatus.INTERNAL_SERVER_ERROR,
        {
          cause: error,
          description: 'encryptToken',
        },
      );
    }
  }

  // 🔓 Decrypt with authentication check
  decryptToken(encryptedToken: string, secret: string): string {
    try {
      const [ivHex, encryptedHex, authTagHex] = encryptedToken.split('.');

      const iv = Buffer.from(ivHex, 'hex');
      const encrypted = Buffer.from(encryptedHex, 'hex');
      const authTag = Buffer.from(authTagHex, 'hex');

      const key = this.getKey(secret);

      const decipher = createDecipheriv(this.algorithm, key, iv);
      decipher.setAuthTag(authTag);

      const decrypted = Buffer.concat([
        decipher.update(encrypted),
        decipher.final(),
      ]);

      return decrypted.toString('utf8');
    } catch (error) {
      throw new AppException(
        { message: 'Invalid or tampered token', error: {} },
        HttpStatus.UNAUTHORIZED,
        {
          cause: error,
          description: 'decryptToken',
        },
      );
    }
  }

  getUserIdFromDecryptedToken(decryptedToken: string): string {
    const parts = decryptedToken.split('.');
    return parts[1];
  }

  generateVerifyToken(userId: string, secret: string): string {
    const token = this.generateToken('hex', 32);
    return this.encryptToken(`${token}.${userId}`, secret);
  }

  generateForgetPasswordToken(userId: string, secret: string): string {
    const token = this.generateToken('hex', 32);
    return this.encryptToken(`${token}.${userId}`, secret);
  }

  generateTwoFAToken(): string {
    return this.generateToken('numeric', 6);
  }
}

@Module({
  providers: [CryptographyLibService],
  exports: [CryptographyLibService],
})
export class CryptographyLibModule {}