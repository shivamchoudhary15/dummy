import React, { useMemo } from 'react';
import { useApp } from '../context/AppContext';
import { BarChart3, Sliders, AlertCircle } from 'lucide-react';

export const ChartBuilder = () => {
  const { 
    activeObject, 
    chartSettings, 
    updateChartSettings 
  } = useApp();

  const groupByFields = useMemo(() => {
    if (activeObject === 'User') {
      return [
        { value: 'department', label: 'Department' },
        { value: 'location', label: 'Location' },
        { value: 'status', label: 'Status' },
        { value: 'manager', label: 'Manager' },
        { value: 'gender', label: 'Gender' },
        { value: 'title', label: 'Job Title' }
      ];
    } else if (activeObject === 'Position') {
      return [
        { value: 'department', label: 'Department' },
        { value: 'effectiveStatus', label: 'Effective Status' },
        { value: 'jobCode', label: 'Job Code' },
        { value: 'positionTitle', label: 'Position Title' },
        { value: 'location', label: 'Location' },
        { value: 'division', label: 'Division' },
        { value: 'vacant', label: 'Vacancy Status' }
      ];
    } else if (activeObject === 'Department') {
      return [
        { value: 'status', label: 'Status' },
        { value: 'createdBy', label: 'Created By' },
        { value: 'lastModifiedBy', label: 'Last Modified By' },
        { value: 'name', label: 'Department Name' }
      ];
    } else if (activeObject === 'Location') {
      return [
        { value: 'status', label: 'Status' },
        { value: 'timezone', label: 'Timezone' },
        { value: 'locationGroup', label: 'Location Group' },
        { value: 'name', label: 'Location Name' }
      ];
    } else if (activeObject === 'Division') {
      return [
        { value: 'status', label: 'Status' },
        { value: 'createdBy', label: 'Created By' },
        { value: 'name', label: 'Division Name' }
      ];
    } else { // Company
      return [
        { value: 'status', label: 'Status' },
        { value: 'country', label: 'Country' },
        { value: 'name', label: 'Company Name' }
      ];
    }
  }, [activeObject]);

  const numericFields = useMemo(() => {
    if (activeObject === 'User') {
      return [
        { value: 'teamMembersSize', label: 'Team Size (Direct Reports)' }
      ];
    } else if (activeObject === 'Position') {
      return [
        { value: 'targetFTE', label: 'Target FTE (Full-Time Equiv)' },
        { value: 'standardHours', label: 'Standard Weekly Hours' }
      ];
    } else if (activeObject === 'Location') {
      return [
        { value: 'standardHours', label: 'Standard Work Hours' }
      ];
    }
    return [];
  }, [activeObject]);

  const handleChartTypeChange = (type) => {
    updateChartSettings({ chartType: type });
  };

  const handleGroupByChange = (field) => {
    updateChartSettings({ groupBy: field });
  };

  const handleAggregationChange = (agg) => {
    let numericField = chartSettings.numericField;
    if ((agg === 'sum' || agg === 'average') && !numericField) {
      if (activeObject === 'User') numericField = 'teamMembersSize';
      else if (activeObject === 'Position') numericField = 'targetFTE';
      else if (activeObject === 'Location') numericField = 'standardHours';
    }
    updateChartSettings({ aggregation: agg, numericField });
  };

  const handleNumericFieldChange = (field) => {
    updateChartSettings({ numericField: field });
  };

  const hasNumericFields = numericFields.length > 0;
  const showNumericField = (chartSettings.aggregation === 'sum' || chartSettings.aggregation === 'average') && hasNumericFields;

  React.useEffect(() => {
    if (!hasNumericFields && (chartSettings.aggregation === 'sum' || chartSettings.aggregation === 'average')) {
      updateChartSettings({ aggregation: 'count', numericField: '' });
    }
  }, [activeObject, hasNumericFields]);

  return (
    <div className="bg-white border border-fiori-border rounded p-5 shadow-sm">
      <h3 className="text-sm font-semibold text-fiori-shell mb-4 flex items-center gap-1.5 border-b border-fiori-border pb-3">
        <Sliders className="w-4 h-4 text-fiori-blue" />
        Configure Visualization
      </h3>

      <div className="space-y-4">
        <div>
          <label className="block text-xs font-medium text-fiori-text-muted mb-2">Chart Type</label>
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => handleChartTypeChange('bar')}
              className={`flex items-center justify-center gap-2 py-2 px-3 border rounded text-sm font-medium transition ${
                chartSettings.chartType === 'bar'
                  ? 'border-fiori-blue bg-fiori-blue-light text-fiori-blue'
                  : 'border-fiori-border hover:bg-gray-50 text-fiori-text'
              }`}
            >
              <BarChart3 className="w-4 h-4" />
              Bar Chart
            </button>
            <button
              type="button"
              onClick={() => handleChartTypeChange('pie')}
              className={`flex items-center justify-center gap-2 py-2 px-3 border rounded text-sm font-medium transition ${
                chartSettings.chartType === 'pie'
                  ? 'border-fiori-blue bg-fiori-blue-light text-fiori-blue'
                  : 'border-fiori-border hover:bg-gray-50 text-fiori-text'
              }`}
            >
              <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 5.07c2.93.39 5.24 2.7 5.63 5.63h-5.63V7.07zM12 19c-3.87 0-7-3.13-7-7 0-3.5 2.56-6.43 6-6.92v13.92h7c-.49 3.44-3.42 6-7 6z" />
              </svg>
              Pie Chart
            </button>
          </div>
        </div>

        <div>
          <label className="block text-xs font-medium text-fiori-text-muted mb-1">Group By Category</label>
          <select
            value={chartSettings.groupBy}
            onChange={(e) => handleGroupByChange(e.target.value)}
            className="w-full px-2.5 py-1.5 border border-fiori-border rounded text-sm bg-white focus:outline-none focus:border-fiori-blue"
          >
            {groupByFields.map(field => (
              <option key={field.value} value={field.value}>
                {field.label}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-xs font-medium text-fiori-text-muted mb-1">Aggregation Math</label>
          <select
            value={chartSettings.aggregation}
            onChange={(e) => handleAggregationChange(e.target.value)}
            className="w-full px-2.5 py-1.5 border border-fiori-border rounded text-sm bg-white focus:outline-none focus:border-fiori-blue"
          >
            <option value="count">Count (Record Volume)</option>
            {hasNumericFields && (
              <>
                <option value="sum">Sum (Add Numeric Field)</option>
                <option value="average">Average (Mean of Numeric Field)</option>
              </>
            )}
          </select>
          {!hasNumericFields && (
            <div className="flex items-center gap-1 mt-1 text-[10px] text-fiori-text-muted italic">
              <AlertCircle className="w-3.5 h-3.5 text-fiori-warning" />
              Sum/Average disabled (no numeric fields on this object).
            </div>
          )}
        </div>

        {showNumericField && (
          <div className="animate-fadeIn">
            <label className="block text-xs font-medium text-fiori-text-muted mb-1">
              Target Numeric Field
            </label>
            <select
              value={chartSettings.numericField}
              onChange={(e) => handleNumericFieldChange(e.target.value)}
              className="w-full px-2.5 py-1.5 border border-fiori-border rounded text-sm bg-white focus:outline-none focus:border-fiori-blue"
            >
              {numericFields.map(field => (
                <option key={field.value} value={field.value}>
                  {field.label}
                </option>
              ))}
            </select>
          </div>
        )}
      </div>
    </div>
  );
};
