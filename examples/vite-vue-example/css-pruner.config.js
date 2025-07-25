export default {
  // CSS files to analyze
  cssFiles: ['./dist/assets/style.css'],
  
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
    /^-ms-/,
    // Keep Vue transition classes
    /^\.(v-enter|v-leave)/,
    // Keep @keyframes animations
    /^@keyframes/,
    // Keep important layout components
    /^\.(card|btn|header|title|subtitle)/,
    // Keep animation classes
    /^\.(animate-|transition-)/,
    // Keep percentage selectors in keyframes
    /^(0%|25%|50%|75%|100%)$/
  ],
  
  // Minimum usage threshold (0-1, where 1 means 100% usage required)
  threshold: 0,
  
  // Dry run mode - don't actually modify files
  dryRun: true
};