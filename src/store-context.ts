import { createContext, useContext } from 'react';
import type { StoreApi } from './store';

// The context object and its hook live outside store.tsx so that module exports
// only the StoreProvider component. React Fast Refresh refuses to update a module
// that mixes a component with any other export, so splitting these two apart is
// what keeps hot reloading working. The import above is type-only and therefore
// erased at build time, so this is not a runtime cycle.

export const StoreContext = createContext<StoreApi | null>(null);

export function useStore(): StoreApi {
  const store = useContext(StoreContext);
  if (!store) throw new Error('useStore must be used inside StoreProvider');
  return store;
}
