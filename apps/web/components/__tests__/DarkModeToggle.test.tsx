import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { DarkModeToggle } from '../DarkModeToggle';

describe('DarkModeToggle', () => {
  beforeEach(() => {
    document.documentElement.classList.add('dark');
    localStorage.clear();
  });

  it('renders a toggle button', () => {
    render(<DarkModeToggle />);
    const button = screen.getByRole('button');
    expect(button).toBeInTheDocument();
  });

  it('has appropriate aria-label', () => {
    render(<DarkModeToggle />);
    const button = screen.getByRole('button');
    expect(button).toHaveAttribute('aria-label', 'Switch to light mode');
  });

  it('toggles dark class on html element when clicked', () => {
    render(<DarkModeToggle />);
    const button = screen.getByRole('button');

    // Start in dark mode
    expect(document.documentElement.classList.contains('dark')).toBe(true);

    fireEvent.click(button);
    expect(document.documentElement.classList.contains('dark')).toBe(false);
    expect(localStorage.getItem('cosmos-theme')).toBe('light');

    fireEvent.click(button);
    expect(document.documentElement.classList.contains('dark')).toBe(true);
    expect(localStorage.getItem('cosmos-theme')).toBe('dark');
  });
});
