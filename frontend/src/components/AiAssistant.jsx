import React, { useState, useRef, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { Sparkles, Send, Bot, User, RefreshCw, Zap, Settings } from 'lucide-react';
import { apiService } from '../services/api';

export const AiAssistant = () => {
  const { 
    applyNlp, 
    activeObject,
    llmProvider,
    setLlmProvider,
    llmApiKey,
    setLlmApiKey
  } = useApp();

  const [showSettings, setShowSettings] = useState(false);
  const [verifying, setVerifying] = useState(false);
  const [verifyStatus, setVerifyStatus] = useState(null);

  // Clear verification status if provider changes
  useEffect(() => {
    setVerifyStatus(null);
  }, [llmProvider]);

  const handleVerifyKey = async () => {
    if (!llmApiKey) return;
    setVerifying(true);
    setVerifyStatus(null);
    try {
      const res = await apiService.verifyLlmKey(llmProvider, llmApiKey);
      if (res.success) {
        setVerifyStatus({ success: true });
      } else {
        setVerifyStatus({ success: false, message: res.message || 'Key verification failed.' });
      }
    } catch (err) {
      setVerifyStatus({
        success: false,
        message: err.response?.data?.message || err.message || 'Verification failed.'
      });
    } finally {
      setVerifying(false);
    }
  };

  const [messages, setMessages] = useState([
    {
      sender: 'bot',
      text: "Hello! I'm your SF Insight analytical copilot. Describe the visualization you'd like to construct (e.g. \"show headcount by department as a bar chart\"), and I'll automatically generate the aggregation configuration.",
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }
  ]);
  const [inputText, setInputText] = useState('');
  const [loading, setLoading] = useState(false);
  const messageContainerRef = useRef(null);

  // Auto scroll message list to bottom
  useEffect(() => {
    if (messageContainerRef.current) {
      messageContainerRef.current.scrollTo({
        top: messageContainerRef.current.scrollHeight,
        behavior: 'smooth'
      });
    }
  }, [messages]);

  const handleSend = async (e) => {
    e.preventDefault();
    const prompt = inputText.trim();
    if (!prompt) return;

    // Add user message
    const userMsg = {
      sender: 'user',
      text: prompt,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };
    setMessages(prev => [...prev, userMsg]);
    setInputText('');
    setLoading(true);

    try {
      // Execute NLP parsing on backend
      const result = await applyNlp(prompt);

      if (result && result.success) {
        const { chartType, groupBy, aggregation, numericField, requestedGroupBy, isFallback, objectType, fallbackReason } = result.spec;
        
        let replyText = `✨ **Visualization compiled successfully!**\n\nI have configured the chart for you:\n`;
        replyText += `• **Entity Scope:** ${objectType}\n`;
        replyText += `• **Chart Type:** ${chartType.charAt(0).toUpperCase() + chartType.slice(1)} Chart\n`;
        replyText += `• **Group By:** ${groupBy}\n`;
        replyText += `• **Aggregation:** ${aggregation.charAt(0).toUpperCase() + aggregation.slice(1)}${numericField ? ` (${numericField})` : ''}\n`;
        
        const modelLabel = llmProvider === 'local' ? 'Local Heuristics' : llmProvider === 'openai' ? 'OpenAI GPT-4o' : llmProvider === 'claude' ? 'Claude 3.5 Sonnet' : llmProvider === 'gemini' ? 'Google Gemini 2.0 Flash' : llmProvider === 'grok' ? 'xAI Grok-2' : llmProvider === 'groq' ? 'Groq LPU Llama-3.3' : 'AI Copilot';
        replyText += `• **AI Engine:** ${modelLabel}\n\n`;

        if (fallbackReason) {
          replyText += `⚠️ **LLM Reverted:** "${fallbackReason}"\nReverted automatically to local rule-based parsing.\n\n`;
        }
        
        if (isFallback) {
          replyText += `⚠️ *Note:* The requested field "${requestedGroupBy}" is not valid for the active **${objectType}** object, so I fell back to **${groupBy}** to build the chart.`;
        } else {
          replyText += `The analytics workspace and graphs have been refreshed.`;
        }

        setTimeout(() => {
          setMessages(prev => [
            ...prev,
            {
              sender: 'bot',
              text: replyText,
              timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
            }
          ]);
          setLoading(false);
        }, 600);
      } else {
        const errorMsg = result?.error || 'Unknown parsing failure';
        setTimeout(() => {
          setMessages(prev => [
            ...prev,
            {
              sender: 'bot',
              text: `⚠️ I couldn't map that prompt to a chart configuration.\n\n*Details:* ${errorMsg}\n\nTry typing something like "headcount by department as bar chart" or "average standard hours by locationGroup".`,
              timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
            }
          ]);
          setLoading(false);
        }, 600);
      }
    } catch (err) {
      setMessages(prev => [
        ...prev,
        {
          sender: 'bot',
          text: `❌ Error communicating with the NLP service: ${err.message}`,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }
      ]);
      setLoading(false);
    }
  };

  const handlePillClick = (prompt) => {
    setInputText(prompt);
  };

  // Recommended prompt pills
  const recommendationPills = activeObject === 'User'
    ? ['headcount by location as pie chart', 'average team size by department as bar chart']
    : activeObject === 'Position'
    ? ['positions by effectiveStatus as pie chart', 'average target fte by division as bar chart']
    : activeObject === 'Department'
    ? ['departments by status as pie chart', 'departments by createdBy as bar chart']
    : ['locations by timezone as pie chart', 'average standard hours by locationGroup as bar chart'];

  return (
    <div className="bg-white border border-fiori-border rounded shadow-sm flex flex-col h-[520px]">
      {/* Header */}
      <div className="p-4 border-b border-fiori-border flex items-center justify-between bg-gradient-to-r from-fiori-shell to-fiori-blue/90 text-white">
        <div className="flex items-center gap-2">
          <Bot className="w-5 h-5 text-fiori-blue-light" />
          <div>
            <h3 className="font-semibold text-sm leading-none">AI Analytics Copilot</h3>
            <span className="text-[10px] text-gray-300">Semantic Chart Builder</span>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setShowSettings(!showSettings)}
            title="Configure AI Models"
            className="p-1 rounded hover:bg-white/10 transition text-white"
          >
            <Settings className="w-4 h-4" />
          </button>
          <div className="bg-fiori-blue-light/20 border border-fiori-blue-light/30 px-2 py-0.5 rounded text-[10px] flex items-center gap-1">
            <Zap className="w-3 h-3 text-yellow-400 fill-current animate-pulse" />
            Active
          </div>
        </div>
      </div>

      {/* Settings Subpanel */}
      {showSettings && (
        <div className="p-3 bg-gray-50 border-b border-fiori-border space-y-2.5 animate-fadeIn">
          <div>
            <label className="block text-[10px] font-bold uppercase tracking-wider text-fiori-text-muted mb-1">
              Select AI Model
            </label>
            <select
              value={llmProvider}
              onChange={(e) => setLlmProvider(e.target.value)}
              className="w-full px-2 py-1 border border-fiori-border rounded text-xs bg-white text-fiori-text focus:outline-none focus:border-fiori-blue"
            >
              <option value="local">Local Rule-Based Heuristics (Free)</option>
              <option value="openai">OpenAI GPT-4o (Key Required)</option>
              <option value="claude">Anthropic Claude 3.5 (Key Required)</option>
              <option value="gemini">Google Gemini 2.0 Flash (Key Required)</option>
              <option value="grok">xAI Grok-2 (Key Required)</option>
              <option value="groq">Groq LPU Llama-3.3 (Key Required)</option>
            </select>
          </div>
          {llmProvider !== 'local' && (
            <div>
              <label className="block text-[10px] font-bold uppercase tracking-wider text-fiori-text-muted mb-1 flex justify-between">
                <span>API Key</span>
                <span className="text-[9px] lowercase font-normal italic text-red-500">keys are never stored</span>
              </label>
              <div className="flex gap-2">
                <input
                  type="password"
                  value={llmApiKey}
                  onChange={(e) => {
                    setLlmApiKey(e.target.value);
                    if (verifyStatus) setVerifyStatus(null);
                  }}
                  placeholder={`Paste your ${llmProvider === 'openai' ? 'OpenAI' : llmProvider === 'claude' ? 'Anthropic' : llmProvider === 'gemini' ? 'Gemini' : llmProvider === 'grok' ? 'xAI Grok' : 'Groq'} API key...`}
                  className="flex-1 px-2 py-1 border border-fiori-border rounded text-xs bg-white text-fiori-text focus:outline-none focus:border-fiori-blue"
                />
                <button
                  type="button"
                  onClick={handleVerifyKey}
                  disabled={verifying || !llmApiKey}
                  className="px-3 py-1 bg-fiori-blue hover:bg-fiori-blue/90 text-white rounded text-xs transition disabled:opacity-50 flex items-center justify-center gap-1 font-medium shrink-0"
                >
                  {verifying ? (
                    <>
                      <RefreshCw className="w-3 h-3 animate-spin" />
                      Verifying...
                    </>
                  ) : (
                    'Verify'
                  )}
                </button>
              </div>
              {verifyStatus && (
                <div className={`text-[11px] mt-1.5 font-medium flex items-center gap-1 ${
                  verifyStatus.success ? 'text-green-600' : 'text-red-500'
                }`}>
                  {verifyStatus.success ? (
                    <span>✓ Key is valid!</span>
                  ) : (
                    <span>✗ {verifyStatus.message}</span>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Message Area */}
      <div ref={messageContainerRef} className="flex-1 overflow-y-auto p-4 space-y-3 bg-[#f8fafc]">
        {messages.map((msg, i) => (
          <div key={i} className={`flex gap-3 max-w-[85%] ${msg.sender === 'user' ? 'ml-auto flex-row-reverse' : ''}`}>
            {/* Avatar */}
            <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 shadow-sm ${
              msg.sender === 'bot' ? 'bg-fiori-blue text-white' : 'bg-gray-200 text-fiori-shell'
            }`}>
              {msg.sender === 'bot' ? <Bot className="w-4.5 h-4.5" /> : <User className="w-4.5 h-4.5" />}
            </div>

            {/* Bubble */}
            <div className={`p-3 rounded-lg text-xs leading-relaxed ${
              msg.sender === 'bot' 
                ? 'bg-white border border-gray-100 text-fiori-text shadow-sm rounded-tl-none' 
                : 'bg-fiori-blue text-white rounded-tr-none'
            }`}>
              <p className="whitespace-pre-line">{msg.text}</p>
              <span className={`block text-[9px] mt-1.5 text-right ${
                msg.sender === 'bot' ? 'text-fiori-text-muted' : 'text-gray-300'
              }`}>
                {msg.timestamp}
              </span>
            </div>
          </div>
        ))}
        {loading && (
          <div className="flex gap-3 max-w-[85%]">
            <div className="w-8 h-8 rounded-full bg-fiori-blue text-white flex items-center justify-center shrink-0 animate-pulse">
              <Bot className="w-4.5 h-4.5" />
            </div>
            <div className="p-3 rounded-lg bg-white border border-gray-100 text-fiori-text shadow-sm rounded-tl-none flex items-center gap-2 text-xs">
              <RefreshCw className="w-3.5 h-3.5 animate-spin text-fiori-blue" />
              Thinking...
            </div>
          </div>
        )}
      </div>

      {/* Recommendations Footer */}
      <div className="px-4 py-2 bg-gray-50 border-t border-fiori-border flex flex-wrap gap-1.5">
        <span className="text-[9px] uppercase tracking-wider text-fiori-text-muted font-bold block w-full mb-0.5">
          Suggested Queries:
        </span>
        {recommendationPills.map((rec, idx) => (
          <button
            key={idx}
            onClick={() => handlePillClick(rec)}
            className="text-[10px] bg-white hover:bg-gray-100 border border-fiori-border px-2.5 py-1 rounded text-fiori-blue transition font-medium"
          >
            "{rec}"
          </button>
        ))}
      </div>

      {/* Input controls */}
      <form onSubmit={handleSend} className="p-3 border-t border-fiori-border bg-white flex gap-2">
        <input
          type="text"
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          placeholder="Ask copilot to build a chart..."
          className="flex-1 px-3 py-2 border border-fiori-border rounded text-xs focus:outline-none focus:border-fiori-blue bg-white"
        />
        <button
          type="submit"
          disabled={loading || !inputText.trim()}
          className="bg-fiori-shell hover:bg-fiori-shell/90 text-white p-2 rounded shrink-0 transition disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Send className="w-4 h-4" />
        </button>
      </form>
    </div>
  );
};
