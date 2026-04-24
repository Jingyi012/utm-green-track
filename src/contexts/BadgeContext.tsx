import React, { createContext, useContext, useState, useCallback } from 'react';

interface BadgeContextType {
  refreshBadges: (paths?: string[]) => Promise<void>;
  setRefreshFunction: (fn: (paths?: string[]) => Promise<void>) => void;
}

const BadgeContext = createContext<BadgeContextType | undefined>(undefined);

export const BadgeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [refreshFunction, setRefreshFunctionState] = useState<
    ((paths?: string[]) => Promise<void>) | null
  >(null);

  const setRefreshFunction = useCallback((fn: (paths?: string[]) => Promise<void>) => {
    setRefreshFunctionState(() => fn);
  }, []);

  const refreshBadges = useCallback(
    async (paths?: string[]) => {
      if (refreshFunction) {
        await refreshFunction(paths);
      }
    },
    [refreshFunction],
  );

  return (
    <BadgeContext.Provider value={{ refreshBadges, setRefreshFunction }}>
      {children}
    </BadgeContext.Provider>
  );
};

export const useBadgeRefresh = () => {
  const context = useContext(BadgeContext);
  if (!context) {
    throw new Error('useBadgeRefresh must be used within BadgeProvider');
  }
  return context.refreshBadges;
};

export const useBadgeRefreshSetter = () => {
  const context = useContext(BadgeContext);
  if (!context) {
    throw new Error('useBadgeRefreshSetter must be used within BadgeProvider');
  }
  return context.setRefreshFunction;
};
