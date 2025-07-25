module.exports = {
  // CSS files to analyze
  cssFiles: ['./dist/styles.css'],
  
  // Source directories to scan for used CSS classes
  sourceDirectories: [
    './src'
  ],
  
  // Output directory for reports
  outputDir: './css-analysis',
  
  // Enable different reporters
  reporters: {
    console: true,
    html: true,
    json: true
  },
  
  // Ignore patterns (CSS selectors to keep even if unused)
  ignore: [
    // Keep utility classes that might be used dynamically
    /^\.(sr-only|visually-hidden)$/,
    // Keep vendor prefixes
    /^-webkit-/,
    /^-moz-/,
    /^-ms-/
  ],
  
  // Minimum usage threshold (0-1, where 1 means 100% usage required)
  threshold: 0
};