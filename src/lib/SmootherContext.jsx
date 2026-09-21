import { createContext, useContext } from 'react';

/**
 * Holds the single ScrollSmoother instance so components that need to freeze
 * scrolling (the mobile nav drawer) can reach it without prop drilling.
 */
export const SmootherContext = createContext({ current: null });

export const useSmoother = () => useContext(SmootherContext);
