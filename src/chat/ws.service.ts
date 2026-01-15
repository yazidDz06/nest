import { Injectable, UnauthorizedException } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import { Socket } from "socket.io";

@Injectable()
export class SocketIoService {
  constructor(private jwtService: JwtService) {}

  /**
   * Extraire et vérifier le token JWT depuis les cookies du client WebSocket
   */
  extractAndVerifyToken(client: Socket) {
    const cookieHeader = client.handshake.headers.cookie;
    
    if (!cookieHeader) {
      throw new UnauthorizedException('No cookie');
    }

    const token = cookieHeader
      .split(';')
      .map(c => c.trim())
      .find(c => c.startsWith('access_token='))
      ?.split('=')[1];

    if (!token) {
      throw new UnauthorizedException('No token');
    }

    try {
      const payload = this.jwtService.verify(token);
      return {
        id: payload.sub,
        email: payload.email,
        role: payload.role,
      };
    } catch (err) {
      throw new UnauthorizedException('Invalid token');
    }
  }

 //la méthode authrnticateClient va extraire et verifier le cookie et attache les données user au socket
 //c'est la méthode qui va etre appellé dans guard et gateway parceque elle reconnait le user 
  authenticateClient(client: Socket) {
    const user = this.extractAndVerifyToken(client);
    client.data.user = user;
    return user;
  }
}