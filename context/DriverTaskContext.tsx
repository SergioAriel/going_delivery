import React, { createContext, useContext, useState, ReactNode } from 'react';
import { DriverTask } from '@/interfaces';

interface DriverTaskContextType {
  activeTask: DriverTask | null;
  setActiveTask: (task: DriverTask | null) => void;
}

const DriverTaskContext = createContext<DriverTaskContextType | undefined>(undefined);

import { useSocket } from '@/src/contexts/SocketContext';
import { useEffect } from 'react';

export const DriverTaskProvider = ({ children }: { children: ReactNode }) => {
  const [activeTask, setActiveTask] = useState<DriverTask | null>(null);
  const socket = useSocket();

  useEffect(() => {
    if (!socket) return;

    socket.on('newTask', (data: { batch: any }) => {
      console.log('New task received:', data);
      setActiveTask({
        status: 'COLLECTING_BATCH',
        batch: data.batch,
        hubLocation: data.batch.hubLocation
      });
    });

    socket.on('batchProgress', (data: { batchId: string, status: string, newDriverStatus: string, batch?: any }) => {
      console.log('[DriverTaskContext] Batch progress received:', data);

      setActiveTask(prev => {
        console.log('[DriverTaskContext] Updating task. Prev:', prev);

        // Case 1: We have previous state, update it
        if (prev && prev.batch && prev.batch._id === data.batchId) {
          const newState = {
            ...prev,
            status: data.newDriverStatus as any,
            batch: data.batch || prev.batch // Update batch if provided
          };
          console.log('[DriverTaskContext] New State (Updated):', newState);
          return newState;
        }

        // Case 2: No previous state (or mismatch), but we received the full batch
        if (data.batch) {
          console.log('[DriverTaskContext] Recovering state from batchProgress payload');
          return {
            status: data.newDriverStatus as any,
            batch: data.batch,
            hubLocation: data.batch.hubLocation
          };
        }

        console.warn('[DriverTaskContext] Batch ID mismatch or no active task AND no batch in payload. Prev:', prev, 'Data:', data);
        return prev;
      });
    });

    socket.on('batchCompleted', (data: { batchId: string, status: string }) => {
      console.log('Batch completed:', data);
      setActiveTask(null); // Clear task, go back to IDLE/Waiting
      // Ideally we show a summary screen first, but for MVP this works.
    });

    socket.on('restoreState', (data: { batch: any, driverStatus: string }) => {
      console.log('[DriverTaskContext] Restoring state:', data);
      setActiveTask({
        status: data.driverStatus as any,
        batch: data.batch,
        hubLocation: data.batch.hubLocation
      });
    });

    return () => {
      socket.off('newTask');
      socket.off('batchProgress');
      socket.off('batchCompleted');
    };
  }, [socket]);

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