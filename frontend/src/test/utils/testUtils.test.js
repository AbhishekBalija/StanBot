import { describe, it, expect } from 'vitest';
import { formatDate, truncateText } from './formatUtils';


describe('Utility Functions', () => {
  describe('formatDate', () => {
    it('formats a date correctly', () => {
      const testDate = new Date('2023-01-15T12:30:00');
      const formattedDate = formatDate(testDate);
      
      // The exact format might vary by environment, so we'll check for parts
      expect(formattedDate).toContain('2023');
      expect(formattedDate).toContain('Jan');
      expect(formattedDate).toContain('15');
    });

    it('returns empty string for null or undefined input', () => {
      expect(formatDate(null)).toBe('');
      expect(formatDate(undefined)).toBe('');
    });
  });

  describe('truncateText', () => {
    it('truncates text longer than maxLength', () => {
      const longText = 'This is a very long text that should be truncated';
      expect(truncateText(longText, 20)).toBe('This is a very long ...');
    });

    it('does not truncate text shorter than maxLength', () => {
      const shortText = 'Short text';
      expect(truncateText(shortText, 20)).toBe(shortText);
    });

    it('handles null or undefined input', () => {
      expect(truncateText(null)).toBe(null);
      expect(truncateText(undefined)).toBe(undefined);
    });

    it('uses default maxLength if not provided', () => {
      const longText = 'a'.repeat(60);
      expect(truncateText(longText)).toBe('a'.repeat(50) + '...');
    });
  });
});