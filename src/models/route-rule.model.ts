export interface RouteRule {
  id: string;
  prefix: string;
  targetUrl: string;
  authRequired: boolean;
  rateLimitMax?: number;
  rateLimitWindowMs?: number;
  stripPrefix?: boolean;
  enabled: boolean;
}
