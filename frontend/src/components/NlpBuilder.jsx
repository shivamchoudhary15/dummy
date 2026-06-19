import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Sparkles, Loader2, AlertCircle, HelpCircle } from 'lucide-react';

export const NlpBuilder = () => {
  const { applyNlp, nlpError, activeObject } = useApp();
  const [promptText, setPromptText] = useState('');
  const [loading, setLoading] = useState(false);

  const handleQuery = async (e) => {
    e.preventDefault();
    if (!promptText.trim()) return;

    setLoading(true);
    await applyNlp(promptText);
    setLoading(false);
  };

  const handleSuggestionClick = async (suggestion) => {
    setPromptText(suggestion);
    setLoading(true);
    await applyNlp(suggestion);
    setLoading(false);
  };

  const suggestions = activeObject === 'User' 
    ? [
        'headcount by department as bar chart',
        'average team size by location as pie chart',
        'headcount by gender as pie chart',
        'headcount by manager as bar chart'
      ]
    : [
        'average target fte by department as bar chart',
        'positions by effectiveStatus as pie chart',
        'average standard hours by division as bar chart',
        'positions by vacant as pie chart'
      ];

  return (
    <div className="bg-white border border-fiori-border rounded p-5 shadow-sm">
      <h3 className="text-sm font-semibold text-fiori-shell mb-4 flex items-center gap-1.5 border-b border-fiori-border pb-3">
        <Sparkles className="w-4 h-4 text-fiori-blue" />
        AI Chart Generator (NLP)
      </h3>

      {nlpError && (
        <div className="bg-red-50 border-l-4 border-fiori-error p-3 mb-3 text-xs text-fiori-error flex items-start gap-2 rounded-r">
          <AlertCircle className="w-3.5 h-3.5 mt-0.5 shrink-0" />
          <span>{nlpError}</span>
        </div>
      )}

      <form onSubmit={handleQuery} className="space-y-3">
        <div className="flex gap-2">
          <input
            type="text"
            value={promptText}
            onChange={(e) => setPromptText(e.target.value)}
            placeholder="e.g. headcount by department as bar chart..."
            className="flex-1 px-3 py-2 border border-fiori-border rounded text-sm focus:outline-none focus:border-fiori-blue bg-white"
          />
          <button
            type="submit"
            disabled={loading || !promptText.trim()}
            className="flex items-center gap-1 px-4 py-2 bg-gradient-to-r from-fiori-blue to-purple-600 hover:from-fiori-blue-dark hover:to-purple-700 text-white font-medium rounded text-sm shadow-sm transition disabled:opacity-75 disabled:cursor-not-allowed"
          >
            {loading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <>
                <Sparkles className="w-3.5 h-3.5" />
                Generate
              </>
            )}
          </button>
        </div>

        <div>
          <span className="text-[11px] font-semibold text-fiori-text-muted uppercase tracking-wider block mb-1.5 flex items-center gap-1">
            <HelpCircle className="w-3 h-3 text-fiori-blue" />
            Try typing or clicking:
          </span>
          <div className="flex flex-wrap gap-1.5">
            {suggestions.map((suggestion, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => handleSuggestionClick(suggestion)}
                className="text-[11px] text-fiori-blue bg-fiori-blue-light hover:bg-fiori-blue-light/70 px-2 py-1 rounded transition text-left border border-fiori-blue/10"
              >
                "{suggestion}"
              </button>
            ))}
          </div>
        </div>
      </form>
    </div>
  );
};
