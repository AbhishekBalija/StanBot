# Frontend Testing Documentation

## Overview

This directory contains tests for the frontend application. We use the following testing stack:

- **Vitest**: Test runner optimized for Vite projects
- **React Testing Library**: For testing React components
- **jsdom**: For simulating a DOM environment

## Test Structure

- `setup.js`: Global test setup and configuration
- `components/`: Tests for React components
- `utils/`: Tests for utility functions

## Running Tests

You can run tests using the following npm scripts:

```bash
# Run all tests once
npm test

# Run tests in watch mode (for development)
npm run test:watch

# Run tests with coverage report
npm run test:coverage
```

## Writing Tests

### Component Tests

Component tests should focus on:

1. Rendering correctly with different props
2. User interactions (clicks, typing, etc.)
3. State changes
4. Conditional rendering

Example:

```jsx
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import MyComponent from '../components/MyComponent';

test('component renders correctly', () => {
  render(<MyComponent />);
  expect(screen.getByText('Expected Text')).toBeInTheDocument();
});
```

### Utility Tests

Utility tests should focus on:

1. Correct output for various inputs
2. Edge cases
3. Error handling

## Best Practices

1. Test behavior, not implementation
2. Use data-testid attributes sparingly
3. Prefer user-centric queries (getByRole, getByText) over testid-based queries
4. Mock external dependencies
5. Keep tests simple and focused