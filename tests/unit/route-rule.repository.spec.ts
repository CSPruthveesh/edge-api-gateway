import { RouteRuleRepository } from '../../src/database/repositories/route-rule.repository';

describe('RouteRuleRepository Unit Tests', () => {
  let repo: RouteRuleRepository;

  beforeEach(() => {
    repo = new RouteRuleRepository();
  });

  it('should return seeded default route rules', () => {
    const rules = repo.getAllRules();
    expect(rules.length).toBeGreaterThanOrEqual(3);
    expect(rules.some((r) => r.prefix === '/api/v1/users')).toBe(true);
  });

  it('should find longest matching prefix for inbound request path', () => {
    const match = repo.findMatchingRule('/api/v1/users/profile/123');
    expect(match).toBeDefined();
    expect(match?.prefix).toBe('/api/v1/users');
    expect(match?.targetUrl).toBe('http://localhost:8001');
  });

  it('should return undefined when no route rule matches the inbound path', () => {
    const match = repo.findMatchingRule('/api/v1/unknown-service/test');
    expect(match).toBeUndefined();
  });

  it('should support dynamically adding and removing route rules', () => {
    repo.addRule({
      id: 'rule_analytics_v1',
      prefix: '/api/v1/analytics',
      targetUrl: 'http://localhost:8004',
      authRequired: true,
      enabled: true
    });

    const match = repo.findMatchingRule('/api/v1/analytics/events');
    expect(match).toBeDefined();
    expect(match?.targetUrl).toBe('http://localhost:8004');

    const deleted = repo.deleteRule('rule_analytics_v1');
    expect(deleted).toBe(true);
    expect(repo.findMatchingRule('/api/v1/analytics/events')).toBeUndefined();
  });
});
