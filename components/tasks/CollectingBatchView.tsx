import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { Shipment } from '../../interfaces';
import { ChevronRightIcon } from 'react-native-heroicons/solid';
import { useDriverTask } from '../../context/DriverTaskContext';
import MapView, { Marker } from 'react-native-maps';
import { LinearGradient } from 'expo-linear-gradient';

// Componente para renderizar cada parada de recolección
const PickupStopCard = ({ shipment, onPress, stopNumber }: { shipment: Shipment & { _id: string }, onPress: () => void, stopNumber: number }) => {
    return (
        <TouchableOpacity onPress={onPress} className="bg-gray-800 p-4 rounded-2xl shadow-md border border-gray-700 mb-4">
            <View className="flex-row items-center">
                <View className="w-10 h-10 bg-gray-700 rounded-full items-center justify-center">
                    <Text className="text-lg font-bold text-white">{stopNumber}</Text>
                </View>
                <View className="flex-1 ml-4">
                    <Text className="text-lg font-bold text-white" numberOfLines={1}>{shipment.pickupAddress.name}</Text>
                    <Text className="text-base text-gray-400" numberOfLines={1}>{shipment.pickupAddress.street}</Text>
                </View>
                <ChevronRightIcon size={24} color="#9CA3AF" />
            </View>
        </TouchableOpacity>
    );
};

import { darkMapStyle } from '@/util/darkMapStyle';

// Vista principal para el estado de recolección
export const CollectingBatchView = () => {
    const router = useRouter();
    const { activeTask } = useDriverTask();

    if (!activeTask || !activeTask.batch) {
        return (
            <View className="flex-1 justify-center items-center bg-black">
                <ActivityIndicator size="large" color="#14BFFB" />
                <Text className="mt-4 text-gray-400">Loading Batch Details...</Text>
            </View>
        );
    }

    const { batch } = activeTask;
    const initialRegion = batch.shipments.length > 0 ? {
        latitude: batch.shipments[0].pickupAddress.lat!,
        longitude: batch.shipments[0].pickupAddress.lon!,
        latitudeDelta: 0.05,
        longitudeDelta: 0.05,
    } : undefined;

    const handleItemPress = (shipment: Shipment & { _id: string }) => {
        router.push(`/pickup-details/${shipment._id}`);
    };
    
    const handleAllCollected = () => {
        // Lógica para cuando todos los paquetes son recolectados
        console.log("All packages collected, proceeding to hub.");
        // Aquí se cambiaría el estado de la tarea a ROUTING_TO_HUB
    };

    return (
        <View className="flex-1 bg-black">
            {initialRegion && (
                <MapView
                    className="h-1/3"
                    initialRegion={initialRegion}
                    customMapStyle={darkMapStyle}
                >
                    {batch.shipments.map((shipment, index) => (
                        <Marker
                            key={shipment._id}
                            coordinate={{
                                latitude: shipment.pickupAddress.lat!,
                                longitude: shipment.pickupAddress.lon!,
                            }}
                            title={shipment.pickupAddress.name}
                        >
                            <View className="w-8 h-8 bg-primary rounded-full items-center justify-center shadow-lg">
                                <Text className="text-base font-bold text-white">{index + 1}</Text>
                            </View>
                        </Marker>
                    ))}
                </MapView>
            )}

            <View className="flex-1 p-4 -mt-6">
                <View className="bg-black rounded-t-2xl p-4 flex-1">
                     <Text className="text-xl font-bold text-white mb-2">Collection Route</Text>
                    <ScrollView>
                        {batch.shipments.map((item, index) => (
                            <PickupStopCard 
                                key={item._id}
                                shipment={item} 
                                onPress={() => handleItemPress(item)}
                                stopNumber={index + 1}
                            />
                        ))}
                    </ScrollView>
                </View>
            </View>

            <View className="p-4 bg-black border-t border-gray-800">
                <TouchableOpacity onPress={handleAllCollected}>
                     <LinearGradient
                        colors={['#14BFFB', '#A188E8']}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 1 }}
                        className="py-3 rounded-full shadow-lg"
                    >
                        <Text className="text-white text-lg font-bold text-center">All Packages Collected</Text>
                    </LinearGradient>
                </TouchableOpacity>
            </View>
        </View>
    );
};