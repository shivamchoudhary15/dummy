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

  // Dynamic suggestions for all 4 entities
  const suggestions = React.useMemo(() => {
    if (activeObject === 'User') {
      return [
        'headcount by department as bar chart',
        'average team size by location as pie chart',
        'headcount by gender as pie chart'
      ];
    } else if (activeObject === 'Position') {
      return [
        'average target fte by department as bar chart',
        'positions by effectiveStatus as pie chart',
        'average standard hours by division as bar chart'
      ];
    } else if (activeObject === 'Department') {
      return [
        'departments by status as pie chart',
        'departments by createdBy as bar chart',
        'departments by lastModifiedBy as bar chart'
      ];
    } else if (activeObject === 'Location') {
      return [
        'locations by timezone as pie chart',
        'locations by locationGroup as bar chart',
        'average standard hours by locationGroup as bar chart'
      ];
    } else if (activeObject === 'Division') {
      return [
        'divisions by status as pie chart',
        'divisions by createdBy as bar chart',
        'divisions by name as bar chart'
      ];
    } else { // Company
      return [
        'companies by status as pie chart',
        'companies by country as bar chart',
        'companies by name as bar chart'
      ];
    }
  }, [activeObject]);

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
