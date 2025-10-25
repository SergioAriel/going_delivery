import React, { createContext, useContext, useState, ReactNode } from 'react';
import { DriverTask } from '@/interfaces';

interface DriverTaskContextType {
  activeTask: DriverTask | null;
  setActiveTask: (task: DriverTask | null) => void;
}

const DriverTaskContext = createContext<DriverTaskContextType | undefined>(undefined);

export const DriverTaskProvider = ({ children }: { children: ReactNode }) => {
  const [activeTask, setActiveTask] = useState<DriverTask | null>(null);

  return (
    <DriverTaskContext.Provider value={{ activeTask, setActiveTask }}>
      {children}
    </DriverTaskContext.Provider>
  );
};

export const useDriverTask = () => {
  const context = useContext(DriverTaskContext);
  if (context === undefined) {
    throw new Error('useDriverTask must be used within a DriverTaskProvider');
  }
  return context;
};