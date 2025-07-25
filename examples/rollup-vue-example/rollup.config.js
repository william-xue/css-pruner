import { defineConfig } from 'rollup';
import vue from 'rollup-plugin-vue';
import { nodeResolve } from '@rollup/plugin-node-resolve';
import replace from '@rollup/plugin-replace';
import terser from '@rollup/plugin-terser';
import css from 'rollup-plugin-css-only';
import serve from 'rollup-plugin-serve';
import livereload from 'rollup-plugin-livereload';

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
    production && terser()
  ],
  
  watch: {
    clearScreen: false
  }
});