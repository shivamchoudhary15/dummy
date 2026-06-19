import { llmService } from './src/services/llmService.js';

const testLlmService = async () => {
  console.log('--- STARTING LLM SERVICE CONFIGURATION TEST ---');

  // Test 1: Unsupported provider error validation
  try {
    console.log('\nRunning Test 1: Unsupported provider validation...');
    await llmService.parsePromptWithLlm('headcount', 'invalid_provider', 'mock_key');
    console.error('Test 1 FAILED: Should have thrown unsupported provider error.');
  } catch (e) {
    if (e.message.includes('Unsupported LLM provider')) {
      console.log('Test 1 PASSED: Threw expected error:', e.message);
    } else {
      console.error('Test 1 FAILED with unexpected error:', e.message);
    }
  }

  // Test 2: Missing API key validation
  try {
    console.log('\nRunning Test 2: Missing API key validation...');
    await llmService.parsePromptWithLlm('headcount', 'openai', '');
    console.error('Test 2 FAILED: Should have thrown missing API key error.');
  } catch (e) {
    if (e.message.includes('is missing')) {
      console.log('Test 2 PASSED: Threw expected error:', e.message);
    } else {
      console.error('Test 2 FAILED with unexpected error:', e.message);
    }
  }

  // Test 3: Rejection on bad API key
  try {
    console.log('\nRunning Test 3: Rejection on bad API key...');
    await llmService.parsePromptWithLlm('headcount by department', 'openai', 'sk-invalidkeyvalueforopenaitestingshop');
    console.error('Test 3 FAILED: Should have thrown network error due to bad key.');
  } catch (e) {
    if (e.message.includes('LLM Error') || e.message.includes('401') || e.message.includes('API key')) {
      console.log('Test 3 PASSED: Threw expected API rejection error:', e.message);
    } else {
      console.error('Test 3 FAILED with unexpected error:', e.message);
    }
  }

  console.log('\n--- LLM SERVICE CONFIGURATION TEST COMPLETED ---');
};

testLlmService();
