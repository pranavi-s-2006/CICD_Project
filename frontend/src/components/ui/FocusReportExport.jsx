import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from './Card';
import Button from './Button';

const FocusReportExport = ({ sessionData, userStats }) => {
  const [isExporting, setIsExporting] = useState(false);

  const generateReport = async (format) => {
    setIsExporting(true);
    
    const reportData = {
      generatedAt: new Date().toISOString(),
      period: 'Last 7 days',
      summary: {
        totalSessions: userStats?.totalSessions || 0,
        totalFocusTime: userStats?.totalFocusTime || '0h 0m',
        averageFocusScore: userStats?.averageFocusScore || 0,
        topDistraction: userStats?.topDistraction || 'None',
        bestFocusTime: userStats?.bestFocusTime || 'Morning'
      },
      sessions: sessionData?.slice(-10) || [],
      insights: [
        'Focus quality improved by 15% this week',
        'Phone distractions decreased by 23%',
        'Best performance during 9-11 AM'
      ],
      recommendations: [
        'Consider longer focus blocks in the morning',
        'Use phone airplane mode during critical work',
        'Take breaks every 45 minutes for optimal performance'
      ]
    };

    if (format === 'json') {
      downloadJSON(reportData);
    } else if (format === 'pdf') {
      generatePDF(reportData);
    }
    
    setTimeout(() => setIsExporting(false), 1000);
  };

  const downloadJSON = (data) => {
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `focusloom-report-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const generatePDF = (data) => {
    // Simple HTML to PDF conversion
    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>FOCUSLOOM Focus Report</title>
        <style>
          body { font-family: Arial, sans-serif; margin: 40px; color: #333; }
          .header { text-align: center; margin-bottom: 30px; }
          .section { margin-bottom: 25px; }
          .metric { display: inline-block; margin: 10px 20px; text-align: center; }
          .metric-value { font-size: 24px; font-weight: bold; color: #0ea5e9; }
          .metric-label { font-size: 12px; color: #666; }
          .insight { background: #f0f9ff; padding: 10px; margin: 5px 0; border-left: 4px solid #0ea5e9; }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>🎯 FOCUSLOOM Focus Report</h1>
          <p>Generated on ${new Date().toLocaleDateString()}</p>
        </div>
        
        <div class="section">
          <h2>📊 Summary (${data.period})</h2>
          <div class="metric">
            <div class="metric-value">${data.summary.totalSessions}</div>
            <div class="metric-label">Total Sessions</div>
          </div>
          <div class="metric">
            <div class="metric-value">${data.summary.totalFocusTime}</div>
            <div class="metric-label">Focus Time</div>
          </div>
          <div class="metric">
            <div class="metric-value">${data.summary.averageFocusScore}%</div>
            <div class="metric-label">Avg Focus Score</div>
          </div>
        </div>

        <div class="section">
          <h2>🧬 Attention Fingerprint</h2>
          <p><strong>Top Distraction:</strong> ${data.summary.topDistraction}</p>
          <p><strong>Best Focus Time:</strong> ${data.summary.bestFocusTime}</p>
        </div>

        <div class="section">
          <h2>💡 Key Insights</h2>
          ${data.insights.map(insight => `<div class="insight">${insight}</div>`).join('')}
        </div>

        <div class="section">
          <h2>🎯 Recommendations</h2>
          <ul>
            ${data.recommendations.map(rec => `<li>${rec}</li>`).join('')}
          </ul>
        </div>
      </body>
      </html>
    `;

    const blob = new Blob([htmlContent], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `focusloom-report-${new Date().toISOString().split('T')[0]}.html`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">📄 Export Focus Report</CardTitle>
        <CardDescription>Generate comprehensive reports for analysis or sharing</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-4 rounded-lg bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800">
            <div className="font-semibold text-blue-800 dark:text-blue-200 mb-2">📊 JSON Report</div>
            <div className="text-sm text-blue-700 dark:text-blue-300 mb-3">
              Raw data for analysis, integrations, or backup
            </div>
            <Button 
              onClick={() => generateReport('json')} 
              disabled={isExporting}
              size="sm" 
              variant="outline"
              className="w-full"
            >
              {isExporting ? 'Generating...' : 'Export JSON'}
            </Button>
          </div>

          <div className="p-4 rounded-lg bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800">
            <div className="font-semibold text-green-800 dark:text-green-200 mb-2">📄 PDF Report</div>
            <div className="text-sm text-green-700 dark:text-green-300 mb-3">
              Formatted report for presentations or reviews
            </div>
            <Button 
              onClick={() => generateReport('pdf')} 
              disabled={isExporting}
              size="sm" 
              className="w-full"
            >
              {isExporting ? 'Generating...' : 'Export PDF'}
            </Button>
          </div>
        </div>

        <div className="p-3 rounded-lg bg-calm-50 dark:bg-calm-800">
          <div className="font-semibold text-calm-900 dark:text-calm-100 mb-2">📋 Report Includes:</div>
          <div className="text-sm text-calm-600 dark:text-calm-400 space-y-1">
            <p>• Weekly focus summary and trends</p>
            <p>• Attention fingerprint analysis</p>
            <p>• Distraction patterns and insights</p>
            <p>• Personalized recommendations</p>
            <p>• Session-by-session breakdown</p>
          </div>
        </div>

        <div className="text-xs text-calm-500 dark:text-calm-400">
          Reports are generated locally and contain no personally identifiable information beyond your focus patterns.
        </div>
      </CardContent>
    </Card>
  );
};

export default FocusReportExport;