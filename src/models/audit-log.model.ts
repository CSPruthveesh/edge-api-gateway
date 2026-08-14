import mongoose, { Schema, Document } from 'mongoose';

export interface IAuditLog extends Document {
  correlationId: string;
  clientIp: string;
  method: string;
  path: string;
  statusCode: number;
  latencyMs: number;
  userId?: string;
  userTier?: string;
  userAgent?: string;
  timestamp: Date;
}

const AuditLogSchema: Schema = new Schema<IAuditLog>(
  {
    correlationId: { type: String, required: true, index: true },
    clientIp: { type: String, required: true },
    method: { type: String, required: true },
    path: { type: String, required: true },
    statusCode: { type: Number, required: true },
    latencyMs: { type: Number, required: true },
    userId: { type: String, index: true },
    userTier: { type: String },
    userAgent: { type: String },
    timestamp: { type: Date, default: Date.now, index: true }
  },
  {
    timestamps: false,
    versionKey: false
  }
);

// Compound index for analytics & audit trail lookups
AuditLogSchema.index({ timestamp: -1, statusCode: 1 });
AuditLogSchema.index({ userId: 1, timestamp: -1 });

export const AuditLogModel = mongoose.model<IAuditLog>('AuditLog', AuditLogSchema);
export default AuditLogModel;
