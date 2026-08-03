import 'dotenv/config';
import express, { Application } from 'express';
import 'express-async-errors';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import cookieParser from 'cookie-parser';
import swaggerUi from 'swagger-ui-express';
import swaggerJsdoc from 'swagger-jsdoc';
import { requestId } from './middleware/requestId';
import { securityMiddleware, rlsMiddleware } from './middleware/security';

// Import routes
import authRoutes from './routes/auth.routes';
import farmRoutes from './routes/farm.routes';
import cropRoutes from './routes/crop.routes';
import verifyRoutes from './routes/verify.routes';
import qrRoutes from './routes/qrRoutes';
import productRoutes from './routes/product.routes';
import orderRoutes from './routes/order.routes';
import cartRoutes from './routes/cart.routes';
import shipmentRoutes from './routes/shipment.routes';
import supplyChainRoutes from './routes/supplyChain.routes';
import chatRoutes from './routes/chat.routes';
import predictionRoutes from './routes/prediction.routes';
import fieldRoutes from './routes/field.routes';
import ndviRoutes from './routes/ndvi.routes';
import weatherRoutes from './routes/weather.routes';
import recommendationRoutes from './routes/recommendation.routes';
import adminRoutes from './routes/admin.routes';
import marketRoutes from './routes/market.routes';
import { startProvenanceListener } from './services/provenanceListener';
import { startPriceSnapshotJob } from './jobs/priceSnapshot.job';

// Error handling middleware
import { errorHandler } from './middleware/errorHandler';


const app: Application = express();
const PORT = process.env.PORT || 3001;

// Trust reverse proxy (Render load balancer)
app.set('trust proxy', 1);

// CORS configuration (MUST be first before other middleware)
const defaultAllowedOrigins = [
  'https://agrotrace-web.onrender.com',
  'http://localhost:5173',
  'http://localhost:3000',
  'http://127.0.0.1:5173',
  'http://127.0.0.1:3000',
];

const configuredAllowedOrigins = [process.env.FRONTEND_URL, process.env.CORS_ORIGIN]
  .flatMap((value) => value?.split(',') ?? [])
  .map((origin) => origin.trim().replace(/\/$/, ''))
  .filter(Boolean);

const allowedOrigins = Array.from(new Set([...defaultAllowedOrigins, ...configuredAllowedOrigins]));

const isAllowedOrigin = (origin?: string): boolean => {
  if (!origin) return true;

  const normalizedOrigin = origin.replace(/\/$/, '');
  return (
    allowedOrigins.includes(normalizedOrigin) ||
    normalizedOrigin.endsWith('.onrender.com') ||
    process.env.NODE_ENV === 'development'
  );
};


const corsMethods = ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'];
const corsAllowedHeaders = ['Content-Type', 'Authorization', 'X-Requested-With', 'x-request-id', 'Accept', 'Origin'];
const corsExposedHeaders = ['x-request-id', 'Set-Cookie'];

const corsOptions: cors.CorsOptions = {
  origin: (origin, callback) => {
    if (isAllowedOrigin(origin)) return callback(null, true);
    return callback(new Error(`Origin ${origin} is not allowed by CORS`));
  },
  credentials: true,
  methods: corsMethods,
  allowedHeaders: corsAllowedHeaders,
  exposedHeaders: corsExposedHeaders,
  optionsSuccessStatus: 204,
};


// Render/login requests must receive CORS headers even for preflight and early error paths.
app.use((req, res, next) => {
  const origin = req.headers.origin;
  if (isAllowedOrigin(origin)) {
    res.header('Access-Control-Allow-Origin', origin || '*');
    res.header('Vary', 'Origin');
    res.header('Access-Control-Allow-Credentials', 'true');
    res.header('Access-Control-Allow-Methods', corsMethods.join(', '));
    res.header('Access-Control-Allow-Headers', corsAllowedHeaders.join(', '));
    res.header('Access-Control-Expose-Headers', corsExposedHeaders.join(', '));
  }

  if (req.method === 'OPTIONS') return res.sendStatus(204);
  return next();
});

app.use(cors(corsOptions));

// Request tracking
app.use(requestId);

// Security headers
app.use(securityMiddleware);

// Cookie parsing
app.use(cookieParser());

// Body parsing middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// RLS enforcement context
app.use(rlsMiddleware);

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: process.env.NODE_ENV === 'development' ? 5000 : 1000, // Generous limit for demo & dashboard polling
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: 'Too many requests from this IP, please try again later.',
  },
});

app.use('/api/', limiter);

// Prevent caching of sensitive API responses
app.use('/api', (req, res, next) => {
  res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
  res.setHeader('Pragma', 'no-cache');
  res.setHeader('Expires', '0');
  next();
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    service: 'FarmConnect AI Backend',
  });
});

// Welcome / root endpoint
app.get('/', (req, res) => {
  res.status(200).json({
    message: 'Welcome to AgroTrace AI Backend API',
    status: 'OK',
    health: '/health',
    docs: '/api-docs'
  });
});

// API Routes (MED-006)
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/farms', farmRoutes);
app.use('/api/v1/crops', cropRoutes);
app.use('/api/v1/fields', fieldRoutes);
app.use('/predict', predictionRoutes);
app.use('/api/v1/products', productRoutes);
app.use('/api/v1/cart', cartRoutes);
app.use('/api/v1/orders', orderRoutes);
app.use('/api/v1/shipments', shipmentRoutes);
app.use('/api/v1/supply-chain', supplyChainRoutes);
app.use('/api/v1/verify', verifyRoutes);
app.use('/api/v1/qr', qrRoutes);
app.use('/api/v1/chat', chatRoutes);
app.use('/api/v1/predict', predictionRoutes);
app.use('/api/v1/ndvi', ndviRoutes);
app.use('/api/v1/weather', weatherRoutes);
app.use('/api/v1/admin', adminRoutes);
app.use('/api/v1/recommendations', recommendationRoutes);
app.use('/api/v1/market', marketRoutes);

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'Not Found' });
});

// Global error handler
app.use(errorHandler);

// Start server
app.listen(PORT, () => {
  console.log(`🚀 FarmConnect AI Backend running on port ${PORT}`);
  console.log(`📊 Environment: ${process.env.NODE_ENV}`);
  console.log(`🔗 Health check: http://localhost:${PORT}/health`);
  console.log(`📚 API Docs: http://localhost:${PORT}/api-docs`);
  
  // Start blockchain event listener
  startProvenanceListener();
  
  // Start daily market price snapshot job
  startPriceSnapshotJob();
});

export default app;
