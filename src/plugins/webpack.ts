import { analyzeCSSUsage, cleanCSS } from '../index.js';
import type { Config } from '../types.js';
import path from 'path';
import fs from 'fs/promises';

// Conditional types for Webpack plugin
type WebpackCompiler = {
  hooks: {
    afterEmit: {
      tapAsync: (name: string, callback: (compilation: any, callback: (error?: Error) => void) => void) => void;
    };
  };
};

type WebpackPluginInstance = {
  apply: (compiler: WebpackCompiler) => void;
};

export interface WebpackPluginOptions {
  cssFiles?: string[];
  sourceDirectories?: string[];
  outputDir?: string;
  mode?: 'analyze' | 'clean';
  config?: Partial<Config>;
  onAnalysisComplete?: (result: any) => void;
}

export class CSSPrunerPlugin implements WebpackPluginInstance {
  private options: Required<WebpackPluginOptions>;

  constructor(options: WebpackPluginOptions = {}) {
    this.options = {
      cssFiles: ['dist/**/*.css'],
      sourceDirectories: ['src'],
      outputDir: 'dist',
      mode: 'analyze',
      config: {},
      onAnalysisComplete: () => {},
      ...options
    };
  }

  apply(compiler: WebpackCompiler): void {
    const pluginName = 'CSSPrunerPlugin';

    compiler.hooks.afterEmit.tapAsync(pluginName, async (compilation, callback) => {
      try {
        console.log('🔍 CSS Pruner: Starting analysis...');
        
        const {
          cssFiles,
          sourceDirectories,
          outputDir,
          mode,
          config,
          onAnalysisComplete
        } = this.options;

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
        
        callback();
      } catch (error) {
        console.error('❌ CSS Pruner error:', error);
        callback(error as Error);
      }
    });
  }
}

export default CSSPrunerPlugin;