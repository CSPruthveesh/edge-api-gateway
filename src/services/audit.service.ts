import envConfig from '../config/env.config.js';
import auditLogRepository, { AuditLogPayload } from '../database/repositories/audit-log.repository.js';
import logger from '../utils/logger.js';

export class AuditService {
  private queue: AuditLogPayload[] = [];
  private readonly batchSize: number;
  private readonly flushIntervalMs: number;
  private readonly maxQueueLimit: number = 50000;
  private flushTimer: NodeJS.Timeout | null = null;
  private isFlushing: boolean = false;

  constructor() {
    this.batchSize = envConfig.AUDIT_LOG_BATCH_SIZE || 100;
    this.flushIntervalMs = envConfig.AUDIT_LOG_FLUSH_INTERVAL_MS || 1000;
    this.startPeriodicFlush();
  }

  /**
   * Push a request metadata event into the asynchronous in-memory audit log queue.
   */
  public push(logEvent: AuditLogPayload): void {
    if (this.queue.length >= this.maxQueueLimit) {
      logger.warn(
        { maxQueueLimit: this.maxQueueLimit },
        'Audit log queue reached maximum memory limit; dropping log item to protect heap'
      );
      return;
    }

    this.queue.push(logEvent);

    if (this.queue.length >= this.batchSize) {
      setImmediate(() => this.flush());
    }
  }

  /**
   * Flushes queued audit events to MongoDB asynchronously.
   */
  public async flush(): Promise<number> {
    if (this.isFlushing || this.queue.length === 0) {
      return 0;
    }

    this.isFlushing = true;

    // Swap queue buffer for lock-free concurrency during flushing
    const batchToFlush = this.queue.splice(0, this.batchSize);

    try {
      const insertedCount = await auditLogRepository.bulkInsert(batchToFlush);
      return insertedCount;
    } catch (err) {
      logger.error({ err }, 'Error during audit log flush operation');
      return 0;
    } finally {
      this.isFlushing = false;
      if (this.queue.length >= this.batchSize) {
        setImmediate(() => this.flush());
      }
    }
  }

  private startPeriodicFlush(): void {
    if (this.flushTimer) return;
    this.flushTimer = setInterval(() => {
      this.flush().catch((err) => logger.error({ err }, 'Periodic audit log flush error'));
    }, this.flushIntervalMs);

    if (this.flushTimer.unref) {
      this.flushTimer.unref();
    }
  }

  public getQueueLength(): number {
    return this.queue.length;
  }

  public stop(): void {
    if (this.flushTimer) {
      clearInterval(this.flushTimer);
      this.flushTimer = null;
    }
  }
}

export const auditService = new AuditService();
export default auditService;
