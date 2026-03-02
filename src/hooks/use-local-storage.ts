'use client';

import { useState, useEffect, useCallback } from 'react';

function useLocalStorage<T>(key: string, initialValue: T | (() => T)): [T, (value: T | ((val: T) => T)) => void, boolean] {
  const [isLoading, setIsLoading] = useState(true);

  const readValue = useCallback((): T => {
    if (typeof window === 'undefined') {
       return initialValue instanceof Function ? initialValue() : initialValue;
    }
    try {
      const item = window.localStorage.getItem(key);
      if (item) {
        return JSON.parse(item);
      } else {
        const valueToStore = initialValue instanceof Function ? initialValue() : initialValue;
        window.localStorage.setItem(key, JSON.stringify(valueToStore));
        return valueToStore;
      }
    } catch (error) {
      console.warn(`Error reading localStorage key “${key}”:`, error);
      return initialValue instanceof Function ? initialValue() : initialValue;
    }
  }, [initialValue, key]);

  const [storedValue, setStoredValue] = useState<T>(initialValue instanceof Function ? initialValue() : initialValue);

  useEffect(() => {
    // This effect runs once on mount to sync with localStorage.
    setStoredValue(readValue());
    setIsLoading(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); 

  const setValue = (value: T | ((val: T) => T)) => {
    if (typeof window === 'undefined') {
      console.warn(`Tried to set localStorage key “${key}” even though window is not available.`);
      return;
    }
    try {
      const valueToStore = value instanceof Function ? value(storedValue) : value;
      setStoredValue(valueToStore);
      window.localStorage.setItem(key, JSON.stringify(valueToStore));
    } catch (error) {
      console.log(error);
    }
  };

  return [storedValue, setValue, isLoading];
}

export default useLocalStorage;
