/**
 * TourSystem
 *
 * Manages guided tours for onboarding and feature discovery.
 * Tracks tour completion state and controls tour navigation.
 */

import { Platform } from 'react-native';

// ============================================================================
// Types
// ============================================================================

export interface TourStep {
  id: string;
  targetTestId: string;
  title: string;
  content: string;
  position: 'top' | 'bottom' | 'left' | 'right';
  spotlightPadding?: number;
  waitForTestId?: string;
}

export interface Tour {
  id: string;
  name: string;
  description: string;
  steps: TourStep[];
  prerequisites?: string[];
  category: 'onboarding' | 'feature' | 'workflow';
}

export interface TourState {
  activeTour: Tour | null;
  currentStep: number;
  completedTours: string[];
  isRunning: boolean;
}

type TourListener = (state: TourState) => void;

// ============================================================================
// Storage Helpers (platform-agnostic)
// ============================================================================

const STORAGE_KEY = 'ehr-completed-tours';

async function loadFromStorage(): Promise<string[]> {
  try {
    if (Platform.OS === 'web' && typeof localStorage !== 'undefined') {
      const stored = localStorage.getItem(STORAGE_KEY);
      return stored ? JSON.parse(stored) : [];
    }
    // For native, would use AsyncStorage - currently returns empty
    return [];
  } catch {
    return [];
  }
}

async function saveToStorage(tours: string[]): Promise<void> {
  try {
    if (Platform.OS === 'web' && typeof localStorage !== 'undefined') {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(tours));
    }
    // For native, would use AsyncStorage
  } catch {
    // Ignore storage errors
  }
}

// ============================================================================
// TourSystem
// ============================================================================

export class TourSystem {
  private tours: Map<string, Tour> = new Map();
  private state: TourState;
  private listeners: Set<TourListener> = new Set();

  constructor() {
    this.state = {
      activeTour: null,
      currentStep: 0,
      completedTours: [],
      isRunning: false,
    };
    this.loadCompletedTours();
  }

  // Tour registration
  registerTour(tour: Tour) {
    this.tours.set(tour.id, tour);
  }

  registerTours(tours: Tour[]) {
    tours.forEach((t) => this.registerTour(t));
  }

  getTour(id: string): Tour | undefined {
    return this.tours.get(id);
  }

  getAvailableTours(): Tour[] {
    return Array.from(this.tours.values()).filter((tour) => {
      if (tour.prerequisites) {
        return tour.prerequisites.every((p) =>
          this.state.completedTours.includes(p)
        );
      }
      return true;
    });
  }

  getCompletedTours(): string[] {
    return [...this.state.completedTours];
  }

  isTourCompleted(tourId: string): boolean {
    return this.state.completedTours.includes(tourId);
  }

  // Tour control
  startTour(tourId: string) {
    const tour = this.tours.get(tourId);
    if (!tour) throw new Error(`Tour not found: ${tourId}`);

    this.updateState({
      activeTour: tour,
      currentStep: 0,
      isRunning: true,
    });
  }

  nextStep() {
    if (!this.state.activeTour) return;

    const nextIndex = this.state.currentStep + 1;
    if (nextIndex >= this.state.activeTour.steps.length) {
      this.completeTour();
    } else {
      this.updateState({ currentStep: nextIndex });
    }
  }

  previousStep() {
    if (!this.state.activeTour || this.state.currentStep === 0) return;
    this.updateState({ currentStep: this.state.currentStep - 1 });
  }

  goToStep(stepIndex: number) {
    if (
      !this.state.activeTour ||
      stepIndex < 0 ||
      stepIndex >= this.state.activeTour.steps.length
    ) {
      return;
    }
    this.updateState({ currentStep: stepIndex });
  }

  skipTour() {
    this.updateState({
      activeTour: null,
      currentStep: 0,
      isRunning: false,
    });
  }

  // Reset completed tours (for testing)
  resetCompletedTours() {
    this.updateState({ completedTours: [] });
    saveToStorage([]);
  }

  // State access
  subscribe(listener: TourListener): () => void {
    this.listeners.add(listener);
    listener(this.state);
    return () => this.listeners.delete(listener);
  }

  getState(): TourState {
    return { ...this.state };
  }

  getCurrentStep(): TourStep | null {
    if (!this.state.activeTour) return null;
    return this.state.activeTour.steps[this.state.currentStep] || null;
  }

  // Private
  private completeTour() {
    const tourId = this.state.activeTour?.id;
    if (tourId && !this.state.completedTours.includes(tourId)) {
      const completed = [...this.state.completedTours, tourId];
      saveToStorage(completed);
      this.updateState({
        activeTour: null,
        currentStep: 0,
        isRunning: false,
        completedTours: completed,
      });
    } else {
      this.updateState({
        activeTour: null,
        currentStep: 0,
        isRunning: false,
      });
    }
  }

  private updateState(partial: Partial<TourState>) {
    this.state = { ...this.state, ...partial };
    this.listeners.forEach((l) => l(this.state));
  }

  private async loadCompletedTours() {
    const completed = await loadFromStorage();
    if (completed.length > 0) {
      this.updateState({ completedTours: completed });
    }
  }
}

// Singleton instance
export const tourSystem = new TourSystem();
