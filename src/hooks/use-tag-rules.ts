'use client';

import useLocalStorage from './use-local-storage';

export function useTagRules() {
  const [tagRules, setTagRules, isLoading] = useLocalStorage<string>('genie-tag-rules', '');

  return {
    tagRules,
    setTagRules,
    isLoading,
  };
}
