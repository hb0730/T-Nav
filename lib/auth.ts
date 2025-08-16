import type { User } from '~/types/database'
import bcryptjs from 'bcryptjs'
import jwt from 'jsonwebtoken'

const JWT_SECRET = process.env.JWT_SECRET || 'fallback-secret-key'

export async function hashPassword(password: string): Promise<string> {
  return await bcryptjs.hash(password, 12)
}

export async function verifyPassword(password: string, hashedPassword: string): Promise<boolean> {
  return await bcryptjs.compare(password, hashedPassword)
}

export function generateToken(user: Omit<User, 'password'>): string {
  return jwt.sign(
    {
      id: user.id,
      username: user.username,
      role: user.role,
    },
    JWT_SECRET,
    { expiresIn: '7d' },
  )
}

export function verifyToken(token: string): any {
  try {
    return jwt.verify(token, JWT_SECRET)
  }
  catch (error) {
    return null
  }
}

export function extractUserFromToken(token: string): { id: string, username: string, role: string } | null {
  const decoded = verifyToken(token)
  if (!decoded || typeof decoded !== 'object') {
    return null
  }
  return decoded as { id: string, username: string, role: string }
}

export async function verifyAuth(event: any): Promise<{ success: boolean, user?: any, message?: string }> {
  const token = getCookie(event, 'auth-token') || getHeader(event, 'authorization')?.replace('Bearer ', '')

  if (!token) {
    return {
      success: false,
      message: 'No token provided',
    }
  }

  const user = extractUserFromToken(token)
  if (!user) {
    return {
      success: false,
      message: 'Invalid token',
    }
  }

  return {
    success: true,
    user,
  }
}
