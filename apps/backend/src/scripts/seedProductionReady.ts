import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting Production Data Seeding...');

  // 1. Clear existing generic data (optional, but good for a clean state)
  // Be careful with deleteMany in production, but this is a controlled seed
  // We'll just add data to ensure there's enough.

  // 2. Create default passwords
  const passwordHash = await bcrypt.hash('password123', 10);

  // 3. Create a Farmer
  const farmerEmail = `farmer_${Date.now()}@agrotrace.com`;
  console.log(`Creating Farmer: ${farmerEmail}`);
  const farmer = await prisma.user.create({
    data: {
      email: farmerEmail,
      password: passwordHash,
      firstName: 'Ramesh',
      lastName: 'Kumar',
      role: 'FARMER',
      phone: '+919876543210',
      farm: {
        create: {
          name: 'Green Valley Organics',
          description: 'Certified organic farm producing premium grains and vegetables in Punjab.',
          location: { lat: 30.9, lng: 75.8, address: 'Ludhiana, Punjab' },
          size: 15.5,
          certification: 'Organic India',
          organicCertified: true,
        }
      }
    },
    include: { farm: true }
  });

  const farmId = farmer.farm!.id;

  // Create Field for the Farm
  const field = await prisma.field.create({
    data: {
      name: 'North Block A',
      farmId,
      soilType: 'Loamy',
    }
  });

  // 4. Create Crops
  console.log('Planting crops...');
  const wheatCrop = await prisma.crop.create({
    data: {
      name: 'Premium Sharbati Wheat',
      type: 'WHEAT',
      variety: 'Sharbati',
      plantingDate: new Date('2025-11-15'),
      expectedHarvest: new Date('2026-04-10'),
      growthStage: 'HARVESTED',
      area: 5.0,
      estimatedYield: 20000,
      actualYield: 19500,
      farmId,
      fieldId: field.id,
    }
  });

  const riceCrop = await prisma.crop.create({
    data: {
      name: 'Basmati Rice',
      type: 'RICE',
      variety: 'Pusa Basmati 1121',
      plantingDate: new Date('2025-06-10'),
      expectedHarvest: new Date('2025-11-05'),
      growthStage: 'HARVESTED',
      area: 4.0,
      estimatedYield: 15000,
      actualYield: 14800,
      farmId,
      fieldId: field.id,
    }
  });

  // 5. Create Products for Marketplace
  console.log('Packaging products for marketplace...');
  
  await prisma.product.create({
    data: {
      name: 'Premium Sharbati Wheat (Organic)',
      sku: `PROD-WHEAT-${Date.now()}`,
      cropId: wheatCrop.id,
      quantity: 500, // 500kg available
      price: 45, // ₹45 per kg
      rating: 4.9,
      packagingDate: new Date(),
      batchNumber: 'BT-WH-26-001',
      storageLocation: 'Ludhiana Warehouse A',
      status: 'ACTIVE'
    }
  });

  await prisma.product.create({
    data: {
      name: 'Export Quality Basmati Rice',
      sku: `PROD-RICE-${Date.now()}`,
      cropId: riceCrop.id,
      quantity: 300,
      price: 120, // ₹120 per kg
      rating: 4.8,
      packagingDate: new Date(),
      batchNumber: 'BT-RI-25-089',
      storageLocation: 'Ludhiana Warehouse B',
      status: 'ACTIVE'
    }
  });

  // 6. Create a Distributor
  const distEmail = `distributor_${Date.now()}@agrotrace.com`;
  console.log(`Creating Distributor: ${distEmail}`);
  await prisma.user.create({
    data: {
      email: distEmail,
      password: passwordHash,
      firstName: 'Speedy',
      lastName: 'Logistics',
      role: 'DISTRIBUTOR',
      phone: '+919988776655',
    }
  });

  // 7. Create a Consumer
  const consumerEmail = `consumer_${Date.now()}@agrotrace.com`;
  console.log(`Creating Consumer: ${consumerEmail}`);
  await prisma.user.create({
    data: {
      email: consumerEmail,
      password: passwordHash,
      firstName: 'Anita',
      lastName: 'Desai',
      role: 'CONSUMER',
      phone: '+919876543222',
    }
  });

  console.log('✅ Production Data Seeded Successfully!');
  console.log('\n--- Test Accounts ---');
  console.log(`Farmer: ${farmerEmail} / password123`);
  console.log(`Distributor: ${distEmail} / password123`);
  console.log(`Consumer: ${consumerEmail} / password123`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
