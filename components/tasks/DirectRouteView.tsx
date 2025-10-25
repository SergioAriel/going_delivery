import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, ActivityIndicator } from 'react-native';
import { Batch, Shipment } from '../../interfaces';
import { MapPinIcon, ArrowDownIcon } from 'react-native-heroicons/outline';
import { useDriverTask } from '../../context/DriverTaskContext';
import DirectRouteItem from './DirectRouteItem';
import { LinearGradient } from 'expo-linear-gradient';

// Vista principal para el estado de Ruta Directa
export const DirectRouteView = () => {
    const { activeTask } = useDriverTask();

    if (!activeTask || !activeTask.batch) {
        return (
            <View className="flex-1 justify-center items-center bg-black">
                <ActivityIndicator size="large" color="#14BFFB" />
                <Text className="mt-4 text-gray-400">Cargando detalles de la ruta...</Text>
            </View>
        );
    }

    const batch = activeTask.batch as Batch;

    return (
        <View className="flex-1 bg-black">
            <View className="p-5 bg-black border-b border-gray-800">
                <Text className="text-2xl font-bold text-white">Modo: Ruta Directa</Text>
                <Text className="text-sm text-gray-400 mt-1">Recoge y entrega los paquetes de este lote.</Text>
            </View>

            <ScrollView contentContainerStyle={{ padding: 16 }}>
                {batch.shipments.map(shipment => <DirectRouteItem key={shipment._id} shipment={shipment} />)}
            </ScrollView>

            <View className="p-4 bg-black border-t border-gray-800">
                <TouchableOpacity>
                    <LinearGradient
                        colors={['#14BFFB', '#A188E8']}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 1 }}
                        className="py-3 rounded-full shadow-lg"
                    >
                        <Text className="text-white text-lg font-bold text-center">Ruta Completada</Text>
                    </LinearGradient>
                </TouchableOpacity>
            </View>
        </View>
    );
};