import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Starting Farm & Crop Area Data Migration...');

  // 1. Convert all farm sizes from Acres to Hectares.
  // Assuming all currently stored sizes are in Acres because of the bug.
  const farms = await prisma.farm.findMany({
    include: {
      crops: {
        where: {
          growthStage: {
            not: 'HARVESTED'
          }
        }
      }
    }
  });

  for (const farm of farms) {
    // Check if the farm size is suspiciously small, maybe it was already converted?
    // Let's assume all existing ones need conversion for this fix script.
    const newSizeHectares = farm.size * 0.404686;
    
    await prisma.farm.update({
      where: { id: farm.id },
      data: { size: newSizeHectares }
    });

    console.log(`Updated Farm ${farm.name}: ${farm.size} acres -> ${newSizeHectares.toFixed(2)} hectares`);

    // 2. Validate and shrink crops if they exceed the farm size
    let totalCropArea = 0;
    for (const crop of farm.crops) {
      totalCropArea += crop.area;
    }

    if (totalCropArea > newSizeHectares) {
      console.log(`WARNING: Farm ${farm.name} has ${totalCropArea.toFixed(2)} ha of active crops, but only ${newSizeHectares.toFixed(2)} ha of land.`);
      
      const shrinkRatio = newSizeHectares / totalCropArea;
      console.log(`Shrinking all crops proportionally by ${(shrinkRatio * 100).toFixed(2)}%...`);

      for (const crop of farm.crops) {
        const newArea = crop.area * shrinkRatio;
        await prisma.crop.update({
          where: { id: crop.id },
          data: { area: newArea }
        });
        console.log(` - Crop ${crop.name}: ${crop.area.toFixed(2)} ha -> ${newArea.toFixed(2)} ha`);
      }
    }
  }

  console.log('Migration completed successfully.');
}

main()
  .catch((e) => {
    console.error('Migration failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
