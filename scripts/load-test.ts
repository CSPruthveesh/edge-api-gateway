import autocannon from 'autocannon';
import jwtService from '../src/services/jwt.service.js';
import envConfig from '../src/config/env.config.js';

export const runLoadTest = (): void => {
  const token = jwtService.signToken({
    id: 'usr_benchmark_99',
    tier: 'enterprise',
    roles: ['admin']
  });

  const url = `http://${envConfig.HOST}:${envConfig.PORT}/health`;

  // eslint-disable-next-line no-console
  console.log(`🚀 Launching Autocannon Benchmark against ${url}...`);
  // eslint-disable-next-line no-console
  console.log('⚡ Target: 12,000+ RPS | High Concurrency: 100 connections');

  const instance = autocannon({
    url,
    connections: 100,
    duration: 10,
    headers: {
      Authorization: `Bearer ${token}`
    }
  });

  autocannon.track(instance, { renderProgressBar: true });

  instance.on('done', (result) => {
    // eslint-disable-next-line no-console
    console.log('\n📊 === GATEWAY BENCHMARK RESULTS ===');
    // eslint-disable-next-line no-console
    console.log(`Requests/sec: ${result.requests.average}`);
    // eslint-disable-next-line no-console
    console.log(`Total Requests: ${result.requests.total}`);
    // eslint-disable-next-line no-console
    console.log(`Latency p50: ${result.latency.p50} ms`);
    // eslint-disable-next-line no-console
    console.log(`Latency p95: ${result.latency.p95} ms`);
    // eslint-disable-next-line no-console
    console.log(`Latency p99: ${result.latency.p99} ms`);
    // eslint-disable-next-line no-console
    console.log(`Non-2xx Errors: ${result.non2xx}`);
  });
};

if (process.argv[1]?.includes('load-test')) {
  runLoadTest();
}
