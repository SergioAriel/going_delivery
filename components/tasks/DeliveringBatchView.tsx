import React from 'react';
import { View, Text, FlatList, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { Batch, Shipment } from '../../interfaces';
import { MapPinIcon, CubeIcon, ChevronRightIcon } from 'react-native-heroicons/outline';
import { useDriverTask } from '../../context/DriverTaskContext';
import { LinearGradient } from 'expo-linear-gradient';

import DeliveryItem from './DeliveryItem';

// Vista principal para el estado de distribución
export const DeliveringBatchView = () => {
    const router = useRouter();
    const { activeTask } = useDriverTask();

    if (!activeTask || !activeTask.batch) {
        return (
            <View className="flex-1 justify-center items-center bg-black">
                <ActivityIndicator size="large" color="#14BFFB"/>
                <Text className="mt-4 text-gray-400">Cargando detalles del lote...</Text>
            </View>
        );
    }

    const batch = activeTask.batch as Batch;

    const handleItemPress = (shipmentId: string) => {
        router.push(`/delivery/${shipmentId}`);
    };

    return (
        <View className="flex-1 bg-black">
            <View className="p-5 bg-black border-b border-gray-800">
                <Text className="text-2xl font-bold text-white">Modo: Distribución</Text>
                <Text className="text-sm text-gray-400 mt-1">Lote de Entrega ID: {batch._id}</Text>
            </View>

            <FlatList
                data={batch.shipments}
                keyExtractor={(item) => item._id!}
                renderItem={({ item }) => <DeliveryItem shipment={item} onPress={() => handleItemPress(item._id!)} />}
                contentContainerStyle={{ padding: 16 }}
                ListHeaderComponent={() => (
                    <Text className="text-lg font-semibold text-gray-300 mb-2">Entregas Asignadas:</Text>
                )}
            />

            <View className="p-4 bg-black border-t border-gray-800">
                <TouchableOpacity>
                    <LinearGradient
                        colors={['#14BFFB', '#A188E8']}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 1 }}
                        className="py-3 rounded-full shadow-lg"
                    >
                        <Text className="text-white text-lg font-bold text-center">Finalizar Ruta</Text>
                    </LinearGradient>
                </TouchableOpacity>
            </View>
        </View>
    );
};