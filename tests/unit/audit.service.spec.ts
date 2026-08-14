import { AuditService } from '../../src/services/audit.service';
import auditLogRepository from '../../src/database/repositories/audit-log.repository';

jest.mock('../../src/database/repositories/audit-log.repository', () => ({
  bulkInsert: jest.fn(),
  default: {
    bulkInsert: jest.fn()
  }
}));

describe('AuditService Unit Tests', () => {
  let auditService: AuditService;

  beforeEach(() => {
    (auditLogRepository.bulkInsert as jest.Mock).mockResolvedValue(5);
    auditService = new AuditService();
  });

  afterEach(() => {
    auditService.stop();
  });

  it('should queue log events in memory without blocking', () => {
    auditService.push({
      correlationId: 'corr_1',
      clientIp: '127.0.0.1',
      method: 'GET',
      path: '/api/v1/health',
      statusCode: 200,
      latencyMs: 2
    });

    expect(auditService.getQueueLength()).toBe(1);
  });

  it('should flush queued log events via bulkInsert', async () => {
    auditService.push({
      correlationId: 'corr_2',
      clientIp: '127.0.0.1',
      method: 'GET',
      path: '/api/v1/users',
      statusCode: 200,
      latencyMs: 5
    });

    const flushedCount = await auditService.flush();
    expect(flushedCount).toBe(5);
  });
});
