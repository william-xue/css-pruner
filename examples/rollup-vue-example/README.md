# Rollup + Vue CSS Pruner Example

This example demonstrates how to use the CSS Pruner tool with a Rollup + Vue 3 project. The project includes intentionally redundant CSS classes to showcase the effectiveness of unused CSS detection.

## Project Structure

```
rollup-vue-example/
├── public/
│   └── index.html              # HTML template
├── src/
│   ├── components/
│   │   ├── Button.vue          # Reusable button component
│   │   └── Card.vue            # Reusable card component
│   ├── App.vue                 # Main Vue component
│   ├── main.js                 # Application entry point
│   └── styles.css              # CSS with used and unused styles
├── css-pruner.config.js        # CSS Pruner configuration
├── rollup.config.js            # Rollup configuration
├── package.json                # Dependencies and scripts
└── README.md                   # This file
```

## Features

- **Vue 3 Composition API**: Modern Vue development with reactive state management
- **Rollup Build System**: Fast and efficient bundling with tree-shaking
- **CSS Extraction**: Separate CSS file generation for analysis
- **Interactive Dashboard**: Real-time metrics with counters and user management
- **Task Management**: Complete todo application with priority levels and filtering
- **Extensive CSS**: Mix of used and unused styles for comprehensive testing

## Usage

### 1. Install Dependencies

```bash
npm install
```

### 2. Build the Project

```bash
npm run build
```

This will create a `dist/` directory with:
- `bundle.js` - The compiled JavaScript
- `styles.css` - The extracted CSS file
- `index.html` - The HTML file

### 3. Run CSS Analysis

```bash
npm run analyze-css
```

This will:
- Analyze the built CSS file (`dist/styles.css`)
- Scan source files for used CSS classes
- Generate reports in the `css-analysis/` directory
- Display results in the console

### 4. Preview the Application

```bash
npm run preview
```

This starts a local server to preview the built application.

## Expected Output

The CSS Pruner should detect numerous unused CSS classes, including:

### Unused Layout Classes
- `.container-fluid`, `.row`, `.col-*` (Bootstrap-style grid system)
- Various flex utilities (`.flex-row`, `.justify-content-*`, etc.)
- Position utilities (`.position-absolute`, `.position-fixed`, etc.)

### Unused Button Variants
- `.btn-warning`, `.btn-info`, `.btn-light`, `.btn-dark`
- `.btn-outline-*` variants
- `.btn-large`, `.btn-block`, `.btn-rounded`

### Unused Utility Classes
- Spacing utilities (`.m-*`, `.p-*`, `.mt-*`, `.mb-*`)
- Text utilities (`.text-center`, `.text-uppercase`, `.font-weight-*`)
- Background colors (`.bg-primary`, `.bg-secondary`, etc.)
- Border utilities (`.border`, `.rounded-*`, etc.)

### Unused Animations
- `.animate-fadeIn`, `.animate-slideInLeft`, `.animate-bounce`
- Keyframe animations (`@keyframes fadeIn`, `@keyframes bounce`)

### Unused Form Styles
- `.form-group`, `.form-label`, `.form-control`
- `.form-check`, `.form-check-input`

### Unused Card Variants
- `.card-primary`, `.card-secondary`, `.card-success`
- `.card-shadow-small`, `.card-shadow-large`
- `.card-hoverable`, `.card-no-border`

## Key Files

### CSS Pruner Configuration (`css-pruner.config.js`)

Configures the tool to:
- Analyze `./dist/styles.css`
- Scan Vue, JS, TS, and HTML files
- Generate console, HTML, and JSON reports
- Ignore Vue transition classes and vendor prefixes

### Rollup Configuration (`rollup.config.js`)

Sets up:
- Vue 3 compilation with SFC support
- CSS extraction to separate file
- Development server with hot reload
- Production optimizations and minification

## Interactive Features

The application includes several interactive elements:

1. **Dashboard Metrics**:
   - Page views counter with increment button
   - Users online with add/remove controls
   - Revenue tracker with increment functionality

2. **Task Management**:
   - Add new tasks with priority levels
   - Filter tasks by status and priority
   - Mark tasks as complete/incomplete
   - Delete tasks

3. **Project Statistics**:
   - Real-time task counts
   - Completion statistics
   - Priority distribution

All these features use only a subset of the available CSS classes, making the unused class detection very apparent.

## Reports

After running the analysis, check the `css-analysis/` directory for:
- `report.html` - Interactive HTML report
- `report.json` - Machine-readable JSON data
- Console output with summary statistics

The reports will show the significant amount of unused CSS that can be safely removed to optimize your bundle size.