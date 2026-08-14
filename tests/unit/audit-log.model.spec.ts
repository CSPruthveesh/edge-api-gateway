import { AuditLogModel } from '../../src/models/audit-log.model';

describe('AuditLogModel Schema Unit Tests', () => {
  it('should instantiate an AuditLog document with valid fields', () => {
    const doc = new AuditLogModel({
      correlationId: 'corr_test_001',
      clientIp: '192.168.1.1',
      method: 'POST',
      path: '/api/v1/auth/token',
      statusCode: 200,
      latencyMs: 12,
      userId: 'usr_test_1',
      userTier: 'pro'
    });

    expect(doc.correlationId).toBe('corr_test_001');
    expect(doc.clientIp).toBe('192.168.1.1');
    expect(doc.method).toBe('POST');
    expect(doc.statusCode).toBe(200);
    expect(doc.timestamp).toBeInstanceOf(Date);
  });
});
