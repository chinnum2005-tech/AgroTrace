import { Response, NextFunction } from 'express';
import prisma from '../database/prisma';
import { AppError } from './errorHandler';

export const auditLogger = (action: string) => {
  return async (req: any, res: Response, next: NextFunction) => {
    // Capture the original send to intercept the response
    const originalSend = res.send;

    res.send = function (body) {
      res.send = originalSend;

      // Only log successful actions
      if (res.statusCode >= 200 && res.statusCode < 300) {
        try {
          const userId = req.user?.id;
          const userRole = req.user?.role;
          
          if (userId && (userRole === 'ADMIN' || userRole === 'SUPER_ADMIN')) {
            const resourceId = req.params?.id || req.body?.id || 'unknown';
            
            // Fire and forget audit log creation
            prisma.auditLog.create({
              data: {
                userId,
                action,
                entity: req.baseUrl.split('/').pop() || 'unknown',
                entityId: resourceId,
                details: {
                  ipAddress: req.ip || req.connection.remoteAddress || 'unknown',
                  userAgent: req.headers['user-agent'] || 'unknown',
                  method: req.method,
                  url: req.originalUrl
                },
              }
            }).catch(err => console.error('Audit Log Failed:', err));
          }
        } catch (error) {
          console.error('Audit Logger Error:', error);
        }
      }
      
      return res.send(body);
    };

    next();
  };
};
