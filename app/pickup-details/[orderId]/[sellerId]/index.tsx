import { Camera } from 'expo-camera';
import * as Location from 'expo-location';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { ActivityIndicator, Alert, Linking, ScrollView, Text, TouchableOpacity, View } from 'react-native';
import MapView, { Marker, Polyline } from 'react-native-maps';
import { useSocket } from '../../../../src/contexts/SocketContext';

import ScanQR from '@/app/scanQR';
import { Order, User } from '@/interfaces';
import { getCoordinatesFromAddress } from '@/lib';
import { LinearGradient } from 'expo-linear-gradient';

interface AddressWithCoords {
    street: string;
    city: string;
    state: string;
    country: string;
    zipCode: string;
    phone: string;
    lat: number;
    lng: number;
}

const PickupDetailsScreen = () => {
    const { orderId, sellerId } = useLocalSearchParams<{ orderId: string; sellerId: string }>();
    const router = useRouter();
    const socket = useSocket();

    const [order, setOrder] = useState<Order | null>(null);
    const [seller, setSeller] = useState<User | null>(null);
    const [driverLocation, setDriverLocation] = useState<Location.LocationObject | null>(null);
    const [sellerPickupLocation, setSellerPickupLocation] = useState<AddressWithCoords | null>(null);
    const [loading, setLoading] = useState(true);
    const [errorMsg, setErrorMsg] = useState<string | null>(null);

    const [hasPermission, setHasPermission] = useState<boolean | null>(null);
    const [isScanning, setIsScanning] = useState(false);

    const mapRef = useRef<MapView>(null);

    useEffect(() => {
        const getCameraPermissions = async () => {
            const { status } = await Camera.requestCameraPermissionsAsync();
            setHasPermission(status === 'granted');
        };
        getCameraPermissions();
    }, []);

    const fetchOrderAndSellerDetails = useCallback(async () => {
        if (!orderId || !sellerId) {
            setErrorMsg("Order ID or Seller ID is missing.");
            setLoading(false);
            return;
        }

        try {
            const orderResponse = await fetch(`https://going-git-delivery-sergioariels-projects.vercel.app/api/orders/${orderId}`);
            if (!orderResponse.ok) throw new Error("Failed to fetch order details.");
            const orderData: Order = await orderResponse.json();
            setOrder(orderData);

            const sellerResponse = await fetch(`https://going-git-delivery-sergioariels-projects.vercel.app/api/users?_id${sellerId}`);
            if (!sellerResponse.ok) throw new Error("Failed to fetch seller details.");
            const sellerData: User = await sellerResponse.json();
            setSeller(sellerData);

            if (sellerData.addresses) {
                if (!!sellerData.addresses[0].lat && !!sellerData.addresses[0].lng) {
                    setSellerPickupLocation({ ...sellerData.addresses[0], lat: sellerData.addresses[0].lat as number, lng: sellerData.addresses[0].lng as number });
                } else {
                    const cords = await getCoordinatesFromAddress(sellerData.addresses[0])
                    if (cords) {
                        setSellerPickupLocation({ ...sellerData.addresses[0], lat: cords.lat, lng: cords.lng });
                    }
                }
            } else {
                setErrorMsg("Seller location not found.");
            }

        } catch (err: any) {
            setErrorMsg(err.message || "An error occurred while fetching details.");
        } finally {
            setLoading(false);
        }
    },[orderId, sellerId]);

    useEffect(() => {
        let locationSubscription: Location.LocationSubscription;

        const setupLocationTracking = async () => {
            let { status } = await Location.requestForegroundPermissionsAsync();
            if (status !== 'granted') {
                setErrorMsg('Permission to access location was denied');
                return;
            }

            locationSubscription = await Location.watchPositionAsync(
                { accuracy: Location.Accuracy.High, timeInterval: 5000, distanceInterval: 5 },
                (newLocation) => {
                    setDriverLocation(newLocation);
                    if (mapRef.current && sellerPickupLocation) {
                        mapRef.current.animateToRegion({ latitude: sellerPickupLocation.lat, longitude: sellerPickupLocation.lng, latitudeDelta: 0.05, longitudeDelta: 0.05 }, 1000);
                    }
                }
            );
        };

        setupLocationTracking();

        return () => { locationSubscription?.remove(); };
    }, [socket, orderId, sellerId, sellerPickupLocation]);

    useEffect(() => {
        fetchOrderAndSellerDetails();
    }, [orderId, sellerId, fetchOrderAndSellerDetails]);

    const handleConfirmPickup = async () => {
        if (!order || !seller || !socket || !sellerPickupLocation) {
            Alert.alert("Error", "Could not get order or seller details.");
            return;
        }

        try {
            socket.emit('confirm_pickup_at_seller', {
                orderId: order._id.toString(),
                sellerId: seller._id.toString(),
                driverId: 'AUTHENTICATED_DRIVER_ID_HERE',
                pickupLocation: sellerPickupLocation,
                items: order.items.filter(item => item.seller === seller._id.toString()),
            });

            Alert.alert("Pickup Confirmed", `You have confirmed the pickup at ${seller.name}.`);

            const simulatedShipmentId = `ship_${order._id.toString()}_${seller._id.toString()}`;
            router.replace(`/delivery/${simulatedShipmentId}`);

        } catch {
            Alert.alert("Error", "Could not confirm pickup. Please try again.");
        }
    };

    const handleOpenNavigationApp = () => {
        if (!sellerPickupLocation || !driverLocation) {
            Alert.alert("Error", "Cannot start navigation without pickup or current location.");
            return;
        }

        const { latitude: originLat, longitude: originLng } = driverLocation.coords;
        const { lat: destLat, lng: destLng } = sellerPickupLocation;

        const googleMapsUrl = `https://www.google.com/maps/dir/?api=1&origin=${originLat},${originLng}&destination=${destLat},${destLng}&travelmode=driving&dir_action=navigate`;
        const wazeUrl = `https://waze.com/ul?ll=${destLat},${destLng}&navigate=yes&zoom=17`;

        Alert.alert("Open in Navigation App", "Which app would you like to use?",
            [
                { text: "Google Maps", onPress: async () => { await Linking.openURL(googleMapsUrl); } },
                { text: "Waze", onPress: async () => { await Linking.openURL(wazeUrl); } },
                { text: "Cancel", style: "cancel" },
            ],
            { cancelable: true }
        );
    };

    const handleScanQR = () => {
        if (hasPermission === false) {
            Alert.alert("Permission Denied", "Camera permission is required to scan QR codes.");
            return;
        }
        if (!orderId || !sellerId) {
            Alert.alert("Error", "Order or Seller ID is missing.");
            return;
        }
        setIsScanning(true);
    };

    if (loading) {
        return <View className="flex-1 justify-center items-center bg-accent"><ActivityIndicator size="large" color="#14BFFB" /><Text className="mt-2.5">Loading pickup details...</Text></View>;
    }

    if (errorMsg) {
        return <View className="flex-1 justify-center items-center bg-accent"><Text className="text-red-500">Error: {errorMsg}</Text><TouchableOpacity onPress={() => router.back()}><Text className="text-primary mt-5">Go Back</Text></TouchableOpacity></View>;
    }

    if (!order || !seller || !sellerPickupLocation) {
        return <View className="flex-1 justify-center items-center bg-accent"><Text className="text-red-500">Incomplete data for pickup.</Text><TouchableOpacity onPress={() => router.back()}><Text className="text-primary mt-5">Go Back</Text></TouchableOpacity></View>;
    }

    const itemsForPickup = order.items.filter(item => item.seller === seller._id.toString());

    if (isScanning) {
        return (
            <View className="absolute inset-0">
                <ScanQR />
                <TouchableOpacity className="absolute bottom-16 self-center p-4 rounded-lg bg-primary z-10" onPress={() => setIsScanning(false)}>
                    <Text className="text-white text-lg font-bold">Close Scanner</Text>
                </TouchableOpacity>
            </View>
        );
    }

    return (
        <View className="flex-1 bg-accent">
            <MapView ref={mapRef} className="flex-2" initialRegion={{ latitude: sellerPickupLocation.lat, longitude: sellerPickupLocation.lng, latitudeDelta: 0.02, longitudeDelta: 0.02 }} showsUserLocation followsUserLocation>
                <Marker coordinate={{ latitude: sellerPickupLocation.lat, longitude: sellerPickupLocation.lng }} title={`Pickup at ${seller.name}`} description={`${sellerPickupLocation.street}, ${sellerPickupLocation.city}`} pinColor="#D300E5" />
                {driverLocation && <Polyline coordinates={[{ latitude: driverLocation.coords.latitude, longitude: driverLocation.coords.longitude }, { latitude: sellerPickupLocation.lat, longitude: sellerPickupLocation.lng }]} strokeColor="#14BFFB" strokeWidth={4} />}
            </MapView>

            <ScrollView className="flex-1 rounded-t-2xl shadow-lg bg-white">
                <Text className="text-2xl font-bold mb-2.5 text-center text-primary-dark">Pickup Details</Text>
                <Text className="text-lg font-bold mb-1.5">Seller: {seller.name}</Text>
                <Text className="text-base mb-1.5 text-center">Address: {sellerPickupLocation.street}, {sellerPickupLocation.city}</Text>
                <Text className="text-base mb-1.5 text-center">Phone: {sellerPickupLocation.phone}</Text>

                <Text className="text-lg font-bold mt-4 mb-2.5 text-center">Items to Pick Up ({itemsForPickup.length})</Text>
                {itemsForPickup.length > 0 ? (
                    itemsForPickup.map((item, index) => <Text key={index} className="text-sm mb-1 text-center">- {item.name} (x{item.quantity})</Text>)
                ) : (
                    <Text className="text-sm mb-1 text-center">No specific items listed for this seller.</Text>
                )}

                <TouchableOpacity className="mt-2.5 w-4/5" onPress={handleOpenNavigationApp}>
                    <LinearGradient colors={['#7CDFFF', '#D300E5']} className="py-4 px-10 rounded-lg items-center" start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}>
                        <Text className="text-white text-base font-bold">Start Navigation</Text>
                    </LinearGradient>
                </TouchableOpacity>

                <TouchableOpacity className="mt-2.5 w-4/5" onPress={handleScanQR}>
                    <LinearGradient colors={['#D300E5', '#14BFFB']} className="py-4 px-10 rounded-lg items-center" start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}>
                        <Text className="text-white text-base font-bold">Scan Seller&apos;s QR</Text>
                    </LinearGradient>
                </TouchableOpacity>

                <TouchableOpacity className="mt-5 w-4/5" onPress={handleConfirmPickup}>
                    <LinearGradient colors={['#14BFFB', '#D300E5']} className="py-4 px-10 rounded-lg items-center" start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}>
                        <Text className="text-white text-base font-bold">Confirm Pickup</Text>
                    </LinearGradient>
                </TouchableOpacity>
            </ScrollView>
        </View>
    );
};

export default PickupDetailsScreen;

