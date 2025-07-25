import * as fs from 'fs';
import * as path from 'path';
import { AnalysisResult } from '../types.js';

export class JSONReporter {
  /**
   * Generate JSON report
   */
  async generate(result: AnalysisResult, outputFile?: string): Promise<void> {
    const report = {
      timestamp: new Date().toISOString(),
      summary: {
        totalCSSFiles: result.stats.totalCSSFiles,
        totalSelectors: result.stats.totalSelectors,
        usedSelectors: result.stats.usedSelectors,
        unusedSelectors: result.stats.unusedSelectors,
        potentialSavings: result.potentialSavings,
        potentialSavingsFormatted: this.formatBytes(result.potentialSavings),
        usageRate: ((result.stats.usedSelectors / result.stats.totalSelectors) * 100).toFixed(2) + '%',
        analysisDuration: result.stats.duration
      },
      unusedSelectors: result.unusedSelectors.map(selector => ({
        selector: selector.selector,
        file: selector.file,
        line: selector.line,
        column: selector.column,
        size: selector.size,
        sizeFormatted: this.formatBytes(selector.size),
        reason: selector.reason,
        component: selector.component
      })),
      usedSelectors: result.usedSelectors.map(selector => ({
        selector: selector.selector,
        file: selector.file,
        usedIn: selector.usedIn,
        usageCount: selector.usageCount,
        component: selector.component
      })),
      fileBreakdown: this.generateFileBreakdown(result),
      recommendations: this.generateRecommendations(result)
    };
    
    const jsonContent = JSON.stringify(report, null, 2);
    
    if (outputFile) {
      // Ensure output directory exists
      const outputDir = path.dirname(outputFile);
      if (!fs.existsSync(outputDir)) {
        fs.mkdirSync(outputDir, { recursive: true });
      }
      
      fs.writeFileSync(outputFile, jsonContent);
      console.log(`📄 JSON report saved to: ${outputFile}`);
    } else {
      console.log(jsonContent);
    }
  }
  
  /**
   * Generate file breakdown
   */
  private generateFileBreakdown(result: AnalysisResult): any[] {
    const fileMap = new Map<string, {
      unusedCount: number;
      unusedSize: number;
      usedCount: number;
    }>();
    
    // Count unused selectors by file
    for (const selector of result.unusedSelectors) {
      if (!fileMap.has(selector.file)) {
        fileMap.set(selector.file, { unusedCount: 0, unusedSize: 0, usedCount: 0 });
      }
      const fileData = fileMap.get(selector.file)!;
      fileData.unusedCount++;
      fileData.unusedSize += selector.size;
    }
    
    // Count used selectors by file
    for (const selector of result.usedSelectors) {
      if (!fileMap.has(selector.file)) {
        fileMap.set(selector.file, { unusedCount: 0, unusedSize: 0, usedCount: 0 });
      }
      const fileData = fileMap.get(selector.file)!;
      fileData.usedCount++;
    }
    
    return Array.from(fileMap.entries()).map(([file, data]) => ({
      file,
      totalSelectors: data.usedCount + data.unusedCount,
      usedSelectors: data.usedCount,
      unusedSelectors: data.unusedCount,
      unusedSize: data.unusedSize,
      unusedSizeFormatted: this.formatBytes(data.unusedSize),
      usageRate: data.usedCount + data.unusedCount > 0 
        ? ((data.usedCount / (data.usedCount + data.unusedCount)) * 100).toFixed(2) + '%'
        : '0%'
    })).sort((a, b) => b.unusedSize - a.unusedSize);
  }
  
  /**
   * Generate recommendations
   */
  private generateRecommendations(result: AnalysisResult): any {
    const recommendations = {
      priority: 'low',
      impact: 'minimal',
      actions: [] as string[],
      warnings: [] as string[]
    };
    
    const savingsKB = result.potentialSavings / 1024;
    const unusedPercentage = (result.stats.unusedSelectors / result.stats.totalSelectors) * 100;
    
    // Determine priority and impact
    if (savingsKB > 50) {
      recommendations.priority = 'high';
      recommendations.impact = 'significant';
      recommendations.actions.push(`Remove unused CSS to save ${this.formatBytes(result.potentialSavings)}`);
    } else if (savingsKB > 10) {
      recommendations.priority = 'medium';
      recommendations.impact = 'moderate';
      recommendations.actions.push(`Consider removing unused CSS to save ${this.formatBytes(result.potentialSavings)}`);
    } else {
      recommendations.actions.push(`Small optimization opportunity: ${this.formatBytes(result.potentialSavings)} can be saved`);
    }
    
    // Architecture recommendations
    if (unusedPercentage > 50) {
      recommendations.warnings.push(`High unused CSS ratio (${unusedPercentage.toFixed(1)}%) suggests architectural review needed`);
      recommendations.actions.push('Review CSS architecture and organization');
    }
    
    // Dynamic usage warnings
    const dynamicUsageCount = result.unusedSelectors.filter(s => s.reason === 'Not found in source files').length;
    if (dynamicUsageCount > 0) {
      recommendations.warnings.push(`${dynamicUsageCount} selectors might be used dynamically`);
      recommendations.actions.push('Review and whitelist dynamically used selectors');
    }
    
    // General recommendations
    recommendations.actions.push('Use --dry-run flag to preview changes safely');
    recommendations.actions.push('Create backups before running clean command');
    
    if (result.unusedSelectors.length === 0) {
      recommendations.priority = 'none';
      recommendations.impact = 'none';
      recommendations.actions = ['No action needed - CSS is well optimized'];
    }
    
    return recommendations;
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
}