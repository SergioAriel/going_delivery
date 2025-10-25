import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { useFonts } from 'expo-font';
import { Slot } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect } from 'react';
import { PrivyProvider } from '@privy-io/expo';
import { SocketProvider } from '../src/contexts/SocketContext';
import { DriverTaskProvider } from '../context/DriverTaskContext'; // Import the new provider
import { PrivyElements } from '@privy-io/expo/ui';

// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [loaded] = useFonts({
    SpaceMono: require('../assets/fonts/SpaceMono-Regular.ttf'),
  });

  useEffect(() => {
    if (loaded) {
      SplashScreen.hideAsync();
    }
  }, [loaded]);

  if (!loaded) {
    return null;
  }

  if (!process.env.EXPO_PUBLIC_PRIVY_APP_ID || !process.env.EXPO_PUBLIC_PRIVY_CLIENT) {
    console.error("ERROR: Las variables de entorno de Privy (appId o clientId) no están definidas.");
    // Devuelve un componente de error simple o sigue mostrando la Splash Screen
    return null; 
  }
  console.log("Privy App ID:", process.env.EXPO_PUBLIC_PRIVY_APP_ID);
  console.log("Privy Client ID:", process.env.EXPO_PUBLIC_PRIVY_CLIENT);

  return (
  <>
    <PrivyProvider
      appId={process.env.EXPO_PUBLIC_PRIVY_APP_ID as string}
      clientId={process.env.EXPO_PUBLIC_PRIVY_CLIENT as string}

    >
      <SocketProvider>
        <DriverTaskProvider>
          <ThemeProvider value={DefaultTheme}>
            <Slot />
          </ThemeProvider>
        </DriverTaskProvider>
      </SocketProvider>
    <PrivyElements />
    </PrivyProvider>
  </>
  );
}