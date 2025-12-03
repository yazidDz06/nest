import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-jwt';
import { Request } from 'express';
import { ConfigService } from '@nestjs/config';


const cookieExtractor = (req: Request): string | null =>
  req?.cookies?.['refresh_token'] || null;

@Injectable()
//  Le nom "jwt-refresh" doit être unique, utilisé par RtGuard
export class RefreshStrategy extends PassportStrategy(Strategy, 'jwt-refresh') {
  constructor(config: ConfigService) {
    super({
    
      jwtFromRequest: cookieExtractor,

      //Clé secrète pour vérifier la signature du refresh JWT
       
      secretOrKey: config.get<string>('JWT_REFRESH_SECRET'),

      /**
       * Obligéeee : permet de recevoir le req complet
       * dans la méthode validate(req, payload)
       * (sinon - seulement payload)
       */
      passReqToCallback: true,
    });
  }

  /**
    Cette méthode s'exécute UNIQUEMENT si le refresh token :
    validate() permet ensuite de construire req.user
   */
  async validate(req: Request, payload: any) {
    /**
     *  récupère le token brut (non hashé) depuis le cookie
     *  pour pouvoir le comparer au token haché stocké en DB.
     */
    const refreshToken = req.cookies['refresh_token'];

    /**
     *  On renvoie un objet qui deviendra req.user
     */
    return {
      sub: payload.sub,      // id utilisateur
      email: payload.email,  
      role: payload.role,    
      refreshToken,          // token brut envoyé au service
    };
  }
}

