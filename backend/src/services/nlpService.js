export const nlpService = {
  /**
   * Parses a natural language prompt into a chart configuration spec
   */
  parsePrompt(prompt) {
    if (!prompt || typeof prompt !== 'string') {
      throw new Error('Prompt must be a non-empty string');
    }

    const text = prompt.toLowerCase().trim();

    // 1. Detect Chart Type
    let chartType = 'bar'; // default
    if (text.includes('pie') || text.includes('circle') || text.includes('donut')) {
      chartType = 'pie';
    } else if (text.includes('bar') || text.includes('column') || text.includes('histogram') || text.includes('vertical')) {
      chartType = 'bar';
    }

    // 2. Detect Aggregation
    let aggregation = 'count'; // default
    if (text.includes('average') || text.includes('avg') || text.includes('mean') || text.includes('ratio')) {
      aggregation = 'average';
    } else if (text.includes('sum') || text.includes('total') || text.includes('aggregate')) {
      aggregation = 'sum';
    } else if (text.includes('count') || text.includes('headcount') || text.includes('number of') || text.includes('how many')) {
      aggregation = 'count';
    }

    // 3. Detect Group By Field
    let groupBy = 'department'; // default
    if (text.includes('department') || text.includes('dept') || text.includes('division')) {
      groupBy = 'department';
    } else if (text.includes('location') || text.includes('loc') || text.includes('city') || text.includes('country') || text.includes('state')) {
      groupBy = 'location';
    } else if (text.includes('status') || text.includes('active') || text.includes('inactive')) {
      groupBy = 'status'; // mapped to status or effectiveStatus in the UI controller
    } else if (text.includes('manager') || text.includes('supervisor') || text.includes('boss')) {
      groupBy = 'manager';
    } else if (text.includes('job code') || text.includes('jobcode')) {
      groupBy = 'jobCode';
    } else if (text.includes('title') || text.includes('position title') || text.includes('job title')) {
      groupBy = 'positionTitle';
    } else if (text.includes('gender') || text.includes('sex')) {
      groupBy = 'gender';
    }

    // 4. Detect Numeric Field (for Sum or Average)
    let numericField = '';
    if (aggregation === 'sum' || aggregation === 'average') {
      if (text.includes('fte') || text.includes('full time equivalent') || text.includes('target fte')) {
        numericField = 'targetFTE';
      } else if (text.includes('hours') || text.includes('standard hours') || text.includes('work hours')) {
        numericField = 'standardHours';
      } else if (text.includes('team size') || text.includes('team') || text.includes('members size')) {
        numericField = 'teamMembersSize';
      } else {
        // Fallback or guess based on what object we might be querying
        // We will return a guess, but the frontend can override or warn
        if (text.includes('hour')) {
          numericField = 'standardHours';
        } else if (text.includes('fte')) {
          numericField = 'targetFTE';
        } else if (text.includes('team')) {
          numericField = 'teamMembersSize';
        }
      }
    }

    return {
      chartType,
      groupBy,
      aggregation,
      numericField
    };
  }
};
