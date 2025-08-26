import * as Location from 'expo-location';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Text, TouchableOpacity, View } from 'react-native';
import MapView, { Marker, Polyline } from 'react-native-maps';
import QRCode from 'react-native-qrcode-svg';
import { useSocket } from '../../src/contexts/SocketContext';

import { Shipment, User } from '@/interfaces';
import { LinearGradient } from 'expo-linear-gradient';

const DeliveryScreen = () => {
    const [shipment, setShipment] = useState<Shipment | null>(null);
    const [seller, setSeller] = useState<User | null>(null);
    const [driverLocation, setDriverLocation] = useState<Location.LocationObject | null>(null);
    const [errorMsg, setErrorMsg] = useState<string | null>(null);
    const socket = useSocket();
    const { _id: shipmentId } = useLocalSearchParams();
    const router = useRouter();
    const mapRef = useRef<MapView>(null);

    const fetchShipmentDetails = useCallback(async () => {
        try {
            const response = await fetch(`https://going-git-delivery-sergioariels-projects.vercel.app/api/shipments/${shipmentId}`);
            if (response.ok) {
                const data = await response.json();
                setShipment(data);
            } else {
                setErrorMsg("Failed to fetch shipment details");
            }
        } catch {
            setErrorMsg("An unexpected error occurred while fetching shipment details.");
        }
    },[shipmentId]);

    const fetchSellerDetails = async (sellerId: string) => {
        try {
            const response = await fetch(`https://going-git-delivery-sergioariels-projects.vercel.app/api/users?_id${sellerId}`);
            if (response.ok) {
                const data = await response.json();
                setSeller(data);
            } else {
                setErrorMsg("Failed to fetch seller details");
            }
        } catch {
            setErrorMsg("An unexpected error occurred while fetching seller details.");
        }
    };

    useEffect(() => {
        if (shipmentId) {
            fetchShipmentDetails();
        }
    }, [shipmentId, fetchShipmentDetails]);

    useEffect(() => {
        if (shipment?.sellerId) {
            fetchSellerDetails(shipment.sellerId);
        }
    }, [shipment]);

    useEffect(() => {
        let locationSubscription: Location.LocationSubscription;
        (async () => {
            let { status } = await Location.requestForegroundPermissionsAsync();
            if (status !== 'granted') {
                setErrorMsg('Permission to access location was denied');
                return;
            }

            locationSubscription = await Location.watchPositionAsync(
                { accuracy: Location.Accuracy.High, timeInterval: 5000, distanceInterval: 5 },
                (newLocation) => {
                    setDriverLocation(newLocation);
                    if (socket && shipmentId) {
                        socket.emit('update_driver_location', {
                            shipmentId,
                            location: { lat: newLocation.coords.latitude, lng: newLocation.coords.longitude },
                        });
                    }
                    mapRef.current?.animateToRegion({
                        latitude: newLocation.coords.latitude,
                        longitude: newLocation.coords.longitude,
                        latitudeDelta: 0.02,
                        longitudeDelta: 0.02,
                    });
                }
            );
        })();

        return () => { locationSubscription?.remove(); };
    }, [socket, shipmentId]);

    if (!shipment || !seller) {
        return <View className="flex-1 justify-center items-center"><Text className="text-primary-dark">Loading shipment...</Text></View>
    }

    const destination = shipment.status === 'en_route_to_pickup' ? seller.addresses[0] : null;

    return (
        <View className="flex-1 bg-accent">
            <MapView
                ref={mapRef}
                className="flex-1"
                initialRegion={{
                    latitude: destination?.lat || 34.0522,
                    longitude: destination?.lng || -118.2437,
                    latitudeDelta: 0.0922,
                    longitudeDelta: 0.0421,
                }}
            >
                {destination && <Marker coordinate={{ latitude: destination.lat as number, longitude: destination.lng as number}} title="Pickup Location" pinColor="#D300E5" />}
                {driverLocation && <Marker coordinate={{ latitude: driverLocation.coords.latitude, longitude: driverLocation.coords.longitude }} title="Driver" pinColor="#14BFFB" />}
                {driverLocation && destination && (
                    <Polyline
                        coordinates={[
                            { latitude: destination.lat as number, longitude: destination.lng as number },
                            { latitude: driverLocation.coords.latitude, longitude: driverLocation.coords.longitude },
                        ]}
                        strokeColor="#14BFFB"
                        strokeWidth={4}
                    />
                )}
            </MapView>
            <View className="flex-1 p-5 rounded-t-2xl items-center shadow-lg bg-white">
                {shipment.status === 'en_route_to_pickup' && (
                    <>
                        <Text className="text-2xl font-bold mb-2.5 text-center text-primary-dark">Go to Seller Location</Text>
                        <TouchableOpacity onPress={() => router.push(`/scanQR?shipmentId=${shipmentId}`)}>
                            <LinearGradient colors={['#14BFFB', '#D300E5']} className="py-4 px-10 rounded-lg items-center mt-5" start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}>
                                <Text className="text-white text-base font-bold">Scan Seller QR</Text>
                            </LinearGradient>
                        </TouchableOpacity>
                    </>
                )}
                {shipment.status === 'in_transit' && (
                    <>
                        <Text className="text-2xl font-bold mb-2.5 text-center text-primary-dark">Complete Delivery</Text>
                        <Text className="text-base text-center mb-5 text-primary-dark">
                            Ask the customer to scan this QR code to confirm delivery.
                        </Text>
                        <View className="p-4 rounded-lg mb-5 bg-white">
                            {shipmentId ? (
                                <QRCode value={shipmentId.toString()} size={180} backgroundColor="white" color="black" />
                            ) : (
                                <Text>Loading QR...</Text>
                            )}
                        </View>
                        <Text className="text-base italic text-primary-dark">Waiting for customer confirmation...</Text>
                    </>
                )}
                {errorMsg && <Text className="text-red-500 mt-2.5">{errorMsg}</Text>}
            </View>
        </View>
    );
};

export default DeliveryScreen;
