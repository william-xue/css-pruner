import * as fs from 'fs';
import * as path from 'path';
import * as cssTree from 'css-tree';
import { CSSParser } from './css-parser.js';
import { SourceScanner } from './source-scanner.js';
import { HTMLReporter } from '../reporters/html-reporter.js';
import { JSONReporter } from '../reporters/json-reporter.js';
import { ConsoleReporter } from '../reporters/console-reporter.js';
import {
  PrunerConfig,
  AnalysisResult,
  CleanResult,
  UnusedSelector,
  UsedSelector,
  AnalysisStats,
  CSSRule
} from '../types.js';

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
      this.logCleaningSummary(analysisResult.potentialSavings, analysisResult.stats.totalSize, analysisResult.unusedSelectors.length, true);
      return {
        removedSelectors: analysisResult.unusedSelectors,
        bytesSaved: analysisResult.potentialSavings,
        modifiedFiles: [],
        backupFiles: []
      };
    }
    
    console.log('🧹 Cleaning CSS files...');
    
    const modifiedFiles: string[] = [];
    const backupFiles: string[] = [];
    let totalBytesSaved = 0;
    let totalOriginalSize = 0;
    
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
        const originalSize = Buffer.byteLength(originalContent, 'utf8');
        totalOriginalSize += originalSize;
        
        // Always create backup files for safety
        const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
        const backupPath = `${filePath}.backup.${timestamp}`;
        fs.writeFileSync(backupPath, originalContent);
        backupFiles.push(backupPath);
        console.log(`📋 Created backup: ${path.basename(backupPath)}`);
        
        // Remove unused selectors
        const cleanedContent = await this.removeUnusedSelectors(originalContent, unusedSelectors);
        
        if (cleanedContent !== originalContent) {
          const cleanedSize = Buffer.byteLength(cleanedContent, 'utf8');
          const fileSaved = originalSize - cleanedSize;
          
          fs.writeFileSync(filePath, cleanedContent);
          modifiedFiles.push(filePath);
          totalBytesSaved += fileSaved;
          
          // Log file-level statistics
          const fileReductionPercent = ((fileSaved / originalSize) * 100).toFixed(1);
          console.log(`✅ ${path.basename(filePath)}: ${this.formatBytes(fileSaved)} saved (${fileReductionPercent}% reduction)`);
        }
        
      } catch (error) {
        console.error(`❌ Error cleaning file ${filePath}:`, error);
      }
    }
    
    // Log overall cleaning summary
    this.logCleaningSummary(totalBytesSaved, totalOriginalSize, analysisResult.unusedSelectors.length, false);
    
    if (backupFiles.length > 0) {
      console.log(`\n💾 Backup files created: ${backupFiles.length}`);
      console.log('💡 If everything looks good, you can safely delete the backup files.');
      console.log('⚠️  If something went wrong, restore from backup files.');
    }
    
    return {
      removedSelectors: analysisResult.unusedSelectors,
      bytesSaved: totalBytesSaved,
      modifiedFiles,
      backupFiles
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
   * Remove unused selectors from CSS content using CSS AST
   */
  private async removeUnusedSelectors(content: string, unusedSelectors: UnusedSelector[]): Promise<string> {
    try {
      const { parse, walk, generate } = cssTree;
      
      // Create a set of unused selectors for fast lookup
      const unusedSet = new Set(unusedSelectors.map(s => s.selector));
      
      // Parse CSS content
      const ast = parse(content, { positions: true });
      
      // Custom walk function to track @keyframes context
      const walkWithContext = (node: any, item: any, list: any, insideKeyframes: boolean = false) => {
        // Check if node exists and has type property
        if (!node || !node.type) {
          return;
        }
        
        if (node.type === 'Atrule' && node.name === 'keyframes') {
          const atRulePrelude = node.prelude ? generate(node.prelude) : '';
          const fullAtRule = `@keyframes${atRulePrelude ? ' ' + atRulePrelude : ''}`;
          
          // Check if this @keyframes should be preserved
          const shouldPreserve = this.isWhitelisted(fullAtRule) || 
                                this.isWhitelisted('@keyframes') ||
                                (atRulePrelude && (this.isWhitelisted(atRulePrelude.trim()) || 
                                this.isWhitelisted(`@keyframes ${atRulePrelude.trim()}`)));
          
          if (shouldPreserve) {
            // Walk children with keyframes context
            if (node.block && node.block.children) {
              node.block.children.forEach((childItem: any) => {
                walkWithContext(childItem, childItem, node.block.children, true);
              });
            }
            return;
          }
        } else if (node.type === 'Rule') {
          // Don't remove rules inside @keyframes
          if (insideKeyframes) {
            return;
          }
          
          const selectors = this.extractSelectorsFromNode(node);
          
          // Check if any selector in this rule is unused
          const hasUnusedSelector = selectors.some(selector => {
            const trimmedSelector = selector.trim();
            const isUnused = unusedSet.has(trimmedSelector);
            const isWhitelisted = this.isWhitelisted(trimmedSelector);
            if (isUnused && !isWhitelisted) {
              return true;
            }
            return false;
          });
          
          if (hasUnusedSelector) {
            // Remove the entire rule
            list.remove(item);
          }
        }
        
        // Recursively walk children
        if (node.children) {
          node.children.forEach((childItem: any) => {
            walkWithContext(childItem, childItem, node.children, insideKeyframes);
          });
        } else if (node.block && node.block.children) {
          node.block.children.forEach((childItem: any) => {
            walkWithContext(childItem, childItem, node.block.children, insideKeyframes);
          });
        }
      };
      
      // Start walking from root
      if (ast.children) {
        ast.children.forEach((item: any, index: number) => {
          walkWithContext(item, item, ast.children, false);
        });
      }
      
      // Generate cleaned CSS
      return generate(ast);
      
    } catch (error) {
      console.warn('Failed to parse CSS with AST, falling back to string replacement:', error);
      return this.removeUnusedSelectorsStringBased(content, unusedSelectors);
    }
  }
  
  /**
   * Extract selectors from a CSS rule node
   */
  private extractSelectorsFromNode(ruleNode: any): string[] {
    const selectors: string[] = [];
    
    if (ruleNode.prelude && ruleNode.prelude.type === 'SelectorList') {
      const { generate } = cssTree;
      ruleNode.prelude.children.forEach((selector: any) => {
        const selectorText = generate(selector);
        selectors.push(selectorText);
      });
    }
    
    return selectors;
  }
  
  /**
   * Fallback method for string-based removal (for compressed CSS)
   */
  private removeUnusedSelectorsStringBased(content: string, unusedSelectors: UnusedSelector[]): string {
    let result = content;
    
    // Sort selectors by specificity and length to avoid partial matches
    const sortedSelectors = unusedSelectors.sort((a, b) => {
      // First sort by specificity (more specific selectors first)
      const aSpecificity = (a.selector.match(/[.#]/g) || []).length;
      const bSpecificity = (b.selector.match(/[.#]/g) || []).length;
      if (aSpecificity !== bSpecificity) {
        return bSpecificity - aSpecificity;
      }
      // Then by length (longer selectors first)
      return b.selector.length - a.selector.length;
    });
    
    for (const selector of sortedSelectors) {
      // Skip if selector is whitelisted
      if (this.isWhitelisted(selector.selector)) {
        continue;
      }
      
      // Use regex to find complete selector matches
      const escapedSelector = selector.selector.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      
      // Create regex pattern that matches the selector followed by CSS rule
      // This pattern ensures we match complete selectors and their entire rules
      const selectorPattern = new RegExp(
        `(?:^|[,}])\\s*${escapedSelector}\\s*(?:[,{]|$)`,
        'g'
      );
      
      let match;
      const matchesToRemove: Array<{start: number, end: number}> = [];
      
      // Find all matches of this selector
      while ((match = selectorPattern.exec(result)) !== null) {
        const matchStart = match.index;
        const selectorStart = result.indexOf(selector.selector, matchStart);
        
        if (selectorStart === -1) continue;
        
        // Find the opening brace for this selector
        let openBraceIndex = result.indexOf('{', selectorStart);
        if (openBraceIndex === -1) continue;
        
        // Count braces to find the matching closing brace
        let braceCount = 1;
        let currentIndex = openBraceIndex + 1;
        
        while (currentIndex < result.length && braceCount > 0) {
          if (result[currentIndex] === '{') {
            braceCount++;
          } else if (result[currentIndex] === '}') {
            braceCount--;
          }
          currentIndex++;
        }
        
        if (braceCount === 0) {
          // Check if this is a multi-selector rule (contains commas)
          const ruleContent = result.substring(selectorStart, openBraceIndex);
          const hasMultipleSelectors = ruleContent.includes(',');
          
          if (hasMultipleSelectors) {
            // For multi-selector rules, only remove this specific selector
            const beforeSelector = result.substring(0, selectorStart);
            const afterSelector = result.substring(selectorStart + selector.selector.length);
            
            // Check if we need to remove a comma before or after
            let newContent = beforeSelector;
            if (beforeSelector.endsWith(',') || beforeSelector.endsWith(', ')) {
              // Remove trailing comma from before
              newContent = beforeSelector.replace(/,\s*$/, '');
            }
            
            // Skip the selector itself
            let afterContent = afterSelector;
            if (afterContent.startsWith(',') || afterContent.startsWith(', ')) {
              // Remove leading comma from after
              afterContent = afterContent.replace(/^,\s*/, '');
            }
            
            result = newContent + afterContent;
          } else {
            // For single-selector rules, remove the entire rule
            matchesToRemove.push({
              start: selectorStart,
              end: currentIndex
            });
          }
        }
        
        // Reset regex lastIndex to avoid infinite loops
        selectorPattern.lastIndex = 0;
        break; // Process one match at a time to avoid index issues
      }
      
      // Remove matches in reverse order to maintain correct indices
      matchesToRemove.sort((a, b) => b.start - a.start);
      for (const match of matchesToRemove) {
        result = result.slice(0, match.start) + result.slice(match.end);
      }
    }
    
    // Clean up extra whitespace and semicolons
    result = result.replace(/;\s*;/g, ';');
    result = result.replace(/\s{2,}/g, ' ');
    result = result.replace(/}\s*}/g, '}'); // Remove double closing braces
    result = result.trim();
    
    return result;
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
   * Log cleaning summary with intuitive statistics
   */
  private logCleaningSummary(bytesSaved: number, totalSize: number, selectorsRemoved: number, isDryRun: boolean): void {
    const reductionPercent = totalSize > 0 ? ((bytesSaved / totalSize) * 100).toFixed(1) : '0.0';
    const action = isDryRun ? 'Could save' : 'Saved';
    
    console.log('\n' + '='.repeat(60));
    console.log(`🎯 ${action}: ${this.formatBytes(bytesSaved)} (${reductionPercent}% reduction)`);
    console.log(`📊 Selectors removed: ${selectorsRemoved}`);
    console.log(`📁 Original total size: ${this.formatBytes(totalSize)}`);
    
    if (parseFloat(reductionPercent) > 20) {
      console.log('🚀 Excellent! Significant size reduction achieved.');
    } else if (parseFloat(reductionPercent) > 10) {
      console.log('👍 Good size reduction achieved.');
    } else if (parseFloat(reductionPercent) > 5) {
      console.log('✅ Moderate size reduction achieved.');
    } else {
      console.log('📝 Small optimization completed.');
    }
    console.log('='.repeat(60));
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