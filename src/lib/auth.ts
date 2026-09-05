import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { cookies } from 'next/headers';

const JWT_SECRET = process.env.JWT_SECRET || 'binary-club-secret-key-2026-super-secure';
const TOKEN_NAME = 'binary_auth_token';

export interface UserTokenPayload {
  id: string;
  name: string;
  email: string;
  role: 'ADMIN' | 'INTERVIEWER';
}

export async function hashPassword(password: string): Promise<string> {
  const salt = await bcrypt.genSalt(10);
  return bcrypt.hash(password, salt);
}

export async function comparePassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

export function signToken(payload: UserTokenPayload): string {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: '7d' });
}

export function verifyToken(token: string): UserTokenPayload | null {
  try {
    return jwt.verify(token, JWT_SECRET) as UserTokenPayload;
  } catch {
    return null;
  }
}

export async function getAuthSession(): Promise<UserTokenPayload | null> {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get(TOKEN_NAME)?.value;
    if (!token) return null;
    return verifyToken(token);
  } catch {
    return null;
  }
}

export function setAuthCookie(resHeaders: Headers, token: string) {
  resHeaders.append(
    'Set-Cookie',
    `${TOKEN_NAME}=${token}; Path=/; HttpOnly; SameSite=Lax; Max-Age=${60 * 60 * 24 * 7}`
  );
}

export function clearAuthCookie(resHeaders: Headers) {
  resHeaders.append(
    'Set-Cookie',
    `${TOKEN_NAME}=; Path=/; HttpOnly; SameSite=Lax; Max-Age=0`
  );
}
