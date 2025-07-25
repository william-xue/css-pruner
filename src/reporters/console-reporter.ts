import chalk from 'chalk';
import { AnalysisResult } from '../types.js';

export class ConsoleReporter {
  /**
   * Generate console report
   */
  async generate(result: AnalysisResult): Promise<void> {
    console.log('\n' + chalk.bold.blue('📊 CSS Analysis Report'));
    console.log(chalk.gray('='.repeat(50)));
    
    // Summary statistics
    this.printSummary(result);
    
    // Unused selectors
    if (result.unusedSelectors.length > 0) {
      this.printUnusedSelectors(result);
    }
    
    // Recommendations
    this.printRecommendations(result);
  }
  
  /**
   * Print summary statistics
   */
  private printSummary(result: AnalysisResult): void {
    console.log('\n' + chalk.bold('📈 Summary:'));
    console.log(`${chalk.cyan('Total CSS Files:')} ${result.stats.totalCSSFiles}`);
    console.log(`${chalk.cyan('Total Selectors:')} ${result.stats.totalSelectors}`);
    console.log(`${chalk.green('Used Selectors:')} ${result.stats.usedSelectors}`);
    console.log(`${chalk.red('Unused Selectors:')} ${result.stats.unusedSelectors}`);
    console.log(`${chalk.yellow('Potential Savings:')} ${this.formatBytes(result.potentialSavings)}`);
    console.log(`${chalk.blue('Analysis Time:')} ${result.stats.duration}ms`);
    
    // Usage percentage
    const usagePercentage = ((result.stats.usedSelectors / result.stats.totalSelectors) * 100).toFixed(1);
    const usageColor = parseFloat(usagePercentage) > 80 ? chalk.green : parseFloat(usagePercentage) > 60 ? chalk.yellow : chalk.red;
    console.log(`${chalk.cyan('Usage Rate:')} ${usageColor(usagePercentage + '%')}`);
  }
  
  /**
   * Print unused selectors
   */
  private printUnusedSelectors(result: AnalysisResult): void {
    console.log('\n' + chalk.bold.red('🗑️  Unused Selectors:'));
    
    // Group by file
    const byFile = new Map<string, typeof result.unusedSelectors>();
    for (const selector of result.unusedSelectors) {
      if (!byFile.has(selector.file)) {
        byFile.set(selector.file, []);
      }
      byFile.get(selector.file)!.push(selector);
    }
    
    // Show top 20 unused selectors
    const topUnused = result.unusedSelectors
      .sort((a, b) => b.size - a.size)
      .slice(0, 20);
    
    for (const selector of topUnused) {
      const fileInfo = chalk.gray(`${selector.file}:${selector.line}:${selector.column}`);
      const sizeInfo = chalk.yellow(`(${this.formatBytes(selector.size)})`);
      console.log(`  ${chalk.red('•')} ${chalk.white(selector.selector)} ${sizeInfo}`);
      console.log(`    ${fileInfo}`);
      if (selector.reason) {
        console.log(`    ${chalk.gray('Reason:')} ${selector.reason}`);
      }
    }
    
    if (result.unusedSelectors.length > 20) {
      console.log(`\n  ${chalk.gray(`... and ${result.unusedSelectors.length - 20} more unused selectors`)}`);
    }
    
    // File breakdown
    console.log('\n' + chalk.bold('📁 By File:'));
    for (const [file, selectors] of byFile) {
      const totalSize = selectors.reduce((sum, s) => sum + s.size, 0);
      console.log(`  ${chalk.cyan(file)}: ${selectors.length} unused (${this.formatBytes(totalSize)})`);
    }
  }
  
  /**
   * Print recommendations
   */
  private printRecommendations(result: AnalysisResult): void {
    console.log('\n' + chalk.bold.green('💡 Recommendations:'));
    
    if (result.unusedSelectors.length === 0) {
      console.log(`  ${chalk.green('✅')} Great! No unused CSS found.`);
      return;
    }
    
    const savingsKB = result.potentialSavings / 1024;
    
    if (savingsKB > 50) {
      console.log(`  ${chalk.red('🚨')} High impact: You can save ${this.formatBytes(result.potentialSavings)} by removing unused CSS.`);
    } else if (savingsKB > 10) {
      console.log(`  ${chalk.yellow('⚠️')} Medium impact: Consider removing unused CSS to save ${this.formatBytes(result.potentialSavings)}.`);
    } else {
      console.log(`  ${chalk.blue('ℹ️')} Low impact: Small savings of ${this.formatBytes(result.potentialSavings)} available.`);
    }
    
    // Specific recommendations
    const unusedPercentage = (result.stats.unusedSelectors / result.stats.totalSelectors) * 100;
    
    if (unusedPercentage > 50) {
      console.log(`  ${chalk.yellow('📋')} Consider reviewing your CSS architecture - ${unusedPercentage.toFixed(1)}% of selectors are unused.`);
    }
    
    if (result.unusedSelectors.some(s => s.reason === 'Not found in source files')) {
      console.log(`  ${chalk.blue('🔍')} Some selectors might be used dynamically. Consider adding them to the whitelist.`);
    }
    
    console.log(`  ${chalk.green('🧹')} Run with the 'clean' command to remove unused CSS automatically.`);
    console.log(`  ${chalk.blue('🔒')} Use --dry-run flag first to preview changes safely.`);
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