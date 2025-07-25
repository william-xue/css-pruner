// Plugin exports
export { cssPruner as vitePlugin } from './vite.js';
export { CSSPrunerPlugin as WebpackPlugin } from './webpack.js';
export { cssPruner as rollupPlugin } from './rollup.js';

// Re-export with specific names for easier imports
export { cssPruner as vite } from './vite.js';
export { CSSPrunerPlugin as webpack } from './webpack.js';
export { cssPruner as rollup } from './rollup.js';

// Type exports
export type { VitePluginOptions } from './vite.js';
export type { WebpackPluginOptions } from './webpack.js';
export type { RollupPluginOptions } from './rollup.js';