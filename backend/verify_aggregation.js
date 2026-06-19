import { successFactorsService } from './src/services/successFactorsService.js';
import { aggregationService } from './src/services/aggregationService.js';

const connection = {
  companyId: 'SFCPART001143',
  username: 'GLA_USER_1',
  password: 'Fjvezb333@',
  baseUrl: 'https://apisalesdemo2.successfactors.eu'
};

const runLiveVerification = async () => {
  console.log('--- STARTING LIVE SUCCESSFACTORS DATA AGGREGATION VERIFICATION ---');
  
  try {
    console.log(`Connecting to SAP SuccessFactors to pull real data...`);
    // Fetch 50 users from the OData API (forceRefresh = true)
    const realUsers = await successFactorsService.fetchUsers(connection, { $top: 50 }, true);
    
    console.log(`Successfully fetched ${realUsers.length} real employee records!`);
    
    if (realUsers.length === 0) {
      console.warn('Fetched dataset is empty. Cannot run tests.');
      return;
    }

    console.log('\nSample employee record structure:');
    console.log(JSON.stringify(realUsers[0], null, 2));

    // Test 1: Count Aggregation on real data (Headcount by Department)
    console.log('\n--- Running Test 1: Count of Employees by Department ---');
    try {
      const result = aggregationService.aggregateData(realUsers, 'department', 'count');
      console.log('Test 1 Passed. Headcount Results:');
      console.table(result);
    } catch (e) {
      console.error('Test 1 failed:', e.message);
    }

    // Test 2: Sum Aggregation on real data (Total team size by Department)
    console.log('\n--- Running Test 2: Sum of Team Size by Department ---');
    try {
      const result = aggregationService.aggregateData(realUsers, 'department', 'sum', 'teamMembersSize');
      console.log('Test 2 Passed. Total Team Members Results:');
      console.table(result);
    } catch (e) {
      console.error('Test 2 failed:', e.message);
    }

    // Test 3: Average Aggregation on real data (Average team size by Location)
    console.log('\n--- Running Test 3: Average Team Size by Location ---');
    try {
      const result = aggregationService.aggregateData(realUsers, 'location', 'average', 'teamMembersSize');
      console.log('Test 3 Passed. Average Team Size Results:');
      console.table(result);
    } catch (e) {
      console.error('Test 3 failed:', e.message);
    }

    // Test 4: Validation - Sum on Non-numeric Field (e.g. displayName)
    console.log('\n--- Running Test 4: Validation - Sum on non-numeric "displayName" ---');
    try {
      aggregationService.aggregateData(realUsers, 'department', 'sum', 'displayName');
      console.error('Test 4 FAILED: should have thrown validation error.');
    } catch (e) {
      console.log('Test 4 Passed. Threw expected validation error:', e.message);
    }

    // Test 5: Validation - Average on ID-like string field (e.g. userId)
    console.log('\n--- Running Test 5: Validation - Average on ID "userId" ---');
    try {
      aggregationService.aggregateData(realUsers, 'department', 'average', 'userId');
      console.error('Test 5 FAILED: should have thrown validation error.');
    } catch (e) {
      console.log('Test 5 Passed. Threw expected validation error:', e.message);
    }

  } catch (err) {
    console.error('Failed to run verification over live SuccessFactors data:', err.message);
  }

  console.log('\n--- LIVE DATA AGGREGATION VERIFICATION COMPLETED ---');
};

runLiveVerification();
