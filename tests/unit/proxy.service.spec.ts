import { ProxyService } from '../../src/services/proxy.service';
import { RouteRule } from '../../src/models/route-rule.model';
import * as hpm from 'http-proxy-middleware';

jest.mock('http-proxy-middleware', () => ({
  createProxyMiddleware: jest.fn()
}));

describe('ProxyService Unit Tests', () => {
  let proxyService: ProxyService;

  beforeEach(() => {
    (hpm.createProxyMiddleware as jest.Mock).mockReturnValue((_req: unknown, _res: unknown, next?: () => void) => {
      if (next) next();
    });
    proxyService = new ProxyService();
  });

  it('should instantiate an express request handler for a given RouteRule', () => {
    const mockRule: RouteRule = {
      id: 'rule_test_service',
      prefix: '/api/v1/test',
      targetUrl: 'http://localhost:9999',
      authRequired: true,
      enabled: true
    };

    const handler = proxyService.createProxyHandler(mockRule);
    expect(typeof handler).toBe('function');
  });
});
