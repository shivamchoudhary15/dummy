import React, { createContext, useContext, useState, useEffect } from 'react';
import { apiService } from '../services/api';

const AppContext = createContext(undefined);

export const AppProvider = ({ children }) => {
  const [isConnected, setIsConnected] = useState(false);
  const [connectionInfo, setConnectionInfo] = useState(null);
  const [activeObject, setActiveObject] = useState('User');
  const [rawData, setRawData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [aggregatedData, setAggregatedData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  
  // Navigation & Theme
  const [activeTab, setActiveTab] = useState('dashboard'); // 'dashboard' | 'apiExplorer' | 'telemetry'
  const [theme, setTheme] = useState('light'); // 'light' | 'dark' | 'quartz'
  
  // Filters
  const [filters, setFilters] = useState({});
  
  // LLM Config Settings
  const [llmProvider, setLlmProvider] = useState('local'); // 'local' | 'openai' | 'claude' | 'gemini'
  const [llmApiKey, setLlmApiKey] = useState('');
  
  // Chart settings
  const [chartSettings, setChartSettings] = useState({
    chartType: 'bar',
    groupBy: 'department',
    aggregation: 'count',
    numericField: '',
  });

  const [nlpPrompt, setNlpPrompt] = useState('');
  const [nlpError, setNlpError] = useState(null);
  
  // Telemetry logs
  const [telemetryLogs, setTelemetryLogs] = useState([]);

  const addTelemetryLog = (action, status, details = '') => {
    setTelemetryLogs(prev => [
      {
        timestamp: new Date().toLocaleTimeString(),
        action,
        status,
        details
      },
      ...prev.slice(0, 49) // Keep last 50 logs
    ]);
  };

  // Check connection status on startup
  useEffect(() => {
    const checkConn = async () => {
      try {
        const res = await apiService.getConnectionStatus();
        if (res.connected && res.connection) {
          setIsConnected(true);
          setConnectionInfo(res.connection);
          addTelemetryLog('Startup Conn Check', 'SUCCESS', `Connected to ${res.connection.companyId}`);
        }
      } catch (err) {
        addTelemetryLog('Startup Conn Check', 'OFFLINE', 'No active connection found');
      }
    };
    checkConn();
  }, []);

  // Fetch data when connection becomes active or activeObject changes
  useEffect(() => {
    if (isConnected) {
      fetchData();
    }
  }, [isConnected, activeObject]);

  // Apply filters locally on rawData whenever rawData or filters change
  useEffect(() => {
    if (rawData.length === 0) {
      setFilteredData([]);
      return;
    }

    const filtered = rawData.filter(item => {
      return Object.entries(filters).every(([key, filterValue]) => {
        if (!filterValue) return true;

        if (key === 'manager' && item.manager) {
          return item.manager.displayName.toLowerCase().includes(filterValue.toLowerCase());
        }

        const itemValue = item[key];
        if (itemValue === undefined || itemValue === null) return false;

        return String(itemValue).toLowerCase().includes(filterValue.toLowerCase());
      });
    });

    setFilteredData(filtered);
    addTelemetryLog('Filter Applied', 'SUCCESS', `Filtered rows: ${filtered.length} of ${rawData.length}`);
  }, [rawData, filters]);

  // Run backend aggregation whenever filteredData or chart settings change
  useEffect(() => {
    if (filteredData.length > 0) {
      triggerAggregate();
    } else {
      setAggregatedData([]);
    }
  }, [filteredData, chartSettings.groupBy, chartSettings.aggregation, chartSettings.numericField]);

  const connect = async (credentials) => {
    setLoading(true);
    setError(null);
    addTelemetryLog('SAP Verification Connection', 'PENDING', `User: ${credentials.username}`);
    try {
      const res = await apiService.connect(credentials);
      if (res.success) {
        setIsConnected(true);
        setConnectionInfo(res.connection);
        setLoading(false);
        addTelemetryLog('SAP Verification Connection', 'SUCCESS', `Connected to ${res.connection.companyId}`);
        return true;
      }
      setError(res.message || 'Connection failed.');
      setLoading(false);
      addTelemetryLog('SAP Verification Connection', 'FAILED', res.message || 'Unknown error');
      return false;
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Connection failed.');
      setLoading(false);
      addTelemetryLog('SAP Verification Connection', 'FAILED', err.message);
      return false;
    }
  };

  const disconnect = () => {
    setIsConnected(false);
    setConnectionInfo(null);
    setRawData([]);
    setFilteredData([]);
    setAggregatedData([]);
    setFilters({});
    addTelemetryLog('Session Terminated', 'SUCCESS', 'Cleared in-memory connection profile');
  };

  const setObjectType = (type) => {
    setActiveObject(type);
    setFilters({});
    
    // Configure default chart layout per object type (6 entities)
    let defaultGroupBy = 'department';
    let defaultNumField = '';

    if (type === 'User') {
      defaultGroupBy = 'department';
      defaultNumField = 'teamMembersSize';
    } else if (type === 'Position') {
      defaultGroupBy = 'department';
      defaultNumField = 'targetFTE';
    } else if (type === 'Department') {
      defaultGroupBy = 'status';
      defaultNumField = '';
    } else if (type === 'Location') {
      defaultGroupBy = 'locationGroup';
      defaultNumField = 'standardHours';
    } else if (type === 'Division') {
      defaultGroupBy = 'status';
      defaultNumField = '';
    } else if (type === 'Company') {
      defaultGroupBy = 'country';
      defaultNumField = '';
    }

    setChartSettings({
      chartType: 'bar',
      groupBy: defaultGroupBy,
      aggregation: 'count',
      numericField: defaultNumField,
    });
    addTelemetryLog('Object Scope Switched', 'SUCCESS', `Switched workspace to: ${type}`);
  };

  const fetchData = async (forceRefresh = false) => {
    setLoading(true);
    setError(null);
    addTelemetryLog('Fetch SuccessFactors Payload', 'PENDING', `Target Object: ${activeObject} (Refresh: ${forceRefresh})`);
    try {
      const res = await apiService.fetchData(activeObject, {}, forceRefresh);
      if (res.success) {
        setRawData(res.data);
        addTelemetryLog('Fetch SuccessFactors Payload', 'SUCCESS', `Retrieved ${res.data.length} records`);
      } else {
        setError('Failed to fetch data from SuccessFactors.');
        addTelemetryLog('Fetch SuccessFactors Payload', 'FAILED', 'Unknown API failure');
      }
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Failed to fetch data.');
      addTelemetryLog('Fetch SuccessFactors Payload', 'FAILED', err.message);
    } finally {
      setLoading(false);
    }
  };

  const updateFilter = (key, value) => {
    setFilters(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const clearFilters = () => {
    setFilters({});
  };

  const updateChartSettings = (settings) => {
    setChartSettings(prev => ({
      ...prev,
      ...settings
    }));
  };

  const triggerAggregate = async () => {
    if (filteredData.length === 0) return;

    const { aggregation, numericField, groupBy } = chartSettings;
    if (aggregation === 'sum' || aggregation === 'average') {
      if (!numericField) return;

      const firstRow = filteredData[0];
      const isUser = 'userId' in firstRow;
      const isPos = 'positionTitle' in firstRow;
      const isDept = 'description' in firstRow && 'createdBy' in firstRow && !('country' in firstRow);
      const isLoc = 'timezone' in firstRow;
      const isDiv = 'description' in firstRow && 'createdBy' in firstRow && !('description' in firstRow && 'createdBy' in firstRow && 'code' in firstRow && 'description' in firstRow && 'createdBy' in firstRow && !('country' in firstRow)); // Divisions/Companies have no numeric fields
      const isComp = 'country' in firstRow;

      if (isUser && (numericField === 'targetFTE' || numericField === 'standardHours')) return;
      if (isPos && (numericField === 'teamMembersSize' || numericField === 'standardHours')) return;
      if (isDept || isDiv || isComp) return;
      if (isLoc && (numericField === 'teamMembersSize' || numericField === 'targetFTE')) return;
    }

    try {
      const result = await apiService.aggregate(filteredData, groupBy, aggregation, numericField);
      setAggregatedData(result);
      addTelemetryLog('Data Aggregation', 'SUCCESS', `Aggregated ${filteredData.length} records into ${result.length} buckets`);
    } catch (err) {
      console.error('Aggregation error in Context:', err.message);
      addTelemetryLog('Data Aggregation', 'FAILED', err.message);
    }
  };

  const applyNlp = async (prompt) => {
    setNlpPrompt(prompt);
    setNlpError(null);
    addTelemetryLog('AI Spec Parsing', 'PENDING', `Prompt: "${prompt}"`);
    try {
      const spec = await apiService.parseNlp(prompt, llmProvider, llmApiKey);
      
      let currentActiveObject = activeObject;
      let targetGroupBy = spec.groupBy;
      
      // If the NLP parser detected an explicit entity target, switch to it!
      if (spec.objectType && spec.objectType !== activeObject) {
        setActiveObject(spec.objectType);
        setFilters({});
        currentActiveObject = spec.objectType;
        addTelemetryLog('Object Scope Switched via AI', 'SUCCESS', `Switched workspace to: ${spec.objectType}`);
      }

      if (currentActiveObject === 'Position' && spec.groupBy === 'status') {
        targetGroupBy = 'effectiveStatus';
      }

      // Check validation scopes based on 6 active objects
      let validFields = [];
      if (currentActiveObject === 'User') {
        validFields = ['department', 'location', 'status', 'manager', 'gender', 'title'];
      } else if (currentActiveObject === 'Position') {
        validFields = ['department', 'location', 'effectiveStatus', 'jobCode', 'positionTitle', 'division', 'vacant'];
      } else if (currentActiveObject === 'Department') {
        validFields = ['status', 'createdBy', 'lastModifiedBy', 'name'];
      } else if (currentActiveObject === 'Location') {
        validFields = ['status', 'timezone', 'locationGroup', 'name'];
      } else if (currentActiveObject === 'Division') {
        validFields = ['status', 'createdBy', 'name'];
      } else if (currentActiveObject === 'Company') {
        validFields = ['status', 'country', 'name'];
      }

      const requestedGroupBy = spec.groupBy;
      let isFallback = false;

      if (!validFields.includes(targetGroupBy)) {
        if (targetGroupBy === 'status' && validFields.includes('effectiveStatus')) {
          targetGroupBy = 'effectiveStatus';
        } else if (targetGroupBy === 'effectiveStatus' && validFields.includes('status')) {
          targetGroupBy = 'status';
        } else {
          targetGroupBy = validFields[0] || 'status';
          isFallback = true;
        }
      }

      let targetNumField = spec.numericField;
      if (spec.aggregation === 'sum' || spec.aggregation === 'average') {
        if (!targetNumField) {
          if (currentActiveObject === 'User') targetNumField = 'teamMembersSize';
          else if (currentActiveObject === 'Position') targetNumField = 'targetFTE';
          else if (currentActiveObject === 'Location') targetNumField = 'standardHours';
        }
      }

      const finalSpec = {
        chartType: spec.chartType,
        groupBy: targetGroupBy,
        aggregation: spec.aggregation,
        numericField: targetNumField,
        requestedGroupBy,
        isFallback,
        objectType: currentActiveObject,
        fallbackReason: spec.fallbackReason || null
      };

      updateChartSettings({
        chartType: finalSpec.chartType,
        groupBy: finalSpec.groupBy,
        aggregation: finalSpec.aggregation,
        numericField: finalSpec.numericField
      });

      addTelemetryLog('AI Spec Parsing', 'SUCCESS', `Mapped chart to: ${finalSpec.chartType} by ${targetGroupBy}`);
      return { success: true, spec: finalSpec };
    } catch (err) {
      setNlpError(err.response?.data?.message || err.message || 'Failed to parse NLP prompt.');
      addTelemetryLog('AI Spec Parsing', 'FAILED', err.message);
      return { success: false, error: err.message };
    }
  };

  return (
    <AppContext.Provider
      value={{
        isConnected,
        connectionInfo,
        activeObject,
        rawData,
        filteredData,
        aggregatedData,
        loading,
        error,
        filters,
        chartSettings,
        nlpPrompt,
        nlpError,
        activeTab,
        theme,
        telemetryLogs,
        llmProvider,
        setLlmProvider,
        llmApiKey,
        setLlmApiKey,
        connect,
        disconnect,
        setObjectType,
        fetchData,
        updateFilter,
        clearFilters,
        updateChartSettings,
        applyNlp,
        triggerAggregate,
        setActiveTab,
        setTheme
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
