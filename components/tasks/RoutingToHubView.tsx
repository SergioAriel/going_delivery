import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, ActivityIndicator } from 'react-native';
import { MapIcon, ArrowRightIcon, UserIcon, ClockIcon } from 'react-native-heroicons/outline';
import { useDriverTask } from '../../context/DriverTaskContext';
import { LinearGradient } from 'expo-linear-gradient';

// Vista para el estado de "En Ruta al Hub"
export const RoutingToHubView = () => {
    const { activeTask } = useDriverTask();
    // El estado local para la cuenta regresiva se mantiene aquí
    const [timeLeft, setTimeLeft] = useState(activeTask?.rendezvousInfo?.etaSeconds || 0);

    useEffect(() => {
        if (!activeTask?.rendezvousInfo) return;

        setTimeLeft(activeTask.rendezvousInfo.etaSeconds);
        const interval = setInterval(() => {
            setTimeLeft(prevTime => (prevTime > 0 ? prevTime - 1 : 0));
        }, 1000);

        return () => clearInterval(interval);
    }, [activeTask?.rendezvousInfo]);

    if (!activeTask) {
        return (
            <View className="flex-1 justify-center items-center bg-black">
                <ActivityIndicator size="large" color="#14BFFB" />
                <Text className="mt-4 text-gray-400">Cargando información de la ruta...</Text>
            </View>
        );
    }

    const { hubLocation, rendezvousInfo } = activeTask;

    return (
        <View className="flex-1 bg-black">
            <View className="p-5 bg-black border-b border-gray-800">
                <Text className="text-2xl font-bold text-white">Modo: En Ruta al Hub</Text>
                <Text className="text-sm text-gray-400 mt-1">Dirígete al punto de encuentro para la transferencia.</Text>
            </View>

            {/* Información del Relevo */}
            {rendezvousInfo && (
                <View className="p-4 bg-gray-800 border-y-2 border-gray-700">
                    <Text className="text-base font-bold text-white mb-2">Información del Relevo:</Text>
                    <View className="flex-row items-center mb-1">
                        <UserIcon size={20} color="#A188E8" />
                        <Text className="text-sm text-gray-300 ml-2">Te encontrarás con: <Text className="font-bold">{rendezvousInfo.partnerDriver.name}</Text></Text>
                    </View>
                    <View className="flex-row items-center">
                        <ClockIcon size={20} color="#A188E8" />
                        <Text className="text-sm text-gray-300 ml-2">Llegada estimada de tu compañero: <Text className="font-bold">{formatTime(timeLeft)}</Text></Text>
                    </View>
                </View>
            )}

            {/* Placeholder para el Mapa */}
            <View className="flex-1 bg-gray-900 my-4 justify-center items-center">
                <MapIcon size={80} color="#A188E8" />
                <Text className="text-lg text-gray-500 mt-4">Mapa con la ruta al Hub</Text>
                {hubLocation && 
                    <Text className="text-base text-gray-400 font-semibold mt-2">Coordenadas: {hubLocation.lat}, {hubLocation.lon}</Text>
                }
            </View>

            <View className="p-4 bg-black border-t border-gray-800">
                <TouchableOpacity>
                    <LinearGradient
                        colors={['#14BFFB', '#A188E8']}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 1 }}
                        className="py-3 rounded-full shadow-lg flex-row items-center justify-center"
                    >
                        <ArrowRightIcon size={20} color="white" />
                        <Text className="text-white text-lg font-bold ml-2">He llegado al Hub</Text>
                    </LinearGradient>
                </TouchableOpacity>
            </View>
        </View>
    );
};
