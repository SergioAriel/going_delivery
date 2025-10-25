import React from 'react';
import { View, Text } from 'react-native';
import { Shipment } from '../../interfaces';
import { MapPinIcon, ArrowDownIcon } from 'react-native-heroicons/outline';

const DirectRouteItem = ({ shipment }: { shipment: Shipment & { _id: string } }) => (
    <View className="bg-gray-800 p-4 mb-4 rounded-lg shadow-sm border border-gray-700">
        <Text className="text-base font-bold text-white mb-3">Orden: #{shipment.orderId.substring(0, 6)}...</Text>
        
        {/* Pickup Info */}
        <View className="mb-3">
            <Text className="text-sm font-semibold text-gray-400 mb-1">Recoger de:</Text>
            <View className="flex-row items-center">
                <MapPinIcon size={20} color="#9CA3AF" />
                <Text className="text-sm text-gray-300 ml-2">{shipment.pickupAddress.name}</Text>
            </View>
            <Text className="text-sm text-gray-400 ml-7">{shipment.pickupAddress.street}</Text>
        </View>

        <View className="items-center my-2">
            <ArrowDownIcon size={20} color="#9CA3AF" />
        </View>

        {/* Delivery Info */}
        <View>
            <Text className="text-sm font-semibold text-gray-400 mb-1">Entregar a:</Text>
            <View className="flex-row items-center">
                <MapPinIcon size={20} color="#9CA3AF" />
                <Text className="text-sm text-gray-300 ml-2">{shipment.deliveryAddress.name}</Text>
            </View>
            <Text className="text-sm text-gray-400 ml-7">{shipment.deliveryAddress.street}</Text>
        </View>
    </View>
);

export default DirectRouteItem;