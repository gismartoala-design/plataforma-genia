
import { Injectable, UnauthorizedException, ExecutionContext } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
    handleRequest(err: any, user: any, info: any, context: ExecutionContext) {
        const request = context.switchToHttp().getRequest();
        const authHeader = request.headers['authorization'];
        
        if (err || !user) {
            let code = 'INVALID_TOKEN';
            if (info?.name === 'TokenExpiredError') {
                code = 'TOKEN_EXPIRED';
            } else if (!authHeader) {
                code = 'AUTH_REQUIRED';
            }

            throw err || new UnauthorizedException({
                statusCode: 401,
                message: info?.message || 'Unauthorized',
                code: code
            });
        }
        
        return user;
    }
}
