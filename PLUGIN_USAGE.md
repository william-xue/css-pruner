# CSS Pruner 插件集成指南

CSS Pruner 现在支持作为构建工具插件使用，可以无缝集成到 Vite、Webpack 和 Rollup 构建流程中。

## 🚀 快速开始

### 安装

```bash
npm install @fe-fast/unused-css-pruner --save-dev
```

## 📦 插件集成

### Vite 插件

```javascript
// vite.config.js
import { defineConfig } from 'vite'
import { cssPruner } from '@fe-fast/unused-css-pruner/vite'

export default defineConfig({
  plugins: [
    // 其他插件...
    cssPruner({
      cssFiles: ['dist/**/*.css'],
      sourceDirectories: ['src'],
      mode: 'analyze', // 或 'clean'
      config: {
        reportFormat: 'console',
        verbose: true,
        whitelist: [/^btn-/, /^text-/]
      },
      onAnalysisComplete: (result) => {
        console.log(`发现 ${result.unusedSelectors.length} 个未使用的选择器`);
      }
    })
  ]
})
```

### Webpack 插件

```javascript
// webpack.config.js
const { CSSPrunerPlugin } = require('@fe-fast/unused-css-pruner/webpack');

module.exports = {
  // 其他配置...
  plugins: [
    // 其他插件...
    new CSSPrunerPlugin({
      cssFiles: ['dist/**/*.css'],
      sourceDirectories: ['src'],
      mode: 'analyze',
      config: {
        reportFormat: 'console',
        verbose: true
      },
      onAnalysisComplete: (result) => {
        console.log(`Webpack 构建: 发现 ${result.unusedSelectors.length} 个未使用选择器`);
      }
    })
  ]
};
```

### Rollup 插件

```javascript
// rollup.config.js
import { cssPruner } from '@fe-fast/unused-css-pruner/rollup';

export default {
  // 其他配置...
  plugins: [
    // 其他插件...
    cssPruner({
      cssFiles: ['dist/**/*.css'],
      sourceDirectories: ['src'],
      mode: 'analyze',
      config: {
        reportFormat: 'console',
        verbose: true
      }
    })
  ]
};
```

## ⚙️ 配置选项

### 插件选项

| 选项 | 类型 | 默认值 | 描述 |
|------|------|--------|------|
| `cssFiles` | `string[]` | `['dist/**/*.css']` | CSS 文件匹配模式 |
| `sourceDirectories` | `string[]` | `['src']` | 源代码目录 |
| `outputDir` | `string` | `'dist'` | 输出目录 |
| `mode` | `'analyze' \| 'clean'` | `'analyze'` | 运行模式 |
| `config` | `Partial<Config>` | `{}` | CSS Pruner 配置 |
| `onAnalysisComplete` | `function` | `undefined` | 分析完成回调 |

### 运行模式

#### `analyze` 模式（推荐）
- 分析 CSS 使用情况
- 生成详细报告
- 不修改原文件
- 适合开发和 CI/CD 流程

#### `clean` 模式
- 实际清理未使用的 CSS
- 自动创建备份文件
- 适合生产构建
- 需要谨慎使用

## 🎯 最佳实践

### 1. 开发环境使用 analyze 模式

```javascript
// 开发环境配置
cssPruner({
  mode: 'analyze',
  config: {
    reportFormat: 'console',
    verbose: true
  }
})
```

### 2. 生产环境可选择 clean 模式

```javascript
// 生产环境配置
cssPruner({
  mode: process.env.NODE_ENV === 'production' ? 'clean' : 'analyze',
  config: {
    backup: true, // clean 模式下自动备份
    verbose: false
  }
})
```

### 3. 配置白名单保护动态类

```javascript
cssPruner({
  config: {
    whitelist: [
      /^btn-/, // 按钮样式
      /^text-/, // 文本样式
      /^bg-/, // 背景样式
      /^hover:/, // Tailwind hover 状态
      /^focus:/, // Tailwind focus 状态
      'dynamic-class' // 特定类名
    ]
  }
})
```

### 4. 使用回调函数处理结果

```javascript
cssPruner({
  onAnalysisComplete: (result) => {
    // 自定义处理逻辑
    const unusedCount = result.unusedSelectors.length;
    const totalSize = result.unusedSelectors.reduce((acc, sel) => acc + sel.size, 0);
    
    console.log(`📊 CSS 分析结果:`);
    console.log(`   未使用选择器: ${unusedCount}`);
    console.log(`   可节省空间: ${(totalSize / 1024).toFixed(2)}KB`);
    
    // 可以发送到监控系统或生成自定义报告
    if (unusedCount > 100) {
      console.warn('⚠️  发现大量未使用的 CSS，建议进行清理');
    }
  }
})
```

## 📁 示例项目

项目中提供了完整的示例配置：

- **Vite + Vue**: `examples/vite-vue-example/vite.config.plugin.js`
- **Webpack + React**: `examples/webpack-react-example/webpack.config.plugin.js`
- **Rollup + Vue**: `examples/rollup-vue-example/rollup.config.plugin.js`

## 🔧 与 CLI 工具的区别

| 特性 | CLI 工具 | 插件集成 |
|------|----------|----------|
| 使用方式 | 命令行调用 | 构建流程集成 |
| 时机 | 手动执行 | 自动执行 |
| 配置 | 配置文件 | 构建配置 |
| 报告 | 文件输出 | 控制台 + 回调 |
| 适用场景 | 独立分析 | 持续集成 |

## 🚨 注意事项

1. **插件执行时机**: 插件在构建完成后执行，确保 CSS 文件已生成
2. **文件路径**: 使用相对于项目根目录的路径
3. **性能影响**: analyze 模式对构建性能影响较小，clean 模式会增加构建时间
4. **备份策略**: clean 模式下建议启用自动备份
5. **白名单配置**: 根据项目特点配置合适的白名单规则

## 🔄 迁移指南

### 从 CLI 迁移到插件

1. **保留现有配置文件**（可选）
2. **在构建配置中添加插件**
3. **调整配置选项**
4. **测试构建流程**

### 混合使用

可以同时使用 CLI 工具和插件：
- CLI 用于独立分析和手动清理
- 插件用于构建流程集成和持续监控

这样既保持了灵活性，又实现了自动化集成。