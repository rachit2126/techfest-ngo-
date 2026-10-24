const assert = require('assert');

async function runAIAgentTests() {
  console.log('🧪 Starting ReliefLink AI Agent Integration Tests...\n');

  const baseUrl = process.env.TEST_BASE_URL || 'http://localhost:3000';

  // Test 1: Empty message rejection
  console.log('Test 1: Request validation - Reject empty message');
  const res1 = await fetch(`${baseUrl}/api/ai/chat`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ message: '' })
  });
  assert.strictEqual(res1.status, 400, 'Empty message should return 400 Bad Request');
  const data1 = await res1.json();
  assert.ok(data1.error, 'Error message should be present');
  console.log('  ✓ Correctly rejected empty message with 400');

  // Test 2: Generate listing from prompt
  console.log('Test 2: Conversational Listing Generation with Grounding');
  const res2 = await fetch(`${baseUrl}/api/ai/chat`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      message: 'I have 50 winter blankets. Can you create a listing and suggest the best NGO matches?'
    })
  });
  assert.strictEqual(res2.status, 200, 'Valid chat should return 200 OK');
  const data2 = await res2.json();
  assert.strictEqual(data2.success, true);
  assert.ok(data2.structuredDraft, 'structuredDraft must be populated');
  assert.strictEqual(data2.structuredDraft.quantity, 50, 'Draft quantity should be 50');
  assert.strictEqual(data2.structuredDraft.category, 'clothing_blankets', 'Category must be clothing_blankets');
  assert.ok(data2.matchingNgos && data2.matchingNgos.length > 0, 'Matching NGOs must be returned');
  assert.ok(data2.safetyData, 'Safety data must be returned');
  console.log('  ✓ Structured draft generated with quantity 50 and valid category');
  console.log(`  ✓ Returned ${data2.matchingNgos.length} verified NGO matches`);

  // Test 3: Fair price estimation endpoint
  console.log('Test 3: Fair Price Estimation Tool');
  const res3 = await fetch(`${baseUrl}/api/ai/estimate-price`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      category: 'clothing_blankets',
      subcategory: 'Blankets',
      title: 'Warm Fleece Winter Blankets',
      condition: 'Brand New',
      quantity: 50
    })
  });
  assert.strictEqual(res3.status, 200);
  const data3 = await res3.json();
  assert.ok(data3.priceEstimate, 'Price estimate must be present');
  assert.ok(data3.priceEstimate.unitPrice > 0, 'Unit price must be positive');
  assert.strictEqual(data3.priceEstimate.currency, 'INR');
  console.log(`  ✓ Estimated price: ${data3.priceEstimate.unitPriceRange} (Total: ${data3.priceEstimate.totalEstimatedRange})`);

  // Test 4: Safety & Guideline Check Tool
  console.log('Test 4: Safety & Dignity Guideline Validation');
  const res4 = await fetch(`${baseUrl}/api/ai/check-safety`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      category: 'clothing_blankets',
      description: 'Warm fleece blankets',
      condition: 'Brand New'
    })
  });
  assert.strictEqual(res4.status, 200);
  const data4 = await res4.json();
  assert.strictEqual(data4.safety.status, 'passed', 'Clean blankets should pass safety');
  console.log('  ✓ Safety passed for dignified winter relief blankets');

  // Test 5: Prohibited materials blocked
  console.log('Test 5: Hazardous Material Hard Gate Protection');
  const res5 = await fetch(`${baseUrl}/api/ai/check-safety`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      category: 'other',
      description: 'Flammable chemical propellant solvents'
    })
  });
  const data5 = await res5.json();
  assert.strictEqual(data5.safety.status, 'blocked', 'Hazardous material must be blocked');
  console.log('  ✓ Hazardous items blocked strictly');

  // Test 6: Apply suggestions to draft listing
  console.log('Test 6: Apply Approved Suggestions to Database');
  const res6 = await fetch(`${baseUrl}/api/ai/apply-suggestions`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      draft: data2.structuredDraft
    })
  });
  assert.strictEqual(res6.status, 200);
  const data6 = await res6.json();
  assert.strictEqual(data6.success, true);
  assert.ok(data6.listingId, 'Listing ID must be returned');
  console.log(`  ✓ Successfully applied draft to database with ID: ${data6.listingId}`);

  // Test 7: Grounded Problem Solver Diagnostic API
  console.log('Test 7: Sahay Grounded Problem Solver Tool');
  const res7 = await fetch(`${baseUrl}/api/ai/solve-problem`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      problemDescription: 'CSV row rejected because expiration date is less than 48 hours'
    })
  });
  assert.strictEqual(res7.status, 200);
  const data7 = await res7.json();
  assert.strictEqual(data7.success, true);
  assert.ok(data7.diagnosis, 'Diagnosis must be returned');
  assert.strictEqual(data7.diagnosis.riskLevel, 'MEDIUM');
  assert.ok(data7.diagnosis.stepByStepInstructions.length > 0);
  console.log(`  ✓ Diagnosed issue: ${data7.diagnosis.problemSummary}`);

  console.log('\n========================================');
  console.log('Summary: 7/7 Sahay AI Agent integration tests PASSED.');
  console.log('========================================\n');
}

runAIAgentTests().catch((err) => {
  console.error('❌ AI Agent Test Failure:', err);
  process.exit(1);
});

