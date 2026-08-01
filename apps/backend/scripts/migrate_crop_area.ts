import { PrismaClient } from '@prisma/client';
import fs from 'fs';
import path from 'path';

const prisma = new PrismaClient();
const MIGRATION_STATE_FILE = path.join(__dirname, 'migration_state.json');

async function main() {
  console.log('Starting idempotent area migration (Acres to Hectares)...');
  
  let migratedIds: string[] = [];
  if (fs.existsSync(MIGRATION_STATE_FILE)) {
    migratedIds = JSON.parse(fs.readFileSync(MIGRATION_STATE_FILE, 'utf8'));
  }
  
  const crops = await prisma.crop.findMany();
  let migratedCount = 0;
  let skippedCount = 0;

  for (const crop of crops) {
    if (migratedIds.includes(crop.id)) {
      skippedCount++;
      continue;
    }

    const areaHectares = crop.area * 0.404686;
    
    await prisma.crop.update({
      where: { id: crop.id },
      data: { area: areaHectares }
    });
    
    migratedIds.push(crop.id);
    migratedCount++;
    console.log(`Migrated crop ${crop.id}: ${crop.area} -> ${areaHectares}`);
  }

  fs.writeFileSync(MIGRATION_STATE_FILE, JSON.stringify(migratedIds, null, 2));

  console.log(`Successfully migrated ${migratedCount} crops to Hectares. Skipped ${skippedCount} already migrated crops.`);
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
