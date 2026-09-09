import React from 'react';
import { History, Shield, CheckCircle, AlertCircle, Clock } from 'lucide-react';
import { AuditLog } from '../../types';
import { formatDateIndonesian } from '../../utils/formatters';

interface AdminAuditPageProps {
  auditLogs: AuditLog[];
}

export const AdminAuditPage: React.FC<AdminAuditPageProps> = ({ auditLogs }) => {
  return (
    <div id="admin-audit-page" className="p-4 sm:p-6 space-y-5 max-w-4xl mx-auto">
      <div className="pb-3 border-b border-zinc-200">
        <h1 className="text-xl font-bold text-zinc-900">
          Riwayat Audit & Aktivitas Admin
        </h1>
        <p className="text-xs text-zinc-500 mt-0.5">
          Rekaman tindakan operasional, verifikasi bukti tugas, dan update pencairan reward.
        </p>
      </div>

      <div className="bg-white border border-zinc-200 rounded-2xl overflow-hidden shadow-xs">
        {auditLogs.length > 0 ? (
          <div className="divide-y divide-zinc-200">
            {auditLogs.map((log) => (
              <div key={log.id} className="p-4 flex items-start gap-3 hover:bg-zinc-50/60">
                <div className="w-8 h-8 rounded-lg bg-zinc-100 text-zinc-700 flex items-center justify-center shrink-0 mt-0.5">
                  <Shield className="w-4 h-4" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-xs font-bold text-zinc-900">
                      {log.action}
                    </span>
                    <span className="text-[11px] text-zinc-400">
                      {formatDateIndonesian(log.timestamp)}
                    </span>
                  </div>
                  <p className="text-xs text-zinc-600 mt-0.5">{log.details}</p>
                  <p className="text-[10px] text-zinc-400 mt-1 font-mono">
                    Oleh: {log.adminEmail} • Target: {log.targetType} ({log.targetId})
                  </p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="p-8 text-center text-zinc-400 text-xs">
            Belum ada catatan audit log.
          </div>
        )}
      </div>
    </div>
  );
};
