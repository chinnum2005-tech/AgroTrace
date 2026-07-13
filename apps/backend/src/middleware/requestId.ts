import { Request, Response, NextFunction } from 'express';
import { v4 as uuidv4 } from 'uuid';

export const requestId = (req: Request, res: Response, next: NextFunction) => {
  const headerName = 'X-Request-ID';
  const id = req.get(headerName) || uuidv4();
  
  // Set the request ID on the request object for logging
  (req as any).id = id;
  
  // Set the request ID on the response header
  res.setHeader(headerName, id);
  
  next();
};
