import { Request, Response, NextFunction } from 'express';

// Get allowed IPs from environment variable
const ALLOWED_IPS = process.env.ALLOWED_IPS?.split(',').map(ip => ip.trim()) || [];

// Helper function to get client IP address
const getClientIp = (req: Request): string => {
  const forwarded = req.headers['x-forwarded-for'];
  
  if (forwarded) {
    return Array.isArray(forwarded) ? forwarded[0] : forwarded.split(',')[0].trim();
  }
  
  return req.headers['x-real-ip'] as string ||
         req.socket.remoteAddress ||
         req.ip ||
         '';
};

// Helper function to normalize IP for comparison
const normalizeIp = (ip: string): string => {
  if (ip === '::ffff:127.0.0.1' || ip === '::1') {
    return '127.0.0.1';
  }
  return ip;
};

// Check if IP is allowed
const isIpAllowed = (ip: string): boolean => {
  const normalizedClientIp = normalizeIp(ip);
  
  return ALLOWED_IPS.some(allowedIp => {
    const normalizedAllowedIp = normalizeIp(allowedIp);
    return normalizedClientIp === normalizedAllowedIp;
  });
};

// Middleware to protect routes based on IP address
export const requireAuth = (req: Request, res: Response, next: NextFunction): void => {
  const clientIp = getClientIp(req);
  
  if (!isIpAllowed(clientIp)) {
    console.log('Unauthorized access attempt from IP:', clientIp);
    res.status(403).json({ 
      message: 'Forbidden: IP address not authorized',
      ip: clientIp
    });
    return;
  }
  
  // IP is authorized, proceed to the route
  next();
};