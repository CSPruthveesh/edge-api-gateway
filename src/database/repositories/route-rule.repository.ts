import { RouteRule } from '../../models/route-rule.model.js';

export class RouteRuleRepository {
  private rules: Map<string, RouteRule> = new Map();

  constructor() {
    this.seedDefaultRules();
  }

  /**
   * Seed default routing table rules for microservice targets.
   */
  private seedDefaultRules(): void {
    const defaultRules: RouteRule[] = [
      {
        id: 'rule_users_v1',
        prefix: '/api/v1/users',
        targetUrl: 'http://localhost:8001',
        authRequired: true,
        rateLimitMax: 500,
        rateLimitWindowMs: 60000,
        stripPrefix: false,
        enabled: true
      },
      {
        id: 'rule_orders_v1',
        prefix: '/api/v1/orders',
        targetUrl: 'http://localhost:8002',
        authRequired: true,
        rateLimitMax: 200,
        rateLimitWindowMs: 60000,
        stripPrefix: false,
        enabled: true
      },
      {
        id: 'rule_payments_v1',
        prefix: '/api/v1/payments',
        targetUrl: 'http://localhost:8003',
        authRequired: true,
        rateLimitMax: 50,
        rateLimitWindowMs: 60000,
        stripPrefix: false,
        enabled: true
      }
    ];

    for (const rule of defaultRules) {
      this.rules.set(rule.id, rule);
    }
  }

  public getAllRules(): RouteRule[] {
    return Array.from(this.rules.values()).filter((r) => r.enabled);
  }

  public getRuleById(id: string): RouteRule | undefined {
    return this.rules.get(id);
  }

  /**
   * Finds the longest matching active route rule prefix for an inbound path.
   */
  public findMatchingRule(path: string): RouteRule | undefined {
    const activeRules = this.getAllRules();
    let bestMatch: RouteRule | undefined;
    let longestLength = 0;

    for (const rule of activeRules) {
      if (path.startsWith(rule.prefix) && rule.prefix.length > longestLength) {
        bestMatch = rule;
        longestLength = rule.prefix.length;
      }
    }

    return bestMatch;
  }

  public addRule(rule: RouteRule): void {
    this.rules.set(rule.id, rule);
  }

  public deleteRule(id: string): boolean {
    return this.rules.delete(id);
  }
}

export const routeRuleRepository = new RouteRuleRepository();
export default routeRuleRepository;
