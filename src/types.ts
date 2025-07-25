export interface Config {
  /** CSS files to analyze */
  cssFiles: string[];
  
  /** Source directories to scan for class usage */
  sourceDirectories: string[];
  
  /** Patterns to ignore */
  ignorePatterns: string[];
  
  /** Selectors to always keep (whitelist) */
  whitelist: (string | RegExp)[];
  
  /** Selectors to always remove (blacklist) */
  blacklist: (string | RegExp)[];
  
  /** Patterns for dynamic class generation */
  dynamicClassPatterns: RegExp[];
  
  /** File extensions to scan */
  fileExtensions: string[];
  
  /** Report format: 'console', 'json', 'html' */
  reportFormat: 'console' | 'json' | 'html';
  
  /** Output file for reports (optional) */
  outputFile?: string;
  
  /** Verbose logging */
  verbose: boolean;
  
  /** Dry run mode (don't actually remove CSS) */
  dryRun: boolean;
}

export interface PrunerConfig {
  /** CSS files to analyze */
  cssFiles: string[];
  
  /** Source directories to scan for class usage */
  sourceDirectories: string[];
  
  /** Output file for reports */
  outputFile?: string;
  
  /** Preview mode - don't modify files */
  dryRun: boolean;
  
  /** Report format */
  reportFormat: 'json' | 'html' | 'console';
  
  /** Whitelist patterns - always keep these selectors */
  whitelist: string[];
  
  /** Blacklist patterns - always remove these selectors */
  blacklist: string[];
  
  /** Support dynamic class names like Tailwind JIT */
  supportDynamicClasses: boolean;
  
  /** Support CSS-in-JS and styled-components */
  supportCSSInJS: boolean;
  
  /** Enable component-level analysis */
  componentLevel: boolean;
  
  /** Create backup files before cleaning */
  backup?: boolean;
}

export interface AnalysisResult {
  /** List of unused CSS selectors */
  unusedSelectors: UnusedSelector[];
  
  /** List of used CSS selectors */
  usedSelectors: UsedSelector[];
  
  /** Potential bytes that can be saved */
  potentialSavings: number;
  
  /** Analysis statistics */
  stats: AnalysisStats;
}

export interface CleanResult {
  /** List of removed selectors */
  removedSelectors: UnusedSelector[];
  
  /** Actual bytes saved */
  bytesSaved: number;
  
  /** Files that were modified */
  modifiedFiles: string[];
  
  /** Backup files created (always created for safety) */
  backupFiles: string[];
}

export interface UnusedSelector {
  /** CSS selector */
  selector: string;
  
  /** File where the selector is defined */
  file: string;
  
  /** Line number in the file */
  line: number;
  
  /** Column number in the file */
  column: number;
  
  /** Size in bytes */
  size: number;
  
  /** Reason why it's considered unused */
  reason: string;
  
  /** Component context (if component-level analysis is enabled) */
  component?: string;
}

export interface UsedSelector {
  /** CSS selector */
  selector: string;
  
  /** File where the selector is defined */
  file: string;
  
  /** Files where the selector is used */
  usedIn: string[];
  
  /** Usage count */
  usageCount: number;
  
  /** Component context (if component-level analysis is enabled) */
  component?: string;
}

export interface AnalysisStats {
  /** Total CSS files analyzed */
  totalCSSFiles: number;
  
  /** Total source files scanned */
  totalSourceFiles: number;
  
  /** Total selectors found */
  totalSelectors: number;
  
  /** Used selectors count */
  usedSelectors: number;
  
  /** Unused selectors count */
  unusedSelectors: number;
  
  /** Total CSS size in bytes */
  totalSize: number;
  
  /** Analysis duration in milliseconds */
  duration: number;
}

export interface FileInfo {
  /** File path */
  path: string;
  
  /** File content */
  content: string;
  
  /** File type */
  type: 'css' | 'js' | 'ts' | 'jsx' | 'tsx' | 'vue' | 'html';
  
  /** Component name (for component files) */
  component?: string;
}

export interface CSSRule {
  /** CSS selector */
  selector: string;
  
  /** CSS properties */
  properties: string;
  
  /** File where the rule is defined */
  file: string;
  
  /** Line number */
  line: number;
  
  /** Column number */
  column: number;
  
  /** Rule size in bytes */
  size: number;
  
  /** Media query context */
  mediaQuery?: string;
  
  /** Keyframe context */
  keyframe?: string;
}

export interface DynamicClassPattern {
  /** Pattern to match dynamic classes */
  pattern: RegExp;
  
  /** Description of the pattern */
  description: string;
  
  /** Framework this pattern applies to */
  framework?: 'tailwind' | 'bootstrap' | 'custom';
}

export interface ComponentAnalysis {
  /** Component name */
  name: string;
  
  /** Component file path */
  file: string;
  
  /** CSS selectors used in this component */
  usedSelectors: string[];
  
  /** CSS selectors defined but not used in this component */
  unusedSelectors: string[];
  
  /** Scoped styles (for Vue, CSS Modules) */
  scopedStyles?: CSSRule[];
}