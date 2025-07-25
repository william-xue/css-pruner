# Vite + Vue CSS Pruner Example

This example demonstrates how to use the CSS Pruner with a Vue 3 application built using Vite.

## Project Structure

```
vite-vue-example/
├── src/
│   ├── components/
│   │   ├── Button.vue      # Button component
│   │   └── Card.vue        # Card component
│   ├── App.vue             # Main App component
│   ├── main.js             # Entry point
│   └── style.css           # CSS with redundant styles
├── css-pruner.config.js    # CSS Pruner configuration
├── vite.config.js          # Vite configuration
├── index.html              # HTML template
└── package.json
```

## Features

- **Vue 3** with Composition API
- **Vite** for fast development and building
- **Interactive components** (Counter and Todo List)
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

5. **Preview production build (optional):**
   ```bash
   npm run preview
   ```

## What to Expect

The `style.css` file contains:
- **Used styles**: Classes that are actually used in the Vue components
- **Unused styles**: Extensive utility classes, layout systems, animations, and components that are never referenced

After running `npm run css-prune`, you should see:
- A console report showing unused CSS classes
- An HTML report in `./css-analysis/report.html`
- A JSON report in `./css-analysis/report.json`

## Key Files

### CSS Pruner Configuration (`css-pruner.config.js`)

Configures the CSS Pruner to:
- Analyze the built CSS file (`./dist/assets/style.css`)
- Scan Vue components and JavaScript files for used classes
- Generate multiple report formats
- Ignore Vue transition classes and utility classes

### Vite Configuration (`vite.config.js`)

Sets up:
- Vue 3 plugin for SFC compilation
- Custom CSS output naming for consistent analysis
- Build optimization settings

## Interactive Features

The example includes:
- **Counter**: Increment/decrement/reset functionality
- **Todo List**: Add, complete, and remove todos
- **Statistics**: Real-time counts of todos
- **Responsive Design**: Works on different screen sizes

## Example Output

The CSS Pruner should detect numerous unused classes such as:
- Grid system classes (`.col-1`, `.col-2`, etc.)
- Utility classes (`.m-1`, `.p-2`, `.text-center`, etc.)
- Unused button variants (`.btn-warning`, `.btn-info`, etc.)
- Animation classes (`.animate-spin`, `.animate-bounce`, etc.)
- Flexbox utilities (`.justify-center`, `.items-center`, etc.)
- Color utilities (`.text-red-500`, `.bg-blue-100`, etc.)
- And many more!

This demonstrates how the tool can help identify and remove unused CSS to significantly reduce bundle size in a modern Vue application.