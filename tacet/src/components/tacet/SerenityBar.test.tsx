import { render, screen } from '@testing-library/react';
import { SerenityBar } from './SerenityBar';
import { describe, it, expect } from 'vitest';

describe('SerenityBar', () => {
  it('renders with progressbar role and correct accessibility attributes', () => {
    render(<SerenityBar score={50} color="#ff0000" />);
    const progressbar = screen.getByRole('progressbar');
    expect(progressbar).toBeDefined();
    expect(progressbar.getAttribute('aria-valuenow')).toBe('50');
    expect(progressbar.getAttribute('aria-valuemin')).toBe('0');
    expect(progressbar.getAttribute('aria-valuemax')).toBe('100');
  });

  it('applies the correct width and background color to the inner bar', () => {
    render(<SerenityBar score={75} color="rgb(0, 255, 0)" />);
    const progressbar = screen.getByRole('progressbar');
    const innerBar = progressbar.firstElementChild as HTMLElement;

    expect(innerBar.style.width).toBe('75%');
    expect(innerBar.style.backgroundColor).toBe('rgb(0, 255, 0)');
  });

  it('applies additional classNames when provided', () => {
    render(<SerenityBar score={50} color="#000" className="mt-4 custom-class" />);
    const progressbar = screen.getByRole('progressbar');
    expect(progressbar.className).toContain('mt-4 custom-class');
  });

  it('handles edge case score of 0', () => {
    render(<SerenityBar score={0} color="#000" />);
    const progressbar = screen.getByRole('progressbar');
    expect(progressbar.getAttribute('aria-valuenow')).toBe('0');

    const innerBar = progressbar.firstElementChild as HTMLElement;
    expect(innerBar.style.width).toBe('0%');
  });

  it('handles edge case score of 100', () => {
    render(<SerenityBar score={100} color="#000" />);
    const progressbar = screen.getByRole('progressbar');
    expect(progressbar.getAttribute('aria-valuenow')).toBe('100');

    const innerBar = progressbar.firstElementChild as HTMLElement;
    expect(innerBar.style.width).toBe('100%');
  });
});
