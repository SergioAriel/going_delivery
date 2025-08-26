// 👇 Estas líneas deben estar antes de cualquier otro import
import { Poppins_400Regular, Poppins_700Bold, useFonts } from '@expo-google-fonts/poppins';
import { PrivyProvider } from '@privy-io/expo';
import { PrivyElements } from '@privy-io/expo/ui';
import { Stack } from 'expo-router';
import React from 'react';
import { SocketProvider } from '../src/contexts/SocketContext';


export default function RootLayout() {
  const [fontsLoaded] = useFonts({
    Poppins_400Regular,
    Poppins_700Bold,
  });

  if (!fontsLoaded) {
    return null; // O un componente de carga
  }

  return (
    <PrivyProvider
      appId={"cmcdclvuo023nlb0mr1df4ktw"}
      clientId={"client-WY6N2yUvqaAu7YyJ7N81cZjA4NXRw23835GmEBH1CChsQ"}
    >
      <SocketProvider>
        <Stack
          screenOptions={{
            headerStyle: {
              backgroundColor: '#14BFFB',
            },
            headerTintColor: '#fff',
            headerTitleStyle: {
              fontFamily: 'Poppins_700Bold',
            },
          }}
        >
          <Stack.Screen name="index" options={{ title: 'GOING' }} />
          <Stack.Screen name="dashboard" options={{ title: 'Dashboard' }} />
          <Stack.Screen
            name="pickup-details/[orderId]/[sellerId]/"
            options={{ title: 'Details of shipment', presentation: 'modal' }} // 'presentation: modal' es opcional, pero común para detalles
          />
        </Stack>
        <PrivyElements config={{ appearance: { accentColor: '#00AF55' } }} />

      </SocketProvider>
    </PrivyProvider>
  );
}
