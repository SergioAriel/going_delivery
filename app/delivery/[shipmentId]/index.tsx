import { useLocalSearchParams, useRouter } from 'expo-router';
import React from 'react';
import { Alert, Linking, Text, TouchableOpacity, View, StyleSheet, Platform, ScrollView } from 'react-native';
import MapLibreGL, { Camera, MapView, PointAnnotation } from '@maplibre/maplibre-react-native';
import { useSocket } from '@/src/contexts/SocketContext';
import { useDriverTask } from '@/context/DriverTaskContext';
import QRCode from 'react-native-qrcode-svg';
import Constants from 'expo-constants';

const DeliveryDetailScreen = () => {
  const { shipmentId } = useLocalSearchParams<{ shipmentId: string }>();
  const router = useRouter();
  const socket = useSocket();
  const { activeTask } = useDriverTask();

  const shipment = activeTask?.batch?.shipments.find(s => s._id === shipmentId);
  const MAPTILER_API_KEY = Constants.expoConfig?.extra?.MAPTILER_API_KEY;

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
              router.back();
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
        <View style={styles.container}>
            <Text style={{color: 'red'}}>Error: Shipment data not found in active task.</Text>
            <TouchableOpacity onPress={() => router.back()}><Text style={{color: 'blue', marginTop: 20}}>Go Back</Text></TouchableOpacity>
        </View>
    );
  }

  const { deliveryAddress } = shipment;
  const hasCoords = deliveryAddress.lat && deliveryAddress.lon;

  return (
    <ScrollView style={styles.container} contentContainerStyle={{ paddingVertical: 20 }}>
        <Text style={styles.title}>Order #{shipment.orderId.substring(shipment.orderId.length - 6)}</Text>
        <Text style={styles.subtitle}>Status: <Text style={{fontWeight: 'bold'}}>{shipment.status}</Text></Text>

        {hasCoords && (
          <View style={{ marginBottom: 24, borderRadius: 12, overflow: 'hidden', borderWidth: 1, borderColor: '#e5e7eb' }}>
            <MapView
              style={{ height: 256 }}
              mapStyle={`https://api.maptiler.com/maps/dataviz/style.json?key=${MAPTILER_API_KEY}`}
            >
              <Camera
                defaultSettings={{
                  centerCoordinate: [deliveryAddress.lon!, deliveryAddress.lat!],
                  zoomLevel: 14,
                }}
              />
              <PointAnnotation
                id={shipment._id}
                coordinate={[deliveryAddress.lon!, deliveryAddress.lat!]}
              >
                <View style={{ width: 24, height: 24, borderRadius: 12, backgroundColor: '#3b82f6', borderWidth: 2, borderColor: 'white' }} />
              </PointAnnotation>
            </MapView>
            <TouchableOpacity
              onPress={() => openInMaps(deliveryAddress.lat!, deliveryAddress.lon!, deliveryAddress.street)}
              style={{ backgroundColor: '#3b82f6', padding: 12, alignItems: 'center' }}
            >
              <Text style={{ color: 'white', fontWeight: 'bold' }}>Open in Maps</Text>
            </TouchableOpacity>
          </View>
        )}

        <View style={styles.card}>
          <Text style={styles.cardTitle}>Delivery Address</Text>
          <Text style={styles.cardText}>{deliveryAddress.name}</Text>
          <Text style={styles.cardText}>{deliveryAddress.street}</Text>
          <Text style={styles.cardText}>{deliveryAddress.city}, {deliveryAddress.state} {deliveryAddress.zipCode}</Text>
          <Text style={styles.cardText}>{deliveryAddress.country}</Text>
          <TouchableOpacity onPress={() => Linking.openURL(`tel:${deliveryAddress.phone}`)}>
            <Text style={{...styles.cardText, color: '#3b82f6', marginTop: 8}}>{deliveryAddress.phone}</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>Items</Text>
          {shipment.items.map((item, index) => (
            <View key={index} style={{flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingTop: 8, paddingBottom: 8, borderBottomWidth: 1, borderColor: '#e5e7eb'}}>
              <Text style={styles.cardText}>{item.quantity}x {item.name}</Text>
              <Text style={{...styles.cardText, fontWeight: '500'}}>${item.price.toFixed(2)}</Text>
            </View>
          ))}
        </View>

        {shipment.status === 'in_transit' && (
            <View style={{alignItems: 'center'}}>
                <Text style={{fontSize: 18, fontWeight: 'bold', marginTop: 24, marginBottom: 10, textAlign: 'center'}}>Confirm Delivery</Text>
                <Text style={{fontSize: 16, textAlign: 'center', marginBottom: 20, color: '#4b5563'}}>
                    Ask the customer to scan this QR code to confirm delivery.
                </Text>
                <View style={{padding: 16, borderRadius: 12, marginBottom: 20, backgroundColor: 'white'}}>
                    <QRCode value={shipment._id!} size={180} backgroundColor="white" color="black" />
                </View>
                <TouchableOpacity
                    onPress={handleConfirmDelivery}
                    style={{backgroundColor: '#22c55e', marginTop: 16, paddingTop: 16, paddingBottom: 16, borderRadius: 12, width: '100%', alignItems: 'center'}}
                >
                    <Text style={{color: 'white', textAlign: 'center', fontSize: 18, fontWeight: 'bold'}}>Force Confirm Delivery</Text>
                </TouchableOpacity>
            </View>
        )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f3f4f6',
    padding: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 18,
    color: '#6b7280',
    marginBottom: 24,
  },
  card: {
    backgroundColor: 'white',
    padding: 16,
    borderRadius: 12,
    marginBottom: 24,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.23,
    shadowRadius: 2.62,
    elevation: 4,
  },
  cardTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 12,
  },
  cardText: {
    fontSize: 16,
    color: '#4b5563',
  }
});

export default DeliveryDetailScreen;
