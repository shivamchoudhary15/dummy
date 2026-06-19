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
  
  // Filters
  const [filters, setFilters] = useState({});
  
  // Chart settings
  const [chartSettings, setChartSettings] = useState({
    chartType: 'bar',
    groupBy: 'department',
    aggregation: 'count',
    numericField: '',
  });

  const [nlpPrompt, setNlpPrompt] = useState('');
  const [nlpError, setNlpError] = useState(null);

  // Check connection status on startup
  useEffect(() => {
    const checkConn = async () => {
      try {
        const res = await apiService.getConnectionStatus();
        if (res.connected && res.connection) {
          setIsConnected(true);
          setConnectionInfo(res.connection);
        }
      } catch (err) {
        console.warn('Backend connection check failed. Server might be starting up.');
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
    try {
      const res = await apiService.connect(credentials);
      if (res.success) {
        setIsConnected(true);
        setConnectionInfo(res.connection);
        setLoading(false);
        return true;
      }
      setError(res.message || 'Connection failed.');
      setLoading(false);
      return false;
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Connection failed.');
      setLoading(false);
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
  };

  const setObjectType = (type) => {
    setActiveObject(type);
    setFilters({}); // clear filters
    // Set appropriate default groupBy
    setChartSettings(prev => ({
      ...prev,
      groupBy: 'department',
      numericField: type === 'User' ? 'teamMembersSize' : 'targetFTE'
    }));
  };

  const fetchData = async (forceRefresh = false) => {
    setLoading(true);
    setError(null);
    try {
      const res = await apiService.fetchData(activeObject, {}, forceRefresh);
      if (res.success) {
        setRawData(res.data);
      } else {
        setError('Failed to fetch data from SuccessFactors.');
      }
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Failed to fetch data.');
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

    // Verify if we have a valid numeric field for Sum/Average
    const { aggregation, numericField, groupBy } = chartSettings;
    if (aggregation === 'sum' || aggregation === 'average') {
      if (!numericField) return;

      // Guard against temporary render mismatch between dataset and selected numeric field
      const isUserObj = filteredData[0] && 'userId' in filteredData[0];
      if (isUserObj && (numericField === 'targetFTE' || numericField === 'standardHours')) {
        return;
      }
      if (!isUserObj && numericField === 'teamMembersSize') {
        return;
      }
    }

    try {
      const result = await apiService.aggregate(filteredData, groupBy, aggregation, numericField);
      setAggregatedData(result);
    } catch (err) {
      console.error('Aggregation error in Context:', err.message);
    }
  };

  const applyNlp = async (prompt) => {
    setNlpPrompt(prompt);
    setNlpError(null);
    try {
      const spec = await apiService.parseNlp(prompt);
      
      // Map 'status' to 'effectiveStatus' if viewing Positions
      let targetGroupBy = spec.groupBy;
      if (activeObject === 'Position' && spec.groupBy === 'status') {
        targetGroupBy = 'effectiveStatus';
      }

      // Check if the groupBy field is valid for the current object type
      const validFields = activeObject === 'User' 
        ? ['department', 'location', 'status', 'manager', 'gender', 'title'] 
        : ['department', 'location', 'effectiveStatus', 'jobCode', 'positionTitle', 'division'];

      if (!validFields.includes(targetGroupBy)) {
        if (targetGroupBy === 'status') {
          targetGroupBy = activeObject === 'User' ? 'status' : 'effectiveStatus';
        } else {
          targetGroupBy = 'department';
        }
      }

      let targetNumField = spec.numericField;
      if ((spec.aggregation === 'sum' || spec.aggregation === 'average') && !targetNumField) {
        targetNumField = activeObject === 'User' ? 'teamMembersSize' : 'targetFTE';
      }

      updateChartSettings({
        chartType: spec.chartType,
        groupBy: targetGroupBy,
        aggregation: spec.aggregation,
        numericField: targetNumField
      });

      return true;
    } catch (err) {
      setNlpError(err.response?.data?.message || err.message || 'Failed to parse NLP prompt.');
      return false;
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
        connect,
        disconnect,
        setObjectType,
        fetchData,
        updateFilter,
        clearFilters,
        updateChartSettings,
        applyNlp,
        triggerAggregate
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
