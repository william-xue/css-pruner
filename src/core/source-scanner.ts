import * as fs from 'fs';
import * as path from 'path';
import * as glob from 'glob';
import { FileInfo, DynamicClassPattern } from '../types.js';

export class SourceScanner {
  private dynamicPatterns: DynamicClassPattern[] = [
    // Tailwind JIT patterns
    {
      pattern: /class(?:Name)?=["'`]([^"'`]*\$\{[^}]+\}[^"'`]*)["'`]/g,
      description: 'Template literal class names',
      framework: 'tailwind'
    },
    {
      pattern: /class(?:Name)?=["'`]([^"'`]*(?:bg|text|border|p|m|w|h)-\[[^\]]+\][^"'`]*)["'`]/g,
      description: 'Tailwind arbitrary values',
      framework: 'tailwind'
    },
    // CSS-in-JS patterns
    {
      pattern: /styled\.[a-zA-Z]+`([^`]*)`/g,
      description: 'Styled-components',
      framework: 'custom'
    },
    {
      pattern: /css`([^`]*)`/g,
      description: 'CSS template literals',
      framework: 'custom'
    }
  ];
  
  /**
   * Scan source directories for class usage
   */
  async scanSourceDirectories(directories: string[]): Promise<Set<string>> {
    const usedClasses = new Set<string>();
    
    for (const directory of directories) {
      const files = await this.getSourceFiles(directory);
      
      for (const file of files) {
        try {
          const content = fs.readFileSync(file, 'utf-8');
          const fileInfo: FileInfo = {
            path: file,
            content,
            type: this.getFileType(file)
          };
          
          const classes = await this.extractClassesFromFile(fileInfo);
          classes.forEach(className => usedClasses.add(className));
        } catch (error) {
          console.warn(`Warning: Could not scan file ${file}:`, error);
        }
      }
    }
    
    return usedClasses;
  }
  
  /**
   * Get all source files from directories
   */
  private async getSourceFiles(directory: string): Promise<string[]> {
    const patterns = [
      '**/*.{js,jsx,ts,tsx,vue,html,htm}',
      '**/*.{php,py,rb,java,cs}' // Additional server-side templates
    ];
    
    const files: string[] = [];
    
    for (const pattern of patterns) {
      try {
        const matches = await glob.glob(pattern, {
          cwd: directory,
          absolute: true,
          ignore: [
            '**/node_modules/**',
            '**/dist/**',
            '**/build/**',
            '**/.git/**',
            '**/coverage/**'
          ]
        });
        files.push(...matches);
      } catch (error) {
        console.warn(`Warning: Could not scan directory ${directory}:`, error);
      }
    }
    
    return [...new Set(files)]; // Remove duplicates
  }
  
  /**
   * Extract classes from a single file
   */
  async extractClassesFromFile(fileInfo: FileInfo): Promise<Set<string>> {
    const classes = new Set<string>();
    
    // Extract static class names
    const staticClasses = this.extractStaticClasses(fileInfo.content);
    staticClasses.forEach(className => classes.add(className));
    
    // Extract dynamic class names
    const dynamicClasses = this.extractDynamicClasses(fileInfo.content);
    dynamicClasses.forEach(className => classes.add(className));
    
    // File type specific extraction
    switch (fileInfo.type) {
      case 'vue':
        const vueClasses = this.extractVueClasses(fileInfo.content);
        vueClasses.forEach(className => classes.add(className));
        break;
      case 'jsx':
      case 'tsx':
        const jsxClasses = this.extractJSXClasses(fileInfo.content);
        jsxClasses.forEach(className => classes.add(className));
        break;
      case 'html':
        const htmlClasses = this.extractHTMLClasses(fileInfo.content);
        htmlClasses.forEach(className => classes.add(className));
        break;
    }
    
    return classes;
  }
  
  /**
   * Extract static class names using regex patterns
   */
  private extractStaticClasses(content: string): Set<string> {
    const classes = new Set<string>();
    
    // Common class attribute patterns
    const patterns = [
      /class(?:Name)?=["']([^"']*)["']/g,
      /class(?:Name)?=\{["']([^"']*)["']\}/g,
      /class(?:Name)?=\{`([^`]*)`\}/g,
      /@apply\s+([^;\n]+)/g, // Tailwind @apply
      /classList\.(?:add|toggle)\(["']([^"']*)["']\)/g // JavaScript classList
    ];
    
    for (const pattern of patterns) {
      let match;
      while ((match = pattern.exec(content)) !== null) {
        const classString = match[1];
        if (classString) {
          const individualClasses = classString.split(/\s+/).filter(Boolean);
          individualClasses.forEach(className => {
            if (this.isValidClassName(className)) {
              classes.add(className);
            }
          });
        }
      }
    }
    
    return classes;
  }
  
  /**
   * Extract dynamic class names using patterns
   */
  private extractDynamicClasses(content: string): Set<string> {
    const classes = new Set<string>();
    
    for (const pattern of this.dynamicPatterns) {
      let match;
      while ((match = pattern.pattern.exec(content)) !== null) {
        const classString = match[1];
        if (classString) {
          // For template literals, try to extract static parts
          const staticParts = this.extractStaticPartsFromTemplate(classString);
          staticParts.forEach(className => {
            if (this.isValidClassName(className)) {
              classes.add(className);
            }
          });
        }
      }
    }
    
    return classes;
  }
  
  /**
   * Extract classes from Vue Single File Components
   */
  private extractVueClasses(content: string): Set<string> {
    const classes = new Set<string>();
    
    // Extract from template section
    const templateMatch = content.match(/<template[^>]*>([\s\S]*?)<\/template>/i);
    if (templateMatch) {
      const templateContent = templateMatch[1];
      const templateClasses = this.extractStaticClasses(templateContent);
      templateClasses.forEach(className => classes.add(className));
    }
    
    // Extract from script section
    const scriptMatch = content.match(/<script[^>]*>([\s\S]*?)<\/script>/i);
    if (scriptMatch) {
      const scriptContent = scriptMatch[1];
      const scriptClasses = this.extractStaticClasses(scriptContent);
      scriptClasses.forEach(className => classes.add(className));
    }
    
    return classes;
  }
  
  /**
   * Extract classes from JSX/TSX files
   */
  private extractJSXClasses(content: string): Set<string> {
    const classes = new Set<string>();
    
    // JSX className patterns
    const jsxPatterns = [
      /className=["']([^"']*)["']/g,
      /className=\{["']([^"']*)["']\}/g,
      /className=\{`([^`]*)`\}/g,
      /className=\{([^}]+)\}/g // Complex expressions
    ];
    
    for (const pattern of jsxPatterns) {
      let match;
      while ((match = pattern.exec(content)) !== null) {
        const classString = match[1];
        if (classString) {
          const individualClasses = classString.split(/\s+/).filter(Boolean);
          individualClasses.forEach(className => {
            if (this.isValidClassName(className)) {
              classes.add(className);
            }
          });
        }
      }
    }
    
    return classes;
  }
  
  /**
   * Extract classes from HTML files
   */
  private extractHTMLClasses(content: string): Set<string> {
    const classes = new Set<string>();
    
    const classPattern = /class=["']([^"']*)["']/g;
    let match;
    
    while ((match = classPattern.exec(content)) !== null) {
      const classString = match[1];
      if (classString) {
        const individualClasses = classString.split(/\s+/).filter(Boolean);
        individualClasses.forEach(className => {
          if (this.isValidClassName(className)) {
            classes.add(className);
          }
        });
      }
    }
    
    return classes;
  }
  
  /**
   * Extract static parts from template literals
   */
  private extractStaticPartsFromTemplate(template: string): string[] {
    const classes: string[] = [];
    
    // Remove template literal expressions and extract static parts
    const staticParts = template.split(/\$\{[^}]+\}/);
    
    for (const part of staticParts) {
      const partClasses = part.split(/\s+/).filter(Boolean);
      classes.push(...partClasses);
    }
    
    return classes;
  }
  
  /**
   * Check if a string is a valid CSS class name
   */
  private isValidClassName(className: string): boolean {
    // Basic validation for CSS class names
    return /^[a-zA-Z_-][a-zA-Z0-9_-]*$/.test(className) && className.length > 0;
  }
  
  /**
   * Get file type from extension
   */
  private getFileType(filePath: string): FileInfo['type'] {
    const ext = path.extname(filePath).toLowerCase();
    
    switch (ext) {
      case '.css':
        return 'css';
      case '.js':
        return 'js';
      case '.ts':
        return 'ts';
      case '.jsx':
        return 'jsx';
      case '.tsx':
        return 'tsx';
      case '.vue':
        return 'vue';
      case '.html':
      case '.htm':
        return 'html';
      default:
        return 'js'; // Default fallback
    }
  }
  
  /**
   * Add custom dynamic class pattern
   */
  addDynamicPattern(pattern: DynamicClassPattern): void {
    this.dynamicPatterns.push(pattern);
  }
  
  /**
   * Get all dynamic patterns
   */
  getDynamicPatterns(): DynamicClassPattern[] {
    return [...this.dynamicPatterns];
  }
}