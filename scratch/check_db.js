const prisma = require('../apps/backend/src/database/prisma').default;

async function check() {
  const user = await prisma.user.findFirst({ where: { email: 'farmer_m4@example.com' } });
  const farm = await prisma.farm.findFirst({ where: { name: 'Chhindwara Organic Valley M4' } });
  const cropRecs = await prisma.cropRecommendation.findMany();
  const fertRecs = await prisma.fertilizerRecommendation.findMany();
  const yieldPreds = await prisma.yieldPrediction.findMany({ where: { cropType: 'WHEAT' } });
  
  console.log('RESULTS:');
  console.log('- User created:', !!user);
  console.log('- Farm created:', !!farm);
  console.log('- Crop Recommendations count:', cropRecs.length);
  console.log('- Fertilizer Recommendations count:', fertRecs.length);
  console.log('- Yield Predictions count:', yieldPreds.length);
}

check().catch(console.error);
