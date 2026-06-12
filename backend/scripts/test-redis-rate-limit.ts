import * as dotenv from 'dotenv';
import Redis from 'ioredis';

// Load environment variables from .env
dotenv.config();

const redisUrl = process.env.REDIS_URL;

if (!redisUrl) {
  console.error('REDIS_URL not found in env!');
  process.exit(1);
}

console.log('Connecting to Redis...');

const redis = new Redis(redisUrl);

async function testRateLimit() {
  const ip = '127.0.0.1';
  const type = 'login';
  const limit = 5;
  const ttl = 60;
  const blockDuration = 60; // 1 minute block

  const blockKey = `rate_limit:block:${type}:${ip}`;
  const failKey = `rate_limit:fail:${type}:${ip}`;

  // 1. Clean up old keys first
  await redis.del(blockKey);
  await redis.del(failKey);
  console.log('--- Resetted rate limit keys for test ---');

  // 2. Simulate 5 login failures
  for (let i = 1; i <= limit; i++) {
    const isBlocked = await redis.get(blockKey);
    if (isBlocked) {
      const blockTtl = await redis.ttl(blockKey);
      console.log(`Attempt ${i}: BLOCKED! TTL remaining: ${blockTtl} seconds.`);
      break;
    }

    console.log(`Attempt ${i}: Simulating fail...`);
    const currentFails = await redis.incr(failKey);
    if (currentFails === 1) {
      await redis.expire(failKey, ttl);
    }

    console.log(`  Fail count is now: ${currentFails}`);

    if (currentFails >= limit) {
      console.log(`  Threshold reached (${limit}). Setting block key for ${blockDuration} seconds.`);
      await redis.set(blockKey, '1', 'EX', blockDuration);
      await redis.del(failKey);
    }
  }

  // 3. Verify that the next attempt is blocked and we can read the TTL
  const isBlocked = await redis.get(blockKey);
  if (isBlocked) {
    const blockTtl = await redis.ttl(blockKey);
    console.log(`Verification: Client is officially BLOCKED for ${blockTtl} more seconds.`);
    if (blockTtl > 0 && blockTtl <= blockDuration) {
      console.log('SUCCESS: The block duration of 60 seconds (1 minute) is working correctly!');
    } else {
      console.error('FAIL: Block TTL is invalid:', blockTtl);
    }
  } else {
    console.error('FAIL: Client was not blocked!');
  }

  // Clean up
  await redis.del(blockKey);
  await redis.del(failKey);
  redis.disconnect();
}

testRateLimit().catch((err) => {
  console.error('Error during test:', err);
  redis.disconnect();
});
