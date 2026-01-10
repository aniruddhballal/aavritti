import express, { Request, Response } from 'express';

const router = express.Router();

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

// IP verification endpoint
router.get('/verify-ip', (req: Request, res: Response): void => {
  const clientIp = getClientIp(req);
  const normalizedClientIp = normalizeIp(clientIp);
    
  const isAllowed = ALLOWED_IPS.some(allowedIp => {
    const normalizedAllowedIp = normalizeIp(allowedIp);
    return normalizedClientIp === normalizedAllowedIp;
  });
  
  if (isAllowed) {
    res.status(200).json({
      success: true,
      message: 'IP address authorized',
      ip: clientIp
    });
  } else {
    res.status(403).json({
      success: false,
      message: 'Access denied: IP address not authorized',
      ip: clientIp
    });
  }
});

// Optional: Endpoint to check your current IP (useful for debugging)
router.get('/my-ip', (req: Request, res: Response): void => {
  const clientIp = getClientIp(req);
  res.json({ 
    ip: clientIp,
    normalized: normalizeIp(clientIp)
  });
});

export default router;