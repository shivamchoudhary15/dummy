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
    if (text.includes('location group') || text.includes('locationgroup') || text.includes('group')) {
      groupBy = 'locationGroup';
    } else if (text.includes('timezone') || text.includes('time zone') || text.includes('zone')) {
      groupBy = 'timezone';
    } else if (text.includes('createdby') || text.includes('created by') || text.includes('creator')) {
      groupBy = 'createdBy';
    } else if (text.includes('modifiedby') || text.includes('modified by') || text.includes('editor')) {
      groupBy = 'lastModifiedBy';
    } else if (text.includes('country') || text.includes('nation')) {
      groupBy = 'country';
    } else if (text.includes('division')) {
      groupBy = 'division';
    } else if (text.includes('department') || text.includes('dept')) {
      groupBy = 'department';
    } else if (text.includes('location') || text.includes('loc') || text.includes('city') || text.includes('state')) {
      groupBy = 'location';
    } else if (text.includes('status') || text.includes('active') || text.includes('inactive')) {
      groupBy = 'status'; 
    } else if (text.includes('manager') || text.includes('supervisor') || text.includes('boss')) {
      groupBy = 'manager';
    } else if (text.includes('job code') || text.includes('jobcode')) {
      groupBy = 'jobCode';
    } else if (text.includes('title') || text.includes('position title') || text.includes('job title')) {
      groupBy = 'positionTitle';
    } else if (text.includes('gender') || text.includes('sex')) {
      groupBy = 'gender';
    } else if (text.includes('name') || text.includes('entity name') || text.includes('title name')) {
      groupBy = 'name';
    }

    // 4. Detect Numeric Field (for Sum or Average)
    let numericField = '';
    if (aggregation === 'sum' || aggregation === 'average') {
      if (text.includes('fte') || text.includes('full time equivalent') || text.includes('target fte')) {
        numericField = 'targetFTE';
      } else if (text.includes('hours') || text.includes('standard hours') || text.includes('work hours') || text.includes('std hours')) {
        numericField = 'standardHours';
      } else if (text.includes('team size') || text.includes('team') || text.includes('members size')) {
        numericField = 'teamMembersSize';
      } else {
        if (text.includes('hour')) {
          numericField = 'standardHours';
        } else if (text.includes('fte')) {
          numericField = 'targetFTE';
        } else if (text.includes('team')) {
          numericField = 'teamMembersSize';
        }
      }
    }

    // 5. Detect Target Object Type
    let objectType = null;
    if (text.includes('employee') || text.includes('user') || text.includes('people') || text.includes('person') || text.includes('headcount')) {
      objectType = 'User';
    } else if (text.includes('position') || text.includes('vacanc')) {
      objectType = 'Position';
    } else if (text.includes('department') || text.includes('dept')) {
      objectType = 'Department';
    } else if (text.includes('location')) {
      objectType = 'Location';
    } else if (text.includes('division')) {
      objectType = 'Division';
    } else if (text.includes('company')) {
      objectType = 'Company';
    }

    return {
      chartType,
      groupBy,
      aggregation,
      numericField,
      objectType
    };
  }
};
