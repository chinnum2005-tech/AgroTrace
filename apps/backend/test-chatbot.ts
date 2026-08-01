import { chatbotService } from './src/services/chatbot.service';

async function main() {
  const dummyUser = { id: '64f1a2b3c4d5e6f708192a3b' };

  console.log("--- Chatbot Service Tests ---");

  // Test 1: Ambiguous Query (Routing to ML Service / Out-of-Domain Fallback)
  console.log("\nTesting Ambiguous/Out-of-Domain Query...");
  const res1 = await chatbotService.processQuery("What is the best way to paint a tractor red?", dummyUser);
  console.log("Result 1:", JSON.stringify(res1, null, 2));

  // Test 2: Exact Match on seeded knowledge base
  console.log("\nTesting Knowledge Base Semantic Search (MSP)...");
  const res2 = await chatbotService.processQuery("What is the MSP for paddy this year?", dummyUser);
  console.log("Result 2:", JSON.stringify(res2, null, 2));

  // Test 3: Structured Query with RBAC (Private Farm Data)
  console.log("\nTesting Private Farm Data (Structured Query)...");
  const res3 = await chatbotService.processQuery("show me my pending orders", dummyUser);
  console.log("Result 3:", JSON.stringify(res3, null, 2));

  // Test 4: General Conversation
  console.log("\nTesting General Conversation...");
  const res4 = await chatbotService.processQuery("thanks", dummyUser);
  console.log("Result 4:", JSON.stringify(res4, null, 2));

  // Test 5: Cross-tenant negative test (Try to query a specific order ID belonging to someone else)
  console.log("\nTesting Cross-Tenant Negative Test (Trying to access order #661234567890123456789012)...");
  const res5 = await chatbotService.processQuery("show me status of my order 661234567890123456789012", dummyUser);
  console.log("Result 5:", JSON.stringify(res5, null, 2));

  // Test 6: Ambiguous Intent Classification
  console.log("\nTesting Ambiguous Intent Classification (my tomato field blast risk)...");
  const res6 = await chatbotService.processQuery("how is my tomato field doing compared to normal blast risk this season?", dummyUser);
  console.log("Result 6:", JSON.stringify(res6, null, 2));

  // Test 7: Threshold Test against loosely related words
  console.log("\nTesting Threshold Drop (what's the weather like for wheat)...");
  const res7 = await chatbotService.processQuery("what's the weather like for wheat", dummyUser);
  console.log("Result 7:", JSON.stringify(res7, null, 2));
}

main().catch(console.error);
