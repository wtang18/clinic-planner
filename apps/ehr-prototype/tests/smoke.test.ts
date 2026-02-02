/**
 * Smoke Test
 *
 * Basic test to verify the test infrastructure is working.
 */

import { describe, it, expect, vi } from 'vitest';
import {
  createTestPatient,
  createTestChartItem,
  createTestSuggestion,
  createTestToDoItem,
  generateId,
  resetIdCounter,
  today,
  dateFromNow,
} from './fixtures';

describe('Test Infrastructure', () => {
  describe('Vitest Setup', () => {
    it('runs tests', () => {
      expect(true).toBe(true);
    });

    it('has access to vi mock utilities', () => {
      const mockFn = vi.fn();
      mockFn('test');
      expect(mockFn).toHaveBeenCalledWith('test');
    });

    it('has jest-dom matchers', () => {
      const div = document.createElement('div');
      div.textContent = 'Hello';
      document.body.appendChild(div);
      expect(div).toHaveTextContent('Hello');
      document.body.removeChild(div);
    });
  });

  describe('Browser API Mocks', () => {
    it('has matchMedia mock', () => {
      const mq = window.matchMedia('(min-width: 768px)');
      expect(mq.matches).toBe(false);
      expect(mq.addEventListener).toBeDefined();
    });

    it('has ResizeObserver mock', () => {
      const observer = new ResizeObserver(() => {});
      expect(observer.observe).toBeDefined();
      expect(observer.disconnect).toBeDefined();
    });

    it('has localStorage mock', () => {
      localStorage.setItem('test', 'value');
      expect(localStorage.getItem('test')).toBe('value');
    });

    it('clears localStorage between tests', () => {
      // This should be null because previous test's data was cleared
      expect(localStorage.getItem('previousTest')).toBeNull();
      localStorage.setItem('previousTest', 'data');
    });

    it('has clipboard mock', async () => {
      await navigator.clipboard.writeText('test');
      expect(navigator.clipboard.writeText).toHaveBeenCalledWith('test');
    });

    it('has deterministic UUID generation', () => {
      resetIdCounter();
      const id1 = generateId('test');
      const id2 = generateId('test');
      expect(id1).toBe('test-1');
      expect(id2).toBe('test-2');
    });
  });

  describe('Test Fixtures', () => {
    it('creates test patient', () => {
      const patient = createTestPatient();
      expect(patient.id).toBeDefined();
      expect(patient.mrn).toBeDefined();
      expect(patient.demographics.firstName).toBe('Test');
    });

    it('creates test patient with overrides', () => {
      const patient = createTestPatient({
        demographics: {
          firstName: 'John',
          lastName: 'Doe',
          dateOfBirth: new Date('1990-05-15'),
          age: 34,
          gender: 'male',
        },
      });
      expect(patient.demographics.firstName).toBe('John');
      expect(patient.demographics.gender).toBe('male');
    });

    it('creates test chart item', () => {
      const item = createTestChartItem();
      expect(item.id).toBeDefined();
      expect(item.category).toBe('chief-complaint');
      expect(item.status).toBe('pending-review');
    });

    it('creates test suggestion', () => {
      const suggestion = createTestSuggestion();
      expect(suggestion.id).toBeDefined();
      expect(suggestion.type).toBe('chart-item');
      expect(suggestion.confidence).toBe(0.85);
    });

    it('creates test todo item', () => {
      const todo = createTestToDoItem({ title: 'Call patient' });
      expect(todo.id).toBeDefined();
      expect(todo.title).toBe('Call patient');
      expect(todo.status).toBe('pending');
    });
  });

  describe('Date Helpers', () => {
    it('returns today in YYYY-MM-DD format', () => {
      const todayStr = today();
      expect(todayStr).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    });

    it('returns future date', () => {
      const tomorrow = dateFromNow(1);
      const todayStr = today();
      // Compare date strings to avoid timezone issues
      expect(tomorrow > todayStr).toBe(true);
    });

    it('returns past date', () => {
      const yesterday = dateFromNow(-1);
      const todayStr = today();
      // Compare date strings to avoid timezone issues
      expect(yesterday < todayStr).toBe(true);
    });
  });
});
