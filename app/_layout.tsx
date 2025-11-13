import { ThemeProvider, DefaultTheme } from '@react-navigation/native';
import { Stack } from 'expo-router';
import { PrivyProvider } from '@privy-io/expo';
import { SocketProvider } from '../src/contexts/SocketContext';
import { DriverTaskProvider } from '../context/DriverTaskContext';
import { PrivyElements } from '@privy-io/expo/ui';

export default function RootLayout() {

  return (
    <PrivyProvider
      appId={process.env.EXPO_PUBLIC_PRIVY_APP_ID as string}
      clientId={process.env.EXPO_PUBLIC_PRIVY_CLIENT as string}
      
    >
      <SocketProvider>
        <DriverTaskProvider>
          <ThemeProvider value={DefaultTheme}>
            {/* 
              This is the robust structure. The Stack navigator is explicitly defined,
              and its screens are rendered as children of the providers. This ensures
              context is available to all screens and prevents race conditions.
            */}
            <Stack screenOptions={{ headerShown: false }}>
              <Stack.Screen name="(tabs)" />
              <Stack.Screen name="index" />
              <Stack.Screen name="dashboard" />
              <Stack.Screen name="delivery/[shipmentId]/index" />
              <Stack.Screen name="pickup-details/[shipmentId]/index" />
              <Stack.Screen name="scanQR" />
              <Stack.Screen name="location-poc" />
              <Stack.Screen name="hub-transfer" />
            </Stack>
          </ThemeProvider>
        </DriverTaskProvider>
      </SocketProvider>
      <PrivyElements />
    </PrivyProvider>
  );
}