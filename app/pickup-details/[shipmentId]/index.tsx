import { useLocalSearchParams, useRouter } from 'expo-router';
import React from 'react';
import { Alert, Linking, ScrollView, Text, TouchableOpacity, View, Platform } from 'react-native';
import MapView, { Marker } from 'react-native-maps';
import { useDriverTask } from '@/context/DriverTaskContext';

const PickupDetailScreen = () => {
  const { shipmentId } = useLocalSearchParams<{ shipmentId: string }>();
  const router = useRouter();
  const { activeTask } = useDriverTask();

  // Find the specific shipment from the batch in the context
  const shipment = activeTask?.batch?.shipments.find(s => s._id === shipmentId);

  const handleScanQRPress = () => {
    if (shipment) {
      // Navigate to the QR scanner screen, passing the shipmentId
      router.push({ pathname: '/scanQR', params: { shipmentId: shipment._id } });
    }
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

  const { pickupAddress } = shipment;
  const hasCoords = pickupAddress.lat && pickupAddress.lon;

  return (
    <ScrollView className="flex-1 bg-gray-100">
      <View className="p-5">
        <Text className="text-3xl font-bold text-gray-800 mb-2">Pickup Order #{shipment.orderId.substring(shipment.orderId.length - 6)}</Text>
        <Text className="text-lg text-gray-500 mb-6">Status: <Text className="font-semibold capitalize">{shipment.status}</Text></Text>

        {hasCoords && (
          <View className="mb-6 rounded-lg overflow-hidden border border-gray-200">
            <MapView
              className="h-64"
              initialRegion={{
                latitude: pickupAddress.lat!,
                longitude: pickupAddress.lon!,
                latitudeDelta: 0.01,
                longitudeDelta: 0.01,
              }}
            >
              <Marker
                coordinate={{ latitude: pickupAddress.lat!, longitude: pickupAddress.lon! }}
                title={pickupAddress.name}
                description={pickupAddress.street}
              />
            </MapView>
            <TouchableOpacity
              onPress={() => openInMaps(pickupAddress.lat!, pickupAddress.lon!, pickupAddress.street)}
              className="bg-blue-500 p-3 items-center"
            >
              <Text className="text-white font-bold">Open in Maps</Text>
            </TouchableOpacity>
          </View>
        )}

        <View className="bg-white p-4 rounded-lg shadow-md mb-6">
          <Text className="text-xl font-semibold text-gray-800 mb-3">Pickup Address</Text>
          <Text className="text-base text-gray-600">{pickupAddress.name}</Text>
          <Text className="text-base text-gray-600">{pickupAddress.street}</Text>
          <Text className="text-base text-gray-600">{pickupAddress.city}, {pickupAddress.state} {pickupAddress.zipCode}</Text>
          <Text className="text-base text-gray-600">{pickupAddress.country}</Text>
          <TouchableOpacity onPress={() => Linking.openURL(`tel:${pickupAddress.phone}`)}>
            <Text className="text-base text-blue-500 mt-2">{pickupAddress.phone}</Text>
          </TouchableOpacity>
        </View>

        <View className="bg-white p-4 rounded-lg shadow-md mb-6">
          <Text className="text-xl font-semibold text-gray-800 mb-3">Items to Pick Up</Text>
          {shipment.items.map((item, index) => (
            <View key={index} className="flex-row justify-between items-center py-2 border-b border-gray-200">
              <Text className="text-base text-gray-700">{item.quantity}x {item.name}</Text>
            </View>
          ))}
        </View>

        {shipment.status === 'ready_to_ship' && (
            <TouchableOpacity
                onPress={handleScanQRPress}
                className="bg-blue-600 mt-4 py-4 rounded-lg shadow-lg w-full items-center"
            >
                <Text className="text-white text-center text-lg font-bold">Scan QR to Confirm Pickup</Text>
            </TouchableOpacity>
        )}
      </View>
    </ScrollView>
  );
};

export default PickupDetailScreen;
