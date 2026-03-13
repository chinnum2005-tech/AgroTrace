import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database...');

  // Create admin user
  const adminPassword = await bcrypt.hash('admin123', 10);
  const admin = await prisma.user.create({
    data: {
      email: 'admin@agritrace.ai',
      password: adminPassword,
      firstName: 'Admin',
      lastName: 'User',
      role: 'ADMIN',
      phone: '+1-555-0001',
    },
  });
  console.log('✅ Created Admin User');

  // Create farmer user with farm and crops
  const farmerPassword = await bcrypt.hash('farmer123', 10);
  const farmer = await prisma.user.create({
    data: {
      email: 'farmer@agritrace.ai',
      password: farmerPassword,
      firstName: 'John',
      lastName: 'Farmer',
      role: 'FARMER',
      phone: '+1-555-0002',
      farm: {
        create: {
          name: 'Green Valley Farm',
          description: 'Organic vegetable and grain farm',
          location: {
            lat: 40.7128,
            lng: -74.0060,
            address: '123 Farm Road, Agricultural Valley, CA 90210',
          },
          size: 150.5,
          certification: 'USDA Organic',
          crops: {
            create: [
              {
                name: 'Wheat Field A',
                type: 'WHEAT',
                variety: 'Hard Red Winter Wheat',
                plantingDate: new Date('2024-03-01'),
                expectedHarvest: new Date('2024-07-15'),
                growthStage: 'VEGETATIVE',
                area: 50.0,
                estimatedYield: 2250.0,
                qrCode: 'AGRITRACE-WHEAT-001',
              },
              {
                name: 'Corn Field B',
                type: 'CORN',
                variety: 'Sweet Corn Hybrid',
                plantingDate: new Date('2024-04-01'),
                expectedHarvest: new Date('2024-08-01'),
                growthStage: 'PLANTED',
                area: 35.0,
                estimatedYield: 3150.0,
                qrCode: 'AGRITRACE-CORN-002',
              },
              {
                name: 'Soybean Field C',
                type: 'SOYBEANS',
                variety: 'GMO-Free Soybeans',
                plantingDate: new Date('2024-03-15'),
                expectedHarvest: new Date('2024-09-01'),
                growthStage: 'FLOWERING',
                area: 40.0,
                estimatedYield: 1600.0,
                qrCode: 'AGRITRACE-SOY-003',
              },
            ],
          },
        },
      },
    },
    include: {
      farm: {
        include: {
          crops: true,
        },
      },
    },
  });
  console.log('✅ Created Farmer with Farm and Crops');

  // Create distributor user
  const distributorPassword = await bcrypt.hash('dist123', 10);
  const distributor = await prisma.user.create({
    data: {
      email: 'distributor@agritrace.ai',
      password: distributorPassword,
      firstName: 'Sarah',
      lastName: 'Distributor',
      role: 'DISTRIBUTOR',
      phone: '+1-555-0003',
    },
  });
  console.log('✅ Created Distributor User');

  // Create consumer user
  const consumerPassword = await bcrypt.hash('consumer123', 10);
  const consumer = await prisma.user.create({
    data: {
      email: 'consumer@agritrace.ai',
      password: consumerPassword,
      firstName: 'Mike',
      lastName: 'Consumer',
      role: 'CONSUMER',
      phone: '+1-555-0004',
    },
  });
  console.log('✅ Created Consumer User');

  // Create AI predictions for wheat crop
  const wheatCrop = farmer.farm!.crops[0];
  await prisma.aIPrediction.create({
    data: {
      cropId: wheatCrop.id,
      predictedYield: 2250.0,
      confidence: 0.87,
      factors: {
        weather: {
          temperature: 25.5,
          rainfall: 650.0,
          humidity: 65.0,
        },
        soil: {
          ph_level: 6.5,
          nitrogen: 55.0,
          phosphorus: 35.0,
          potassium: 45.0,
        },
        historical: 1.02,
      },
    },
  });
  console.log('✅ Created AI Prediction for Wheat');

  // Create products from harvested crops
  const product = await prisma.product.create({
    data: {
      name: 'Premium Wheat Flour - 5kg',
      sku: 'WHEAT-FLOUR-5KG-001',
      cropId: wheatCrop.id,
      quantity: 1000.0, // 1000 kg
      packagingDate: new Date('2024-07-20'),
      expiryDate: new Date('2025-07-20'),
      batchNumber: 'BATCH-2024-001',
      storageLocation: 'Warehouse A, Section 3',
      status: 'ACTIVE',
    },
  });
  console.log('✅ Created Product from Wheat');

  // Create supply chain events
  const wheatEventPlanted = await prisma.supplyChainEvent.create({
    data: {
      productId: product.id,
      eventType: 'PLANTED',
      timestamp: new Date('2024-03-01T08:00:00Z'),
      location: 'Green Valley Farm - Field A',
      actorId: farmer.id,
      metadata: JSON.stringify({
        soilPreparation: 'Plowed and fertilized',
        seedDensity: '120 kg/hectare',
        weatherConditions: 'Clear, 15°C',
      }),
      verified: true,
    },
  });
  console.log('✅ Created Supply Chain Event: PLANTED');

  const wheatEventVegetative = await prisma.supplyChainEvent.create({
    data: {
      productId: product.id,
      eventType: 'QUALITY_CHECK',
      timestamp: new Date('2024-05-01T10:30:00Z'),
      location: 'Green Valley Farm - Field A',
      actorId: farmer.id,
      metadata: JSON.stringify({
        plantHeight: '45 cm',
        healthStatus: 'Excellent',
        pestPresence: 'None detected',
      }),
      verified: true,
    },
  });
  console.log('✅ Created Supply Chain Event: QUALITY_CHECK');

  const productEventPackaged = await prisma.supplyChainEvent.create({
    data: {
      productId: product.id,
      eventType: 'PACKAGED',
      timestamp: new Date('2024-07-20T14:00:00Z'),
      location: 'Processing Facility B',
      actorId: distributor.id,
      metadata: JSON.stringify({
        packagingType: 'Food-grade bags',
        qualityGrade: 'Premium',
        moistureContent: '12%',
      }),
      transactionHash: '0x' + Math.random().toString(16).substr(2, 40),
      blockNumber: Math.floor(Math.random() * 10000000) + 1000000,
      verified: true,
    },
  });
  console.log('✅ Created Supply Chain Event: PACKAGED (Blockchain)');

  const productEventShipped = await prisma.supplyChainEvent.create({
    data: {
      productId: product.id,
      eventType: 'SHIPPED',
      timestamp: new Date('2024-07-21T09:00:00Z'),
      location: 'Distribution Center - Dock 5',
      actorId: distributor.id,
      metadata: JSON.stringify({
        carrier: 'Fresh Transport Inc.',
        vehicleId: 'TRK-456',
        destination: 'Metro Supermarket Chain',
        temperatureControl: 'Ambient',
      }),
      transactionHash: '0x' + Math.random().toString(16).substr(2, 40),
      blockNumber: Math.floor(Math.random() * 10000000) + 1000001,
      verified: true,
    },
  });
  console.log('✅ Created Supply Chain Event: SHIPPED (Blockchain)');

  // Create audit logs
  await prisma.auditLog.create({
    data: {
      action: 'USER_REGISTERED',
      entity: 'User',
      entityId: farmer.id,
      userId: farmer.id,
      details: {
        email: farmer.email,
        role: farmer.role,
        ipAddress: '192.168.1.100',
      },
    },
  });

  await prisma.auditLog.create({
    data: {
      action: 'FARM_REGISTERED',
      entity: 'Farm',
      entityId: farmer.farm!.id,
      userId: farmer.id,
      details: {
        farmName: farmer.farm!.name,
        size: farmer.farm!.size,
        certification: farmer.farm!.certification,
      },
    },
  });
  console.log('✅ Created Audit Logs');

  console.log('\n🎉 Database seeding completed successfully!');
  console.log('\n📊 Summary:');
  console.log(`   - Users: ${await prisma.user.count()}`);
  console.log(`   - Farms: ${await prisma.farm.count()}`);
  console.log(`   - Crops: ${await prisma.crop.count()}`);
  console.log(`   - Products: ${await prisma.product.count()}`);
  console.log(`   - AI Predictions: ${await prisma.aIPrediction.count()}`);
  console.log(`   - Supply Chain Events: ${await prisma.supplyChainEvent.count()}`);
  console.log(`   - Audit Logs: ${await prisma.auditLog.count()}`);
  
  console.log('\n🔐 Test Credentials:');
  console.log('   Admin: admin@agritrace.ai / admin123');
  console.log('   Farmer: farmer@agritrace.ai / farmer123');
  console.log('   Distributor: distributor@agritrace.ai / dist123');
  console.log('   Consumer: consumer@agritrace.ai / consumer123');
}

main()
  .catch((e) => {
    console.error('❌ Seeding failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
