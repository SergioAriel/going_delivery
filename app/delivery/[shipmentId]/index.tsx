import { useLocalSearchParams, useRouter } from 'expo-router';
import React from 'react';
import { Alert, Linking, ScrollView, Text, TouchableOpacity, View, Platform } from 'react-native';
import MapView, { Marker } from 'react-native-maps';
import { useSocket } from '@/src/contexts/SocketContext';
import { useDriverTask } from '@/context/DriverTaskContext';
import QRCode from 'react-native-qrcode-svg';

const DeliveryDetailScreen = () => {
  const { shipmentId } = useLocalSearchParams<{ shipmentId: string }>();
  const router = useRouter();
  const socket = useSocket();
  const { activeTask } = useDriverTask();

  // Find the specific shipment from the batch in the context
  const shipment = activeTask?.batch?.shipments.find(s => s._id === shipmentId);

  const handleConfirmDelivery = () => {
    Alert.alert(
      "Confirm Delivery",
      "Are you sure you want to mark this order as delivered?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Confirm",
          onPress: () => {
            if (socket && shipment) {
              socket.emit('confirm_delivery', { shipmentId: shipment._id });
              Alert.alert("Success", "Delivery confirmed!");
              router.back(); // Go back to the list
            }
          }
        }
      ]
    );
  };

  const openInMaps = (lat: number, lon: number, label: string) => {
    const scheme = Platform.OS === 'ios' ? 'maps:0,0?q=' : 'geo:0,0?q=';
    const latLng = `${lat},${lon}`;
    const url = Platform.OS === 'ios' ? `${scheme}${label}@${latLng}` : `${scheme}${latLng}(${label})`;
    Linking.openURL(url);
  };

  if (!shipment) {
    return (
        <View className="flex-1 justify-center items-center">
            <Text className="text-red-500">Error: Shipment data not found in active task.</Text>
            <TouchableOpacity onPress={() => router.back()}><Text className="text-primary mt-5">Go Back</Text></TouchableOpacity>
        </View>
    );
  }

  const { deliveryAddress } = shipment;
  const hasCoords = deliveryAddress.lat && deliveryAddress.lon;

  return (
    <ScrollView className="flex-1 bg-gray-100">
      <View className="p-5">
        <Text className="text-3xl font-bold text-gray-800 mb-2">Order #{shipment.orderId.substring(shipment.orderId.length - 6)}</Text>
        <Text className="text-lg text-gray-500 mb-6">Status: <Text className="font-semibold capitalize">{shipment.status}</Text></Text>

        {hasCoords && (
          <View className="mb-6 rounded-lg overflow-hidden border border-gray-200">
            <MapView
              className="h-64"
              initialRegion={{
                latitude: deliveryAddress.lat!,
                longitude: deliveryAddress.lon!,
                latitudeDelta: 0.01,
                longitudeDelta: 0.01,
              }}
            >
              <Marker
                coordinate={{ latitude: deliveryAddress.lat!, longitude: deliveryAddress.lon! }}
                title={deliveryAddress.name}
                description={deliveryAddress.street}
              />
            </MapView>
            <TouchableOpacity
              onPress={() => openInMaps(deliveryAddress.lat!, deliveryAddress.lon!, deliveryAddress.street)}
              className="bg-blue-500 p-3 items-center"
            >
              <Text className="text-white font-bold">Open in Maps</Text>
            </TouchableOpacity>
          </View>
        )}

        <View className="bg-white p-4 rounded-lg shadow-md mb-6">
          <Text className="text-xl font-semibold text-gray-800 mb-3">Delivery Address</Text>
          <Text className="text-base text-gray-600">{deliveryAddress.name}</Text>
          <Text className="text-base text-gray-600">{deliveryAddress.street}</Text>
          <Text className="text-base text-gray-600">{deliveryAddress.city}, {deliveryAddress.state} {deliveryAddress.zipCode}</Text>
          <Text className="text-base text-gray-600">{deliveryAddress.country}</Text>
          <TouchableOpacity onPress={() => Linking.openURL(`tel:${deliveryAddress.phone}`)}>
            <Text className="text-base text-blue-500 mt-2">{deliveryAddress.phone}</Text>
          </TouchableOpacity>
        </View>

        <View className="bg-white p-4 rounded-lg shadow-md">
          <Text className="text-xl font-semibold text-gray-800 mb-3">Items</Text>
          {shipment.items.map((item, index) => (
            <View key={index} className="flex-row justify-between items-center py-2 border-b border-gray-200">
              <Text className="text-base text-gray-700">{item.quantity}x {item.name}</Text>
              <Text className="text-base font-medium text-gray-800">${item.price.toFixed(2)}</Text>
            </View>
          ))}
        </View>

        {shipment.status === 'in_transit' && (
            <View className="items-center">
                <Text className="text-lg font-bold mt-6 mb-2.5 text-center">Confirm Delivery</Text>
                <Text className="text-base text-center mb-5 text-primary-dark">
                    Ask the customer to scan this QR code to confirm delivery.
                </Text>
                <View className="p-4 rounded-lg mb-5 bg-white">
                    <QRCode value={shipment._id!} size={180} backgroundColor="white" color="black" />
                </View>
                <TouchableOpacity
                    onPress={handleConfirmDelivery}
                    className="bg-green-500 mt-4 py-4 rounded-lg shadow-lg w-full items-center"
                >
                    <Text className="text-white text-center text-lg font-bold">Force Confirm Delivery</Text>
                </TouchableOpacity>
            </View>
        )}
      </View>
    </ScrollView>
  );
};

export default DeliveryDetailScreen;