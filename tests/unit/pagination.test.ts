import { describe, expect, it } from 'vitest';
import { pageItems, paginate, parsePage } from '@/lib/pagination';

describe('parsePage', () => {
  it('should read a positive integer', () => {
    expect(parsePage('3')).toBe(3);
  });

  it('should fall back to page 1 when the value is missing or not a page number', () => {
    expect(parsePage(null)).toBe(1);
    expect(parsePage('')).toBe(1);
    expect(parsePage('abc')).toBe(1);
    expect(parsePage('0')).toBe(1);
    expect(parsePage('-2')).toBe(1);
    expect(parsePage('2.5')).toBe(1);
    expect(parsePage('1e3')).toBe(1);
  });
});

describe('paginate', () => {
  it('should slice 12 per page and report the visible range', () => {
    expect(paginate(33, 1, 12)).toEqual({ page: 1, totalPages: 3, start: 0, end: 12 });
    expect(paginate(33, 2, 12)).toEqual({ page: 2, totalPages: 3, start: 12, end: 24 });
    expect(paginate(33, 3, 12)).toEqual({ page: 3, totalPages: 3, start: 24, end: 33 });
  });

  it('should fit an exact multiple without an empty extra page', () => {
    expect(paginate(24, 2, 12)).toEqual({ page: 2, totalPages: 2, start: 12, end: 24 });
  });

  it('should clamp a page past the end to the last one, never an empty page', () => {
    expect(paginate(33, 99, 12)).toEqual({ page: 3, totalPages: 3, start: 24, end: 33 });
  });

  it('should clamp a page below 1 to the first one', () => {
    expect(paginate(33, 0, 12).page).toBe(1);
    expect(paginate(33, -4, 12).page).toBe(1);
  });

  it('should keep a single page when there are no products', () => {
    expect(paginate(0, 5, 12)).toEqual({ page: 1, totalPages: 1, start: 0, end: 0 });
  });
});

describe('pageItems', () => {
  it('should list every page when there are few', () => {
    expect(pageItems(2, 3)).toEqual([1, 2, 3]);
    expect(pageItems(1, 7)).toEqual([1, 2, 3, 4, 5, 6, 7]);
  });

  it('should collapse distant pages into gaps, keeping first, last and neighbors', () => {
    expect(pageItems(5, 10)).toEqual([1, 'gap', 4, 5, 6, 'gap', 10]);
  });

  it('should not leave a gap next to the first or last page', () => {
    expect(pageItems(1, 10)).toEqual([1, 2, 'gap', 10]);
    expect(pageItems(3, 10)).toEqual([1, 2, 3, 4, 'gap', 10]);
    expect(pageItems(10, 10)).toEqual([1, 'gap', 9, 10]);
  });
});
