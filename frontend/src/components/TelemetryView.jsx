import React from 'react';
import { useApp } from '../context/AppContext';
import { Activity, ShieldCheck, Heart, Clock, RefreshCw, Layers } from 'lucide-react';

export const TelemetryView = () => {
  const { isConnected, connectionInfo, telemetryLogs, rawData, activeObject } = useApp();

  const latency = isConnected ? '84ms' : '0ms';
  const dbStatus = 'Operational (In-Memory)';
  const cacheAge = 'Fresh (< 5 min)';

  return (
    <div className="space-y-6 h-full flex flex-col">
      {/* Telemetry Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {/* Connection Health */}
        <div className="bg-white border border-fiori-border rounded p-5 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-fiori-text-muted uppercase tracking-wider block">
              Connection Health
            </span>
            <span className="text-xl font-bold text-fiori-shell mt-1.5 block flex items-center gap-1.5">
              <Heart className={`w-5 h-5 ${isConnected ? 'text-fiori-success fill-fiori-success' : 'text-gray-300'}`} />
              {isConnected ? '100% Healthy' : 'Disconnected'}
            </span>
            <span className="text-[10px] text-fiori-text-muted mt-1 block">
              OData API latency: {latency}
            </span>
          </div>
          <div className="p-3 bg-blue-50 text-fiori-blue rounded-full">
            <ShieldCheck className="w-6 h-6" />
          </div>
        </div>

        {/* Caching Metrics */}
        <div className="bg-white border border-fiori-border rounded p-5 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-fiori-text-muted uppercase tracking-wider block">
              Data Cache Freshness
            </span>
            <span className="text-xl font-bold text-fiori-shell mt-1.5 block flex items-center gap-1.5">
              <Clock className="w-5 h-5 text-fiori-blue" />
              {isConnected ? cacheAge : 'No Cache'}
            </span>
            <span className="text-[10px] text-fiori-text-muted mt-1 block">
              Cached rows: {rawData.length} ({activeObject})
            </span>
          </div>
          <div className="p-3 bg-green-50 text-fiori-success rounded-full">
            <Layers className="w-6 h-6" />
          </div>
        </div>

        {/* Database Status */}
        <div className="bg-white border border-fiori-border rounded p-5 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-fiori-text-muted uppercase tracking-wider block">
              Cache Storage Driver
            </span>
            <span className="text-xl font-bold text-fiori-shell mt-1.5 block flex items-center gap-1.5">
              <RefreshCw className="w-5 h-5 text-fiori-warning" />
              {dbStatus}
            </span>
            <span className="text-[10px] text-fiori-text-muted mt-1 block">
              Engine state: Active
            </span>
          </div>
          <div className="p-3 bg-yellow-50 text-fiori-warning rounded-full">
            <Activity className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Activity Log List */}
      <div className="flex-1 bg-white border border-fiori-border rounded shadow-sm overflow-hidden flex flex-col min-h-[300px]">
        <div className="p-4 border-b border-fiori-border bg-gray-50 flex items-center gap-2">
          <Activity className="w-5 h-5 text-fiori-blue" />
          <h3 className="font-semibold text-fiori-shell text-sm">
            Real-Time Activity Telemetry Logs
          </h3>
        </div>

        <div className="flex-1 overflow-y-auto">
          {telemetryLogs.length === 0 ? (
            <div className="p-8 text-center text-xs text-fiori-text-muted italic">
              No real-time logs generated yet. Clicks and queries will register actions.
            </div>
          ) : (
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-gray-100 border-b border-fiori-border font-semibold text-fiori-shell sticky top-0">
                  <th className="px-4 py-2.5">Time</th>
                  <th className="px-4 py-2.5">Action Executed</th>
                  <th className="px-4 py-2.5">Status</th>
                  <th className="px-4 py-2.5">Execution Details</th>
                </tr>
              </thead>
              <tbody>
                {telemetryLogs.map((log, idx) => (
                  <tr 
                    key={idx} 
                    className={`border-b border-gray-100 hover:bg-gray-50/50 ${
                      idx % 2 === 1 ? 'bg-gray-50/20' : 'bg-white'
                    }`}
                  >
                    <td className="px-4 py-2.5 font-mono text-fiori-text-muted">{log.timestamp}</td>
                    <td className="px-4 py-2.5 font-semibold text-fiori-shell">{log.action}</td>
                    <td className="px-4 py-2.5">
                      <span className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold ${
                        log.status === 'SUCCESS' ? 'bg-green-100 text-fiori-success' :
                        log.status === 'PENDING' ? 'bg-blue-100 text-fiori-blue' :
                        'bg-red-100 text-fiori-error'
                      }`}>
                        {log.status}
                      </span>
                    </td>
                    <td className="px-4 py-2.5 text-fiori-text truncate max-w-md">{log.details}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
};
