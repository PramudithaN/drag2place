import { useSyncExternalStore } from 'react';

const emptySubscribe = () => () => {};

/**
 * Hook to determine whether component has hydrated on the client.
 * Uses React 18+ useSyncExternalStore to avoid setState in useEffect cascading render warnings.
 */
export function useIsMounted(): boolean {
  return useSyncExternalStore(
    emptySubscribe,
    () => true,
    () => false
  );
}
