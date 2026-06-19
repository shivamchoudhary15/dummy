/**
 * Helper to check if a field in the dataset is numeric.
 * Returns true if all non-empty values can be parsed as numbers.
 * Excludes fields that are conceptually IDs or codes.
 */
export const isNumericField = (dataset, field) => {
  if (!dataset || dataset.length === 0) return false;

  const exclusions = ['userId', 'code', 'jobCode', 'username', 'email'];
  if (exclusions.includes(field)) return false;

  let hasValidValue = false;
  for (const item of dataset) {
    const val = item[field];
    if (val !== undefined && val !== null && val !== '') {
      const num = Number(val);
      if (isNaN(num)) {
        return false; // Found a value that is not a number
      }
      hasValidValue = true;
    }
  }
  return hasValidValue;
};

/**
 * Helper to resolve the grouping label. Handles nested properties like manager.
 */
const getGroupLabel = (item, groupBy) => {
  if (groupBy === 'manager') {
    return item.manager ? item.manager.displayName : 'No Manager';
  }
  
  const value = item[groupBy];
  if (value === undefined || value === null || value === '') {
    return 'N/A';
  }
  return String(value);
};

export const aggregationService = {
  /**
   * Automatically detect all numeric fields in a dataset
   */
  detectNumericFields(dataset) {
    if (!dataset || dataset.length === 0) return [];
    const keys = Object.keys(dataset[0]);
    return keys.filter(key => isNumericField(dataset, key));
  },

  /**
   * Group and aggregate the dataset
   */
  aggregateData(dataset, groupBy, aggregation, numericField = '') {
    if (!dataset || !Array.isArray(dataset)) {
      throw new Error('Dataset must be a valid array');
    }
    if (!groupBy) {
      throw new Error('Group By field must be specified');
    }
    if (!aggregation) {
      throw new Error('Aggregation type must be specified');
    }

    const aggType = aggregation.toLowerCase();
    if (!['count', 'sum', 'average'].includes(aggType)) {
      throw new Error(`Unsupported aggregation type: ${aggregation}. Supported types are count, sum, average.`);
    }

    // Validate numeric field for sum/average
    if (aggType === 'sum' || aggType === 'average') {
      if (!numericField) {
        throw new Error(`Numeric field must be specified for ${aggType} aggregation.`);
      }
      if (!isNumericField(dataset, numericField)) {
        throw new Error(`Field "${numericField}" is not a valid numeric field for aggregation. Sum/Average are disabled for non-numeric or ID columns.`);
      }
    }

    // Group the data
    const groups = {};

    dataset.forEach(item => {
      const label = getGroupLabel(item, groupBy);
      
      if (!groups[label]) {
        groups[label] = {
          count: 0,
          sum: 0,
          nonNullCount: 0,
          values: []
        };
      }

      groups[label].count += 1;

      if (aggType === 'sum' || aggType === 'average') {
        const val = item[numericField];
        if (val !== undefined && val !== null && val !== '') {
          const numVal = Number(val);
          if (!isNaN(numVal)) {
            groups[label].sum += numVal;
            groups[label].nonNullCount += 1;
          }
        }
      }
    });

    // Formulate final results
    return Object.entries(groups).map(([label, stats]) => {
      let value = 0;
      if (aggType === 'count') {
        value = stats.count;
      } else if (aggType === 'sum') {
        value = Number(stats.sum.toFixed(2));
      } else if (aggType === 'average') {
        value = stats.nonNullCount > 0 
          ? Number((stats.sum / stats.nonNullCount).toFixed(2)) 
          : 0;
      }

      return {
        label,
        value
      };
    }).sort((a, b) => b.value - a.value); // Sort descending by value
  }
};
