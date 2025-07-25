import { defineConfig } from 'rollup';
import vue from 'rollup-plugin-vue';
import { nodeResolve } from '@rollup/plugin-node-resolve';
import replace from '@rollup/plugin-replace';
import terser from '@rollup/plugin-terser';
import css from 'rollup-plugin-css-only';
import serve from 'rollup-plugin-serve';
import livereload from 'rollup-plugin-livereload';
import { cssPruner } from '../../dist/plugins/rollup.js';

const production = !process.env.ROLLUP_WATCH;

export default defineConfig({
  input: 'src/main.js',
  output: {
    file: 'dist/bundle.js',
    format: 'iife',
    name: 'app',
    sourcemap: !production
  },
  plugins: [
    vue({
      css: false // We'll handle CSS separately
    }),
    
    css({
      output: 'styles.css'
    }),
    
    nodeResolve({
      browser: true,
      exportConditions: ['browser']
    }),
    
    replace({
      'process.env.NODE_ENV': JSON.stringify(production ? 'production' : 'development'),
      '__VUE_OPTIONS_API__': true,
      '__VUE_PROD_DEVTOOLS__': false,
      preventAssignment: true
    }),
    
    // Development plugins
    !production && serve({
      open: true,
      contentBase: ['dist', 'public'],
      port: 3000
    }),
    
    !production && livereload('dist'),
    
    // Production plugins
    production && terser(),
    
    // CSS Pruner plugin - only run in production
    production && cssPruner({
      cssFiles: ['dist/styles.css'],
      sourceDirectories: ['src'],
      mode: 'analyze',
      config: {
        reportFormat: 'console',
        verbose: true,
        whitelist: [
          // Keep Vue and utility classes
          /^v-/,
          /^vue-/,
          /^btn-/,
          /^card-/
        ]
      },
      onAnalysisComplete: (result) => {
        console.log(`🎯 Rollup build: Found ${result.unusedSelectors.length} unused selectors`);
        const savings = result.unusedSelectors.reduce((acc, sel) => acc + sel.size, 0);
        console.log(`💾 Potential savings: ${(savings / 1024).toFixed(2)}KB`);
      }
    })
  ].filter(Boolean), // Remove falsy plugins
  
  watch: {
    clearScreen: false
  }
});

// Alternative configuration for clean mode
// Use environment variable: CLEAN_CSS=true npm run build


// if (process.env.CLEAN_CSS === 'true') {
//   // Replace the analyze plugin with clean plugin
//   const plugins = config.plugins;
//   const prunerIndex = plugins.findIndex(p => p && p.name === 'css-pruner');
//   if (prunerIndex !== -1) {
//     plugins[prunerIndex] = cssPruner({
//       cssFiles: ['dist/**/*.css'],
//       sourceDirectories: ['src'],
//       mode: 'clean',
//       config: {
//         backup: true,
//         verbose: true
//       }
//     });
//   }
// }
