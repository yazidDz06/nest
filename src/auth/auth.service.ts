import { Injectable, ForbiddenException, BadRequestException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from '../users/users.service';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
    private config: ConfigService,
  ) {}

  /**
   * Enregistrement d'un utilisateur
   * Hash le mot de passe avant de le stocker
   */
  async register(name: string, email: string, password: string) {
    const EmailExists = await this.usersService.findByEmail(email)
    
    if(EmailExists){
      throw new BadRequestException("email already exists")
    }

    const hash = await bcrypt.hash(password, 10);
    const user = await this.usersService.create({
      name,
      email,
      password: hash,
    });

    // Supprimer le mot de passe et refreshTokenHash avant de renvoyer l'utilisateur
    delete (user as any).password;
    delete (user as any).refreshTokenHash;

    return {
      message: 'Utilisateur créé avec succès',
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        createdAt: user.createdAt,
      },
    };
  }

  /**
   * Vérifie que le mot de passe correspond à l'email
   * Retourne l'utilisateur si ok
   */
  async validateUser(email: string, password: string) {
    const user = await this.usersService.findByEmail(email);
    if (!user) return null;

    const isValid = await bcrypt.compare(password, user.password);
    if (!isValid) return null;

     return {
      message: 'Logged in successfuly',
      user: {
        name: user.name,
        email: user.email,
        role: user.role,
      },
    };
  }

  /**
   * Génère Access Token (court) + Refresh Token (long)
   */
  async getTokens(user: { id: number; email: string; role?: string }) {
    const payload = {
      sub: user.id,
      email: user.email,
      role: user.role || 'USER',
    };

    // Access token : durée courte
    const accessToken = await this.jwtService.signAsync(payload, {
      secret: this.config.get('JWT_ACCESS_SECRET'),
      expiresIn: this.config.get('JWT_ACCESS_EXPIRES') || '15s',
    });

    // Refresh token : durée longue
    const refreshToken = await this.jwtService.signAsync(payload, {
      secret: this.config.get('JWT_REFRESH_SECRET'),
      expiresIn: this.config.get('JWT_REFRESH_EXPIRES') || '7d',
    });

    return { accessToken, refreshToken };
  }

  /**
   * Stocke le refresh token hashé dans la base
   * Après chaque login ou refresh
   */
  async storeRefreshToken(userId: number, refreshToken: string) {
    const hash = await bcrypt.hash(refreshToken, 10);
    await this.usersService.updateRefreshToken(userId, hash);
  }

  /**
   * Supprime le refresh token hashé (logout)
   */
  async removeRefreshToken(userId: number) {
    await this.usersService.removeRefreshToken(userId);
  }

  /**
   * Vérifie que le refresh token envoyé correspond au hash en DB(en service pas en strategy)
   * Si invalide : ForbiddenException
   */
  async validateRefreshTokenAgainstDb(userId: number, refreshToken: string) {
    const user = await this.usersService.findById(userId);

    if (!user || !user.refreshTokenHash) {
      throw new ForbiddenException('Access Denied');
    }

    const isMatch = await bcrypt.compare(refreshToken, user.refreshTokenHash);

    if (!isMatch) {
      throw new ForbiddenException('Access Denied');
    }

    // Tout est ok
    return true;
  }
}

