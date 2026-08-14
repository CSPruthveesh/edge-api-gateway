import { AuditLogModel } from '../../models/audit-log.model.js';
import logger from '../../utils/logger.js';

export interface AuditLogPayload {
  correlationId: string;
  clientIp: string;
  method: string;
  path: string;
  statusCode: number;
  latencyMs: number;
  userId?: string;
  userTier?: string;
  userAgent?: string;
  timestamp?: Date;
}

export class AuditLogRepository {
  /**
   * Performs bulk asynchronous insert of audit log items into MongoDB.
   */
  public async bulkInsert(logs: AuditLogPayload[]): Promise<number> {
    if (!logs || logs.length === 0) return 0;

    try {
      const docs = logs.map((log) => ({
        ...log,
        timestamp: log.timestamp || new Date()
      }));

      const inserted = await AuditLogModel.insertMany(docs, { ordered: false });
      logger.info({ count: inserted.length }, 'Successfully flushed audit logs to MongoDB');
      return inserted.length;
    } catch (error) {
      logger.warn({ error, batchCount: logs.length }, 'Failed to insert audit log batch into MongoDB');
      return 0;
    }
  }
}

export const auditLogRepository = new AuditLogRepository();
export default auditLogRepository;
