const { blockchainService } = require('./dist/services/blockchain.service.js');

async function main() {
  try {
    const result = await blockchainService.recordEvent('test-batch-123', 'SOLD', { foo: 'bar' });
    console.log('Result:', result);
  } catch (err) {
    console.error('Caught expected error:', err.message);
  }
}

main();
