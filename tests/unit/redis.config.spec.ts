import RedisMock from 'ioredis-mock';

describe('Redis Configuration & ioredis Mock Unit Tests', () => {
  let redisMock: InstanceType<typeof RedisMock>;

  beforeEach(() => {
    redisMock = new RedisMock();
  });

  afterEach(async () => {
    await redisMock.quit();
  });

  it('should successfully set and get key-value pairs in memory', async () => {
    await redisMock.set('rate:usr_123', '15');
    const val = await redisMock.get('rate:usr_123');

    expect(val).toBe('15');
  });

  it('should execute pipeline commands atomically', async () => {
    const pipeline = redisMock.pipeline();
    pipeline.set('key1', 'val1');
    pipeline.set('key2', 'val2');
    const results = await pipeline.exec();

    expect(results).toHaveLength(2);
    expect(results[0][1]).toBe('OK');
    expect(results[1][1]).toBe('OK');
  });
});
