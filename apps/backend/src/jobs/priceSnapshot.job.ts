import cron from 'node-cron';
import { fetchLatestPrices } from '../services/agmarknet.service';
import prisma from '../database/prisma';

// Map our internal crop names to Agmarknet commodity strings
const COMMODITY_MAP = {
  wheat: 'Wheat',
  rice: 'Paddy(Dhan)(Common)', // Rice is typically sold as Paddy in mandis
  maize: 'Maize'
};

const STATES_TO_TRACK = ['Maharashtra', 'Punjab', 'Madhya Pradesh', 'Karnataka'];

export const startPriceSnapshotJob = () => {
  // Run daily at 11:30 PM
  cron.schedule('30 23 * * *', async () => {
    console.log('[Cron] Starting daily price snapshot job...');
    
    for (const [cropKey, agmarknetCommodity] of Object.entries(COMMODITY_MAP)) {
      for (const state of STATES_TO_TRACK) {
        try {
          const records = await fetchLatestPrices(agmarknetCommodity, state);
          
          if (!records || records.length === 0) continue;

          // Process records for today
          for (const record of records) {
            // Only save if we have a valid modal price
            if (!record.modal_price || record.modal_price === 'NA') continue;
            
            // Parse arrival date (dd/mm/yyyy)
            const parts = record.arrival_date.split('/');
            if (parts.length !== 3) continue;
            const date = new Date(Number(parts[2]), Number(parts[1]) - 1, Number(parts[0]));
            
            await prisma.priceHistory.upsert({
              where: {
                commodity_state_market_date: {
                  commodity: cropKey,
                  state: record.state,
                  market: record.market,
                  date
                }
              },
              update: {
                modalPrice: parseFloat(record.modal_price)
              },
              create: {
                commodity: cropKey,
                state: record.state,
                market: record.market,
                modalPrice: parseFloat(record.modal_price),
                date
              }
            });
          }
        } catch (err: any) {
          console.error(`[Cron] Error fetching prices for ${cropKey} in ${state}:`, err.message);
        }
      }
    }
    
    console.log('[Cron] Daily price snapshot job completed.');
  });
};
