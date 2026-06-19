import React from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { ConnectionPanel } from './components/ConnectionPanel';
import { FilterPanel } from './components/FilterPanel';
import { ChartBuilder } from './components/ChartBuilder';
import { AiAssistant } from './components/AiAssistant';
import { DataTable } from './components/DataTable';
import { VisualizationArea } from './components/VisualizationArea';
import { ApiExplorer } from './components/ApiExplorer';
import { TelemetryView } from './components/TelemetryView';
import { 
  BarChart3, 
  Database, 
  FileSpreadsheet,
  Radio,
  Network,
  MapPin,
  Settings2,
  Code2,
  Heart,
  LogOut,
  Layers,
  Building2
} from 'lucide-react';

const DashboardContent = () => {
  const { 
    isConnected, 
    activeObject, 
    setObjectType, 
    connectionInfo,
    activeTab,
    setActiveTab,
    disconnect
  } = useApp();

  // Standard Fiori Horizon Light theme styling classes
  const themeStyle = {
    bodyBg: 'bg-fiori-bg text-fiori-text',
    sidebarBg: 'bg-white border-fiori-border text-fiori-text',
    headerBg: 'bg-fiori-shell border-fiori-blue/20 text-white',
    cardClass: 'bg-white border-fiori-border text-fiori-text',
    tabActive: 'border-white text-white',
    tabInactive: 'border-transparent text-gray-300 hover:text-white'
  };

  return (
    <div className={`min-h-screen flex flex-col transition-colors duration-300 ${themeStyle.bodyBg}`}>
      {/* Top Navbar */}
      <header className={`h-16 shrink-0 flex items-center justify-between px-6 shadow-md border-b transition-colors duration-300 ${themeStyle.headerBg}`}>
        <div className="flex items-center gap-3">
          <div className="bg-fiori-blue p-2 rounded text-white flex items-center justify-center">
            <BarChart3 className="w-5 h-5 animate-pulse" />
          </div>
          <div>
            <h1 className="font-bold text-lg leading-none tracking-tight flex items-center gap-2">
              SF Insight
              <span className="text-[10px] uppercase font-semibold bg-fiori-blue/30 px-2 py-0.5 rounded tracking-wider text-fiori-blue-light border border-fiori-blue/10">
                PRO Studio
              </span>
            </h1>
            <p className="text-[9px] opacity-75 font-medium">SAP SuccessFactors Analytical Client</p>
          </div>
        </div>

        {/* Navigation Tabs (Multi-Route Layout) */}
        {isConnected && (
          <nav className="hidden md:flex gap-6 text-xs font-semibold uppercase tracking-wider h-full items-center">
            <button
              onClick={() => setActiveTab('dashboard')}
              className={`h-full px-2 border-b-2 flex items-center gap-1.5 transition-colors duration-200 ${
                activeTab === 'dashboard' ? themeStyle.tabActive : themeStyle.tabInactive
              }`}
            >
              <Settings2 className="w-4 h-4" />
              Reporting Studio
            </button>
            <button
              onClick={() => setActiveTab('apiExplorer')}
              className={`h-full px-2 border-b-2 flex items-center gap-1.5 transition-colors duration-200 ${
                activeTab === 'apiExplorer' ? themeStyle.tabActive : themeStyle.tabInactive
              }`}
            >
              <Code2 className="w-4 h-4" />
              JSON Payload Explorer
            </button>
            <button
              onClick={() => setActiveTab('telemetry')}
              className={`h-full px-2 border-b-2 flex items-center gap-1.5 transition-colors duration-200 ${
                activeTab === 'telemetry' ? themeStyle.tabActive : themeStyle.tabInactive
              }`}
            >
              <Heart className="w-4 h-4" />
              Telemetry Logs
            </button>
          </nav>
        )}

        {/* Connection Status and Telemetry */}
        <div className="flex items-center gap-4">

          {/* Connection Telemetry */}
          <div className="flex items-center gap-2">
            <span className="relative flex h-2 w-2">
              <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${isConnected ? 'bg-green-400' : 'bg-red-400'}`}></span>
              <span className={`relative inline-flex rounded-full h-2 w-2 ${isConnected ? 'bg-green-500' : 'bg-red-500'}`}></span>
            </span>
            <span className="text-[10px] md:text-xs font-semibold uppercase tracking-wider">
              {isConnected ? (
                <span className="text-green-400 flex items-center gap-1">
                  Connected
                  <span className="text-[9px] text-gray-400 font-normal lowercase hidden sm:inline">
                    ({connectionInfo?.username}@{connectionInfo?.companyId})
                  </span>
                </span>
              ) : (
                <span className="text-red-400">Offline</span>
              )}
            </span>
          </div>

          {/* Navbar Disconnect Button */}
          {isConnected && (
            <button
              onClick={disconnect}
              className="flex items-center gap-1.5 px-2.5 py-1 bg-red-600/20 hover:bg-red-600/40 border border-red-500/30 text-red-200 hover:text-white text-xs font-medium rounded transition duration-200"
            >
              <LogOut className="w-3.5 h-3.5" />
              Disconnect
            </button>
          )}
        </div>
      </header>

      {/* Disconnected State Screen */}
      {!isConnected ? (
        <main className="flex-1 flex items-center justify-center p-6 bg-radial">
          <div className="max-w-md w-full space-y-6">
            <div className="text-center">
              <div className="inline-flex bg-fiori-blue/10 p-4 rounded-full text-fiori-blue mb-3">
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
          <aside className={`w-full md:w-80 border-r flex flex-col shrink-0 overflow-y-auto p-5 gap-5 transition-colors duration-300 ${themeStyle.sidebarBg}`}>
            {/* Connection Telemetry info */}
            <div>
              <ConnectionPanel />
            </div>

            {/* Data Source Selection Card (Grid of 4 Entities) */}
            <div className="bg-white/5 border border-fiori-border/10 rounded p-4 shadow-sm">
              <label className="block text-[10px] font-bold text-fiori-text-muted uppercase tracking-wider mb-2 flex items-center gap-1">
                <Database className="w-3.5 h-3.5 text-fiori-blue" />
                Select OData Object
              </label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setObjectType('User')}
                  className={`flex items-center justify-center gap-1 py-1.5 px-2 border rounded text-[11px] font-bold transition ${
                    activeObject === 'User'
                      ? 'border-fiori-blue bg-fiori-blue-light text-fiori-blue'
                      : 'border-fiori-border/30 hover:bg-gray-100 text-fiori-text'
                  }`}
                >
                  <svg className="w-3.5 h-3.5 fill-current shrink-0" viewBox="0 0 24 24">
                    <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
                  </svg>
                  Employee
                </button>
                <button
                  type="button"
                  onClick={() => setObjectType('Position')}
                  className={`flex items-center justify-center gap-1 py-1.5 px-2 border rounded text-[11px] font-bold transition ${
                    activeObject === 'Position'
                      ? 'border-fiori-blue bg-fiori-blue-light text-fiori-blue'
                      : 'border-fiori-border/30 hover:bg-gray-100 text-fiori-text'
                  }`}
                >
                  <FileSpreadsheet className="w-3.5 h-3.5 shrink-0" />
                  Position
                </button>
                <button
                  type="button"
                  onClick={() => setObjectType('Department')}
                  className={`flex items-center justify-center gap-1 py-1.5 px-2 border rounded text-[11px] font-bold transition ${
                    activeObject === 'Department'
                      ? 'border-fiori-blue bg-fiori-blue-light text-fiori-blue'
                      : 'border-fiori-border/30 hover:bg-gray-100 text-fiori-text'
                  }`}
                >
                  <Network className="w-3.5 h-3.5 shrink-0" />
                  Department
                </button>
                <button
                  type="button"
                  onClick={() => setObjectType('Location')}
                  className={`flex items-center justify-center gap-1 py-1.5 px-2 border rounded text-[11px] font-bold transition ${
                    activeObject === 'Location'
                      ? 'border-fiori-blue bg-fiori-blue-light text-fiori-blue'
                      : 'border-fiori-border/30 hover:bg-gray-100 text-fiori-text'
                  }`}
                >
                  <MapPin className="w-3.5 h-3.5 shrink-0" />
                  Location
                </button>
                <button
                  type="button"
                  onClick={() => setObjectType('Division')}
                  className={`flex items-center justify-center gap-1 py-1.5 px-2 border rounded text-[11px] font-bold transition ${
                    activeObject === 'Division'
                      ? 'border-fiori-blue bg-fiori-blue-light text-fiori-blue'
                      : 'border-fiori-border/30 hover:bg-gray-100 text-fiori-text'
                  }`}
                >
                  <Layers className="w-3.5 h-3.5 shrink-0" />
                  Division
                </button>
                <button
                  type="button"
                  onClick={() => setObjectType('Company')}
                  className={`flex items-center justify-center gap-1 py-1.5 px-2 border rounded text-[11px] font-bold transition ${
                    activeObject === 'Company'
                      ? 'border-fiori-blue bg-fiori-blue-light text-fiori-blue'
                      : 'border-fiori-border/30 hover:bg-gray-100 text-fiori-text'
                  }`}
                >
                  <Building2 className="w-3.5 h-3.5 shrink-0" />
                  Company
                </button>
              </div>
            </div>

            {/* Render Sidebar Controls only on Dashboard tab */}
            {activeTab === 'dashboard' ? (
              <>
                <div>
                  <FilterPanel />
                </div>
                <div>
                  <ChartBuilder />
                </div>
              </>
            ) : (
              <div className="bg-white/5 border border-fiori-border/10 rounded p-4 text-xs italic text-fiori-text-muted">
                Navigate to the 'Reporting Studio' tab to use filters and chart controls.
              </div>
            )}
          </aside>

          {/* Main Content Area */}
          <main className="flex-1 p-6 overflow-y-auto flex flex-col gap-6">
            
            {/* Dashboard Tab Content */}
            {activeTab === 'dashboard' && (
              <div className="flex flex-col gap-6 w-full">
                {/* Top Row: Visual Studio (Chart) & AI Assistant side-by-side */}
                <div className="flex flex-col xl:flex-row gap-6 items-start w-full">
                  <div className="flex-1 min-w-0">
                    <VisualizationArea />
                  </div>
                  <div className="w-full xl:w-96 shrink-0 xl:sticky xl:top-6 self-start">
                    <AiAssistant />
                  </div>
                </div>

                {/* Bottom Row: Data Registry Table (Full Width) */}
                <div className="w-full min-w-0">
                  <DataTable />
                </div>
              </div>
            )}

            {/* API Explorer Tab Content */}
            {activeTab === 'apiExplorer' && (
              <div className="flex-1">
                <ApiExplorer />
              </div>
            )}

            {/* Telemetry Tab Content */}
            {activeTab === 'telemetry' && (
              <div className="flex-1">
                <TelemetryView />
              </div>
            )}
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
