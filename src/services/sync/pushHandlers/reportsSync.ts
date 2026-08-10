import { db } from '../../../lib/dexie';
import { supabase } from '../../../lib/supabase';
import { handleFailedSync } from '../core';
import type { ReportHistory } from '../../../types/reports';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const handleReportHistorySync = async (item: any): Promise<boolean> => {
  if (item.action === 'CREATE') {
    const payload = item.payload as ReportHistory;
    const dbPayload = {
      id: payload.id,
      business_id: payload.businessId,
      report_type: payload.reportType,
      report_name: payload.reportName,
      export_format: payload.exportFormat,
      generated_by: payload.generatedBy || null,
      parameters: payload.parameters || null,
      generated_at: payload.generatedAt,
    };
    const { error } = await supabase.from('report_history').insert([dbPayload]);
    if (!error) {
      await db.syncQueue.delete(item.id!);
      return true;
    } else {
      await handleFailedSync(item.id!, error);
    }
  }
  return false;
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const handleAuditLogSync = async (item: any): Promise<boolean> => {
  if (item.action === 'CREATE') {
    const payload = item.payload as Record<string, unknown>;
    // Remove local 'status' flag before inserting into Supabase
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { status, ...dbPayload } = payload;
    const { error } = await supabase.from('audit_logs').insert([dbPayload]);
    if (!error) {
      if (typeof dbPayload.id === 'string') {
        const existing = await db.auditLogs.get(dbPayload.id);
        if (existing) {
          await db.auditLogs.update(dbPayload.id, { status: 'synced' });
        }
      }
      await db.syncQueue.delete(item.id!);
      return true;
    } else {
      await handleFailedSync(item.id!, error);
    }
  }
  return false;
};
