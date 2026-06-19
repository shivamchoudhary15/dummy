import React from 'react';
import { useApp } from '../context/AppContext';
import { Code2, FileJson, AlertCircle } from 'lucide-react';

export const ApiExplorer = () => {
  const { activeObject, rawData, loading, error } = useApp();

  const formattedJson = React.useMemo(() => {
    if (rawData.length === 0) return '{}';
    // Slice first 5 items to keep it light for rendering
    return JSON.stringify({
      info: {
        source: `SAP SuccessFactors OData v2 Sandbox`,
        entity: activeObject === 'User' ? 'User' : activeObject === 'Position' ? 'Position' : activeObject === 'Department' ? 'FODepartment' : 'FOLocation',
        endpoint: activeObject === 'User' ? '/odata/v2/User' : activeObject === 'Position' ? '/odata/v2/Position' : activeObject === 'Department' ? '/odata/v2/FODepartment' : '/odata/v2/FOLocation',
        format: 'JSON',
        recordsReturned: rawData.length,
        displayingFirstRecords: Math.min(5, rawData.length)
      },
      results: rawData.slice(0, 5)
    }, null, 2);
  }, [rawData, activeObject]);

  return (
    <div className="bg-white border border-fiori-border rounded shadow-sm flex flex-col h-full overflow-hidden">
      <div className="p-4 border-b border-fiori-border flex items-center gap-2 bg-gray-50">
        <Code2 className="w-5 h-5 text-fiori-blue" />
        <h2 className="font-semibold text-fiori-shell text-base">
          SAP SuccessFactors OData JSON Payload Explorer
        </h2>
      </div>

      <div className="flex-1 p-6 overflow-y-auto font-mono text-xs text-gray-800 bg-gray-900 text-green-400 relative">
        {loading && (
          <div className="absolute inset-0 bg-gray-900/80 flex items-center justify-center text-white font-sans text-sm">
            <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-green-400" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            Fetching API payloads...
          </div>
        )}

        {error && (
          <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-white text-center font-sans">
            <AlertCircle className="w-12 h-12 text-red-500 mb-2" />
            <h4 className="font-bold">API Connection Error</h4>
            <p className="text-xs text-gray-400 max-w-sm mt-1">{error}</p>
          </div>
        )}

        {rawData.length === 0 && !loading && !error && (
          <div className="absolute inset-0 flex flex-col items-center justify-center text-gray-400 font-sans text-sm">
            <FileJson className="w-12 h-12 mb-2 text-gray-600" />
            No active connection profile loaded.
          </div>
        )}

        {rawData.length > 0 && !loading && !error && (
          <div className="space-y-4">
            <div className="bg-gray-800 text-gray-300 p-3.5 rounded border border-gray-700 font-sans text-xs">
              <p className="font-semibold text-green-400 mb-1 flex items-center gap-1.5">
                <span className="inline-block w-2.5 h-2.5 rounded-full bg-green-500 animate-ping shrink-0"></span>
                HTTP GET SUCCESS: 200 OK
              </p>
              <p>Requested URL: <span className="font-mono text-green-300">https://apisalesdemo2.successfactors.eu/odata/v2/{activeObject === 'User' ? 'User' : activeObject === 'Position' ? 'Position' : activeObject === 'Department' ? 'FODepartment' : 'FOLocation'}?$format=json&amp;$top=300</span></p>
            </div>
            
            <pre className="p-4 bg-gray-950 rounded border border-gray-800 max-h-[600px] overflow-y-auto whitespace-pre-wrap select-all">
              {formattedJson}
            </pre>
          </div>
        )}
      </div>
    </div>
  );
};
