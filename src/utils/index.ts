import * as fs from 'fs';
import * as path from 'path';

/**
 * Check if a file exists
 */
export function fileExists(filePath: string): boolean {
  try {
    return fs.existsSync(filePath);
  } catch {
    return false;
  }
}

/**
 * Read file content safely
 */
export function readFile(filePath: string): string | null {
  try {
    return fs.readFileSync(filePath, 'utf-8');
  } catch {
    return null;
  }
}

/**
 * Write file content safely
 */
export function writeFile(filePath: string, content: string): boolean {
  try {
    // Ensure directory exists
    const dir = path.dirname(filePath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    
    fs.writeFileSync(filePath, content, 'utf-8');
    return true;
  } catch {
    return false;
  }
}

/**
 * Get file size in bytes
 */
export function getFileSize(filePath: string): number {
  try {
    const stats = fs.statSync(filePath);
    return stats.size;
  } catch {
    return 0;
  }
}

/**
 * Format bytes to human readable format
 */
export function formatBytes(bytes: number): string {
  if (bytes === 0) return '0 B';
  
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
}

/**
 * Format duration in milliseconds to human readable format
 */
export function formatDuration(ms: number): string {
  if (ms < 1000) {
    return `${ms}ms`;
  }
  
  const seconds = ms / 1000;
  if (seconds < 60) {
    return `${seconds.toFixed(1)}s`;
  }
  
  const minutes = seconds / 60;
  return `${minutes.toFixed(1)}m`;
}

/**
 * Normalize file path for cross-platform compatibility
 */
export function normalizePath(filePath: string): string {
  return path.normalize(filePath).replace(/\\/g, '/');
}

/**
 * Get relative path from base directory
 */
export function getRelativePath(filePath: string, baseDir: string): string {
  return path.relative(baseDir, filePath).replace(/\\/g, '/');
}

/**
 * Check if path is a directory
 */
export function isDirectory(dirPath: string): boolean {
  try {
    const stats = fs.statSync(dirPath);
    return stats.isDirectory();
  } catch {
    return false;
  }
}

/**
 * Get all files in directory recursively
 */
export function getFilesRecursively(dir: string, extensions?: string[]): string[] {
  const files: string[] = [];
  
  try {
    const items = fs.readdirSync(dir);
    
    for (const item of items) {
      const fullPath = path.join(dir, item);
      const stats = fs.statSync(fullPath);
      
      if (stats.isDirectory()) {
        // Skip node_modules and other common ignore directories
        if (!['node_modules', '.git', 'dist', 'build', '.next'].includes(item)) {
          files.push(...getFilesRecursively(fullPath, extensions));
        }
      } else if (stats.isFile()) {
        if (!extensions || extensions.some(ext => fullPath.endsWith(ext))) {
          files.push(fullPath);
        }
      }
    }
  } catch {
    // Ignore errors (permission denied, etc.)
  }
  
  return files;
}

/**
 * Debounce function
 */
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout;
  
  return (...args: Parameters<T>) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
}

/**
 * Create a progress reporter
 */
export class ProgressReporter {
  private current = 0;
  private total = 0;
  private startTime = Date.now();
  
  constructor(total: number) {
    this.total = total;
  }
  
  update(current: number): void {
    this.current = current;
    this.render();
  }
  
  increment(): void {
    this.current++;
    this.render();
  }
  
  finish(): void {
    this.current = this.total;
    this.render();
    console.log(); // New line
  }
  
  private render(): void {
    const percentage = Math.round((this.current / this.total) * 100);
    const elapsed = Date.now() - this.startTime;
    const rate = this.current / (elapsed / 1000);
    const eta = this.current > 0 ? (this.total - this.current) / rate : 0;
    
    const barLength = 30;
    const filledLength = Math.round((this.current / this.total) * barLength);
    const bar = '█'.repeat(filledLength) + '░'.repeat(barLength - filledLength);
    
    process.stdout.write(
      `\r[${bar}] ${percentage}% (${this.current}/${this.total}) ETA: ${formatDuration(eta * 1000)}`
    );
  }
}

/**
 * Simple logger with different levels
 */
export class Logger {
  private static level: 'debug' | 'info' | 'warn' | 'error' = 'info';
  
  static setLevel(level: 'debug' | 'info' | 'warn' | 'error'): void {
    this.level = level;
  }
  
  static debug(message: string, ...args: any[]): void {
    if (this.shouldLog('debug')) {
      console.log(`🐛 ${message}`, ...args);
    }
  }
  
  static info(message: string, ...args: any[]): void {
    if (this.shouldLog('info')) {
      console.log(`ℹ️  ${message}`, ...args);
    }
  }
  
  static warn(message: string, ...args: any[]): void {
    if (this.shouldLog('warn')) {
      console.warn(`⚠️  ${message}`, ...args);
    }
  }
  
  static error(message: string, ...args: any[]): void {
    if (this.shouldLog('error')) {
      console.error(`❌ ${message}`, ...args);
    }
  }
  
  private static shouldLog(level: string): boolean {
    const levels = ['debug', 'info', 'warn', 'error'];
    return levels.indexOf(level) >= levels.indexOf(this.level);
  }
}

/**
 * Validate CSS selector
 */
export function isValidCSSSelector(selector: string): boolean {
  try {
    // Basic validation - check for common CSS selector patterns
    const trimmed = selector.trim();
    
    // Empty selector
    if (!trimmed) return false;
    
    // Invalid characters at start
    if (/^[0-9]/.test(trimmed)) return false;
    
    // Basic pattern matching
    const validPattern = /^[a-zA-Z0-9._#\-\[\]:()\s,>+~*="']+$/;
    return validPattern.test(trimmed);
  } catch {
    return false;
  }
}

/**
 * Extract class names from a CSS selector
 */
export function extractClassNames(selector: string): string[] {
  const classNames: string[] = [];
  const classRegex = /\.([a-zA-Z0-9_-]+)/g;
  let match;
  
  while ((match = classRegex.exec(selector)) !== null) {
    classNames.push(match[1]);
  }
  
  return classNames;
}

/**
 * Extract ID names from a CSS selector
 */
export function extractIdNames(selector: string): string[] {
  const idNames: string[] = [];
  const idRegex = /#([a-zA-Z0-9_-]+)/g;
  let match;
  
  while ((match = idRegex.exec(selector)) !== null) {
    idNames.push(match[1]);
  }
  
  return idNames;
}

/**
 * Check if selector contains pseudo-classes or pseudo-elements
 */
export function hasPseudoSelectors(selector: string): boolean {
  return /::?[a-zA-Z-]+/.test(selector);
}

/**
 * Check if selector contains attribute selectors
 */
export function hasAttributeSelectors(selector: string): boolean {
  return /\[[^\]]+\]/.test(selector);
}

/**
 * Normalize CSS selector for comparison
 */
export function normalizeSelector(selector: string): string {
  return selector
    .trim()
    .replace(/\s+/g, ' ') // Normalize whitespace
    .replace(/\s*([>+~])\s*/g, '$1') // Remove spaces around combinators
    .toLowerCase();
}

/**
 * Calculate string similarity (Levenshtein distance)
 */
export function calculateSimilarity(str1: string, str2: string): number {
  const matrix: number[][] = [];
  const len1 = str1.length;
  const len2 = str2.length;
  
  // Initialize matrix
  for (let i = 0; i <= len1; i++) {
    matrix[i] = [i];
  }
  
  for (let j = 0; j <= len2; j++) {
    matrix[0][j] = j;
  }
  
  // Fill matrix
  for (let i = 1; i <= len1; i++) {
    for (let j = 1; j <= len2; j++) {
      const cost = str1[i - 1] === str2[j - 1] ? 0 : 1;
      matrix[i][j] = Math.min(
        matrix[i - 1][j] + 1,     // deletion
        matrix[i][j - 1] + 1,     // insertion
        matrix[i - 1][j - 1] + cost // substitution
      );
    }
  }
  
  const maxLen = Math.max(len1, len2);
  return maxLen === 0 ? 1 : (maxLen - matrix[len1][len2]) / maxLen;
}