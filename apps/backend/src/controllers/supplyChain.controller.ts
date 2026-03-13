import { Response } from 'express';
import prisma from '../database/prisma';
import { AppError } from '../middleware/errorHandler';
import { AuthRequest } from '../middleware/auth';

/**
 * Get supply chain events for a product
 */
export const getProductTraceability = async (req: AuthRequest, res: Response) => {
  try {
    const { productId } = req.params;

    if (!productId) {
      throw new AppError('Product ID is required', 400);
    }

    const events = await prisma.supplyChainEvent.findMany({
      where: { productId },
      include: {
        actor: {
          select: {
            firstName: true,
            lastName: true,
            role: true,
          }
        }
      },
      orderBy: { timestamp: 'asc' },
    });

    // Format events for frontend display (including map coordinates)
    const formattedEvents = events.map(event => ({
      id: event.id,
      eventType: event.eventType,
      title: formatEventType(event.eventType),
      description: event.metadata ? JSON.parse(event.metadata).description || '' : '',
      location: event.location || 'Unknown',
      latitude: event.latitude,
      longitude: event.longitude,
      timestamp: event.timestamp,
      date: formatDate(event.timestamp),
      actor: `${event.actor.firstName} ${event.actor.lastName}`,
      actorRole: event.actor.role,
      verified: event.verified,
      transactionHash: event.transactionHash,
    }));

    res.json({
      success: true,
      data: formattedEvents,
    });
  } catch (error) {
    throw new AppError('Failed to fetch traceability data', 500);
  }
};

/**
 * Add a supply chain event
 */
export const addSupplyChainEvent = async (req: AuthRequest, res: Response) => {
  try {
    const { productId, eventType, location, description, metadata, latitude, longitude } = req.body;
    const userId = req.user!.id;

    if (!productId || !eventType) {
      throw new AppError('Product ID and event type are required', 400);
    }

    // Verify product exists
    const product = await prisma.product.findUnique({
      where: { id: productId },
    });

    if (!product) {
      throw new AppError('Product not found', 404);
    }

    // Create supply chain event with optional coordinates
    const event = await prisma.supplyChainEvent.create({
      data: {
        productId,
        eventType,
        location: location || null,
        latitude: latitude || null,
        longitude: longitude || null,
        actorId: userId,
        timestamp: new Date(),
        metadata: metadata ? JSON.stringify(metadata) : JSON.stringify({ description }),
        verified: false, // Can be set to true when blockchain integration is active
      },
      include: {
        actor: {
          select: {
            firstName: true,
            lastName: true,
            role: true,
          }
        }
      }
    });

    res.status(201).json({
      success: true,
      message: 'Supply chain event recorded successfully',
      data: {
        id: event.id,
        eventType: event.eventType,
        timestamp: event.timestamp,
        actor: `${event.actor.firstName} ${event.actor.lastName}`,
      }
    });
  } catch (error) {
    if (error instanceof AppError) throw error;
    throw new AppError('Failed to record supply chain event', 500);
  }
};

/**
 * Get recent supply chain events (for dashboard displays)
 */
export const getRecentEvents = async (req: AuthRequest, res: Response) => {
  try {
    const limit = parseInt(req.query.limit as string) || 10;

    const events = await prisma.supplyChainEvent.findMany({
      take: limit,
      include: {
        product: {
          include: {
            crop: {
              include: {
                farm: true,
              }
            }
          }
        },
        actor: {
          select: {
            firstName: true,
            lastName: true,
          }
        }
      },
      orderBy: { timestamp: 'desc' },
    });

    const formattedEvents = events.map(event => ({
      id: event.id,
      eventType: event.eventType,
      title: formatEventType(event.eventType),
      productName: event.product.name,
      farmName: event.product.crop.farm.name,
      location: event.location || 'Unknown',
      timestamp: event.timestamp,
      actor: `${event.actor.firstName} ${event.actor.lastName}`,
      verified: event.verified,
    }));

    res.json({
      success: true,
      data: formattedEvents,
    });
  } catch (error) {
    throw new AppError('Failed to fetch recent events', 500);
  }
};

/**
 * Get supply chain events by user's products (for farmer dashboard)
 */
export const getMyProductEvents = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user!.id;

    // Find all products from this farmer's farms
    const farmerProducts = await prisma.product.findMany({
      where: {
        crop: {
          farm: {
            userId,
          }
        }
      },
      select: { id: true }
    });

    const productIds = farmerProducts.map(p => p.id);

    if (productIds.length === 0) {
      return res.json({
        success: true,
        data: [],
      });
    }

    const events = await prisma.supplyChainEvent.findMany({
      where: {
        productId: { in: productIds }
      },
      include: {
        product: {
          include: {
            crop: {
              include: {
                farm: true,
              }
            }
          }
        }
      },
      orderBy: { timestamp: 'desc' },
    });

    const formattedEvents = events.map(event => ({
      id: event.id,
      eventType: event.eventType,
      title: formatEventType(event.eventType),
      productName: event.product.name,
      farmName: event.product.crop.farm.name,
      location: event.location || 'Unknown',
      timestamp: event.timestamp,
      verified: event.verified,
    }));

    res.json({
      success: true,
      data: formattedEvents,
    });
  } catch (error) {
    throw new AppError('Failed to fetch product events', 500);
  }
};

// Helper functions
function formatEventType(type: string): string {
  const formats: Record<string, string> = {
    PLANTED: '🌱 Planted',
    HARVESTED: '🌾 Harvested',
    PROCESSED: '⚙️ Processed',
    PACKAGED: '📦 Packaged',
    SHIPPED: '🚚 Shipped',
    RECEIVED: '✅ Received',
    QUALITY_CHECK: '✓ Quality Check',
    RETAIL: '🏪 Available for Purchase',
    SOLD: '💰 Sold',
  };
  return formats[type] || type;
}

function formatDate(date: Date): string {
  return new Date(date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}
