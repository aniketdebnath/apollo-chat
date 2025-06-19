/**
 * This script tests the rate limiting functionality by making multiple
 * requests to the test-rate-limit endpoint.
 *
 * Usage:
 * node test-rate-limit.js
 */

const fetch = require('node-fetch');

// Configuration
const API_URL = 'http://localhost:3001/api/test-rate-limit';
const TOTAL_REQUESTS = 120; // More than our limit of 100
const CONCURRENT_REQUESTS = 10;
const DELAY_BETWEEN_BATCHES = 100; // ms

async function makeRequest(index) {
  try {
    const start = Date.now();
    const response = await fetch(API_URL);
    const end = Date.now();
    const status = response.status;

    let body = '';
    try {
      body = await response.text();
    } catch (e) {
      // Ignore body parsing errors
    }

    return {
      index,
      status,
      time: end - start,
      success: status === 200,
      body: body.substring(0, 100), // Truncate long responses
    };
  } catch (error) {
    return {
      index,
      status: 'ERROR',
      time: 0,
      success: false,
      body: error.message,
    };
  }
}

async function runBatch(startIndex, count) {
  const promises = [];
  for (let i = 0; i < count; i++) {
    const index = startIndex + i;
    if (index < TOTAL_REQUESTS) {
      promises.push(makeRequest(index));
    }
  }
  return Promise.all(promises);
}

async function runTest() {
  console.log(
    `Testing rate limiting with ${TOTAL_REQUESTS} requests to ${API_URL}`,
  );
  console.log(`Sending ${CONCURRENT_REQUESTS} concurrent requests at a time\n`);

  const results = [];
  let successCount = 0;
  let failCount = 0;

  // Run batches of concurrent requests
  for (let i = 0; i < TOTAL_REQUESTS; i += CONCURRENT_REQUESTS) {
    const batchResults = await runBatch(i, CONCURRENT_REQUESTS);
    results.push(...batchResults);

    // Count successes and failures
    batchResults.forEach((result) => {
      if (result.success) {
        successCount++;
      } else {
        failCount++;
      }
    });

    // Print progress
    const progress = Math.min(
      100,
      Math.round(((i + CONCURRENT_REQUESTS) / TOTAL_REQUESTS) * 100),
    );
    process.stdout.write(
      `Progress: ${progress}% - Success: ${successCount}, Failed: ${failCount}\r`,
    );

    // Small delay between batches to avoid overwhelming the server
    if (i + CONCURRENT_REQUESTS < TOTAL_REQUESTS) {
      await new Promise((resolve) =>
        setTimeout(resolve, DELAY_BETWEEN_BATCHES),
      );
    }
  }

  console.log('\n\nTest completed!');
  console.log(`Total requests: ${TOTAL_REQUESTS}`);
  console.log(`Successful responses: ${successCount}`);
  console.log(`Failed responses: ${failCount}`);

  // Check if rate limiting is working
  if (failCount > 0 && successCount > 0) {
    console.log(
      '\nRate limiting appears to be working! Some requests were allowed and some were blocked.',
    );
  } else if (failCount === 0) {
    console.log(
      '\nRate limiting might not be working correctly. All requests succeeded.',
    );
  } else {
    console.log(
      '\nAll requests failed. There might be an issue with the server or endpoint.',
    );
  }

  // Show the first failed response if any
  const firstFailure = results.find((r) => !r.success);
  if (firstFailure) {
    console.log('\nFirst failed response:');
    console.log(`Request #${firstFailure.index + 1}`);
    console.log(`Status: ${firstFailure.status}`);
    console.log(`Response: ${firstFailure.body}`);
  }
}

runTest().catch((error) => {
  console.error('Test failed with error:', error);
});
