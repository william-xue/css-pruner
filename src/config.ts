import * as fs from 'fs';
import * as path from 'path';
import { Config } from './types';
import { fileExists, readFile } from './utils';

/**
 * Default configuration
 */
export const DEFAULT_CONFIG: Config = {
  cssFiles: ['**/*.css'],
  sourceDirectories: ['src'],
  ignorePatterns: [
    'node_modules/**',
    'dist/**',
    'build/**',
    '.git/**',
    '**/*.min.css',
    '**/*.map'
  ],
  whitelist: [
    // Common utility classes that might be used dynamically
    'sr-only',
    'visually-hidden',
    'clearfix',
    // Framework classes
    /^wp-/,
    /^woocommerce-/,
    /^elementor-/,
    // State classes
    /^is-/,
    /^has-/,
    /^js-/,
    // Responsive classes
    /^sm:/,
    /^md:/,
    /^lg:/,
    /^xl:/,
    /^2xl:/
  ],
  blacklist: [],
  dynamicClassPatterns: [
    // Tailwind CSS JIT patterns
    /\b[a-z-]+:\w+/,
    /\b(bg|text|border|ring)-(red|blue|green|yellow|purple|pink|gray|indigo|orange)-(\d{2,3})/,
    /\b(w|h|p|m|px|py|mx|my|pt|pb|pl|pr|mt|mb|ml|mr)-(\d+|auto|full|screen)/,
    /\b(grid-cols|col-span|row-span)-(\d+)/,
    /\b(gap|space)-(x|y)?-(\d+)/,
    
    // CSS-in-JS patterns
    /\$\{[^}]+\}/,
    /`[^`]*\$\{[^}]+\}[^`]*/,
    
    // Template literal classes
    /\$\{.*?\}/,
    
    // Dynamic class construction
    /\b\w+\s*\+\s*['"`]/,
    /['"`]\s*\+\s*\w+/,
    
    // Conditional classes
    /\?\s*['"`][^'"` ]+['"`]/,
    /:\s*['"`][^'"` ]+['"`]/
  ],
  fileExtensions: ['.vue', '.jsx', '.tsx', '.js', '.ts', '.html', '.php', '.twig'],
  reportFormat: 'console',
  outputFile: undefined,
  verbose: false,
  dryRun: false
};

/**
 * Configuration file names to search for
 */
const CONFIG_FILES = [
  'css-pruner.config.js',
  'css-pruner.config.json',
  '.css-prunerrc',
  '.css-prunerrc.json',
  '.css-prunerrc.js'
];

/**
 * Load configuration from file or use defaults
 */
export async function loadConfig(configPath?: string): Promise<Config> {
  let config = { ...DEFAULT_CONFIG };
  
  // If specific config path provided
  if (configPath) {
    if (fileExists(configPath)) {
      const loadedConfig = await loadConfigFile(configPath);
      if (loadedConfig) {
        config = mergeConfig(config, loadedConfig);
      }
    } else {
      throw new Error(`Configuration file not found: ${configPath}`);
    }
  } else {
    // Search for config files in current directory
    const foundConfig = await findConfigFile();
    if (foundConfig) {
      const loadedConfig = await loadConfigFile(foundConfig);
      if (loadedConfig) {
        config = mergeConfig(config, loadedConfig);
      }
    }
  }
  
  // Validate configuration
  validateConfig(config);
  
  return config;
}

/**
 * Find configuration file in current directory
 */
async function findConfigFile(): Promise<string | null> {
  for (const configFile of CONFIG_FILES) {
    if (fileExists(configFile)) {
      return configFile;
    }
  }
  return null;
}

/**
 * Load configuration from a specific file
 */
async function loadConfigFile(filePath: string): Promise<Partial<Config> | null> {
  try {
    const ext = path.extname(filePath);
    
    if (ext === '.js') {
      // For .js files, we need to require them
      const absolutePath = path.resolve(filePath);
      delete require.cache[absolutePath]; // Clear cache
      const configModule = require(absolutePath);
      return configModule.default || configModule;
    } else {
      // For JSON files
      const content = readFile(filePath);
      if (content) {
        return JSON.parse(content);
      }
    }
  } catch (error) {
    console.warn(`Warning: Failed to load config file ${filePath}:`, error);
  }
  
  return null;
}

/**
 * Merge configuration objects
 */
function mergeConfig(defaultConfig: Config, userConfig: Partial<Config>): Config {
  const merged = { ...defaultConfig };
  
  // Simple merge for most properties
  Object.keys(userConfig).forEach(key => {
    const userValue = (userConfig as any)[key];
    
    if (userValue !== undefined) {
      if (Array.isArray(userValue)) {
        // For arrays, replace completely
        (merged as any)[key] = [...userValue];
      } else if (typeof userValue === 'object' && userValue !== null) {
        // For objects, merge recursively
        (merged as any)[key] = { ...(merged as any)[key], ...userValue };
      } else {
        // For primitives, replace
        (merged as any)[key] = userValue;
      }
    }
  });
  
  return merged;
}

/**
 * Validate configuration
 */
function validateConfig(config: Config): void {
  // Validate required fields
  if (!config.cssFiles || config.cssFiles.length === 0) {
    throw new Error('Configuration error: cssFiles cannot be empty');
  }
  
  if (!config.sourceDirectories || config.sourceDirectories.length === 0) {
    throw new Error('Configuration error: sourceDirectories cannot be empty');
  }
  
  // Validate report format
  const validFormats = ['console', 'json', 'html'];
  if (!validFormats.includes(config.reportFormat)) {
    throw new Error(`Configuration error: reportFormat must be one of: ${validFormats.join(', ')}`);
  }
  
  // Validate file extensions
  if (config.fileExtensions.some((ext: string) => !ext.startsWith('.'))) {
    throw new Error('Configuration error: fileExtensions must start with a dot (e.g., ".js")');
  }
  
  // Validate patterns
  try {
    config.whitelist.forEach((pattern: any, index: number) => {
      if (typeof pattern === 'string') {
        // String patterns are OK
      } else if (pattern instanceof RegExp) {
        // Test the regex
        pattern.test('test');
      } else {
        throw new Error(`Invalid whitelist pattern at index ${index}`);
      }
    });
    
    config.blacklist.forEach((pattern: any, index: number) => {
      if (typeof pattern === 'string') {
        // String patterns are OK
      } else if (pattern instanceof RegExp) {
        // Test the regex
        pattern.test('test');
      } else {
        throw new Error(`Invalid blacklist pattern at index ${index}`);
      }
    });
    
    config.dynamicClassPatterns.forEach((pattern: any, index: number) => {
      if (pattern instanceof RegExp) {
        // Test the regex
        pattern.test('test');
      } else {
        throw new Error(`Invalid dynamic class pattern at index ${index}`);
      }
    });
  } catch (error) {
    throw new Error(`Configuration error: ${error}`);
  }
}

/**
 * Create a sample configuration file
 */
export function createSampleConfig(filePath: string = 'css-pruner.config.js'): void {
  const configContent = `module.exports = {
  // CSS files to analyze (glob patterns supported)
  cssFiles: ['**/*.css'],
  
  // Source directories to scan for class usage
  sourceDirectories: ['src'],
  
  // Patterns to ignore
  ignorePatterns: [
    'node_modules/**',
    'dist/**',
    'build/**',
    '.git/**',
    '**/*.min.css',
    '**/*.map'
  ],
  
  // Selectors to always keep (whitelist)
  whitelist: [
    'sr-only',
    'visually-hidden',
    'clearfix',
    /^wp-/,           // WordPress classes
    /^woocommerce-/,  // WooCommerce classes
    /^is-/,           // State classes
    /^has-/,          // State classes
    /^js-/,           // JavaScript hooks
    /^sm:/,           // Responsive prefixes
    /^md:/,
    /^lg:/,
    /^xl:/,
    /^2xl:/
  ],
  
  // Selectors to always remove (blacklist)
  blacklist: [],
  
  // Patterns for dynamic class generation
  dynamicClassPatterns: [
    // Tailwind CSS JIT patterns
    /\\b[a-z-]+:\\w+/,
    /\\b(bg|text|border|ring)-(red|blue|green|yellow|purple|pink|gray|indigo|orange)-(\\d{2,3})/,
    /\\b(w|h|p|m|px|py|mx|my|pt|pb|pl|pr|mt|mb|ml|mr)-(\\d+|auto|full|screen)/,
    
    // CSS-in-JS patterns
    /\\\$\\{[^}]+\\}/,
    /\\\`[^\\\`]*\\\$\\{[^}]+\\}[^\\\`]*\\\`/,
    
    // Dynamic class construction
    /\\b\\w+\\s*\\+\\s*['\"\\\`]/,
    /['\"\\\`]\\s*\\+\\s*\\w+/
  ],
  
  // File extensions to scan
  fileExtensions: ['.vue', '.jsx', '.tsx', '.js', '.ts', '.html', '.php', '.twig'],
  
  // Report format: 'console', 'json', 'html'
  reportFormat: 'console',
  
  // Output file for reports (optional)
  outputFile: undefined,
  
  // Verbose logging
  verbose: false,
  
  // Dry run mode (don't actually remove CSS)
  dryRun: false
};`
  
  fs.writeFileSync(filePath, configContent);
  console.log('Sample configuration created: ' + filePath);
}

/**
 * Get configuration schema for validation
 */
export function getConfigSchema(): any {
  return {
    type: 'object',
    properties: {
      cssFiles: {
        type: 'array',
        items: { type: 'string' },
        minItems: 1
      },
      sourceDirectories: {
        type: 'array',
        items: { type: 'string' },
        minItems: 1
      },
      ignorePatterns: {
        type: 'array',
        items: { type: 'string' }
      },
      whitelist: {
        type: 'array',
        items: {
          oneOf: [
            { type: 'string' },
            { type: 'object' } // RegExp
          ]
        }
      },
      blacklist: {
        type: 'array',
        items: {
          oneOf: [
            { type: 'string' },
            { type: 'object' } // RegExp
          ]
        }
      },
      dynamicClassPatterns: {
        type: 'array',
        items: { type: 'object' } // RegExp
      },
      fileExtensions: {
        type: 'array',
        items: { type: 'string' }
      },
      reportFormat: {
        type: 'string',
        enum: ['console', 'json', 'html']
      },
      outputFile: {
        oneOf: [
          { type: 'string' },
          { type: 'null' }
        ]
      },
      verbose: { type: 'boolean' },
      dryRun: { type: 'boolean' }
    },
    required: ['cssFiles', 'sourceDirectories'],
    additionalProperties: false
  };
}