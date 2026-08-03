import { Request, Response, NextFunction } from 'express';
import helmet from 'helmet';
import prisma from '../database/prisma';

// Helmet configuration for production API
export const securityMiddleware = helmet({
  crossOriginResourcePolicy: { policy: 'cross-origin' },
  contentSecurityPolicy: false, // CSP is for HTML responses; disable on API to prevent blocking client fetches
  hsts: {
    maxAge: 31536000,
    includeSubDomains: true,
    preload: true,
  },
  frameguard: {
    action: 'deny'
  },
  referrerPolicy: {
    policy: 'strict-origin-when-cross-origin'
  }
});

/**
 * Row-Level Security (RLS) Middleware
 * Enforces data ownership by extending Prisma queries based on user identity.
 */
export const rlsMiddleware = (req: any, res: Response, next: NextFunction) => {
  if (!req.user) return next();

  const userId = req.user.id;
  const role = req.user.role;

  // Skip RLS for admins
  if (role === 'ADMIN') return next();

  // Attach a context object to the request that can be used by Prisma extensions
  // Note: In a real app, you'd use a Prisma Client Extension here.
  // For this demonstration, we'll implement a simple filter pattern.
  
  req.rlsFilter = (model: string) => {
    switch (model) {
      case 'farm':
        return { userId };
      case 'crop':
        return { farm: { userId } };
      case 'order':
        return { consumerId: userId };
      case 'cart':
        return { userId };
      case 'shipment':
        return { distributorId: userId };
      default:
        return {};
    }
  };

  next();
};
