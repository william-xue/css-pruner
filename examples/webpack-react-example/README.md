# Webpack + React CSS Pruner Example

This example demonstrates how to use the CSS Pruner with a React application built using Webpack.

## Project Structure

```
webpack-react-example/
├── public/
│   └── index.html          # HTML template
├── src/
│   ├── components/
│   │   ├── Button.jsx      # Button component
│   │   └── Card.jsx        # Card component
│   ├── App.jsx             # Main App component
│   ├── index.js            # Entry point
│   └── styles.css          # CSS with redundant styles
├── css-pruner.config.js    # CSS Pruner configuration
├── webpack.config.js       # Webpack configuration
└── package.json
```

## Features

- **React 18** with functional components and hooks
- **Webpack 5** with CSS extraction
- **Intentionally redundant CSS** to demonstrate pruning
- **CSS Pruner integration** with custom configuration

## Getting Started

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Build the project:**
   ```bash
   npm run build
   ```

3. **Run CSS analysis:**
   ```bash
   npm run css-prune
   ```

4. **Start development server (optional):**
   ```bash
   npm run dev
   ```

## What to Expect

The `styles.css` file contains:
- **Used styles**: Classes that are actually used in the React components
- **Unused styles**: Many utility classes, animations, and components that are never referenced

After running `npm run css-prune`, you should see:
- A console report showing unused CSS classes
- An HTML report in `./css-analysis/report.html`
- A JSON report in `./css-analysis/report.json`

## Key Files

### CSS Pruner Configuration (`css-pruner.config.js`)

Configures the CSS Pruner to:
- Analyze the built CSS file (`./dist/styles.css`)
- Scan React components for used classes
- Generate multiple report formats
- Ignore certain utility classes

### Webpack Configuration (`webpack.config.js`)

Sets up:
- React JSX compilation with Babel
- CSS extraction with MiniCssExtractPlugin
- Development server configuration

## Example Output

The CSS Pruner should detect numerous unused classes such as:
- Utility classes (`.m-1`, `.p-2`, `.text-center`, etc.)
- Unused button variants (`.btn-success`, `.btn-warning`, etc.)
- Animation classes (`.fade-in`, `.bounce`, etc.)
- Layout utilities (`.col-6`, `.d-flex`, etc.)
- And many more!

This demonstrates how the tool can help identify and remove unused CSS to reduce bundle size.