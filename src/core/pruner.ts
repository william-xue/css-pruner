import * as fs from 'fs';
import * as path from 'path';
import { CSSParser } from './css-parser';
import { SourceScanner } from './source-scanner';
import { HTMLReporter } from '../reporters/html-reporter';
import { JSONReporter } from '../reporters/json-reporter';
import { ConsoleReporter } from '../reporters/console-reporter';
import {
  PrunerConfig,
  AnalysisResult,
  CleanResult,
  UnusedSelector,
  UsedSelector,
  AnalysisStats,
  CSSRule
} from '../types';

export class CSSPruner {
  private config: PrunerConfig;
  private cssParser: CSSParser;
  private sourceScanner: SourceScanner;
  
  constructor(config: PrunerConfig) {
    this.config = config;
    this.cssParser = new CSSParser();
    this.sourceScanner = new SourceScanner();
  }
  
  /**
   * Analyze CSS files and find unused styles
   */
  async analyze(): Promise<AnalysisResult> {
    const startTime = Date.now();
    
    console.log('📋 Parsing CSS files...');
    const cssRules = await this.cssParser.parseCSSFiles(this.config.cssFiles);
    
    console.log('🔍 Scanning source files for class usage...');
    const usedClasses = await this.sourceScanner.scanSourceDirectories(this.config.sourceDirectories);
    
    console.log('🧮 Analyzing usage...');
    const { unusedSelectors, usedSelectors } = this.analyzeUsage(cssRules, usedClasses);
    
    const stats: AnalysisStats = {
      totalCSSFiles: this.config.cssFiles.length,
      totalSourceFiles: 0, // TODO: Count source files
      totalSelectors: cssRules.length,
      usedSelectors: usedSelectors.length,
      unusedSelectors: unusedSelectors.length,
      totalSize: cssRules.reduce((sum, rule) => sum + rule.size, 0),
      duration: Date.now() - startTime
    };
    
    const result: AnalysisResult = {
      unusedSelectors,
      usedSelectors,
      potentialSavings: unusedSelectors.reduce((sum, selector) => sum + selector.size, 0),
      stats
    };
    
    // Generate report
    await this.generateReport(result);
    
    return result;
  }
  
  /**
   * Clean CSS files by removing unused styles
   */
  async clean(): Promise<CleanResult> {
    const analysisResult = await this.analyze();
    
    if (this.config.dryRun) {
      console.log('🔍 Dry run mode - no files will be modified');
      return {
        removedSelectors: analysisResult.unusedSelectors,
        bytesSaved: analysisResult.potentialSavings,
        modifiedFiles: []
      };
    }
    
    console.log('🧹 Cleaning CSS files...');
    
    const modifiedFiles: string[] = [];
    const backupFiles: string[] = [];
    let totalBytesSaved = 0;
    
    // Group unused selectors by file
    const unusedByFile = new Map<string, UnusedSelector[]>();
    for (const selector of analysisResult.unusedSelectors) {
      if (!unusedByFile.has(selector.file)) {
        unusedByFile.set(selector.file, []);
      }
      unusedByFile.get(selector.file)!.push(selector);
    }
    
    // Process each CSS file
    for (const [filePath, unusedSelectors] of unusedByFile) {
      try {
        const originalContent = fs.readFileSync(filePath, 'utf-8');
        
        // Create backup if requested
        if (this.config.backup) {
          const backupPath = `${filePath}.backup.${Date.now()}`;
          fs.writeFileSync(backupPath, originalContent);
          backupFiles.push(backupPath);
        }
        
        // Remove unused selectors
        const cleanedContent = await this.removeUnusedSelectors(originalContent, unusedSelectors);
        
        if (cleanedContent !== originalContent) {
          fs.writeFileSync(filePath, cleanedContent);
          modifiedFiles.push(filePath);
          totalBytesSaved += Buffer.byteLength(originalContent, 'utf8') - Buffer.byteLength(cleanedContent, 'utf8');
        }
        
      } catch (error) {
        console.error(`Error cleaning file ${filePath}:`, error);
      }
    }
    
    return {
      removedSelectors: analysisResult.unusedSelectors,
      bytesSaved: totalBytesSaved,
      modifiedFiles,
      backupFiles: this.config.backup ? backupFiles : undefined
    };
  }
  
  /**
   * Analyze which selectors are used vs unused
   */
  private analyzeUsage(cssRules: CSSRule[], usedClasses: Set<string>): {
    unusedSelectors: UnusedSelector[];
    usedSelectors: UsedSelector[];
  } {
    const unusedSelectors: UnusedSelector[] = [];
    const usedSelectors: UsedSelector[] = [];
    
    for (const rule of cssRules) {
      const isUsed = this.isSelectorUsed(rule.selector, usedClasses);
      
      if (isUsed) {
        usedSelectors.push({
          selector: rule.selector,
          file: rule.file,
          usedIn: [], // TODO: Track where it's used
          usageCount: 1 // TODO: Count actual usage
        });
      } else {
        // Check whitelist/blacklist
        if (this.isWhitelisted(rule.selector)) {
          usedSelectors.push({
            selector: rule.selector,
            file: rule.file,
            usedIn: ['whitelist'],
            usageCount: 1
          });
        } else if (this.isBlacklisted(rule.selector)) {
          unusedSelectors.push({
            selector: rule.selector,
            file: rule.file,
            line: rule.line,
            column: rule.column,
            size: rule.size,
            reason: 'Blacklisted'
          });
        } else {
          unusedSelectors.push({
            selector: rule.selector,
            file: rule.file,
            line: rule.line,
            column: rule.column,
            size: rule.size,
            reason: 'Not found in source files'
          });
        }
      }
    }
    
    return { unusedSelectors, usedSelectors };
  }
  
  /**
   * Check if a CSS selector is used in the source code
   */
  private isSelectorUsed(selector: string, usedClasses: Set<string>): boolean {
    // Extract class names from selector
    const classNames = this.extractClassNamesFromSelector(selector);
    
    // If any class in the selector is used, consider the selector used
    for (const className of classNames) {
      if (usedClasses.has(className)) {
        return true;
      }
    }
    
    // Special cases for pseudo-selectors, attribute selectors, etc.
    if (this.isSpecialSelector(selector)) {
      return true; // Conservative approach - keep special selectors
    }
    
    return false;
  }
  
  /**
   * Extract class names from a CSS selector
   */
  private extractClassNamesFromSelector(selector: string): string[] {
    const classNames: string[] = [];
    const classRegex = /\.([a-zA-Z_-][a-zA-Z0-9_-]*)/g;
    let match;
    
    while ((match = classRegex.exec(selector)) !== null) {
      classNames.push(match[1]);
    }
    
    return classNames;
  }
  
  /**
   * Check if selector is a special selector that should be kept
   */
  private isSpecialSelector(selector: string): boolean {
    // Keep pseudo-selectors, attribute selectors, etc.
    return (
      selector.includes(':') ||
      selector.includes('[') ||
      selector.includes('*') ||
      selector.includes('html') ||
      selector.includes('body') ||
      /^[a-z]+$/i.test(selector.trim()) // Element selectors
    );
  }
  
  /**
   * Check if selector is whitelisted
   */
  private isWhitelisted(selector: string): boolean {
    return this.config.whitelist.some(pattern => {
      if (pattern.startsWith('/') && pattern.endsWith('/')) {
        // Regex pattern
        const regex = new RegExp(pattern.slice(1, -1));
        return regex.test(selector);
      }
      return selector.includes(pattern);
    });
  }
  
  /**
   * Check if selector is blacklisted
   */
  private isBlacklisted(selector: string): boolean {
    return this.config.blacklist.some(pattern => {
      if (pattern.startsWith('/') && pattern.endsWith('/')) {
        // Regex pattern
        const regex = new RegExp(pattern.slice(1, -1));
        return regex.test(selector);
      }
      return selector.includes(pattern);
    });
  }
  
  /**
   * Remove unused selectors from CSS content
   */
  private async removeUnusedSelectors(content: string, unusedSelectors: UnusedSelector[]): Promise<string> {
    // Sort by line number in descending order to avoid offset issues
    const sortedSelectors = unusedSelectors.sort((a, b) => b.line - a.line);
    
    const lines = content.split('\n');
    
    for (const selector of sortedSelectors) {
      // Simple approach: remove the entire rule
      // TODO: Implement more sophisticated removal using CSS AST
      const lineIndex = selector.line - 1;
      if (lineIndex >= 0 && lineIndex < lines.length) {
        // Find the start and end of the CSS rule
        const { start, end } = this.findRuleBoundaries(lines, lineIndex);
        
        // Remove the rule
        for (let i = start; i <= end; i++) {
          lines[i] = '';
        }
      }
    }
    
    // Clean up empty lines
    return lines
      .filter((line, index, array) => {
        // Keep non-empty lines
        if (line.trim()) return true;
        
        // Keep empty lines that are not consecutive
        const prevLine = array[index - 1];
        const nextLine = array[index + 1];
        return prevLine && prevLine.trim() && nextLine && nextLine.trim();
      })
      .join('\n');
  }
  
  /**
   * Find the boundaries of a CSS rule
   */
  private findRuleBoundaries(lines: string[], startLine: number): { start: number; end: number } {
    let start = startLine;
    let end = startLine;
    let braceCount = 0;
    
    // Find the start of the rule (look backwards for selector)
    while (start > 0 && !lines[start].includes('{')) {
      start--;
    }
    
    // Find the end of the rule (look forwards for closing brace)
    for (let i = start; i < lines.length; i++) {
      const line = lines[i];
      braceCount += (line.match(/\{/g) || []).length;
      braceCount -= (line.match(/\}/g) || []).length;
      
      if (braceCount === 0 && line.includes('}')) {
        end = i;
        break;
      }
    }
    
    return { start, end };
  }
  
  /**
   * Generate analysis report
   */
  private async generateReport(result: AnalysisResult): Promise<void> {
    switch (this.config.reportFormat) {
      case 'json':
        const jsonReporter = new JSONReporter();
        await jsonReporter.generate(result, this.config.outputFile);
        break;
      case 'html':
        const htmlReporter = new HTMLReporter();
        await htmlReporter.generate(result, this.config.outputFile);
        break;
      case 'console':
      default:
        const consoleReporter = new ConsoleReporter();
        await consoleReporter.generate(result);
        break;
    }
  }
}