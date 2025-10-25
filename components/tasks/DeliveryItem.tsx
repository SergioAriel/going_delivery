import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { Shipment } from '../../interfaces';
import { MapPinIcon, CubeIcon, ChevronRightIcon } from 'react-native-heroicons/outline';

// Componente para renderizar cada item de entrega en la lista
const DeliveryItem = ({ shipment, onPress }: { shipment: Shipment & { _id: string }, onPress: () => void }) => {

    return (
        <TouchableOpacity onPress={onPress} className="bg-gray-800 p-4 my-2 rounded-lg shadow-sm border border-gray-700 flex-row justify-between items-center">
            <View className="flex-1">
                <Text className="text-base font-bold text-white">Orden: #{shipment.orderId.substring(0, 6)}...</Text>
                <View className="flex-row items-center mt-2">
                    <MapPinIcon size={20} color="#9CA3AF" />
                    <Text className="text-sm text-gray-400 ml-2">Entregar a: {shipment.deliveryAddress.name}</Text>
                </View>
                <Text className="text-sm text-gray-400 ml-7">{shipment.deliveryAddress.street}</Text>
                <View className="flex-row items-center mt-2">
                    <CubeIcon size={20} color="#9CA3AF" />
                    <Text className="text-sm text-gray-400 ml-2">{shipment.items.length} item(s)</Text>
                </View>
            </View>
            <ChevronRightIcon size={24} color="#9CA3AF" />
        </TouchableOpacity>
    );
};

export default DeliveryItem;