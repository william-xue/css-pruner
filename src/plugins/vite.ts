import { analyzeCSSUsage, cleanCSS } from '../index.js';
import type { Config } from '../types.js';
import path from 'path';
import fs from 'fs/promises';

// Conditional type for Vite plugin
type VitePlugin = {
  name: string;
  apply?: 'build' | 'serve' | ((config: any, env: any) => boolean);
  enforce?: 'pre' | 'post';
  closeBundle?: () => void | Promise<void>;
};

export interface VitePluginOptions {
  cssFiles?: string[];
  sourceDirectories?: string[];
  outputDir?: string;
  mode?: 'analyze' | 'clean';
  config?: Partial<Config>;
  onAnalysisComplete?: (result: any) => void;
}

export function cssPruner(options: VitePluginOptions = {}): VitePlugin {
  const {
    cssFiles = ['dist/**/*.css'],
    sourceDirectories = ['src'],
    outputDir = 'dist',
    mode = 'analyze',
    config = {},
    onAnalysisComplete
  } = options;

  return {
    name: 'css-pruner',
    apply: 'build',
    enforce: 'post',
    
    async closeBundle() {
      try {
        console.log('🔍 CSS Pruner: Starting analysis...');
        
        if (mode === 'analyze') {
          const result = await analyzeCSSUsage({
            cssFiles,
            sourceDirectories,
            config
          });
          
          console.log(`📊 Analysis complete: ${result.unusedSelectors.length} unused selectors found`);
          
          if (onAnalysisComplete) {
            onAnalysisComplete(result);
          }
          
          // Generate report
          if (config.reportFormat === 'json' && config.outputFile) {
            await fs.writeFile(
              path.resolve(config.outputFile),
              JSON.stringify(result, null, 2)
            );
            console.log(`📄 Report saved to: ${config.outputFile}`);
          }
        } else if (mode === 'clean') {
          const { result, cleanedFiles } = await cleanCSS({
            cssFiles,
            sourceDirectories,
            outputDir,
            config
          });
          
          console.log(`✨ CSS cleaned: ${result.unusedSelectors.length} selectors removed`);
          console.log(`📁 Files processed: ${cleanedFiles.length}`);
          
          if (onAnalysisComplete) {
            onAnalysisComplete({ result, cleanedFiles });
          }
        }
      } catch (error) {
        console.error('❌ CSS Pruner error:', error);
        throw error;
      }
    }
  };
}

export default cssPruner;