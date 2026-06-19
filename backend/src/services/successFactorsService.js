import axios from 'axios';
import { Cache } from '../models/cache.js';

// In-memory cache fallback if MongoDB is not running
const memoryCache = new Map();
const CACHE_TTL_MS = 5 * 60 * 1000; // 5 minutes

const getCache = async (companyId, objectType) => {
  try {
    const cached = await Cache.findOne({ companyId, objectType });
    if (cached && (Date.now() - new Date(cached.fetchedAt).getTime() < CACHE_TTL_MS)) {
      return cached.data;
    }
  } catch (error) {
    console.error('MongoDB Cache read failed, trying in-memory cache:', error.message);
  }

  // Fallback to memory cache
  const memKey = `${companyId}:${objectType}`;
  const memCached = memoryCache.get(memKey);
  if (memCached && (Date.now() - memCached.fetchedAt < CACHE_TTL_MS)) {
    return memCached.data;
  }
  return null;
};

const setCache = async (companyId, objectType, data) => {
  try {
    await Cache.findOneAndUpdate(
      { companyId, objectType },
      { data, fetchedAt: new Date() },
      { upsert: true, new: true }
    );
  } catch (error) {
    console.error('MongoDB Cache write failed, saving in-memory:', error.message);
  }

  // Save to in-memory cache
  const memKey = `${companyId}:${objectType}`;
  memoryCache.set(memKey, {
    data,
    fetchedAt: Date.now()
  });
};

export const successFactorsService = {
  /**
   * Helper to make basic auth OData calls
   */
  async makeODataRequest(connection, endpoint, queryParams = {}) {
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
      const cachedData = await getCache(companyId, 'User');
      if (cachedData) {
        console.log(`Returning ${cachedData.length} cached users`);
        return this.processQueryResult(cachedData, queryOptions);
      }
    }

    console.log('Fetching users from SAP SuccessFactors API...');
    const params = {};
    
    // Support basic OData params if passed
    if (queryOptions.$select) params.$select = queryOptions.$select;
    if (queryOptions.$filter) params.$filter = queryOptions.$filter;
    
    // Ensure we expand manager for the dashboard
    params.$expand = 'manager';
    // SuccessFactors might cap records, let's fetch a reasonable number for reporting
    params.$top = queryOptions.$top || 300; 
    if (queryOptions.$skip) params.$skip = queryOptions.$skip;

    const users = await this.makeODataRequest(connection, '/odata/v2/User', params);
    
    // Clean up the users array (extract essential fields and manager details)
    const cleanedUsers = users.map(user => ({
      userId: user.userId,
      username: user.username,
      displayName: user.displayName || `${user.firstName || ''} ${user.lastName || ''}`.trim() || 'Unknown',
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      department: user.department || 'N/A',
      location: user.location || 'N/A',
      status: user.status === 't' || user.status === 'active' || user.status === 'Active' ? 'Active' : 'Inactive',
      title: user.title || user.jobTitle || 'N/A',
      gender: user.gender || 'N/A',
      teamMembersSize: user.teamMembersSize ? Number(user.teamMembersSize) : 0,
      manager: user.manager ? {
        userId: user.manager.userId,
        displayName: user.manager.displayName || `${user.manager.firstName || ''} ${user.manager.lastName || ''}`.trim() || 'Unknown',
        email: user.manager.email
      } : null
    }));

    await setCache(companyId, 'User', cleanedUsers);

    return this.processQueryResult(cleanedUsers, queryOptions);
  },

  /**
   * Fetch positions from SAP SuccessFactors OData
   */
  async fetchPositions(connection, queryOptions = {}, forceRefresh = false) {
    const { companyId } = connection;

    if (!forceRefresh) {
      const cachedData = await getCache(companyId, 'Position');
      if (cachedData) {
        console.log(`Returning ${cachedData.length} cached positions`);
        return this.processQueryResult(cachedData, queryOptions);
      }
    }

    console.log('Fetching positions from SAP SuccessFactors API...');
    const params = {};
    if (queryOptions.$select) params.$select = queryOptions.$select;
    if (queryOptions.$filter) params.$filter = queryOptions.$filter;
    
    params.$top = queryOptions.$top || 300;
    if (queryOptions.$skip) params.$skip = queryOptions.$skip;

    const positions = await this.makeODataRequest(connection, '/odata/v2/Position', params);

    // Clean up positions data
    const cleanedPositions = positions.map(pos => ({
      code: pos.code,
      positionTitle: pos.positionTitle || pos.jobTitle || 'N/A',
      jobCode: pos.jobCode || 'N/A',
      department: pos.department || 'N/A',
      location: pos.location || 'N/A',
      division: pos.division || 'N/A',
      effectiveStatus: pos.effectiveStatus === 'A' || pos.effectiveStatus === 'active' ? 'Active' : 'Inactive',
      vacant: pos.vacant === true || pos.vacant === 'true' ? 'Vacant' : 'Occupied',
      targetFTE: pos.targetFTE ? Number(pos.targetFTE) : 1.0,
      standardHours: pos.standardHours ? Number(pos.standardHours) : 40
    }));

    await setCache(companyId, 'Position', cleanedPositions);

    return this.processQueryResult(cleanedPositions, queryOptions);
  },

  /**
   * Apply client-side filtering over the dataset
   */
  applyFilters(dataset, filters) {
    if (!filters || Object.keys(filters).length === 0) return dataset;

    return dataset.filter(item => {
      return Object.entries(filters).every(([key, filterValue]) => {
        if (filterValue === undefined || filterValue === null || filterValue === '') return true;

        // Manager filter check
        if (key === 'manager' && item.manager) {
          return item.manager.displayName.toLowerCase().includes(String(filterValue).toLowerCase()) ||
                 item.manager.userId.toLowerCase().includes(String(filterValue).toLowerCase());
        }

        // Standard string match
        const itemValue = item[key];
        if (itemValue === undefined || itemValue === null) return false;

        return String(itemValue).toLowerCase().includes(String(filterValue).toLowerCase());
      });
    });
  },

  /**
   * Process in-memory pagination and selection (OData emulation for cached data)
   */
  processQueryResult(data, options) {
    let result = [...data];

    // OData $top / $skip emulation
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
