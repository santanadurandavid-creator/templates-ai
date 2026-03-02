import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import type { AppEvent } from "./types";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Simple event emitter
type EventCallback = (data?: any) => void;
const events = new Map<AppEvent, Set<EventCallback>>();

export const eventBus = {
  on: (event: AppEvent, callback: EventCallback): (() => void) => {
    if (!events.has(event)) {
      events.set(event, new Set());
    }
    const eventCallbacks = events.get(event)!;
    eventCallbacks.add(callback);
    
    return () => {
      eventCallbacks.delete(callback);
      if (eventCallbacks.size === 0) {
        events.delete(event);
      }
    };
  },
  
  dispatch: (event: AppEvent, data?: any): void => {
    if (events.has(event)) {
      events.get(event)!.forEach(callback => callback(data));
    }
  }
};
