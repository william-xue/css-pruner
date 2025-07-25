# CSS Pruner 🌿

A powerful and intelligent CSS cleanup tool that identifies and removes unused CSS selectors from your projects. Built with TypeScript and designed to integrate seamlessly with modern development workflows.

## Features ✨

- 🔍 **Smart Analysis**: Detects unused CSS selectors across your entire codebase
- 🚀 **Framework Support**: Works with Vue, React, Angular, and vanilla HTML/JS
- 🎯 **Dynamic Class Detection**: Handles Tailwind CSS, CSS-in-JS, and template literals
- 📊 **Multiple Report Formats**: Console, JSON, and beautiful HTML reports
- ⚙️ **Highly Configurable**: Extensive configuration options with smart defaults
- 🛡️ **Safe by Default**: Dry-run mode and whitelist support
- 📦 **Zero Dependencies**: Lightweight with minimal external dependencies
- 🔧 **CLI & Programmatic API**: Use as a command-line tool or integrate into your build process

## Installation 📦

```bash
# Using npm
npm install -g @fe-fast/unused-css-pruner

# Using yarn
yarn global add @fe-fast/unused-css-pruner

# Using pnpm
pnpm add -g @fe-fast/unused-css-pruner

# For project-specific usage
npm install --save-dev @fe-fast/unused-css-pruner
```

## Quick Start 🚀

### Command Line Usage

```bash
# Analyze CSS usage
css-pruner analyze --css "src/**/*.css" --source "src"

# Clean CSS files (dry run)
css-pruner clean --css "src/**/*.css" --source "src" --dry-run

# Generate HTML report
css-pruner analyze --css "src/**/*.css" --source "src" --format html --output report.html

# Initialize configuration file
css-pruner init
```

### Programmatic Usage
```typescript
import { analyzeCSSUsage, cleanCSS } from '@fe-fast/unused-css-pruner';

// Analyze CSS usage
const result = await analyzeCSSUsage({
  cssFiles: ['src/**/*.css'],
  sourceDirectories: ['src'],
  config: {
    reportFormat: 'json',
    verbose: true
  }
});

console.log(`Found ${result.stats.unusedSelectors} unused selectors`);

// Clean CSS files
const { result: cleanResult, cleanedFiles } = await cleanCSS({
  cssFiles: ['src/**/*.css'],
  sourceDirectories: ['src'],
  outputDir: 'dist',
  dryRun: false
});
```

## Configuration 🔧

Create a `css-pruner.config.js` file in your project root:

```javascript
module.exports = {
  // CSS files to analyze (glob patterns supported)
  cssFiles: ['src/**/*.css', '!src/**/*.min.css'],
  
  // Source directories to scan for class usage
  sourceDirectories: ['src', 'components'],
  
  // Patterns to ignore
  ignorePatterns: [
    'node_modules/**',
    'dist/**',
    'build/**'
  ],
  
  // Selectors to always keep (whitelist)
  whitelist: [
    'sr-only',
    'visually-hidden',
    /^wp-/,           // WordPress classes
    /^js-/,           // JavaScript hooks
    /^is-/,           // State classes
    /^has-/           // State classes
  ],
  
  // File extensions to scan
  fileExtensions: ['.vue', '.jsx', '.tsx', '.js', '.ts', '.html'],
  
  // Report format: 'console', 'json', 'html'
  reportFormat: 'console',
  
  // Verbose logging
  verbose: false,
  
  // Dry run mode
  dryRun: false
};
```

## CLI Commands 💻

### `analyze`
Analyze CSS files and generate usage reports.

```bash
css-pruner analyze [options]

Options:
  --css <patterns>      CSS files to analyze (glob patterns)
  --source <dirs>       Source directories to scan
  --config <file>       Configuration file path
  --format <format>     Report format (console|json|html)
  --output <file>       Output file for reports
  --verbose             Enable verbose logging
```

### `clean`
Remove unused CSS selectors from files.

```bash
css-pruner clean [options]

Options:
  --css <patterns>      CSS files to clean
  --source <dirs>       Source directories to scan
  --output <dir>        Output directory for cleaned files
  --dry-run             Preview changes without modifying files
  --config <file>       Configuration file path
  --verbose             Enable verbose logging
```

### `init`
Create a sample configuration file.

```bash
css-pruner init [filename]
```

## Framework Integration 🔗

### Webpack Plugin

```javascript
const CSSPrunerPlugin = require('@fe-fast/unused-css-pruner/webpack');

module.exports = {
  plugins: [
    new CSSPrunerPlugin({
      cssFiles: ['dist/**/*.css'],
      sourceDirectories: ['src'],
      outputDir: 'dist'
    })
  ]
};
```

### Vite Plugin

```javascript
import { cssPruner } from '@fe-fast/unused-css-pruner/vite';

export default {
  plugins: [
    cssPruner({
      cssFiles: ['dist/**/*.css'],
      sourceDirectories: ['src']
    })
  ]
};
```

### Rollup Plugin

```javascript
import { cssPruner } from '@fe-fast/unused-css-pruner/rollup';

export default {
  plugins: [
    cssPruner({
      cssFiles: ['dist/**/*.css'],
      sourceDirectories: ['src']
    })
  ]
};
```

## Advanced Features 🎯

### Dynamic Class Detection

CSS Pruner intelligently detects dynamically generated classes:

```javascript
// Tailwind CSS JIT
const className = `bg-${color}-500`;

// CSS-in-JS
const styles = css`
  .${dynamicClass} {
    color: red;
  }
`;

// Template literals
const buttonClass = `btn btn-${variant} ${size}`;
```

### Whitelist Patterns

Protect important selectors from removal:

```javascript
module.exports = {
  whitelist: [
    // Exact matches
    'sr-only',
    'visually-hidden',
    
    // Regular expressions
    /^wp-/,              // WordPress classes
    /^woocommerce-/,     // WooCommerce classes
    /^elementor-/,       // Elementor classes
    /^js-/,              // JavaScript hooks
    /^is-/,              // State classes
    /^has-/,             // State classes
    
    // Responsive prefixes (Tailwind)
    /^sm:/,
    /^md:/,
    /^lg:/,
    /^xl:/,
    /^2xl:/
  ]
};
```

### Custom Dynamic Patterns

Add your own patterns for dynamic class detection:

```javascript
module.exports = {
  dynamicClassPatterns: [
    // Your custom framework patterns
    /\bmyframework-\w+/,
    /\bcomponent-[a-z0-9-]+/,
    
    // Template engine patterns
    /\{\{[^}]+\}\}/,
    /\{%[^%]+%\}/
  ]
};
```

## Report Formats 📊

### Console Report
Colorful, detailed console output with statistics and recommendations.

### JSON Report
Machine-readable format perfect for CI/CD integration:

```json
{
  "summary": {
    "totalSelectors": 1250,
    "usedSelectors": 892,
    "unusedSelectors": 358,
    "potentialSavings": 45600,
    "usageRate": 71.4
  },
  "unusedSelectors": [...],
  "fileBreakdown": [...],
  "recommendations": [...]
}
```

### HTML Report
Beautiful, interactive HTML report with charts and detailed analysis.

## Best Practices 💡

1. **Start with Analysis**: Always run analysis before cleaning
2. **Use Dry Run**: Test with `--dry-run` flag first
3. **Configure Whitelist**: Add framework-specific classes to whitelist
4. **Version Control**: Commit before running cleanup
5. **Test Thoroughly**: Test your application after cleanup
6. **Incremental Cleanup**: Clean one component/page at a time for large projects

## CI/CD Integration 🔄

### GitHub Actions

```yaml
name: CSS Analysis
on: [push, pull_request]

jobs:
  css-analysis:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - uses: actions/setup-node@v2
        with:
          node-version: '18'
      - run: npm install
      - run: npx css-pruner analyze --css "src/**/*.css" --source "src" --format json --output css-report.json
      - uses: actions/upload-artifact@v2
        with:
          name: css-analysis-report
          path: css-report.json
```

### Pre-commit Hook

```json
{
  "husky": {
    "hooks": {
      "pre-commit": "css-pruner analyze --css 'src/**/*.css' --source 'src' && lint-staged"
    }
  }
}
```

## Troubleshooting 🔧

### Common Issues

**Q: Some used classes are marked as unused**
A: Add them to the whitelist or check if they're dynamically generated.

**Q: Analysis is slow on large projects**
A: Use more specific glob patterns and exclude unnecessary directories.

**Q: False positives with framework classes**
A: Configure framework-specific whitelist patterns.

**Q: Dynamic classes not detected**
A: Add custom patterns to `dynamicClassPatterns` configuration.

### Debug Mode

```bash
css-pruner analyze --verbose --css "src/**/*.css" --source "src"
```

## Contributing 🤝

We welcome contributions! Please see our [Contributing Guide](CONTRIBUTING.md) for details.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License 📄

MIT License - see the [LICENSE](LICENSE) file for details.

## Changelog 📝

See [CHANGELOG.md](CHANGELOG.md) for a list of changes.

## Support 💬

- 📖 [Documentation]
- 🐛 [Issue Tracker](https://github.com/william-xue/css-pruner/issues)
- 💬 [Discussions](https://github.com/william-xue/css-pruner/discussions)
- 📧 [Email Support]

---

