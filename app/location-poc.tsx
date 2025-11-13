import React, { useState, useEffect } from 'react';
import { View, Text, Button } from 'react-native';
import * as Location from 'expo-location';
import * as TaskManager from 'expo-task-manager';

const LOCATION_TASK_NAME = 'background-location-task';

// Define the background task
TaskManager.defineTask(LOCATION_TASK_NAME, ({ data, error }) => {
  if (error) {
    console.error('Background location task error:', error);
    return;
  }
  if (data) {
    const { locations } = data as { locations: Location.LocationObject[] };
    const location = locations[0];
    if (location) {
      console.log('📍 New background location:', location.coords);
      // Here is where we would send the location to the socket-server
    }
  }
});

export default function LocationPocScreen() {
  const [status, setStatus] = useState('Not tracking');
  const [location, setLocation] = useState<Location.LocationObject | null>(null);

  const requestPermissions = async () => {
    const { status: foregroundStatus } = await Location.requestForegroundPermissionsAsync();
    if (foregroundStatus === 'granted') {
      const { status: backgroundStatus } = await Location.requestBackgroundPermissionsAsync();
      if (backgroundStatus === 'granted') {
        return true;
      }
    }
    return false;
  };

  const startTracking = async () => {
    const hasPermissions = await requestPermissions();
    if (!hasPermissions) {
      setStatus('Permission denied');
      return;
    }

    await Location.startLocationUpdatesAsync(LOCATION_TASK_NAME, {
      accuracy: Location.Accuracy.BestForNavigation,
      timeInterval: 5000, // 5 seconds
      showsBackgroundLocationIndicator: true,
      foregroundService: {
        notificationTitle: 'Going Delivery',
        notificationBody: 'Tracking your location for deliveries.',
        notificationColor: '#333333',
      },
    });
    setStatus('Tracking started...');
    console.log('Background location tracking started');
  };

  const stopTracking = async () => {
    await Location.stopLocationUpdatesAsync(LOCATION_TASK_NAME);
    setStatus('Tracking stopped');
    console.log('Background location tracking stopped');
  };

  // This effect is just for displaying the *foreground* location for debugging
  useEffect(() => {
    const subscribeToLocation = async () => {
      const hasPermissions = await requestPermissions();
      if (!hasPermissions) {
        setStatus('Permission denied');
        return;
      }
      let locationSubscription = await Location.watchPositionAsync(
        {
          accuracy: Location.Accuracy.High,
          timeInterval: 1000,
          distanceInterval: 1,
        },
        (loc) => {
          setLocation(loc);
        }
      );
      return () => locationSubscription.remove();
    };

    subscribeToLocation();
  }, []);


  return (
    <View className="flex-1 justify-center items-center bg-gray-100 p-4">
      <Text className="text-2xl font-bold mb-4">Location POC</Text>
      <View className="space-y-4 w-full max-w-xs">
        <Button title="Start Background Tracking" onPress={startTracking} />
        <Button title="Stop Background Tracking" onPress={stopTracking} color="red" />
      </View>
      <View className="mt-8 p-4 bg-white rounded-lg shadow w-full">
        <Text className="text-lg font-semibold">Status: {status}</Text>
        <Text className="mt-2 text-sm text-gray-600">
          (Console logs will show '📍 New background location' when the app is in the background)
        </Text>
        {location && (
          <View className="mt-4">
            <Text className="font-bold">Current Foreground Location:</Text>
            <Text>Lat: {location.coords.latitude.toFixed(5)}</Text>
            <Text>Lon: {location.coords.longitude.toFixed(5)}</Text>
            <Text>Speed: {location.coords.speed?.toFixed(2)} m/s</Text>
          </View>
        )}
      </View>
    </View>
  );
}
