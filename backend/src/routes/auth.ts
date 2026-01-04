import express, { Request, Response } from 'express';
import { generateToken, addToken, verifyPassword, isValidToken, removeToken } from '../middleware/auth';

const router = express.Router();

// Login endpoint
router.post('/login', (req: Request, res: Response): void => {
  const { password } = req.body;
  
  console.log('Login attempt with password:', password);
  console.log('Expected password:', process.env.ADMIN_PASSWORD);
  
  if (!password) {
    res.status(400).json({ 
      success: false, 
      message: 'Password is required' 
    });
    return;
  }
  
  if (verifyPassword(password)) {
    const token = generateToken();
    addToken(token);
    
    console.log('Login successful, token generated');
    
    res.json({ 
      success: true, 
      token: token 
    });
  } else {
    console.log('Login failed - password mismatch');
    
    res.status(401).json({ 
      success: false, 
      message: 'Invalid password' 
    });
  }
});

// Verify token endpoint (optional but useful)
router.get('/verify', (req: Request, res: Response): void => {
  const authHeader = req.headers.authorization;
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    res.status(401).json({ valid: false });
    return;
  }

  const token = authHeader.split(' ')[1];
  
  if (isValidToken(token)) {
    res.json({ valid: true });
  } else {
    res.status(401).json({ valid: false });
  }
});

// Logout endpoint (optional)
router.post('/logout', (req: Request, res: Response): void => {
  const authHeader = req.headers.authorization;
  
  if (authHeader && authHeader.startsWith('Bearer ')) {
    const token = authHeader.split(' ')[1];
    removeToken(token);
  }
  
  res.json({ success: true });
});

export default router;