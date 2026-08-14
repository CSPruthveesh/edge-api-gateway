import { startClusteredServer } from '../../src/cluster';

describe('Cluster Module Unit Tests', () => {
  it('should export startClusteredServer function', () => {
    expect(typeof startClusteredServer).toBe('function');
  });
});
