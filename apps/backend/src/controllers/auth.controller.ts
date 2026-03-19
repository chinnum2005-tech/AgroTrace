import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { Response } from 'express';
import prisma from '../database/prisma';
import { AppError } from '../middleware/errorHandler';
import { AuthRequest } from '../middleware/auth';
import { RegisterInput, LoginInput } from '../validators/schemas';

// Helper function to generate JWT tokens
const generateToken = (user: { id: string; email: string; role: string }) => {
  const jwtSecret = process.env.JWT_SECRET as string;
  const expiresIn = process.env.JWT_EXPIRES_IN || '24h';
  
  return jwt.sign(
    { id: user.id, email: user.email, role: user.role },
    jwtSecret,
    { expiresIn } as jwt.SignOptions
  );
};

// Helper function to generate refresh token (longer expiration)
const generateRefreshToken = (user: { id: string; email: string; role: string }) => {
  const jwtSecret = process.env.JWT_SECRET as string;
  const refreshExpiresIn = process.env.JWT_REFRESH_EXPIRES_IN || '7d';
  
  return jwt.sign(
    { id: user.id, email: user.email, role: user.role, type: 'refresh' },
    jwtSecret,
    { expiresIn: refreshExpiresIn } as jwt.SignOptions
  );
};

export const register = async (req: AuthRequest, res: Response) => {
  try {
    const { email, password, firstName, lastName, role, phone }: RegisterInput = req.body;

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      throw new AppError('Email already registered', 400);
    }

    // Hash password (using stronger salt rounds)
    const hashedPassword = await bcrypt.hash(password, 12);

    // Create user
    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        firstName,
        lastName,
        role: role || 'CONSUMER',
        phone,
      },
    });

    // Generate tokens
    const token = generateToken(user);
    const refreshToken = generateRefreshToken(user);

    res.status(201).json({
      success: true,
      message: 'User registered successfully',
      data: {
        user: {
          id: user.id,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          role: user.role,
        },
        token,
        refreshToken,
        expiresIn: process.env.JWT_EXPIRES_IN || '24h',
      },
    });
    
    // Log audit event
    await prisma.auditLog.create({
      data: {
        action: 'USER_REGISTERED',
        entity: 'User',
        entityId: user.id,
        userId: user.id,
        details: { email: user.email, role: user.role },
      },
    });
  } catch (error) {
    if (error instanceof AppError) throw error;
    console.error('Registration error:', error);
    throw new AppError('Failed to register user', 500);
  }
};

export const login = async (req: AuthRequest, res: Response) => {
  try {
    const { email, password }: LoginInput = req.body;

    // Find user
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      throw new AppError('Invalid credentials', 401);
    }

    // Verify password
    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      throw new AppError('Invalid credentials', 401);
    }

    // Generate tokens
    const token = generateToken(user);
    const refreshToken = generateRefreshToken(user);

    res.json({
      success: true,
      message: 'Login successful',
      data: {
        user: {
          id: user.id,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          role: user.role,
        },
        token,
        refreshToken,
        expiresIn: process.env.JWT_EXPIRES_IN || '24h',
      },
    });
    
    // Log audit event
    await prisma.auditLog.create({
      data: {
        action: 'USER_LOGIN',
        entity: 'User',
        entityId: user.id,
        userId: user.id,
        details: { email: user.email, role: user.role },
      },
    });
  } catch (error) {
    if (error instanceof AppError) throw error;
    console.error('Login error:', error);
    throw new AppError('Failed to login', 500);
  }
};

// Refresh token endpoint
export const refreshToken = async (req: AuthRequest, res: Response) => {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      throw new AppError('Refresh token required', 400);
    }

    // Verify refresh token
    const decoded = jwt.verify(refreshToken, process.env.JWT_SECRET!) as {
      id: string;
      email: string;
      role: string;
      type: string;
    };

    if (decoded.type !== 'refresh') {
      throw new AppError('Invalid token type', 401);
    }

    // Check if user still exists
    const user = await prisma.user.findUnique({ 
      where: { email: decoded.email } 
    });
    
    if (!user) {
      throw new AppError('User not found', 404);
    }

    // Generate new access token
    const newToken = generateToken(user);

    res.json({
      success: true,
      message: 'Token refreshed successfully',
      data: {
        token: newToken,
        expiresIn: process.env.JWT_EXPIRES_IN || '24h',
      },
    });
  } catch (error) {
    if (error instanceof jwt.JsonWebTokenError || error instanceof jwt.TokenExpiredError) {
      throw new AppError('Invalid or expired refresh token', 401);
    }
    if (error instanceof AppError) throw error;
    console.error('Refresh token error:', error);
    throw new AppError('Failed to refresh token', 500);
  }
};
