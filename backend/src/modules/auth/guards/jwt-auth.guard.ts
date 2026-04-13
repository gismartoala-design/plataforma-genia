
import { Injectable, UnauthorizedException, ExecutionContext } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
    handleRequest(err: any, user: any, info: any, context: ExecutionContext) {
        const request = context.switchToHttp().getRequest();
        const authHeader = request.headers['authorization'];
        
        console.log(`[JwtAuthGuard] Request to ${request.method} ${request.url}`);
        console.log(`[JwtAuthGuard] Authorization Header: ${authHeader ? 'Present' : 'MISSING'}`);
        if (authHeader) console.log(`[JwtAuthGuard] Header Value prefix: ${authHeader.substring(0, 15)}...`);

        if (err || !user) {
            console.log('[JwtAuthGuard] Auth Failed for:', request.method, request.url);
            console.log('[JwtAuthGuard] Error:', err);
            console.log('[JwtAuthGuard] Info:', info);
            
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
        
        console.log('[JwtAuthGuard] Auth Success. User:', user.email);
        return user;
    }
}
