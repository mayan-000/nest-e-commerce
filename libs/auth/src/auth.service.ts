import { Injectable } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import * as crypto from 'crypto';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class AuthService {
  private readonly users = [
    {
      id: '1',
      username: 'user1',
      password: '$2b$10$ixZaYVK1fsbw1ZfbX3OXePaWxn96p36Zf4aWJm1p1J1Z1Z1Z1Z1Z',
      email: 'user1@example.com',
    },
    {
      id: '2',
      username: 'user2',
      password: '$2b$10$EixZaYVK1fsbw1ZfbX3OXePaWxn96p36Zf4aWJm1p1J1Z1Z1Z1Z1Z',
      email: 'user2@example.com',
    },
  ];

  private resetTokens: Map<string, string> = new Map();

  constructor(private readonly jwtService: JwtService) {}

  async validateUser(username: string, pass: string): Promise<any> {
    const user = this.users.find((user) => user.username === username);
    if (user && (await bcrypt.compare(pass, user.password))) {
      delete user.password;
      return user;
    }
    return null;
  }

  async login(user: any) {
    const payload = { username: user.username, sub: user.id };
    return {
      access_token: this.jwtService.sign(payload),
    };
  }

  blacklistToken(token: string) {
    this.resetTokens.delete(token);
  }

  generateResetToken(email: string): string {
    const token = crypto.randomBytes(20).toString('hex');
    this.resetTokens.set(token, email);
    return token;
  }

  validateResetToken(token: string): string | null {
    return this.resetTokens.get(token) || null;
  }

  resetPassword(email: string, newPassword: string) {
    const user = this.users.find((user) => user.email === email);
    if (user) {
      user.password = bcrypt.hashSync(newPassword, 10);
    }
  }
}
