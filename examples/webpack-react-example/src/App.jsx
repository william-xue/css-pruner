import React, { useState } from 'react';
import Button from './components/Button';
import Card from './components/Card';

function App() {
  const [count, setCount] = useState(0);

  return (
    <div className="app">
      <header className="header">
        <h1 className="title">CSS Pruner Demo - Webpack + React</h1>
        <p className="subtitle">This example demonstrates CSS pruning with intentionally redundant styles</p>
      </header>
      
      <main className="main-content">
        <Card>
          <h2 className="card-title">Counter Example</h2>
          <p className="counter-display">Count: {count}</p>
          <div className="button-group">
            <Button onClick={() => setCount(count + 1)} variant="primary">
              Increment
            </Button>
            <Button onClick={() => setCount(count - 1)} variant="secondary">
              Decrement
            </Button>
            <Button onClick={() => setCount(0)} variant="danger">
              Reset
            </Button>
          </div>
        </Card>
        
        <Card>
          <h2 className="card-title">Information</h2>
          <p className="info-text">
            This project includes many unused CSS classes that should be detected by the CSS Pruner.
            Check the styles.css file to see all the defined styles, and run the CSS analysis to see which ones are unused.
          </p>
        </Card>
      </main>
      
      <footer className="footer">
        <p className="footer-text">Built with Webpack + React</p>
      </footer>
    </div>
  );
}

export default App;