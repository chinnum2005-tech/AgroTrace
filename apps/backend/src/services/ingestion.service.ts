import prisma from '../database/prisma';
import axios from 'axios';

// Mock function to simulate ingestion of historical weather and NDVI data for a newly created field
export const triggerFieldDataIngestion = async (fieldId: string, location: any) => {
  try {
    console.log(`[Ingestion Service] Starting background ingestion for Field: ${fieldId}...`);
    
    // Simulate fetching weather from Open-Meteo based on polygon/location
    const tempBase = 22 + (Math.random() * 8);
    const rainBase = 50 + (Math.random() * 150);
    
    // Save a weather snapshot
    await prisma.weatherSnapshot.create({
      data: {
        fieldId,
        temperature: tempBase,
        humidity: 60 + (Math.random() * 20),
        rainfall: rainBase,
        source: 'API_OPEN_METEO',
        recordedAt: new Date()
      }
    });
    
    console.log(`[Ingestion Service] Weather data ingested for Field: ${fieldId}.`);
    
    // Simulate fetching 60-day NDVI from Sentinel-Hub
    const ndviRecords = [];
    let currentDate = new Date();
    currentDate.setDate(currentDate.getDate() - 60);
    
    let ndviScore = 0.3 + (Math.random() * 0.2); // Start around 0.4
    
    for (let i = 0; i < 6; i++) {
      ndviRecords.push({
        fieldId,
        ndviScore,
        imageSource: 'SENTINEL_HUB_MOCK',
        stressFlag: ndviScore < 0.4,
        capturedAt: new Date(currentDate)
      });
      // trend upwards slightly as crop grows
      ndviScore += 0.05 + (Math.random() * 0.05);
      if (ndviScore > 0.85) ndviScore = 0.85;
      
      currentDate.setDate(currentDate.getDate() + 10);
    }
    
    await prisma.nDVIReading.createMany({
      data: ndviRecords
    });
    
    console.log(`[Ingestion Service] NDVI sequence ingested for Field: ${fieldId}.`);
    
  } catch (error) {
    console.error(`[Ingestion Service] Error ingesting data for field ${fieldId}:`, error);
  }
};
