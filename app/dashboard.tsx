import { useSocket } from '@/src/contexts/SocketContext';
import * as Location from 'expo-location';
import * as React from 'react';
import { useEffect, useState } from 'react';
import { ActivityIndicator, Text, View } from 'react-native';
import { CollectingBatchView } from '../components/tasks/CollectingBatchView';
import { DeliveringBatchView } from '../components/tasks/DeliveringBatchView';
import { RoutingToHubView } from '../components/tasks/RoutingToHubView';
import { DirectRouteView } from '../components/tasks/DirectRouteView';
import { useDriverTask } from '../context/DriverTaskContext';
import { LinearGradient } from 'expo-linear-gradient';
import Header from '../components/ui/Header';
import { usePrivy } from '@privy-io/expo';
import { Button } from '../components/ui/Button';

const DashboardScreen = () => {
    const { activeTask } = useDriverTask();
    const [isOnline, setIsOnline] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const socket = useSocket();
    const [locationSubscription, setLocationSubscription] = useState<Location.LocationSubscription | null>(null);
    const { getAccessToken, user } = usePrivy();

    const stopLocationUpdates = () => {
        if (locationSubscription) {
            locationSubscription.remove();
            setLocationSubscription(null);
        }
    };

    const goOnline = async () => {
        console.log("goOnline called");
        if (!socket) {
            console.log("Socket is null, returning");
            return;
        }
        setLoading(true);
        setError(null);

        try {
            console.log("Checking existing permissions...");
            const { status: existingStatus } = await Location.getForegroundPermissionsAsync();
            console.log("Existing permission status:", existingStatus);

            let status = existingStatus;

            if (existingStatus !== 'granted') {
                console.log("Requesting location permissions...");
                // Add a timeout to the permission request to prevent hanging
                const requestPromise = Location.requestForegroundPermissionsAsync();
                const timeoutPromise = new Promise<{ status: Location.PermissionStatus }>((resolve) =>
                    setTimeout(() => resolve({ status: Location.PermissionStatus.UNDETERMINED }), 5000)
                );

                const result = await Promise.race([requestPromise, timeoutPromise]);
                status = result.status;
                console.log("Permission request result:", status);
            }

            if (status !== 'granted') {
                setError('Permission to access location was denied or timed out');
                setLoading(false);
                return;
            }

            console.log("Checking location services...");
            const isLocationEnabled = await Location.hasServicesEnabledAsync();
            console.log("Location services enabled:", isLocationEnabled);
            if (!isLocationEnabled) {
                setError('Location services are disabled. Please enable them in settings.');
                setLoading(false);
                return;
            }

            console.log("Getting access token...");
            const token = await getAccessToken();
            console.log("Token retrieved");

            // Send authenticate event with driverId (using user.id from Privy)
            // Ideally, we should send the token and verify it on server, but for now we send driverId
            console.log("User object:", user);
            if (user?.id) {
                console.log("Emitting authenticate event...");
                socket.emit('authenticate', { driverId: user.id, token });

                console.log("Starting location watch...");
                const subscription = await Location.watchPositionAsync(
                    {
                        accuracy: Location.Accuracy.High, // Increased accuracy
                        timeInterval: 1000, // Update every 1 second
                        distanceInterval: 1, // Update every 1 meter
                    },
                    (location) => {
                        console.log("Location update:", location.coords.latitude, location.coords.longitude);
                        socket.emit('driverLocationUpdate', {
                            lat: location.coords.latitude,
                            lon: location.coords.longitude
                        });
                    }
                );
                setLocationSubscription(subscription);

                setIsOnline(true);
                console.log(`Driver ${user.id} went online.`);
            } else {
                console.error("User not authenticated properly (missing ID)");
                setError("User not authenticated properly.");
            }

        } catch (err) {
            console.error("Error in goOnline:", err);
            setError('Error going online: ' + (err instanceof Error ? err.message : String(err)));
        } finally {
            setLoading(false);
            console.log("goOnline finished, loading set to false");
        }
    };

    useEffect(() => {
        if (socket && !isOnline) {
            console.log(socket.id, isOnline)
            // Auto-connect if possible or wait for user action?
            // For demo simplicity, let's auto-connect
            goOnline();
        }

        if (socket) {
            socket.on('disconnect', () => {
                setIsOnline(false);
                stopLocationUpdates();
                console.log("Socket disconnected");
            });
        }

        return () => {
            stopLocationUpdates();
            if (socket) {
                socket.off('disconnect');
            }
        };
    }, [socket]);

    const renderContent = () => {
        console.log("Rendering content. Active Task:", activeTask ? activeTask.status : "None");
        if (!activeTask) {
            return (
                <View className="flex-1 justify-center items-center p-4">
                    {!isOnline ? (
                        <View className="items-center w-full max-w-xs">
                            <Text className="text-white text-lg mb-4">You are currently Offline</Text>
                            {error && (
                                <Text className="text-error text-center mb-4">{error}</Text>
                            )}
                            <Button
                                title={loading ? "Connecting..." : "Go Online"}
                                onPress={goOnline}
                                disabled={loading}
                            />
                        </View>
                    ) : (
                        <View className="items-center">
                            <ActivityIndicator size="large" color="#14BFFB" />
                            <Text className="text-white mt-4 text-lg">Waiting for assignments...</Text>
                            <Text className="text-text-muted mt-2 text-sm">Your ID: {user?.id}</Text>
                        </View>
                    )}
                </View>
            );
        }

        switch (activeTask.status) {
            case 'COLLECTING_BATCH':
                return <CollectingBatchView />;
            case 'ROUTING_TO_HUB':
                return <RoutingToHubView />;
            case 'DELIVERING_BATCH':
                return <DeliveringBatchView />;
            case 'PERFORMING_DIRECT_ROUTE':
                return <DirectRouteView />;
            default:
                return (
                    <View className="flex-1 justify-center items-center p-6">
                        <Text className="text-white">Unknown Task Status: {activeTask.status}</Text>
                    </View>
                );
        }
    };

    return (
        <LinearGradient
            colors={['#0F172A', '#1E293B']}
            style={{ flex: 1 }}
        >
            <Header isOnline={isOnline} />
            <View className="flex-1 px-4">
                {renderContent()}
            </View>
        </LinearGradient>
    );
};

export default DashboardScreen;