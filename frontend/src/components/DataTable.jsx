import React, { useState, useMemo } from 'react';
import { useApp } from '../context/AppContext';
import { Search, ChevronDown, ChevronUp, ChevronLeft, ChevronRight, Table, AlertCircle, RefreshCw } from 'lucide-react';

export const DataTable = () => {
  const { 
    activeObject, 
    filteredData, 
    loading, 
    error,
    fetchData
  } = useApp();

  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [sortField, setSortField] = useState('');
  const [sortOrder, setSortOrder] = useState('asc');

  React.useEffect(() => {
    setCurrentPage(1);
  }, [activeObject, searchQuery, filteredData.length]);

  const columns = useMemo(() => {
    if (activeObject === 'User') {
      return [
        { key: 'userId', label: 'User ID' },
        { key: 'displayName', label: 'Name' },
        { key: 'title', label: 'Job Title' },
        { key: 'department', label: 'Department' },
        { key: 'location', label: 'Location' },
        { key: 'status', label: 'Status' },
        { key: 'manager', label: 'Manager' }
      ];
    } else if (activeObject === 'Position') {
      return [
        { key: 'code', label: 'Position Code' },
        { key: 'positionTitle', label: 'Position Title' },
        { key: 'jobCode', label: 'Job Code' },
        { key: 'department', label: 'Department' },
        { key: 'location', label: 'Location' },
        { key: 'effectiveStatus', label: 'Status' },
        { key: 'targetFTE', label: 'FTE' },
        { key: 'standardHours', label: 'Std Hours' }
      ];
    } else if (activeObject === 'Department') {
      return [
        { key: 'code', label: 'Department Code' },
        { key: 'name', label: 'Department Name' },
        { key: 'status', label: 'Status' },
        { key: 'description', label: 'Description' },
        { key: 'createdBy', label: 'Created By' }
      ];
    } else if (activeObject === 'Location') {
      return [
        { key: 'code', label: 'Location Code' },
        { key: 'name', label: 'Location Name' },
        { key: 'status', label: 'Status' },
        { key: 'timezone', label: 'Timezone' },
        { key: 'locationGroup', label: 'Region Group' },
        { key: 'standardHours', label: 'Weekly Hours' }
      ];
    } else if (activeObject === 'Division') {
      return [
        { key: 'code', label: 'Division Code' },
        { key: 'name', label: 'Division Name' },
        { key: 'status', label: 'Status' },
        { key: 'description', label: 'Description' },
        { key: 'createdBy', label: 'Created By' }
      ];
    } else { // Company
      return [
        { key: 'code', label: 'Company Code' },
        { key: 'name', label: 'Company Name' },
        { key: 'status', label: 'Status' },
        { key: 'country', label: 'Country' },
        { key: 'description', label: 'Description' }
      ];
    }
  }, [activeObject]);

  const processedData = useMemo(() => {
    let result = [...filteredData];

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(item => {
        return Object.entries(item).some(([key, val]) => {
          if (val === null || val === undefined) return false;
          if (key === 'manager' && typeof val === 'object') {
            return val.displayName?.toLowerCase().includes(q);
          }
          if (typeof val === 'object') return false;
          return String(val).toLowerCase().includes(q);
        });
      });
    }

    if (sortField) {
      result.sort((a, b) => {
        let aVal = a[sortField];
        let bVal = b[sortField];

        if (sortField === 'manager') {
          aVal = a.manager ? a.manager.displayName : '';
          bVal = b.manager ? b.manager.displayName : '';
        }

        if (aVal === null || aVal === undefined) aVal = '';
        if (bVal === null || bVal === undefined) bVal = '';

        if (typeof aVal === 'number' && typeof bVal === 'number') {
          return sortOrder === 'asc' ? aVal - bVal : bVal - aVal;
        }

        const aStr = String(aVal).toLowerCase();
        const bStr = String(bVal).toLowerCase();

        if (aStr < bStr) return sortOrder === 'asc' ? -1 : 1;
        if (aStr > bStr) return sortOrder === 'asc' ? 1 : -1;
        return 0;
      });
    }

    return result;
  }, [filteredData, searchQuery, sortField, sortOrder]);

  const totalRecords = processedData.length;
  const totalPages = Math.ceil(totalRecords / pageSize) || 1;
  const startIndex = (currentPage - 1) * pageSize;
  const paginatedData = useMemo(() => {
    return processedData.slice(startIndex, startIndex + pageSize);
  }, [processedData, startIndex, pageSize]);

  const handleSort = (key) => {
    if (sortField === key) {
      setSortOrder(prev => (prev === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortField(key);
      setSortOrder('asc');
    }
  };

  const handleRefresh = () => {
    fetchData(true);
  };

  const renderCell = (item, colKey) => {
    const val = item[colKey];
    if (colKey === 'status' || colKey === 'effectiveStatus') {
      const active = val === 'Active';
      return (
        <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold ${
          active 
            ? 'bg-green-100 text-fiori-success' 
            : 'bg-red-100 text-fiori-error'
        }`}>
          {val}
        </span>
      );
    }

    if (colKey === 'manager' && item.manager) {
      return (
        <span className="font-medium text-fiori-text">
          {item.manager.displayName}
          <span className="block text-xs font-normal text-fiori-text-muted">{item.manager.userId}</span>
        </span>
      );
    }

    if (colKey === 'manager' && !item.manager) {
      return <span className="text-fiori-text-muted italic text-xs">No Manager</span>;
    }

    if (colKey === 'targetFTE') {
      return <span className="font-mono text-sm">{Number(val).toFixed(2)}</span>;
    }

    if (colKey === 'standardHours') {
      return <span className="font-mono text-sm">{val} hrs</span>;
    }

    return val || <span className="text-gray-300">—</span>;
  };

  return (
    <div className="bg-white border border-fiori-border rounded shadow-sm overflow-hidden flex flex-col h-full">
      <div className="p-4 border-b border-fiori-border flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-gray-50">
        <div className="flex items-center gap-2">
          <Table className="w-5 h-5 text-fiori-blue" />
          <h2 className="font-semibold text-fiori-shell text-base">
            {activeObject} Data Registry ({totalRecords} records)
          </h2>
        </div>
        <div className="flex items-center gap-2">
          <div className="relative shrink-0">
            <Search className="w-4 h-4 text-fiori-text-muted absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Search table rows..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 pr-3 py-1.5 border border-fiori-border rounded text-sm w-48 sm:w-64 focus:outline-none focus:border-fiori-blue bg-white"
            />
          </div>
          <button
            onClick={handleRefresh}
            title="Refresh SuccessFactors Data"
            className="p-2 border border-fiori-border rounded hover:bg-gray-100 text-fiori-text transition shrink-0"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-x-auto min-h-[300px] relative">
        {loading && (
          <div className="absolute inset-0 bg-white bg-opacity-70 z-10 flex flex-col items-center justify-center">
            <RefreshCw className="w-8 h-8 text-fiori-blue animate-spin mb-2" />
            <span className="text-sm font-medium text-fiori-text">Querying SuccessFactors...</span>
          </div>
        )}

        {error && (
          <div className="p-8 text-center flex flex-col items-center justify-center h-full">
            <AlertCircle className="w-12 h-12 text-fiori-error mb-2" />
            <h4 className="text-lg font-semibold text-fiori-shell">Unable to Fetch Dataset</h4>
            <p className="text-sm text-fiori-text-muted max-w-md mt-1 mb-4">{error}</p>
            <button
              onClick={handleRefresh}
              className="px-4 py-2 bg-fiori-blue hover:bg-fiori-blue-dark text-white text-sm font-medium rounded shadow transition"
            >
              Retry Connection
            </button>
          </div>
        )}

        {!loading && !error && totalRecords === 0 && (
          <div className="p-8 text-center flex flex-col items-center justify-center h-full">
            <Table className="w-12 h-12 text-gray-300 mb-2" />
            <h4 className="text-base font-semibold text-fiori-shell">No Records Found</h4>
            <p className="text-sm text-fiori-text-muted mt-1">
              Try adjusting your active filters or double-check the SuccessFactors connection.
            </p>
          </div>
        )}

        {!loading && !error && totalRecords > 0 && (
          <table className="w-full text-left text-sm border-collapse">
            <thead>
              <tr className="bg-gray-100 border-b border-fiori-border select-none">
                {columns.map(col => (
                  <th
                    key={col.key}
                    onClick={() => handleSort(col.key)}
                    className="px-4 py-3 font-semibold text-fiori-shell cursor-pointer hover:bg-gray-200 transition text-xs uppercase tracking-wider"
                  >
                    <div className="flex items-center gap-1">
                      {col.label}
                      {sortField === col.key ? (
                        sortOrder === 'asc' ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />
                      ) : (
                        <div className="w-3.5 h-3.5 opacity-20 hover:opacity-100"><ChevronDown className="w-3.5 h-3.5" /></div>
                      )}
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {paginatedData.map((item, idx) => (
                <tr 
                  key={idx} 
                  className={`border-b border-gray-100 hover:bg-fiori-blue-light/20 transition-colors ${
                    idx % 2 === 1 ? 'bg-gray-50/50' : 'bg-white'
                  }`}
                >
                  {columns.map(col => (
                    <td key={col.key} className="px-4 py-3 text-fiori-text max-w-xs truncate">
                      {renderCell(item, col.key)}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {!loading && !error && totalRecords > 0 && (
        <div className="p-4 border-t border-fiori-border flex flex-col sm:flex-row items-center justify-between gap-3 bg-gray-50 text-xs text-fiori-text-muted select-none">
          <div className="flex items-center gap-2">
            <span>Show</span>
            <select
              value={pageSize}
              onChange={(e) => {
                setPageSize(Number(e.target.value));
                setCurrentPage(1);
              }}
              className="px-1.5 py-1 border border-fiori-border rounded bg-white text-fiori-text focus:outline-none"
            >
              {[5, 10, 25, 50, 100].map(size => (
                <option key={size} value={size}>{size}</option>
              ))}
            </select>
            <span>entries</span>
            <span className="mx-2">|</span>
            <span>
              Showing {startIndex + 1} to {Math.min(startIndex + pageSize, totalRecords)} of {totalRecords} rows
            </span>
          </div>

          <div className="flex items-center gap-1">
            <button
              onClick={() => setCurrentPage(1)}
              disabled={currentPage === 1}
              className="p-1.5 border border-fiori-border rounded bg-white hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              First
            </button>
            <button
              onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
              className="p-1.5 border border-fiori-border rounded bg-white hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ChevronLeft className="w-3.5 h-3.5" />
            </button>
            <span className="px-3 font-medium text-fiori-text">
              Page {currentPage} of {totalPages}
            </span>
            <button
              onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
              disabled={currentPage === totalPages}
              className="p-1.5 border border-fiori-border rounded bg-white hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => setCurrentPage(totalPages)}
              disabled={currentPage === totalPages}
              className="p-1.5 border border-fiori-border rounded bg-white hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Last
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
