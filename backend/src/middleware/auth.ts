import { Request, Response, NextFunction } from 'express';
import crypto from 'crypto';

const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD;
const validTokens = new Set<string>();

// Generate a secure random token
export const generateToken = (): string => {
  return crypto.randomBytes(32).toString('hex');
};

// Validate token
export const isValidToken = (token: string): boolean => {
  return validTokens.has(token);
};

// Add token to valid set
export const addToken = (token: string): void => {
  validTokens.add(token);
};

// Remove token (for logout)
export const removeToken = (token: string): void => {
  validTokens.delete(token);
};

// Middleware to protect routes
export const requireAuth = (req: Request, res: Response, next: NextFunction): void => {
  const authHeader = req.headers.authorization;
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    res.status(401).json({ message: 'Unauthorized: No token provided' });
    return;
  }

  const token = authHeader.split(' ')[1];
  
  if (!isValidToken(token)) {
    res.status(401).json({ message: 'Unauthorized: Invalid token' });
    return;
  }
  
  next();
};

// Verify password
export const verifyPassword = (password: string): boolean => {
  return password === ADMIN_PASSWORD;
};