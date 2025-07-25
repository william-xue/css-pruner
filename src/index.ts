// Core exports
export { CSSPruner } from './core/pruner.js';
export { CSSParser } from './core/css-parser.js';
export { SourceScanner } from './core/source-scanner.js';

// Reporter exports
export { ConsoleReporter } from './reporters/console-reporter.js';
export { JSONReporter } from './reporters/json-reporter.js';
export { HTMLReporter } from './reporters/html-reporter.js';

// Configuration exports
export { loadConfig, createSampleConfig, DEFAULT_CONFIG } from './config.js';

// Type exports
export * from './types.js';

// Utility exports
export * from './utils/index.js';

// Plugin exports
export * from './plugins/index.js';

// Main API function for programmatic usage
export async function analyzeCSSUsage(options: {
  cssFiles: string[];
  sourceDirectories: string[];
  config?: Partial<import('./types').Config>;
}): Promise<import('./types').AnalysisResult> {
  const { CSSPruner } = await import('./core/pruner');
  const { loadConfig } = await import('./config');
  
  // Load and merge configuration
  const defaultConfig = await loadConfig();
  const finalConfig = {
    ...defaultConfig,
    ...options.config,
    cssFiles: options.cssFiles,
    sourceDirectories: options.sourceDirectories,
    // Add missing PrunerConfig properties
    supportDynamicClasses: true,
    supportCSSInJS: true,
    componentLevel: false,
    backup: false,
    // Convert RegExp arrays to string arrays for PrunerConfig
      whitelist: (options.config?.whitelist || defaultConfig.whitelist).map((item: any) => 
        typeof item === 'string' ? item : item.source
      ),
      blacklist: (options.config?.blacklist || defaultConfig.blacklist).map((item: any) => 
        typeof item === 'string' ? item : item.source
      )
  };
  
  // Create pruner instance and analyze
  const pruner = new CSSPruner(finalConfig);
  return await pruner.analyze();
}

// Main API function for cleaning CSS
export async function cleanCSS(options: {
  cssFiles: string[];
  sourceDirectories: string[];
  outputDir?: string;
  dryRun?: boolean;
  config?: Partial<import('./types').Config>;
}): Promise<{
  result: import('./types').AnalysisResult;
  cleanedFiles: string[];
}> {
  const { CSSPruner } = await import('./core/pruner');
  const { loadConfig } = await import('./config');
  
  // Load and merge configuration
  const defaultConfig = await loadConfig();
  const finalConfig = {
    ...defaultConfig,
    ...options.config,
    cssFiles: options.cssFiles,
    sourceDirectories: options.sourceDirectories,
    dryRun: options.dryRun ?? false,
    // Add missing PrunerConfig properties
    supportDynamicClasses: true,
    supportCSSInJS: true,
    componentLevel: false,
    backup: false,
    // Convert RegExp arrays to string arrays for PrunerConfig
      whitelist: (options.config?.whitelist || defaultConfig.whitelist).map((item: any) => 
        typeof item === 'string' ? item : item.source
      ),
      blacklist: (options.config?.blacklist || defaultConfig.blacklist).map((item: any) => 
        typeof item === 'string' ? item : item.source
      )
  };
  
  // Create pruner instance and clean
  const pruner = new CSSPruner(finalConfig);
  const result = await pruner.clean();
  
  // Convert CleanResult to AnalysisResult format
  const analysisResult: import('./types').AnalysisResult = {
    unusedSelectors: result.removedSelectors,
    usedSelectors: [], // CleanResult doesn't have this info
    potentialSavings: result.bytesSaved,
    stats: {
      totalCSSFiles: options.cssFiles.length,
      totalSourceFiles: options.sourceDirectories.length,
      totalSelectors: result.removedSelectors.length,
      usedSelectors: 0,
      unusedSelectors: result.removedSelectors.length,
      totalSize: result.bytesSaved,
      duration: 0
    }
  };
  
  return {
    result: analysisResult,
    cleanedFiles: result.modifiedFiles
  };
}

// Convenience function for quick analysis
export async function quickAnalysis(cssGlob: string, sourceGlob: string): Promise<{
  unusedCount: number;
  totalCount: number;
  potentialSavings: string;
  usageRate: string;
}> {
  const { formatBytes } = await import('./utils');
  
  const result = await analyzeCSSUsage({
    cssFiles: [cssGlob],
    sourceDirectories: [sourceGlob]
  });
  
  const usageRate = ((result.stats.usedSelectors / result.stats.totalSelectors) * 100).toFixed(1);
  
  return {
    unusedCount: result.stats.unusedSelectors,
    totalCount: result.stats.totalSelectors,
    potentialSavings: formatBytes(result.potentialSavings),
    usageRate: `${usageRate}%`
  };
}

// Version information
import packageJson from '../package.json' assert { type: 'json' };
export const version = packageJson.version;