import mongoose, { Schema, Document } from 'mongoose';

export interface IAuditLog extends Document {
  eventType: string;
  user: string;
  ip: string;
  userAgent: string;
  details: any;
  createdAt: Date;
}

const AuditLogSchema: Schema = new Schema({
  eventType: { type: String, required: true },
  user: { type: String },
  ip: { type: String },
  userAgent: { type: String },
  details: { type: Schema.Types.Mixed },
  createdAt: { type: Date, default: Date.now, expires: 2592000 } // 30 days TTL
});

export default mongoose.model<IAuditLog>('AuditLog', AuditLogSchema);