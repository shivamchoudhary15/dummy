import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { KeyRound, Server, Building2, User, Globe, AlertCircle, CheckCircle2, Loader2, LogOut } from 'lucide-react';

export const ConnectionPanel = () => {
  const { isConnected, connectionInfo, connect, disconnect, loading, error } = useApp();

  const [companyId, setCompanyId] = useState('SFCPART001143');
  const [username, setUsername] = useState('GLA_USER_1');
  const [password, setPassword] = useState('Fjvezb333@');
  const [baseUrl, setBaseUrl] = useState('https://apisalesdemo2.successfactors.eu');

  const handleSubmit = async (e) => {
    e.preventDefault();
    await connect({ companyId, username, password, baseUrl });
  };

  if (isConnected && connectionInfo) {
    return (
      <div className="bg-white border border-fiori-border rounded p-5 shadow-sm">
        <div className="flex items-center justify-between mb-4 border-b border-fiori-border pb-3">
          <h3 className="text-lg font-semibold text-fiori-shell flex items-center gap-2">
            <CheckCircle2 className="text-fiori-success w-5 h-5" />
            Connected to SAP SuccessFactors
          </h3>
          <button
            onClick={disconnect}
            className="flex items-center gap-1.5 px-3 py-1.5 border border-fiori-error text-fiori-error hover:bg-red-50 text-xs font-medium rounded transition"
          >
            <LogOut className="w-3.5 h-3.5" />
            Disconnect
          </button>
        </div>
        
        <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
          <div>
            <span className="text-fiori-text-muted block text-xs">Company ID</span>
            <span className="font-medium text-fiori-text">{connectionInfo.companyId}</span>
          </div>
          <div>
            <span className="text-fiori-text-muted block text-xs">Username</span>
            <span className="font-medium text-fiori-text">{connectionInfo.username}</span>
          </div>
          <div className="col-span-2 mt-2 pt-2 border-t border-gray-100">
            <span className="text-fiori-text-muted block text-xs">API Base URL</span>
            <span className="font-mono text-xs text-fiori-text truncate block">{connectionInfo.baseUrl}</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white border border-fiori-border rounded p-5 shadow-sm">
      <h3 className="text-lg font-semibold text-fiori-shell mb-4 flex items-center gap-2 border-b border-fiori-border pb-3">
        <KeyRound className="w-5 h-5 text-fiori-blue" />
        SAP SuccessFactors Connection
      </h3>

      {error && (
        <div className="bg-red-50 border-l-4 border-fiori-error p-3.5 mb-4 text-sm text-fiori-error flex items-start gap-2 rounded-r">
          <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-xs font-medium text-fiori-text-muted mb-1 flex items-center gap-1">
            <Building2 className="w-3 h-3 text-fiori-blue" />
            Company ID
          </label>
          <input
            type="text"
            required
            value={companyId}
            onChange={(e) => setCompanyId(e.target.value)}
            placeholder="e.g. SFCPART001143"
            className="w-full px-3 py-2 border border-fiori-border rounded text-sm focus:outline-none focus:border-fiori-blue"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-medium text-fiori-text-muted mb-1 flex items-center gap-1">
              <User className="w-3 h-3 text-fiori-blue" />
              Username
            </label>
            <input
              type="text"
              required
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="e.g. GLA_USER_1"
              className="w-full px-3 py-2 border border-fiori-border rounded text-sm focus:outline-none focus:border-fiori-blue"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-fiori-text-muted mb-1 flex items-center gap-1">
              <Server className="w-3 h-3 text-fiori-blue" />
              Password
            </label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full px-3 py-2 border border-fiori-border rounded text-sm focus:outline-none focus:border-fiori-blue"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-medium text-fiori-text-muted mb-1 flex items-center gap-1">
            <Globe className="w-3 h-3 text-fiori-blue" />
            OData Base URL
          </label>
          <input
            type="url"
            required
            value={baseUrl}
            onChange={(e) => setBaseUrl(e.target.value)}
            placeholder="e.g. https://apisalesdemo2.successfactors.eu"
            className="w-full px-3 py-2 border border-fiori-border rounded text-sm font-mono focus:outline-none focus:border-fiori-blue"
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-fiori-blue hover:bg-fiori-blue-dark text-white font-medium rounded text-sm shadow-sm transition disabled:opacity-70 disabled:cursor-not-allowed"
        >
          {loading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              Verifying Connection...
            </>
          ) : (
            'Connect & Verify'
          )}
        </button>
      </form>
    </div>
  );
};
