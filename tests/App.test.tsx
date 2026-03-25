import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import App from '../src/App';

describe('App Component', () => {
  it('renders without crashing and displays the wordmark', () => {
    render(<App />);
    const wordmark = screen.getByText('PMO');
    expect(wordmark).toBeDefined();
  });
});
