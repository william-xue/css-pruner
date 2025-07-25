# CSS Pruner Examples

This directory contains three comprehensive examples demonstrating how to use the CSS Pruner tool with different build systems and frameworks. Each example includes intentionally redundant CSS classes to showcase the effectiveness of unused CSS detection.

## Available Examples

### 1. Webpack + React Example

**Location**: `./webpack-react-example/`

**Tech Stack**:
- React 18 with functional components and hooks
- Webpack 5 with CSS extraction
- Modern JavaScript (ES6+)

**Features**:
- Interactive counter application
- Reusable Button and Card components
- Extensive unused CSS classes for testing
- HTML and JSON report generation

**Quick Start**:
```bash
cd webpack-react-example
npm install
npm run build
npm run analyze-css
```

### 2. Vite + Vue Example

**Location**: `./vite-vue-example/`

**Tech Stack**:
- Vue 3 with Composition API
- Vite for fast development and building
- Single File Components (SFC)

**Features**:
- Counter and todo list functionality
- Dynamic component props and computed properties
- Vue-specific CSS class patterns
- Real-time development with HMR

**Quick Start**:
```bash
cd vite-vue-example
npm install
npm run build
npm run analyze-css
```

### 3. Rollup + Vue Example

**Location**: `./rollup-vue-example/`

**Tech Stack**:
- Vue 3 with Composition API
- Rollup for optimized bundling
- Advanced component architecture

**Features**:
- Interactive dashboard with metrics
- Complete task management system
- Priority-based filtering and sorting
- Comprehensive CSS utility classes

**Quick Start**:
```bash
cd rollup-vue-example
npm install
npm run build
npm run analyze-css
```

## Common CSS Patterns Tested

All examples include these types of unused CSS classes:

### Layout & Grid Systems
- Bootstrap-style grid classes (`.container-fluid`, `.row`, `.col-*`)
- Flexbox utilities (`.d-flex`, `.justify-content-*`, `.align-items-*`)
- Position utilities (`.position-absolute`, `.position-fixed`)

### Component Variants
- Button variants (`.btn-warning`, `.btn-info`, `.btn-outline-*`)
- Card variants (`.card-primary`, `.card-secondary`)
- Size modifiers (`.btn-large`, `.card-shadow-large`)

### Utility Classes
- Spacing utilities (`.m-*`, `.p-*`, `.mt-*`, `.mb-*`)
- Typography utilities (`.text-center`, `.font-weight-bold`)
- Color utilities (`.bg-primary`, `.text-danger`)
- Border utilities (`.border`, `.rounded-*`)

### Animations & Effects
- CSS animations (`.animate-fadeIn`, `.animate-bounce`)
- Transition effects (`.card-hoverable`)
- Shadow utilities (`.shadow-sm`, `.shadow-lg`)

### Form Elements
- Form controls (`.form-control`, `.form-group`)
- Input variants (`.form-check`, `.form-select`)
- Validation states (`.is-valid`, `.is-invalid`)

## Expected Results

Each example should detect **60-80% unused CSS classes**, demonstrating:

1. **High Detection Accuracy**: Correctly identifies unused classes while preserving used ones
2. **Framework Compatibility**: Works with React, Vue, and different build systems
3. **Build Tool Integration**: Seamlessly integrates with Webpack, Vite, and Rollup
4. **Report Generation**: Produces detailed HTML and JSON reports

## Typical Output Statistics

```
📊 CSS Analysis Results:

📁 CSS Files Analyzed: 1
📄 Total CSS Rules: ~200-300
✅ Used CSS Classes: ~60-80
❌ Unused CSS Classes: ~120-200
📉 Potential Size Reduction: 60-75%

🎯 Most Common Unused Categories:
- Utility classes (spacing, colors, typography)
- Component variants (buttons, cards)
- Layout systems (grid, flexbox)
- Animation classes
- Form styling
```

## Usage Workflow

For any example:

1. **Install Dependencies**:
   ```bash
   npm install
   ```

2. **Build the Project**:
   ```bash
   npm run build
   ```
   This creates the production bundle with extracted CSS.

3. **Run CSS Analysis**:
   ```bash
   npm run analyze-css
   ```
   This analyzes the built CSS and generates reports.

4. **Review Results**:
   - Check console output for summary
   - Open `css-analysis/report.html` for detailed view
   - Review `css-analysis/report.json` for programmatic access

5. **Preview Application** (optional):
   ```bash
   npm run preview  # or npm start for webpack
   ```

## Configuration Files

Each example includes:

- **`css-pruner.config.js`**: CSS Pruner configuration
- **Build config**: `webpack.config.js`, `vite.config.js`, or `rollup.config.js`
- **`package.json`**: Dependencies and scripts
- **`README.md`**: Example-specific documentation

## Customization

You can modify these examples to test:

1. **Different CSS Frameworks**: Add Bootstrap, Tailwind, or custom frameworks
2. **Dynamic Class Names**: Test with computed or conditional classes
3. **CSS-in-JS**: Integrate with styled-components or emotion
4. **Custom Ignore Patterns**: Configure specific classes to preserve
5. **Multiple CSS Files**: Test with component-scoped styles

## Troubleshooting

### Common Issues

1. **Build Fails**: Ensure all dependencies are installed with `npm install`
2. **No CSS Generated**: Check that the build process completes successfully
3. **Analysis Errors**: Verify CSS file paths in `css-pruner.config.js`
4. **Missing Reports**: Ensure output directory has write permissions

### Debug Mode

Add `--verbose` flag to see detailed analysis:
```bash
npx unused-css-pruner --config css-pruner.config.js --verbose
```

## Contributing

To add new examples or improve existing ones:

1. Follow the established project structure
2. Include both used and unused CSS classes
3. Add comprehensive README documentation
4. Test with the CSS Pruner tool
5. Ensure consistent npm script naming

These examples provide a solid foundation for understanding and testing the CSS Pruner tool across different development environments.