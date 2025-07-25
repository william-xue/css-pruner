import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { cssPruner } from '../../dist/plugins/vite.js'

export default defineConfig({
  plugins: [
    vue(),
    // CSS Pruner plugin - analyze mode
    cssPruner({
      cssFiles: ['dist/assets/style.css'],
      sourceDirectories: ['src'],
      //mode: 'analyze',
      mode: 'clean', // 测试修复后的clean模式
      config: {
        reportFormat: 'console',
        verbose: true,
        backup: true,
        whitelist: [
          // Keep only specific classes that are actually used
          'btn-primary',
          'btn-secondary', 
          'btn-success',
          'btn-danger',
          'btn-small'
        ]
      },
      onAnalysisComplete: (result) => {
        if (result && result.unusedSelectors) {
          console.log(`🎯 Found ${result.unusedSelectors.length} unused selectors`);
          console.log(`💾 Potential savings: ${(result.unusedSelectors.reduce((acc, sel) => acc + sel.size, 0) / 1024).toFixed(2)}KB`);
        } else {
          console.log('🎯 CSS analysis completed');
        }
      }
    })
  ],
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
    rollupOptions: {
      output: {
        assetFileNames: (assetInfo) => {
          if (assetInfo.name && assetInfo.name.endsWith('.css')) {
            return 'assets/style.css'
          }
          return 'assets/[name]-[hash][extname]'
        }
      }
    }
  }
})

// Alternative configuration for clean mode
// Uncomment to enable CSS cleaning during build
// export const cleanConfig = defineConfig({
//   plugins: [
//     vue(),
//     cssPruner({
//       cssFiles: ['dist/**/*.css'],
//       sourceDirectories: ['src'],
//       mode: 'clean',
//       config: {
//         backup: true,
//         verbose: true
//       }
//     })
//   ],
//   build: {
//     outDir: 'dist',
//     assetsDir: 'assets'
//   }
// })
