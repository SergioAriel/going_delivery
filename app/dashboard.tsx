import { useSocket } from '@/src/contexts/SocketContext';
import { LinearGradient } from 'expo-linear-gradient';
import * as Location from 'expo-location';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, FlatList, Text, TouchableOpacity, View } from 'react-native';
import { Shipment } from '../interfaces';

interface PickupAssignment {
    orderId: string;
    sellerId: string;
    sellerLocation: { lat: number; lng: number };
    items: any[];
}

const DashboardScreen = () => {
    const [shipments, setShipments] = useState<Shipment[]>([]);
    const [pickupAssignments, setPickupAssignments] = useState<PickupAssignment[]>([]);
    const [loadingPickups, setLoadingPickups] = useState(true);
    const [driverLocation, setDriverLocation] = useState<{ lat: number; lng: number } | null>(null);
    const router = useRouter();
    const socket = useSocket();

    const fetchShipments = async () => {
        try {
            const driverId = 'someDriverIdHere';
            const response = await fetch(`https://going-git-delivery-sergioariels-projects.vercel.app/api/shipments?driverId=${driverId}`);
            const data = await response.json();
            setShipments(data);
        } catch (error) {
            console.error('Error fetching shipments:', error);
        }
    };

    useEffect(() => {
        let locationWatcher: Location.LocationSubscription | null = null;

        const startLocationTracking = async () => {
            let { status } = await Location.requestForegroundPermissionsAsync();
            if (status !== 'granted') {
                console.error('Permiso para acceder a la ubicación denegado');
                setLoadingPickups(false);
                return;
            }

            locationWatcher = await Location.watchPositionAsync(
                {
                    accuracy: Location.Accuracy.High,
                    timeInterval: 10000,
                    distanceInterval: 10,
                },
                (location) => {
                    if (socket && location.coords.latitude && location.coords.longitude) {
                        const currentDriverLocation = {
                            lat: location.coords.latitude,
                            lng: location.coords.longitude,
                        };
                        setDriverLocation(currentDriverLocation);

                        socket.emit('get_orders', currentDriverLocation);
                    }
                }
            );
        };

        if (socket) {
            startLocationTracking();
        } else {
            setLoadingPickups(false);
        }

        return () => {
            if (locationWatcher) {
                locationWatcher.remove();
            }
        };
    }, [socket]);

    const refreshAvailablePickups = async () => {
        if (socket && driverLocation) {
            setLoadingPickups(true);
            socket.emit('get_orders', driverLocation);
        } else {
            setLoadingPickups(false);
        }
    };

    useEffect(() => {
        fetchShipments();
    }, []);

    useEffect(() => {
        if (socket) {
            socket.emit('join_drivers_room');

            socket.on('new_order_available_for_seller', (assignment: PickupAssignment) => {
                setPickupAssignments((prevAssignments) => {
                    if (prevAssignments.find(a => a.orderId === assignment.orderId && a.sellerId === assignment.sellerId)) {
                        return prevAssignments;
                    }
                    return [assignment, ...prevAssignments];
                });
            });

            socket.on('send_orders', (assignments: PickupAssignment[]) => {
                setPickupAssignments((prevAssignments) => {
                    const newAssignmentsMap = new Map(assignments.map(a => [`${a.orderId}-${a.sellerId}`, a]));
                    const combined = [...prevAssignments];
                    for (const [key, value] of newAssignmentsMap.entries()) {
                        if (!combined.some(p => `${p.orderId}-${p.sellerId}` === key)) {
                            combined.push(value);
                        }
                    }
                    return combined;
                });
                setLoadingPickups(false);
            });

            socket.on('order_unavailable', (data: { orderId: string }) => {
                setPickupAssignments((prevAssignments) => prevAssignments.filter(assignment => assignment.orderId !== data.orderId));
            });

            return () => {
                socket.off('new_order_available_for_seller');
                socket.off('send_orders');
                socket.off('order_unavailable');
            };
        }
    }, [socket]);

    const renderShipmentItem = ({ item }: { item: Shipment }) => (
        <View className="bg-white p-5 my-2 rounded-lg border border-border shadow-md">
            <Text className="text-lg font-bold text-primary-dark">Envío #{item._id.toString().substring(0, 6)}</Text>
            <Text className="text-base my-2.5 text-primary">Estado: {item.status}</Text>
            <TouchableOpacity onPress={() => router.push(`/delivery/${item._id}`)}>
                <LinearGradient
                    colors={['#14BFFB', '#D300E5']}
                    className="py-2.5 px-5 rounded-lg items-center mt-2.5"
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                >
                    <Text className="text-white text-base font-bold">Ver Detalles</Text>
                </LinearGradient>
            </TouchableOpacity>
        </View>
    );

    const renderPickupAssignmentItem = ({ item }: { item: PickupAssignment }) => (
        <View className="bg-white p-5 my-2 rounded-lg border-2 border-primary shadow-lg">
            <Text className="text-lg font-bold mb-1.5 text-primary-dark">Nueva Recogida:</Text>
            <Text className="text-base mb-1 text-primary-dark">Orden ID: {item.orderId.substring(0, 6)}...</Text>
            <Text className="text-base mb-1 text-primary-dark">Vendedor ID: {item.sellerId.substring(0, 6)}...</Text>
            <Text className="text-base mb-1 text-primary-dark">Ítems: {item.items.length}</Text>
            <TouchableOpacity
                className="mt-4"
                onPress={() => {
                    setPickupAssignments(prev => prev.filter(p => p.orderId !== item.orderId || p.sellerId !== item.sellerId));
                    router.push({
                        pathname: `/pickup-details/[orderId]/[sellerId]`,
                        params: {
                            orderId: item.orderId,
                            sellerId: item.sellerId
                        }
                    });
                }}
            >
                <LinearGradient
                    colors={['#D300E5', '#14BFFB']}
                    className="py-2.5 px-5 rounded-lg items-center"
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                >
                    <Text className="text-white text-base font-bold">Aceptar Recogida</Text>
                </LinearGradient>
            </TouchableOpacity>
        </View>
    );

    return (
        <View className="flex-1 p-2.5 bg-accent">
            <TouchableOpacity className="m-2.5 self-end p-2 rounded-md bg-primary" onPress={refreshAvailablePickups}>
                <Text className="text-base text-white font-bold">Actualizar Recogidas</Text>
            </TouchableOpacity>

            <Text className="text-xl font-bold mt-2.5 mb-2.5 px-2.5 text-primary-dark">Nuevas Recogidas Pendientes</Text>
            {loadingPickups ? (
                <ActivityIndicator size="large" color="#14BFFB" className="my-5" />
            ) : pickupAssignments.length === 0 ? (
                <Text className="text-center mt-5 text-base text-primary-dark">No hay nuevas recogidas disponibles.</Text>
            ) : (
                <FlatList
                    data={pickupAssignments}
                    keyExtractor={(item) => `${item.orderId}-${item.sellerId}`}
                    renderItem={renderPickupAssignmentItem}
                    contentContainerStyle={{ paddingBottom: 20 }}
                />
            )}

            <Text className="text-xl font-bold mt-5 mb-2.5 px-2.5 text-primary-dark">Mis Envíos Asignados</Text>
            {shipments.length === 0 ? (
                <Text className="text-center mt-5 text-base text-primary-dark">No tienes envíos asignados.</Text>
            ) : (
                <FlatList
                    data={shipments}
                    keyExtractor={(item) => item._id.toString()}
                    renderItem={renderShipmentItem}
                    contentContainerStyle={{ paddingBottom: 20 }}
                />
            )}
        </View>
    );
};

export default DashboardScreen;
