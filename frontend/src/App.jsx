import React from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { ConnectionPanel } from './components/ConnectionPanel';
import { FilterPanel } from './components/FilterPanel';
import { ChartBuilder } from './components/ChartBuilder';
import { NlpBuilder } from './components/NlpBuilder';
import { DataTable } from './components/DataTable';
import { VisualizationArea } from './components/VisualizationArea';
import { 
  BarChart3, 
  Database, 
  FileSpreadsheet,
  Radio
} from 'lucide-react';

const DashboardContent = () => {
  const { isConnected, activeObject, setObjectType, connectionInfo } = useApp();

  return (
    <div className="min-h-screen flex flex-col bg-fiori-bg">
      {/* Top Navbar */}
      <header className="bg-fiori-shell text-white h-16 shrink-0 flex items-center justify-between px-6 shadow-md border-b border-fiori-blue/20">
        <div className="flex items-center gap-3">
          <div className="bg-fiori-blue p-2 rounded text-white flex items-center justify-center">
            <BarChart3 className="w-5 h-5" />
          </div>
          <div>
            <h1 className="font-bold text-lg leading-none tracking-tight flex items-center gap-2">
              SF Insight
              <span className="text-[10px] uppercase font-semibold bg-fiori-blue/40 px-2 py-0.5 rounded tracking-wider border border-fiori-blue-light/20 text-fiori-blue-light">
                OData v2
              </span>
            </h1>
            <p className="text-[10px] text-gray-300 font-medium">SAP SuccessFactors Reporting Studio</p>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <span className="relative flex h-2 w-2">
              <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${isConnected ? 'bg-green-400' : 'bg-red-400'}`}></span>
              <span className={`relative inline-flex rounded-full h-2 w-2 ${isConnected ? 'bg-green-500' : 'bg-red-500'}`}></span>
            </span>
            <span className="text-xs font-semibold uppercase tracking-wider">
              {isConnected ? (
                <span className="text-green-400 flex items-center gap-1">
                  Connected
                  <span className="text-[10px] text-gray-300 font-normal lowercase">
                    ({connectionInfo?.username}@{connectionInfo?.companyId})
                  </span>
                </span>
              ) : (
                <span className="text-red-400">Offline</span>
              )}
            </span>
          </div>
        </div>
      </header>

      {/* Disconnected State Screen */}
      {!isConnected ? (
        <main className="flex-1 flex items-center justify-center p-6 bg-radial bg-[#f0f4f8]">
          <div className="max-w-md w-full space-y-6">
            <div className="text-center">
              <div className="inline-flex bg-fiori-shell/10 p-4 rounded-full text-fiori-shell mb-3">
                <Radio className="w-8 h-8 text-fiori-blue animate-pulse" />
              </div>
              <h2 className="text-2xl font-bold text-fiori-shell">Welcome to SF Insight</h2>
              <p className="text-sm text-fiori-text-muted mt-1.5">
                A lightweight self-service visual reporting tool designed for HR departments. Connect using your SAP SuccessFactors credentials.
              </p>
            </div>
            
            <ConnectionPanel />
            
            <div className="bg-blue-50 border border-blue-200 rounded p-4 flex gap-3 text-xs text-blue-800 leading-relaxed shadow-sm">
              <InfoIcon className="w-4 h-4 shrink-0 text-fiori-blue mt-0.5" />
              <div>
                <strong className="font-semibold block mb-0.5">SAP sandbox seeded users:</strong>
                Use default pre-filled credentials. All requests go directly to the OData API. In-memory data structures enforce strict aggregation before rendering.
              </div>
            </div>
          </div>
        </main>
      ) : (
        /* Connected Workspace Layout */
        <div className="flex-1 flex flex-col md:flex-row overflow-hidden">
          {/* Left Sidebar */}
          <aside className="w-full md:w-80 border-r border-fiori-border bg-white flex flex-col shrink-0 overflow-y-auto p-5 gap-5">
            <div>
              <ConnectionPanel />
            </div>

            <div className="bg-white border border-fiori-border rounded p-4 shadow-sm">
              <label className="block text-xs font-semibold text-fiori-text-muted uppercase tracking-wider mb-2 flex items-center gap-1">
                <Database className="w-3.5 h-3.5 text-fiori-blue" />
                Select OData Object
              </label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setObjectType('User')}
                  className={`flex items-center justify-center gap-1.5 py-2 px-3 border rounded text-xs font-bold transition ${
                    activeObject === 'User'
                      ? 'border-fiori-blue bg-fiori-blue-light text-fiori-blue'
                      : 'border-fiori-border hover:bg-gray-50 text-fiori-text'
                  }`}
                >
                  <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
                    <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
                  </svg>
                  User (Employee)
                </button>
                <button
                  type="button"
                  onClick={() => setObjectType('Position')}
                  className={`flex items-center justify-center gap-1.5 py-2 px-3 border rounded text-xs font-bold transition ${
                    activeObject === 'Position'
                      ? 'border-fiori-blue bg-fiori-blue-light text-fiori-blue'
                      : 'border-fiori-border hover:bg-gray-50 text-fiori-text'
                  }`}
                >
                  <FileSpreadsheet className="w-3.5 h-3.5" />
                  Position Org
                </button>
              </div>
            </div>

            <div>
              <FilterPanel />
            </div>

            <div>
              <ChartBuilder />
            </div>

            <div>
              <NlpBuilder />
            </div>
          </aside>

          {/* Main Content Area */}
          <main className="flex-1 p-6 overflow-y-auto space-y-6 flex flex-col">
            <div className="flex-1 min-h-[420px]">
              <VisualizationArea />
            </div>

            <div className="flex-1 min-h-[350px]">
              <DataTable />
            </div>
          </main>
        </div>
      )}
    </div>
  );
};

export default function App() {
  return (
    <AppProvider>
      <DashboardContent />
    </AppProvider>
  );
}

const InfoIcon = ({ className }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
    <path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
);
