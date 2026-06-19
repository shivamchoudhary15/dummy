import React, { useRef } from 'react';
import { useApp } from '../context/AppContext';
import { 
  ResponsiveContainer, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  PieChart, 
  Pie, 
  Cell 
} from 'recharts';
import { Download, PieChart as PieIcon, BarChart3 as BarIcon, Table2, Info } from 'lucide-react';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

const COLORS = [
  '#0a6ed1', // Fiori Blue
  '#e9730c', // Fiori Warning Orange
  '#107e3e', // Fiori Success Green
  '#bb0000', // Fiori Error Red
  '#8f3bb8', // Purple
  '#008080', // Teal
  '#2f4f4f', // Slate Grey
  '#e6b800', // Gold
  '#ff4500', // Orange-Red
  '#228b22', // Forest Green
];

export const VisualizationArea = () => {
  const { 
    activeObject, 
    aggregatedData, 
    chartSettings, 
    filters, 
    connectionInfo,
    loading
  } = useApp();

  const chartRef = useRef(null);

  const totalVolume = aggregatedData.reduce((sum, item) => sum + item.value, 0);

  const exportPDF = async () => {
    if (!chartRef.current) return;

    try {
      const canvas = await html2canvas(chartRef.current, {
        scale: 2,
        useCORS: true,
        backgroundColor: '#ffffff'
      });
      const imgData = canvas.toDataURL('image/png');

      const doc = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4'
      });

      const pageWidth = doc.internal.pageSize.getWidth();
      const pageHeight = doc.internal.pageSize.getHeight();

      doc.setFillColor(24, 44, 76);
      doc.rect(0, 0, pageWidth, 28, 'F');

      doc.setTextColor(255, 255, 255);
      doc.setFont('Helvetica', 'bold');
      doc.setFontSize(18);
      doc.text('SF Insight Analytics Report', 15, 12);
      doc.setFont('Helvetica', 'normal');
      doc.setFontSize(9);
      doc.text('SAP SuccessFactors Self-Service reporting platform', 15, 19);
      doc.text(`Generated on: ${new Date().toLocaleString()}`, pageWidth - 70, 19);

      doc.setTextColor(50, 54, 58);
      doc.setFont('Helvetica', 'bold');
      doc.setFontSize(11);
      doc.text('REPORT DETAILS', 15, 38);
      doc.setDrawColor(217, 217, 217);
      doc.line(15, 40, pageWidth - 15, 40);

      doc.setFont('Helvetica', 'normal');
      doc.setFontSize(9);
      doc.text(`Object Model: ${activeObject}`, 15, 46);
      doc.text(`Target User: ${connectionInfo?.username || 'GLA_USER_1'}@${connectionInfo?.companyId || 'SFCPART001143'}`, 15, 51);
      doc.text(`Data Source URL: apisalesdemo2.successfactors.eu`, 15, 56);
      doc.text(`Total Records Analyzed: ${totalVolume}`, pageWidth - 90, 46);

      const filterStrings = Object.entries(filters)
        .filter(([_, v]) => v)
        .map(([k, v]) => `${k}: ${v}`);
      const filtersApplied = filterStrings.length > 0 ? filterStrings.join(', ') : 'None';
      doc.text(`Active Filters: ${filtersApplied}`, 15, 62);

      doc.setFont('Helvetica', 'bold');
      doc.setFontSize(11);
      doc.text('CHART VISUALIZATION', 15, 73);
      doc.line(15, 75, pageWidth - 15, 75);

      const imgWidth = pageWidth - 30;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      doc.addImage(imgData, 'PNG', 15, 80, imgWidth, Math.min(imgHeight, 95));

      const tableStartY = 80 + Math.min(imgHeight, 95) + 8;
      doc.setFont('Helvetica', 'bold');
      doc.setFontSize(11);
      doc.text('AGGREGATED DATA TABLE', 15, tableStartY);
      doc.line(15, tableStartY + 2, pageWidth - 15, tableStartY + 2);

      let currentY = tableStartY + 8;
      doc.setFillColor(244, 246, 249);
      doc.rect(15, currentY - 5, pageWidth - 30, 7, 'F');
      doc.setFontSize(9);
      doc.setFont('Helvetica', 'bold');
      doc.text('Group By Label', 18, currentY);
      doc.text(`Aggregated Metric (${chartSettings.aggregation.toUpperCase()})`, pageWidth - 80, currentY);

      doc.setFont('Helvetica', 'normal');
      currentY += 5;

      aggregatedData.forEach((row, i) => {
        if (currentY > pageHeight - 20) {
          doc.addPage();
          currentY = 20;
          doc.setFillColor(244, 246, 249);
          doc.rect(15, currentY - 5, pageWidth - 30, 7, 'F');
          doc.setFont('Helvetica', 'bold');
          doc.text('Group By Label', 18, currentY);
          doc.text(`Aggregated Value`, pageWidth - 80, currentY);
          doc.setFont('Helvetica', 'normal');
          currentY += 5;
        }

        if (i % 2 === 1) {
          doc.setFillColor(250, 250, 250);
          doc.rect(15, currentY - 4.5, pageWidth - 30, 6, 'F');
        }

        doc.text(String(row.label), 18, currentY);
        doc.text(String(row.value), pageWidth - 80, currentY);
        doc.line(15, currentY + 1.5, pageWidth - 15, currentY + 1.5);
        currentY += 6;
      });

      doc.setTextColor(150, 150, 150);
      doc.setFontSize(8);
      doc.text('SF Insight SAP SuccessFactors Visualization Dashboard. Confidentially Generated.', 15, pageHeight - 10);

      doc.save(`SF_Insight_Report_${activeObject}_${Date.now()}.pdf`);
    } catch (error) {
      console.error('PDF generation failed:', error);
      alert('Failed to export PDF.');
    }
  };

  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-fiori-shell text-white p-3 rounded shadow text-xs border border-fiori-border/20">
          <p className="font-semibold">{payload[0].payload.label}</p>
          <p className="text-fiori-blue-light font-mono mt-1">
            Value: {payload[0].value}
          </p>
        </div>
      );
    }
    return null;
  };

  const noData = !aggregatedData || aggregatedData.length === 0;

  return (
    <div className="bg-white border border-fiori-border rounded shadow-sm overflow-hidden flex flex-col h-full">
      <div className="p-4 border-b border-fiori-border flex items-center justify-between bg-gray-50">
        <div className="flex items-center gap-2">
          {chartSettings.chartType === 'bar' ? (
            <BarIcon className="w-5 h-5 text-fiori-blue" />
          ) : (
            <PieIcon className="w-5 h-5 text-fiori-blue" />
          )}
          <h2 className="font-semibold text-fiori-shell text-base">
            Analytics Studio — {chartSettings.aggregation.toUpperCase()}({chartSettings.numericField || activeObject}) by {chartSettings.groupBy}
          </h2>
        </div>

        {!noData && !loading && (
          <button
            onClick={exportPDF}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-fiori-blue hover:bg-fiori-blue-dark text-white text-xs font-semibold rounded shadow-sm transition"
          >
            <Download className="w-3.5 h-3.5" />
            Export Report (PDF)
          </button>
        )}
      </div>

      <div className="flex-1 p-6 flex flex-col lg:flex-row gap-6 min-h-[400px]">
        {loading ? (
          <div className="flex-1 flex flex-col items-center justify-center">
            <RefreshIcon className="w-8 h-8 text-fiori-blue animate-spin mb-2" />
            <span className="text-sm text-fiori-text-muted">Computing aggregation...</span>
          </div>
        ) : noData ? (
          <div className="flex-1 flex flex-col items-center justify-center text-center p-8 border-2 border-dashed border-gray-200 rounded">
            <Info className="w-12 h-12 text-gray-300 mb-2" />
            <h4 className="font-semibold text-fiori-shell">No Data Available to Plot</h4>
            <p className="text-sm text-fiori-text-muted max-w-sm mt-1">
              Verify your SAP connection details are configured and you have loaded the active dataset.
            </p>
          </div>
        ) : (
          <>
            <div className="flex-1 flex flex-col justify-center min-h-[300px]">
              <div className="mb-2 text-xs font-medium text-fiori-text-muted">
                Analyzed Volume: <strong className="text-fiori-text">{totalVolume} units</strong>
              </div>
              <div ref={chartRef} className="w-full h-80 bg-white">
                <ResponsiveContainer width="100%" height="100%">
                  {chartSettings.chartType === 'bar' ? (
                    <BarChart
                      data={aggregatedData}
                      margin={{ top: 20, right: 10, left: 10, bottom: 20 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                      <XAxis 
                        dataKey="label" 
                        tick={{ fill: '#6a6d70', fontSize: 11 }}
                        stroke="#d9d9d9"
                      />
                      <YAxis 
                        tick={{ fill: '#6a6d70', fontSize: 11 }}
                        stroke="#d9d9d9"
                      />
                      <Tooltip content={<CustomTooltip />} />
                      <Legend />
                      <Bar 
                        dataKey="value" 
                        name={`Aggregated (${chartSettings.aggregation})`} 
                        fill="#0a6ed1" 
                        radius={[4, 4, 0, 0]}
                      >
                        {aggregatedData.map((_, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Bar>
                    </BarChart>
                  ) : (
                    <PieChart>
                      <Pie
                        data={aggregatedData}
                        cx="50%"
                        cy="50%"
                        labelLine={true}
                        label={({ label, percent }) => `${label} (${(percent * 100).toFixed(0)}%)`}
                        outerRadius={100}
                        fill="#0a6ed1"
                        dataKey="value"
                        nameKey="label"
                      >
                        {aggregatedData.map((_, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip content={<CustomTooltip />} />
                      <Legend wrapperStyle={{ fontSize: '11px', color: '#32363a' }} />
                    </PieChart>
                  )}
                </ResponsiveContainer>
              </div>
            </div>

            <div className="w-full lg:w-80 shrink-0 flex flex-col border border-fiori-border rounded overflow-hidden">
              <div className="bg-gray-50 border-b border-fiori-border px-4 py-2.5 flex items-center gap-1.5">
                <Table2 className="w-4 h-4 text-fiori-blue" />
                <span className="font-semibold text-xs text-fiori-shell uppercase tracking-wider">
                  Summary Table
                </span>
              </div>
              <div className="flex-1 overflow-y-auto max-h-[300px]">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="bg-gray-100 border-b border-fiori-border font-semibold text-fiori-shell sticky top-0">
                      <th className="px-3 py-2 font-medium">Category</th>
                      <th className="px-3 py-2 text-right font-medium">Value</th>
                    </tr>
                  </thead>
                  <tbody>
                    {aggregatedData.map((row, index) => (
                      <tr 
                        key={index} 
                        className={`border-b border-gray-100 hover:bg-gray-50 ${
                          index % 2 === 1 ? 'bg-gray-50/30' : 'bg-white'
                        }`}
                      >
                        <td className="px-3 py-2 font-medium text-fiori-text truncate max-w-[160px]">{row.label}</td>
                        <td className="px-3 py-2 text-right font-mono font-semibold text-fiori-blue">{row.value}</td>
                      </tr>
                    ))}
                    {aggregatedData.length > 0 && (
                      <tr className="bg-gray-100 font-bold border-t border-fiori-border sticky bottom-0">
                        <td className="px-3 py-2 text-fiori-shell">Total (Sum)</td>
                        <td className="px-3 py-2 text-right font-mono text-fiori-shell">{totalVolume}</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

const RefreshIcon = ({ className }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24">
    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
  </svg>
);
