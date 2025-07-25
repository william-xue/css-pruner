#!/usr/bin/env node

import { Command } from 'commander';
import chalk from 'chalk';
import { CSSPruner } from './core/pruner';
import { PrunerConfig } from './types';
import * as fs from 'fs';
import * as path from 'path';

const program = new Command();

program
  .name('css-pruner')
  .description('A powerful CSS pruning tool that removes unused styles')
  .version('1.0.0');

program
  .command('analyze')
  .description('Analyze CSS files and find unused styles')
  .option('-c, --css <files...>', 'CSS files to analyze')
  .option('-s, --src <dirs...>', 'Source directories to scan for usage')
  .option('-o, --output <file>', 'Output report file')
  .option('--dry-run', 'Preview mode - don\'t modify files')
  .option('--format <type>', 'Report format (json|html|console)', 'console')
  .option('--config <file>', 'Configuration file path')
  .action(async (options) => {
    try {
      console.log(chalk.blue('🔍 Starting CSS analysis...'));
      
      // Load config
      let config: Partial<PrunerConfig> = {};
      if (options.config && fs.existsSync(options.config)) {
        config = JSON.parse(fs.readFileSync(options.config, 'utf-8'));
      }
      
      // Merge CLI options with config
      const finalConfig: PrunerConfig = {
        cssFiles: options.css || config.cssFiles || [],
        sourceDirectories: options.src || config.sourceDirectories || ['./src'],
        outputFile: options.output || config.outputFile,
        dryRun: options.dryRun || config.dryRun || false,
        reportFormat: options.format || config.reportFormat || 'console',
        whitelist: config.whitelist || [],
        blacklist: config.blacklist || [],
        supportDynamicClasses: config.supportDynamicClasses || true,
        supportCSSInJS: config.supportCSSInJS || true,
        componentLevel: config.componentLevel || false
      };
      
      if (finalConfig.cssFiles.length === 0) {
        console.error(chalk.red('❌ No CSS files specified. Use -c option or config file.'));
        process.exit(1);
      }
      
      const pruner = new CSSPruner(finalConfig);
      const result = await pruner.analyze();
      
      console.log(chalk.green(`✅ Analysis complete!`));
      console.log(chalk.cyan(`📊 Found ${result.unusedSelectors.length} unused selectors`));
      console.log(chalk.cyan(`💾 Potential savings: ${result.potentialSavings} bytes`));
      
      if (finalConfig.outputFile) {
        console.log(chalk.blue(`📄 Report saved to: ${finalConfig.outputFile}`));
      }
      
    } catch (error) {
      console.error(chalk.red('❌ Error:'), error instanceof Error ? error.message : error);
      process.exit(1);
    }
  });

program
  .command('clean')
  .description('Remove unused CSS styles')
  .option('-c, --css <files...>', 'CSS files to clean')
  .option('-s, --src <dirs...>', 'Source directories to scan for usage')
  .option('--backup', 'Create backup files before cleaning')
  .option('--config <file>', 'Configuration file path')
  .action(async (options) => {
    try {
      console.log(chalk.blue('🧹 Starting CSS cleaning...'));
      
      // Load config
      let config: Partial<PrunerConfig> = {};
      if (options.config && fs.existsSync(options.config)) {
        config = JSON.parse(fs.readFileSync(options.config, 'utf-8'));
      }
      
      const finalConfig: PrunerConfig = {
        cssFiles: options.css || config.cssFiles || [],
        sourceDirectories: options.src || config.sourceDirectories || ['./src'],
        dryRun: false,
        reportFormat: 'console',
        whitelist: config.whitelist || [],
        blacklist: config.blacklist || [],
        supportDynamicClasses: config.supportDynamicClasses || true,
        supportCSSInJS: config.supportCSSInJS || true,
        componentLevel: config.componentLevel || false,
        backup: options.backup || config.backup || false
      };
      
      if (finalConfig.cssFiles.length === 0) {
        console.error(chalk.red('❌ No CSS files specified. Use -c option or config file.'));
        process.exit(1);
      }
      
      const pruner = new CSSPruner(finalConfig);
      const result = await pruner.clean();
      
      console.log(chalk.green(`✅ Cleaning complete!`));
      console.log(chalk.cyan(`🗑️  Removed ${result.removedSelectors.length} unused selectors`));
      console.log(chalk.cyan(`💾 Saved ${result.bytesSaved} bytes`));
      
    } catch (error) {
      console.error(chalk.red('❌ Error:'), error instanceof Error ? error.message : error);
      process.exit(1);
    }
  });

program
  .command('init')
  .description('Initialize configuration file')
  .option('-f, --file <name>', 'Config file name', 'css-pruner.config.json')
  .action((options) => {
    const configPath = path.resolve(options.file);
    
    if (fs.existsSync(configPath)) {
      console.log(chalk.yellow(`⚠️  Config file already exists: ${configPath}`));
      return;
    }
    
    const defaultConfig: PrunerConfig = {
      cssFiles: ['./dist/**/*.css'],
      sourceDirectories: ['./src'],
      reportFormat: 'console',
      dryRun: false,
      whitelist: [],
      blacklist: [],
      supportDynamicClasses: true,
      supportCSSInJS: true,
      componentLevel: false,
      backup: true
    };
    
    fs.writeFileSync(configPath, JSON.stringify(defaultConfig, null, 2));
    console.log(chalk.green(`✅ Created config file: ${configPath}`));
  });

program.parse();