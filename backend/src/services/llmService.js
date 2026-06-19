import axios from 'axios';

const SYSTEM_PROMPT = `You are an expert NLP query parser for SF Insight, an SAP SuccessFactors self-service reporting platform.
Your task is to parse a user's natural language request into a valid JSON object matching the following specification:

{
  "chartType": "bar" | "pie",
  "groupBy": string,
  "aggregation": "count" | "sum" | "average",
  "numericField": string (optional, only set if aggregation is "sum" or "average"),
  "objectType": "User" | "Position" | "Department" | "Location" | "Division" | "Company" (optional, set only if an entity is explicitly mentioned)
}

Database schemas and valid "groupBy" categories:
- User (Employee): department, location, status, manager, gender, title
- Position: department, location, effectiveStatus, jobCode, positionTitle, division, vacant
- Department: status, createdBy, lastModifiedBy, name
- Location: status, timezone, locationGroup, name
- Division: status, createdBy, name
- Company: status, country, name

Numeric fields suitable for aggregation ("sum" or "average"):
- User: teamMembersSize
- Position: targetFTE, standardHours
- Location: standardHours
- For Department, Division, Company, there are NO valid numeric fields (always default to "count").

Rules:
1. Determine the target "objectType" if explicitly mentioned.
2. Determine the "chartType" (default is "bar").
3. Determine the "aggregation" math (default is "count").
4. Determine the "groupBy" field (must map to one of the valid fields for that target entity).
5. If the user asks for "headcount" or "count of employees", use "count" aggregation.
6. Return ONLY the JSON object. Do not include any formatting, markdown markers, or text explanations.`;

function cleanJsonResponse(str) {
  let cleaned = str.trim();
  // Strip Markdown code block if returned by LLM
  if (cleaned.startsWith('```')) {
    cleaned = cleaned.replace(/^```[a-zA-Z]*\n/, '').replace(/\n```$/, '');
  }
  return cleaned.trim();
}

export const llmService = {
  /**
   * Routes query to the chosen LLM provider
   */
  async parsePromptWithLlm(prompt, provider, apiKey) {
    let key = apiKey;
    if (!key) {
      if (provider === 'openai') key = process.env.OPENAI_API_KEY;
      else if (provider === 'claude') key = process.env.ANTHROPIC_API_KEY;
      else if (provider === 'gemini') key = process.env.GEMINI_API_KEY;
      else if (provider === 'grok') key = process.env.GROK_API_KEY || process.env.XAI_API_KEY;
      else if (provider === 'groq') key = process.env.GROQ_API_KEY;
    }

    if (!key) {
      throw new Error(`API Key for ${provider} is missing. Please configure it in your environment variables (.env) or enter it in the AI Analytics Settings.`);
    }

    try {
      let jsonText = '';

      if (provider === 'openai') {
        const response = await axios.post(
          'https://api.openai.com/v1/chat/completions',
          {
            model: 'gpt-4o',
            messages: [
              { role: 'system', content: SYSTEM_PROMPT },
              { role: 'user', content: prompt }
            ],
            temperature: 0,
            response_format: { type: 'json_object' }
          },
          {
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${key}`
            },
            timeout: 8000
          }
        );
        jsonText = response.data.choices[0].message.content;

      } else if (provider === 'claude') {
        const response = await axios.post(
          'https://api.anthropic.com/v1/messages',
          {
            model: 'claude-3-5-sonnet-20240620',
            max_tokens: 1000,
            system: SYSTEM_PROMPT,
            messages: [
              { role: 'user', content: prompt }
            ],
            temperature: 0
          },
          {
            headers: {
              'content-type': 'application/json',
              'x-api-key': key,
              'anthropic-version': '2023-06-01'
            },
            timeout: 8000
          }
        );
        jsonText = response.data.content[0].text;

      } else if (provider === 'gemini') {
        const response = await axios.post(
          `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${key}`,
          {
            contents: [
              {
                parts: [
                  { text: `${SYSTEM_PROMPT}\n\nUser Query: "${prompt}"` }
                ]
              }
            ],
            generationConfig: {
              temperature: 0,
              responseMimeType: 'application/json'
            }
          },
          {
            headers: {
              'Content-Type': 'application/json'
            },
            timeout: 8000
          }
        );
        jsonText = response.data.candidates[0].content.parts[0].text;

      } else if (provider === 'grok') {
        const response = await axios.post(
          'https://api.x.ai/v1/chat/completions',
          {
            model: 'grok-2-1212',
            messages: [
              { role: 'system', content: SYSTEM_PROMPT },
              { role: 'user', content: prompt }
            ],
            temperature: 0
          },
          {
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${key}`
            },
            timeout: 8000
          }
        );
        jsonText = response.data.choices[0].message.content;

      } else if (provider === 'groq') {
        const response = await axios.post(
          'https://api.groq.com/openai/v1/chat/completions',
          {
            model: 'llama-3.3-70b-versatile',
            messages: [
              { role: 'system', content: SYSTEM_PROMPT },
              { role: 'user', content: prompt }
            ],
            temperature: 0
          },
          {
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${key}`
            },
            timeout: 8000
          }
        );
        jsonText = response.data.choices[0].message.content;

      } else {
        throw new Error(`Unsupported LLM provider: ${provider}`);
      }

      const cleaned = cleanJsonResponse(jsonText);
      const parsed = JSON.parse(cleaned);

      // Simple validation of the parsed spec structure
      return {
        chartType: parsed.chartType || 'bar',
        groupBy: parsed.groupBy || 'status',
        aggregation: parsed.aggregation || 'count',
        numericField: parsed.numericField || '',
        objectType: parsed.objectType || null
      };

    } catch (error) {
      console.error(`LLM Service Error (${provider}):`, error.message);
      throw new Error(`LLM Error: ${error.response?.data?.error?.message || error.message}`);
    }
  },

  /**
   * Quick verification of API Keys against provider check-endpoints
   */
  async verifyKey(provider, apiKey) {
    if (!apiKey) {
      throw new Error('API Key is empty.');
    }

    try {
      if (provider === 'openai') {
        await axios.get('https://api.openai.com/v1/models', {
          headers: { 'Authorization': `Bearer ${apiKey}` },
          timeout: 4000
        });
        return true;
      } else if (provider === 'claude') {
        // Send a minimal request to Claude
        await axios.post('https://api.anthropic.com/v1/messages', {
          model: 'claude-3-5-sonnet-20240620',
          max_tokens: 1,
          messages: [{ role: 'user', content: 'Ping' }]
        }, {
          headers: {
            'content-type': 'application/json',
            'x-api-key': apiKey,
            'anthropic-version': '2023-06-01'
          },
          timeout: 4000
        });
        return true;
      } else if (provider === 'gemini') {
        await axios.get(`https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`, {
          timeout: 4000
        });
        return true;
      } else if (provider === 'grok') {
        await axios.get('https://api.x.ai/v1/models', {
          headers: { 'Authorization': `Bearer ${apiKey}` },
          timeout: 4000
        });
        return true;
      } else if (provider === 'groq') {
        await axios.get('https://api.groq.com/openai/v1/models', {
          headers: { 'Authorization': `Bearer ${apiKey}` },
          timeout: 4000
        });
        return true;
      }
      return false;
    } catch (err) {
      const status = err.response?.status;
      if (status === 401 || status === 403) {
        throw new Error('Authentication failed: Invalid API key.');
      }
      throw new Error(`Verification failed: ${err.response?.data?.error?.message || err.message}`);
    }
  }
};
