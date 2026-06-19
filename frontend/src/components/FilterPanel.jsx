import React, { useMemo } from 'react';
import { useApp } from '../context/AppContext';
import { Filter, RotateCcw } from 'lucide-react';

export const FilterPanel = () => {
  const { 
    activeObject, 
    rawData, 
    filters, 
    updateFilter, 
    clearFilters 
  } = useApp();

  const filterOptions = useMemo(() => {
    const options = {
      departments: new Set(),
      locations: new Set(),
      statuses: new Set(),
      jobCodes: new Set(),
      managers: new Set(),
      titles: new Set()
    };

    rawData.forEach(item => {
      if (item.department && item.department !== 'N/A') options.departments.add(item.department);
      if (item.location && item.location !== 'N/A') options.locations.add(item.location);
      if (item.status) options.statuses.add(item.status);
      if (item.effectiveStatus) options.statuses.add(item.effectiveStatus);
      if (item.jobCode && item.jobCode !== 'N/A') options.jobCodes.add(item.jobCode);
      if (item.positionTitle && item.positionTitle !== 'N/A') options.titles.add(item.positionTitle);
      if (item.title && item.title !== 'N/A') options.titles.add(item.title);
      if (item.manager && item.manager.displayName) options.managers.add(item.manager.displayName);
    });

    return {
      departments: Array.from(options.departments).sort(),
      locations: Array.from(options.locations).sort(),
      statuses: Array.from(options.statuses).sort(),
      jobCodes: Array.from(options.jobCodes).sort(),
      managers: Array.from(options.managers).sort(),
      titles: Array.from(options.titles).sort()
    };
  }, [rawData]);

  const hasActiveFilters = Object.values(filters).some(v => v !== '');

  return (
    <div className="bg-white border border-fiori-border rounded p-5 shadow-sm">
      <div className="flex items-center justify-between mb-4 border-b border-fiori-border pb-3">
        <h3 className="text-sm font-semibold text-fiori-shell flex items-center gap-1.5">
          <Filter className="w-4 h-4 text-fiori-blue" />
          Filter Dataset ({rawData.length} total)
        </h3>
        {hasActiveFilters && (
          <button
            onClick={clearFilters}
            className="flex items-center gap-1 text-xs text-fiori-blue hover:text-fiori-blue-dark hover:underline font-medium"
          >
            <RotateCcw className="w-3 h-3" />
            Reset
          </button>
        )}
      </div>

      <div className="space-y-4">
        {activeObject === 'User' ? (
          <>
            <div>
              <label className="block text-xs font-medium text-fiori-text-muted mb-1">Department</label>
              <select
                value={filters.department || ''}
                onChange={(e) => updateFilter('department', e.target.value)}
                className="w-full px-2.5 py-1.5 border border-fiori-border rounded text-sm bg-white focus:outline-none focus:border-fiori-blue"
              >
                <option value="">All Departments</option>
                {filterOptions.departments.map(dept => (
                  <option key={dept} value={dept}>{dept}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-fiori-text-muted mb-1">Location</label>
              <select
                value={filters.location || ''}
                onChange={(e) => updateFilter('location', e.target.value)}
                className="w-full px-2.5 py-1.5 border border-fiori-border rounded text-sm bg-white focus:outline-none focus:border-fiori-blue"
              >
                <option value="">All Locations</option>
                {filterOptions.locations.map(loc => (
                  <option key={loc} value={loc}>{loc}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-fiori-text-muted mb-1">Status</label>
              <select
                value={filters.status || ''}
                onChange={(e) => updateFilter('status', e.target.value)}
                className="w-full px-2.5 py-1.5 border border-fiori-border rounded text-sm bg-white focus:outline-none focus:border-fiori-blue"
              >
                <option value="">All Statuses</option>
                <option value="Active">Active</option>
                <option value="Inactive">Inactive</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-fiori-text-muted mb-1">Manager</label>
              <select
                value={filters.manager || ''}
                onChange={(e) => updateFilter('manager', e.target.value)}
                className="w-full px-2.5 py-1.5 border border-fiori-border rounded text-sm bg-white focus:outline-none focus:border-fiori-blue"
              >
                <option value="">All Managers</option>
                {filterOptions.managers.map(mgr => (
                  <option key={mgr} value={mgr}>{mgr}</option>
                ))}
              </select>
            </div>
          </>
        ) : (
          <>
            <div>
              <label className="block text-xs font-medium text-fiori-text-muted mb-1">Department</label>
              <select
                value={filters.department || ''}
                onChange={(e) => updateFilter('department', e.target.value)}
                className="w-full px-2.5 py-1.5 border border-fiori-border rounded text-sm bg-white focus:outline-none focus:border-fiori-blue"
              >
                <option value="">All Departments</option>
                {filterOptions.departments.map(dept => (
                  <option key={dept} value={dept}>{dept}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-fiori-text-muted mb-1">Job Code</label>
              <select
                value={filters.jobCode || ''}
                onChange={(e) => updateFilter('jobCode', e.target.value)}
                className="w-full px-2.5 py-1.5 border border-fiori-border rounded text-sm bg-white focus:outline-none focus:border-fiori-blue"
              >
                <option value="">All Job Codes</option>
                {filterOptions.jobCodes.map(jc => (
                  <option key={jc} value={jc}>{jc}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-fiori-text-muted mb-1">Position Title</label>
              <select
                value={filters.positionTitle || ''}
                onChange={(e) => updateFilter('positionTitle', e.target.value)}
                className="w-full px-2.5 py-1.5 border border-fiori-border rounded text-sm bg-white focus:outline-none focus:border-fiori-blue"
              >
                <option value="">All Titles</option>
                {filterOptions.titles.map(title => (
                  <option key={title} value={title}>{title}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-fiori-text-muted mb-1">Status</label>
              <select
                value={filters.effectiveStatus || ''}
                onChange={(e) => updateFilter('effectiveStatus', e.target.value)}
                className="w-full px-2.5 py-1.5 border border-fiori-border rounded text-sm bg-white focus:outline-none focus:border-fiori-blue"
              >
                <option value="">All Statuses</option>
                <option value="Active">Active</option>
                <option value="Inactive">Inactive</option>
              </select>
            </div>
          </>
        )}
      </div>
    </div>
  );
};
