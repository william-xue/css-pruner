import * as fs from 'fs';
import * as path from 'path';
import { AnalysisResult } from '../types.js';

export class HTMLReporter {
  /**
   * Generate HTML report
   */
  async generate(result: AnalysisResult, outputFile?: string): Promise<void> {
    const htmlContent = this.generateHTMLContent(result);
    
    const fileName = outputFile || `css-analysis-report-${Date.now()}.html`;
    
    // Ensure output directory exists
    const outputDir = path.dirname(fileName);
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }
    
    fs.writeFileSync(fileName, htmlContent);
    console.log(`📄 HTML report saved to: ${fileName}`);
  }
  
  /**
   * Generate HTML content
   */
  private generateHTMLContent(result: AnalysisResult): string {
    const timestamp = new Date().toISOString();
    const usageRate = ((result.stats.usedSelectors / result.stats.totalSelectors) * 100).toFixed(1);
    
    return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>CSS Analysis Report</title>
    <style>
        ${this.getCSS()}
    </style>
    <script src="https://cdn.jsdelivr.net/npm/chart.js"></script>
</head>
<body>
    <div class="container">
        <header class="header">
            <h1>🔍 CSS Analysis Report</h1>
            <p class="timestamp">Generated on ${new Date(timestamp).toLocaleString()}</p>
        </header>
        
        <div class="summary-grid">
            <div class="summary-card">
                <h3>📊 Overview</h3>
                <div class="stat">
                    <span class="label">Total CSS Files:</span>
                    <span class="value">${result.stats.totalCSSFiles}</span>
                </div>
                <div class="stat">
                    <span class="label">Total Selectors:</span>
                    <span class="value">${result.stats.totalSelectors}</span>
                </div>
                <div class="stat">
                    <span class="label">Analysis Time:</span>
                    <span class="value">${result.stats.duration}ms</span>
                </div>
            </div>
            
            <div class="summary-card">
                <h3>✅ Used Selectors</h3>
                <div class="big-number used">${result.stats.usedSelectors}</div>
                <div class="percentage">${usageRate}% of total</div>
            </div>
            
            <div class="summary-card">
                <h3>❌ Unused Selectors</h3>
                <div class="big-number unused">${result.stats.unusedSelectors}</div>
                <div class="percentage">${(100 - parseFloat(usageRate)).toFixed(1)}% of total</div>
            </div>
            
            <div class="summary-card">
                <h3>💾 Potential Savings</h3>
                <div class="big-number savings">${this.formatBytes(result.potentialSavings)}</div>
                <div class="percentage">Can be removed</div>
            </div>
        </div>
        
        <div class="chart-container">
            <canvas id="usageChart" width="400" height="200"></canvas>
        </div>
        
        ${this.generateFileBreakdownHTML(result)}
        
        ${this.generateUnusedSelectorsHTML(result)}
        
        ${this.generateRecommendationsHTML(result)}
    </div>
    
    <script>
        ${this.getJavaScript(result)}
    </script>
</body>
</html>`;
  }
  
  /**
   * Generate file breakdown HTML
   */
  private generateFileBreakdownHTML(result: AnalysisResult): string {
    const fileMap = new Map<string, { unusedCount: number; unusedSize: number; usedCount: number }>();
    
    // Count by file
    for (const selector of result.unusedSelectors) {
      if (!fileMap.has(selector.file)) {
        fileMap.set(selector.file, { unusedCount: 0, unusedSize: 0, usedCount: 0 });
      }
      const fileData = fileMap.get(selector.file)!;
      fileData.unusedCount++;
      fileData.unusedSize += selector.size;
    }
    
    for (const selector of result.usedSelectors) {
      if (!fileMap.has(selector.file)) {
        fileMap.set(selector.file, { unusedCount: 0, unusedSize: 0, usedCount: 0 });
      }
      const fileData = fileMap.get(selector.file)!;
      fileData.usedCount++;
    }
    
    const files = Array.from(fileMap.entries())
      .map(([file, data]) => ({ file, ...data }))
      .sort((a, b) => b.unusedSize - a.unusedSize);
    
    let html = `
        <section class="file-breakdown">
            <h2>📁 File Breakdown</h2>
            <div class="table-container">
                <table class="breakdown-table">
                    <thead>
                        <tr>
                            <th>File</th>
                            <th>Total Selectors</th>
                            <th>Used</th>
                            <th>Unused</th>
                            <th>Potential Savings</th>
                            <th>Usage Rate</th>
                        </tr>
                    </thead>
                    <tbody>`;
    
    for (const file of files) {
      const total = file.usedCount + file.unusedCount;
      const usageRate = total > 0 ? ((file.usedCount / total) * 100).toFixed(1) : '0';
      const usageClass = parseFloat(usageRate) > 80 ? 'good' : parseFloat(usageRate) > 60 ? 'warning' : 'danger';
      
      html += `
                        <tr>
                            <td class="file-name">${path.basename(file.file)}</td>
                            <td>${total}</td>
                            <td class="used">${file.usedCount}</td>
                            <td class="unused">${file.unusedCount}</td>
                            <td class="savings">${this.formatBytes(file.unusedSize)}</td>
                            <td class="usage-rate ${usageClass}">${usageRate}%</td>
                        </tr>`;
    }
    
    html += `
                    </tbody>
                </table>
            </div>
        </section>`;
    
    return html;
  }
  
  /**
   * Generate unused selectors HTML
   */
  private generateUnusedSelectorsHTML(result: AnalysisResult): string {
    if (result.unusedSelectors.length === 0) {
      return `
        <section class="unused-selectors">
            <h2>🎉 No Unused Selectors Found!</h2>
            <p class="success-message">Your CSS is well optimized. Great job!</p>
        </section>`;
    }
    
    const topUnused = result.unusedSelectors
      .sort((a, b) => b.size - a.size)
      .slice(0, 50); // Show top 50
    
    let html = `
        <section class="unused-selectors">
            <h2>🗑️ Unused Selectors (Top 50)</h2>
            <div class="table-container">
                <table class="selectors-table">
                    <thead>
                        <tr>
                            <th>Selector</th>
                            <th>File</th>
                            <th>Line</th>
                            <th>Size</th>
                            <th>Reason</th>
                        </tr>
                    </thead>
                    <tbody>`;
    
    for (const selector of topUnused) {
      html += `
                        <tr>
                            <td class="selector-name"><code>${this.escapeHtml(selector.selector)}</code></td>
                            <td class="file-name">${path.basename(selector.file)}</td>
                            <td class="line-number">${selector.line}</td>
                            <td class="size">${this.formatBytes(selector.size)}</td>
                            <td class="reason">${selector.reason}</td>
                        </tr>`;
    }
    
    html += `
                    </tbody>
                </table>
            </div>`;
    
    if (result.unusedSelectors.length > 50) {
      html += `<p class="note">... and ${result.unusedSelectors.length - 50} more unused selectors</p>`;
    }
    
    html += `</section>`;
    
    return html;
  }
  
  /**
   * Generate recommendations HTML
   */
  private generateRecommendationsHTML(result: AnalysisResult): string {
    const savingsKB = result.potentialSavings / 1024;
    const unusedPercentage = (result.stats.unusedSelectors / result.stats.totalSelectors) * 100;
    
    let html = `
        <section class="recommendations">
            <h2>💡 Recommendations</h2>
            <div class="recommendations-grid">`;
    
    if (result.unusedSelectors.length === 0) {
      html += `
                <div class="recommendation success">
                    <h3>✅ Excellent!</h3>
                    <p>No unused CSS found. Your stylesheets are well optimized.</p>
                </div>`;
    } else {
      // Impact assessment
      if (savingsKB > 50) {
        html += `
                <div class="recommendation high-impact">
                    <h3>🚨 High Impact</h3>
                    <p>You can save <strong>${this.formatBytes(result.potentialSavings)}</strong> by removing unused CSS. This is a significant optimization opportunity.</p>
                </div>`;
      } else if (savingsKB > 10) {
        html += `
                <div class="recommendation medium-impact">
                    <h3>⚠️ Medium Impact</h3>
                    <p>Consider removing unused CSS to save <strong>${this.formatBytes(result.potentialSavings)}</strong>.</p>
                </div>`;
      } else {
        html += `
                <div class="recommendation low-impact">
                    <h3>ℹ️ Low Impact</h3>
                    <p>Small optimization opportunity: <strong>${this.formatBytes(result.potentialSavings)}</strong> can be saved.</p>
                </div>`;
      }
      
      // Architecture recommendations
      if (unusedPercentage > 50) {
        html += `
                <div class="recommendation warning">
                    <h3>📋 Architecture Review</h3>
                    <p><strong>${unusedPercentage.toFixed(1)}%</strong> of your selectors are unused. Consider reviewing your CSS architecture.</p>
                </div>`;
      }
      
      // Safety recommendations
      html += `
                <div class="recommendation info">
                    <h3>🔒 Safety First</h3>
                    <ul>
                        <li>Use <code>--dry-run</code> flag to preview changes</li>
                        <li>Create backups before cleaning</li>
                        <li>Review dynamically used selectors</li>
                        <li>Test thoroughly after cleaning</li>
                    </ul>
                </div>`;
    }
    
    html += `
            </div>
        </section>`;
    
    return html;
  }
  
  /**
   * Get CSS styles
   */
  private getCSS(): string {
    return `
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            line-height: 1.6;
            color: #333;
            background: #f5f7fa;
        }
        
        .container {
            max-width: 1200px;
            margin: 0 auto;
            padding: 20px;
        }
        
        .header {
            text-align: center;
            margin-bottom: 40px;
            padding: 40px 0;
            background: white;
            border-radius: 12px;
            box-shadow: 0 2px 10px rgba(0,0,0,0.1);
        }
        
        .header h1 {
            font-size: 2.5rem;
            margin-bottom: 10px;
            color: #2c3e50;
        }
        
        .timestamp {
            color: #7f8c8d;
            font-size: 0.9rem;
        }
        
        .summary-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
            gap: 20px;
            margin-bottom: 40px;
        }
        
        .summary-card {
            background: white;
            padding: 30px;
            border-radius: 12px;
            box-shadow: 0 2px 10px rgba(0,0,0,0.1);
            text-align: center;
        }
        
        .summary-card h3 {
            margin-bottom: 20px;
            color: #2c3e50;
            font-size: 1.1rem;
        }
        
        .stat {
            display: flex;
            justify-content: space-between;
            margin-bottom: 10px;
        }
        
        .label {
            color: #7f8c8d;
        }
        
        .value {
            font-weight: bold;
            color: #2c3e50;
        }
        
        .big-number {
            font-size: 3rem;
            font-weight: bold;
            margin-bottom: 10px;
        }
        
        .big-number.used { color: #27ae60; }
        .big-number.unused { color: #e74c3c; }
        .big-number.savings { color: #f39c12; }
        
        .percentage {
            color: #7f8c8d;
            font-size: 0.9rem;
        }
        
        .chart-container {
            background: white;
            padding: 30px;
            border-radius: 12px;
            box-shadow: 0 2px 10px rgba(0,0,0,0.1);
            margin-bottom: 40px;
        }
        
        .table-container {
            overflow-x: auto;
            background: white;
            border-radius: 8px;
        }
        
        table {
            width: 100%;
            border-collapse: collapse;
        }
        
        th, td {
            padding: 12px;
            text-align: left;
            border-bottom: 1px solid #ecf0f1;
        }
        
        th {
            background: #f8f9fa;
            font-weight: 600;
            color: #2c3e50;
        }
        
        .file-name {
            font-family: monospace;
            font-size: 0.9rem;
        }
        
        .selector-name code {
            background: #f8f9fa;
            padding: 4px 8px;
            border-radius: 4px;
            font-size: 0.85rem;
        }
        
        .used { color: #27ae60; font-weight: bold; }
        .unused { color: #e74c3c; font-weight: bold; }
        .savings { color: #f39c12; font-weight: bold; }
        
        .usage-rate.good { color: #27ae60; }
        .usage-rate.warning { color: #f39c12; }
        .usage-rate.danger { color: #e74c3c; }
        
        section {
            background: white;
            padding: 30px;
            border-radius: 12px;
            box-shadow: 0 2px 10px rgba(0,0,0,0.1);
            margin-bottom: 30px;
        }
        
        section h2 {
            margin-bottom: 20px;
            color: #2c3e50;
            font-size: 1.5rem;
        }
        
        .recommendations-grid {
            display: grid;
            gap: 20px;
        }
        
        .recommendation {
            padding: 20px;
            border-radius: 8px;
            border-left: 4px solid;
        }
        
        .recommendation.success {
            background: #d5f4e6;
            border-color: #27ae60;
        }
        
        .recommendation.high-impact {
            background: #fadbd8;
            border-color: #e74c3c;
        }
        
        .recommendation.medium-impact {
            background: #fef5e7;
            border-color: #f39c12;
        }
        
        .recommendation.low-impact {
            background: #ebf3fd;
            border-color: #3498db;
        }
        
        .recommendation.warning {
            background: #fef5e7;
            border-color: #f39c12;
        }
        
        .recommendation.info {
            background: #ebf3fd;
            border-color: #3498db;
        }
        
        .recommendation h3 {
            margin-bottom: 10px;
            font-size: 1.1rem;
        }
        
        .recommendation ul {
            margin-left: 20px;
        }
        
        .recommendation li {
            margin-bottom: 5px;
        }
        
        .note {
            color: #7f8c8d;
            font-style: italic;
            margin-top: 15px;
        }
        
        .success-message {
            font-size: 1.2rem;
            color: #27ae60;
            text-align: center;
            padding: 40px;
        }
        
        code {
            font-family: 'Monaco', 'Menlo', monospace;
        }`;
  }
  
  /**
   * Get JavaScript for charts
   */
  private getJavaScript(result: AnalysisResult): string {
    return `
        // Usage Chart
        const ctx = document.getElementById('usageChart').getContext('2d');
        new Chart(ctx, {
            type: 'doughnut',
            data: {
                labels: ['Used Selectors', 'Unused Selectors'],
                datasets: [{
                    data: [${result.stats.usedSelectors}, ${result.stats.unusedSelectors}],
                    backgroundColor: ['#27ae60', '#e74c3c'],
                    borderWidth: 0
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        position: 'bottom',
                        labels: {
                            padding: 20,
                            font: {
                                size: 14
                            }
                        }
                    },
                    title: {
                        display: true,
                        text: 'CSS Selector Usage Distribution',
                        font: {
                            size: 16,
                            weight: 'bold'
                        },
                        padding: 20
                    }
                }
            }
        });`;
  }
  
  /**
   * Format bytes to human readable format
   */
  private formatBytes(bytes: number): string {
    if (bytes === 0) return '0 B';
    
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  }
  
  /**
   * Escape HTML characters
   */
  private escapeHtml(text: string): string {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }
}