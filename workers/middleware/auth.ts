// workers/middleware/auth.ts

import { jwtVerify, SignJWT, JWTPayload } from 'jose';
import type { Context, Next } from 'hono';

const SECRET = new TextEncoder().encode(Deno.env.get('JWT_SECRET')!);

// Middleware to verify incoming tokens
export async function auth(c: Context, next: Next) {
  try {
    const authHeader = c.req.headers.get('Authorization') || '';
    const token = authHeader.replace(/^Bearer\s+/, '');

    const { payload } = await jwtVerify(token, SECRET, {
      issuer: 'insight-hunter',
      audience: 'user',
      algorithms: ['HS256'],
    });

    // attach verified payload for downstream handlers
    (c as any).jwtPayload = payload;
    await next();
  } catch {
    return c.text('Unauthorized', 401);
  }
}

// Factory to enforce roles
export function requireRole(role: string) {
  return async (c: Context, next: Next) => {
    const payload = (c as any).jwtPayload as JWTPayload;
    if (!payload || payload.role !== role) {
      return c.text('Forbidden', 403);
    }
    await next();
  };
}

// Helper to sign tokens
export async function signToken(
  data: Record<string, unknown>
): Promise<string> {
  return new SignJWT(data)
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuer('insight-hunter')
    .setAudience('user')
    .setExpirationTime('2h')
    .sign(SECRET);
}
