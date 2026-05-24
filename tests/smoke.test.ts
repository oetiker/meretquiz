import { describe, it, expect } from 'vitest';

describe('test infrastructure', () => {
  it('runs vitest with happy-dom (localStorage available)', () => {
    localStorage.setItem('smoke', 'ok');
    expect(localStorage.getItem('smoke')).toBe('ok');
  });
});
