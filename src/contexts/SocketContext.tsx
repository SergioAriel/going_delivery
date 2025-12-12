import React, { createContext, useContext, useEffect, useState } from 'react';
import { io, Socket } from 'socket.io-client';
import Constants from 'expo-constants';

const SocketContext = createContext<Socket | null>(null);

export const useSocket = () => {
    return useContext(SocketContext);
};

export const SocketProvider = ({ children }: { children: React.ReactNode }) => {
    const [socket, setSocket] = useState<Socket | null>(null);

    // ...

    useEffect(() => {
        const socketServerUrl = Constants.expoConfig?.extra?.API_URL || process.env.EXPO_PUBLIC_API_URL || 'http://10.0.2.2:4000';
        const newSocket = io(socketServerUrl);
        newSocket.on('connect', () => {
            console.log('Connected to socket server');
        });
        setSocket(newSocket);

        return () => {
            newSocket.disconnect();
        };
    }, []);

    return (
        <SocketContext.Provider value={socket}>
            {children}
        </SocketContext.Provider>
    );
};
