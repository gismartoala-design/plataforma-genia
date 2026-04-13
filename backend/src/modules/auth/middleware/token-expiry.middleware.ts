import {
  Injectable,
  NestMiddleware,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Request, Response, NextFunction } from 'express';

@Injectable()
export class TokenExpiryMiddleware implements NestMiddleware {
  constructor(private readonly jwtService: JwtService) {}

  use(req: Request, res: Response, next: NextFunction) {
    const authHeader = req.headers.authorization;

    if (!authHeader?.startsWith('Bearer ')) {
      return res.status(401).json({
        message: 'Sesión requerida.',
        code: 'AUTH_REQUIRED',
      });
    }

    const token = authHeader.slice(7).trim();

    try {
      this.jwtService.verify(token);
      next();
    } catch (error: any) {
      const isExpired = error?.name === 'TokenExpiredError';

      return res.status(401).json({
        message: isExpired
          ? 'Tu sesión expiró. Inicia sesión nuevamente.'
          : 'Token inválido.',
        code: isExpired ? 'TOKEN_EXPIRED' : 'INVALID_TOKEN',
      });
    }
  }
}
