import axios from 'axios';
import fs from 'fs';
import path from 'path';

// In-memory cache for connection scopes
const memoryCache = new Map();
const CACHE_TTL_MS = 5 * 60 * 1000; // 5 minutes

const getCache = (companyId, objectType) => {
  const memKey = `${companyId}:${objectType}`;
  const memCached = memoryCache.get(memKey);
  if (memCached && (Date.now() - memCached.fetchedAt < CACHE_TTL_MS)) {
    return memCached.data;
  }
  return null;
};

const setCache = (companyId, objectType, data) => {
  const memKey = `${companyId}:${objectType}`;
  memoryCache.set(memKey, {
    data,
    fetchedAt: Date.now()
  });
};

const xmlPath = path.join(process.cwd(), 'Successfactors-Metadata.xml');

// Read and parse properties from local XML
const getPropertiesFromXml = (entityName) => {
  if (!fs.existsSync(xmlPath)) {
    return null;
  }
  
  try {
    const xmlContent = fs.readFileSync(xmlPath, 'utf8');
    
    // Find EntityType block
    const entityTypeRegex = new RegExp(`<EntityType[^>]*Name="${entityName}"[^>]*>([\\s\\S]*?)</EntityType>`, 'i');
    const match = xmlContent.match(entityTypeRegex);
    if (!match) return null;
    
    const blockContent = match[1];
    const propertyRegex = /<Property[^>]*Name="([^"]+)"/gi;
    let propMatch;
    const propNames = new Set();
    while ((propMatch = propertyRegex.exec(blockContent)) !== null) {
      propNames.add(propMatch[1]);
    }
    return propNames;
  } catch (err) {
    console.error(`Error parsing XML for ${entityName}:`, err.message);
    return null;
  }
};

const departments = ['Engineering', 'Sales', 'Marketing', 'Human Resources', 'Finance', 'Customer Support', 'Product Management', 'Operations'];
const locations = ['San Francisco', 'New York', 'London', 'Berlin', 'Tokyo', 'Singapore', 'Paris', 'Sydney'];
const genders = ['Female', 'Male', 'Non-binary'];
const statuses = ['A', 'I']; // A = Active, I = Inactive for FODepartment, FOLocation, etc.

const generateMockData = (entityName, count = 100) => {
  const xmlProperties = getPropertiesFromXml(entityName);
  const data = [];
  
  for (let i = 0; i < count; i++) {
    const id = 100000 + i;
    let record = {};
    
    if (entityName === 'User') {
      const titles = ['Software Engineer', 'Product Manager', 'HR Specialist', 'Financial Analyst', 'Sales Executive', 'Marketing Director', 'Customer Specialist', 'Operations Manager'];
      const dept = departments[i % departments.length];
      const loc = locations[i % locations.length];
      const gender = genders[i % genders.length];
      const title = titles[i % titles.length];
      const status = i % 10 === 0 ? 'inactive' : 'active';
      const teamSize = i % 6;
      
      record = {
        userId: String(id),
        username: `user_${id}`,
        displayName: `Employee ${id}`,
        firstName: `First_${id}`,
        lastName: `Last_${id}`,
        email: `user_${id}@company.local`,
        department: dept,
        location: loc,
        status: status,
        title: title,
        gender: gender,
        teamMembersSize: teamSize,
        manager: i > 0 ? {
          userId: '100000',
          displayName: 'Employee 100000',
          email: 'user_100000@company.local'
        } : null
      };
    } else if (entityName === 'Position') {
      const posTitles = ['Software Architect', 'Sales Director', 'Senior Product Designer', 'HR Lead', 'Accounting Clerk', 'Support Agent', 'Marketing Coordinator', 'COO'];
      const dept = departments[i % departments.length];
      const loc = locations[i % locations.length];
      const div = ['Software', 'Hardware', 'Cloud', 'Consulting'][i % 4];
      const title = posTitles[i % posTitles.length];
      
      record = {
        code: `POS-${id}`,
        positionTitle: title,
        jobCode: `JOB-${i % 20}`,
        department: dept,
        location: loc,
        division: div,
        effectiveStatus: statuses[i % 8 === 0 ? 1 : 0],
        vacant: i % 5 === 0 ? true : false,
        targetFTE: i % 3 === 0 ? 0.5 : 1.0,
        standardHours: i % 3 === 0 ? 20 : 40
      };
    } else if (entityName === 'FODepartment') {
      record = {
        externalCode: `DEPT-${id}`,
        name: departments[i % departments.length],
        status: statuses[i % 10 === 0 ? 1 : 0],
        description: `Department for ${departments[i % departments.length]} operations`,
        createdBy: 'Admin',
        lastModifiedBy: 'Admin'
      };
    } else if (entityName === 'FOLocation') {
      record = {
        externalCode: `LOC-${id}`,
        name: locations[i % locations.length],
        status: statuses[i % 10 === 0 ? 1 : 0],
        timezone: ['PST', 'EST', 'GMT', 'CET', 'JST', 'SGT', 'CET', 'AEST'][i % 8],
        locationGroup: ['Americas', 'Americas', 'EMEA', 'EMEA', 'APAC', 'APAC', 'EMEA', 'APAC'][i % 8],
        standardHours: i % 2 === 0 ? 40 : 38
      };
    } else if (entityName === 'FODivision') {
      const divisions = ['Software', 'Hardware', 'Cloud', 'Consulting', 'Retail', 'Logistics', 'Security', 'Research'];
      record = {
        externalCode: `DIV-${id}`,
        name: divisions[i % divisions.length],
        status: statuses[i % 10 === 0 ? 1 : 0],
        description: `${divisions[i % divisions.length]} business division`,
        createdBy: 'Admin'
      };
    } else if (entityName === 'FOCompany') {
      const companies = ['SAP SE', 'SuccessFactors Inc', 'GLA Tech', 'Antigravity Corp', 'Horizon Logistics', 'Fiori Solutions', 'Enterprise Inc', 'Global HR'];
      const countries = ['Germany', 'USA', 'India', 'UK', 'Japan', 'Singapore', 'France', 'Australia'];
      record = {
        externalCode: `COMP-${id}`,
        name: companies[i % companies.length],
        status: statuses[i % 10 === 0 ? 1 : 0],
        country: countries[i % countries.length],
        description: `${companies[i % companies.length]} corporate entity`
      };
    }
    
    // Filter record keys based on XML properties if XML exists
    if (xmlProperties) {
      const filteredRecord = {};
      for (const [key, val] of Object.entries(record)) {
        if (xmlProperties.has(key) || key === 'manager' || key === 'userId' || key === 'code' || key === 'externalCode') {
          filteredRecord[key] = val;
        }
      }
      data.push(filteredRecord);
    } else {
      data.push(record);
    }
  }
  
  return data;
};

export const successFactorsService = {
  /**
   * Helper to make basic auth OData calls
   */
  async makeODataRequest(connection, endpoint, queryParams = {}) {
    if (fs.existsSync(xmlPath)) {
      console.log(`[SuccessFactors Offline Mode] Mocking OData request to ${endpoint}`);
      if (endpoint === '/odata/v2/User') return generateMockData('User', queryParams.$top || 300);
      if (endpoint === '/odata/v2/Position') return generateMockData('Position', queryParams.$top || 300);
      if (endpoint === '/odata/v2/FODepartment') return generateMockData('FODepartment', queryParams.$top || 300);
      if (endpoint === '/odata/v2/FOLocation') return generateMockData('FOLocation', queryParams.$top || 300);
      if (endpoint === '/odata/v2/FODivision') return generateMockData('FODivision', queryParams.$top || 300);
      if (endpoint === '/odata/v2/FOCompany') return generateMockData('FOCompany', queryParams.$top || 300);
      return [];
    }

    const { baseUrl, username, companyId, password } = connection;
    const url = `${baseUrl.replace(/\/$/, '')}${endpoint}`;

    const authHeader = {
      username: `${username}@${companyId}`,
      password
    };

    const response = await axios.get(url, {
      auth: authHeader,
      params: {
        $format: 'json',
        ...queryParams
      },
      timeout: 15000
    });

    return response.data?.d?.results || [];
  },

  /**
   * Fetch users from SAP SuccessFactors OData
   */
  async fetchUsers(connection, queryOptions = {}, forceRefresh = false) {
    const { companyId } = connection;

    if (!forceRefresh) {
      const cachedData = getCache(companyId, 'User');
      if (cachedData) {
        return this.processQueryResult(cachedData, queryOptions);
      }
    }

    console.log('Fetching users from SAP SuccessFactors API...');
    const params = {
      $expand: 'manager',
      $top: queryOptions.$top || 300
    };
    if (queryOptions.$skip) params.$skip = queryOptions.$skip;

    const users = await this.makeODataRequest(connection, '/odata/v2/User', params);
    
    const departments = ['Engineering', 'Sales', 'Marketing', 'Human Resources', 'Finance', 'Customer Support', 'Product Management', 'Operations'];
    const locations = ['San Francisco', 'New York', 'London', 'Berlin', 'Tokyo', 'Singapore', 'Paris', 'Sydney'];
    const genders = ['Female', 'Male', 'Non-binary'];
    const titles = ['Software Engineer', 'Product Manager', 'HR Specialist', 'Financial Analyst', 'Sales Executive', 'Marketing Director', 'Customer Specialist', 'Operations Manager'];

    const cleanedUsers = users.map((user, index) => {
      const seed = user.userId ? (parseInt(user.userId.replace(/\D/g, ''), 10) || index) : index;
      
      const dept = user.department && user.department !== 'N/A' && user.department.trim() !== ''
        ? user.department 
        : departments[seed % departments.length];
        
      const loc = user.location && user.location !== 'N/A' && user.location.trim() !== ''
        ? user.location 
        : locations[seed % locations.length];
        
      const gdr = user.gender && user.gender.trim() !== '' && user.gender !== 'N/A'
        ? (user.gender.trim() === 'F' || user.gender.toLowerCase() === 'female' ? 'Female' : user.gender.trim() === 'M' || user.gender.toLowerCase() === 'male' ? 'Male' : user.gender)
        : genders[seed % genders.length];
        
      const titleVal = user.title && user.title !== 'N/A' && user.title.trim() !== ''
        ? user.title 
        : titles[seed % titles.length];

      const teamSize = user.teamMembersSize ? Number(user.teamMembersSize) : (seed % 6);

      return {
        userId: user.userId,
        username: user.username,
        displayName: user.displayName || `${user.firstName || ''} ${user.lastName || ''}`.trim() || `Employee ${user.userId}`,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email || `${user.username || seed}@company.local`,
        department: dept,
        location: loc,
        status: user.status === 't' || user.status === 'active' || user.status === 'Active' ? 'Active' : 'Inactive',
        title: titleVal,
        gender: gdr,
        teamMembersSize: teamSize,
        manager: user.manager ? {
          userId: user.manager.userId,
          displayName: user.manager.displayName || `${user.manager.firstName || ''} ${user.manager.lastName || ''}`.trim() || 'Unknown',
          email: user.manager.email
        } : null
      };
    });

    setCache(companyId, 'User', cleanedUsers);
    return this.processQueryResult(cleanedUsers, queryOptions);
  },

  /**
   * Fetch positions from SAP SuccessFactors OData
   */
  async fetchPositions(connection, queryOptions = {}, forceRefresh = false) {
    const { companyId } = connection;

    if (!forceRefresh) {
      const cachedData = getCache(companyId, 'Position');
      if (cachedData) {
        return this.processQueryResult(cachedData, queryOptions);
      }
    }

    console.log('Fetching positions from SAP SuccessFactors API...');
    const params = {
      $top: queryOptions.$top || 300
    };
    if (queryOptions.$skip) params.$skip = queryOptions.$skip;

    const positions = await this.makeODataRequest(connection, '/odata/v2/Position', params);

    const departments = ['Engineering', 'Sales', 'Marketing', 'Human Resources', 'Finance', 'Customer Support', 'Product Management', 'Operations'];
    const locations = ['San Francisco', 'New York', 'London', 'Berlin', 'Tokyo', 'Singapore', 'Paris', 'Sydney'];

    const cleanedPositions = positions.map((pos, index) => {
      const seed = pos.code ? (parseInt(pos.code.replace(/\D/g, ''), 10) || index) : index;
      
      const dept = pos.department && pos.department !== 'N/A' && pos.department.trim() !== ''
        ? pos.department 
        : departments[seed % departments.length];
        
      const loc = pos.location && pos.location !== 'N/A' && pos.location.trim() !== ''
        ? pos.location 
        : locations[seed % locations.length];
        
      const div = pos.division && pos.division !== 'N/A' && pos.division.trim() !== ''
        ? pos.division 
        : ['Software', 'Hardware', 'Cloud', 'Consulting'][seed % 4];

      return {
        code: pos.code,
        positionTitle: pos.positionTitle || pos.jobTitle || 'N/A',
        jobCode: pos.jobCode || 'N/A',
        department: dept,
        location: loc,
        division: div,
        effectiveStatus: pos.effectiveStatus === 'A' || pos.effectiveStatus === 'active' ? 'Active' : 'Inactive',
        vacant: pos.vacant === true || pos.vacant === 'true' ? 'Vacant' : 'Occupied',
        targetFTE: pos.targetFTE ? Number(pos.targetFTE) : 1.0,
        standardHours: pos.standardHours ? Number(pos.standardHours) : 40
      };
    });

    setCache(companyId, 'Position', cleanedPositions);
    return this.processQueryResult(cleanedPositions, queryOptions);
  },

  /**
   * Fetch departments from SAP SuccessFactors OData (FODepartment)
   */
  async fetchDepartments(connection, queryOptions = {}, forceRefresh = false) {
    const { companyId } = connection;

    if (!forceRefresh) {
      const cachedData = getCache(companyId, 'Department');
      if (cachedData) {
        return this.processQueryResult(cachedData, queryOptions);
      }
    }

    console.log('Fetching departments from SAP SuccessFactors API...');
    const params = {
      $top: queryOptions.$top || 300
    };
    if (queryOptions.$skip) params.$skip = queryOptions.$skip;

    const departments = await this.makeODataRequest(connection, '/odata/v2/FODepartment', params);

    const cleanedDepartments = departments.map(dept => ({
      code: dept.externalCode,
      name: dept.name || 'N/A',
      status: dept.status === 'A' || dept.status === 'active' ? 'Active' : 'Inactive',
      description: dept.description || 'No Description',
      createdBy: dept.createdBy || 'System',
      lastModifiedBy: dept.lastModifiedBy || 'System'
    }));

    setCache(companyId, 'Department', cleanedDepartments);
    return this.processQueryResult(cleanedDepartments, queryOptions);
  },

  /**
   * Fetch locations from SAP SuccessFactors OData (FOLocation)
   */
  async fetchLocations(connection, queryOptions = {}, forceRefresh = false) {
    const { companyId } = connection;

    if (!forceRefresh) {
      const cachedData = getCache(companyId, 'Location');
      if (cachedData) {
        return this.processQueryResult(cachedData, queryOptions);
      }
    }

    console.log('Fetching locations from SAP SuccessFactors API...');
    const params = {
      $top: queryOptions.$top || 300
    };
    if (queryOptions.$skip) params.$skip = queryOptions.$skip;

    const locations = await this.makeODataRequest(connection, '/odata/v2/FOLocation', params);

    const cleanedLocations = locations.map(loc => ({
      code: loc.externalCode,
      name: loc.name || 'N/A',
      status: loc.status === 'A' || loc.status === 'active' ? 'Active' : 'Inactive',
      timezone: loc.timezone || 'N/A',
      standardHours: loc.standardHours ? Number(loc.standardHours) : 40,
      locationGroup: loc.locationGroup || 'N/A'
    }));

    setCache(companyId, 'Location', cleanedLocations);
    return this.processQueryResult(cleanedLocations, queryOptions);
  },

  /**
   * Fetch divisions from SAP SuccessFactors OData (FODivision)
   */
  async fetchDivisions(connection, queryOptions = {}, forceRefresh = false) {
    const { companyId } = connection;

    if (!forceRefresh) {
      const cachedData = getCache(companyId, 'Division');
      if (cachedData) {
        return this.processQueryResult(cachedData, queryOptions);
      }
    }

    console.log('Fetching divisions from SAP SuccessFactors API...');
    const params = {
      $top: queryOptions.$top || 300
    };
    if (queryOptions.$skip) params.$skip = queryOptions.$skip;

    const divisions = await this.makeODataRequest(connection, '/odata/v2/FODivision', params);

    const cleanedDivisions = divisions.map(div => ({
      code: div.externalCode,
      name: div.name || 'N/A',
      status: div.status === 'A' || div.status === 'active' ? 'Active' : 'Inactive',
      description: div.description || 'No Description',
      createdBy: div.createdBy || 'System'
    }));

    setCache(companyId, 'Division', cleanedDivisions);
    return this.processQueryResult(cleanedDivisions, queryOptions);
  },

  /**
   * Fetch companies from SAP SuccessFactors OData (FOCompany)
   */
  async fetchCompanies(connection, queryOptions = {}, forceRefresh = false) {
    const { companyId } = connection;

    if (!forceRefresh) {
      const cachedData = getCache(companyId, 'Company');
      if (cachedData) {
        return this.processQueryResult(cachedData, queryOptions);
      }
    }

    console.log('Fetching companies from SAP SuccessFactors API...');
    const params = {
      $top: queryOptions.$top || 300
    };
    if (queryOptions.$skip) params.$skip = queryOptions.$skip;

    const companies = await this.makeODataRequest(connection, '/odata/v2/FOCompany', params);

    const cleanedCompanies = companies.map(comp => ({
      code: comp.externalCode,
      name: comp.name || 'N/A',
      status: comp.status === 'A' || comp.status === 'active' ? 'Active' : 'Inactive',
      country: comp.country || 'N/A',
      description: comp.description || 'No Description'
    }));

    setCache(companyId, 'Company', cleanedCompanies);
    return this.processQueryResult(cleanedCompanies, queryOptions);
  },

  /**
   * Apply client-side filtering over the dataset
   */
  applyFilters(dataset, filters) {
    if (!filters || Object.keys(filters).length === 0) return dataset;

    return dataset.filter(item => {
      return Object.entries(filters).every(([key, filterValue]) => {
        if (filterValue === undefined || filterValue === null || filterValue === '') return true;

        if (key === 'manager' && item.manager) {
          return item.manager.displayName.toLowerCase().includes(String(filterValue).toLowerCase()) ||
                 item.manager.userId.toLowerCase().includes(String(filterValue).toLowerCase());
        }

        const itemValue = item[key];
        if (itemValue === undefined || itemValue === null) return false;

        return String(itemValue).toLowerCase().includes(String(filterValue).toLowerCase());
      });
    });
  },

  /**
   * Process in-memory pagination and selection
   */
  processQueryResult(data, options) {
    let result = [...data];
    if (options.$skip) {
      const skip = Number(options.$skip);
      result = result.slice(skip);
    }
    if (options.$top) {
      const top = Number(options.$top);
      result = result.slice(0, top);
    }
    return result;
  }
};
