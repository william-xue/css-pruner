import * as csstree from 'csstree';
import * as fs from 'fs';
import * as path from 'path';
import { CSSRule, FileInfo } from '../types';

export class CSSParser {
  /**
   * Parse CSS files and extract all rules
   */
  async parseCSSFiles(cssFiles: string[]): Promise<CSSRule[]> {
    const rules: CSSRule[] = [];
    
    for (const file of cssFiles) {
      try {
        const content = fs.readFileSync(file, 'utf-8');
        const fileRules = await this.parseCSSContent(content, file);
        rules.push(...fileRules);
      } catch (error) {
        console.warn(`Warning: Could not parse CSS file ${file}:`, error);
      }
    }
    
    return rules;
  }
  
  /**
   * Parse CSS content and extract rules
   */
  async parseCSSContent(content: string, filePath: string): Promise<CSSRule[]> {
    const rules: CSSRule[] = [];
    
    try {
      const ast = csstree.parse(content, {
        positions: true,
        filename: filePath
      });
      
      csstree.walk(ast, (node: any, item: any, list: any) => {
        if (node.type === 'Rule') {
          const selectors = this.extractSelectors(node);
          const properties = this.extractProperties(node);
          const position = node.loc;
          
          for (const selector of selectors) {
            rules.push({
              selector: selector.trim(),
              properties,
              file: filePath,
              line: position?.start.line || 0,
              column: position?.start.column || 0,
              size: this.calculateRuleSize(selector, properties)
            });
          }
        }
        
        // Handle @media rules
        if (node.type === 'Atrule' && node.name === 'media') {
          const mediaQuery = csstree.generate(node.prelude);
          this.parseMediaRules(node, filePath, mediaQuery, rules);
        }
        
        // Handle @keyframes rules
        if (node.type === 'Atrule' && node.name === 'keyframes') {
          const keyframeName = csstree.generate(node.prelude);
          this.parseKeyframeRules(node, filePath, keyframeName, rules);
        }
      });
      
    } catch (error) {
      console.warn(`Warning: Could not parse CSS content in ${filePath}:`, error);
    }
    
    return rules;
  }
  
  /**
   * Extract selectors from a CSS rule node
   */
  private extractSelectors(ruleNode: any): string[] {
    const selectors: string[] = [];
    
    if (ruleNode.prelude && ruleNode.prelude.type === 'SelectorList') {
      ruleNode.prelude.children.forEach((selector: any) => {
        const selectorText = csstree.generate(selector);
        selectors.push(selectorText);
      });
    }
    
    return selectors;
  }
  
  /**
   * Extract properties from a CSS rule node
   */
  private extractProperties(ruleNode: any): string {
    if (ruleNode.block && ruleNode.block.type === 'Block') {
      return csstree.generate(ruleNode.block);
    }
    return '';
  }
  
  /**
   * Parse rules inside @media queries
   */
  private parseMediaRules(mediaNode: any, filePath: string, mediaQuery: string, rules: CSSRule[]): void {
    if (mediaNode.block && mediaNode.block.type === 'Block') {
      csstree.walk(mediaNode.block, (node: any) => {
        if (node.type === 'Rule') {
          const selectors = this.extractSelectors(node);
          const properties = this.extractProperties(node);
          const position = node.loc;
          
          for (const selector of selectors) {
            rules.push({
              selector: selector.trim(),
              properties,
              file: filePath,
              line: position?.start.line || 0,
              column: position?.start.column || 0,
              size: this.calculateRuleSize(selector, properties),
              mediaQuery
            });
          }
        }
      });
    }
  }
  
  /**
   * Parse rules inside @keyframes
   */
  private parseKeyframeRules(keyframeNode: any, filePath: string, keyframeName: string, rules: CSSRule[]): void {
    if (keyframeNode.block && keyframeNode.block.type === 'Block') {
      csstree.walk(keyframeNode.block, (node: any) => {
        if (node.type === 'Rule') {
          const selectors = this.extractSelectors(node);
          const properties = this.extractProperties(node);
          const position = node.loc;
          
          for (const selector of selectors) {
            rules.push({
              selector: selector.trim(),
              properties,
              file: filePath,
              line: position?.start.line || 0,
              column: position?.start.column || 0,
              size: this.calculateRuleSize(selector, properties),
              keyframe: keyframeName
            });
          }
        }
      });
    }
  }
  
  /**
   * Calculate the size of a CSS rule in bytes
   */
  private calculateRuleSize(selector: string, properties: string): number {
    return Buffer.byteLength(`${selector}${properties}`, 'utf8');
  }
  
  /**
   * Extract all class names from CSS selectors
   */
  extractClassNames(rules: CSSRule[]): Set<string> {
    const classNames = new Set<string>();
    
    for (const rule of rules) {
      const classes = this.extractClassNamesFromSelector(rule.selector);
      classes.forEach(className => classNames.add(className));
    }
    
    return classNames;
  }
  
  /**
   * Extract class names from a single CSS selector
   */
  private extractClassNamesFromSelector(selector: string): string[] {
    const classNames: string[] = [];
    
    // Match class selectors (.class-name)
    const classRegex = /\.([a-zA-Z_-][a-zA-Z0-9_-]*)/g;
    let match;
    
    while ((match = classRegex.exec(selector)) !== null) {
      classNames.push(match[1]);
    }
    
    return classNames;
  }
  
  /**
   * Extract all ID names from CSS selectors
   */
  extractIdNames(rules: CSSRule[]): Set<string> {
    const idNames = new Set<string>();
    
    for (const rule of rules) {
      const ids = this.extractIdNamesFromSelector(rule.selector);
      ids.forEach(idName => idNames.add(idName));
    }
    
    return idNames;
  }
  
  /**
   * Extract ID names from a single CSS selector
   */
  private extractIdNamesFromSelector(selector: string): string[] {
    const idNames: string[] = [];
    
    // Match ID selectors (#id-name)
    const idRegex = /#([a-zA-Z_-][a-zA-Z0-9_-]*)/g;
    let match;
    
    while ((match = idRegex.exec(selector)) !== null) {
      idNames.push(match[1]);
    }
    
    return idNames;
  }
  
  /**
   * Check if a selector is a pseudo-class or pseudo-element
   */
  isPseudoSelector(selector: string): boolean {
    return /::?[a-zA-Z-]+/.test(selector);
  }
  
  /**
   * Check if a selector contains attribute selectors
   */
  hasAttributeSelector(selector: string): boolean {
    return /\[[^\]]+\]/.test(selector);
  }
  
  /**
   * Normalize selector for comparison
   */
  normalizeSelector(selector: string): string {
    return selector
      .replace(/\s+/g, ' ')
      .replace(/\s*([>+~])\s*/g, '$1')
      .trim();
  }
}