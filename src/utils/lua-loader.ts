export const SLIDING_WINDOW_LUA_SCRIPT = `
local key = KEYS[1];
local now = tonumber(ARGV[1]);
local windowMs = tonumber(ARGV[2]);
local maxRequests = tonumber(ARGV[3]);
local memberId = ARGV[4];

local clearBefore = now - windowMs;
redis.call('ZREMRANGEBYSCORE', key, 0, clearBefore);

local currentCount = redis.call('ZCARD', key);

if currentCount < maxRequests then
  redis.call('ZADD', key, now, memberId);
  local ttlSeconds = math.ceil(windowMs / 1000);
  redis.call('EXPIRE', key, ttlSeconds);
  return { 1, currentCount + 1, maxRequests - (currentCount + 1) };
else
  return { 0, currentCount, 0 };
end
`;
