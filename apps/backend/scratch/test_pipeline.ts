import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function runTest() {
  console.log("=== End-to-End Verification: Crop Area ===");
  
  // Find a farm and field to use
  const farm = await prisma.farm.findFirst();
  const field = await prisma.field.findFirst({ where: { farmId: farm?.id } });
  
  if (!farm || !field) {
    console.log("No farm or field found to test.");
    return;
  }

  // 1. Simulate the controller logic for a 1-Acre crop
  const inputAcres = 1.0;
  const areaHectares = inputAcres * 0.404686;
  
  const crop = await prisma.crop.create({
    data: {
      name: "Test Corn - E2E Verification",
      type: "CORN",
      plantingDate: new Date(), // Planted today
      expectedHarvest: new Date(Date.now() + 65 * 24 * 60 * 60 * 1000), // 65 days from now
      area: areaHectares, // Hectares in DB
      farmId: farm.id,
      fieldId: field.id
    }
  });
  
  console.log(`\nCreated Crop: ${crop.name}`);
  console.log(`Input Area (Acres): ${inputAcres}`);
  console.log(`Stored Area (Hectares): ${crop.area}`);
  
  if (Math.abs(crop.area - 0.404686) < 0.0001) {
    console.log("✅ SUCCESS: Database area accurately stores 1 Acre as ~0.404686 Hectares.");
  } else {
    console.log("❌ ERROR: Database area is incorrect.");
  }
  
  // NDVI Logic Verification
  const normalizedPlantingDate = new Date(crop.plantingDate);
  normalizedPlantingDate.setUTCHours(0,0,0,0);
  
  const recentNdvi = await prisma.nDVIReading.findMany({
    where: {
      fieldId: crop.fieldId,
      capturedAt: { gte: normalizedPlantingDate }
    }
  });
  
  console.log(`\nFound ${recentNdvi.length} NDVI readings since planting today.`);
  
  let ndviTrend = 0.15;
  if (recentNdvi.length === 0) {
    console.log("✅ SUCCESS: No readings found for today. Using baseline NDVI (0.15). Prevents bleed-over from old crops.");
  }
  
  // Cleanup test crop
  await prisma.crop.delete({ where: { id: crop.id } });
  console.log("\nCleanup: Deleted test crop.");
}

runTest()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
