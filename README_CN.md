# CSS Pruner 🌿

一个强大且智能的 CSS 清理工具，用于识别和删除项目中未使用的 CSS 选择器。使用 TypeScript 构建，旨在与现代开发工作流程无缝集成。

## 功能特性 ✨

- 🔍 **智能分析**：检测整个代码库中未使用的 CSS 选择器
- 🚀 **框架支持**：支持 Vue、React、Angular 和原生 HTML/JS
- 🎯 **动态类检测**：处理 Tailwind CSS、CSS-in-JS 和模板字面量
- 📊 **多种报告格式**：控制台、JSON 和精美的 HTML 报告
- ⚙️ **高度可配置**：丰富的配置选项和智能默认值
- 🛡️ **默认安全**：试运行模式和白名单支持
- 📦 **零依赖**：轻量级，外部依赖最少
- 🔧 **CLI 和编程 API**：可作为命令行工具使用或集成到构建过程中

## 安装 📦

```bash
# 使用 npm
npm install -g @fe-fast/unused-css-pruner

# 使用 yarn
yarn global add @fe-fast/unused-css-pruner

# 使用 pnpm
pnpm add -g @fe-fast/unused-css-pruner

# 项目特定用法
npm install --save-dev @fe-fast/unused-css-pruner
```

## 快速开始 🚀

### 命令行使用

```bash
# 分析 CSS 使用情况
css-pruner analyze --css "src/**/*.css" --source "src"

# 清理 CSS 文件（试运行）
css-pruner clean --css "src/**/*.css" --source "src" --dry-run

# 生成 HTML 报告
css-pruner analyze --css "src/**/*.css" --source "src" --format html --output report.html

# 初始化配置文件
css-pruner init
```

### 编程使用

```typescript
import { analyzeCSSUsage, cleanCSS } from '@fe-fast/unused-css-pruner';

// 分析 CSS 使用情况
const result = await analyzeCSSUsage({
  cssFiles: ['src/**/*.css'],
  sourceDirectories: ['src'],
  config: {
    reportFormat: 'json',
    verbose: true
  }
});

console.log(`发现 ${result.stats.unusedSelectors} 个未使用的选择器`);

// 清理 CSS 文件
const { result: cleanResult, cleanedFiles } = await cleanCSS({
  cssFiles: ['src/**/*.css'],
  sourceDirectories: ['src'],
  outputDir: 'dist',
  dryRun: false
});
```

## 配置 🔧

在项目根目录创建 `css-pruner.config.js` 文件：

```javascript
module.exports = {
  // 要分析的 CSS 文件（支持 glob 模式）
  cssFiles: ['src/**/*.css', '!src/**/*.min.css'],
  
  // 扫描类使用情况的源目录
  sourceDirectories: ['src', 'components'],
  
  // 要忽略的模式
  ignorePatterns: [
    'node_modules/**',
    'dist/**',
    'build/**'
  ],
  
  // 始终保留的选择器（白名单）
  whitelist: [
    'sr-only',
    'visually-hidden',
    /^wp-/,           // WordPress 类
    /^js-/,           // JavaScript 钩子
    /^is-/,           // 状态类
    /^has-/           // 状态类
  ],
  
  // 要扫描的文件扩展名
  fileExtensions: ['.vue', '.jsx', '.tsx', '.js', '.ts', '.html'],
  
  // 报告格式：'console'、'json'、'html'
  reportFormat: 'console',
  
  // 详细日志
  verbose: false,
  
  // 试运行模式
  dryRun: false
};
```

## CLI 命令 💻

### `analyze`
分析 CSS 文件并生成使用报告。

```bash
css-pruner analyze [选项]

选项：
  --css <patterns>      要分析的 CSS 文件（glob 模式）
  --source <dirs>       要扫描的源目录
  --config <file>       配置文件路径
  --format <format>     报告格式（console|json|html）
  --output <file>       报告输出文件
  --verbose             启用详细日志
```

### `clean`
从文件中删除未使用的 CSS 选择器。

```bash
css-pruner clean [选项]

选项：
  --css <patterns>      要清理的 CSS 文件
  --source <dirs>       要扫描的源目录
  --output <dir>        清理后文件的输出目录
  --dry-run             预览更改而不修改文件
  --config <file>       配置文件路径
  --verbose             启用详细日志
```

### `init`
创建示例配置文件。

```bash
css-pruner init [filename]
```

## 框架集成 🔗

### Webpack 插件

```javascript
const { CSSPrunerPlugin } = require('@fe-fast/unused-css-pruner/webpack');

module.exports = {
  plugins: [
    new CSSPrunerPlugin({
      cssFiles: ['dist/**/*.css'],
      sourceDirectories: ['src'],
      mode: 'analyze', // 或 'clean'
      config: {
        reportFormat: 'console',
        verbose: true
      },
      onAnalysisComplete: (result) => {
        console.log(`发现 ${result.unusedSelectors.length} 个未使用选择器`);
      }
    })
  ]
};
```

### Vite 插件

```javascript
import { cssPruner } from '@fe-fast/unused-css-pruner/vite';

export default {
  plugins: [
    cssPruner({
      cssFiles: ['dist/**/*.css'],
      sourceDirectories: ['src'],
      mode: 'analyze', // 或 'clean'
      config: {
        reportFormat: 'console',
        verbose: true,
        whitelist: [/^btn-/, /^text-/] // 保护动态类
      },
      onAnalysisComplete: (result) => {
        console.log(`发现 ${result.unusedSelectors.length} 个未使用选择器`);
      }
    })
  ]
};
```

### Rollup 插件

```javascript
import { cssPruner } from '@fe-fast/unused-css-pruner/rollup';

export default {
  plugins: [
    cssPruner({
      cssFiles: ['dist/**/*.css'],
      sourceDirectories: ['src'],
      mode: 'analyze', // 或 'clean'
      config: {
        reportFormat: 'console',
        verbose: true
      },
      onAnalysisComplete: (result) => {
        console.log(`发现 ${result.unusedSelectors.length} 个未使用选择器`);
      }
    })
  ]
};
```

> 💡 **插件使用提示**: 
> - `analyze` 模式：安全分析，不修改文件，适合开发环境
> - `clean` 模式：实际清理CSS，建议在生产构建中使用
> - 详细使用指南请参考 [PLUGIN_USAGE.md](./PLUGIN_USAGE.md)
```

## 高级功能 🎯

### 动态类检测

CSS Pruner 智能检测动态生成的类：

```javascript
// Tailwind CSS JIT
const className = `bg-${color}-500`;

// CSS-in-JS
const styles = css`
  .${dynamicClass} {
    color: red;
  }
`;

// 模板字面量
const buttonClass = `btn btn-${variant} ${size}`;
```

### 白名单模式

保护重要选择器不被删除：

```javascript
module.exports = {
  whitelist: [
    // 精确匹配
    'sr-only',
    'visually-hidden',
    
    // 正则表达式
    /^wp-/,              // WordPress 类
    /^woocommerce-/,     // WooCommerce 类
    /^elementor-/,       // Elementor 类
    /^js-/,              // JavaScript 钩子
    /^is-/,              // 状态类
    /^has-/,             // 状态类
    
    // 响应式前缀（Tailwind）
    /^sm:/,
    /^md:/,
    /^lg:/,
    /^xl:/,
    /^2xl:/
  ]
};
```

### 自定义动态模式

为动态类检测添加自己的模式：

```javascript
module.exports = {
  dynamicClassPatterns: [
    // 自定义框架模式
    /\bmyframework-\w+/,
    /\bcomponent-[a-z0-9-]+/,
    
    // 模板引擎模式
    /\{\{[^}]+\}\}/,
    /\{%[^%]+%\}/
  ]
};
```

## 报告格式 📊

### 控制台报告
彩色、详细的控制台输出，包含统计信息和建议。

### JSON 报告
机器可读格式，非常适合 CI/CD 集成：

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

### HTML 报告
精美的交互式 HTML 报告，包含图表和详细分析。

## 最佳实践 💡

1. **从分析开始**：清理前始终先运行分析
2. **使用试运行**：首先使用 `--dry-run` 标志测试
3. **配置白名单**：将框架特定的类添加到白名单
4. **版本控制**：运行清理前先提交
5. **彻底测试**：清理后彻底测试应用程序
6. **增量清理**：对于大型项目，一次清理一个组件/页面

## CI/CD 集成 🔄

### GitHub Actions

```yaml
name: CSS 分析
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

### Pre-commit 钩子

```json
{
  "husky": {
    "hooks": {
      "pre-commit": "css-pruner analyze --css 'src/**/*.css' --source 'src' && lint-staged"
    }
  }
}
```

## 故障排除 🔧

### 常见问题

**问：一些已使用的类被标记为未使用**
答：将它们添加到白名单或检查它们是否是动态生成的。

**问：大型项目分析缓慢**
答：使用更具体的 glob 模式并排除不必要的目录。

**问：框架类的误报**
答：配置框架特定的白名单模式。

**问：未检测到动态类**
答：将自定义模式添加到 `dynamicClassPatterns` 配置。

### 调试模式

```bash
css-pruner analyze --verbose --css "src/**/*.css" --source "src"
```

## 贡献 🤝

我们欢迎贡献！请查看我们的[贡献指南](CONTRIBUTING.md)了解详情。

1. Fork 仓库
2. 创建功能分支（`git checkout -b feature/amazing-feature`）
3. 提交更改（`git commit -m 'Add amazing feature'`）
4. 推送到分支（`git push origin feature/amazing-feature`）
5. 打开 Pull Request

## 许可证 📄

MIT 许可证 - 详情请参阅 [LICENSE](LICENSE) 文件。

## 更新日志 📝

查看 [CHANGELOG.md](CHANGELOG.md) 了解更改列表。

## 支持 💬

- 📖 [文档]
- 🐛 [问题跟踪器](https://github.com/william-xue/css-pruner/issues)
- 💬 [讨论](https://github.com/william-xue/css-pruner/discussions)
- 📧 [邮件支持]

---
